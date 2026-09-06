import { useEffect, useState, useMemo } from 'react'
import api from '../../api/axios'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { THEME, ADMIN_COLORS, Icon, portalPageCss, heroStyle, panelStyle, ghostBtnStyle, thStyle, tdStyle, RADIUS } from '../../components/gfh/adminTheme'
import { safeUpper } from '../../utils/safeLabel'

interface UnitSummary {
  id: number
  number: string
  floor: number
  type: string
  status: string
  price: number
}

interface PropertySummary {
  id: number
  name: string
  address: string
  type: string
  total_units: number
  occupied_units: number
  vacant_units: number
  units?: UnitSummary[]
}

const icons = {
  building: 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
  filter: 'M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.586a1 1 0 0 1-.293.707l-6.414 6.414a1 1 0 0 0-.293.707V17l-4 4v-6.586a1 1 0 0 0-.293-.707L3.293 7.293A1 1 0 0 1 3 6.586V4z',
  door: 'M14 3h5v18h-5M14 3L6 4.5v15L14 21M9.5 12h.01',
  check: 'M20 6 9 17l-5-5',
  alert: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  x: 'M18 6 6 18M6 6l12 12',
}

export default function PropertyDrillDown() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState<PropertySummary[]>([])
  const [selectedProperty, setSelectedProperty] = useState<PropertySummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUnitsLoading, setIsUnitsLoading] = useState(false)

  // Filters state
  const searchQuery = searchParams.get('q') || ''
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [occupancyFilter, setOccupancyFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<string>('NAME_ASC')

  // Unit-level search and filter
  const [unitSearch, setUnitSearch] = useState<string>('')
  const [unitStatusFilter, setUnitStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await api.get('/owner/dashboard/properties')
        setProperties(res.data?.data?.properties || [])
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProperties()
  }, [])

  const handlePropertyClick = async (prop: PropertySummary) => {
    setSelectedProperty(prop)
    setIsUnitsLoading(true)
    setUnitSearch('')
    setUnitStatusFilter('ALL')
    try {
      const res = await api.get(`/owner/dashboard/properties/${prop.id}/units`)
      setSelectedProperty(prev => prev ? { ...prev, units: res.data?.data?.units || [] } : null)
    } catch (err) {
      console.error(err)
    } finally {
      setIsUnitsLoading(false)
    }
  }

  // Unique property types
  const propertyTypes = useMemo(() => {
    const set = new Set<string>()
    properties.forEach(p => {
      if (p.type) set.add(p.type)
    })
    return Array.from(set)
  }, [properties])

  // Filtered and sorted properties
  const filteredProperties = useMemo(() => {
    return properties
      .filter(p => {
        // Search query filter (name, address, type)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          const matchesName = (p.name || '').toLowerCase().includes(q)
          const matchesAddress = (p.address || '').toLowerCase().includes(q)
          const matchesType = (p.type || '').toLowerCase().includes(q)
          if (!matchesName && !matchesAddress && !matchesType) return false
        }

        // Property type filter
        if (typeFilter !== 'ALL') {
          if ((p.type || '').toLowerCase() !== typeFilter.toLowerCase()) return false
        }

        // Occupancy filter
        if (occupancyFilter === 'HAS_VACANT' && p.vacant_units <= 0) return false
        if (occupancyFilter === 'FULLY_OCCUPIED' && (p.vacant_units > 0 || p.total_units === 0)) return false
        if (occupancyFilter === 'HAS_OCCUPIED' && p.occupied_units <= 0) return false

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'NAME_ASC') return (a.name || '').localeCompare(b.name || '')
        if (sortBy === 'NAME_DESC') return (b.name || '').localeCompare(a.name || '')
        if (sortBy === 'TOTAL_UNITS_DESC') return b.total_units - a.total_units
        if (sortBy === 'VACANT_DESC') return b.vacant_units - a.vacant_units
        if (sortBy === 'OCCUPIED_DESC') return b.occupied_units - a.occupied_units
        return 0
      })
  }, [properties, searchQuery, typeFilter, occupancyFilter, sortBy])

  // Filtered units for selected property
  const filteredUnits = useMemo(() => {
    if (!selectedProperty?.units) return []
    return selectedProperty.units.filter(u => {
      if (unitSearch.trim()) {
        const q = unitSearch.toLowerCase().trim()
        const matchesNumber = (u.number || '').toLowerCase().includes(q)
        const matchesType = (u.type || '').toLowerCase().includes(q)
        const matchesFloor = String(u.floor || '').includes(q)
        if (!matchesNumber && !matchesType && !matchesFloor) return false
      }
      if (unitStatusFilter !== 'ALL') {
        if (u.status !== unitStatusFilter) return false
      }
      return true
    })
  }, [selectedProperty, unitSearch, unitStatusFilter])

  // Aggregate stats across filtered properties
  const stats = useMemo(() => {
    const totalProps = filteredProperties.length
    const totalUnits = filteredProperties.reduce((acc, p) => acc + (p.total_units || 0), 0)
    const occupiedUnits = filteredProperties.reduce((acc, p) => acc + (p.occupied_units || 0), 0)
    const vacantUnits = filteredProperties.reduce((acc, p) => acc + (p.vacant_units || 0), 0)
    return { totalProps, totalUnits, occupiedUnits, vacantUnits }
  }, [filteredProperties])

  const hasActiveFilters = Boolean(
    searchQuery.trim() || typeFilter !== 'ALL' || occupancyFilter !== 'ALL' || sortBy !== 'NAME_ASC'
  )

  const clearAllFilters = () => {
    setSearchParams({}, { replace: true })
    setTypeFilter('ALL')
    setOccupancyFilter('ALL')
    setSortBy('NAME_ASC')
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      {/* Hero Bar */}
      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, margin: 0 }}>Property Drill-down</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
            Search, filter, and inspect detailed occupancy and unit lists across your portfolio
          </div>
        </div>
        <Link to="/owner/dashboard" className="gfh-portal-btn" style={{ ...ghostBtnStyle, background: '#0E5E48', borderRadius: 8 }}>
          ← Back to dashboard
        </Link>
      </div>

      {/* Aggregate Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 22 }}>
        {[
          {
            value: isLoading ? '—' : stats.totalProps,
            label: 'Properties Found',
            sub: 'Portfolio',
            desc: searchQuery || typeFilter !== 'ALL' ? `of ${properties.length} total` : 'All registered buildings',
            icon: icons.building,
            iconBg: '#ECFDF8',
            iconColor: '#0E5E48',
            badgeBg: '#ECFDF8',
            badgeColor: '#065F46',
            badgeBorder: '#A7F3DC',
          },
          {
            value: isLoading ? '—' : stats.totalUnits,
            label: 'Total Units',
            sub: 'Units',
            desc: 'Across matched properties',
            icon: icons.door,
            iconBg: '#F0F9FF',
            iconColor: '#0284C7',
            badgeBg: '#F0F9FF',
            badgeColor: '#075985',
            badgeBorder: '#BAE6FD',
          },
          {
            value: isLoading ? '—' : stats.occupiedUnits,
            label: 'Occupied Units',
            sub: 'Occupied',
            desc: 'Under active lease',
            icon: icons.check,
            iconBg: '#F0FDF4',
            iconColor: '#0F8A67',
            badgeBg: '#F0FDF4',
            badgeColor: '#065F46',
            badgeBorder: '#BBF7D0',
          },
          {
            value: isLoading ? '—' : stats.vacantUnits,
            label: 'Vacant Units',
            sub: 'Vacant',
            desc: 'Available for rent',
            icon: icons.alert,
            iconBg: stats.vacantUnits > 0 ? '#FEF2F2' : '#F0FDF4',
            iconColor: stats.vacantUnits > 0 ? '#DC2626' : '#0F8A67',
            badgeBg: stats.vacantUnits > 0 ? '#FEF2F2' : '#F0FDF4',
            badgeColor: stats.vacantUnits > 0 ? '#991B1B' : '#065F46',
            badgeBorder: stats.vacantUnits > 0 ? '#FECACA' : '#BBF7D0',
          },
        ].map((card, i) => (
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
              animationDelay: `${i * 0.05}s`,
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
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                {card.value}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginTop: 4 }}>
                {card.label}
              </div>
              <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                {card.desc}
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
          gap: 14,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', flex: 1, minWidth: 280 }}>
          {/* In-page Search Input */}
          <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 360 }}>
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
              placeholder="Search properties by name, address, or type..."
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

          {/* Property Type Filter */}
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
            <option value="ALL">All Property Types</option>
            {propertyTypes.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>

          {/* Occupancy Filter */}
          <select
            value={occupancyFilter}
            onChange={e => setOccupancyFilter(e.target.value)}
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
            <option value="ALL">All Occupancies</option>
            <option value="HAS_VACANT">Has Vacant Units</option>
            <option value="FULLY_OCCUPIED">Fully Occupied</option>
            <option value="HAS_OCCUPIED">Has Active Tenants</option>
          </select>

          {/* Sort By Dropdown */}
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
            <option value="NAME_ASC">Sort: Name (A to Z)</option>
            <option value="NAME_DESC">Sort: Name (Z to A)</option>
            <option value="TOTAL_UNITS_DESC">Sort: Most Units</option>
            <option value="VACANT_DESC">Sort: Most Vacant</option>
            <option value="OCCUPIED_DESC">Sort: Most Occupied</option>
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
              transition: 'background 0.15s ease',
            }}
          >
            <span>✕</span> Reset filters
          </button>
        )}
      </div>

      {/* Main Two-Column Drilldown Section */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Properties List Column */}
        <div className="fade-in" style={{ ...panelStyle, flex: 1, minWidth: 320, minHeight: 420 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: THEME.ink, margin: 0 }}>
              Properties ({filteredProperties.length})
            </h2>
            <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
              Click a building to view units
            </span>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
          ) : properties.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>No properties registered to your account.</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#F8FAFC', borderRadius: 12, border: '1px dashed #CBD5E1' }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#FEF2F2', color: '#DC2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Icon path={icons.alert} size={22} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>No matching properties found</p>
              <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 14px 0' }}>
                No buildings match &quot;{searchQuery}&quot; with the selected filters.
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
            <div style={{ display: 'grid', gap: 12 }}>
              {filteredProperties.map(prop => {
                const isSelected = selectedProperty?.id === prop.id
                return (
                  <div
                    key={prop.id}
                    className="gfh-portal-row"
                    onClick={() => handlePropertyClick(prop)}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px 18px',
                      background: isSelected ? '#ECFDF8' : '#FFFFFF',
                      border: isSelected ? '1.5px solid #0F8A67' : '1px solid #E2E8F0',
                      borderRadius: 12,
                      boxShadow: isSelected ? '0 2px 8px rgba(15, 138, 103, 0.12)' : '0 1px 2px rgba(16,24,40,0.03)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, color: isSelected ? '#0E5E48' : THEME.ink, fontSize: 15, fontWeight: 800 }}>
                          {prop.name}
                        </h3>
                        {prop.type && (
                          <span style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: '#F1F5F9',
                            color: '#475569',
                            textTransform: 'uppercase',
                            letterSpacing: '0.4px',
                          }}>
                            {prop.type}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: THEME.textMuted, margin: '4px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {prop.address || 'Dubai, UAE'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 14, textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ minWidth: 44 }}>
                        <div style={{ fontSize: 17, fontWeight: 800, color: '#0F172A' }}>{prop.total_units}</div>
                        <div style={{ fontSize: 10.5, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Total</div>
                      </div>
                      <div style={{ minWidth: 44 }}>
                        <div style={{ fontSize: 17, fontWeight: 800, color: '#065F46' }}>{prop.occupied_units}</div>
                        <div style={{ fontSize: 10.5, color: '#065F46', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Occ.</div>
                      </div>
                      <div style={{ minWidth: 44 }}>
                        <div style={{ fontSize: 17, fontWeight: 800, color: prop.vacant_units > 0 ? '#991B1B' : '#64748B' }}>
                          {prop.vacant_units}
                        </div>
                        <div style={{ fontSize: 10.5, color: prop.vacant_units > 0 ? '#991B1B' : '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Vac.</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Units Drilldown Column */}
        {selectedProperty ? (
          <div className="fade-in" style={{ ...panelStyle, flex: 1.15, minWidth: 340, minHeight: 420 }}>
            {/* Header with Title and Close Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: THEME.ink, margin: 0 }}>
                  {selectedProperty.name}
                </h3>
                <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                  {selectedProperty.address} • {selectedProperty.total_units} units total
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProperty(null)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: 6,
                  color: '#64748B',
                  padding: '5px 8px',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
                title="Close units view"
              >
                ✕ Close
              </button>
            </div>

            {/* Units Sub-filter Controls */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 150 }}>
                <input
                  type="text"
                  value={unitSearch}
                  onChange={e => setUnitSearch(e.target.value)}
                  placeholder="Filter units by number, type, floor..."
                  style={{
                    width: '100%',
                    padding: '7px 10px 7px 28px',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    fontSize: 12,
                    color: '#0F172A',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: "'Poppins', system-ui, sans-serif",
                  }}
                />
                <svg
                  style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }}
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              {/* Status Pills */}
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {[
                  { key: 'ALL', label: 'All' },
                  { key: 'AVAILABLE', label: 'Available' },
                  { key: 'OCCUPIED', label: 'Occupied' },
                  { key: 'BOOKED', label: 'Booked' },
                ].map(s => {
                  const active = unitStatusFilter === s.key
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setUnitStatusFilter(s.key)}
                      style={{
                        padding: '4px 9px',
                        borderRadius: 999,
                        border: active ? '1px solid #0E5E48' : '1px solid #E2E8F0',
                        background: active ? '#0E5E48' : '#FFFFFF',
                        color: active ? '#FFFFFF' : '#475569',
                        fontSize: 11,
                        fontWeight: active ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Units Content */}
            {isUnitsLoading ? (
              <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
            ) : !selectedProperty.units || selectedProperty.units.length === 0 ? (
              <p style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 500, textAlign: 'center', padding: 20 }}>
                No units registered for this building.
              </p>
            ) : filteredUnits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, background: '#F8FAFC', borderRadius: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '0 0 4px 0' }}>No units match your filter.</p>
                <button
                  type="button"
                  onClick={() => { setUnitSearch(''); setUnitStatusFilter('ALL') }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0E5E48',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Reset unit filter
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                      {['Unit', 'Type', 'Floor', 'Status', 'Rent (AED)', 'Action'].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUnits.map(unit => (
                      <tr
                        key={unit.id}
                        className="gfh-portal-row"
                        style={{ borderBottom: `1px solid ${THEME.border}`, cursor: 'pointer' }}
                        onClick={() => navigate(`/owner/units/${unit.id}`)}
                      >
                        <td style={{ ...tdStyle, fontWeight: 700 }}>
                          <Link to={`/owner/units/${unit.id}`} className="gfh-portal-link" style={{ color: '#0E5E48' }} onClick={(e) => e.stopPropagation()}>
                            {unit.number}
                          </Link>
                        </td>
                        <td style={{ ...tdStyle, textTransform: 'capitalize' }}>{unit.type}</td>
                        <td style={tdStyle}>{unit.floor}</td>
                        <td style={tdStyle}>
                          <span
                            style={{
                              fontSize: 11,
                              padding: '3px 9px',
                              borderRadius: 999,
                              display: 'inline-block',
                              fontWeight: 700,
                              background:
                                unit.status === 'AVAILABLE' ? '#f0fdf4' :
                                unit.status === 'OCCUPIED' ? '#fef2f2' : '#fffbeb',
                              color:
                                unit.status === 'AVAILABLE' ? '#065f46' :
                                unit.status === 'OCCUPIED' ? '#991b1b' : '#b45309',
                              border: `1px solid ${
                                unit.status === 'AVAILABLE' ? '#bbf7d0' :
                                unit.status === 'OCCUPIED' ? '#fecaca' : '#fde68a'
                              }`,
                            }}
                          >
                            {safeUpper(unit.status)}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: '#065f46' }}>
                          {Number(unit.price).toLocaleString()}
                        </td>
                        <td style={tdStyle}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#0E5E48' }}>View →</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div
            className="fade-in"
            style={{
              ...panelStyle,
              flex: 1,
              minWidth: 300,
              minHeight: 420,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: 30,
              background: '#FAFAFC',
              border: '1.5px dashed #CBD5E1',
            }}
          >
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: '#ECFDF8',
              color: '#0E5E48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
            }}>
              <Icon path={icons.building} size={26} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
              Select a Property
            </div>
            <div style={{ fontSize: 13, color: '#64748B', maxWidth: 280, lineHeight: 1.5 }}>
              Click any property from the list on the left to view its individual units, occupancy statuses, and rental values.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
