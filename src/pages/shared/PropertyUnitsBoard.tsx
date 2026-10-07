import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import { resolveMonthlyRent } from '../../utils/monthlyDue'

interface Property {
  id: number
  name: string
  city?: string
  address?: string
}

interface Unit {
  id: number
  number: string
  type?: string
  category?: string
  price?: number | string
  status?: string
  property_id?: number
}

interface Contract {
  id: number
  unit_id?: number
  rent_amount?: number | string
  due?: number | string
  status?: string
  on_case?: boolean
  lease_term?: string
}

function formatMoney(val?: number | string | null) {
  if (val === null || val === undefined || val === '') return '0'
  const num = Number(val)
  if (Number.isNaN(num)) return '0'
  return num.toLocaleString('en-US', {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })
}

function getUnitTag(type?: string, category?: string): string {
  const t = (type || '').toLowerCase()
  const c = (category || '').toLowerCase()
  if (t.includes('l-studio') || t.includes('large studio') || c.includes('l-studio')) return 'L-STUDIO'
  if (t.includes('studio') || c.includes('studio')) return 'STUDIO'
  if (t.includes('shop') || c.includes('shop') || t.includes('commercial')) return 'SHOP'
  if (t.includes('office') || c.includes('office')) return 'OFFICE'
  if (t.includes('penthouse') || c.includes('penthouse')) return 'PENTHOUSE'
  if (t.includes('villa') || c.includes('villa')) return 'VILLA'
  if (/\b1\b|one|1-?br|1bed/.test(t) || /\b1\b|1-?br/.test(c)) return '1-BR'
  if (/\b2\b|two|2-?br|2bed/.test(t) || /\b2\b|2-?br/.test(c)) return '2-BR'
  if (/\b3\b|three|3-?br|3bed/.test(t) || /\b3\b|3-?br/.test(c)) return '3-BR'
  if (type) return type.toUpperCase().slice(0, 12)
  return 'UNIT'
}

function isCommercial(type?: string, category?: string) {
  const t = `${type || ''} ${category || ''}`.toLowerCase()
  return t.includes('shop') || t.includes('office') || t.includes('commercial') || t.includes('retail')
}

function isAvailable(status?: string) {
  const s = (status || '').toUpperCase()
  return s === 'AVAILABLE' || s === 'VACANT' || s === ''
}

function isOccupied(status?: string) {
  const s = (status || '').toUpperCase()
  return s === 'OCCUPIED' || s === 'RENTED' || s === 'BOOKED'
}

function cardBg(status?: string, onCase?: boolean) {
  if (onCase) return '#e74c3c'
  if (isAvailable(status)) return '#17a2b8'
  if (isOccupied(status)) return '#198754'
  return '#6c757d'
}

