import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { Icon, ICONS, THEME, portalPageCss } from '../../components/gfh/adminTheme'
import { useAuthStore } from '../../store/authStore'
import { money, requestError } from '../../components/rbac/helpers'
import '../../components/rbac/rbac.css'

const kpiIcons = {
  ...ICONS,
  key: 'M21 2l-2 2m-1.5 1.5L14 9l-1.5-1.5L11 9l-1.5-1.5L8 9 3 14v7h7l5-5 1.5 1.5L18 15l1.5-1.5L21 15l1-1-6.5-6.5',
  home: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  cash: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  booked: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
}

function TrendPill({
  text,
  tone = 'green',
}: {
  text: string
  tone?: 'green' | 'red' | 'slate' | 'amber'
}) {
  const styles = {
    green: { bg: '#DCFCE7', color: '#15803D' },
    red: { bg: '#FEE2E2', color: '#B91C1C' },
    slate: { bg: '#F1F5F9', color: '#64748B' },
    amber: { bg: '#FEF3C7', color: '#B45309' },
  }[tone]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 11,
        fontWeight: 600,
        padding: '3px 8px',
        borderRadius: 999,
        background: styles.bg,
        color: styles.color,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  )
}

/** crypto.randomUUID is missing in some browsers / non-secure (HTTP) contexts */
function createIdempotencyKey() {
  const c = globalThis.crypto as Crypto | undefined
  if (c && typeof c.randomUUID === 'function') return c.randomUUID()
  if (c && typeof c.getRandomValues === 'function') {
    const bytes = new Uint8Array(16)
    c.getRandomValues(bytes)
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }
  return `idem-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

type StaffProperty = { id: number; name: string; city?: string; address?: string }
type StaffUnit = {
  id: number
  number: string
  status?: string
  property_id?: number
  property?: { id: number; name: string; city?: string; address?: string }
}

function BuildingIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v12" />
      <path d="M8 7h1M8 11h1M8 15h1M16 12h1M16 16h1" />
    </svg>
  )
}

export default function FinancePage(){
 const {user}=useAuthStore(),location=useLocation(),navigate=useNavigate()
 const kind=location.pathname.endsWith('/new')?'new':location.pathname.split('/').pop()||'dashboard'
 const base='/'+user?.role
 const [data,setData]=useState<any>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[notice,setNotice]=useState('')
 const [page,setPage]=useState(1),[revision,refresh]=useState(0),[filters,setFilters]=useState({from:'',to:'',contract_id:'',property_id:'',type:''})
 const [contracts,setContracts]=useState<any[]>([])
 const [form,setForm]=useState({contract_id:'',amount:'',type:'rent',mode:'cash',date:'',due_date:'',reference_number:'',remarks:''})
 const [key,setKey]=useState(()=>createIdempotencyKey())
 const [properties, setProperties] = useState<StaffProperty[]>([])
 const [units, setUnits] = useState<StaffUnit[]>([])
 const [selectedUnitId, setSelectedUnitId] = useState('')
 useEffect(()=>{setPage(1);setNotice('')},[kind])
 useEffect(()=>{
 const c=new AbortController();setLoading(true);setData(null);setError('')
 if(kind==='profile'){setLoading(false);return()=>c.abort()}
 const endpoint=kind==='dashboard'?'summary':kind==='new'?'contracts':kind
 const params=Object.fromEntries(Object.entries({...filters,page}).filter(([,v])=>v!==''))
 api.get('/staff/finance/'+endpoint,{params,signal:c.signal}).then(({data})=>{setData(data.data);if(kind==='new')setContracts(data.data.contracts)}).catch(e=>{if(!c.signal.aborted)setError(requestError(e))}).finally(()=>{if(!c.signal.aborted)setLoading(false)})
 if(kind==='new')api.get('/staff/finance/summary',{signal:c.signal}).then(({data})=>setForm(f=>({...f,date:f.date||data.data.business_date}))).catch(()=>{})
 if (kind === 'dashboard') {
   // Prefer dashboard endpoints — /owner/properties CRUD is owner-role only and 403s for staff.
   Promise.all([
     api.get('/owner/dashboard/properties', { signal: c.signal }).catch(() =>
       api.get('/owner/properties', { signal: c.signal }).catch(() => ({ data: { data: { properties: [] } } })),
     ),
     api.get('/owner/units', { signal: c.signal }).catch(() => ({ data: { data: { units: [] } } })),
   ]).then(([pRes, uRes]) => {
     if (c.signal.aborted) return
     const props = pRes.data?.data?.properties || pRes.data?.data || []
     const unitList = uRes.data?.data?.units || uRes.data?.data || []
     setProperties(Array.isArray(props) ? props : [])
     setUnits(Array.isArray(unitList) ? unitList : [])
   }).catch(() => {})
 }
 return()=>c.abort()
 },[kind,filters,page,revision,user?.id])

  const portfolioStats = useMemo(() => {
    const totalProperties = properties.length || new Set(units.map((u) => u.property_id || u.property?.id).filter(Boolean)).size
    let rented = 0
    let booked = 0
    let vacant = 0
    units.forEach((u) => {
      const s = (u.status || '').toUpperCase()
      if (s === 'OCCUPIED' || s === 'RENTED') rented += 1
      else if (s === 'BOOKED') booked += 1
      else if (s === 'AVAILABLE' || s === 'VACANT' || !s) vacant += 1
    })
    const totalUnits = units.length || rented + booked + vacant
    const occupancyPercent = totalUnits > 0 ? Math.round((rented / totalUnits) * 100) : 0
    return { totalProperties, rented, booked, vacant, totalUnits, occupancyPercent }
  }, [properties, units])

  const buildingCards = useMemo(() => {
    const selected = selectedUnitId
      ? units.find((u) => String(u.id) === String(selectedUnitId))
      : null
    const selectedPropId = selected?.property_id || selected?.property?.id

    if (properties.length > 0) {
      return properties
        .filter((p) => !selectedPropId || p.id === selectedPropId)
        .map((p) => ({
          id: p.id,
          name: p.name,
          city: p.city || p.address || '—',
        }))
    }

    const map = new Map<number, { id: number; name: string; city: string }>()
    units.forEach((u) => {
      const id = u.property_id || u.property?.id
      if (!id) return
      if (selectedPropId && id !== selectedPropId) return
      if (!map.has(id)) {
        map.set(id, {
          id,
          name: u.property?.name || `Property #${id}`,
          city: u.property?.city || u.property?.address || '—',
        })
      }
    })
    return [...map.values()]
  }, [properties, units, selectedUnitId])

  const todayLabel = data?.business_date || new Date().toISOString().slice(0, 10)
 async function save(e:React.FormEvent){
 e.preventDefault();setBusy(true);setError('');setNotice('')
 try{const {data}=await api.post('/staff/finance/payments',{...form,due_date:form.due_date||null,idempotency_key:key})
 setNotice('Payment #'+data.data.payment.id+' saved. '+money(data.data.payment.amount));setData((d:any)=>({...d,saved:data.data.payment}))
 }catch(e){setError(requestError(e))}finally{setBusy(false)}
 }
 async function receipt(id:number){setBusy(true);setError('');try{const response=await api.get('/staff/finance/payments/'+id+'/receipt',{responseType:'blob'});const url=URL.createObjectURL(response.data);const a=document.createElement('a');a.href=url;a.download='receipt-'+id+'.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(e){setError(requestError(e))}finally{setBusy(false)}}
  const title=kind==='new'?'Record Payment':kind==='dashboard'?(user?.role==='accountant'?'Accounts Overview':'Collections Overview'):kind==='ledger'?'Rent Ledger':kind==='receivables'?'Receivables':kind==='profile'?'My Profile':'Payments'
  const pagination=data?.payments||data?.entries||(kind==='receivables'?data?.contracts:null)

  const todayCollections = Number(data?.today_collections || 0)
  const dashKpis = [
    {
      to: `${base}/units`,
      label: 'Total Properties',
      value: String(portfolioStats.totalProperties),
      prefix: undefined as string | undefined,
      hint: portfolioStats.totalUnits > 0
        ? `${portfolioStats.totalUnits} unit${portfolioStats.totalUnits === 1 ? '' : 's'} across portfolio`
        : 'No units added yet',
      badge: null as { text: string; tone: 'green' | 'red' | 'slate' | 'amber' } | null,
      icon: kpiIcons.building,
      iconBg: '#DCFCE7',
      iconColor: '#15803D',
    },
    {
      to: `${base}/units?status=OCCUPIED`,
      label: 'Occupied Units',
      value: String(portfolioStats.rented),
      prefix: undefined as string | undefined,
      hint: portfolioStats.totalUnits > 0
        ? `${portfolioStats.occupancyPercent}% occupancy · ${portfolioStats.totalUnits} total units`
        : 'No units to measure yet',
      badge: { text: `${portfolioStats.occupancyPercent}% filled`, tone: 'green' as const },
      icon: kpiIcons.key,
      iconBg: '#DCFCE7',
      iconColor: '#059669',
    },
    {
      to: `${base}/units?status=BOOKED`,
      label: 'Booked Units',
      value: String(portfolioStats.booked),
      prefix: undefined as string | undefined,
      hint: portfolioStats.booked === 0
        ? 'No units currently booked'
        : `${portfolioStats.booked} awaiting move-in`,
      badge: portfolioStats.booked === 0
        ? { text: 'Clear', tone: 'slate' as const }
        : { text: 'Pending', tone: 'amber' as const },
      icon: kpiIcons.booked,
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
    },
    {
      to: `${base}/units?status=AVAILABLE`,
      label: 'Vacant Units',
      value: String(portfolioStats.vacant),
      prefix: undefined as string | undefined,
      hint: portfolioStats.vacant === 0
        ? 'All units currently rented or booked'
        : `${portfolioStats.vacant} available to rent · ${portfolioStats.booked} booked`,
      badge: portfolioStats.vacant === 0
        ? { text: 'Fully leased', tone: 'green' as const }
        : { text: 'Needs attention', tone: 'red' as const },
      icon: kpiIcons.home,
      iconBg: '#FEE2E2',
      iconColor: '#DC2626',
    },
    {
      to: `${base}/payments`,
      label: 'Today Rent Collection',
      value: todayCollections.toLocaleString(undefined, {
        minimumFractionDigits: todayCollections % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      }),
      prefix: 'AED',
      hint: `Collected on ${todayLabel}`,
      badge: { text: 'Today', tone: 'slate' as const },
      icon: kpiIcons.cash,
      iconBg: '#FEF3C7',
      iconColor: '#D97706',
    },
  ]

  return <div className="gfh-portal-page rbac-page">
    {kind !== 'dashboard' && (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>{title}</h1>
          <span style={{ fontSize: 13, color: '#64748B' }}>Staff operational management</span>
        </div>
        {kind !== 'new' && (
          <Link
            className="rbac-link"
            to={base + '/payments/new'}
            style={{
              background: '#10B981',
              color: '#FFFFFF',
              borderRadius: 8,
              padding: '10px 18px',
              fontSize: 13.5,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 8px rgba(14, 94, 72, 0.25)',
              textDecoration: 'none'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Record Payment
          </Link>
        )}
      </div>
    )}

    {error && <div className="rbac-alert" role="alert">{error} <button className="secondary" onClick={() => refresh(v => v + 1)}>Retry</button></div>}
    {notice && <div className="rbac-success" role="status">{notice}</div>}

    {kind === 'profile' ? (
      <section className="rbac-panel" style={{ borderRadius: 16, padding: 30, maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#10B981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 600 }}>
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0F172A', margin: 0 }}>{user?.name}</h2>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 3 }}>{user?.email}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginTop: 16 }}>
          <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Assigned Role</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#10B981', marginTop: 4, textTransform: 'uppercase' }}>{user?.role}</div>
          </div>
          <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Account Status</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#16A34A', marginTop: 4, textTransform: 'uppercase' }}>{user?.account_status || 'Active'}</div>
          </div>
        </div>
      </section>
    ) : <>
      {kind !== 'new' && kind !== 'dashboard' && (
        <section className="rbac-panel rbac-toolbar" style={{ borderRadius: 14, padding: '18px 22px', border: '1px solid #E2E8F0', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(16,24,40,0.04)' }}>
          {kind !== 'receivables' && <>
            <label>From date<input type="date" value={filters.from} onChange={e => { setPage(1); setFilters({ ...filters, from: e.target.value }) }} /></label>
            <label>To date<input type="date" value={filters.to} onChange={e => { setPage(1); setFilters({ ...filters, to: e.target.value }) }} /></label>
          </>}
          <label>Contract ID<input type="number" min="1" placeholder="Search ID..." value={filters.contract_id} onChange={e => { setPage(1); setFilters({ ...filters, contract_id: e.target.value }) }} /></label>
          <label>Property ID<input type="number" min="1" placeholder="Search ID..." value={filters.property_id} onChange={e => { setPage(1); setFilters({ ...filters, property_id: e.target.value }) }} /></label>
          {kind === 'payments' && (
            <label>Category<select value={filters.type} onChange={e => { setPage(1); setFilters({ ...filters, type: e.target.value }) }}>
              <option value="">All categories</option>
              {['rent', 'dewa', 'deposit', 'settlement', 'service_charge', 'other'].map(v => <option key={v}>{v}</option>)}
            </select></label>
          )}
        </section>
      )}

      {loading ? <p role="status" style={{ padding: 20, color: '#64748B' }}>Loading financial data…</p> : data && <>
        {kind === 'dashboard' && (
          <>
            <style>{`
              ${portalPageCss}
              .gfh-dash-card {
                background: #ffffff;
                border: 1px solid ${THEME.border};
                border-radius: 16px;
                padding: 20px 22px;
                box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
                box-sizing: border-box;
              }
              .gfh-kpi-grid {
                display: grid;
                grid-template-columns: repeat(5, minmax(0, 1fr));
                gap: 14px;
                margin-bottom: 18px;
              }
              .gfh-kpi-link {
                text-decoration: none;
                color: inherit;
                transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
              }
              .gfh-kpi-link:hover {
                border-color: #CBD5E1 !important;
                box-shadow: 0 6px 18px rgba(15, 23, 42, 0.07) !important;
                transform: translateY(-1px);
              }
              .gfh-kpi-label {
                font-size: 13px;
                font-weight: 600;
                color: #64748B;
                line-height: 1.3;
              }
              .gfh-kpi-value-row {
                display: flex;
                align-items: baseline;
                gap: 6px;
                margin-top: 8px;
                min-width: 0;
              }
              .gfh-kpi-prefix {
                font-size: 14px;
                font-weight: 700;
                color: #94A3B8;
                letter-spacing: 0.02em;
              }
              .gfh-kpi-value {
                font-size: 28px;
                font-weight: 700;
                color: #0F172A;
                letter-spacing: -0.03em;
                line-height: 1.1;
                font-variant-numeric: tabular-nums;
                word-break: break-word;
              }
              .gfh-kpi-hint {
                margin-top: 8px;
                font-size: 12.5px;
                font-weight: 500;
                color: #94A3B8;
                line-height: 1.35;
              }
              .gfh-staff-panel {
                background: #fff;
                border: 1px solid #E2E8F0;
                border-radius: 14px;
                padding: 16px 18px;
                margin-bottom: 16px;
              }
              .gfh-staff-panel-label {
                font-size: 12px;
                font-weight: 600;
                color: #94A3B8;
                margin-bottom: 8px;
              }
              .gfh-staff-buildings {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                gap: 14px;
              }
              .gfh-staff-building {
                display: flex;
                align-items: center;
                gap: 12px;
                background: #fff;
                border: 1px solid #E2E8F0;
                border-radius: 12px;
                padding: 14px 16px;
                text-decoration: none;
                box-shadow: 0 1px 2px rgba(15,23,42,0.04);
                transition: box-shadow 0.15s ease, border-color 0.15s ease;
              }
              .gfh-staff-building:hover {
                border-color: #CBD5E1;
                box-shadow: 0 4px 12px rgba(15,23,42,0.08);
              }
              .gfh-staff-building-icon {
                width: 44px;
                height: 44px;
                border-radius: 10px;
                background: #475569;
                color: #fff;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              }
              @media (max-width: 1200px) {
                .gfh-kpi-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
              }
              @media (max-width: 800px) {
                .gfh-kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
              }
              @media (max-width: 520px) {
                .gfh-kpi-grid { grid-template-columns: 1fr; }
              }
            `}</style>

            <div className="gfh-kpi-grid">
              {dashKpis.map((card) => (
                <Link
                  key={card.label}
                  to={card.to}
                  className="gfh-dash-card gfh-kpi-link"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 148,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 11,
                        background: card.iconBg,
                        color: card.iconColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon path={card.icon} size={19} />
                    </div>
                    {card.badge ? <TrendPill text={card.badge.text} tone={card.badge.tone} /> : null}
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <div className="gfh-kpi-label">{card.label}</div>
                    <div className="gfh-kpi-value-row">
                      {card.prefix ? <span className="gfh-kpi-prefix">{card.prefix}</span> : null}
                      <span
                        className="gfh-kpi-value"
                        style={{ fontSize: String(card.value).length > 9 ? 22 : 28 }}
                      >
                        {card.value}
                      </span>
                    </div>
                    <div className="gfh-kpi-hint">{card.hint}</div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="gfh-staff-panel">
              <div className="gfh-staff-panel-label">Search</div>
              <select
                value={selectedUnitId}
                onChange={(e) => {
                  const id = e.target.value
                  setSelectedUnitId(id)
                  if (id) navigate(`${base}/units/${id}`)
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 4,
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  fontSize: 14,
                  fontFamily: 'var(--font-sans)',
                  outline: 'none',
                }}
              >
                <option value="">Select Unit</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.property?.name || 'Property'} / {u.number}
                    {u.status ? ` (${u.status})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="gfh-staff-panel">
              <div className="gfh-staff-panel-label">Buildings</div>
              {buildingCards.length === 0 ? (
                <p style={{ margin: 0, color: '#94A3B8', fontSize: 13 }}>No buildings found for this account.</p>
              ) : (
                <div className="gfh-staff-buildings">
                  {buildingCards.map((b) => (
                    <Link
                      key={b.id}
                      to={`${base}/properties/${b.id}`}
                      state={{ propertyName: b.name }}
                      className="gfh-staff-building"
                      title={b.name}
                    >
                      <span className="gfh-staff-building-icon">
                        <BuildingIcon />
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#E67E22', textTransform: 'uppercase', letterSpacing: '0.01em' }}>
                          {b.name}
                        </span>
                        <span style={{ display: 'block', fontSize: 12, color: '#94A3B8', marginTop: 2, textTransform: 'lowercase' }}>
                          {b.city}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {user?.role === 'accountant' && (
              <div className="gfh-staff-panel" style={{ marginBottom: 0 }}>
                <div className="gfh-staff-panel-label">Ledger snapshot</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>Outstanding</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#DC2626' }}>{money(data.outstanding)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>Debits</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#0F172A' }}>{money(data.total_debit)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>Credits</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#16A34A' }}>{money(data.total_credit)}</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {kind === 'new' && (
          <section className="rbac-panel" style={{ borderRadius: 16, padding: 28, border: '1px solid #E2E8F0', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(16,24,40,0.04)' }}>
            {data.saved ? (
              <div>
                <div style={{ display: 'inline-flex', padding: '3px 10px', background: '#ECFDF8', color: '#065F46', border: '1px solid #A7F3DC', borderRadius: 999, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 12 }}>
                  Success
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 600, color: '#0F172A', margin: '0 0 6px' }}>Payment Recorded Successfully</h2>
                <p style={{ fontSize: 15, color: '#475569', marginBottom: 20 }}>
                  Payment ID: <strong style={{ color: '#0F172A' }}>#{data.saved.id}</strong> · Amount: <strong style={{ color: '#065F46' }}>{money(data.saved.amount)}</strong>
                </p>
                <div className="rbac-actions">
                  <button disabled={busy} onClick={() => void receipt(data.saved.id)} style={{ background: '#10B981', color: '#fff', borderRadius: 8, padding: '10px 18px', fontWeight: 600 }}>
                    Download Receipt
                  </button>
                  <Link className="rbac-link" to={base + '/payments'} style={{ background: '#075985', color: '#fff', borderRadius: 8, padding: '10px 18px', fontWeight: 600, textDecoration: 'none' }}>
                    View Payments
                  </Link>
                  <button className="secondary" onClick={() => { setKey(createIdempotencyKey()); setForm({ ...form, amount: '', reference_number: '', remarks: '' }); setNotice(''); setData({ ...data, saved: null }) }} style={{ borderRadius: 8, padding: '10px 18px', fontWeight: 600 }}>
                    New Payment
                  </button>
                </div>
              </div>
            ) : (
              <form className="rbac-form" onSubmit={save}>
                <label className="wide">Contract<select aria-label="Contract" required value={form.contract_id} onChange={e => setForm({ ...form, contract_id: e.target.value })}>
                  <option value="">Select an authorized contract</option>
                  {contracts.map(c => <option key={c.id} value={c.id}>#{c.id} · {c.tenant?.name} · {c.unit?.property?.name} / {c.unit?.number}</option>)}
                </select></label>
                <label>Amount (AED)<input required type="number" min="1" max="99999999.99" step=".01" placeholder="e.g. 1500" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></label>
                <label>Payment date<input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></label>
                <label>Category<select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {['rent', 'dewa', 'deposit', 'settlement', 'service_charge', 'other'].map(v => <option key={v}>{v}</option>)}
                </select></label>
                <label>Method<select value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}>
                  {['cash', 'card', 'bank_transfer', 'cheque', 'online'].map(v => <option key={v}>{v}</option>)}
                </select></label>
                <label>Due date (optional)<input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></label>
                <label>Reference (optional)<input maxLength={100} placeholder="Cheque or bank ref no." value={form.reference_number} onChange={e => setForm({ ...form, reference_number: e.target.value })} /></label>
                <label className="wide">Remarks (optional)<textarea rows={2} maxLength={2000} placeholder="Notes about payment..." value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} /></label>
                <button disabled={busy || !contracts.length} style={{ background: '#10B981', color: '#fff', borderRadius: 8, padding: '12px 24px', fontWeight: 600, fontSize: 14 }}>
                  {busy ? 'Saving Payment…' : 'Save Payment'}
                </button>
                {!contracts.length && <p style={{ color: '#991B1B' }}>No authorized contracts are available under this owner.</p>}
              </form>
            )}
          </section>
        )}

        {kind === 'payments' && (
          <section className="rbac-panel" style={{ borderRadius: 14, padding: 24, border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 14, color: '#64748B' }}>Total Collected: <strong style={{ color: '#065F46', fontSize: 17 }}>{money(data.total_amount)}</strong></span>
            </div>
            <div className="rbac-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Receipt</th>
                    <th>Tenant / Contract</th>
                    <th>Date</th>
                    <th>Category / Method</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.data.map((p: any) => (
                    <tr key={p.id}>
                      <td><strong style={{ color: '#0F172A' }}>#{p.id}</strong></td>
                      <td><strong>{p.tenant?.name}</strong><br /><span style={{ fontSize: 12, color: '#64748B' }}>Contract #{p.contract_id}</span></td>
                      <td>{p.date?.slice(0, 10)}</td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 600, background: '#F1F5F9', color: '#475569', padding: '2px 7px', borderRadius: 6, textTransform: 'uppercase' }}>
                          {p.type}
                        </span>
                        <span style={{ marginLeft: 6, fontSize: 11, color: '#64748B' }}>/ {p.mode}</span>
                      </td>
                      <td><strong style={{ color: '#065F46' }}>{money(p.amount)}</strong></td>
                      <td>
                        <button disabled={busy} className="secondary" onClick={() => void receipt(p.id)} style={{ padding: '6px 12px', fontSize: 12, borderRadius: 6 }}>
                          Receipt PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!data.payments.data.length && <p style={{ color: '#64748B', padding: 14 }}>No payments found matching criteria.</p>}
          </section>
        )}

        {kind === 'ledger' && (
          <section className="rbac-panel" style={{ borderRadius: 14, padding: 24, border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
              <div style={{ background: '#FEF2F2', padding: '10px 16px', borderRadius: 10, border: '1px solid #FECDD3' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#9F1239', textTransform: 'uppercase' }}>Period Debits (Billed)</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#9F1239', marginTop: 2 }}>{money(data.total_debit)}</div>
              </div>
              <div style={{ background: '#ECFDF8', padding: '10px 16px', borderRadius: 10, border: '1px solid #A7F3DC' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#065F46', textTransform: 'uppercase' }}>Period Credits (Paid)</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#065F46', marginTop: 2 }}>{money(data.total_credit)}</div>
              </div>
            </div>
            <div className="rbac-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Contract</th>
                    <th>Description</th>
                    <th>Debit (Charges)</th>
                    <th>Credit (Paid)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.entries.data.map((r: any) => (
                    <tr key={r.id}>
                      <td>{r.date?.slice(0, 10)}</td>
                      <td><strong style={{ color: '#0F172A' }}>#{r.contract_id}</strong></td>
                      <td>{r.description}</td>
                      <td><span style={{ color: Number(r.debit) > 0 ? '#9F1239' : '#64748B', fontWeight: Number(r.debit) > 0 ? 700 : 400 }}>{money(r.debit)}</span></td>
                      <td><span style={{ color: Number(r.credit) > 0 ? '#065F46' : '#64748B', fontWeight: Number(r.credit) > 0 ? 700 : 400 }}>{money(r.credit)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!data.entries.data.length && <p style={{ color: '#64748B', padding: 14 }}>No ledger entries found.</p>}
          </section>
        )}

        {kind === 'receivables' && (
          <section className="rbac-panel" style={{ borderRadius: 14, padding: 24, border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 14 }}>
              Balances include all historical posted debits and credits for authorized contracts.
            </div>
            <div className="rbac-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Contract</th>
                    <th>Tenant / Property</th>
                    <th>Total Debit</th>
                    <th>Total Credit</th>
                    <th>Net Balance Due</th>
                  </tr>
                </thead>
                <tbody>
                  {data.contracts.data.map((c: any) => {
                    const balance = Number(c.total_debit) - Number(c.total_credit)
                    return (
                      <tr key={c.id}>
                        <td><strong style={{ color: '#0F172A' }}>#{c.id}</strong></td>
                        <td><strong>{c.tenant?.name}</strong><br /><span style={{ fontSize: 12, color: '#64748B' }}>{c.unit?.property?.name} / {c.unit?.number}</span></td>
                        <td>{money(c.total_debit)}</td>
                        <td><span style={{ color: '#065F46', fontWeight: 600 }}>{money(c.total_credit)}</span></td>
                        <td>
                          <span style={{ color: balance > 0 ? '#991B1B' : '#065F46', fontWeight: 600, fontSize: 14 }}>
                            {money(balance)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {!data.contracts.data.length && <p style={{ color: '#64748B', padding: 14 }}>No contracts found.</p>}
          </section>
        )}

        {pagination?.last_page && (
          <div className="rbac-actions" style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ borderRadius: 8, padding: '7px 14px' }}>Previous</button>
            <span style={{ fontSize: 13, color: '#64748B' }}>Page {page} of {pagination.last_page}</span>
            <button disabled={page >= pagination.last_page} onClick={() => setPage(page + 1)} style={{ borderRadius: 8, padding: '7px 14px' }}>Next</button>
          </div>
        )}
      </>}
    </>}
  </div>
}
