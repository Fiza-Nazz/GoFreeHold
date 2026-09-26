import React, { useEffect, useState, useMemo } from 'react'
import api from '../../api/axios'
import { THEME, Icon, ICONS, portalPageCss } from '../../components/gfh/adminTheme'

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

interface Unit {
  id: number
  property_id: number
  number: string
  category?: string | null
  type?: string | null
  floor?: number | null
  size?: number | string | null
  price?: number | string | null
  status: 'AVAILABLE' | 'BOOKED' | 'OCCUPIED' | 'SOLD'
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

export default function BuildingManagement() {
  const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/owner') ? '/owner' : '/admin'
  const isOwner = basePath === '/owner'

  const [properties, setProperties] = useState<Property[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [unitCounts, setUnitCounts] = useState<Record<number, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [formData, setFormData] = useState({ owner_id: '', name: '', address: '', city: '', type: 'residential' })
  const [statusMsg, setStatusMsg] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [propertyUnits, setPropertyUnits] = useState<Unit[]>([])
  const [isUnitsLoading, setIsUnitsLoading] = useState(false)
  const [unitsError, setUnitsError] = useState('')
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)

  useEffect(() => {
    fetchData()
  }, [basePath])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [bRes, oRes, uRes] = await Promise.all([
        api.get(`${basePath}/properties`),
        api.get(`${basePath}/properties/owners`),
        api.get(`${basePath}/units`)
      ])
      setProperties(bRes.data?.data?.properties || [])
      setOwners(oRes.data?.data?.owners || [])
      const counts = (uRes.data?.data?.units || []).reduce((result: Record<number, number>, unit: Unit) => {
        result[unit.property_id] = (result[unit.property_id] || 0) + 1
        return result
      }, {})
      setUnitCounts(counts)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const openEdit = (property: Property) => {
    setEditingProperty(property)
    setFormData({
      owner_id: String(property.owner_id),
      name: property.name,
      address: property.address,
      city: property.city,
      type: property.type || 'residential',
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProperty(null)
    setFormData({ owner_id: '', name: '', address: '', city: '', type: 'residential' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = isOwner
        ? { name: formData.name, address: formData.address, city: formData.city, type: formData.type }
        : formData
      if (editingProperty) {
        await api.put(`${basePath}/properties/${editingProperty.id}`, payload)
        setStatusMsg('Property updated successfully!')
      } else {
        await api.post(`${basePath}/properties`, payload)
        setStatusMsg('Property created successfully!')
      }
      closeModal()
      await fetchData()
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || `Error ${editingProperty ? 'updating' : 'creating'} property`)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this property?')) {
      try {
        await api.delete(`${basePath}/properties/${id}`)
        fetchData()
      } catch (err: any) {
        alert(err.response?.data?.message || 'Cannot delete property with active units')
      }
    }
  }

  const openProperty = (property: Property) => {
    setSelectedProperty(property)
    setIsUnitsLoading(true)
    setPropertyUnits([])
    setUnitsError('')
  }

  useEffect(() => {
    if (!selectedProperty) return
    const controller = new AbortController()
    api.get(`/admin/units?property_id=${selectedProperty.id}`, { signal: controller.signal })
      .then(response => setPropertyUnits(response.data?.data?.units || []))
      .catch(err => {
        if (!controller.signal.aborted) setUnitsError(err.response?.data?.message || 'Unable to load property units. Please go back and try again.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsUnitsLoading(false)
      })
    return () => controller.abort()
  }, [selectedProperty])

  const isCommercialUnit = (unit: Unit) => {
    const propertyType = selectedProperty?.type?.trim().toLowerCase()
    if (propertyType === 'commercial') return true
    if (propertyType === 'residential') return false

    const descriptor = `${unit.category || ''} ${unit.type || ''}`.toLowerCase()
    return ['commercial', 'shop', 'office', 'retail'].some(value => descriptor.includes(value))
  }

  const residentialUnits = propertyUnits.filter(unit => !isCommercialUnit(unit))
  const commercialUnits = propertyUnits.filter(isCommercialUnit)

  const unitStatusStyle = (status: Unit['status']) => {
    switch (status) {
      case 'AVAILABLE': return { background: '#F0FCF7', border: '#CFF2E4', badge: '#07875D' }
      case 'OCCUPIED': return { background: '#EDF7FF', border: '#CDEAFE', badge: '#0284C7' }
      case 'BOOKED': return { background: '#FFFBEB', border: '#FDE7AA', badge: '#B45309' }
      case 'SOLD': return { background: '#FFF1F2', border: '#FECDD3', badge: '#BE123C' }
      default: return { background: '#F8FAFC', border: '#E2E8F0', badge: '#475569' }
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

  // Pagination calculation
  const indexOfLastEntry = currentPage * entriesPerPage
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage
  const currentEntries = filteredProperties.slice(indexOfFirstEntry, indexOfLastEntry)
  const totalPages = Math.ceil(filteredProperties.length / entriesPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Reset to page 1 when filter/search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, typeFilter, entriesPerPage])

  const renderUnitSection = (title: string, units: Unit[]) => (
    <section className="gfh-property-unit-section" aria-labelledby={`${title.toLowerCase()}-units-heading`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <h3 id={`${title.toLowerCase()}-units-heading`} style={{ margin: 0, color: THEME.ink, fontSize: 16, fontWeight: 800 }}>
          {title}
        </h3>
        <span style={{ background: '#ECFDF5', color: '#065F46', borderRadius: 999, padding: '3px 9px', fontSize: 11, fontWeight: 800 }}>
          {units.length}
        </span>
      </div>
      {units.length === 0 ? (
        <div style={{ border: '1px dashed #CBDDEB', borderRadius: 8, padding: '20px 16px', color: '#64748B', fontSize: 13, fontWeight: 500, textAlign: 'center' }}>
          No {title.toLowerCase()} units in this property.
        </div>
      ) : (
        <div className="gfh-property-unit-grid">
          {units.map(unit => {
            const statusStyle = unitStatusStyle(unit.status)
            return (
              <article key={unit.id} className="gfh-property-unit-card" style={{ background: statusStyle.background, borderColor: statusStyle.border }}>
                <div className="gfh-property-unit-card-heading">
                  <strong>Unit {unit.number}</strong>
                  <span className="gfh-property-unit-status" style={{ background: statusStyle.badge }}>
                    {unit.status}
                  </span>
                </div>
                <div className="gfh-property-unit-card-footer">
                  <span className="gfh-property-unit-rented">
                    <span aria-hidden="true" style={{ display: 'inline-flex', color: unit.status === 'OCCUPIED' ? '#16A34A' : '#94A3B8' }}>
                      <Icon path={unit.status === 'OCCUPIED' ? 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3' : 'M12 8v4m0 4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0'} size={13} />
                    </span>
                    {unit.status === 'OCCUPIED' ? 'Rented' : 'Not Rented'}
                  </span>
                  <span className="gfh-property-unit-rent">
                    Rent: {unit.price !== null && unit.price !== undefined && unit.price !== '' && Number.isFinite(Number(unit.price)) ? `AED ${Number(unit.price).toLocaleString('en-AE')}` : '—'}
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )

  if (selectedProperty) {
    return (
      <div className="gfh-portal-page gfh-property-detail" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <style>{portalPageCss}</style>
        <style>{`
          .gfh-property-detail { padding: 0; }
          .gfh-property-detail-panel { background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; padding: 22px; box-shadow: 0 2px 5px rgba(15,23,42,0.04); }
          .gfh-property-unit-section { margin-top: 26px; }
          .gfh-property-unit-section + .gfh-property-unit-section { margin-top: 32px; }
          .gfh-property-unit-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(min(100%, 210px), 1fr));
            gap: 12px;
          }
          .gfh-property-unit-card {
            display: flex;
            flex-direction: column;
            min-width: 0;
            min-height: 106px;
            color: #0F172A;
            border: 1px solid;
            border-radius: 8px;
            padding: 13px 14px;
            box-shadow: 0 2px 4px rgba(15, 23, 42, 0.04);
            transition: transform 0.15s ease, box-shadow 0.15s ease;
          }
          .gfh-property-unit-card:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
          }
          .gfh-property-unit-card-heading { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
          .gfh-property-unit-card-heading strong { min-width: 0; flex: 1 1 90px; font-size: 14px; line-height: 1.4; overflow-wrap: anywhere; }
          .gfh-property-unit-status { flex: 0 0 auto; color: #FFFFFF; border-radius: 6px; padding: 3px 7px; font-size: 9px; font-weight: 800; line-height: 1.5; }
          .gfh-property-unit-card-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; border-top: 1px solid #DCE8EC; margin-top: auto; padding-top: 16px; font-size: 10.5px; }
          .gfh-property-unit-rented { display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; }
          .gfh-property-unit-rent { overflow-wrap: anywhere; }
          @media (max-width: 600px) {
            .gfh-property-detail-panel { padding: 18px 14px; }
          }
        `}</style>
        <div className="gfh-property-detail-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', paddingBottom: 18, borderBottom: '2px solid #0F8A67' }}>
            <div style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
              <span style={{ display: 'block', color: '#0F8A67', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.7px' }}>
                Selected Property
              </span>
              <h2 style={{ margin: '3px 0 4px', color: '#0F172A', fontSize: 22, fontWeight: 800 }}>{selectedProperty.name}</h2>
              <p style={{ margin: 0, color: '#64748B', fontSize: 13 }}>{selectedProperty.address} · {selectedProperty.city}</p>
            </div>
            <button
              type="button"
              onClick={() => { setSelectedProperty(null); setPropertyUnits([]); setStatusMsg('') }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', color: '#0F8A67', background: '#ECFDF5', border: '1px solid #A7F3D0', fontWeight: 800, cursor: 'pointer' }}
            >
              ← Back to Properties
            </button>
          </div>

          {isUnitsLoading ? (
            <div style={{ textAlign: 'center', padding: 50 }}><span className="spinner" /></div>
          ) : unitsError ? (
            <p role="alert" style={{ marginTop: 24, color: '#991B1B' }}>{unitsError}</p>
          ) : (
            <>
              {renderUnitSection('Residential', residentialUnits)}
              {renderUnitSection('Commercial', commercialUnits)}
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>
      <style>{`
        @keyframes gfhOverlayFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes gfhModalPop { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .gfh-prop-input {
          font-family: 'Inter', system-ui, sans-serif !important;
          font-size: 14px !important;
          border: 1px solid #E2E8F0 !important;
          border-radius: 8px !important;
          outline: none !important;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .gfh-prop-input:focus {
          border-color: #0D5C46 !important;
          box-shadow: 0 0 0 3px rgba(13, 92, 70, 0.12) !important;
        }
        .gfh-add-prop-btn {
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          background: #0D5C46 !important;
          color: #FFFFFF !important;
          border: none !important;
          border-radius: 8px !important;
          padding: 9px 18px !important;
          font-size: 13.5px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          box-shadow: 0 1px 2px rgba(13, 92, 70, 0.18) !important;
          transition: background 0.15s ease, transform 0.15s ease !important;
          font-family: 'Inter', sans-serif !important;
        }
        .gfh-add-prop-btn:hover {
          background: #094635 !important;
          transform: translateY(-1px) !important;
        }
        .gfh-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .gfh-table th {
          background: #F8FAFC;
          color: #64748B;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          text-align: left;
          padding: 12px 16px;
          border-bottom: 1px solid #E2E8F0;
        }
        .gfh-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #F1F5F9;
          color: #0F172A;
          font-size: 14px;
        }
        .gfh-table tbody tr {
          background: #FFFFFF;
          transition: background 0.15s ease;
        }
        .gfh-table tbody tr:hover {
          background: #F8FAFC;
        }
        .gfh-property-name-cell {
          color: #0D5C46;
          font-weight: 700;
          cursor: pointer;
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
          margin-right: 8px;
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
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: 0 }}>Property List</h2>
            <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>List Of Entries</p>
          </div>
          <button type="button" className="gfh-add-prop-btn" onClick={() => { setEditingProperty(null); setFormData({ owner_id: '', name: '', address: '', city: '', type: 'residential' }); setIsModalOpen(true); }}>
            <Icon path={icons.plus} size={16} /> Add Property
          </button>
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
                  className="gfh-prop-input"
                  style={{ width: '100%', padding: '6px 12px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="gfh-prop-input"
              style={{ padding: '6px 28px 6px 12px', width: 'auto', cursor: 'pointer' }}
            >
              <option value="">All Types</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="mixed">Mixed</option>
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
                  <th>Address</th>
                  <th>City</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: '#64748B', padding: '30px' }}>
                      {properties.length === 0 ? 'No properties found.' : 'No properties match your filter.'}
                    </td>
                  </tr>
                ) : (
                  currentEntries.map(property => (
                    <tr key={property.id}>
                      <td>
                        <div className="gfh-property-name-cell" onClick={() => openProperty(property)}>
                          {property.name}
                        </div>
                      </td>
                      <td>{property.address}</td>
                      <td>{property.city || '—'}</td>
                      <td>
                        <span style={{ textTransform: 'capitalize' }}>
                          {property.type || 'residential'}
                        </span>
                        {!isOwner && property.owner?.name && (
                          <span style={{ color: '#64748B' }}> · {property.owner.name}</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                          <button type="button" onClick={() => openEdit(property)} aria-label={`Edit ${property.name}`} className="gfh-action-btn edit" style={{ marginRight: 0 }}>
                            <Icon path={icons.edit} size={14} />
                          </button>
                          <button type="button" onClick={() => handleDelete(property.id)} aria-label={`Delete ${property.name}`} className="gfh-action-btn delete">
                            <Icon path={icons.trash} size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredProperties.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            <div style={{ fontSize: 13.5, color: '#64748B' }}>
              Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredProperties.length)} of {filteredProperties.length} entries
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

      {/* Edit Property Modal */}
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
              {editingProperty ? 'Edit Property' : 'Add New Property'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              {!isOwner && (
                <div>
                  <label style={labelStyle}>Owner</label>
                  <select style={inputStyle} value={formData.owner_id} onChange={e => setFormData({...formData, owner_id: e.target.value})} required={!isOwner}>
                    <option value="">Select Owner</option>
                    {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
              )}
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
                  onClick={closeModal}
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
                  <span>{editingProperty ? 'Update Property' : 'Save Property'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
