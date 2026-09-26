import { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { THEME, portalPageCss } from '../../components/gfh/adminTheme'

interface Unit {
  id: number
  number: string
  floor?: number
  type?: string
  category?: string
  price?: number
  status?: string
  property?: {
    id: number
    name: string
    address?: string
    city?: string
  }
  property_id?: number
  propertyName?: string
}

// 5 Soft Pastel Themes matching the client screenshot (media_1790175080148.png)
const PASTEL_THEMES = [
  {
    bg: '#F0FDFA', // Mint / Teal
    border: '#CCFBF1',
    hoverBorder: '#99F6E4',
    iconBg: '#CCFBF1',
    iconColor: '#0D9488',
    locColor: '#0F766E',
  },
  {
    bg: '#F0FDF4', // Emerald / Green
    border: '#DCFCE7',
    hoverBorder: '#BBF7D0',
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
    locColor: '#15803D',
  },
  {
    bg: '#FAF5FF', // Lavender / Purple
    border: '#F3E8FF',
    hoverBorder: '#E9D5FF',
    iconBg: '#F3E8FF',
    iconColor: '#9333EA',
    locColor: '#7E22CE',
  },
  {
    bg: '#FFFBEB', // Warm Peach / Amber
    border: '#FEF3C7',
    hoverBorder: '#FDE68A',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
    locColor: '#B45309',
  },
  {
    bg: '#F0F9FF', // Sky Blue / Cyan
    border: '#E0F2FE',
    hoverBorder: '#BAE6FD',
    iconBg: '#E0F2FE',
    iconColor: '#0284C7',
    locColor: '#0369A1',
  },
]

function getUnitDisplayInfo(type?: string, category?: string) {
  const t = (type || '').toLowerCase()
  const c = (category || '').toLowerCase()

  if (t.includes('studio') || c.includes('studio')) {
    return { tag: 'STUDIO', label: 'Studio Apartment', isShop: false }
  }
  if (t.includes('shop') || c.includes('shop') || t.includes('commercial')) {
    return { tag: 'SHOP', label: 'Shop Unit', isShop: true }
  }
  if (t.includes('office') || c.includes('office')) {
    return { tag: 'OFFICE', label: 'Office Space', isShop: false }
  }
  if (t.includes('penthouse') || c.includes('penthouse')) {
    return { tag: 'PENTHOUSE', label: 'Penthouse Apartment', isShop: false }
  }
  if (t.includes('villa') || c.includes('villa')) {
    return { tag: 'VILLA', label: 'Luxury Villa', isShop: false }
  }
  if (t.includes('1') || t.includes('one')) {
    return { tag: '1 BR', label: '1 Bed Apartment', isShop: false }
  }
  if (t.includes('2') || t.includes('two')) {
    return { tag: '2 BR', label: '2 Bed Apartment', isShop: false }
  }
  if (t.includes('3') || t.includes('three')) {
    return { tag: '3 BR', label: '3 Bed Apartment', isShop: false }
  }

  const raw = type ? type.toUpperCase() : 'UNIT'
  const pretty = type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Residential'
  return { tag: raw, label: `${pretty} Apartment`, isShop: false }
}

export default function VacantUnits() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [units, setUnits] = useState<Unit[]>([])
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [isLoading, setIsLoading] = useState(true)

  const searchQuery = searchParams.get('q') || ''

  useEffect(() => {
    fetchVacantUnits()
  }, [])

  const fetchVacantUnits = async () => {
    setIsLoading(true)
    try {
      // Primary: owner dashboard vacant units endpoint
      const res = await api.get('/owner/dashboard/vacant-units')
      const list = res.data?.data?.units || res.data?.data || []
      if (Array.isArray(list) && list.length > 0) {
        setUnits(list)
      } else {
        // Fallback: try owner units with status=AVAILABLE
        const res2 = await api.get('/owner/units?status=AVAILABLE')
        const list2 = res2.data?.data?.units || res2.data?.data || []
        setUnits(Array.isArray(list2) ? list2 : [])
      }
    } catch (err) {
      console.error(err)
      try {
        const res2 = await api.get('/owner/units?status=AVAILABLE')
        const list2 = res2.data?.data?.units || res2.data?.data || []
        setUnits(Array.isArray(list2) ? list2 : [])
      } catch (err2) {
        console.error(err2)
        setUnits([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Filter units by search query and type filter
  const filteredUnits = useMemo(() => {
    return units.filter(u => {
      const info = getUnitDisplayInfo(u.type, u.category)
      const propName = u.property?.name || u.propertyName || ''
      const num = u.number || ''

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchNum = num.toLowerCase().includes(q)
        const matchProp = propName.toLowerCase().includes(q)
        const matchType = (u.type || '').toLowerCase().includes(q)
        const matchTag = info.tag.toLowerCase().includes(q)
        const matchLabel = info.label.toLowerCase().includes(q)
        if (!matchNum && !matchProp && !matchType && !matchTag && !matchLabel) {
          return false
        }
      }

      if (typeFilter !== 'ALL') {
        const filterLower = typeFilter.toLowerCase()
        const matchType = (u.type || '').toLowerCase().includes(filterLower)
        const matchTag = info.tag.toLowerCase().includes(filterLower)
        if (!matchType && !matchTag) return false
      }

      return true
    })
  }, [units, searchQuery, typeFilter])

  return (
    <div
      className="gfh-portal-page"
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: '24px 28px',
        minHeight: '100vh',
        background: '#F8FAFC',
      }}
    >
      <style>{portalPageCss}</style>
      <style>{`
        .gfh-vacant-card {
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
          cursor: pointer;
          text-decoration: none;
          min-height: 165px;
          box-sizing: border-box;
        }
        .gfh-vacant-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px -6px rgba(15, 23, 42, 0.08);
        }
        .gfh-vacant-input {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13.5px;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .gfh-vacant-input:focus {
          border-color: #0F8A67;
          box-shadow: 0 0 0 3px rgba(15, 138, 103, 0.12);
        }
      `}</style>

      {/* Top Header Row with Title, Back Button, Search and Filter */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Left: Back button, Title & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link
            to="/owner/dashboard"
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: '#0F8A67',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              transition: 'background 0.15s ease',
              flexShrink: 0,
              boxShadow: '0 1px 3px rgba(15, 138, 103, 0.25)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#0B6E52')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0F8A67')}
            title="Back to dashboard"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#0F172A',
                margin: 0,
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}
            >
              Vacant Properties
            </h1>
            <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0', fontWeight: 500 }}>
              View all currently vacant properties in your portfolio
            </p>
          </div>
        </div>

        {/* Right: Search and Filter controls matching client image */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Search Vacant Properties */}
          <div style={{ position: 'relative', width: 250 }}>
            <svg
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94A3B8',
                pointerEvents: 'none',
              }}
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
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                const val = e.target.value
                setSearchParams(val ? { q: val } : {}, { replace: true })
              }}
              placeholder="Search Vacant Properties..."
              className="gfh-vacant-input"
              style={{
                width: '100%',
                padding: searchQuery ? '9px 32px 9px 38px' : '9px 14px 9px 38px',
                background: '#FFFFFF',
                color: '#0F172A',
                boxSizing: 'border-box',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchParams({}, { replace: true })}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  fontSize: 13,
                  padding: 2,
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* All Types Dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="gfh-vacant-input"
              style={{
                padding: '9px 34px 9px 14px',
                background: '#FFFFFF',
                color: '#334155',
                fontWeight: 600,
                cursor: 'pointer',
                appearance: 'none',
              }}
            >
              <option value="ALL">All Types</option>
              <option value="studio">Studio</option>
              <option value="apartment">Apartment</option>
              <option value="shop">Shop</option>
              <option value="office">Office</option>
              <option value="penthouse">Penthouse</option>
              <option value="villa">Villa</option>
            </select>
            <svg
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748B',
                pointerEvents: 'none',
              }}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #E2E8F0',
            padding: '80px 20px',
            textAlign: 'center',
            color: '#64748B',
            fontWeight: 600,
          }}
        >
          <div style={{ fontSize: 15, color: '#0F172A', fontWeight: 700, marginBottom: 6 }}>
            Loading vacant properties…
          </div>
          <div style={{ fontSize: 13, color: '#94A3B8' }}>
            Fetching available units across your portfolio
          </div>
        </div>
      ) : filteredUnits.length === 0 ? (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #E2E8F0',
            padding: '70px 24px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: '#ECFDF8',
              color: '#0F8A67',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
            {searchQuery || typeFilter !== 'ALL'
              ? 'No matching vacant units found'
              : 'No Vacant Properties at the Moment'}
          </h3>
          <p style={{ fontSize: 13.5, color: '#64748B', margin: '0 0 20px 0', maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
            {searchQuery || typeFilter !== 'ALL'
              ? 'Try adjusting your search terms or clearing the type filter to see other units.'
              : 'All units in your portfolio are currently rented or occupied. When a unit becomes available, it will show up here.'}
          </p>
          {(searchQuery || typeFilter !== 'ALL') ? (
            <button
              onClick={() => {
                setSearchParams({}, { replace: true })
                setTypeFilter('ALL')
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#0F8A67',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                padding: '9px 18px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          ) : (
            <Link
              to="/owner/units"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#0F8A67',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 10,
                padding: '9px 20px',
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <span>View All Portfolio Units</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          )}
        </div>
      ) : (
        /* 5-Column Colorful Card Grid matching client mockup */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: 16,
          }}
        >
          {filteredUnits.map((unit, idx) => {
            const theme = PASTEL_THEMES[idx % PASTEL_THEMES.length]
            const info = getUnitDisplayInfo(unit.type, unit.category)
            const propName = unit.property?.name || unit.propertyName || 'Property'

            return (
              <Link
                key={unit.id}
                to={`/owner/units/${unit.id}`}
                className="gfh-vacant-card"
                style={{
                  background: theme.bg,
                  border: `1px solid ${theme.border}`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = theme.hoverBorder
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = theme.border
                }}
              >
                {/* Top Row: Icon + VACANT badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background: theme.iconBg,
                      color: theme.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {info.isShop ? (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                    ) : (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    )}
                  </div>

                  {/* Red / Coral VACANT pill badge */}
                  <span
                    style={{
                      background: '#FEF2F2',
                      color: '#EF4444',
                      border: '1px solid #FEE2E2',
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      padding: '3px 10px',
                      borderRadius: 999,
                    }}
                  >
                    VACANT
                  </span>
                </div>

                {/* Middle Content: Tag + Big Unit Number + Type Label */}
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#64748B',
                      letterSpacing: '0.4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {info.tag}
                  </div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: '#0F172A',
                      lineHeight: 1.15,
                      margin: '3px 0 2px 0',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {unit.number}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#64748B',
                      fontWeight: 500,
                    }}
                  >
                    {info.label}
                  </div>
                </div>

                {/* Bottom Row: Location Pin + Property / Building Name + Create Contract Action */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    paddingTop: 10,
                    borderTop: `1px solid ${theme.border}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: theme.locColor,
                      fontSize: 12,
                      fontWeight: 600,
                      minWidth: 0,
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {propName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      navigate(`/owner/contracts?create=1&unit_id=${unit.id}&property_id=${unit.property?.id || unit.property_id || ''}`)
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      background: '#0F8A67',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '4px 9px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    + Create Contract
                  </button>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
