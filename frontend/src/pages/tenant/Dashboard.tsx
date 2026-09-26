import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import { THEME, ADMIN_COLORS, Icon, portalPageCss, heroStyle, panelStyle } from '../../components/gfh/adminTheme'
import { safeUpper, safeUpperLabel } from '../../utils/safeLabel'
import { formatDubaiDateTime } from '../../utils/formatDate'

interface Complaint {
  id: number
  title: string
  description: string
  category?: string
  priority?: string
  status: string
  created_at: string
  unit?: { number?: string; property?: { name?: string } }
}

interface TenantUnit {
  id: number
  number?: string
  property?: { name?: string; address?: string }
}

const icons = {
  plus: 'M12 5v14M5 12h14',
  contract: 'M9 3h6l4 4v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 9h6M9 13h6M9 17h4',
  bolt: 'M13 2 3 14h7l-1 8 10-12h-7l1-8z',
  wrench: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2 2.8-2.8z',
  close: 'M18 6 6 18M6 6l12 12',
  check: 'M20 6 9 17l-5-5',
  building: 'M3 21h18M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v12M8 7h1M8 11h1M8 15h1M16 12h1M16 16h1',
  door: 'M14 3h5v18h-5M14 3L6 4.5v15L14 21M9.5 12h.01',
  wallet: 'M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  receipt: 'M9 3h6l4 4v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 9h6M9 13h6M9 17h4',
  arrowRight: 'M5 12h14M12 5l7 7-7 7',
}

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  resolved:    { bg: '#ECFDF8', color: '#065F46', border: '#A7F3DC' },
  closed:      { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' },
  in_progress: { bg: '#F0F9FF', color: '#0284C7', border: '#BAE6FD' },
  open:        { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  assigned:    { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
}

const PRIORITY_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  emergency: { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
  high:      { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
  medium:    { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' },
  low:       { bg: '#F0F9FF', color: '#075985', border: '#BAE6FD' },
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
  const primaryUnit = units[0]

  const inputStyle: React.CSSProperties = {
    background: '#ffffff',
    border: '1.5px solid #CBD5E1',
    borderRadius: 8,
    color: '#0F172A',
    fontSize: 13.5,
    fontWeight: 500,
    padding: '10px 12px',
    width: '100%',
    fontFamily: "'Inter', system-ui, sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    color: '#475569',
    letterSpacing: '0.4px',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 6,
  }

  const statCards = [
    {
      value: 'Active',
      label: 'My Tenancy Lease',
      sub: 'Lease Agreement',
      icon: icons.contract,
      iconBg: '#ECFDF8',
      iconColor: '#0E5E48',
      badgeBg: '#ECFDF8',
      badgeColor: '#065F46',
      badgeBorder: '#A7F3DC',
      desc: primaryUnit?.property?.name ? `${primaryUnit.property.name} · Unit ${primaryUnit.number}` : 'Active registered tenancy contract',
    },
    {
      value: 'Direct',
      label: 'Utilities / DEWA',
      sub: 'Official Billing',
      icon: icons.bolt,
      iconBg: '#F0FDF4',
      iconColor: '#0F8A67',
      badgeBg: '#F0FDF4',
      badgeColor: '#065F46',
      badgeBorder: '#BBF7D0',
      desc: 'Billed via Dubai Electricity & Water Authority',
    },
    {
      value: String(activeCount),
      label: 'Active Complaints',
      sub: 'Maintenance',
      icon: icons.wrench,
      iconBg: activeCount > 0 ? '#FEF2F2' : '#F0F9FF',
      iconColor: activeCount > 0 ? '#DC2626' : '#0284C7',
      badgeBg: activeCount > 0 ? '#FEF2F2' : '#F0F9FF',
      badgeColor: activeCount > 0 ? '#991B1B' : '#075985',
      badgeBorder: activeCount > 0 ? '#FECACA' : '#BAE6FD',
      desc: activeCount > 0 ? 'Assigned to field technician team' : 'All maintenance issues resolved',
    },
  ]

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: THEME.pageBg, minHeight: '100%' }}>
      <style>{portalPageCss}</style>

      {/* Hero Header */}
      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: '#0F8A67', marginBottom: 2 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            Resident Portal
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.ink, letterSpacing: '-0.02em', marginTop: 2 }}>
            Welcome back, {user?.name || 'Resident'}
          </div>
          <div style={{ fontSize: 13, color: THEME.textMuted, marginTop: 4 }}>
            Manage your lease schedule, rental ledger, and on-demand maintenance requests
          </div>
        </div>

        <button
          className="gfh-portal-btn"
          onClick={() => setIsFormOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            background: '#0E5E48',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(14, 94, 72, 0.25)',
            transition: 'all 0.15s ease',
          }}
          title="File new maintenance request"
        >
          <Icon path={icons.plus} size={16} />
          Report Maintenance Issue
        </button>
      </div>

      {/* Primary Leased Property Showcase Banner */}
      {primaryUnit && (
        <div
          className="fade-in"
          style={{
            background: 'linear-gradient(135deg, #06382C 0%, #0E5E48 100%)',
            borderRadius: 16,
            padding: '22px 26px',
            color: '#FFFFFF',
            marginBottom: 22,
            boxShadow: '0 4px 18px rgba(6, 56, 44, 0.18)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 12,
                background: 'rgba(52, 211, 165, 0.18)',
                border: '1px solid rgba(52, 211, 165, 0.4)',
                color: '#34D3A5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon path={icons.building} size={24} />
            </div>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#A7F3DC' }}>
                Your Leased Residence
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, marginTop: 2, letterSpacing: '-0.01em' }}>
                {primaryUnit.property?.name || 'Leased Property'} — Unit {primaryUnit.number || `#${primaryUnit.id}`}
              </div>
              {primaryUnit.property?.address && (
                <div style={{ fontSize: 12.5, color: '#D1FAEE', marginTop: 3 }}>
                  {primaryUnit.property.address}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              to="/tenant/dues"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                background: '#FFFFFF',
                color: '#06382C',
                fontSize: 12.5,
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              }}
            >
              <Icon path={icons.wallet} size={14} />
              View Rent Dues
            </Link>
            <Link
              to="/tenant/payments"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.14)',
                color: '#FFFFFF',
                fontSize: 12.5,
                fontWeight: 700,
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              <Icon path={icons.receipt} size={14} />
              Payment History
            </Link>
          </div>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 22 }}>
        {statCards.map((card, i) => (
          <div
            key={card.label}
            className="gfh-portal-stat"
            style={{
              background: card.iconBg,
              borderRadius: 16,
              padding: '20px 22px',
              border: `1px solid ${card.badgeBorder}`,
              boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 130,
              animationDelay: `${i * 0.06}s`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#FFFFFF',
                border: `1px solid ${card.badgeBorder}`,
                color: card.iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon path={card.icon} size={22} />
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
                background: card.badgeBg,
                color: card.badgeColor,
                border: `1px solid ${card.badgeBorder}`,
                padding: '3px 9px',
                borderRadius: 999,
              }}>
                {card.sub}
              </span>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                {card.value}
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', marginTop: 4 }}>
                {card.label}
              </div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>
                {card.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Navigation Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 22 }}>
        {[
          {
            to: '/tenant/dues',
            title: 'Rent & DEWA Ledger',
            desc: 'Check outstanding debit charges, credits paid & balance breakdown',
            icon: icons.wallet,
            iconBg: '#FFFBEB',
            iconColor: '#B45309',
            linkText: 'Check My Balance',
          },
          {
            to: '/tenant/payments',
            title: 'Past Payment Receipts',
            desc: 'Download payment receipts & track PDC cheques cleared',
            icon: icons.receipt,
            iconBg: '#F0FDF4',
            iconColor: '#0F8A67',
            linkText: 'View Receipts',
          },
          {
            to: '/tenant/complaints',
            title: 'Maintenance Requests',
            desc: 'Report on-site issues & track repair team progress in real time',
            icon: icons.wrench,
            iconBg: '#F0F9FF',
            iconColor: '#0284C7',
            linkText: 'Manage Complaints',
          },
        ].map(action => (
          <Link
            key={action.title}
            to={action.to}
            className="fade-in gfh-portal-stat"
            style={{
              textDecoration: 'none',
              background: '#FFFFFF',
              borderRadius: 16,
              padding: '20px 22px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 120,
              boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: action.iconBg, color: action.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon path={action.icon} size={20} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>{action.title}</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, lineHeight: 1.4 }}>{action.desc}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: '#0E5E48', marginTop: 4 }}>
              <span>{action.linkText}</span>
              <Icon path={icons.arrowRight} size={14} />
            </div>
          </Link>
        ))}
      </div>

      {/* Maintenance Requests List */}
      <div className="fade-in" style={{ ...panelStyle, minHeight: 280, borderRadius: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: THEME.ink, margin: 0 }}>
              Recent Maintenance Requests
            </h3>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>
              Live status from your property maintenance team
            </div>
          </div>
          <Link
            to="/tenant/complaints"
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: '#0E5E48',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            View all ({complaints.length}) →
          </Link>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : complaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#F0FDF4', color: '#0F8A67', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Icon path={icons.wrench} size={22} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: THEME.ink, margin: 0 }}>No maintenance complaints submitted yet.</p>
            <p style={{ fontSize: 12.5, color: THEME.textMuted, marginTop: 4 }}>Any repair requests you file will appear here with live updates.</p>
            <button
              onClick={() => setIsFormOpen(true)}
              style={{
                marginTop: 14,
                padding: '8px 16px',
                borderRadius: 8,
                background: '#0E5E48',
                color: '#fff',
                border: 'none',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Report New Issue
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {complaints.slice(0, 5).map(item => {
              const st = STATUS_STYLE[item.status] || STATUS_STYLE.open
              const pr = PRIORITY_STYLE[item.priority?.toLowerCase() || ''] || PRIORITY_STYLE.low

              return (
                <div
                  key={item.id}
                  className="gfh-portal-row"
                  style={{
                    padding: 16,
                    background: '#fff',
                    border: `1px solid ${THEME.border}`,
                    borderRadius: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 800, background: '#F1F5F9', color: '#334155', padding: '2px 8px', borderRadius: 6 }}>
                        #TKT-{String(item.id).padStart(4, '0')}
                      </span>
                      <strong style={{ fontSize: 14.5, fontWeight: 700, color: THEME.ink }}>{item.title}</strong>
                      <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, padding: '2px 9px', borderRadius: 999, fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>
                        {safeUpperLabel(item.status)}
                      </span>
                      {item.priority && (
                        <span style={{ background: pr.bg, color: pr.color, border: `1px solid ${pr.border}`, padding: '2px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase' }}>
                          {safeUpper(item.priority)}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.4 }}>{item.description}</p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ fontSize: 12, color: '#64748B', whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {formatDubaiDateTime(item.created_at)}
                    </div>
                    <Link
                      to={`/tenant/complaints/${item.id}`}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        background: '#F0F9FF',
                        color: '#0284C7',
                        border: '1px solid #BAE6FD',
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modern Modal for Reporting Maintenance Issue */}
      {isFormOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="fade-in" style={{ position: 'relative', width: 500, maxWidth: '100%', padding: 28, background: '#ffffff', borderRadius: 16, border: `1px solid ${THEME.border}`, boxShadow: '0 24px 55px -18px rgba(15,23,42,0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: THEME.ink, margin: 0 }}>
                  Report Maintenance Issue
                </h2>
                <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>
                  Submit a repair request to your property maintenance team
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}
              >
                <Icon path={icons.close} size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitComplaint} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Leased Residence</label>
                {units.length === 1 ? (
                  <div
                    style={{
                      background: '#F0FDF4',
                      border: '1.5px solid #BBF7D0',
                      borderRadius: 8,
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: '#ECFDF8',
                          color: '#0E5E48',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon path={icons.building} size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0F172A', fontSize: 14 }}>
                          Unit {units[0].number || `#${units[0].id}`}{units[0].property?.name ? ` — ${units[0].property.name}` : ''}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#065F46', fontWeight: 600 }}>
                          Your active leased property
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        background: '#ECFDF8',
                        color: '#065F46',
                        border: '1px solid #A7F3DC',
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Active Lease
                    </span>
                  </div>
                ) : units.length > 1 ? (
                  <select
                    style={inputStyle}
                    value={formData.unit_id}
                    onChange={e => setFormData({ ...formData, unit_id: e.target.value })}
                    required
                  >
                    <option value="">Select your unit</option>
                    {units.map(u => (
                      <option key={u.id} value={u.id}>
                        Unit {u.number || `#${u.id}`}{u.property?.name ? ` — ${u.property.name}` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p style={{ fontSize: 12, color: ADMIN_COLORS.amber, marginTop: 6 }}>
                    No active leased unit on file. Ask management to link a contract.
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle}>Issue Title</label>
                <input style={inputStyle} placeholder="e.g. Master bedroom AC cooling problem" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
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
                  <label style={labelStyle}>Priority Level</label>
                  <select style={inputStyle} value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                    <option value="low">Low (Routine)</option>
                    <option value="medium">Medium (Standard)</option>
                    <option value="high">High (Urgent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Description & Diagnostic Details</label>
                <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} placeholder="Please describe what happened, when it started, and any symptoms..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setIsFormOpen(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 8, fontWeight: 700, fontSize: 13, padding: '9px 16px', background: '#F1F5F9', color: '#475569', border: `1px solid ${THEME.border}`, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 8, fontWeight: 700, fontSize: 13, padding: '9px 18px', background: '#0E5E48', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 2px 6px rgba(14, 94, 72, 0.25)' }}>
                  <Icon path={icons.check} size={14} />
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
