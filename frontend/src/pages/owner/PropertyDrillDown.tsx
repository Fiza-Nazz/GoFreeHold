import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Link, useNavigate } from 'react-router-dom'
import { THEME, ADMIN_COLORS, portalPageCss, heroStyle, panelStyle, ghostBtnStyle, thStyle, tdStyle, RADIUS } from '../../components/gfh/adminTheme'
import { safeUpper } from '../../utils/safeLabel'

interface UnitSummary {
  id: number
  number: string
  floor: number
  type: string
  status: string
  price: number
}

interface PropertySummary {
  id: number
  name: string
  address: string
  type: string
  total_units: number
  occupied_units: number
  vacant_units: number
  units?: UnitSummary[]
}

export default function PropertyDrillDown() {
  const navigate = useNavigate()
  const [properties, setProperties] = useState<PropertySummary[]>([])
  const [selectedProperty, setSelectedProperty] = useState<PropertySummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUnitsLoading, setIsUnitsLoading] = useState(false)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await api.get('/owner/dashboard/properties')
        setProperties(res.data?.data?.properties || [])
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProperties()
  }, [])

  const handlePropertyClick = async (prop: PropertySummary) => {
    setSelectedProperty(prop)
    setIsUnitsLoading(true)
    try {
      const res = await api.get(`/owner/dashboard/properties/${prop.id}/units`)
      setSelectedProperty(prev => prev ? { ...prev, units: res.data?.data?.units || [] } : null)
    } catch (err) {
      console.error(err)
    } finally {
      setIsUnitsLoading(false)
    }
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, margin: 0 }}>Property drill-down</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>Detailed occupancy and unit lists for each building</div>
        </div>
        <Link to="/owner/dashboard" className="gfh-portal-btn" style={{ ...ghostBtnStyle, background: '#075985' }}>
          ← Back to dashboard
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 22 }}>
        <div className="gfh-portal-stat" style={{ background: '#1e1b4b', color: '#fff', borderRadius: 0, padding: '20px 18px', minHeight: 110, boxShadow: '0 8px 20px -10px rgba(15,23,42,0.45)' }}>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{properties.length}</div>
          <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 8 }}>Properties</div>
          <div style={{ display: 'inline-block', marginTop: 8, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.3px', textTransform: 'uppercase', background: 'rgba(255,255,255,0.18)', padding: '3px 8px', borderRadius: 0 }}>Portfolio</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div className="fade-in" style={{ ...panelStyle, flex: 1, minHeight: 400 }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
          ) : properties.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>No properties found.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {properties.map(prop => (
                <div
                  key={prop.id}
                  className="gfh-portal-row"
                  onClick={() => handlePropertyClick(prop)}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 16,
                    background: selectedProperty?.id === prop.id ? '#f0fdfa' : '#fff',
                    border: selectedProperty?.id === prop.id ? `1px solid ${THEME.violetLight}` : `1px solid ${THEME.border}`,
                    borderRadius: RADIUS,
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, color: THEME.ink, fontSize: 15, fontWeight: 700 }}>{prop.name}</h3>
                    <p style={{ fontSize: 12, color: THEME.textMuted, margin: '4px 0 0 0' }}>{prop.address}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 16, textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>{prop.total_units}</div>
                      <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>Total</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#065f46' }}>{prop.occupied_units}</div>
                      <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>Occ.</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#991b1b' }}>{prop.vacant_units}</div>
                      <div style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>Vac.</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedProperty && (
          <div className="fade-in" style={{ ...panelStyle, flex: 1, minHeight: 400 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: THEME.ink, marginTop: 0, marginBottom: 16 }}>
              {selectedProperty.name} — Units
            </h3>
            {isUnitsLoading ? (
              <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
            ) : selectedProperty.units?.length === 0 ? (
              <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>No units registered for this building.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                      {['Unit', 'Type', 'Status', 'Rent'].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProperty.units?.map(unit => (
                      <tr
                        key={unit.id}
                        className="gfh-portal-row"
                        style={{ borderBottom: `1px solid ${THEME.border}`, cursor: 'pointer' }}
                        onClick={() => navigate(`/owner/units/${unit.id}`)}
                      >
                        <td style={{ ...tdStyle, fontWeight: 700 }}>
                          <Link to={`/owner/units/${unit.id}`} className="gfh-portal-link" style={{ color: '#075985' }} onClick={(e) => e.stopPropagation()}>
                            {unit.number}
                          </Link>
                        </td>
                        <td style={{ ...tdStyle, textTransform: 'capitalize' }}>{unit.type}</td>
                        <td style={tdStyle}>
                          <span
                            style={{
                              fontSize: 12,
                              padding: '4px 10px',
                              borderRadius: 0,
                              fontWeight: 700,
                              background:
                                unit.status === 'AVAILABLE' ? '#f0fdf4' :
                                unit.status === 'OCCUPIED' ? '#fef2f2' : '#fffbeb',
                              color:
                                unit.status === 'AVAILABLE' ? '#065f46' :
                                unit.status === 'OCCUPIED' ? '#991b1b' : '#b45309',
                              border: `1px solid ${
                                unit.status === 'AVAILABLE' ? '#bbf7d0' :
                                unit.status === 'OCCUPIED' ? '#fecaca' : '#fde68a'
                              }`,
                            }}
                          >
                            {safeUpper(unit.status)}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: '#065f46' }}>{Number(unit.price).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
