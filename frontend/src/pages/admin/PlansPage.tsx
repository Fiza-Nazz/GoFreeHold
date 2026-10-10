import { useEffect, useState } from 'react'
import {
  createPlan,
  fetchPlans,
  fetchSubscriptions,
  updatePlan,
  updateSubscription,
} from '../../api/platform'
import type { PlatformSubscription, SubscriptionPlan } from '../../types/platform'
import { THEME, portalPageCss } from '../../components/gfh/adminTheme'

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  border: '1px solid #CBD5E1',
  borderRadius: 8,
  fontSize: 13.5,
}

export default function PlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [subscriptions, setSubscriptions] = useState<PlatformSubscription[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    code: '',
    price_monthly: '',
    max_properties: '',
    max_units: '',
    max_users: '',
  })

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [planList, subList] = await Promise.all([
        fetchPlans(),
        fetchSubscriptions().catch(() => [] as PlatformSubscription[]),
      ])
      setPlans(planList)
      setSubscriptions(subList)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load plans and subscriptions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    try {
      await createPlan({
        name: form.name,
        code: form.code,
        price_monthly: Number(form.price_monthly || 0),
        max_properties: form.max_properties ? Number(form.max_properties) : null,
        max_units: form.max_units ? Number(form.max_units) : null,
        max_users: form.max_users ? Number(form.max_users) : null,
        is_active: true,
      })
      setShowCreate(false)
      setForm({ name: '', code: '', price_monthly: '', max_properties: '', max_units: '', max_users: '' })
      await load()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create plan.')
    } finally {
      setSaving(false)
    }
  }

  const togglePlan = async (plan: SubscriptionPlan) => {
    try {
      await updatePlan(plan.id, { is_active: !plan.is_active })
      await load()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update plan.')
    }
  }

  const changeSubscriptionStatus = async (sub: PlatformSubscription, status: PlatformSubscription['status']) => {
    try {
      await updateSubscription(sub.id, { status })
      await load()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update subscription.')
    }
  }

  return (
    <div>
      <style>{portalPageCss}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: THEME.ink }}>Plans & Billing</h1>
          <p style={{ margin: '6px 0 0', color: THEME.textMuted, fontSize: 14 }}>
            Subscription plans and organization billing status
          </p>
        </div>
        <button type="button" onClick={() => setShowCreate(true)} style={{ padding: '10px 16px', border: 'none', borderRadius: 8, background: '#10B981', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          + New Plan
        </button>
      </div>

      {error && (
        <div style={{ padding: 14, borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', marginBottom: 14 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, color: THEME.textMuted }}>LoadingΓÇª</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 22 }}>
            {plans.map((plan) => (
              <div key={plan.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: THEME.ink }}>{plan.name}</div>
                <div style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>{plan.code}</div>
                <div style={{ marginTop: 10, fontSize: 22, fontWeight: 700, color: '#0F766E' }}>
                  AED {Number(plan.price_monthly || 0).toLocaleString()}
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#64748B' }}>/mo</span>
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
                  Props {plan.max_properties ?? 'Γê₧'} ┬╖ Units {plan.max_units ?? 'Γê₧'} ┬╖ Users {plan.max_users ?? 'Γê₧'}
                </div>
                <button
                  type="button"
                  onClick={() => void togglePlan(plan)}
                  style={{
                    marginTop: 12,
                    padding: '7px 12px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    background: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 12,
                    color: plan.is_active ? '#991B1B' : '#065F46',
                  }}
                >
                  {plan.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0', fontWeight: 700 }}>Organization subscriptions</div>
            {subscriptions.length === 0 ? (
              <div style={{ padding: 24, color: THEME.textMuted }}>No subscriptions returned.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Organization', 'Plan', 'Status', 'Actions'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 14px', fontSize: 11, color: '#64748B', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                      <td style={{ padding: 14, fontWeight: 600 }}>{sub.organization?.name || `#${sub.organization_id}`}</td>
                      <td style={{ padding: 14 }}>{sub.plan?.name || `#${sub.plan_id}`}</td>
                      <td style={{ padding: 14 }}>{sub.status}</td>
                      <td style={{ padding: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {(['active', 'suspended', 'cancelled'] as const).map((status) => (
                          <button
                            key={status}
                            type="button"
                            disabled={sub.status === status}
                            onClick={() => void changeSubscriptionStatus(sub, status)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 8,
                              border: '1px solid #CBD5E1',
                              background: sub.status === status ? '#F1F5F9' : '#fff',
                              cursor: sub.status === status ? 'default' : 'pointer',
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {status}
                          </button>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <form onSubmit={handleCreate} style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Create plan</h2>
            <input required placeholder="Plan name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            <input required placeholder="Code (e.g. growth)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} style={inputStyle} />
            <input required type="number" min={0} placeholder="Monthly price (AED)" value={form.price_monthly} onChange={(e) => setForm({ ...form, price_monthly: e.target.value })} style={inputStyle} />
            <input type="number" min={0} placeholder="Max properties" value={form.max_properties} onChange={(e) => setForm({ ...form, max_properties: e.target.value })} style={inputStyle} />
            <input type="number" min={0} placeholder="Max units" value={form.max_units} onChange={(e) => setForm({ ...form, max_units: e.target.value })} style={inputStyle} />
            <input type="number" min={0} placeholder="Max users" value={form.max_users} onChange={(e) => setForm({ ...form, max_users: e.target.value })} style={inputStyle} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" onClick={() => setShowCreate(false)} style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: '#10B981', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'SavingΓÇª' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
