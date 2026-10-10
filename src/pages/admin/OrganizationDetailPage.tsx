import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  fetchOrganization,
  fetchPlatformUsers,
  reactivateOrganization,
  suspendOrganization,
  updateOrganization,
} from '../../api/platform'
import { useAuthStore, getRoleDashboardPath } from '../../store/authStore'
import type { Organization, PlatformUser } from '../../types/platform'
import { THEME, portalPageCss } from '../../components/gfh/adminTheme'

export default function OrganizationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const startImpersonationSession = useAuthStore((s) => s.startImpersonation)
  const [org, setOrg] = useState<Organization | null>(null)
  const [users, setUsers] = useState<PlatformUser[]>([])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const organization = await fetchOrganization(Number(id))
      setOrg(organization)
      setNotes(organization?.notes || '')
      const orgUsers = await fetchPlatformUsers({ organization_id: Number(id) }).catch(() => [])
      setUsers(orgUsers)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load organization.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [id])

  const saveNotes = async () => {
    if (!org) return
    setBusy(true)
    try {
      const updated = await updateOrganization(org.id, { notes })
      setOrg(updated)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save notes.')
    } finally {
      setBusy(false)
    }
  }

  const toggleStatus = async () => {
    if (!org) return
    setBusy(true)
    try {
      const updated = org.status === 'suspended'
        ? await reactivateOrganization(org.id)
        : await suspendOrganization(org.id)
      setOrg(updated)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status.')
    } finally {
      setBusy(false)
    }
  }

  const impersonate = async (userId: number) => {
    setBusy(true)
    try {
      await startImpersonationSession(userId)
      const role = useAuthStore.getState().user?.role
      if (role) navigate(getRoleDashboardPath(role))
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Impersonation failed.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div style={{ padding: 40, color: THEME.textMuted }}>Loading organizationΓÇª</div>
  if (error || !org) {
    return (
      <div>
        <p style={{ color: '#991B1B' }}>{error || 'Organization not found.'}</p>
        <Link to="/admin/organizations">Back to organizations</Link>
      </div>
    )
  }

  return (
    <div>
      <style>{portalPageCss}</style>
      <div style={{ marginBottom: 18 }}>
        <Link to="/admin/organizations" style={{ color: '#0F766E', fontWeight: 600, textDecoration: 'none', fontSize: 13 }}>ΓåÉ Organizations</Link>
        <h1 style={{ margin: '8px 0 0', fontSize: 24, fontWeight: 700, color: THEME.ink }}>{org.name}</h1>
        <p style={{ margin: '6px 0 0', color: THEME.textMuted }}>Status: <strong>{org.status}</strong> ┬╖ Plan: {org.plan?.name || 'ΓÇö'}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 18 }}>
        {[
          ['Owner', org.owner?.name || 'ΓÇö'],
          ['Owner email', org.owner?.email || 'ΓÇö'],
          ['Users', String(org.users_count ?? users.length)],
          ['Properties', String(org.properties_count ?? 'ΓÇö')],
        ].map(([label, value]) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
            <div style={{ marginTop: 6, fontWeight: 700, color: THEME.ink }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <button type="button" disabled={busy} onClick={() => void toggleStatus()} style={{ padding: '9px 14px', borderRadius: 8, border: 'none', background: org.status === 'suspended' ? '#10B981' : '#DC2626', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          {org.status === 'suspended' ? 'Reactivate organization' : 'Suspend organization'}
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, marginBottom: 18 }}>
        <h2 style={{ margin: '0 0 10px', fontSize: 16 }}>Support notes</h2>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: '100%', minHeight: 90, boxSizing: 'border-box', border: '1px solid #CBD5E1', borderRadius: 8, padding: 10 }} />
        <button type="button" disabled={busy} onClick={() => void saveNotes()} style={{ marginTop: 10, padding: '8px 14px', borderRadius: 8, border: 'none', background: '#0F766E', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          Save notes
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>Organization users</h2>
        {users.length === 0 ? (
          <p style={{ color: THEME.textMuted, margin: 0 }}>No users returned for this organization.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                {['Name', 'Email', 'Role', 'Status', 'Support'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 8px', fontSize: 11, color: '#64748B', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>{user.name}</td>
                  <td style={{ padding: '12px 8px' }}>{user.email}</td>
                  <td style={{ padding: '12px 8px' }}>{user.role}</td>
                  <td style={{ padding: '12px 8px' }}>{user.account_status || 'active'}</td>
                  <td style={{ padding: '12px 8px' }}>
                    {user.role !== 'admin' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void impersonate(user.id)}
                        style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #BFDBFE', background: '#EFF6FF', color: '#1D4ED8', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}
                      >
                        Impersonate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
