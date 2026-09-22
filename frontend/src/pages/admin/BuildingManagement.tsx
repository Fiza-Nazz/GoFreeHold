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
    // A single-use property's saved classification controls its units section.
    // Mixed properties retain the individual unit classifications.
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
      <div className="gfh-portal-page gfh-property-detail" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
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
        .gfh-property-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(235px, 1fr));
          gap: 14px;
        }
        .gfh-property-card {
          overflow: hidden;
          background: #FFFFFF;
          border: 1px solid #DDE7E3;
          border-radius: 11px;
          box-shadow: 0 3px 10px rgba(6, 56, 44, 0.08);
          transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .gfh-property-card:hover {
          transform: translateY(-2px);
          border-color: #7DD3B7;
          box-shadow: 0 8px 18px rgba(6, 56, 44, 0.13);
        }
        .gfh-property-open {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 15px;
          text-align: left;
          background: #FFFFFF;
          border: 0;
          border-radius: 0 !important;
          cursor: pointer;
        }
        .gfh-property-open:hover { background: #F0FDF8; }
        .gfh-property-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          border-radius: 8px;
          color: #FFFFFF;
          background: #0F8A67;
        }
        .gfh-property-name {
          display: block;
          overflow: hidden;
          color: #06382C;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.25;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .gfh-property-city, .gfh-property-address {
          display: block;
          overflow: hidden;
          color: #64748B;
          font-size: 10.5px;
          font-weight: 500;
          line-height: 1.4;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .gfh-property-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 25px;
          height: 25px;
          padding: 0 6px;
          border-radius: 999px;
          color: #065F46;
          background: #D1FAE5;
          font-size: 11px;
          font-weight: 800;
        }
        .gfh-property-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 8px 11px;
          color: #64748B;
          background: #F8FAFC;
          border-top: 1px solid #EEF2F0;
          font-size: 9.5px;
          font-weight: 600;
          text-transform: capitalize;
        }
        .gfh-property-actions > div { display: flex; gap: 5px; }
        .gfh-property-action-edit, .gfh-property-action-delete {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 7px;
          border: 0;
          color: #FFFFFF;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
        }
        .gfh-property-action-edit { background: #0F8A67; }
        .gfh-property-action-delete { background: #DC2626; }
        @media (max-width: 640px) {
          .gfh-property-grid { grid-template-columns: 1fr; }
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
        {/* Property search and type filter */}
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
              {isOwner ? 'Manage your properties and buildings' : 'Manage all properties, buildings and owners'}
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
          <div className="gfh-property-grid">
            {filteredProperties.map(property => (
              <article key={property.id} className="gfh-property-card">
                <button
                  type="button"
                  className="gfh-property-open"
                  onClick={() => openProperty(property)}
                  aria-label={`Open ${property.name} units`}
                >
                  <span className="gfh-property-icon"><Icon path={ICONS.building} size={22} /></span>
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <strong className="gfh-property-name">{property.name}</strong>
                    <span className="gfh-property-city">{property.city || 'City not set'}</span>
                    <span className="gfh-property-address">{property.address}</span>
                  </span>
                  <span className="gfh-property-count">{unitCounts[property.id] || 0}</span>
                </button>
                <div className="gfh-property-actions">
                  <span>{property.type || 'residential'}{!isOwner && property.owner?.name ? ` · ${property.owner.name}` : ''}</span>
                  <div>
                    <button type="button" onClick={() => openEdit(property)} aria-label={`Edit ${property.name}`} className="gfh-property-action-edit">
                      <Icon path={icons.edit} size={12} /> Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(property.id)} aria-label={`Delete ${property.name}`} className="gfh-property-action-delete">
                      <Icon path={icons.trash} size={12} /> Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
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
