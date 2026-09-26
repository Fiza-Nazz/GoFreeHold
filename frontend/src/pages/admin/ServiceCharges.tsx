import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { formatDate } from '../../utils/formatDate'
import { THEME, Icon, ICONS, CornerBrackets, portalPageCss } from '../../components/gfh/adminTheme'

interface ServiceCharge {
  id: number
  contract_id: number
  unit_id: number
  charge_type: string
  amount: number
  due_date: string
  paid_date?: string
  status: 'pending' | 'paid' | 'waived'
  notes?: string
  unit?: {
    id: number
    number: string
    property_id?: number
    property?: { id: number; name: string }
  }
}

interface Property {
  id: number
  name: string
  type?: string
  total_units?: number
  owner_id?: number
}

interface Unit {
  id: number
  number: string
  property_id: number
  owner_id?: number
  size?: number | string
  price?: number | string
  monthly_service_charge?: number | string
  quarterly_service_charge?: number | string
  yearly_service_charge?: number | string
  status?: string
}

interface Owner {
  id: number
  name: string
  email?: string
}

const icons = {
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  check: 'M5 13l4 4L19 7',
  alert: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  arrowLeft: 'M10 19l-7-7m0 0l7-7m-7 7h18',
  plus: 'M12 5v14M5 12h14',
  trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
}

const MONTH_NAMES = ['Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026']

