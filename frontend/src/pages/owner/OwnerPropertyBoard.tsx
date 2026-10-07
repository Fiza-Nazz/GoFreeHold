import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import { Icon, THEME, portalPageCss } from '../../components/gfh/adminTheme'
import { useAuthStore } from '../../store/authStore'
import { getDefaultUnitImageUrl } from '../../utils/unitImages'

interface Property {
  id: number
  name: string
}

interface Unit {
  id: number
  property_id: number
  number: string
  type?: string
  category?: string
  price?: number | string
  status?: string
  property?: { id: number; name: string }
  propertyName?: string
}

interface Contract {
  id: number
  unit_id?: number
  rent_amount?: number | string
  due?: number | string
  status?: string
  on_case?: boolean
}

interface Payment {
  id: number
  contract_id?: number
  amount?: number | string
  type?: string
}

type StatusFilter = 'all' | 'occupied' | 'vacant' | 'on_case' | 'booked'
type SortKey = 'number' | 'rent_desc' | 'rent_asc' | 'status'
type ViewMode = 'grid' | 'list'

const STATUS_FILTERS: StatusFilter[] = ['all', 'occupied', 'vacant', 'on_case', 'booked']

function parseStatusFilter(value: string | null): StatusFilter {
  const normalized = (value || '').toLowerCase()
  if (normalized === 'occupied' || normalized === 'rented') return 'occupied'
  if (normalized === 'vacant' || normalized === 'available') return 'vacant'
  if (normalized === 'booked') return 'booked'
  if (normalized === 'on_case' || normalized === 'on-case') return 'on_case'
  if (STATUS_FILTERS.includes(normalized as StatusFilter)) return normalized as StatusFilter
  return 'all'
}

const icons = {
  search: 'M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
  building: 'M3 21h18M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v12',
  home: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  cash: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  alert: 'M12 9v4M12 17h.01M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0z',
  check: 'M20 6 9 17l-5-5',
  chart: 'M18 20V10M12 20V4M6 20v-6',
  chevron: 'M9 18l6-6-6-6',
  grid: 'M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
}

