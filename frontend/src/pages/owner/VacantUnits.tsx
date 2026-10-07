import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import { UNIT_TYPE_OPTIONS } from '../../utils/unitTypes'
import { getDefaultUnitImageUrl } from '../../utils/unitImages'

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

function getUnitTag(type?: string, category?: string): string {
  const t = (type || '').toLowerCase()
  const c = (category || '').toLowerCase()
  if (t.includes('studio') || c.includes('studio')) return 'STUDIO'
  if (t.includes('shop') || c.includes('shop') || t.includes('commercial')) return 'SHOP'
  if (t.includes('office') || c.includes('office')) return 'OFFICE'
  if (t.includes('penthouse') || c.includes('penthouse')) return 'PENTHOUSE'
  if (t.includes('villa') || c.includes('villa')) return 'VILLA'
  if (/\b1\b|one|1-?br|1bed/.test(t) || /\b1\b|1-?br/.test(c)) return '1-BR'
  if (/\b2\b|two|2-?br|2bed/.test(t) || /\b2\b|2-?br/.test(c)) return '2-BR'
  if (/\b3\b|three|3-?br|3bed/.test(t) || /\b3\b|3-?br/.test(c)) return '3-BR'
  if (type) return type.toUpperCase().slice(0, 10)
  return 'UNIT'
}

function isVacantStatus(status?: string) {
  const s = (status || '').toUpperCase()
  return s === 'AVAILABLE' || s === 'VACANT' || s === ''
}

function isBookedStatus(status?: string) {
  return (status || '').toUpperCase() === 'BOOKED'
}

function normalizeUnits(payload: unknown): Unit[] {
  if (Array.isArray(payload)) return payload
  return []
}

