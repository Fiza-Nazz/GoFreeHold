import { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import { THEME, portalPageCss, Icon, ICONS } from '../../components/gfh/adminTheme'

interface Unit {
  id: number
  property_id: number
  number: string
  dhewa_no?: string
  category?: string
  floor: number
  type: string
  size: number
  furnished?: boolean
  price: number
  status: 'AVAILABLE' | 'BOOKED' | 'OCCUPIED' | 'SOLD'
  property?: { id: number; name: string }
  propertyName?: string
}

interface Property {
  id: number
  name: string
}

export default function OwnerUnits() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialStatus = searchParams.get('status') || ''
  const initialProperty = searchParams.get('property_id') || ''

  const [units, setUnits] = useState<Unit[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(initialProperty)
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    property_id: '', number: '', dhewa_no: '', category: '', floor: 1,
    type: 'apartment', size: '', furnished: false, price: '', status: 'AVAILABLE',
  })

  // Sync state if URL search parameters change (e.g. back/forward navigation or link click)
  useEffect(() => {
    const s = searchParams.get('status')
    if (s !== null && s !== statusFilter) {
      setStatusFilter(s)
    }
    const p = searchParams.get('property_id')
    if (p !== null && p !== selectedPropertyId) {
      setSelectedPropertyId(p)
    }
  }, [searchParams])

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    fetchUnits()
  }, [selectedPropertyId, statusFilter])

  const fetchProperties = async () => {
    try {
      const res = await api.get('/owner/properties')
      const data = res.data?.data?.properties || res.data?.data || res.data || []
      setProperties(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      // Fallback: try dashboard properties
      try {
        const res2 = await api.get('/owner/dashboard/properties')
        const data2 = res2.data?.data?.properties || res2.data?.data || []
        setProperties(Array.isArray(data2) ? data2 : [])
      } catch (err2) {
        console.error(err2)
      }
    }
  }

  const fetchUnits = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedPropertyId) params.set('property_id', selectedPropertyId)
      if (statusFilter) params.set('status', statusFilter)
      const qs = params.toString()
      const res = await api.get(qs ? `/owner/units?${qs}` : '/owner/units')
      const data = res.data?.data?.units || res.data?.data || res.data || []
      setUnits(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      // Fallback: load from dashboard endpoints
      try {
        const propsRes = await api.get('/owner/dashboard/properties')
        const props = propsRes.data?.data?.properties || []
        const rows: Unit[] = []
        for (const prop of props) {
          const unitsRes = await api.get(`/owner/dashboard/properties/${prop.id}/units`)
          const list = unitsRes.data?.data?.units || []
          for (const u of list) {
            rows.push({ ...u, property: { id: prop.id, name: prop.name }, propertyName: prop.name })
          }
        }
        setUnits(rows)
      } catch (err2) {
        console.error(err2)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/owner/units', {
        property_id: Number(formData.property_id),
        number: formData.number.trim(),
        floor: Number(formData.floor) || 1,
        type: formData.type,
        size: Number(formData.size) || 0,
        price: Number(formData.price) || 0,
        dhewa_no: formData.dhewa_no.trim() || null,
        category: formData.category.trim() || null,
        furnished: Boolean(formData.furnished),
        status: formData.status || 'AVAILABLE',
      })
      setIsModalOpen(false)
      fetchUnits()
      setFormData({
        property_id: '', number: '', dhewa_no: '', category: '', floor: 1,
        type: 'apartment', size: '', furnished: false, price: '', status: 'AVAILABLE',
      })
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating unit')
    }
  }

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.put(`/owner/units/${id}`, { status })
      fetchUnits()
    } catch (err) {
      alert('Error updating unit status')
    }
  }

  const getStatusColor = (status: string): { bg: string; color: string; border: string; dot: string } => {
    switch (status) {
      case 'AVAILABLE': return { bg: '#ECFDF5', color: '#065F46', border: '#D1FAE5', dot: '#10B981' }
      case 'BOOKED':    return { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', dot: '#F59E0B' }
      case 'OCCUPIED':  return { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE', dot: '#2563EB' }
      case 'SOLD':      return { bg: '#FAF5FF', color: '#7C3AED', border: '#E9D5FF', dot: '#7C3AED' }
      default:          return { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1', dot: '#64748B' }
    }
  }

  const getTypeLabel = (type: string) => {
    const t = (type || '').toLowerCase()
    if (t.includes('shop')) return 'SHP'
    if (t.includes('office')) return 'OFC'
    return 'APT'
  }

  const getPropertyName = (unit: Unit) => {
    return unit.property?.name || unit.propertyName || 'N/A'
  }

  // Filter units by search term client-side
  const filteredUnits = useMemo(() => {
    if (!searchTerm.trim()) return units
    const q = searchTerm.toLowerCase()
    return units.filter(u =>
      (u.number && u.number.toLowerCase().includes(q)) ||
      (getPropertyName(u).toLowerCase().includes(q)) ||
      (u.type && u.type.toLowerCase().includes(q)) ||
      (u.status && u.status.toLowerCase().includes(q)) ||
      (u.dhewa_no && u.dhewa_no.toLowerCase().includes(q))
    )
  }, [units, searchTerm])

  // Real-time metric counts
  const totalUnits = units.length
  const occupiedUnits = units.filter(u => u.status === 'OCCUPIED').length
  const availableUnits = units.filter(u => u.status === 'AVAILABLE').length
  const bookedUnits = units.filter(u => u.status === 'BOOKED').length
  const soldUnits = units.filter(u => u.status === 'SOLD').length

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif", padding: '20px 24px' }}>
      <style>{portalPageCss}</style>
      <style>{`
        .gfh-unit-input {
          font-family: 'Poppins', system-ui, sans-serif;
          font-size: 13.5px;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .gfh-unit-input:focus {
          border-color: #0F8A67;
          box-shadow: 0 0 0 3px rgba(15, 138, 103, 0.12);
        }
        .gfh-unit-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 18px;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .gfh-unit-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px -6px rgba(15, 23, 42, 0.08);
          border-color: #CBD5E1;
        }
      `}</style>

      {/* Main Single Card Container */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid #E2E8F0',
        padding: '24px 28px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
      }}>
        {/* Top Header Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>
              Unit Management
            </h2>
            <p style={{ fontSize: 13.5, color: '#64748B', margin: '4px 0 0', fontWeight: 500 }}>
              Manage apartments, shops, and their status
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: 220 }}>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search units..."
                className="gfh-unit-input"
                style={{
                  width: '100%',
                  padding: '9px 36px 9px 14px',
                  background: '#F8FAFC',
                  color: '#0F172A',
                }}
              />
              <svg
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748B', pointerEvents: 'none' }}
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* Properties Dropdown */}
            <select
              value={selectedPropertyId}
              onChange={e => setSelectedPropertyId(e.target.value)}
              className="gfh-unit-input"
              style={{ padding: '9px 30px 9px 14px', background: '#FFFFFF', color: '#334155', fontWeight: 500, cursor: 'pointer' }}
            >
              <option value="">All Properties</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="gfh-unit-input"
              style={{ padding: '9px 30px 9px 14px', background: '#FFFFFF', color: '#334155', fontWeight: 500, cursor: 'pointer' }}
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="BOOKED">Booked</option>
              <option value="SOLD">Sold</option>
            </select>

            {/* Add Unit Button */}
            <button
              onClick={() => {
                if (properties.length > 0 && !formData.property_id) {
                  setFormData(prev => ({ ...prev, property_id: String(properties[0].id) }))
                }
                setIsModalOpen(true)
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#0F8A67', color: '#FFFFFF', border: 'none', borderRadius: 10,
                padding: '9px 18px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(15, 138, 103, 0.25)', transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#0B6E52')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0F8A67')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Unit</span>
            </button>
          </div>
        </div>

        {/* 5 Rounded Metric Stat Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 14,
          marginTop: 24,
          marginBottom: 26,
        }}>
          {/* Card 1: Total Units */}
          <div
            onClick={() => { setStatusFilter(''); setSearchParams({}) }}
            style={{
              background: '#FFFFFF',
              border: statusFilter === '' ? '2px solid #0F8A67' : '1px solid #F1F5F9',
              borderRadius: 14,
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Click to show all units"
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: '#ECFDF8', color: '#0F8A67',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" />
                <path d="M9 22v-4h6v4" />
                <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Total Units</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>{totalUnits}</div>
            </div>
          </div>

          {/* Card 2: Occupied */}
          <div
            onClick={() => { setStatusFilter('OCCUPIED'); setSearchParams({ status: 'OCCUPIED' }) }}
            style={{
              background: '#FFFFFF',
              border: statusFilter === 'OCCUPIED' ? '2px solid #2563EB' : '1px solid #F1F5F9',
              borderRadius: 14,
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Click to filter by Occupied"
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: '#EFF6FF', color: '#2563EB',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Occupied</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>{occupiedUnits}</div>
            </div>
          </div>

          {/* Card 3: Available */}
          <div
            onClick={() => { setStatusFilter('AVAILABLE'); setSearchParams({ status: 'AVAILABLE' }) }}
            style={{
              background: '#FFFFFF',
              border: statusFilter === 'AVAILABLE' ? '2px solid #059669' : '1px solid #F1F5F9',
              borderRadius: 14,
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Click to filter by Available"
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: '#ECFDF8', color: '#059669',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Available</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>{availableUnits}</div>
            </div>
          </div>

          {/* Card 4: Booked */}
          <div
            onClick={() => { setStatusFilter('BOOKED'); setSearchParams({ status: 'BOOKED' }) }}
            style={{
              background: '#FFFFFF',
              border: statusFilter === 'BOOKED' ? '2px solid #EA580C' : '1px solid #F1F5F9',
              borderRadius: 14,
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Click to filter by Booked"
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: '#FFF7ED', color: '#EA580C',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Booked</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>{bookedUnits}</div>
            </div>
          </div>

          {/* Card 5: Sold */}
          <div
            onClick={() => { setStatusFilter('SOLD'); setSearchParams({ status: 'SOLD' }) }}
            style={{
              background: '#FFFFFF',
              border: statusFilter === 'SOLD' ? '2px solid #7C3AED' : '1px solid #F1F5F9',
              borderRadius: 14,
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Click to filter by Sold"
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: '#FAF5FF', color: '#7C3AED',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Sold</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>{soldUnits}</div>
            </div>
          </div>
        </div>

        {/* Units Grid List */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B', fontWeight: 600 }}>
            Loading units…
          </div>
        ) : filteredUnits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B', fontWeight: 600 }}>
            No units found matching your filters.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
            {filteredUnits.map(unit => {
              const statusStyle = getStatusColor(unit.status)
              return (
                <div key={unit.id} className="gfh-unit-card">
                  {/* Top line with purple type pill & status badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{
                      padding: '3px 9px', borderRadius: 6, background: '#4C1D95', color: '#FFFFFF',
                      fontSize: 11, fontWeight: 800, letterSpacing: '0.4px',
                    }}>
                      {getTypeLabel(unit.type)}
                    </span>
                    <span style={{
                      padding: '4px 12px', borderRadius: 999,
                      background: statusStyle.bg, color: statusStyle.color,
                      border: `1px solid ${statusStyle.border}`,
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.4px',
                    }}>
                      {unit.status}
                    </span>
                  </div>

                  {/* Unit Title */}
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
                    Unit {unit.number}
                  </div>

                  {/* Details */}
                  <div style={{ fontSize: 13, color: '#64748B', marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div>Property: <strong style={{ color: '#0F766E', fontWeight: 700 }}>{getPropertyName(unit)}</strong></div>
                    <div>Type: <strong style={{ color: '#0F172A', fontWeight: 600 }}>{unit.type ? unit.type.charAt(0).toUpperCase() + unit.type.slice(1) : 'Apartment'} {unit.floor ? `(Floor ${unit.floor})` : ''}</strong></div>
                    <div>Price: <strong style={{ color: '#065F46', fontWeight: 800 }}>AED {Number(unit.price).toLocaleString()}</strong></div>
                  </div>

                  {/* Status Change Dropdown & Details link */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <span style={{
                        position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                        width: 8, height: 8, borderRadius: '50%', background: statusStyle.dot, pointerEvents: 'none',
                      }} />
                      <select
                        value={unit.status}
                        onChange={e => handleStatusChange(unit.id, e.target.value)}
                        className="gfh-unit-input"
                        style={{
                          width: '100%', padding: '7px 10px 7px 24px', fontSize: 12,
                          fontWeight: 700, color: '#0F172A', background: '#FFFFFF', cursor: 'pointer',
                        }}
                      >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="BOOKED">BOOKED</option>
                        <option value="OCCUPIED">OCCUPIED</option>
                        <option value="SOLD">SOLD</option>
                      </select>
                    </div>

                    <Link
                      to={`/owner/units/${unit.id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '7px 14px',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        background: '#F8FAFC',
                        color: '#0F8A67',
                        fontSize: 12,
                        fontWeight: 700,
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                        transition: 'background 0.15s ease, border-color 0.15s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#ECFDF8'
                        e.currentTarget.style.borderColor = '#A7F3DC'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#F8FAFC'
                        e.currentTarget.style.borderColor = '#E2E8F0'
                      }}
                    >
                      <span>Details</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Unit Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16,
        }}>
          <div style={{
            width: '100%', maxWidth: 520, padding: '28px 32px',
            backgroundColor: '#FFFFFF', borderRadius: 16,
            boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.22)',
            border: '1px solid #E2E8F0',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Add New Unit
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                  Property
                </label>
                <select
                  value={formData.property_id}
                  onChange={e => setFormData({ ...formData, property_id: e.target.value })}
                  required
                  className="gfh-unit-input"
                  style={{ width: '100%', padding: '9px 12px', background: '#FFFFFF' }}
                >
                  <option value="">Select Property</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                    Unit Number
                  </label>
                  <input
                    value={formData.number}
                    onChange={e => setFormData({ ...formData, number: e.target.value })}
                    required
                    placeholder="e.g. 101"
                    className="gfh-unit-input"
                    style={{ width: '100%', padding: '9px 12px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                    Floor
                  </label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={e => setFormData({ ...formData, floor: parseInt(e.target.value) || 1 })}
                    required
                    className="gfh-unit-input"
                    style={{ width: '100%', padding: '9px 12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    required
                    className="gfh-unit-input"
                    style={{ width: '100%', padding: '9px 12px', background: '#FFFFFF' }}
                  >
                    <option value="apartment">Apartment</option>
                    <option value="shop">Shop</option>
                    <option value="office">Office</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                    Price (AED)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    required
                    placeholder="e.g. 85000"
                    className="gfh-unit-input"
                    style={{ width: '100%', padding: '9px 12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                    Size (sq ft)
                  </label>
                  <input
                    type="number"
                    value={formData.size}
                    onChange={e => setFormData({ ...formData, size: e.target.value })}
                    required
                    placeholder="e.g. 1200"
                    className="gfh-unit-input"
                    style={{ width: '100%', padding: '9px 12px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="gfh-unit-input"
                    style={{ width: '100%', padding: '9px 12px', background: '#FFFFFF' }}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="BOOKED">BOOKED</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="SOLD">SOLD</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '9px 18px', borderRadius: 8, border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC', color: '#475569', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 20px', borderRadius: 8, border: 'none',
                    background: '#0F8A67', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(15, 138, 103, 0.25)',
                  }}
                >
                  Save Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
