import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { THEME, ADMIN_COLORS, portalPageCss, heroStyle, panelStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'
import { safeUpper, safeUpperLabel } from '../../utils/safeLabel'

interface Complaint {
  id: number
  title: string
  description?: string
  status: string
  priority?: string
  created_at?: string
  unit?: { number?: string; property?: { name?: string } }
}

/**
 * Tenant has list/create only — no GET /tenant/complaints/{id}.
 * Detail is resolved from GET /tenant/complaints by id (no invented endpoint).
 */
export default function TenantComplaintDetail() {
  const { id } = useParams()
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await api.get('/tenant/complaints')
        const list: Complaint[] = res.data?.data?.complaints || []
        const found = list.find((c) => String(c.id) === String(id)) || null
        if (!found) {
          setError('Complaint not found.')
          setComplaint(null)
        } else {
          setComplaint(found)
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load complaint.')
        setComplaint(null)
      } finally {
        setIsLoading(false)
      }
    }
    if (id) void load()
  }, [id])

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", background: THEME.pageBg }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 600 }}>Complaint Detail</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, marginTop: 4 }}>Complaint #{id}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Maintenance request details</div>
        </div>
        <Link to="/tenant/complaints" className="gfh-portal-btn" style={{ ...ghostBtnStyle, background: '#075985' }}>
          ← Back to Complaints
        </Link>
      </div>

      <div className="fade-in" style={{ ...panelStyle, minHeight: 180 }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : error ? (
          <p style={{ color: ADMIN_COLORS.red, fontWeight: 600, textAlign: 'center', padding: 30 }}>{error}</p>
        ) : complaint ? (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ paddingBottom: 16, borderBottom: `1px solid ${THEME.border}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Title</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.ink, marginTop: 4 }}>{complaint.title}</div>
            </div>
            {complaint.description && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Description</div>
                <div style={{ fontSize: 14, color: THEME.ink, marginTop: 4 }}>{complaint.description}</div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
              <Detail label="Status" value={safeUpperLabel(complaint.status)} />
              {complaint.priority && <Detail label="Priority" value={safeUpper(complaint.priority)} />}
              {complaint.unit && (
                <Detail
                  label="Unit"
                  value={`${complaint.unit.number || '—'}${complaint.unit.property?.name ? ` · ${complaint.unit.property.name}` : ''}`}
                />
              )}
              {complaint.created_at && (
                <Detail label="Logged" value={new Date(complaint.created_at).toLocaleString()} />
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="gfh-portal-stat" style={{ padding: 14, border: `1px solid ${THEME.border}`, borderRadius: 0, background: '#fff' }}>
      <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: THEME.ink, marginTop: 6 }}>{value}</div>
    </div>
  )
}
