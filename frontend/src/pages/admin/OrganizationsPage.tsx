import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  createOrganization,
  fetchOrganizations,
  fetchPlans,
  reactivateOrganization,
  suspendOrganization,
} from '../../api/platform'
import type { Organization, OrganizationStatus, SubscriptionPlan } from '../../types/platform'
import { THEME, portalPageCss } from '../../components/gfh/adminTheme'

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  border: '1px solid #CBD5E1',
  borderRadius: 8,
  fontSize: 13.5,
}

export default function OrganizationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    owner_name: '',
    owner_email: '',
    plan_id: '',
    status: 'trial' as OrganizationStatus,
    notes: '',
  })

  const statusFilter = searchParams.get('status') || ''
  const query = (searchParams.get('q') || '').trim().toLowerCase()

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [orgs, planList] = await Promise.all([
        fetchOrganizations(statusFilter ? { status: statusFilter } : undefined),
        fetchPlans().catch(() => [] as SubscriptionPlan[]),
      ])
      setOrganizations(orgs)
      setPlans(planList)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load organizations. Backend must expose GET /admin/organizations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [statusFilter])

  const filtered = useMemo(() => {
    return organizations.filter((org) => {
      if (statusFilter && org.status !== statusFilter) return false
      if (!query) return true
      return [org.name, org.owner?.name, org.owner?.email, org.slug]
        .some((value) => (value || '').toLowerCase().includes(query))
    })
  }, [organizations, query, statusFilter])

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try {
      await createOrganization({
        name: form.name,
        owner_name: form.owner_name,
        owner_email: form.owner_email,
        plan_id: form.plan_id ? Number(form.plan_id) : null,
        status: form.status,
        notes: form.notes || undefined,
      })
      setShowCreate(false)
      setForm({ name: '', owner_name: '', owner_email: '', plan_id: '', status: 'trial', notes: '' })
      await load()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create organization.')
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (org: Organization) => {
    try {
      if (org.status === 'suspended') {
        await reactivateOrganization(org.id)
      } else {
        const reason = window.prompt('Suspension reason (optional):') || undefined
        await suspendOrganization(org.id, reason)
      }
      await load()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update organization status.')
    }
  }

  return (
    <div>
      <style>{portalPageCss}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: THEME.ink }}>Organizations</h1>
          <p style={{ margin: '6px 0 0', color: THEME.textMuted, fontSize: 14 }}>
            Manage SaaS customer accounts ΓÇö not property operations
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          style={{ padding: '10px 16px', border: 'none', borderRadius: 8, background: '#10B981', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
        >
          + New Organization
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <select
          value={statusFilter}
          onChange={(e) => {
            const next = new URLSearchParams(searchParams)
            if (e.target.value) next.set('status', e.target.value)
            else next.delete('status')
            setSearchParams(next)
          }}
          style={{ ...inputStyle, width: 180 }}
        >
          <option value="">All statuses</option>
          <option value="trial">Trial</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error && (
        <div style={{ padding: 14, borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', marginBottom: 14 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, color: THEME.textMuted }}>Loading organizationsΓÇª</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, color: THEME.textMuted, textAlign: 'center' }}>No organizations found.</div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['Organization', 'Owner', 'Plan', 'Status', 'Users', 'Actions'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 14px', fontSize: 11, color: '#64748B', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((org) => (
                <tr key={org.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '14px' }}>
                    <Link to={`/admin/organizations/${org.id}`} style={{ color: '#0F766E', fontWeight: 700, textDecoration: 'none' }}>
                      {org.name}
                    </Link>
                  </td>
                  <td style={{ padding: '14px', fontSize: 13 }}>
                    <div style={{ fontWeight: 600 }}>{org.owner?.name || 'ΓÇö'}</div>
                    <div style={{ color: '#64748B' }}>{org.owner?.email || ''}</div>
                  </td>
                  <td style={{ padding: '14px', fontSize: 13 }}>{org.plan?.name || 'ΓÇö'}</td>
                  <td style={{ padding: '14px' }}>
                    <span style={{
                      display: 'inline-flex',
                      padding: '3px 10px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      background: org.status === 'active' ? '#ECFDF5' : org.status === 'suspended' ? '#FEF2F2' : '#EFF6FF',
                      color: org.status === 'active' ? '#065F46' : org.status === 'suspended' ? '#991B1B' : '#1D4ED8',
                    }}>
                      {org.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px', fontSize: 13 }}>{org.users_count ?? 'ΓÇö'}</td>
                  <td style={{ padding: '14px' }}>
                    <button
                      type="button"
                      onClick={() => void toggleStatus(org)}
                      style={{
                        padding: '7px 12px',
                        borderRadius: 8,
                        border: '1px solid #CBD5E1',
                        background: '#fff',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 12,
                        color: org.status === 'suspended' ? '#065F46' : '#991B1B',
                      }}
                    >
                      {org.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <form onSubmit={handleCreate} style={{ width: '100%', maxWidth: 460, background: '#fff', borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Create Organization</h2>
            <input required placeholder="Organization name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            <input required placeholder="Owner name" value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} style={inputStyle} />
            <input required type="email" placeholder="Owner email" value={form.owner_email} onChange={(e) => setForm({ ...form, owner_email: e.target.value })} style={inputStyle} />
            <select value={form.plan_id} onChange={(e) => setForm({ ...form, plan_id: e.target.value })} style={inputStyle}>
              <option value="">Select plan (optional)</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>{plan.name} ΓÇö AED {plan.price_monthly}/mo</option>
              ))}
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as OrganizationStatus })} style={inputStyle}>
              <option value="trial">Trial</option>
              <option value="active">Active</option>
            </select>
            <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ ...inputStyle, minHeight: 70 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" onClick={() => setShowCreate(false)} style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: '#10B981', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'CreatingΓÇª' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