function getUnitTag(type?: string, category?: string): string {
  const t = (type || '').toLowerCase()
  const c = (category || '').toLowerCase()
  if (t.includes('studio') || c.includes('studio')) return 'STUDIO'
  if (t.includes('apartment') || c.includes('apartment') || t.includes('flat')) return 'APARTMENT'
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

function formatMoney(val?: number | string | null) {
  const num = Number(val ?? 0)
  if (Number.isNaN(num)) return '0'
  return num.toLocaleString('en-US', {
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })
}

function isVacantStatus(status?: string) {
  const s = (status || '').toUpperCase()
  return s === 'AVAILABLE' || s === 'VACANT'
}

function isOccupiedStatus(status?: string) {
  return (status || '').toUpperCase() === 'OCCUPIED'
}

function isBookedStatus(status?: string) {
  return (status || '').toUpperCase() === 'BOOKED'
}

function statusMeta(status?: string, onCase?: boolean) {
  if (onCase) {
    return { label: 'On Case', tone: 'red' as const, dot: '#DC2626' }
  }
  const s = (status || '').toUpperCase()
  if (s === 'BOOKED') return { label: 'Booked', tone: 'amber' as const, dot: '#D97706' }
  if (s === 'OCCUPIED') return { label: 'Occupied', tone: 'green' as const, dot: '#16A34A' }
  if (s === 'SOLD') return { label: 'Sold', tone: 'slate' as const, dot: '#64748B' }
  if (isVacantStatus(status)) return { label: 'Vacant', tone: 'amber' as const, dot: '#F59E0B' }
  return { label: status || 'Unit', tone: 'slate' as const, dot: '#94A3B8' }
}

export default function OwnerPropertyBoard() {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [propertyFilter, setPropertyFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() => parseStatusFilter(searchParams.get('status')))
  const [sortBy, setSortBy] = useState<SortKey>('number')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const role = user?.role || 'owner'
  const basePath = location.pathname.startsWith('/cashier')
    ? '/cashier'
    : location.pathname.startsWith('/accountant')
      ? '/accountant'
      : '/owner'
  const canManageProperties = role === 'owner'
  const isStaffPortfolio = role === 'cashier' || role === 'accountant'

  useEffect(() => {
    setStatusFilter(parseStatusFilter(searchParams.get('status')))
  }, [searchParams])

  const updateStatusFilter = (next: StatusFilter) => {
    setStatusFilter(next)
    const params = new URLSearchParams(searchParams)
    if (next === 'all') params.delete('status')
    else params.set('status', next)
    setSearchParams(params, { replace: true })
  }

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      try {
        // Prefer dashboard endpoints — owner CRUD routes 403 for cashier/accountant.
        const [propRes, unitRes, conRes, payRes] = await Promise.all([
          api.get('/owner/dashboard/properties').catch(() =>
            api.get('/owner/properties').catch(() => ({ data: { data: { properties: [] } } })),
          ),
          api.get('/owner/units').catch(() => ({ data: { data: { units: [] } } })),
          api.get('/owner/contracts').catch(() => ({ data: { data: { contracts: [] } } })),
          api.get('/owner/payments').catch(() =>
            api.get('/staff/finance/payments', { params: { page: 1 } }).catch(() => ({ data: { data: { payments: [] } } })),
          ),
        ])
        if (cancelled) return
        const props = propRes.data?.data?.properties || propRes.data?.data || []
        const unitList = unitRes.data?.data?.units || unitRes.data?.data || []
        const contractList = conRes.data?.data?.contracts || conRes.data?.data || []
        const paymentList = payRes.data?.data?.payments || payRes.data?.data || []
        setProperties(Array.isArray(props) ? props : [])
        setUnits(Array.isArray(unitList) ? unitList : [])
        setContracts(Array.isArray(contractList) ? contractList : [])
        setPayments(Array.isArray(paymentList) ? paymentList : [])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])

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

  const earnedByContract = useMemo(() => {
    const map = new Map<number, number>()
    payments.forEach((p) => {
      if (!p.contract_id) return
      const type = (p.type || '').toLowerCase()
      if (type.includes('dewa') || type.includes('deposit') || type.includes('security')) return
      map.set(p.contract_id, (map.get(p.contract_id) || 0) + (Number(p.amount) || 0))
    })
    return map
  }, [payments])

  const propertyNameById = useMemo(() => {
    const map = new Map<number, string>()
    properties.forEach((p) => map.set(p.id, p.name))
    units.forEach((u) => {
      const id = u.property_id || u.property?.id
      if (!id || map.has(id)) return
      map.set(id, u.property?.name || u.propertyName || `Property #${id}`)
    })
    return map
  }, [properties, units])

  const enrichedUnits = useMemo(() => {
    return units.map((unit) => {
      const propId = unit.property_id || unit.property?.id || 0
      const propertyName = propertyNameById.get(propId) || unit.property?.name || unit.propertyName || '—'
      const contract = contractByUnit.get(unit.id)
      const rent = Number(contract?.rent_amount ?? unit.price ?? 0) || 0
      const due = Number(contract?.due ?? 0) || 0
      const paidFromApi = contract?.id ? (earnedByContract.get(contract.id) || 0) : 0
      const earned = paidFromApi > 0
        ? paidFromApi
        : (isOccupiedStatus(unit.status) || (contract?.status || '').toLowerCase() === 'active')
          ? Math.max(0, rent - due)
          : 0
      const typeLabel = getUnitTag(unit.type, unit.category)
      const onCase = !!contract?.on_case
      return { unit, propId, propertyName, contract, rent, due, earned, typeLabel, onCase }
    })
  }, [units, propertyNameById, contractByUnit, earnedByContract])

  const unitTypes = useMemo(() => {
    const set = new Set<string>()
    enrichedUnits.forEach((r) => set.add(r.typeLabel))
    return Array.from(set).sort()
  }, [enrichedUnits])

  const counts = useMemo(() => {
    let occupied = 0
    let vacant = 0
    let onCase = 0
    let booked = 0
    enrichedUnits.forEach((r) => {
      if (r.onCase) onCase += 1
      if (isOccupiedStatus(r.unit.status)) occupied += 1
      else if (isVacantStatus(r.unit.status)) vacant += 1
      else if (isBookedStatus(r.unit.status)) booked += 1
    })
    return { all: enrichedUnits.length, occupied, vacant, onCase, booked }
  }, [enrichedUnits])

  const visibleUnits = useMemo(() => {
    const q = search.trim().toLowerCase()
    let rows = enrichedUnits.filter((row) => {
      if (propertyFilter !== 'all' && String(row.propId) !== propertyFilter) return false
      if (typeFilter !== 'all' && row.typeLabel !== typeFilter) return false

      if (statusFilter === 'occupied') return isOccupiedStatus(row.unit.status)
      if (statusFilter === 'vacant') return isVacantStatus(row.unit.status)
      if (statusFilter === 'booked') return isBookedStatus(row.unit.status)
      if (statusFilter === 'on_case') return row.onCase

      if (!q) return true
      return (
        String(row.unit.number).toLowerCase().includes(q)
        || row.typeLabel.toLowerCase().includes(q)
        || row.propertyName.toLowerCase().includes(q)
        || String(row.unit.id).includes(q)
        || (row.unit.type || '').toLowerCase().includes(q)
      )
    })

    rows = [...rows].sort((a, b) => {
      if (sortBy === 'rent_desc') return b.rent - a.rent
      if (sortBy === 'rent_asc') return a.rent - b.rent
      if (sortBy === 'status') {
        return statusMeta(a.unit.status, a.onCase).label.localeCompare(statusMeta(b.unit.status, b.onCase).label)
      }
      return String(a.unit.number).localeCompare(String(b.unit.number), undefined, { numeric: true })
    })

    return rows
  }, [enrichedUnits, search, propertyFilter, typeFilter, statusFilter, sortBy])

  if (isLoading) {
    return (
      <div className="gfh-portal-page" style={{ padding: '48px 20px', textAlign: 'center', color: THEME.textMuted }}>
        <style>{portalPageCss}</style>
        Loading portfolio…
      </div>
    )
  }

  if (enrichedUnits.length === 0) {
    return (
      <div className="gfh-portal-page" style={{ padding: '48px 20px', textAlign: 'center' }}>
        <style>{portalPageCss}</style>
        <div style={{ fontSize: 16, fontWeight: 600, color: THEME.ink, marginBottom: 8 }}>No properties yet</div>
        <div style={{ fontSize: 13, color: THEME.textMuted, marginBottom: 16 }}>
          {canManageProperties
            ? 'Add a property to see units on this board.'
            : 'No units are available for this account yet.'}
        </div>
        {canManageProperties ? (
          <Link
            to="/owner/properties/add"
            style={{
              display: 'inline-flex',
              padding: '10px 16px',
              borderRadius: 8,
              background: '#10B981',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            Add Property
          </Link>
        ) : (
          <Link
            to={`${basePath}/dashboard`}
            style={{
              display: 'inline-flex',
              padding: '10px 16px',
              borderRadius: 8,
              background: '#10B981',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            Back to dashboard
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: 'var(--font-sans)', width: '100%', boxSizing: 'border-box' }}>
      <style>{`
        ${portalPageCss}
        .gfh-pf-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          background: #FFFFFF;
          border: 1px solid ${THEME.border};
          border-radius: 14px;
          padding: 14px 16px;
          margin-bottom: 14px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }
        .gfh-pf-search {
          position: relative;
          flex: 1 1 240px;
          min-width: 200px;
        }
        .gfh-pf-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          display: flex;
          pointer-events: none;
        }
        .gfh-pf-search input,
        .gfh-pf-select {
          width: 100%;
          height: 40px;
          border: 1px solid ${THEME.border};
          border-radius: 10px;
          background: #F8FAFC;
          color: #0F172A;
          font-size: 13.5px;
          font-weight: 500;
          font-family: var(--font-sans);
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }
        .gfh-pf-search input {
          padding: 0 12px 0 38px;
        }
        .gfh-pf-search input:focus,
        .gfh-pf-select:focus {
          background: #FFFFFF;
          border-color: rgba(16, 185, 129, 0.55);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        .gfh-pf-select-wrap {
          position: relative;
          flex: 0 1 150px;
          min-width: 130px;
        }
        .gfh-pf-select {
          appearance: none;
          padding: 0 34px 0 12px;
          cursor: pointer;
        }
        .gfh-pf-select-caret {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94A3B8;
          pointer-events: none;
          display: flex;
        }
        .gfh-pf-view-toggle {
          display: inline-flex;
          gap: 6px;
          margin-left: auto;
          flex-shrink: 0;
        }
        .gfh-pf-view-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid ${THEME.border};
          background: #FFFFFF;
          color: #64748B;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .gfh-pf-view-btn.active {
          background: #EFF6FF;
          border-color: #BFDBFE;
          color: #2563EB;
          box-shadow: 0 1px 3px rgba(37, 99, 235, 0.12);
        }
        .gfh-pf-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .gfh-pf-count {
          font-size: 14px;
          font-weight: 700;
          color: #0F172A;
        }
        .gfh-pf-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .gfh-pf-pill {
          border: none;
          border-radius: 999px;
          padding: 7px 12px;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          font-family: var(--font-sans);
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }
        .gfh-pf-pill:hover { transform: translateY(-1px); }
        .gfh-pf-pill.active { box-shadow: inset 0 0 0 1.5px rgba(15, 23, 42, 0.18); }
        .gfh-pf-pill.all { background: #DBEAFE; color: #1D4ED8; }
        .gfh-pf-pill.occupied { background: #DCFCE7; color: #15803D; }
        .gfh-pf-pill.vacant { background: #FFEDD5; color: #C2410C; }
        .gfh-pf-pill.on_case { background: #FEE2E2; color: #B91C1C; }
        .gfh-pf-pill.booked { background: #FEF3C7; color: #B45309; }
        .gfh-pf-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 18px;
        }
        .gfh-pf-grid.list {
          grid-template-columns: 1fr;
        }
        .gfh-pf-card {
          display: flex;
          flex-direction: column;
          background: #FFFFFF;
          border: 1px solid ${THEME.border};
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
          position: relative;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
        }
        .gfh-pf-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.1);
          border-color: #CBD5E1;
          color: inherit;
        }
        .gfh-pf-card:hover .gfh-pf-go {
          background: #EFF6FF;
          color: #2563EB;
          border-color: #BFDBFE;
        }
        .gfh-pf-grid.list .gfh-pf-card {
          flex-direction: row;
          align-items: stretch;
        }
        .gfh-pf-photo-wrap {
          position: relative;
          width: 100%;
          height: 168px;
          background: #F1F5F9;
          flex-shrink: 0;
        }
        .gfh-pf-grid.list .gfh-pf-photo-wrap {
          width: 220px;
          height: auto;
          min-height: 180px;
        }
        .gfh-pf-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .gfh-pf-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(226, 232, 240, 0.9);
          border-radius: 999px;
          padding: 5px 10px;
          font-size: 12px;
          font-weight: 700;
          color: #0F172A;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
        }
        .gfh-pf-badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .gfh-pf-body {
          padding: 16px 16px 0;
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }
        .gfh-pf-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 14px;
        }
        .gfh-pf-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.01em;
          line-height: 1.25;
        }
        .gfh-pf-sub {
          margin: 4px 0 0;
          font-size: 12.5px;
          color: #94A3B8;
          font-weight: 500;
        }
        .gfh-pf-go {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 1px solid ${THEME.border};
          background: #F8FAFC;
          color: #475569;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .gfh-pf-rows {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 14px;
        }
        .gfh-pf-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          font-size: 13px;
        }
        .gfh-pf-row-left {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #94A3B8;
          font-weight: 500;
          min-width: 0;
        }
        .gfh-pf-row-value {
          font-weight: 700;
          color: #0F172A;
          font-variant-numeric: tabular-nums;
          text-align: right;
        }
        .gfh-pf-row-value.blue { color: #2563EB; }
        .gfh-pf-row-value.green { color: #16A34A; }
        .gfh-pf-row-value.muted { color: #94A3B8; }
        .gfh-pf-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: #ECFDF5;
          border-top: 1px solid #BBF7D0;
          padding: 12px 16px;
        }
        .gfh-pf-footer.staff {
          background: #F8FAFC;
          border-top-color: #E2E8F0;
        }
        .gfh-pf-footer-label {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 12.5px;
          font-weight: 600;
          color: #166534;
        }
        .gfh-pf-footer.staff .gfh-pf-footer-label {
          color: #475569;
        }
        .gfh-pf-footer-value {
          font-size: 13.5px;
          font-weight: 700;
          color: #15803D;
          font-variant-numeric: tabular-nums;
        }
        .gfh-pf-footer.staff .gfh-pf-footer-value {
          color: #0F172A;
        }
        .gfh-pf-empty {
          padding: 40px 16px;
          text-align: center;
          color: #94A3B8;
          font-size: 14px;
          background: #FFFFFF;
          border: 1px dashed ${THEME.border};
          border-radius: 14px;
        }
        @media (max-width: 720px) {
          .gfh-pf-view-toggle { margin-left: 0; }
          .gfh-pf-grid.list .gfh-pf-card { flex-direction: column; }
          .gfh-pf-grid.list .gfh-pf-photo-wrap { width: 100%; height: 160px; }
        }
      `}</style>

      {/* Filters toolbar */}
      <div className="gfh-pf-toolbar">
        <div className="gfh-pf-search">
          <span className="gfh-pf-search-icon"><Icon path={icons.search} size={15} /></span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by unit number or type..."
          />
        </div>

        <div className="gfh-pf-select-wrap">
          <select
            className="gfh-pf-select"
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            aria-label="Property"
          >
            <option value="all">All Properties</option>
            {Array.from(propertyNameById.entries())
              .sort((a, b) => a[1].localeCompare(b[1]))
              .map(([id, name]) => (
                <option key={id} value={String(id)}>{name}</option>
              ))}
          </select>
          <span className="gfh-pf-select-caret"><Icon path="M6 9l6 6 6-6" size={12} /></span>
        </div>

        <div className="gfh-pf-select-wrap">
          <select
            className="gfh-pf-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Unit Type"
          >
            <option value="all">All Types</option>
            {unitTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <span className="gfh-pf-select-caret"><Icon path="M6 9l6 6 6-6" size={12} /></span>
        </div>

        <div className="gfh-pf-select-wrap">
          <select
            className="gfh-pf-select"
            value={statusFilter}
            onChange={(e) => updateStatusFilter(e.target.value as StatusFilter)}
            aria-label="Status"
          >
            <option value="all">All Statuses</option>
            <option value="occupied">Occupied</option>
            <option value="vacant">Vacant</option>
            <option value="booked">Booked</option>
            <option value="on_case">On Case</option>
          </select>
          <span className="gfh-pf-select-caret"><Icon path="M6 9l6 6 6-6" size={12} /></span>
        </div>

        <div className="gfh-pf-select-wrap">
          <select
            className="gfh-pf-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            aria-label="Sort By"
          >
            <option value="number">Unit Number</option>
            <option value="rent_desc">Rent: High to Low</option>
            <option value="rent_asc">Rent: Low to High</option>
            <option value="status">Status</option>
          </select>
          <span className="gfh-pf-select-caret"><Icon path="M6 9l6 6 6-6" size={12} /></span>
        </div>

        <div className="gfh-pf-view-toggle">
          <button
            type="button"
            className={`gfh-pf-view-btn${viewMode === 'grid' ? ' active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
          >
            <Icon path={icons.grid} size={16} />
          </button>
          <button
            type="button"
            className={`gfh-pf-view-btn${viewMode === 'list' ? ' active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List view"
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
          >
            <Icon path={icons.list} size={16} />
          </button>
        </div>
      </div>

      {/* Summary + status pills */}
      <div className="gfh-pf-summary">
        <div className="gfh-pf-count">
          {visibleUnits.length} unit{visibleUnits.length === 1 ? '' : 's'} shown
        </div>
        <div className="gfh-pf-pills">
          {([
            { key: 'all', label: 'All', count: counts.all },
            { key: 'occupied', label: 'Occupied', count: counts.occupied },
            { key: 'vacant', label: 'Vacant', count: counts.vacant },
            { key: 'booked', label: 'Booked', count: counts.booked },
            { key: 'on_case', label: 'On Case', count: counts.onCase },
          ] as const).map((pill) => (
            <button
              key={pill.key}
              type="button"
              className={`gfh-pf-pill ${pill.key}${statusFilter === pill.key ? ' active' : ''}`}
              onClick={() => updateStatusFilter(pill.key)}
            >
              {pill.label} ({pill.count})
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {visibleUnits.length === 0 ? (
        <div className="gfh-pf-empty">No units match your filters.</div>
      ) : (
        <div className={`gfh-pf-grid${viewMode === 'list' ? ' list' : ''}`}>
          {visibleUnits.map(({ unit, propertyName, rent, due, earned, typeLabel, onCase }) => {
            const meta = statusMeta(unit.status, onCase)
            return (
              <Link
                key={unit.id}
                to={`${basePath}/units/${unit.id}`}
                className="gfh-pf-card"
                title={`Open unit ${unit.number}`}
              >
                <div className="gfh-pf-photo-wrap">
                  <img
                    className="gfh-pf-photo"
                    src={getDefaultUnitImageUrl(unit.type)}
                    alt={`Unit ${unit.number}`}
                    loading="lazy"
                  />
                  <span className="gfh-pf-badge">
                    <span className="gfh-pf-badge-dot" style={{ background: meta.dot }} />
                    {meta.label}
                  </span>
                </div>

                <div className="gfh-pf-body">
                  <div className="gfh-pf-title-row">
                    <div style={{ minWidth: 0 }}>
                      <h3 className="gfh-pf-title">
                        {unit.number} - {typeLabel}
                      </h3>
                      <p className="gfh-pf-sub">Unit ID: {unit.id}</p>
                    </div>
                    <span className="gfh-pf-go" aria-hidden="true">
                      <Icon path={icons.chevron} size={14} />
                    </span>
                  </div>

                  <div className="gfh-pf-rows">
                    <div className="gfh-pf-row">
                      <span className="gfh-pf-row-left">
                        <Icon path={icons.building} size={14} />
                        Property
                      </span>
                      <span className="gfh-pf-row-value blue">{propertyName}</span>
                    </div>
                    <div className="gfh-pf-row">
                      <span className="gfh-pf-row-left">
                        <Icon path={icons.home} size={14} />
                        Unit Type
                      </span>
                      <span className="gfh-pf-row-value">{typeLabel}</span>
                    </div>
                    <div className="gfh-pf-row">
                      <span className="gfh-pf-row-left">
                        <Icon path={icons.cash} size={14} />
                        Monthly Rent
                      </span>
                      <span className="gfh-pf-row-value">{formatMoney(rent)} AED</span>
                    </div>
                    {isStaffPortfolio ? (
                      <>
                        <div className="gfh-pf-row">
                          <span className="gfh-pf-row-left">
                            <Icon path={icons.alert} size={14} />
                            Due Amount
                          </span>
                          <span className={`gfh-pf-row-value${due > 0 ? '' : ' muted'}`}>
                            {formatMoney(due)} AED
                          </span>
                        </div>
                        <div className="gfh-pf-row">
                          <span className="gfh-pf-row-left">
                            <Icon path={icons.check} size={14} />
                            Status
                          </span>
                          <span className="gfh-pf-row-value">{meta.label}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="gfh-pf-row">
                          <span className="gfh-pf-row-left">
                            <Icon path={icons.alert} size={14} />
                            Due Amount
                          </span>
                          <span className="gfh-pf-row-value">{formatMoney(due)} AED</span>
                        </div>
                        <div className="gfh-pf-row">
                          <span className="gfh-pf-row-left">
                            <Icon path={icons.check} size={14} />
                            Collected
                          </span>
                          <span className={`gfh-pf-row-value${earned > 0 ? ' green' : ' muted'}`}>
                            {formatMoney(earned)} AED
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {isStaffPortfolio ? (
                  <div className="gfh-pf-footer staff">
                    <span className="gfh-pf-footer-label">
                      <Icon path={icons.chevron} size={14} />
                      Unit details
                    </span>
                    <span className="gfh-pf-footer-value">{meta.label}</span>
                  </div>
                ) : (
                  <div className="gfh-pf-footer">
                    <span className="gfh-pf-footer-label">
                      <Icon path={icons.chart} size={14} />
                      Revenue Earned
                    </span>
                    <span className="gfh-pf-footer-value">{formatMoney(earned)} AED</span>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
