import { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import { THEME, ADMIN_COLORS, Icon, ICONS, CornerBrackets, portalPageCss, heroStyle, panelStyle, ghostBtnStyle, thStyle, tdStyle, RADIUS } from '../../components/gfh/adminTheme'
import { safeUpper } from '../../utils/safeLabel'

interface UnitRow {
  id: number
  number: string
  floor: number
  type: string
  status: string
  price: number
  propertyName: string
}

const icons = {
  door: 'M14 3h5v18h-5M14 3L6 4.5v15L14 21M9.5 12h.01',
  check: 'M20 6 9 17l-5-5',
  alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
  x: 'M18 6 6 18M6 6l12 12',
}

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  AVAILABLE: { bg: '#f0fdf4', color: '#065f46', border: '#bbf7d0' },
  OCCUPIED:  { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
  BOOKED:    { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
}

export default function OwnerUnits() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [units, setUnits] = useState<UnitRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const searchQuery = searchParams.get('q') || ''
  const [propertyFilter, setPropertyFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<string>('NUMBER_ASC')

  // Owner Properties for unit creation
  const [ownerProperties, setOwnerProperties] = useState<Array<{ id: number; name: string; address?: string }>>([])
  const [showAddUnitModal, setShowAddUnitModal] = useState(false)
  const [addUnitBusy, setAddUnitBusy] = useState(false)
  const [addUnitError, setAddUnitError] = useState<string | null>(null)
  const [unitForm, setUnitForm] = useState({
    property_id: '',
    number: '',
    floor: '1',
    type: 'apartment',
    size: '850',
    price: '65000',
    dhewa_no: '',
    category: 'Standard',
    furnished: false,
    status: 'AVAILABLE',
  })

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const propsRes = await api.get('/owner/dashboard/properties')
      const properties = propsRes.data?.data?.properties || []
      setOwnerProperties(properties)
      const rows: UnitRow[] = []

      for (const prop of properties) {
        const unitsRes = await api.get(`/owner/dashboard/properties/${prop.id}/units`)
        const list = unitsRes.data?.data?.units || []
        for (const u of list) {
          rows.push({
            id: u.id,
            number: u.number,
            floor: u.floor,
            type: u.type,
            status: u.status,
            price: Number(u.price),
            propertyName: prop.name,
          })
        }
      }

      setUnits(rows)
    } catch (err) {
      console.error(err)
      setError('Failed to load units.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!unitForm.property_id) {
      setAddUnitError('Please select a property.')
      return
    }
    if (!unitForm.number.trim()) {
      setAddUnitError('Please enter unit number.')
      return
    }
    setAddUnitBusy(true)
    setAddUnitError(null)
    try {
      await api.post('/owner/units', {
        property_id: Number(unitForm.property_id),
        number: unitForm.number.trim(),
        floor: Number(unitForm.floor) || 1,
        type: unitForm.type,
        size: Number(unitForm.size) || 0,
        price: Number(unitForm.price) || 0,
        dhewa_no: unitForm.dhewa_no.trim() || null,
        category: unitForm.category.trim() || null,
        furnished: Boolean(unitForm.furnished),
        status: unitForm.status || 'AVAILABLE',
      })
      setShowAddUnitModal(false)
      setUnitForm({
        property_id: ownerProperties[0]?.id ? String(ownerProperties[0].id) : '',
        number: '',
        floor: '1',
        type: 'apartment',
        size: '850',
        price: '65000',
        dhewa_no: '',
        category: 'Standard',
        furnished: false,
        status: 'AVAILABLE',
      })
      await load()
    } catch (err: any) {
      console.error(err)
      setAddUnitError(err.response?.data?.message || 'Failed to create unit. Please try again.')
    } finally {
      setAddUnitBusy(false)
    }
  }

  // Unique properties and types
  const propertyOptions = useMemo(() => {
    return Array.from(new Set(units.map(u => u.propertyName).filter(Boolean)))
  }, [units])

  const typeOptions = useMemo(() => {
    return Array.from(new Set(units.map(u => u.type).filter(Boolean)))
  }, [units])

  // Filtered and sorted units
  const filteredUnits = useMemo(() => {
    return units
      .filter(u => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          const matchNum = (u.number || '').toLowerCase().includes(q)
          const matchProp = (u.propertyName || '').toLowerCase().includes(q)
          const matchType = (u.type || '').toLowerCase().includes(q)
          const matchFloor = String(u.floor || '').includes(q)
          if (!matchNum && !matchProp && !matchType && !matchFloor) return false
        }
        if (propertyFilter !== 'ALL' && u.propertyName !== propertyFilter) return false
        if (statusFilter !== 'ALL' && u.status !== statusFilter) return false
        if (typeFilter !== 'ALL' && (u.type || '').toLowerCase() !== typeFilter.toLowerCase()) return false
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'NUMBER_ASC') return (a.number || '').localeCompare(b.number || '', undefined, { numeric: true })
        if (sortBy === 'PROP_ASC') return (a.propertyName || '').localeCompare(b.propertyName || '')
        if (sortBy === 'PRICE_DESC') return b.price - a.price
        if (sortBy === 'PRICE_ASC') return a.price - b.price
        if (sortBy === 'FLOOR_ASC') return a.floor - b.floor
        return 0
      })
  }, [units, searchQuery, propertyFilter, statusFilter, typeFilter, sortBy])

  const occupied = filteredUnits.filter(u => u.status === 'OCCUPIED').length
  const vacant = filteredUnits.filter(u => u.status === 'AVAILABLE').length

  const hasActiveFilters = Boolean(
    searchQuery.trim() || propertyFilter !== 'ALL' || statusFilter !== 'ALL' || typeFilter !== 'ALL' || sortBy !== 'NUMBER_ASC'
  )

  const clearAllFilters = () => {
    setSearchParams({}, { replace: true })
    setPropertyFilter('ALL')
    setStatusFilter('ALL')
    setTypeFilter('ALL')
    setSortBy('NUMBER_ASC')
  }

  const stats = [
    {
      value: filteredUnits.length,
      label: 'Units Found',
      sub: 'Units',
      icon: icons.door,
      iconBg: '#ECFDF8',
      iconColor: '#0E5E48',
      badgeBg: '#ECFDF8',
      badgeColor: '#065F46',
      badgeBorder: '#A7F3DC',
    },
    {
      value: occupied,
      label: 'Occupied Units',
      sub: 'Occupied',
      icon: icons.check,
      iconBg: '#F0FDF4',
      iconColor: '#0F8A67',
      badgeBg: '#F0FDF4',
      badgeColor: '#065F46',
      badgeBorder: '#BBF7D0',
    },
    {
      value: vacant,
      label: 'Available Units',
      sub: 'Vacant',
      icon: icons.alert,
      iconBg: vacant > 0 ? '#FEF2F2' : '#F0F9FF',
      iconColor: vacant > 0 ? '#DC2626' : '#0284C7',
      badgeBg: vacant > 0 ? '#FEF2F2' : '#F0F9FF',
      badgeColor: vacant > 0 ? '#991B1B' : '#075985',
      badgeBorder: vacant > 0 ? '#FECACA' : '#BAE6FD',
    },
  ]

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, margin: 0 }}>My Units</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
            Search and filter all units across your property portfolio
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              if (ownerProperties.length > 0 && !unitForm.property_id) {
                setUnitForm(f => ({ ...f, property_id: String(ownerProperties[0].id) }))
              }
              setAddUnitError(null)
              setShowAddUnitModal(true)
            }}
            className="gfh-portal-btn"
            style={{
              background: '#0E5E48',
              color: '#FFFFFF',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              padding: '9px 16px',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(14, 94, 72, 0.2)',
            }}
          >
            <Icon path={ICONS.plus} size={15} /> + Add Unit
          </button>
          <Link to="/owner/dashboard" className="gfh-portal-btn" style={{ ...ghostBtnStyle, background: '#0E5E48', borderRadius: 8 }}>
            ← Back to dashboard
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 22 }}>
        {stats.map((card, i) => (
          <div
            key={card.label}
            className="gfh-portal-stat"
            style={{
              background: '#FFFFFF',
              borderRadius: 14,
              padding: '20px 22px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 124,
              animationDelay: `${i * 0.06}s`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: card.iconBg,
                color: card.iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon path={card.icon} size={20} />
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
                background: card.badgeBg,
                color: card.badgeColor,
                border: `1px solid ${card.badgeBorder}`,
                padding: '3px 9px',
                borderRadius: 999,
              }}>
                {card.sub}
              </span>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                {isLoading ? '—' : card.value}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 4 }}>
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div
        className="fade-in"
        style={{
          background: '#FFFFFF',
          borderRadius: 14,
          padding: '16px 20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
          marginBottom: 20,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', flex: 1, minWidth: 280 }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 320 }}>
            <svg
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }}
              width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                const val = e.target.value
                setSearchParams(val ? { q: val } : {}, { replace: true })
              }}
              placeholder="Search units by number, property, floor..."
              style={{
                width: '100%',
                padding: searchQuery ? '9px 30px 9px 34px' : '9px 12px 9px 34px',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                fontSize: 13,
                color: '#0F172A',
                outline: 'none',
                fontFamily: "'Poppins', system-ui, sans-serif",
                boxSizing: 'border-box',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchParams({}, { replace: true })}
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 3,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 12,
                }}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Property Filter */}
          <select
            value={propertyFilter}
            onChange={e => setPropertyFilter(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#0F172A',
              fontSize: 13,
              fontWeight: 600,
              outline: 'none',
              fontFamily: "'Poppins', system-ui, sans-serif",
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Properties</option>
            {propertyOptions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#0F172A',
              fontSize: 13,
              fontWeight: 600,
              outline: 'none',
              fontFamily: "'Poppins', system-ui, sans-serif",
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="BOOKED">Booked</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#0F172A',
              fontSize: 13,
              fontWeight: 600,
              outline: 'none',
              fontFamily: "'Poppins', system-ui, sans-serif",
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Unit Types</option>
            {typeOptions.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: 8,
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#0F172A',
              fontSize: 13,
              fontWeight: 600,
              outline: 'none',
              fontFamily: "'Poppins', system-ui, sans-serif",
              cursor: 'pointer',
            }}
          >
            <option value="NUMBER_ASC">Sort: Unit Number</option>
            <option value="PROP_ASC">Sort: Property Name</option>
            <option value="PRICE_DESC">Sort: Rent (High to Low)</option>
            <option value="PRICE_ASC">Sort: Rent (Low to High)</option>
            <option value="FLOOR_ASC">Sort: Floor</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #FECACA',
              background: '#FEF2F2',
              color: '#991B1B',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>✕</span> Reset filters
          </button>
        )}
      </div>

      <div className="fade-in" style={{ ...panelStyle, minHeight: 320 }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#991b1b', fontWeight: 600 }}>{error}</div>
        ) : units.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>No units found in your portfolio.</p>
          </div>
        ) : filteredUnits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: '#F8FAFC', borderRadius: 12, border: '1px dashed #CBD5E1' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#FEF2F2', color: '#DC2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Icon path={icons.alert} size={22} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>No units match your search</p>
            <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 14px 0' }}>
              Try adjusting or clearing your search and filters.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: '#0E5E48',
                color: '#FFFFFF',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  {['Property', 'Unit', 'Type', 'Floor', 'Status', 'Rent (AED)', 'Actions'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUnits.map((u) => {
                  const st = STATUS_STYLE[u.status] || { bg: '#f3f4f6', color: '#374151' }
                  return (
                    <tr key={u.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{u.propertyName}</td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{u.number}</td>
                      <td style={{ ...tdStyle, textTransform: 'capitalize' }}>{u.type}</td>
                      <td style={tdStyle}>{u.floor}</td>
                      <td style={tdStyle}>
                        <span style={{ backgroundColor: st.bg, color: st.color, border: `1px solid ${st.border || '#d1d5db'}`, padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, display: 'inline-block' }}>
                          {safeUpper(u.status)}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#065f46' }}>{u.price.toLocaleString()}</td>
                      <td style={tdStyle}>
                        <Link to={`/owner/units/${u.id}`} className="gfh-portal-link" style={{ color: '#0E5E48' }}>View details →</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL: ADD UNIT (OWNER) ── */}
      {showAddUnitModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 61, 58, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div
            className="fade-in"
            style={{
              position: 'relative',
              width: 540,
              maxWidth: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 28,
              background: '#ffffff',
              borderRadius: 14,
              border: `1px solid ${THEME.border}`,
              boxShadow: '0 20px 45px -10px rgba(6, 56, 44, 0.25)',
            }}
          >
            <CornerBrackets color="#0E5E48" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  Add New Unit
                </h2>
                <div style={{ fontSize: 12.5, color: '#0E5E48', fontWeight: 600, marginTop: 3 }}>
                  Assign a new unit to your property portfolio
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUnitModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 4 }}
              >
                <Icon path={icons.x} size={18} />
              </button>
            </div>

            {addUnitError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#991B1B', fontSize: 12.5, fontWeight: 600 }}>
                {addUnitError}
              </div>
            )}

            <form onSubmit={handleCreateUnit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Target Property *
                </label>
                {ownerProperties.length === 0 ? (
                  <div style={{ padding: '10px 12px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, fontSize: 12.5, color: '#B45309' }}>
                    No properties registered under your account.{' '}
                    <Link to="/owner/properties" style={{ color: '#0E5E48', fontWeight: 700 }}>
                      Create a Property first
                    </Link>
                  </div>
                ) : (
                  <select
                    value={unitForm.property_id}
                    onChange={e => setUnitForm({ ...unitForm, property_id: e.target.value })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                  >
                    <option value="">Select Property</option>
                    {ownerProperties.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.address})</option>
                    ))}
                  </select>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Unit Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 101, 1204, PH-1"
                    value={unitForm.number}
                    onChange={e => setUnitForm({ ...unitForm, number: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Floor *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="1"
                    value={unitForm.floor}
                    onChange={e => setUnitForm({ ...unitForm, floor: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Unit Type *
                  </label>
                  <select
                    value={unitForm.type}
                    onChange={e => setUnitForm({ ...unitForm, type: e.target.value })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                  >
                    <option value="apartment">Apartment</option>
                    <option value="studio">Studio</option>
                    <option value="villa">Villa</option>
                    <option value="penthouse">Penthouse</option>
                    <option value="office">Office</option>
                    <option value="retail">Retail / Shop</option>
                    <option value="warehouse">Warehouse</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Initial Status *
                  </label>
                  <select
                    value={unitForm.status}
                    onChange={e => setUnitForm({ ...unitForm, status: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="BOOKED">BOOKED</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Size (Sq. Ft.) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="850"
                    value={unitForm.size}
                    onChange={e => setUnitForm({ ...unitForm, size: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Annual Rent / Price (AED) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="65000"
                    value={unitForm.price}
                    onChange={e => setUnitForm({ ...unitForm, price: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    DEWA Premise / Meter No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 21049281"
                    value={unitForm.dhewa_no}
                    onChange={e => setUnitForm({ ...unitForm, dhewa_no: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Standard, Luxury"
                    value={unitForm.category}
                    onChange={e => setUnitForm({ ...unitForm, category: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 4 }}>
                <input
                  type="checkbox"
                  id="ownerUnitFurnished"
                  checked={unitForm.furnished}
                  onChange={e => setUnitForm({ ...unitForm, furnished: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: '#0E5E48', cursor: 'pointer' }}
                />
                <label htmlFor="ownerUnitFurnished" style={{ fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                  Fully Furnished unit
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddUnitModal(false)}
                  style={{ borderRadius: 8, fontWeight: 700, fontSize: 13, padding: '9px 16px', backgroundColor: '#f1f5f9', color: '#64748B', border: '1px solid #E2E8F0', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addUnitBusy || ownerProperties.length === 0}
                  style={{
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    padding: '9px 20px',
                    backgroundColor: '#0E5E48',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: addUnitBusy || ownerProperties.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: addUnitBusy || ownerProperties.length === 0 ? 0.7 : 1,
                  }}
                >
                  {addUnitBusy ? 'Adding...' : 'Save Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
