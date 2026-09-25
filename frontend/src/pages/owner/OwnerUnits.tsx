import React, { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import { Icon, portalPageCss } from '../../components/gfh/adminTheme'

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
  monthly_service_charge?: number | string
  quarterly_service_charge?: number | string
  yearly_service_charge?: number | string
  status: 'AVAILABLE' | 'BOOKED' | 'OCCUPIED' | 'SOLD'
  property?: { id: number; name: string }
  propertyName?: string
}

interface Property {
  id: number
  name: string
}

const icons = {
  plus: 'M12 5v14M5 12h14',
  edit: 'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z',
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

export default function OwnerUnits() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const { user } = useAuthStore()
  const basePath = location.pathname.startsWith('/cashier')
    ? '/cashier'
    : location.pathname.startsWith('/accountant')
      ? '/accountant'
      : '/owner'
  const isCashier = user?.role === 'cashier'

  const [units, setUnits] = useState<Unit[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [propertyFilter, setPropertyFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState(() => (searchParams.get('status') || '').toUpperCase())
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [statusMsg, setStatusMsg] = useState('')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)

  const [formData, setFormData] = useState({
    property_id: '',
    number: '',
    dhewa_no: '',
    category: '',
    floor: 1,
    type: 'apartment',
    size: '',
    furnished: false,
    price: '',
    monthly_service_charge: '',
    status: 'AVAILABLE',
  })

  useEffect(() => {
    const statusFromUrl = (searchParams.get('status') || '').toUpperCase()
    setStatusFilter(statusFromUrl)
  }, [searchParams])

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    fetchUnits()
  }, [propertyFilter, statusFilter])

  const fetchProperties = async () => {
    try {
      const res = await api.get('/owner/properties')
      const props = res.data?.data?.properties || res.data?.data || []
      setProperties(Array.isArray(props) ? props : [])
      if (Array.isArray(props) && props.length > 0 && !formData.property_id) {
        setFormData(prev => ({ ...prev, property_id: String(props[0].id) }))
      }
    } catch (err) {
      console.error('Error fetching properties', err)
    }
  }

  const fetchUnits = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (propertyFilter) params.append('property_id', propertyFilter)
      if (statusFilter) params.append('status', statusFilter)
      const res = await api.get(`/owner/units?${params.toString()}`)
      const unitList = res.data?.data?.units || res.data?.data || []
      setUnits(Array.isArray(unitList) ? unitList : [])
    } catch (err) {
      console.error('Error fetching units', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getPropertyName = (unit: Unit) => {
    if (unit.property?.name) return unit.property.name
    if (unit.propertyName) return unit.propertyName
    const found = properties.find(p => p.id === unit.property_id)
    return found ? found.name : `Property #${unit.property_id}`
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

  const openCreate = () => {
    setEditingUnit(null)
    setFormData({
      property_id: properties.length > 0 ? String(properties[0].id) : '',
      number: '',
      dhewa_no: '',
      category: '',
      floor: 1,
      type: 'apartment',
      size: '',
      furnished: false,
      price: '',
      monthly_service_charge: '',
      status: 'AVAILABLE',
    })
    setIsModalOpen(true)
  }

  const openEdit = (unit: Unit) => {
    setEditingUnit(unit)
    setFormData({
      property_id: String(unit.property_id),
      number: unit.number,
      dhewa_no: unit.dhewa_no || '',
      category: unit.category || '',
      floor: unit.floor || 1,
      type: unit.type || 'apartment',
      size: String(unit.size || ''),
      furnished: Boolean(unit.furnished),
      price: String(unit.price || ''),
      monthly_service_charge: unit.monthly_service_charge ? String(unit.monthly_service_charge) : '',
      status: unit.status || 'AVAILABLE',
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingUnit(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        property_id: Number(formData.property_id),
        number: formData.number,
        dhewa_no: formData.dhewa_no || null,
        category: formData.category || null,
        floor: Number(formData.floor) || 1,
        type: formData.type,
        size: Number(formData.size) || 0,
        furnished: Boolean(formData.furnished),
        price: Number(formData.price) || 0,
        monthly_service_charge: formData.monthly_service_charge ? Number(formData.monthly_service_charge) : 0,
        status: formData.status || 'AVAILABLE',
      }

      if (editingUnit) {
        await api.put(`/owner/units/${editingUnit.id}`, payload)
        setStatusMsg('Unit updated successfully!')
      } else {
        await api.post('/owner/units', payload)
        setStatusMsg('Unit created successfully!')
      }
      closeModal()
      fetchUnits()
    } catch (err: any) {
      alert(err.response?.data?.message || `Error ${editingUnit ? 'updating' : 'creating'} unit`)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      try {
        await api.delete(`/owner/units/${id}`)
        setStatusMsg('Unit deleted successfully!')
        fetchUnits()
      } catch (err: any) {
        alert(err.response?.data?.message || 'Error deleting unit')
      }
    }
  }

  const filteredUnits = useMemo(() => {
    if (!searchTerm.trim()) return units
    const q = searchTerm.toLowerCase()
    return units.filter(u =>
      (u.number && u.number.toLowerCase().includes(q)) ||
      (u.type && u.type.toLowerCase().includes(q)) ||
      (u.category && u.category.toLowerCase().includes(q)) ||
      getPropertyName(u).toLowerCase().includes(q)
    )
  }, [units, searchTerm, properties])

  const indexOfLastEntry = currentPage * entriesPerPage
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage
  const currentEntries = filteredUnits.slice(indexOfFirstEntry, indexOfLastEntry)
  const totalPages = Math.ceil(filteredUnits.length / entriesPerPage) || 1

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, propertyFilter, statusFilter, entriesPerPage])

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
          border-radius: 6px !important;
          outline: none !important;
          background: #FFFFFF !important;
          color: #0F172A !important;
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
          border-radius: 6px !important;
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
        .gfh-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .gfh-table th {
          background: #F8FAFC;
          color: #334155;
          font-weight: 700;
          font-size: 13px;
          text-align: left;
          padding: 12px 16px;
          border-bottom: 2px solid #E2E8F0;
          white-space: nowrap;
        }
        .gfh-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #E2E8F0;
          color: #0F172A;
          font-size: 13.5px;
          vertical-align: middle;
        }
        .gfh-table tbody tr {
          transition: background 0.15s ease;
        }
        .gfh-table tbody tr:nth-child(even) {
          background: #F8FAFC;
        }
        .gfh-table tbody tr:hover {
          background: #F0FDF8;
        }
        .gfh-property-name-cell {
          color: #0F8A67;
          font-weight: 700;
          text-decoration: none;
        }
        .gfh-property-name-cell:hover {
          text-decoration: underline;
        }
        .gfh-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .gfh-action-btn.edit {
          background: #D1FAE5;
          color: #059669;
        }
        .gfh-action-btn.edit:hover { background: #A7F3D0; }
        .gfh-action-btn.delete {
          background: #FEE2E2;
          color: #DC2626;
        }
        .gfh-action-btn.delete:hover { background: #FECACA; }
        
        .gfh-pagination {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
          margin-top: 20px;
        }
        .gfh-page-btn {
          padding: 6px 12px;
          border: 1px solid #E2E8F0;
          background: #FFFFFF;
          color: #334155;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .gfh-page-btn:hover:not(:disabled) {
          background: #F8FAFC;
          border-color: #CBD5E1;
        }
        .gfh-page-btn.active {
          background: #0F8A67;
          color: #FFFFFF;
          border-color: #0F8A67;
        }
        .gfh-page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <div style={{
        background: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E2E8F0',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
      }}>
        {/* Header section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
        }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: 0 }}>Units</h2>
            <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>List Of Units</p>
          </div>
          {!isCashier && (
            <button type="button" className="gfh-add-prop-btn" onClick={openCreate}>
              <Icon path={icons.plus} size={16} /> Add Unit
            </button>
          )}
        </div>

        {/* Filters and Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: '#334155' }}>
            Show
            <select
              value={entriesPerPage}
              onChange={e => setEntriesPerPage(Number(e.target.value))}
              className="gfh-prop-input"
              style={{ padding: '6px 12px', width: 70, cursor: 'pointer' }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            entries
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: '#334155' }}>
              Search:
              <div style={{ position: 'relative', width: 200 }}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="gfh-prop-input"
                  style={{ width: '100%', padding: '6px 12px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <select
              value={propertyFilter}
              onChange={e => setPropertyFilter(e.target.value)}
              className="gfh-prop-input"
              style={{ padding: '6px 12px', width: 170, cursor: 'pointer' }}
            >
              <option value="">All Properties</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="gfh-prop-input"
              style={{ padding: '6px 12px', width: 155, cursor: 'pointer' }}
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="BOOKED">Under Maintenance</option>
              <option value="SOLD">Sold</option>
            </select>
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
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="gfh-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Number</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center', width: 160 }}>Contract</th>
                  {!isCashier && <th style={{ textAlign: 'center', width: 100 }}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {currentEntries.length === 0 ? (
                  <tr>
                    <td colSpan={isCashier ? 5 : 6} style={{ textAlign: 'center', color: '#64748B', padding: '30px' }}>
                      {units.length === 0 ? 'No units found.' : 'No units match your filter.'}
                    </td>
                  </tr>
                ) : (
                  currentEntries.map(unit => {
                    const statusStyle = getStatusColor(unit.status)
                    return (
                      <tr key={unit.id}>
                        <td>
                          <Link to={`${basePath}/units/${unit.id}`} className="gfh-property-name-cell">
                            {getPropertyName(unit)}
                          </Link>
                        </td>
                        <td>
                          <strong>{unit.number}</strong>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>
                          {unit.type || 'apartment'}
                          {unit.floor ? ` (Floor ${unit.floor})` : ''}
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 9px', borderRadius: 999,
                            background: statusStyle.bg, color: statusStyle.color,
                            border: `1px solid ${statusStyle.border}`,
                            fontSize: 11, fontWeight: 700, letterSpacing: '0.3px',
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            whiteSpace: 'nowrap',
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusStyle.dot }} />
                            {unit.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {unit.status === 'AVAILABLE' ? (
                            <Link
                              to={`${basePath}/contracts?create=1&unit_id=${unit.id}&property_id=${unit.property_id}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 5,
                                height: 28,
                                padding: '0 12px',
                                borderRadius: 6,
                                background: '#ECFDF5',
                                color: '#059669',
                                border: '1px solid #A7F3D0',
                                fontSize: 12,
                                fontWeight: 600,
                                textDecoration: 'none',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = '#0F8A67'
                                e.currentTarget.style.color = '#FFFFFF'
                                e.currentTarget.style.borderColor = '#0F8A67'
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = '#ECFDF5'
                                e.currentTarget.style.color = '#059669'
                                e.currentTarget.style.borderColor = '#A7F3D0'
                              }}
                            >
                              <Icon path={icons.plus} size={12} />
                              <span>Create Contract</span>
                            </Link>
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: 13 }}>—</span>
                          )}
                        </td>
                        {!isCashier && (
                          <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                              <button
                                type="button"
                                onClick={() => openEdit(unit)}
                                aria-label={`Edit unit ${unit.number}`}
                                className="gfh-action-btn edit"
                                title="Edit"
                              >
                                <Icon path={icons.edit} size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(unit.id)}
                                aria-label={`Delete unit ${unit.number}`}
                                className="gfh-action-btn delete"
                                title="Delete"
                              >
                                <Icon path={icons.trash} size={14} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredUnits.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <div style={{ fontSize: 13.5, color: '#64748B' }}>
              Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredUnits.length)} of {filteredUnits.length} entries
            </div>
            <div className="gfh-pagination">
              <button 
                className="gfh-page-btn" 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  className={`gfh-page-btn ${currentPage === number ? 'active' : ''}`}
                  onClick={() => paginate(number)}
                >
                  {number}
                </button>
              ))}

              <button 
                className="gfh-page-btn" 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Unit Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          animation: 'gfhOverlayFade 0.2s ease',
        }}>
          <div style={{
            position: 'relative', width: 520, maxWidth: '92vw', maxHeight: '90vh', overflowY: 'auto',
            background: '#ffffff', borderRadius: 16, padding: 28, border: '1px solid #E2E8F0',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
            animation: 'gfhModalPop 0.25s cubic-bezier(.2,.8,.2,1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {editingUnit ? 'Edit Unit' : 'Add New Unit'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Property</label>
                <select
                  style={inputStyle}
                  value={formData.property_id}
                  onChange={e => setFormData({ ...formData, property_id: e.target.value })}
                  required
                >
                  <option value="">Select Property</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Unit Number</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. 101-A"
                    value={formData.number}
                    onChange={e => setFormData({ ...formData, number: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Floor</label>
                  <input
                    type="number"
                    style={inputStyle}
                    value={formData.floor}
                    onChange={e => setFormData({ ...formData, floor: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Unit Type</label>
                  <select
                    style={inputStyle}
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="apartment">Apartment</option>
                    <option value="office">Office</option>
                    <option value="shop">Shop</option>
                    <option value="warehouse">Warehouse</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select
                    style={inputStyle}
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="BOOKED">BOOKED</option>
                    <option value="SOLD">SOLD</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Size (Sq.Ft)</label>
                  <input
                    type="number"
                    style={inputStyle}
                    placeholder="e.g. 1200"
                    value={formData.size}
                    onChange={e => setFormData({ ...formData, size: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Rent / Price (AED)</label>
                  <input
                    type="number"
                    style={inputStyle}
                    placeholder="e.g. 85000"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Monthly Service Charge (AED)</label>
                <input
                  type="number"
                  step="0.01"
                  style={inputStyle}
                  placeholder="e.g. 250.00"
                  value={formData.monthly_service_charge}
                  onChange={e => setFormData({ ...formData, monthly_service_charge: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '9px 18px', background: '#F1F5F9', border: '1px solid #CBD5E1',
                    color: '#334155', borderRadius: 8, fontWeight: 700, fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  <Icon path={icons.close} size={14} />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="gfh-add-prop-btn"
                >
                  <Icon path={icons.check} size={15} />
                  <span>{editingUnit ? 'Update Unit' : 'Save Unit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
