import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Link } from 'react-router-dom'
import { THEME, ADMIN_COLORS, portalPageCss, heroStyle, panelStyle, ghostBtnStyle, thStyle, tdStyle, RADIUS } from '../../components/gfh/adminTheme'

interface Unit {
  id: number
  number: string
  floor: number
  type: string
  price: number
  property?: {
    id: number
    name: string
  }
  property_id?: number
}

interface PropertyOption {
  id: number
  name: string
}

export default function VacantUnits() {
  const [units, setUnits] = useState<Unit[]>([])
  const [properties, setProperties] = useState<PropertyOption[]>([])
  const [propertyId, setPropertyId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const res = await api.get('/owner/dashboard/properties')
        setProperties(res.data.data.properties || [])
      } catch (err) {
        console.error(err)
      }
    }
    loadProperties()
  }, [])

  useEffect(() => {
    const fetchVacantUnits = async () => {
      setIsLoading(true)
      try {
        const url = propertyId
          ? `/owner/dashboard/vacant-units?property_id=${propertyId}`
          : '/owner/dashboard/vacant-units'
        const res = await api.get(url)
        setUnits(res.data?.data?.units || [])
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchVacantUnits()
  }, [propertyId])

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, margin: 0 }}>Vacant Units Report</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>Filter available units by property</div>
        </div>
        <Link to="/owner/dashboard" className="gfh-portal-btn" style={{ ...ghostBtnStyle, background: '#075985' }}>
          ← Back to dashboard
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 22 }}>
        <div className="gfh-portal-stat" style={{ background: '#991b1b', color: '#fff', borderRadius: 0, padding: '20px 18px', minHeight: 110, boxShadow: '0 8px 20px -10px rgba(15,23,42,0.45)' }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{isLoading ? '—' : units.length}</div>
          <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 8 }}>Vacant units</div>
          <div style={{ display: 'inline-block', marginTop: 8, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.3px', textTransform: 'uppercase', background: 'rgba(255,255,255,0.18)', padding: '3px 8px', borderRadius: 0 }}>Available</div>
        </div>
      </div>

      <div style={{ marginBottom: 18, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
          Property filter
        </label>
        <select
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          style={{
            minWidth: 220,
            padding: '10px 12px',
            borderRadius: 0,
            border: `1px solid ${THEME.border}`,
            background: '#ffffff',
            color: THEME.ink,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <option value="">All properties</option>
          {properties.map((p) => (
            <option key={p.id} value={String(p.id)}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="fade-in" style={{ ...panelStyle, minHeight: 320 }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : units.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>No vacant units available for this filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  {['Property', 'Unit Number', 'Type', 'Floor', 'Rent (AED)', 'Actions'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr key={unit.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{unit.property?.name}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{unit.number}</td>
                    <td style={{ ...tdStyle, textTransform: 'capitalize' }}>{unit.type}</td>
                    <td style={tdStyle}>{unit.floor}</td>
                    <td style={{ ...tdStyle, color: '#065f46', fontWeight: 700 }}>{Number(unit.price).toLocaleString()}</td>
                    <td style={tdStyle}>
                      <Link to={`/owner/units/${unit.id}`} className="gfh-portal-link" style={{ color: '#075985' }}>View details →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
