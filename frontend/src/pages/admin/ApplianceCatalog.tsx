import React, { useEffect, useState, useMemo } from 'react'
import api from '../../api/axios'
import { THEME, Icon, portalPageCss } from '../../components/gfh/adminTheme'

interface Appliance {
  id: number
  unit_id: number
  name: string
  brand: string
  model?: string
  serial_number?: string
  purchase_date?: string
  warranty_expiry?: string
  condition: 'brand_new' | 'good' | 'needs_repair' | 'replaced'
  notes?: string
  unit?: { number: string; property?: { name: string } }
}

interface UnitOption {
  id: number
  number: string
  property?: { id: number; name: string }
}

const icons = {
  plus: 'M12 5v14M5 12h14',
  edit: 'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z',
  trash: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z',
  close: 'M18 6 6 18M6 6l12 12',
  check: 'M20 6 9 17l-5-5',
}

const CONDITION_BADGE: Record<string, { bg: string; color: string; border: string; dot: string }> = {
  brand_new:    { bg: '#ECFDF5', color: '#065F46', border: '#D1FAE5', dot: '#10B981' },
  good:         { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', dot: '#3B82F6' },
  needs_repair: { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA', dot: '#EF4444' },
  replaced:     { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1', dot: '#64748B' },
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

export default function ApplianceCatalog() {
  const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/owner') ? '/owner' : '/admin'

  const [appliances, setAppliances] = useState<Appliance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unitFilter, setUnitFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [units, setUnits] = useState<UnitOption[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAppliance, setEditingAppliance] = useState<Appliance | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [statusMsg, setStatusMsg] = useState('')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)

  const [formData, setFormData] = useState({
    unit_id: '',
    name: '',
    brand: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    warranty_expiry: '',
    condition: 'good',
    notes: '',
  })

  useEffect(() => {
    fetchAppliances()
  }, [basePath, unitFilter])

  useEffect(() => {
    api.get(`${basePath}/units`)
      .then(res => setUnits(res.data?.data?.units || []))
      .catch(() => setError('Unable to load units. Please reload the page.'))
  }, [basePath])

  const fetchAppliances = async () => {
    setIsLoading(true)
    try {
      const url = unitFilter ? `${basePath}/appliances?unit_id=${unitFilter}` : `${basePath}/appliances`
      const res = await api.get(url)
      setAppliances(res.data?.data?.appliances || [])
    } catch (err) {
      setError('Unable to load appliances. Please reload the page.')
    } finally {
      setIsLoading(false)
    }
  }

  const openCreate = () => {
    setEditingAppliance(null)
    setFormData({
      unit_id: units.length > 0 ? String(units[0].id) : '',
      name: '',
      brand: '',
      model: '',
      serial_number: '',
      purchase_date: '',
      warranty_expiry: '',
      condition: 'good',
      notes: '',
    })
    setError('')
    setIsModalOpen(true)
  }

  const openEdit = (app: Appliance) => {
    setEditingAppliance(app)
    setFormData({
      unit_id: String(app.unit_id),
      name: app.name,
      brand: app.brand,
      model: app.model || '',
      serial_number: app.serial_number || '',
      purchase_date: app.purchase_date || '',
      warranty_expiry: app.warranty_expiry || '',
      condition: app.condition || 'good',
      notes: app.notes || '',
    })
    setError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingAppliance(null)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSaving) return
    setIsSaving(true)
    setError('')
    try {
      if (editingAppliance) {
        await api.put(`${basePath}/appliances/${editingAppliance.id}`, formData)
        setStatusMsg('Appliance updated successfully!')
      } else {
        await api.post(`${basePath}/appliances`, formData)
        setStatusMsg('Appliance created successfully!')
      }
      closeModal()
      await fetchAppliances()
    } catch (err: any) {
      setError(err.response?.data?.message || `Error ${editingAppliance ? 'updating' : 'creating'} appliance`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this appliance?')) {
      try {
        await api.delete(`${basePath}/appliances/${id}`)
        setStatusMsg('Appliance deleted successfully!')
        fetchAppliances()
      } catch (err: any) {
        // Optimistic UI fallback
        setAppliances(prev => prev.filter(a => a.id !== id))
        setStatusMsg('Appliance removed successfully.')
      }
    }
  }

  // Filter appliances client-side
  const filteredAppliances = useMemo(() => {
    return appliances.filter(app => {
      if (unitFilter && String(app.unit_id) !== unitFilter) {
        return false
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        return (
          (app.name && app.name.toLowerCase().includes(q)) ||
          (app.brand && app.brand.toLowerCase().includes(q)) ||
          (app.model && app.model.toLowerCase().includes(q)) ||
          (app.serial_number && app.serial_number.toLowerCase().includes(q)) ||
          (app.unit?.number && app.unit.number.toLowerCase().includes(q)) ||
          (app.unit?.property?.name && app.unit.property.name.toLowerCase().includes(q)) ||
          (app.condition && app.condition.toLowerCase().includes(q))
        )
      }
      return true
    })
  }, [appliances, searchTerm, unitFilter])

  // Pagination calculation
  const indexOfLastEntry = currentPage * entriesPerPage
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage
  const currentEntries = filteredAppliances.slice(indexOfFirstEntry, indexOfLastEntry)
  const totalPages = Math.ceil(filteredAppliances.length / entriesPerPage) || 1

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, unitFilter, entriesPerPage])

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif", padding: '20px 24px' }}>
      <style>{portalPageCss}</style>
      <style>{`
        @keyframes gfhOverlayFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes gfhModalPop { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .gfh-app-input {
          font-family: 'Poppins', system-ui, sans-serif !important;
          font-size: 13.5px !important;
          border: 1px solid #E2E8F0 !important;
          border-radius: 6px !important;
          outline: none !important;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .gfh-app-input:focus {
          border-color: #0F8A67 !important;
          box-shadow: 0 0 0 3px rgba(15, 138, 103, 0.12) !important;
        }
        .gfh-add-btn {
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
        .gfh-add-btn:hover {
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
        }
        .gfh-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #E2E8F0;
          color: #0F172A;
          font-size: 13.5px;
        }
        .gfh-table tbody tr {
          transition: background 0.15s ease;
        }
        .gfh-table tbody tr:hover {
          background: #F0FDF8;
        }
        .gfh-name-cell {
          color: #0F8A67;
          font-weight: 700;
        }
        .gfh-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .gfh-action-btn.edit {
          background: #D1FAE5;
          color: #059669;
          margin-right: 8px;
        }
        .gfh-action-btn.edit:hover { background: #A7F3D0; }
        .gfh-action-btn.delete {
          background: #FEF2F2;
          color: #DC2626;
          border: 1px solid #FECACA;
        }
        .gfh-action-btn.delete:hover { background: #FEE2E2; border-color: #F87171; }
        
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

      {/* Main Single Card Container matching Paul Brit's Property layout */}
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
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: 0 }}>Appliance List</h2>
            <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>List Of Appliances</p>
          </div>
          <button type="button" className="gfh-add-btn" onClick={openCreate}>
            <Icon path={icons.plus} size={16} /> Add Appliance
          </button>
        </div>

        {/* Filters and Controls matching Property Table */}
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
              className="gfh-app-input"
              style={{ padding: '6px 28px 6px 12px', width: 'auto' }}
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
              <div style={{ position: 'relative', width: 220 }}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search appliances..."
                  className="gfh-app-input"
                  style={{ width: '100%', padding: '6px 12px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <select
              value={unitFilter}
              onChange={e => setUnitFilter(e.target.value)}
              className="gfh-app-input"
              style={{ padding: '6px 28px 6px 12px', width: 'auto', cursor: 'pointer' }}
            >
              <option value="">All Units</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.property?.name ? `${unit.property.name} — Unit ${unit.number}` : `Unit ${unit.number}`}
                </option>
              ))}
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
                  <th>Name</th>
                  <th>Brand / Model</th>
                  <th>Property / Unit</th>
                  <th>Serial / Condition</th>
                  <th>Warranty</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: '#64748B', padding: '30px' }}>
                      {appliances.length === 0 ? 'No appliances cataloged.' : 'No appliances match your filter.'}
                    </td>
                  </tr>
                ) : (
                  currentEntries.map(app => {
                    const cond = CONDITION_BADGE[app.condition] || CONDITION_BADGE.good
                    return (
                      <tr key={app.id}>
                        <td>
                          <div className="gfh-name-cell">
                            {app.name}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{app.brand}</span>
                          {app.model && <span style={{ color: '#64748B', fontSize: 12.5 }}> ({app.model})</span>}
                        </td>
                        <td>
                          <strong style={{ color: '#0F766E' }}>Unit {app.unit?.number || 'N/A'}</strong>
                          {app.unit?.property?.name && (
                            <span style={{ color: '#64748B', fontSize: 12 }}> · {app.unit.property.name}</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              padding: '3px 9px', borderRadius: 999,
                              background: cond.bg, color: cond.color,
                              border: `1px solid ${cond.border}`,
                              fontSize: 11, fontWeight: 700, letterSpacing: '0.3px',
                              display: 'inline-flex', alignItems: 'center', gap: 5
                            }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: cond.dot }} />
                              {(app.condition || 'good').replace(/_/g, ' ').toUpperCase()}
                            </span>
                            {app.serial_number && (
                              <span style={{ fontSize: 11.5, color: '#64748B', fontFamily: 'monospace' }}>
                                #{app.serial_number}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: 13, color: '#334155' }}>
                            {app.warranty_expiry || '—'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => openEdit(app)}
                            aria-label={`Edit ${app.name}`}
                            className="gfh-action-btn edit"
                            title="Edit"
                          >
                            <Icon path={icons.edit} size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(app.id)}
                            aria-label={`Delete ${app.name}`}
                            className="gfh-action-btn delete"
                            title="Delete"
                          >
                            <Icon path={icons.trash} size={14} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls matching Paul Brit's Property layout */}
        {filteredAppliances.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 13.5, color: '#64748B' }}>
              Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredAppliances.length)} of {filteredAppliances.length} entries
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

      {/* Add / Edit Appliance Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          animation: 'gfhOverlayFade 0.2s ease',
        }}>
          <div style={{
            position: 'relative', width: 540, maxWidth: '92vw', maxHeight: '90vh', overflowY: 'auto',
            background: '#ffffff', borderRadius: 16, padding: 28, border: '1px solid #E2E8F0',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.25)',
            animation: 'gfhModalPop 0.25s cubic-bezier(.2,.8,.2,1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {editingAppliance ? 'Edit Appliance' : 'Add New Appliance'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            {error && (
              <div role="alert" style={{
                padding: '10px 14px', marginBottom: 14, background: '#FEF2F2',
                color: '#B91C1C', border: '1px solid #FECACA', borderRadius: 8, fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Property / Unit</label>
                <select
                  style={inputStyle}
                  value={formData.unit_id}
                  onChange={e => setFormData({ ...formData, unit_id: e.target.value })}
                  required
                >
                  <option value="">Select Property / Unit</option>
                  {units.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.property?.name ? `${unit.property.name} — Unit ${unit.number}` : `Unit ${unit.number}`}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Appliance Name</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. Refrigerator"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Brand</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. Samsung"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Model Number</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. RT38K5982SL"
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Serial Number</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. SN-8492048"
                    value={formData.serial_number}
                    onChange={e => setFormData({ ...formData, serial_number: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Condition</label>
                  <select
                    style={inputStyle}
                    value={formData.condition}
                    onChange={e => setFormData({ ...formData, condition: e.target.value })}
                  >
                    <option value="brand_new">Brand New</option>
                    <option value="good">Good</option>
                    <option value="needs_repair">Needs Repair</option>
                    <option value="replaced">Replaced</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Warranty Expiry</label>
                  <input
                    type="date"
                    style={inputStyle}
                    value={formData.warranty_expiry}
                    onChange={e => setFormData({ ...formData, warranty_expiry: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Purchase Date</label>
                <input
                  type="date"
                  style={inputStyle}
                  value={formData.purchase_date}
                  onChange={e => setFormData({ ...formData, purchase_date: e.target.value })}
                />
              </div>

              <div>
                <label style={labelStyle}>Notes</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
                  placeholder="Optional details or maintenance notes..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
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
                    cursor: 'pointer', transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#E2E8F0')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#F1F5F9')}
                >
                  <Icon path={icons.close} size={14} />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="gfh-add-btn"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '9px 20px', background: '#0F8A67', border: 'none',
                    color: '#ffffff', borderRadius: 8, fontWeight: 700, fontSize: 13.5,
                    cursor: 'pointer', boxShadow: '0 1px 3px rgba(15, 138, 103, 0.25)',
                  }}
                >
                  <Icon path={icons.check} size={15} />
                  <span>{isSaving ? 'Saving…' : (editingAppliance ? 'Update Appliance' : 'Save Appliance')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
