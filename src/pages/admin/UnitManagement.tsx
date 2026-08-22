import { useEffect, useState } from 'react'
import api from '../../api/axios'
import BookingForm from './BookingForm'
import { THEME, CornerBrackets, portalPageCss, heroStyle, panelStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'

interface Unit {
  id: number
  property_id: number
  owner_id: number
  number: string
  dhewa_no?: string
  category?: string
  floor: number
  type: string
  size: number
  furnished?: boolean
  price: number
  status: 'AVAILABLE' | 'BOOKED' | 'OCCUPIED' | 'SOLD'
  property?: { id: number, name: string }
  owner?: { id: number, name: string }
}

interface Property {
  id: number
  name: string
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 0,
  border: `1px solid ${THEME.border}`,
  fontSize: 14,
  fontWeight: 500,
  color: THEME.ink,
  background: '#ffffff',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: THEME.purpleMid,
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
  marginBottom: 6,
  display: 'block',
}

const selectOnHeroStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 0,
  border: '1px solid rgba(255,255,255,0.3)',
  backgroundColor: 'rgba(255,255,255,0.95)',
  color: THEME.purple,
  fontWeight: 600,
  fontSize: 13.5,
}

export default function UnitManagement() {
  const [units, setUnits] = useState<Unit[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    property_id: '', number: '', dhewa_no: '', category: '', floor: 1,
    type: 'apartment', size: '', furnished: false, price: '', status: 'AVAILABLE',
  })

  const [bookingUnit, setBookingUnit] = useState<Unit | null>(null)

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    fetchUnits()
  }, [selectedPropertyId, statusFilter])

  const fetchProperties = async () => {
    try {
      const res = await api.get('/admin/properties')
      setProperties(res.data?.data?.properties || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchUnits = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedPropertyId) params.set('property_id', selectedPropertyId)
      if (statusFilter) params.set('status', statusFilter)
      const qs = params.toString()
      const res = await api.get(qs ? `/admin/units?${qs}` : '/admin/units')
      setUnits(res.data?.data?.units || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/admin/units', formData)
      setIsModalOpen(false)
      fetchUnits()
      setFormData({
        property_id: '', number: '', dhewa_no: '', category: '', floor: 1,
        type: 'apartment', size: '', furnished: false, price: '', status: 'AVAILABLE',
      })
    } catch (err: any) {
      alert('Error creating unit')
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Delete this unit?')) {
      try {
        await api.delete(`/admin/units/${id}`)
        fetchUnits()
      } catch (err) {
        alert('Error deleting unit')
      }
    }
  }

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.put(`/admin/units/${id}`, { status })
      fetchUnits()
    } catch (err) {
      alert('Error updating unit status')
    }
  }

  const getStatusColor = (status: string): { bg: string; color: string } => {
    switch(status) {
      case 'AVAILABLE': return { bg: '#f0fdf4', color: '#065f46' }
      case 'BOOKED':    return { bg: '#fffbeb', color: '#b45309' }
      case 'OCCUPIED':  return { bg: '#f0f9ff', color: '#075985' }
      case 'SOLD':      return { bg: '#f5f3ff', color: '#1e1b4b' }
      default:          return { bg: '#f3f4f6', color: '#374151' }
    }
  }

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'shop': return 'SHP'
      case 'office': return 'OFC'
      default: return 'APT'
    }
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>
      <style>{`
        .gfh-um-card { transition: transform 0.2s cubic-bezier(.2,.8,.2,1), box-shadow 0.2s cubic-bezier(.2,.8,.2,1); }
        .gfh-um-card:hover { transform: translateY(-2px); box-shadow: 0 12px 24px -8px rgba(15,61,58,0.16); }
      `}</style>

      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Unit Management
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Manage apartments, shops, and their status
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={selectedPropertyId}
            onChange={e => setSelectedPropertyId(e.target.value)}
            style={selectOnHeroStyle}
          >
            <option value="">All Properties</option>
            {properties.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={selectOnHeroStyle}
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE (vacant)</option>
            <option value="BOOKED">BOOKED</option>
            <option value="OCCUPIED">OCCUPIED</option>
            <option value="SOLD">SOLD</option>
          </select>
          <button className="gfh-portal-btn" onClick={() => setIsModalOpen(true)} style={ghostBtnStyle}>
            + Add Unit
          </button>
        </div>
      </div>

      <div className="fade-in" style={{ ...panelStyle, minHeight: 400 }}>
        <CornerBrackets />
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40, color: THEME.textMuted, fontWeight: 600 }}>Loading...</div>
        ) : units.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: THEME.textMuted, fontWeight: 600 }}>No units found.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {units.map((unit) => (
              <div
                key={unit.id}
                className="gfh-um-card gfh-portal-stat"
                style={{
                  position: 'relative',
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 0,
                  padding: 20,
                  backgroundColor: '#fff',
                }}
              >
                <CornerBrackets />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: 0,
                    backgroundColor: THEME.violetLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#fff',
                    letterSpacing: '0.3px',
                    boxShadow: `0 4px 12px -2px ${THEME.violetLight}80`,
                  }}>
                    {getTypeLabel(unit.type)}
                  </div>
                  <span style={{
                    backgroundColor: getStatusColor(unit.status).bg,
                    color: getStatusColor(unit.status).color,
                    padding: '4px 10px',
                    borderRadius: 0,
                    fontSize: 11.5,
                    fontWeight: 800,
                    letterSpacing: 0.4,
                    border: `1px solid ${getStatusColor(unit.status).color}55`,
                  }}>
                    {unit.status}
                  </span>
                </div>

                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 21, fontWeight: 700, color: THEME.ink, marginBottom: 6 }}>
                  Unit {unit.number}
                </div>

                <div style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 500, marginBottom: 18 }}>
                  <p style={{ margin: '4px 0' }}>Property: <strong style={{ color: THEME.ink }}>{unit.property?.name}</strong></p>
                  <p style={{ margin: '4px 0' }}>Type: <strong style={{ color: THEME.ink, textTransform: 'capitalize' }}>{unit.type}</strong> (Floor {unit.floor})</p>
                  <p style={{ margin: '4px 0' }}>
                    Price: <span style={{ color: THEME.violet, fontWeight: 800 }}>AED {Number(unit.price).toLocaleString()}</span>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    value={unit.status}
                    onChange={e => handleStatusChange(unit.id, e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: 120,
                      padding: '8px 10px',
                      borderRadius: 0,
                      border: `1px solid ${THEME.border}`,
                      backgroundColor: '#fff',
                      color: THEME.purple,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="BOOKED">BOOKED</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="SOLD">SOLD</option>
                  </select>
                  {unit.status === 'AVAILABLE' && (
                    <button
                      className="gfh-portal-btn"
                      onClick={() => setBookingUnit(unit)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 0,
                        border: 'none',
                        background: '#065f46',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 12.5,
                        cursor: 'pointer',
                      }}
                    >
                      Book
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(unit.id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 0,
                      border: 'none',
                      backgroundColor: '#991b1b',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 12.5,
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(20, 5, 40, 0.55)',
          backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            position: 'relative',
            width: 500,
            padding: 30,
            backgroundColor: '#fff',
            borderRadius: 0,
            boxShadow: '0 20px 50px rgba(46,8,84,0.35)',
            border: `1px solid ${THEME.border}`,
          }}>
            <CornerBrackets />
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: THEME.ink, marginBottom: 22 }}>
              Add New Unit
            </h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div>
                <label style={labelStyle}>Property</label>
                <select
                  value={formData.property_id}
                  onChange={e => setFormData({...formData, property_id: e.target.value})}
                  required
                  style={inputStyle}
                >
                  <option value="">Select Property</option>
                  {properties.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 15 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Unit Number</label>
                  <input value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} required style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Floor</label>
                  <input type="number" value={formData.floor} onChange={e => setFormData({...formData, floor: parseInt(e.target.value)})} required style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 15 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required style={inputStyle}>
                    <option value="apartment">Apartment</option>
                    <option value="shop">Shop</option>
                    <option value="office">Office</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Price (AED)</label>
                  <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 15 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Size</label>
                  <input type="number" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} required style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={inputStyle}>
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="BOOKED">BOOKED</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="SOLD">SOLD</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: 0, border: `1px solid ${THEME.border}`, backgroundColor: '#f3e8ff', color: THEME.purple, fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" className="gfh-portal-btn" style={ghostBtnStyle}>
                  Save Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {bookingUnit && (
        <BookingForm
          unit={bookingUnit}
          onClose={() => setBookingUnit(null)}
          onSuccess={() => { setBookingUnit(null); fetchUnits(); }}
        />
      )}
    </div>
  )
}
