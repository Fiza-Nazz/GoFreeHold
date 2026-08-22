import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { THEME, ADMIN_COLORS, portalPageCss, heroStyle, panelStyle, ghostBtnStyle, thStyle, tdStyle, RADIUS } from '../../components/gfh/adminTheme'
import { safeUpper } from '../../utils/safeLabel'

interface UnitRow {
  id: number
  number: string
  floor: number
  type: string
  status: string
  price: number
  propertyName: string
}

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  AVAILABLE: { bg: '#f0fdf4', color: '#065f46', border: '#bbf7d0' },
  OCCUPIED:  { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
  BOOKED:    { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
}

export default function OwnerUnits() {
  const [units, setUnits] = useState<UnitRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const propsRes = await api.get('/owner/dashboard/properties')
        const properties = propsRes.data.data.properties || []
        const rows: UnitRow[] = []

        for (const prop of properties) {
          const unitsRes = await api.get(`/owner/dashboard/properties/${prop.id}/units`)
          const list = unitsRes.data.data.units || []
          for (const u of list) {
            rows.push({
              id: u.id,
              number: u.number,
              floor: u.floor,
              type: u.type,
              status: u.status,
              price: Number(u.price),
              propertyName: prop.name,
            })
          }
        }

        setUnits(rows)
      } catch (err) {
        console.error(err)
        setError('Failed to load units.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const occupied = units.filter(u => u.status === 'OCCUPIED').length
  const vacant = units.filter(u => u.status === 'AVAILABLE').length

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, margin: 0 }}>My Units</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>All units across your properties</div>
        </div>
        <Link to="/owner/dashboard" className="gfh-portal-btn" style={{ ...ghostBtnStyle, background: '#075985' }}>
          ← Back to dashboard
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 22 }}>
        {[
          { value: units.length, label: 'Total units', bg: '#1e1b4b', sub: 'Units' },
          { value: occupied, label: 'Occupied', bg: '#065f46', sub: 'Occupied' },
          { value: vacant, label: 'Available', bg: '#991b1b', sub: 'Vacant' },
        ].map((card, i) => (
          <div key={card.label} className="gfh-portal-stat" style={{ background: card.bg, color: '#fff', borderRadius: 0, padding: '20px 18px', minHeight: 110, boxShadow: '0 8px 20px -10px rgba(15,23,42,0.45)', animationDelay: `${i * 0.06}s` }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{isLoading ? '—' : card.value}</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 8 }}>{card.label}</div>
            <div style={{ display: 'inline-block', marginTop: 8, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.3px', textTransform: 'uppercase', background: 'rgba(255,255,255,0.18)', padding: '3px 8px', borderRadius: 0 }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="fade-in" style={{ ...panelStyle, minHeight: 320 }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#991b1b', fontWeight: 600 }}>{error}</div>
        ) : units.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>No units found in your portfolio.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  {['Property', 'Unit', 'Type', 'Floor', 'Status', 'Rent (AED)', 'Actions'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {units.map((u) => {
                  const st = STATUS_STYLE[u.status] || { bg: '#f3f4f6', color: '#374151' }
                  return (
                    <tr key={u.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{u.propertyName}</td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{u.number}</td>
                      <td style={{ ...tdStyle, textTransform: 'capitalize' }}>{u.type}</td>
                      <td style={tdStyle}>{u.floor}</td>
                      <td style={tdStyle}>
                        <span style={{ backgroundColor: st.bg, color: st.color, border: `1px solid ${st.border || '#d1d5db'}`, padding: '4px 10px', borderRadius: 0, fontSize: 12, fontWeight: 700 }}>
                          {safeUpper(u.status)}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#065f46' }}>{u.price.toLocaleString()}</td>
                      <td style={tdStyle}>
                        <Link to={`/owner/units/${u.id}`} className="gfh-portal-link" style={{ color: '#075985' }}>View details →</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
