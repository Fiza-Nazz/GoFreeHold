import React, { useEffect, useState, useMemo } from 'react'
import api from '../../api/axios'
import { THEME, Icon, portalPageCss } from '../../components/gfh/adminTheme'

interface Property {
  id: number
  owner_id: number
  name: string
  address: string
  city: string
  type: string
  total_units: number
  owner?: { id: number; name: string; email: string }
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
  border: '1px solid #CBD5E1',
  borderRadius: 8,
  color: '#0F172A',
  fontSize: 13.5,
  fontWeight: 500,
  padding: '10px 12px',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: '#334155',
  letterSpacing: '0.3px',
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
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

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

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      if (typeFilter && (p.type || '').toLowerCase() !== typeFilter.toLowerCase()) {
        return false
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        return (
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.address && p.address.toLowerCase().includes(q)) ||
          (p.city && p.city.toLowerCase().includes(q)) ||
          (p.owner?.name && p.owner.name.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [properties, searchTerm, typeFilter])

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif", padding: '20px 24px' }}>
      <style>{portalPageCss}</style>
      <style>{`
        @keyframes gfhOverlayFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes gfhModalPop { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .gfh-prop-input {
          font-family: 'Poppins', system-ui, sans-serif !important;
          font-size: 13.5px !important;
          border: 1px solid #E2E8F0 !important;
          border-radius: 10px !important;
          outline: none !important;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .gfh-prop-input:focus {
          border-color: #0F8A67 !important;
          box-shadow: 0 0 0 3px rgba(15, 138, 103, 0.12) !important;
        }
        .gfh-add-prop-btn {
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          background: #0F8A67 !important;
          color: #FFFFFF !important;
          border: none !important;
          border-radius: 10px !important;
          padding: 9px 18px !important;
          font-size: 13.5px !important;
          font-weight: 700 !important;
          cursor: pointer !important;
          box-shadow: 0 1px 3px rgba(15, 138, 103, 0.25) !important;
          transition: background 0.15s ease, transform 0.15s ease !important;
          font-family: 'Poppins', sans-serif !important;
        }
        .gfh-add-prop-btn:hover {
          background: #0B6E52 !important;
          transform: translateY(-1px) !important;
        }
        .gfh-del-btn {
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          padding: 7px 14px !important;
          background: #EF4444 !important;
          border: none !important;
          color: #ffffff !important;
          border-radius: 8px !important;
          font-weight: 700 !important;
          font-size: 12px !important;
          cursor: pointer !important;
          box-shadow: 0 1px 2px rgba(239, 68, 68, 0.2) !important;
          transition: background 0.15s ease !important;
        }
        .gfh-del-btn:hover {
          background: #DC2626 !important;
        }
        .gfh-cancel-btn {
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          padding: 9px 18px !important;
          background: #F1F5F9 !important;
          border: 1px solid #CBD5E1 !important;
          color: #334155 !important;
          border-radius: 8px !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          cursor: pointer !important;
          transition: background 0.15s ease !important;
        }
        .gfh-cancel-btn:hover {
          background: #E2E8F0 !important;
        }
      `}</style>

      {/* Main Single Card Container matching media_1788523948275.png & media_1788526951091.png */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid #E2E8F0',
        padding: '24px 28px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
      }}>
        {/* Top Header Row with Title, Search, Filter, and Add Property Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20,
        }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>
              Property Management
            </h2>
            <p style={{ fontSize: 13.5, color: '#64748B', margin: '4px 0 0', fontWeight: 500 }}>
              Manage all properties, buildings and owners
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: 220 }}>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search properties..."
                className="gfh-prop-input"
                style={{
                  width: '100%',
                  padding: '9px 36px 9px 14px',
                  background: '#F8FAFC',
                  color: '#0F172A',
                  boxSizing: 'border-box',
                }}
              />
              <svg
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }}
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* Type Dropdown */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="gfh-prop-input"
              style={{
                padding: '9px 30px 9px 14px',
                background: '#FFFFFF',
                color: '#334155',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <option value="">All Types</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="mixed">Mixed</option>
            </select>

            {/* + Add Property Button (Matching media_1788526951091.png) */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="gfh-add-prop-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#0F8A67',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                padding: '9px 18px',
                fontSize: 13.5,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(15, 138, 103, 0.25)',
                transition: 'background 0.15s ease, transform 0.15s ease',
                fontFamily: "'Poppins', sans-serif",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#0B6E52'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#0F8A67'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Property</span>
            </button>
          </div>
        </div>

        {statusMsg && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', marginBottom: 20,
            background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: 8,
            fontSize: 13.5, fontWeight: 600,
          }}>
            <Icon path={icons.check} size={16} />
            {statusMsg}
          </div>
        )}

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : filteredProperties.length === 0 ? (
          <p style={{ fontSize: 14, color: '#64748B', fontWeight: 500, textAlign: 'center', padding: 30 }}>
            {properties.length === 0 ? 'No properties found.' : 'No properties match your filter.'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Property Name</th>
                  <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Owner</th>
                  <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>City</th>
                  <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Type</th>
                  <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Total Units</th>
                  <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="gfh-portal-row" style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px' }}>
                      <span style={{ fontWeight: 700, color: '#0F172A', fontSize: 14 }}>{property.name}</span>
                      <span style={{ display: 'block', fontSize: 12, color: '#64748B', marginTop: 2 }}>{property.address}</span>
                    </td>
                    <td style={{ padding: '14px', color: '#334155', fontWeight: 600, fontSize: 13.5 }}>
                      {property.owner?.name || '—'}
                    </td>
                    <td style={{ padding: '14px', color: '#334155', fontWeight: 500, fontSize: 13.5 }}>
                      {property.city || '—'}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 11.5,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: property.type === 'commercial' ? '#EFF6FF' : property.type === 'mixed' ? '#FAF5FF' : '#F0FDF4',
                        color: property.type === 'commercial' ? '#1D4ED8' : property.type === 'mixed' ? '#7E22CE' : '#15803D',
                      }}>
                        {property.type || 'Residential'}
                      </span>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 28,
                        height: 24,
                        padding: '0 8px',
                        background: '#ECFDF5',
                        color: '#065F46',
                        borderRadius: 999,
                        fontSize: 12.5,
                        fontWeight: 800,
                      }}>
                        {property.total_units || 0}
                      </span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(property.id)}
                        className="gfh-del-btn"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '7px 14px',
                          background: '#EF4444',
                          border: 'none',
                          color: '#ffffff',
                          borderRadius: 8,
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(239, 68, 68, 0.2)',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#DC2626')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#EF4444')}
                      >
                        <Icon path={icons.trash} size={13} />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          animation: 'gfhOverlayFade 0.2s ease',
        }}>
          <div style={{
            position: 'relative', width: 500, maxWidth: '92vw', background: '#ffffff', borderRadius: 16,
            padding: 28, border: '1px solid #E2E8F0',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
            animation: 'gfhModalPop 0.25s cubic-bezier(.2,.8,.2,1)',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '0 0 20px 0' }}>
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
                <input style={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Marina Crown Tower" required />
              </div>
              <div>
                <label style={labelStyle}>Address</label>
                <input style={inputStyle} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="e.g. Dubai Marina, Dubai" required />
              </div>
              <div style={{ display: 'flex', gap: 15 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>City</label>
                  <input style={inputStyle} value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Dubai" required />
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
              <div style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="gfh-cancel-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '9px 18px',
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#E2E8F0')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#F1F5F9')}
                >
                  <Icon path={icons.close} size={14} />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="gfh-add-prop-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '9px 20px',
                    background: '#0F8A67',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 13.5,
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(15, 138, 103, 0.25)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#0B6E52')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#0F8A67')}
                >
                  <Icon path={icons.check} size={15} />
                  <span>Save Property</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
