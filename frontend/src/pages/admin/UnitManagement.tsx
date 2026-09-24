import { useEffect, useState, useMemo } from 'react'
import api from '../../api/axios'
import BookingForm from './BookingForm'
import { THEME, portalPageCss, Icon, ICONS } from '../../components/gfh/adminTheme'

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
  monthly_service_charge?: number | string
  quarterly_service_charge?: number | string
  yearly_service_charge?: number | string
  status: 'AVAILABLE' | 'BOOKED' | 'OCCUPIED' | 'SOLD'
  property?: { id: number, name: string }
  owner?: { id: number, name: string }
}

interface Property {
  id: number
  name: string
}

export default function UnitManagement() {
  const [units, setUnits] = useState<Unit[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  const [entriesPerPage, setEntriesPerPage] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    property_id: '', number: '', dhewa_no: '', category: '', floor: 1,
    type: 'apartment', size: '', furnished: false, price: '', monthly_service_charge: '', status: 'AVAILABLE',
  })

  const [bookingUnit, setBookingUnit] = useState<Unit | null>(null)

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    fetchUnits()
  }, [selectedPropertyId, statusFilter])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, entriesPerPage, selectedPropertyId, statusFilter])

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
        type: 'apartment', size: '', furnished: false, price: '', monthly_service_charge: '', status: 'AVAILABLE',
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

  const getStatusColor = (status: string): { bg: string; color: string; border: string; dot: string } => {
    switch(status) {
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

  // Filter units by search term client-side
  const filteredUnits = useMemo(() => {
    if (!searchTerm.trim()) return units
    const q = searchTerm.toLowerCase()
    return units.filter(u =>
      (u.number && u.number.toLowerCase().includes(q)) ||
      (u.property?.name && u.property.name.toLowerCase().includes(q)) ||
      (u.type && u.type.toLowerCase().includes(q)) ||
      (u.status && u.status.toLowerCase().includes(q)) ||
      (u.dhewa_no && u.dhewa_no.toLowerCase().includes(q))
    )
  }, [units, searchTerm])

  const totalPages = Math.ceil(filteredUnits.length / entriesPerPage) || 1
  const paginatedUnits = filteredUnits.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)

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
        .gfh-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .gfh-table th {
          background-color: #F8FAFC;
          color: #64748B;
          font-weight: 600;
          font-size: 13px;
          padding: 12px 16px;
          border-bottom: 1px solid #E2E8F0;
        }
        .gfh-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #E2E8F0;
          font-size: 14px;
          color: #334155;
          vertical-align: middle;
        }
        .gfh-table tr:hover {
          background-color: #F8FAFC;
        }
        .gfh-pagination-btn {
          padding: 6px 12px;
          border: 1px solid #E2E8F0;
          background: #FFF;
          color: #334155;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .gfh-pagination-btn:hover:not(:disabled) {
          background: #F1F5F9;
        }
        .gfh-pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .gfh-pagination-btn.active {
          background: #0F8A67;
          color: #FFF;
          border-color: #0F8A67;
        }
      `}</style>

      {/* Main Single Card Container matching media_1788452569528.png */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid #E2E8F0',
        padding: '24px 28px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
      }}>
        {/* Top Header Row with Title, Search, Filters, and Add Unit Button */}
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
              List Of Units
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

            {/* Properties Dropdown */}
            <select
              value={selectedPropertyId}
              onChange={e => setSelectedPropertyId(e.target.value)}
              className="gfh-unit-input"
              style={{
                padding: '9px 30px 9px 14px',
                background: '#FFFFFF',
                color: '#334155',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <option value="">All Properties</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="gfh-unit-input"
              style={{
                padding: '9px 30px 9px 14px',
                background: '#FFFFFF',
                color: '#334155',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="BOOKED">Booked</option>
              <option value="SOLD">Sold</option>
            </select>

            {/* Add Unit Button */}
            <button
              onClick={() => setIsModalOpen(true)}
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
                transition: 'background 0.15s ease',
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

        {/* 5 Rounded Metric Stat Cards Row (Exact Match to Image) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 14,
          marginTop: 24,
          marginBottom: 26,
        }}>
          {/* Card 1: Total Units */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #F1F5F9',
            borderRadius: 14,
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#ECFDF8',
              color: '#0F8A67',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
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
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #F1F5F9',
            borderRadius: 14,
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
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
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #F1F5F9',
            borderRadius: 14,
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#ECFDF8',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
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
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #F1F5F9',
            borderRadius: 14,
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#FFF7ED',
              color: '#EA580C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
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
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #F1F5F9',
            borderRadius: 14,
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#FAF5FF',
              color: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
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

        {/* Entries Dropdown */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#64748B' }}>
            Show 
            <select
              value={entriesPerPage}
              onChange={e => setEntriesPerPage(Number(e.target.value))}
              className="gfh-unit-input"
              style={{ padding: '4px 8px', width: '60px' }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            entries
          </div>
        </div>

        {/* Units Table */}
        <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
          <table className="gfh-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Number</th>
                <th>Type</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    Loading units...
                  </td>
                </tr>
              ) : paginatedUnits.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    No units found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedUnits.map(unit => {
                  const statusStyle = getStatusColor(unit.status)
                  return (
                    <tr key={unit.id}>
                      <td style={{ fontWeight: 600, color: '#0F172A' }}>{unit.property?.name || 'N/A'}</td>
                      <td>{unit.number}</td>
                      <td>
                        {unit.type ? unit.type.charAt(0).toUpperCase() + unit.type.slice(1) : '1BR'} {unit.floor ? `(Floor ${unit.floor})` : ''}
                      </td>
                      <td>{unit.owner?.name || 'N/A'}</td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          border: `1px solid ${statusStyle.border}`,
                          fontSize: '12px',
                          fontWeight: 600,
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusStyle.dot }} />
                          {unit.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <select
                            value={unit.status}
                            onChange={e => handleStatusChange(unit.id, e.target.value)}
                            className="gfh-unit-input"
                            style={{
                              padding: '6px 8px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#0F172A',
                              background: '#FFFFFF',
                              cursor: 'pointer',
                              width: '110px'
                            }}
                          >
                            <option value="AVAILABLE">AVAILABLE</option>
                            <option value="BOOKED">BOOKED</option>
                            <option value="OCCUPIED">OCCUPIED</option>
                            <option value="SOLD">SOLD</option>
                          </select>

                          {unit.status === 'AVAILABLE' && (
                            <button
                              onClick={() => setBookingUnit(unit)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                background: '#0F8A67',
                                color: '#FFFFFF',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Book
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(unit.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              border: '1px solid #FECACA',
                              background: '#FEF2F2',
                              color: '#DC2626',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#FEE2E2'
                              e.currentTarget.style.borderColor = '#F87171'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = '#FEF2F2'
                              e.currentTarget.style.borderColor = '#FECACA'
                            }}
                            title="Delete Unit"
                            aria-label={`Delete unit ${unit.number}`}
                          >
                            <Icon path={ICONS.trash} size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!isLoading && filteredUnits.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <div style={{ fontSize: '14px', color: '#64748B' }}>
              Showing {(currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, filteredUnits.length)} of {filteredUnits.length} entries
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className="gfh-pagination-btn" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`gfh-pagination-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button 
                className="gfh-pagination-btn" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modern Rounded Modal for Add Unit */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          padding: 16,
        }}>
          <div style={{
            width: '100%',
            maxWidth: 520,
            padding: '28px 32px',
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
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
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
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

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span>Monthly Service Charge (AED)</span>
                  {Number(formData.monthly_service_charge) > 0 && (
                    <span style={{ color: '#0F8A67', fontWeight: 600 }}>
                      Quarterly: AED {(Number(formData.monthly_service_charge) * 3).toLocaleString()} | Yearly: AED {(Number(formData.monthly_service_charge) * 12).toLocaleString()}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monthly_service_charge}
                  onChange={e => setFormData({ ...formData, monthly_service_charge: e.target.value })}
                  placeholder="e.g. 250"
                  className="gfh-unit-input"
                  style={{ width: '100%', padding: '9px 12px' }}
                />
                <span style={{ fontSize: 11, color: '#64748B', marginTop: 4, display: 'block' }}>
                  Calculation rule: Monthly × 3 = Quarterly | Monthly × 12 = Yearly
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#0F8A67',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer',
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
