import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { THEME, Icon, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'

interface Property {
  id: number
  owner_id: number
  name: string
  address: string
  city: string
  type: string
  total_units: number
  owner?: { id: number, name: string, email: string }
}

interface Owner {
  id: number
  name: string
  email: string
}

const icons = {
  plus: 'M12 5v14M5 12h14',
  trash: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z',
  close: 'M18 6 6 18M6 6l12 12',
  check: 'M20 6 9 17l-5-5',
}

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
  color: THEME.purple,
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
}

export default function BuildingManagement() {
  const [properties, setProperties] = useState<Property[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ owner_id: '', name: '', address: '', city: '', type: 'residential' })
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [bRes, oRes] = await Promise.all([
        api.get('/admin/properties'),
        api.get('/admin/properties/owners')
      ])
      setProperties(bRes.data?.data?.properties || [])
      setOwners(oRes.data?.data?.owners || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/admin/properties', formData)
      setStatusMsg('Property created successfully!')
      setIsModalOpen(false)
      fetchData()
      setFormData({ owner_id: '', name: '', address: '', city: '', type: 'residential' })
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Error creating property')
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this property?')) {
      try {
        await api.delete(`/admin/properties/${id}`)
        fetchData()
      } catch (err) {
        alert('Cannot delete property with active units')
      }
    }
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>
      <style>{`
        @keyframes gfhOverlayFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes gfhModalPop { from { opacity: 0; transform: scale(0.94) translateY(14px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>

      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Property Management
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Manage all properties
          </p>
        </div>
        <button className="gfh-portal-btn" style={ghostBtnStyle} onClick={() => setIsModalOpen(true)}>
          <Icon path={icons.plus} size={16} />
          Add Property
        </button>
      </div>

      {statusMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', marginBottom: 20,
          background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 0,
          fontSize: 13.5, fontWeight: 600,
        }}>
          <Icon path={icons.check} size={16} />
          {statusMsg}
        </div>
      )}

      <div className="fade-in" style={{ ...panelStyle, minHeight: 400 }}>
        <CornerBrackets />
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : properties.length === 0 ? (
          <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500, textAlign: 'center', padding: 30 }}>No properties found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  <th style={thStyle}>Property Name</th>
                  <th style={thStyle}>Owner</th>
                  <th style={thStyle}>City</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Total Units</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 700, color: THEME.ink }}>{property.name}</span>
                      <span style={{ display: 'block', fontSize: 11.5, color: THEME.textMuted, marginTop: 2 }}>{property.address}</span>
                    </td>
                    <td style={tdStyle}>{property.owner?.name}</td>
                    <td style={tdStyle}>{property.city}</td>
                    <td style={tdStyle}>{(property.type || '—').toString().toUpperCase()}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: THEME.violet }}>{property.total_units}</td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(property.id)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                          background: '#991b1b', border: 'none', color: '#fff',
                          borderRadius: 0, fontWeight: 700, fontSize: 12, cursor: 'pointer',
                        }}
                      >
                        <Icon path={icons.trash} size={13} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(27, 14, 51, 0.55)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          animation: 'gfhOverlayFade 0.2s ease',
        }}>
          <div style={{
            position: 'relative', width: 500, maxWidth: '92vw', background: '#ffffff', borderRadius: 0,
            padding: 30, border: `1px solid ${THEME.border}`,
            boxShadow: '0 24px 60px -12px rgba(27, 14, 51, 0.5)',
            animation: 'gfhModalPop 0.28s cubic-bezier(.2,.8,.2,1)',
          }}>
            <CornerBrackets />
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 21, fontWeight: 700, color: THEME.ink, margin: '0 0 20px 0' }}>
              Add New Property
            </h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div>
                <label style={labelStyle}>Owner</label>
                <select style={inputStyle} value={formData.owner_id} onChange={e => setFormData({...formData, owner_id: e.target.value})} required>
                  <option value="">Select Owner</option>
                  {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Property Name</label>
                <input style={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div>
                <label style={labelStyle}>Address</label>
                <input style={inputStyle} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', gap: 15 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>City</label>
                  <input style={inputStyle} value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Type</label>
                  <select style={inputStyle} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                    background: '#f1f5f9', border: `1px solid ${THEME.border}`, color: THEME.textMuted,
                    borderRadius: 0, fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
                  }}
                >
                  <Icon path={icons.close} size={15} />
                  Cancel
                </button>
                <button type="submit" className="gfh-portal-btn" style={ghostBtnStyle}>
                  <Icon path={icons.check} size={15} />
                  Save Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