export default function PropertyUnitsBoard() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const role = user?.role || 'owner'
  const base = `/${role}`
  const stateName = (location.state as { propertyName?: string } | null)?.propertyName

  const [property, setProperty] = useState<Property | null>(
    stateName ? { id: Number(propertyId), name: stateName } : null,
  )
  const [units, setUnits] = useState<Unit[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!propertyId) return
    let cancelled = false
    const isStaff = role === 'cashier' || role === 'accountant'

    const loadProperty = async (): Promise<Property | null> => {
      // Dashboard endpoints are scoped for owner + assigned staff; avoid /owner/properties/:id (owner-only CRUD).
      try {
        const res = await api.get('/owner/dashboard/properties')
        const list = res.data?.data?.properties || res.data?.data || []
        if (Array.isArray(list)) {
          const found = list.find((p: Property) => String(p.id) === String(propertyId))
          if (found) return found
        }
      } catch {
        /* try fallbacks */
      }
      try {
        const res = await api.get('/owner/properties')
        const list = res.data?.data?.properties || res.data?.data || []
        if (Array.isArray(list)) {
          const found = list.find((p: Property) => String(p.id) === String(propertyId))
          if (found) return found
        }
      } catch {
        /* ignore */
      }
      return null
    }

    const loadUnits = async (): Promise<Unit[]> => {
      try {
        const res = await api.get(`/owner/dashboard/properties/${propertyId}/units`)
        const list = res.data?.data?.units || res.data?.data || []
        if (Array.isArray(list) && list.length > 0) return list
      } catch {
        /* try fallbacks */
      }
      try {
        const res = await api.get(`/owner/units?property_id=${propertyId}`)
        const list = res.data?.data?.units || res.data?.data || []
        if (Array.isArray(list)) return list
      } catch {
        /* try list + filter */
      }
      try {
        const res = await api.get('/owner/units')
        const list = res.data?.data?.units || res.data?.data || []
        if (Array.isArray(list)) {
          return list.filter((u: Unit) => String(u.property_id) === String(propertyId))
        }
      } catch {
        /* ignore */
      }
      return []
    }

    const loadContracts = async (): Promise<Contract[]> => {
      if (isStaff) {
        try {
          const res = await api.get('/staff/finance/contracts')
          const list = res.data?.data?.contracts || res.data?.data || []
          if (Array.isArray(list)) return list
        } catch {
          /* fall through to owner contracts */
        }
      }
      try {
        const res = await api.get('/owner/contracts')
        const list = res.data?.data?.contracts || res.data?.data || []
        if (Array.isArray(list)) return list
      } catch {
        /* ignore */
      }
      return []
    }

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [prop, unitList, contractList] = await Promise.all([
          loadProperty(),
          loadUnits(),
          loadContracts(),
        ])

        if (cancelled) return

        setProperty(
          prop && prop.id
            ? prop
            : { id: Number(propertyId), name: stateName || `Property #${propertyId}` },
        )
        setUnits(unitList)
        setContracts(contractList)

        if (unitList.length === 0 && !prop) {
          setError('No units found for this property (or access is limited for your role).')
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.response?.data?.message || 'Failed to load property units.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [propertyId, role, stateName])

  const contractByUnit = useMemo(() => {
    const map = new Map<number, Contract>()
    contracts.forEach((c) => {
      if (!c.unit_id) return
      const status = (c.status || '').toLowerCase()
      const existing = map.get(c.unit_id)
      if (!existing || status === 'active') map.set(c.unit_id, c)
    })
    return map
  }, [contracts])

  const enriched = useMemo(() => {
    const rows = units.map((unit) => {
      const contract = contractByUnit.get(unit.id)
      const onCase = !!contract?.on_case
      const monthlyRent = contract
        ? resolveMonthlyRent(contract.rent_amount, contract.lease_term || 'Yearly')
        : Number(unit.price || 0)
      const due = contract?.due != null ? Number(contract.due) : 0
      const available = isAvailable(unit.status) && !isOccupied(unit.status)
      return { unit, contract, onCase, rent: monthlyRent, due, available }
    })
    return rows.sort((a, b) =>
      String(a.unit.number).localeCompare(String(b.unit.number), undefined, { numeric: true }),
    )
  }, [units, contractByUnit])

  const residential = enriched.filter((r) => !isCommercial(r.unit.type, r.unit.category))
  const commercial = enriched.filter((r) => isCommercial(r.unit.type, r.unit.category))

  const renderSection = (title: string, rows: typeof enriched) => {
    if (rows.length === 0) return null
    return (
      <section className="gfh-pub-section">
        <h2 className="gfh-pub-section-title">{title}</h2>
        <div className="gfh-pub-grid">
          {rows.map(({ unit, onCase, rent, due, available }) => (
            <Link
              key={unit.id}
              to={`${base}/units/${unit.id}`}
              className="gfh-pub-card"
              style={{ background: cardBg(unit.status, onCase) }}
              title={`Unit ${unit.number}`}
            >
              <div className="gfh-pub-card-head">
                <div className="gfh-pub-card-type">{getUnitTag(unit.type, unit.category)}</div>
                <div className="gfh-pub-card-number">{unit.number}</div>
              </div>
              <div className="gfh-pub-card-meta">
                <div>Rent : {available ? '' : formatMoney(rent)}</div>
                <div>Due : {available ? '' : formatMoney(due)}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: 'var(--font-sans)' }}>
      <style>{`
        .gfh-pub-shell {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 4px;
          padding: 18px 20px 24px;
          box-shadow: 0 1px 3px rgba(15,23,42,0.04);
        }
        .gfh-pub-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }
        .gfh-pub-title {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          color: #DC2626;
          letter-spacing: -0.01em;
        }
        .gfh-pub-back {
          padding: 6px 22px;
          border-radius: 9999px;
          border: 1.5px solid #60A5FA;
          background: #FFFFFF;
          color: #2563EB;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
        }
        .gfh-pub-back:hover { background: #EFF6FF; }
        .gfh-pub-legend {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }
        .gfh-pub-legend span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 88px;
          padding: 6px 12px;
          border-radius: 3px;
          color: #FFFFFF;
          font-size: 12px;
          font-weight: 700;
        }
        .gfh-pub-section { margin-top: 8px; }
        .gfh-pub-section + .gfh-pub-section { margin-top: 22px; }
        .gfh-pub-section-title {
          margin: 0 0 12px;
          font-size: 15px;
          font-weight: 600;
          color: #64748B;
        }
        .gfh-pub-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
          gap: 12px;
        }
        .gfh-pub-card {
          min-height: 112px;
          border-radius: 8px;
          padding: 10px 12px 12px;
          color: #FFFFFF;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 0 rgba(0,0,0,0.12);
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }
        .gfh-pub-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 0 rgba(0,0,0,0.14);
          color: #FFFFFF;
        }
        .gfh-pub-card-head { text-align: right; }
        .gfh-pub-card-type {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          opacity: 0.95;
        }
        .gfh-pub-card-number {
          font-size: 1.35rem;
          font-weight: 700;
          line-height: 1.1;
          margin-top: 2px;
          letter-spacing: -0.02em;
        }
        .gfh-pub-card-meta {
          margin-top: auto;
          padding-top: 10px;
          font-size: 11px;
          font-weight: 500;
          line-height: 1.35;
        }
        @media (max-width: 640px) {
          .gfh-pub-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
      `}</style>

      <div className="gfh-pub-shell">
        <div className="gfh-pub-header">
          <h1 className="gfh-pub-title">{property?.name || 'Property'}</h1>
          <button
            type="button"
            className="gfh-pub-back"
            onClick={() => {
              if (window.history.length > 1) navigate(-1)
              else navigate(`${base}/dashboard`)
            }}
          >
            Back
          </button>
        </div>

        <div className="gfh-pub-legend">
          <span style={{ background: '#198754' }}>Occupied</span>
          <span style={{ background: '#17a2b8' }}>Available</span>
          <span style={{ background: '#e74c3c' }}>On Case</span>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#64748B', fontWeight: 600 }}>
            Loading units…
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#DC2626', fontWeight: 600 }}>{error}</div>
        ) : enriched.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8', fontWeight: 600 }}>
            No units found for this property.
          </div>
        ) : (
          <>
            {renderSection('Residential', residential)}
            {renderSection('Commercial', commercial)}
          </>
        )}
      </div>
    </div>
  )
}