export default function ServiceCharges() {
  const navigate = useNavigate()
  const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/owner') ? '/owner' : '/admin'

  const [charges, setCharges] = useState<ServiceCharge[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [filterOwner, setFilterOwner] = useState('all')
  const [filterProperty, setFilterProperty] = useState('all')
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [appliedFilters, setAppliedFilters] = useState({ owner: 'all', property: 'all', period: 'all' })

  // Modals & Active Views
  const [isQuartersOpen, setIsQuartersOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [formData, setFormData] = useState({ contract_id: '', unit_id: '', charge_type: 'maintenance', amount: '', due_date: '', notes: '' })
  const [busy, setBusy] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusTab, setStatusTab] = useState<'all' | 'pending' | 'paid' | 'waived'>('all')

  useEffect(() => {
    fetchInitialData()
  }, [basePath])

  const fetchInitialData = async () => {
    setIsLoading(true)
    try {
      const [chargesRes, propRes, unitsRes, ownersRes] = await Promise.allSettled([
        api.get(`${basePath}/service-charges`),
        api.get(`${basePath}/properties`),
        api.get(`${basePath}/units`),
        api.get(`${basePath}/properties/owners`),
      ])

      if (chargesRes.status === 'fulfilled') {
        setCharges(chargesRes.value.data?.data?.charges || [])
      }
      if (propRes.status === 'fulfilled') {
        setProperties(propRes.value.data?.data?.properties || [])
      }
      if (unitsRes.status === 'fulfilled') {
        setUnits(unitsRes.value.data?.data?.units || [])
      }
      if (ownersRes.status === 'fulfilled') {
        setOwners(ownersRes.value.data?.data?.owner_profiles || [])
      }
    } catch (err) {
      console.error('Error fetching service charges data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setAppliedFilters({
      owner: filterOwner,
      property: filterProperty,
      period: filterPeriod,
    })
  }

  const handleResetFilter = () => {
    setFilterOwner('all')
    setFilterProperty('all')
    setFilterPeriod('all')
    setAppliedFilters({
      owner: 'all',
      property: 'all',
      period: 'all',
    })
  }

  // Filtered properties based on selected owner
  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      if (appliedFilters.owner !== 'all' && String(p.owner_id) !== appliedFilters.owner) return false
      if (appliedFilters.property !== 'all' && String(p.id) !== appliedFilters.property) return false
      return true
    })
  }, [properties, appliedFilters])

  // Filtered charges based on owner, property, and period
  const filteredCharges = useMemo(() => {
    return charges.filter(c => {
      const propId = c.unit?.property_id || c.unit?.property?.id
      if (appliedFilters.property !== 'all' && String(propId) !== appliedFilters.property) {
        return false
      }
      if (appliedFilters.owner !== 'all') {
        const prop = properties.find(p => p.id === propId)
        if (prop && String(prop.owner_id) !== appliedFilters.owner) return false
      }
      if (appliedFilters.period !== 'all' && c.due_date) {
        const year = c.due_date.substring(0, 4)
        if (appliedFilters.period === '2026' && year !== '2026') return false
        if (appliedFilters.period === '2025' && year !== '2025') return false
      }
      return true
    })
  }, [charges, properties, appliedFilters])

  // Property Breakdown Calculation
  const propertyBreakdown = useMemo(() => {
    const list = filteredProperties.length > 0 ? filteredProperties : properties
    const calculated = list.map(prop => {
      const propUnits = units.filter(u => u.property_id === prop.id)
      const propCharges = filteredCharges.filter(c => {
        const pId = c.unit?.property_id || c.unit?.property?.id
        return pId === prop.id || c.unit?.property?.name === prop.name
      })

      const billed = propCharges.reduce((sum, c) => sum + Number(c.amount || 0), 0)
      const paid = propCharges.filter(c => c.status === 'paid').reduce((sum, c) => sum + Number(c.amount || 0), 0)
      const outstanding = Math.max(0, billed - paid)

      const unitCount = Math.max(propUnits.length, Number(prop.total_units || 0), 1)

      // Paul Brit Simple Calculation Rule:
      // 1. Each unit has a defined monthly cost of service charge (monthly_service_charge)
      // 2. monthly X 3 = quarter charge
      // 3. monthly X 12 = yearly cost (quarterly X 4)
      const unitsWithSC = propUnits.filter(u => Number(u.monthly_service_charge || 0) > 0)
      let approxMonthly = 0

      if (unitsWithSC.length > 0) {
        const sumSC = unitsWithSC.reduce((sum, u) => sum + Number(u.monthly_service_charge || 0), 0)
        const avgRate = sumSC / unitsWithSC.length
        approxMonthly = sumSC + Math.max(0, unitCount - unitsWithSC.length) * avgRate
      } else if (billed > 0) {
        approxMonthly = billed / 12
      } else {
        // Paul Brit standard default: AED 250 / unit / month
        approxMonthly = unitCount * 250
      }

      // monthly X 3 = quarter charge, likewise
      const approxQuarter = approxMonthly * 3
      // then calculate yearly cost
      const approxYearly = approxMonthly * 12

      return {
        id: prop.id,
        name: prop.name,
        units: unitCount,
        approxMonthly,
        approxQuarter,
        approxYearly,
        billed,
        paid,
        outstanding,
      }
    })

    // Sort so properties with billed charges / higher unit count appear at the top
    return calculated.sort((a, b) => b.billed - a.billed || b.units - a.units)
  }, [filteredProperties, properties, units, filteredCharges])

  // Aggregated KPI Stats
  const approxMonthlyTotal = useMemo(() => propertyBreakdown.reduce((sum, p) => sum + p.approxMonthly, 0), [propertyBreakdown])
  const approxQuarterTotal = useMemo(() => approxMonthlyTotal * 3, [approxMonthlyTotal])
  const approxYearlyTotal = useMemo(() => approxMonthlyTotal * 12, [approxMonthlyTotal])
  const totalBilled = useMemo(() => propertyBreakdown.reduce((sum, p) => sum + p.billed, 0), [propertyBreakdown])
  const totalPaid = useMemo(() => propertyBreakdown.reduce((sum, p) => sum + p.paid, 0), [propertyBreakdown])
  const totalOutstanding = useMemo(() => Math.max(0, totalBilled - totalPaid), [totalBilled, totalPaid])

  // Units Missing Monthly Service Charge
  const unitsMissingEstimate = useMemo(() => {
    return units.filter(u => !u.monthly_service_charge || Number(u.monthly_service_charge) <= 0).length
  }, [units])

  // Monthly Billed vs Paid Data for Chart
  const monthlyData = useMemo(() => {
    return MONTH_NAMES.map(mName => {
      const [mStr, yStr] = mName.split(' ')
      const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(mStr) + 1
      const padMonth = monthIndex < 10 ? `0${monthIndex}` : `${monthIndex}`
      const datePrefix = `${yStr}-${padMonth}`

      const matched = filteredCharges.filter(c => c.due_date && c.due_date.startsWith(datePrefix))
      const billedVal = matched.reduce((s, c) => s + Number(c.amount || 0), 0)
      const paidVal = matched.filter(c => c.status === 'paid').reduce((s, c) => s + Number(c.amount || 0), 0)

      return {
        month: mName,
        billed: billedVal,
        paid: paidVal,
      }
    })
  }, [filteredCharges])

  // Donut chart calculations
  const donutData = useMemo(() => {
    const total = totalPaid + totalOutstanding
    if (total <= 0) return { paidPct: 0, outPct: 100, paidDeg: 0 }
    const paidPct = Math.round((totalPaid / total) * 100)
    const outPct = 100 - paidPct
    const paidDeg = (paidPct / 100) * 360
    return { paidPct, outPct, paidDeg }
  }, [totalPaid, totalOutstanding])

  // Filtered charges for the records table
  const recordCharges = useMemo(() => {
    return filteredCharges.filter(c => {
      if (statusTab !== 'all' && c.status !== statusTab) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const unitNum = c.unit?.number?.toLowerCase() || ''
        const propName = c.unit?.property?.name?.toLowerCase() || ''
        const chargeType = c.charge_type?.toLowerCase() || ''
        const notes = c.notes?.toLowerCase() || ''
        return unitNum.includes(q) || propName.includes(q) || chargeType.includes(q) || notes.includes(q)
      }
      return true
    })
  }, [filteredCharges, statusTab, searchQuery])

  // Create Service Charge
  const handleCreateCharge = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      await api.post(`${basePath}/service-charges`, formData)
      setIsAddModalOpen(false)
      setFormData({ contract_id: '', unit_id: '', charge_type: 'maintenance', amount: '', due_date: '', notes: '' })
      fetchInitialData()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating service charge')
    } finally {
      setBusy(false)
    }
  }

  const markPaid = async (id: number) => {
    try {
      await api.put(`${basePath}/service-charges/${id}`, { status: 'paid', paid_date: new Date().toISOString().split('T')[0] })
      fetchInitialData()
    } catch { alert('Error updating charge') }
  }

  const markWaived = async (id: number) => {
    try {
      await api.put(`${basePath}/service-charges/${id}`, { status: 'waived' })
      fetchInitialData()
    } catch { alert('Error updating charge') }
  }

  const deleteCharge = async (id: number) => {
    if (!window.confirm('Delete this service charge?')) return
    try {
      await api.delete(`${basePath}/service-charges/${id}`)
      fetchInitialData()
    } catch { alert('Error deleting charge') }
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', system-ui, sans-serif", padding: '24px 32px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <style>{portalPageCss}</style>

      {/* Top Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
          Financial Management &bull; Service Charges
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
              Service charge analytics
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={() => setIsQuartersOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                fontSize: 12.5,
                fontWeight: 600,
                borderRadius: 4,
                border: '1px solid #f59e0b',
                background: '#fffbeb',
                color: '#d97706',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon path={icons.calendar} size={14} />
              Service charge quarters
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                fontSize: 12.5,
                fontWeight: 600,
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              <Icon path={icons.arrowLeft} size={13} />
              Back
            </button>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                fontSize: 12.5,
                fontWeight: 600,
                borderRadius: 4,
                border: 'none',
                background: '#10B981',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(6, 95, 70, 0.25)',
              }}
            >
              <Icon path={icons.plus} size={13} />
              Add Service Charge
            </button>
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '16px 20px', marginBottom: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <form onSubmit={handleApplyFilter} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) 180px', gap: 16, alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
              Owner
            </label>
            <select
              value={filterOwner}
              onChange={e => setFilterOwner(e.target.value)}
              style={{ width: '100%', height: 38, padding: '7px 10px', fontSize: 13, borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a' }}
            >
              <option value="all">All Owners</option>
              {owners.map(o => (
                <option key={o.id} value={String(o.id)}>{o.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
              Property
            </label>
            <select
              value={filterProperty}
              onChange={e => setFilterProperty(e.target.value)}
              style={{ width: '100%', height: 38, padding: '7px 10px', fontSize: 13, borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a' }}
            >
              <option value="all">All Properties</option>
              {properties.map(p => (
                <option key={p.id} value={String(p.id)}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
              Period
            </label>
            <select
              value={filterPeriod}
              onChange={e => setFilterPeriod(e.target.value)}
              style={{ width: '100%', height: 38, padding: '7px 10px', fontSize: 13, borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a' }}
            >
              <option value="all">All Periods</option>
              <option value="2026">Year 2026</option>
              <option value="2025">Year 2025</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="submit"
              style={{
                flex: 1,
                height: 38,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 4,
                border: 'none',
                background: '#0284c7',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(2, 132, 199, 0.3)',
              }}
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleResetFilter}
              style={{
                height: 38,
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Yellow / Amber Callout */}
      <div style={{
        background: '#fffbeb',
        border: '1px solid #fef08a',
        borderLeft: '4px solid #f59e0b',
        borderRadius: 4,
        padding: '12px 18px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
      }}>
        <div style={{ color: '#d97706', display: 'flex', alignItems: 'center' }}>
          <Icon path={icons.alert} size={18} />
        </div>
        <span style={{ fontSize: 13, color: '#b45309', fontWeight: 600 }}>
          {unitsMissingEstimate} Units missing monthly service charge
        </span>
        <span style={{ fontSize: 11.5, color: '#92400e', marginLeft: 4 }}>
          &mdash; Monthly cost of service charge field needed on units (Quarterly = Monthly &times; 3)
        </span>
      </div>

      {/* 4 Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        {/* Card 1: Approx Yearly */}
        <div style={{ background: '#ECFEFF', border: '1px solid #A5F3FC', borderRadius: 10, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
            <Icon path={icons.calendar} size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#0E7490', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Approx yearly</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0E7490', marginTop: 2 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0E7490', marginRight: 3 }}>AED</span>
              {approxYearlyTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 11, color: '#0891B2', marginTop: 2 }}>Annualized projection</div>
          </div>
        </div>

        {/* Card 2: Approx Quarter */}
        <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 10, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
            <Icon path={icons.calendar} size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#0369A1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Approx quarter</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0369A1', marginTop: 2 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#0369A1', marginRight: 3 }}>AED</span>
              {approxQuarterTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 11, color: '#0284C7', marginTop: 2 }}>Quarterly cycle baseline</div>
          </div>
        </div>

        {/* Card 3: Paid */}
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
            <Icon path={icons.check} size={20} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#15803D', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Paid</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#15803D', marginTop: 2 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#15803D', marginRight: 3 }}>AED</span>
              {totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 11, color: '#16A34A', fontWeight: 600, marginTop: 2 }}>{donutData.paidPct}% collected</div>
          </div>
        </div>

        {/* Card 4: Outstanding */}
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 900, fontSize: 20 }}>
            !
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#B91C1C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Outstanding</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#B91C1C', marginTop: 2 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: '#B91C1C', marginRight: 3 }}>AED</span>
              {totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 11, color: '#DC2626', fontWeight: 600, marginTop: 2 }}>{donutData.outPct}% pending</div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Left Chart: Billed vs paid by month */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 4, padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11.5, color: '#64748b', marginBottom: 4 }}>
                Billed: {totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} &nbsp;&nbsp; Approx monthly: {approxMonthlyTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Billed vs paid by month
              </h3>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11.5, color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, background: '#38bdf8', display: 'inline-block', borderRadius: 2 }} />
                <span>Billed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, background: '#f97316', display: 'inline-block', borderRadius: 2 }} />
                <span>Paid</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 14, height: 2, background: '#f59e0b', display: 'inline-block' }} />
                <span>Approx monthly</span>
              </div>
            </div>
          </div>

          {/* SVG Bar + Line Chart */}
          <div style={{ width: '100%', height: 260, position: 'relative' }}>
            <svg viewBox="0 0 700 240" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              {/* Y Axis Grid Lines */}
              {[0, 100000, 200000, 300000, 400000, 500000, 600000].map(val => {
                const yPos = 200 - (val / 600000) * 180
                return (
                  <g key={val}>
                    <line x1="70" y1={yPos} x2="680" y2={yPos} stroke="#f1f5f9" strokeWidth="1" />
                    <text x="64" y={yPos + 4} textAnchor="end" fontSize="9" fill="#94a3b8" fontFamily="system-ui">
                      {val.toLocaleString()}
                    </text>
                  </g>
                )
              })}

              {/* Benchmark Line (Approx Monthly) */}
              {(() => {
                const yLine = 200 - (Math.min(approxMonthlyTotal, 600000) / 600000) * 180
                return (
                  <g>
                    <line x1="70" y1={yLine} x2="680" y2={yLine} stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
                  </g>
                )
              })()}

              {/* Monthly Bars */}
              {monthlyData.map((d, idx) => {
                const slotWidth = (680 - 75) / 12
                const xSlot = 75 + idx * slotWidth
                const barWidth = 13

                const billedHeight = (Math.min(d.billed, 600000) / 600000) * 180
                const yBilled = 200 - billedHeight

                const paidHeight = (Math.min(d.paid, 600000) / 600000) * 180
                const yPaid = 200 - paidHeight

                return (
                  <g key={d.month}>
                    {/* Billed Bar */}
                    {d.billed > 0 && (
                      <rect
                        x={xSlot}
                        y={yBilled}
                        width={barWidth}
                        height={billedHeight}
                        fill="#38bdf8"
                        rx="1"
                      >
                        <title>{`${d.month} Billed: AED ${d.billed.toLocaleString()}`}</title>
                      </rect>
                    )}

                    {/* Paid Bar */}
                    {d.paid > 0 && (
                      <rect
                        x={xSlot + barWidth + 2}
                        y={yPaid}
                        width={barWidth}
                        height={paidHeight}
                        fill="#f97316"
                        rx="1"
                      >
                        <title>{`${d.month} Paid: AED ${d.paid.toLocaleString()}`}</title>
                      </rect>
                    )}

                    {/* Month Label */}
                    <text
                      x={xSlot + barWidth}
                      y="218"
                      textAnchor="middle"
                      fontSize="9"
                      fill="#64748b"
                      fontFamily="system-ui"
                    >
                      {d.month.split(' ')[0]}
                    </text>
                    <text
                      x={xSlot + barWidth}
                      y="230"
                      textAnchor="middle"
                      fontSize="8"
                      fill="#94a3b8"
                      fontFamily="system-ui"
                    >
                      {d.month.split(' ')[1]}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* Right Chart: Paid vs outstanding */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 4, padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Paid vs outstanding
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11.5, color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', display: 'inline-block' }} />
                <span>Paid</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 8, height: 8, background: '#f43f5e', borderRadius: '50%', display: 'inline-block' }} />
                <span>Outstanding</span>
              </div>
            </div>
          </div>

          {/* Donut Chart */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 200 }}>
            <svg viewBox="0 0 160 160" style={{ width: 170, height: 170 }}>
              {/* Background circle */}
              <circle cx="80" cy="80" r="55" fill="none" stroke="#f1f5f9" strokeWidth="24" />

              {/* Outstanding arc (Full circle base) */}
              <circle
                cx="80"
                cy="80"
                r="55"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="24"
                strokeDasharray="345.58"
                strokeDashoffset="0"
                transform="rotate(-90 80 80)"
              />

              {/* Paid arc */}
              <circle
                cx="80"
                cy="80"
                r="55"
                fill="none"
                stroke="#10b981"
                strokeWidth="24"
                strokeDasharray="345.58"
                strokeDashoffset={345.58 * (1 - (donutData.paidPct / 100))}
                strokeLinecap="butt"
                transform="rotate(-90 80 80)"
              />
            </svg>

            {/* Center Label */}
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                {donutData.paidPct}%
              </div>
              <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Collected
              </div>
            </div>
          </div>

          {/* Donut Metric Footer */}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: '#f0fdf4', padding: '8px 12px', borderRadius: 4, border: '1px solid #dcfce7' }}>
              <div style={{ fontSize: 11, color: '#065f46', fontWeight: 600 }}>Paid</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#065f46', marginTop: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 700, marginRight: 2 }}>AED</span>
                {totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ background: '#fef2f2', padding: '8px 12px', borderRadius: 4, border: '1px solid #fee2e2' }}>
              <div style={{ fontSize: 11, color: '#991b1b', fontWeight: 600 }}>Outstanding</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#991b1b', marginTop: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 700, marginRight: 2 }}>AED</span>
                {totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Breakdown Table */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Property breakdown
            </h3>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Aggregated collection metrics by property (click a property name to filter)
            </div>
          </div>
          {appliedFilters.property !== 'all' && (
            <button
              type="button"
              onClick={() => {
                setFilterProperty('all')
                setAppliedFilters(prev => ({ ...prev, property: 'all' }))
              }}
              style={{
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              Clear Property Filter
            </button>
          )}
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : propertyBreakdown.length === 0 ? (
          <p style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>No property breakdown available.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Property</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#475569' }}>Units</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>Approx monthly</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>Approx quarter</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>Billed</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>Paid</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {propertyBreakdown.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="gfh-portal-row"
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                    }}
                  >
                    <td
                      style={{ padding: '10px 12px', fontWeight: 600, color: '#0284c7', cursor: 'pointer' }}
                      title={`Click to filter by ${row.name}`}
                      onClick={() => {
                        setFilterProperty(String(row.id))
                        setAppliedFilters(prev => ({ ...prev, property: String(row.id) }))
                      }}
                    >
                      {row.name}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#1e293b' }}>
                      {row.units}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#1e293b' }}>
                      {row.approxMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#1e293b' }}>
                      {row.approxQuarter.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#1e293b' }}>
                      {row.billed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#065f46', fontWeight: 600 }}>
                      {row.paid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#dc2626', fontWeight: 600 }}>
                      {row.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f8fafc', borderTop: '2px solid #cbd5e1', fontWeight: 800 }}>
                  <td style={{ padding: '12px', color: '#0f172a' }}>Total Portfolio</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#0f172a' }}>
                    {propertyBreakdown.reduce((s, p) => s + p.units, 0)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#0f172a' }}>
                    {approxMonthlyTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#0f172a' }}>
                    {approxQuarterTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#0284c7' }}>
                    {totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#065f46' }}>
                    {totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#dc2626' }}>
                    {totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Service Charge Invoices & Records Section */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 4, padding: '20px 22px', marginTop: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Service Charge Invoices & Records
            </h3>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Live billing transactions across units & properties ({recordCharges.length} records)
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Status tabs */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 4, padding: 3, gap: 2 }}>
              {[
                { id: 'all', label: `All (${filteredCharges.length})` },
                { id: 'pending', label: `Pending (${filteredCharges.filter(c => c.status === 'pending').length})` },
                { id: 'paid', label: `Paid (${filteredCharges.filter(c => c.status === 'paid').length})` },
                { id: 'waived', label: `Waived (${filteredCharges.filter(c => c.status === 'waived').length})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusTab(tab.id as any)}
                  style={{
                    border: 'none',
                    background: statusTab === tab.id ? '#ffffff' : 'transparent',
                    color: statusTab === tab.id ? '#0f172a' : '#64748b',
                    fontWeight: statusTab === tab.id ? 700 : 500,
                    fontSize: 12,
                    padding: '5px 12px',
                    borderRadius: 3,
                    cursor: 'pointer',
                    boxShadow: statusTab === tab.id ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search by unit, property, notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ height: 34, padding: '6px 12px', fontSize: 12.5, borderRadius: 4, border: '1px solid #cbd5e1', width: 240 }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>#</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Property / Unit</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Charge Type</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Due Date</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>Amount (AED)</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: '#475569' }}>Status</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: '#475569' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recordCharges.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                    No service charges match the current filters.
                  </td>
                </tr>
              ) : (
                recordCharges.map((c, idx) => (
                  <tr
                    key={c.id}
                    className="gfh-portal-row"
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                    }}
                  >
                    <td style={{ padding: '8px 10px', color: '#64748b' }}>{c.id}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.unit?.property?.name || 'Property'}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Unit {c.unit?.number || c.unit_id}</div>
                    </td>
                    <td style={{ padding: '8px 10px', textTransform: 'capitalize', color: '#334155' }}>
                      {c.charge_type.replace('_', ' ')}
                    </td>
                    <td style={{ padding: '8px 10px', color: '#475569' }}>
                      {formatDate(c.due_date)}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      {Number(c.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 3,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: c.status === 'paid' ? '#f0fdf4' : c.status === 'waived' ? '#f1f5f9' : '#fffbeb',
                        color: c.status === 'paid' ? '#065f46' : c.status === 'waived' ? '#64748b' : '#b45309',
                        border: `1px solid ${c.status === 'paid' ? '#bbf7d0' : c.status === 'waived' ? '#e2e8f0' : '#fde68a'}`,
                      }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        {c.status !== 'paid' && (
                          <button
                            type="button"
                            onClick={() => markPaid(c.id)}
                            style={{ padding: '4px 8px', fontSize: 11, fontWeight: 600, borderRadius: 3, border: 'none', background: '#10B981', color: '#ffffff', cursor: 'pointer' }}
                          >
                            Mark Paid
                          </button>
                        )}
                        {c.status !== 'waived' && c.status !== 'paid' && (
                          <button
                            type="button"
                            onClick={() => markWaived(c.id)}
                            style={{ padding: '4px 8px', fontSize: 11, fontWeight: 600, borderRadius: 3, border: 'none', background: '#b45309', color: '#ffffff', cursor: 'pointer' }}
                          >
                            Waive
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteCharge(c.id)}
                          style={{ padding: '4px 8px', fontSize: 11, fontWeight: 600, borderRadius: 3, border: 'none', background: '#991b1b', color: '#ffffff', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quarters Modal */}
      {isQuartersOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 720, background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: 24, maxHeight: '85vh', overflowY: 'auto' }}>
            <CornerBrackets />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Service Charge Quarters (2026)
              </h3>
              <button
                type="button"
                onClick={() => setIsQuartersOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Quarter</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Period</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>Estimated (AED)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>Billed (AED)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: '#475569' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { q: 'Q1 2026', period: 'Jan 01 - Mar 31', est: approxQuarterTotal, billed: totalBilled > 0 ? totalBilled : approxQuarterTotal, status: 'Billed' },
                  { q: 'Q2 2026', period: 'Apr 01 - Jun 30', est: approxQuarterTotal, billed: 0, status: 'Upcoming' },
                  { q: 'Q3 2026', period: 'Jul 01 - Sep 30', est: approxQuarterTotal, billed: 0, status: 'Upcoming' },
                  { q: 'Q4 2026', period: 'Oct 01 - Dec 31', est: approxQuarterTotal, billed: 0, status: 'Upcoming' },
                ].map(item => (
                  <tr key={item.q} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#0f172a' }}>{item.q}</td>
                    <td style={{ padding: '10px', color: '#64748b' }}>{item.period}</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#1e293b' }}>
                      {item.est.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600, color: item.billed > 0 ? '#0284c7' : '#94a3b8' }}>
                      {item.billed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        background: item.status === 'Billed' ? '#f0fdf4' : '#f1f5f9',
                        color: item.status === 'Billed' ? '#065f46' : '#64748b',
                      }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                type="button"
                onClick={() => setIsQuartersOpen(false)}
                style={{ padding: '8px 20px', fontSize: 13, fontWeight: 600, borderRadius: 4, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Charge Modal */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 500, background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', padding: 26 }}>
            <CornerBrackets />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Add Service Charge
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCharge} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Contract ID</label>
                  <input
                    type="number"
                    value={formData.contract_id}
                    onChange={e => setFormData({ ...formData, contract_id: e.target.value })}
                    required
                    style={{ width: '100%', padding: '7px 10px', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 4 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>Unit ID</span>
                    {(() => {
                      const selUnit = units.find(u => String(u.id) === String(formData.unit_id))
                      const mSC = Number(selUnit?.monthly_service_charge || 0)
                      if (mSC > 0) {
                        return (
                          <span
                            onClick={() => setFormData(prev => ({ ...prev, amount: String(mSC * 3) }))}
                            style={{ color: '#0284c7', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}
                            title="Click to apply Quarterly amount (Monthly × 3)"
                          >
                            Q: AED {(mSC * 3).toLocaleString()} (apply)
                          </span>
                        )
                      }
                      return null
                    })()}
                  </label>
                  <input
                    type="number"
                    value={formData.unit_id}
                    onChange={e => {
                      const val = e.target.value
                      const selUnit = units.find(u => String(u.id) === String(val))
                      const mSC = Number(selUnit?.monthly_service_charge || 0)
                      setFormData(prev => ({
                        ...prev,
                        unit_id: val,
                        amount: mSC > 0 && !prev.amount ? String(mSC * 3) : prev.amount
                      }))
                    }}
                    required
                    style={{ width: '100%', padding: '7px 10px', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 4 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Charge Type</label>
                  <select
                    value={formData.charge_type}
                    onChange={e => setFormData({ ...formData, charge_type: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 4, background: '#fff' }}
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="utilities">Utilities</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="security">Security</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Amount (AED)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    required
                    style={{ width: '100%', padding: '7px 10px', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 4 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                  required
                  style={{ width: '100%', padding: '7px 10px', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes..."
                  style={{ width: '100%', padding: '7px 10px', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 4, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600, borderRadius: 4, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  style={{ padding: '8px 20px', fontSize: 13, fontWeight: 700, borderRadius: 4, border: 'none', background: '#10B981', color: '#ffffff', cursor: 'pointer' }}
                >
                  Save Charge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
