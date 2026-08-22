import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import { THEME, ADMIN_COLORS, Icon, portalPageCss, heroStyle, panelStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'
import { safeUpperLabel } from '../../utils/safeLabel'

interface Complaint {
  id: number
  title: string
  description: string
  category: string
  priority: string
  status: string
  created_at: string
}

interface TenantUnit {
  id: number
  number?: string
  property?: { name?: string }
}

const icons = {
  plus: 'M12 5v14M5 12h14',
  contract: 'M9 3h6l4 4v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 9h6M9 13h6M9 17h4',
  bolt: 'M13 2 3 14h7l-1 8 10-12h-7l1-8z',
  wrench: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2 2.8-2.8z',
  close: 'M18 6 6 18M6 6l12 12',
  check: 'M20 6 9 17l-5-5',
}

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  resolved:    { bg: '#f0fdf4', color: '#065f46', border: '#bbf7d0' },
  in_progress: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  open:        { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
  assigned:    { bg: '#f0f9ff', color: '#075985', border: '#bae6fd' },
}

export default function TenantDashboard() {
  const { user } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [units, setUnits] = useState<TenantUnit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    unit_id: '',
    title: '',
    description: '',
    category: 'plumbing',
    priority: 'medium',
  })

  useEffect(() => {
    fetchComplaints()
    fetchUnits()
  }, [])

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setIsFormOpen(true)
      searchParams.delete('new')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const fetchUnits = async () => {
    try {
      const res = await api.get('/tenant/units')
      const list: TenantUnit[] = res.data?.data?.units || []
      setUnits(list)
      if (list.length > 0) {
        setFormData(prev => ({ ...prev, unit_id: prev.unit_id || String(list[0].id) }))
      }
    } catch (err) {
      console.error(err)
      setUnits([])
    }
  }

  const fetchComplaints = async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/tenant/complaints')
      setComplaints(res.data?.data?.complaints || [])
    } catch (err) {
      console.error(err)
      setComplaints([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.unit_id) {
      alert('No leased unit found for your account. Contact admin.')
      return
    }
    try {
      await api.post('/tenant/complaints', formData)
      setIsFormOpen(false)
      fetchComplaints()
      setFormData({
        unit_id: units[0] ? String(units[0].id) : '',
        title: '',
        description: '',
        category: 'plumbing',
        priority: 'medium',
      })
    } catch (err) {
      alert('Error submitting complaint')
    }
  }

  const activeCount = complaints.filter(c => c.status !== 'closed' && c.status !== 'resolved').length
  const inputStyle: React.CSSProperties = {
    background: '#ffffff',
    border: `1px solid ${THEME.border}`,
    borderRadius: 0,
    color: THEME.ink,
    fontSize: 14,
    fontWeight: 500,
    padding: '10px 12px',
    width: '100%',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 12.5,
    fontWeight: 700,
    color: THEME.textMuted,
    letterSpacing: '0.4px',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 6,
  }

  const statCards = [
    {
      value: 'Active Contract',
      label: 'My Tenancy Lease',
      sub: 'Lease',
      bg: '#1e1b4b',
      desc: 'Rent payable as per contract schedule',
      icon: icons.contract,
    },
    {
      value: 'Direct Account',
      label: 'Utilities / DEWA',
      sub: 'DEWA',
      bg: '#065f46',
      desc: 'Billed via Dubai Electricity & Water Authority',
      icon: icons.bolt,
    },
    {
      value: String(activeCount),
      label: 'Active Complaints',
      sub: 'Ops',
      bg: activeCount > 0 ? '#991b1b' : '#075985',
      desc: 'In progress by maintenance team',
      icon: icons.wrench,
    },
  ]

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", background: THEME.pageBg }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 600 }}>Tenant Portal</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, marginTop: 4 }}>Welcome back, {user?.name}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Manage your lease, dues, and maintenance requests</div>
        </div>
        <button className="gfh-portal-btn" onClick={() => setIsFormOpen(true)} style={{ ...ghostBtnStyle, background: '#1e1b4b' }}>
          <Icon path={icons.plus} size={16} />
          Report Maintenance Issue
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 22 }}>
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className="gfh-portal-stat"
            style={{
              background: card.bg,
              color: '#fff',
              borderRadius: 0,
              padding: '20px 18px',
              minHeight: 118,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 8px 20px -10px rgba(15,23,42,0.45)',
              animationDelay: `${i * 0.06}s`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>{card.value}</div>
              <div style={{ opacity: 0.9 }}>
                <Icon path={card.icon} size={18} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 8 }}>{card.label}</div>
              <div style={{
                display: 'inline-block',
                marginTop: 8,
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
                background: 'rgba(255,255,255,0.18)',
                padding: '3px 8px',
                borderRadius: 0,
              }}>
                {card.sub}
              </div>
              <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 8 }}>{card.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="fade-in" style={{ ...panelStyle, minHeight: 280 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: THEME.ink, marginTop: 0, marginBottom: 16 }}>
          My Maintenance Requests
        </h3>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>No maintenance complaints submitted yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {complaints.map(item => {
              const st = STATUS_STYLE[item.status] || STATUS_STYLE.open
              return (
                <div
                  key={item.id}
                  className="gfh-portal-row"
                  style={{
                    padding: 16,
                    background: '#fff',
                    border: `1px solid ${THEME.border}`,
                    borderRadius: 0,
                    borderLeft: `4px solid ${item.status === 'resolved' || item.status === 'closed' ? ADMIN_COLORS.green : ADMIN_COLORS.amber}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                      <strong style={{ fontSize: 14, fontWeight: 700, color: THEME.ink }}>{item.title}</strong>
                      <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, padding: '4px 10px', borderRadius: 0, fontSize: 11.5, fontWeight: 700 }}>
                        {safeUpperLabel(item.status)}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: THEME.textMuted, margin: 0 }}>{item.description}</p>
                  </div>
                  <div style={{ fontSize: 12, color: THEME.textMuted, whiteSpace: 'nowrap' }}>
                    Logged: {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {isFormOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="fade-in" style={{ position: 'relative', width: 480, maxWidth: '92vw', padding: 30, background: '#ffffff', borderRadius: 0, border: `1px solid ${THEME.border}`, boxShadow: '0 24px 55px -18px rgba(15,23,42,0.35)' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, color: THEME.ink }}>
              Report Maintenance Issue
            </h2>
            <form onSubmit={handleSubmitComplaint} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Unit</label>
                <select style={inputStyle} value={formData.unit_id} onChange={e => setFormData({ ...formData, unit_id: e.target.value })} required>
                  <option value="">Select your unit</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.number || `#${u.id}`}{u.property?.name ? ` — ${u.property.name}` : ''}
                    </option>
                  ))}
                </select>
                {units.length === 0 && (
                  <p style={{ fontSize: 12, color: ADMIN_COLORS.amber, marginTop: 6 }}>No active leased unit on file. Ask admin to link a contract.</p>
                )}
              </div>
              <div>
                <label style={labelStyle}>Issue Title</label>
                <input style={inputStyle} placeholder="e.g. AC not cooling" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select style={inputStyle} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="ac">Air Conditioning</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="appliance">Appliance Repair</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Priority</label>
                  <select style={inputStyle} value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description & Details</label>
                <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} placeholder="Describe the issue..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button type="button" onClick={() => setIsFormOpen(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 0, fontWeight: 700, fontSize: 13, padding: '9px 16px', background: '#f1f5f9', color: THEME.textMuted, border: `1px solid ${THEME.border}`, cursor: 'pointer' }}>
                  <Icon path={icons.close} size={13} />
                  Cancel
                </button>
                <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 0, fontWeight: 700, fontSize: 13, padding: '9px 16px', background: '#065f46', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  <Icon path={icons.check} size={13} />
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