export default function VacantUnits() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [units, setUnits] = useState<Unit[]>([])
  const [typeFilter, setTypeFilter] = useState<string>('ALL')
  const [isLoading, setIsLoading] = useState(true)

  const searchQuery = searchParams.get('q') || ''

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      try {
        const [vacantRes, bookedRes, allRes] = await Promise.all([
          api.get('/owner/dashboard/vacant-units').catch(() => null),
          api.get('/owner/units?status=BOOKED').catch(() => null),
          api.get('/owner/units').catch(() => null),
        ])

        if (cancelled) return

        const fromVacant = normalizeUnits(
          vacantRes?.data?.data?.units || vacantRes?.data?.data || [],
        )
        const fromBooked = normalizeUnits(
          bookedRes?.data?.data?.units || bookedRes?.data?.data || [],
        )
        const fromAll = normalizeUnits(
          allRes?.data?.data?.units || allRes?.data?.data || [],
        )

        const byId = new Map<number, Unit>()

        // Prefer full units list so status is reliable, then fill gaps
        ;[...fromAll, ...fromVacant, ...fromBooked].forEach((u) => {
          if (!u?.id) return
          if (!byId.has(u.id)) byId.set(u.id, u)
        })

        const merged = [...byId.values()].filter(
          (u) => isVacantStatus(u.status) || isBookedStatus(u.status),
        )

        // If vacant endpoint returned units without status, treat them as vacant
        if (merged.length === 0 && fromVacant.length > 0) {
          setUnits(fromVacant.map((u) => ({ ...u, status: u.status || 'AVAILABLE' })))
        } else {
          setUnits(merged)
        }
      } catch (err) {
        console.error(err)
        if (!cancelled) setUnits([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      const tag = getUnitTag(u.type, u.category)
      const propName = u.property?.name || u.propertyName || ''
      const num = u.number || ''

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const match =
          num.toLowerCase().includes(q) ||
          propName.toLowerCase().includes(q) ||
          (u.type || '').toLowerCase().includes(q) ||
          tag.toLowerCase().includes(q)
        if (!match) return false
      }

      if (typeFilter !== 'ALL') {
        const filterLower = typeFilter.toLowerCase()
        const matchType = (u.type || '').toLowerCase().includes(filterLower)
        const matchTag = tag.toLowerCase().includes(filterLower)
        if (!matchType && !matchTag) return false
      }

      return true
    })
  }, [units, searchQuery, typeFilter])

  const vacantUnits = useMemo(
    () => filteredUnits.filter((u) => isVacantStatus(u.status)),
    [filteredUnits],
  )
  const bookedUnits = useMemo(
    () => filteredUnits.filter((u) => isBookedStatus(u.status)),
    [filteredUnits],
  )

  // From dashboard "Total Booked" KPI → scroll to booked section
  useEffect(() => {
    if (isLoading || bookedUnits.length === 0) return
    if (window.location.hash !== '#booked') return
    const el = document.getElementById('booked')
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [isLoading, bookedUnits.length])

  const renderCard = (unit: Unit, tone: 'vacant' | 'booked') => {
    const tag = getUnitTag(unit.type, unit.category)
    const propName = unit.property?.name || unit.propertyName || 'Property'
    const bg = tone === 'vacant' ? '#17a2b8' : '#6c757d'

    return (
      <Link
        key={unit.id}
        to={`/owner/units/${unit.id}`}
        className="gfh-vu-card"
        style={{ background: bg }}
        title={`Unit ${unit.number} · ${propName}`}
      >
        <img
          className="gfh-vu-card-photo"
          src={getDefaultUnitImageUrl(unit.type)}
          alt={`Unit ${unit.number}`}
          loading="lazy"
        />
        <div className="gfh-vu-card-tag">{tag}</div>
        <div className="gfh-vu-card-number">{unit.number}</div>
        <div className="gfh-vu-card-building">{propName}</div>
      </Link>
    )
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: 'var(--font-sans)' }}>
      <style>{`
        .gfh-vu-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 22px;
        }
        .gfh-vu-title {
          font-size: 22px;
          font-weight: 600;
          color: #0F172A;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .gfh-vu-sub {
          font-size: 13px;
          color: #64748B;
          margin: 4px 0 0;
          font-weight: 500;
        }
        .gfh-vu-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .gfh-vu-input {
          font-family: var(--font-sans);
          font-size: 13.5px;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          outline: none;
          background: #FFFFFF;
          color: #0F172A;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .gfh-vu-input:focus {
          border-color: #17a2b8;
          box-shadow: 0 0 0 3px rgba(23, 162, 184, 0.15);
        }
        .gfh-vu-section-title {
          font-size: 18px;
          font-weight: 600;
          color: #475569;
          margin: 28px 0 14px;
        }
        .gfh-vu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
          gap: 14px;
        }
        .gfh-vu-card {
          position: relative;
          display: block;
          min-height: 168px;
          border-radius: 6px;
          padding: 10px 12px 12px;
          text-decoration: none;
          color: #FFFFFF;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
          transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
          overflow: hidden;
        }
        .gfh-vu-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.16);
          filter: brightness(1.04);
          color: #FFFFFF;
        }
        .gfh-vu-card-photo {
          width: 100%;
          height: 78px;
          border-radius: 6px;
          object-fit: cover;
          display: block;
          background: rgba(255,255,255,0.18);
          border: 1px solid rgba(255,255,255,0.22);
        }
        .gfh-vu-card-tag {
          position: absolute;
          top: 16px;
          right: 18px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          opacity: 0.95;
          background: rgba(15, 23, 42, 0.35);
          padding: 2px 6px;
          border-radius: 4px;
        }
        .gfh-vu-card-number {
          margin-top: 12px;
          font-size: 1.85rem;
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.02em;
          text-align: right;
        }
        .gfh-vu-card-building {
          margin-top: 12px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          opacity: 0.95;
          line-height: 1.25;
          max-width: 85%;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .gfh-vu-empty {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 48px 24px;
          text-align: center;
          color: #64748B;
        }
        @media (max-width: 640px) {
          .gfh-vu-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .gfh-vu-card-number {
            font-size: 1.65rem;
          }
        }
      `}</style>

      <div className="gfh-vu-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            to="/owner/dashboard"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: '#17a2b8',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              flexShrink: 0,
            }}
            title="Back to dashboard"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div>
            <h1 className="gfh-vu-title">Vacant Properties</h1>
            <p className="gfh-vu-sub">
              {vacantUnits.length} available · {bookedUnits.length} booked
            </p>
          </div>
        </div>

        <div className="gfh-vu-controls">
          <div style={{ position: 'relative', width: 240, maxWidth: '100%' }}>
            <svg
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="gfh-vu-input"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value
                setSearchParams(val ? { q: val } : {}, { replace: true })
              }}
              placeholder="Search units, buildings..."
              style={{ width: '100%', padding: '8px 12px 8px 34px', boxSizing: 'border-box' }}
            />
          </div>
          <select
            className="gfh-vu-input"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: '8px 12px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
          >
            <option value="ALL">All Types</option>
            {UNIT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="gfh-vu-empty">
          <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 6 }}>
            Loading vacant properties…
          </div>
          <div style={{ fontSize: 13 }}>Fetching available and booked units</div>
        </div>
      ) : vacantUnits.length === 0 && bookedUnits.length === 0 ? (
        <div className="gfh-vu-empty">
          <h3 style={{ fontSize: 17, fontWeight: 600, color: '#0F172A', margin: '0 0 6px' }}>
            {searchQuery || typeFilter !== 'ALL' ? 'No matching units found' : 'No vacant or booked units'}
          </h3>
          <p style={{ fontSize: 13.5, margin: '0 0 16px' }}>
            {searchQuery || typeFilter !== 'ALL'
              ? 'Try adjusting your search or type filter.'
              : 'When a unit becomes available or booked, it will appear here.'}
          </p>
          {(searchQuery || typeFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchParams({}, { replace: true })
                setTypeFilter('ALL')
              }}
              style={{
                background: '#17a2b8',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {vacantUnits.length > 0 && (
            <div className="gfh-vu-grid">
              {vacantUnits.map((unit) => renderCard(unit, 'vacant'))}
            </div>
          )}

          {bookedUnits.length > 0 && (
            <div id="booked">
              <h2 className="gfh-vu-section-title">Booked</h2>
              <div className="gfh-vu-grid">
                {bookedUnits.map((unit) => renderCard(unit, 'booked'))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
