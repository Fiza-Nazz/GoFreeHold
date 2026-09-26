import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import { money, requestError } from '../../components/rbac/helpers'
import '../../components/rbac/rbac.css'

export default function FinancePage(){
 const {user}=useAuthStore(),location=useLocation()
 const kind=location.pathname.endsWith('/new')?'new':location.pathname.split('/').pop()||'dashboard'
 const base='/'+user?.role
 const [data,setData]=useState<any>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[notice,setNotice]=useState('')
 const [page,setPage]=useState(1),[revision,refresh]=useState(0),[filters,setFilters]=useState({from:'',to:'',contract_id:'',property_id:'',type:''})
 const [contracts,setContracts]=useState<any[]>([])
 const [form,setForm]=useState({contract_id:'',amount:'',type:'rent',mode:'cash',date:'',due_date:'',reference_number:'',remarks:''})
 const [key,setKey]=useState(()=>crypto.randomUUID())
 useEffect(()=>{setPage(1);setNotice('')},[kind])
 useEffect(()=>{
 const c=new AbortController();setLoading(true);setData(null);setError('')
 if(kind==='profile'){setLoading(false);return()=>c.abort()}
 const endpoint=kind==='dashboard'?'summary':kind==='new'?'contracts':kind
 const params=Object.fromEntries(Object.entries({...filters,page}).filter(([,v])=>v!==''))
 api.get('/staff/finance/'+endpoint,{params,signal:c.signal}).then(({data})=>{setData(data.data);if(kind==='new')setContracts(data.data.contracts)}).catch(e=>{if(!c.signal.aborted)setError(requestError(e))}).finally(()=>{if(!c.signal.aborted)setLoading(false)})
 if(kind==='new')api.get('/staff/finance/summary',{signal:c.signal}).then(({data})=>setForm(f=>({...f,date:f.date||data.data.business_date}))).catch(()=>{})
 return()=>c.abort()
 },[kind,filters,page,revision,user?.id])
 async function save(e:React.FormEvent){
 e.preventDefault();setBusy(true);setError('');setNotice('')
 try{const {data}=await api.post('/staff/finance/payments',{...form,due_date:form.due_date||null,idempotency_key:key})
 setNotice('Payment #'+data.data.payment.id+' saved. '+money(data.data.payment.amount));setData((d:any)=>({...d,saved:data.data.payment}))
 }catch(e){setError(requestError(e))}finally{setBusy(false)}
 }
 async function receipt(id:number){setBusy(true);setError('');try{const response=await api.get('/staff/finance/payments/'+id+'/receipt',{responseType:'blob'});const url=URL.createObjectURL(response.data);const a=document.createElement('a');a.href=url;a.download='receipt-'+id+'.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(e){setError(requestError(e))}finally{setBusy(false)}}
  const title=kind==='new'?'Record Payment':kind==='dashboard'?(user?.role==='accountant'?'Accounts Overview':'Collections Overview'):kind==='ledger'?'Rent Ledger':kind==='receivables'?'Receivables':kind==='profile'?'My Profile':'Payments'
  const pagination=data?.payments||data?.entries||(kind==='receivables'?data?.contracts:null)

  const statCards = data && kind === 'dashboard' ? [
    {
      label: 'Collections (Period)',
      sub: 'Total inflows in filter range',
      value: money(data.collections),
      badgeText: 'COLLECTIONS',
      badgeBg: '#ECFDF8', badgeColor: '#065F46', badgeBorder: '#A7F3DC',
      iconBg: '#ECFDF8', iconColor: '#0E5E48', valueColor: '#065F46',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      label: 'Collections Today',
      sub: 'Inflows received today',
      value: money(data.today_collections),
      badgeText: 'TODAY',
      badgeBg: '#F0FDF4', badgeColor: '#166534', badgeBorder: '#BBF7D0',
      iconBg: '#F0FDF4', iconColor: '#16A34A', valueColor: '#166534',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      label: 'Payment Records',
      sub: 'Total recorded transactions',
      value: String(data.payment_count),
      badgeText: 'TRANSACTIONS',
      badgeBg: '#F0F9FF', badgeColor: '#075985', badgeBorder: '#BAE6FD',
      iconBg: '#F0F9FF', iconColor: '#0284C7', valueColor: '#075985',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    },
    {
      label: 'Payments Today',
      sub: 'Transaction count today',
      value: String(data.today_count),
      badgeText: 'TODAY COUNT',
      badgeBg: '#FFFBEB', badgeColor: '#B45309', badgeBorder: '#FDE68A',
      iconBg: '#FFFBEB', iconColor: '#D97706', valueColor: '#B45309',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z'
    },
    {
      label: 'Outstanding Balance',
      sub: 'Total unpaid (all dates)',
      value: money(data.outstanding),
      badgeText: 'RECEIVABLE',
      badgeBg: '#FEF2F2', badgeColor: '#991B1B', badgeBorder: '#FECACA',
      iconBg: '#FEF2F2', iconColor: '#DC2626', valueColor: '#991B1B',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
    },
    ...(user?.role === 'accountant' ? [
      {
        label: 'Ledger Debits',
        sub: 'Period charges & billing',
        value: money(data.total_debit),
        badgeText: 'DEBITS (CHARGES)',
        badgeBg: '#FEF2F2', badgeColor: '#9F1239', badgeBorder: '#FECDD3',
        iconBg: '#FEF2F2', iconColor: '#E11D48', valueColor: '#9F1239',
        icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
      },
      {
        label: 'Ledger Credits',
        sub: 'Period settled & paid',
        value: money(data.total_credit),
        badgeText: 'CREDITS (SETTLED)',
        badgeBg: '#ECFDF8', badgeColor: '#065F46', badgeBorder: '#A7F3DC',
        iconBg: '#ECFDF8', iconColor: '#059669', valueColor: '#065F46',
        icon: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'
      }
    ] : [])
  ] : []

  return <main className="rbac-page">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>{title}</h1>
        <span style={{ fontSize: 13, color: '#64748B' }}>
          {kind === 'dashboard' ? 'Real-time financial performance and collections ledger' : 'Staff operational management'}
        </span>
      </div>
      {kind !== 'new' && (
        <Link
          className="rbac-link"
          to={base + '/payments/new'}
          style={{
            background: '#0E5E48',
            color: '#FFFFFF',
            borderRadius: 8,
            padding: '10px 18px',
            fontSize: 13.5,
            fontWeight: 700,
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

    {error && <div className="rbac-alert" role="alert">{error} <button className="secondary" onClick={() => refresh(v => v + 1)}>Retry</button></div>}
    {notice && <div className="rbac-success" role="status">{notice}</div>}

    {kind === 'profile' ? (
      <section className="rbac-panel" style={{ borderRadius: 16, padding: 30, maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#0E5E48', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800 }}>
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>{user?.name}</h2>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 3 }}>{user?.email}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginTop: 16 }}>
          <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Assigned Role</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0E5E48', marginTop: 4, textTransform: 'uppercase' }}>{user?.role}</div>
          </div>
          <div style={{ background: '#F8FAFC', padding: 14, borderRadius: 10, border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Account Status</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#16A34A', marginTop: 4, textTransform: 'uppercase' }}>{user?.account_status || 'Active'}</div>
          </div>
        </div>
      </section>
    ) : <>
      {kind !== 'new' && (
        <section className="rbac-panel rbac-toolbar" style={{ borderRadius: 14, padding: '18px 22px', border: '1px solid #E2E8F0', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(16,24,40,0.04)' }}>
          {kind !== 'receivables' && <>
            <label>From date<input type="date" value={filters.from} onChange={e => { setPage(1); setFilters({ ...filters, from: e.target.value }) }} /></label>
            <label>To date<input type="date" value={filters.to} onChange={e => { setPage(1); setFilters({ ...filters, to: e.target.value }) }} /></label>
          </>}
          <label>Contract ID<input type="number" min="1" placeholder="Search ID..." value={filters.contract_id} onChange={e => { setPage(1); setFilters({ ...filters, contract_id: e.target.value }) }} /></label>
          <label>Property ID<input type="number" min="1" placeholder="Search ID..." value={filters.property_id} onChange={e => { setPage(1); setFilters({ ...filters, property_id: e.target.value }) }} /></label>
          {(kind === 'dashboard' || kind === 'payments') && (
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 20 }}>
              {statCards.map((card) => (
                <div
                  key={card.label}
                  style={{
                    background: card.iconBg,
                    borderRadius: 14,
                    padding: '20px 22px',
                    border: `1px solid ${card.badgeBorder}`,
                    boxShadow: '0 1px 4px rgba(16, 24, 40, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 130,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: '#FFFFFF',
                      border: `1px solid ${card.badgeBorder}`,
                      color: card.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={card.icon} />
                      </svg>
                    </div>
                    <span style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: '0.4px',
                      textTransform: 'uppercase',
                      background: '#FFFFFF',
                      color: card.badgeColor,
                      border: `1px solid ${card.badgeBorder}`,
                      padding: '3px 9px',
                      borderRadius: 999
                    }}>
                      {card.badgeText}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 23, fontWeight: 800, color: card.valueColor, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                      {card.value}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginTop: 5 }}>
                      {card.label}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
                      {card.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <section className="rbac-panel" style={{ borderRadius: 14, padding: 24, border: '1px solid #E2E8F0', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(16,24,40,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: 0 }}>Collections by Payment Method</h2>
                <div style={{ fontSize: 12, color: '#64748B', background: '#F8FAFC', padding: '4px 10px', borderRadius: 6, border: '1px solid #E2E8F0' }}>
                  Business Date: <strong style={{ color: '#0F172A' }}>{data.business_date}</strong> ({data.timezone})
                </div>
              </div>

              {data.by_method.length ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  {data.by_method.map((m: any) => {
                    const isBank = m.mode.includes('bank')
                    const isCash = m.mode === 'cash'
                    const isCheque = m.mode.includes('cheque')
                    const isCard = m.mode.includes('card')
                    const bg = isBank ? '#F0F9FF' : isCash ? '#ECFDF8' : isCheque ? '#FFFBEB' : isCard ? '#EEF2FF' : '#F8FAFC'
                    const text = isBank ? '#075985' : isCash ? '#065F46' : isCheque ? '#B45309' : isCard ? '#4338CA' : '#334155'
                    const border = isBank ? '#BAE6FD' : isCash ? '#A7F3DC' : isCheque ? '#FDE68A' : isCard ? '#C7D2FE' : '#E2E8F0'
                    return (
                      <div key={m.mode} style={{
                        background: bg,
                        border: `1px solid ${border}`,
                        borderRadius: 12,
                        padding: '16px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: text, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {m.mode.replace('_', ' ')}
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', marginTop: 8 }}>
                          {money(m.total)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p style={{ color: '#64748B', margin: 0 }}>No payments recorded in this period.</p>
              )}
            </section>
          </>
        )}

        {kind === 'new' && (
          <section className="rbac-panel" style={{ borderRadius: 16, padding: 28, border: '1px solid #E2E8F0', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(16,24,40,0.04)' }}>
            {data.saved ? (
              <div>
                <div style={{ display: 'inline-flex', padding: '3px 10px', background: '#ECFDF8', color: '#065F46', border: '1px solid #A7F3DC', borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>
                  Success
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>Payment Recorded Successfully</h2>
                <p style={{ fontSize: 15, color: '#475569', marginBottom: 20 }}>
                  Payment ID: <strong style={{ color: '#0F172A' }}>#{data.saved.id}</strong> · Amount: <strong style={{ color: '#065F46' }}>{money(data.saved.amount)}</strong>
                </p>
                <div className="rbac-actions">
                  <button disabled={busy} onClick={() => void receipt(data.saved.id)} style={{ background: '#0E5E48', color: '#fff', borderRadius: 8, padding: '10px 18px', fontWeight: 600 }}>
                    Download Receipt
                  </button>
                  <Link className="rbac-link" to={base + '/payments'} style={{ background: '#075985', color: '#fff', borderRadius: 8, padding: '10px 18px', fontWeight: 600, textDecoration: 'none' }}>
                    View Payments
                  </Link>
                  <button className="secondary" onClick={() => { setKey(crypto.randomUUID()); setForm({ ...form, amount: '', reference_number: '', remarks: '' }); setNotice(''); setData({ ...data, saved: null }) }} style={{ borderRadius: 8, padding: '10px 18px', fontWeight: 600 }}>
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
                <button disabled={busy || !contracts.length} style={{ background: '#0E5E48', color: '#fff', borderRadius: 8, padding: '12px 24px', fontWeight: 700, fontSize: 14 }}>
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
                        <span style={{ fontSize: 11, fontWeight: 700, background: '#F1F5F9', color: '#475569', padding: '2px 7px', borderRadius: 6, textTransform: 'uppercase' }}>
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
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9F1239', textTransform: 'uppercase' }}>Period Debits (Billed)</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#9F1239', marginTop: 2 }}>{money(data.total_debit)}</div>
              </div>
              <div style={{ background: '#ECFDF8', padding: '10px 16px', borderRadius: 10, border: '1px solid #A7F3DC' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#065F46', textTransform: 'uppercase' }}>Period Credits (Paid)</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#065F46', marginTop: 2 }}>{money(data.total_credit)}</div>
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
                          <span style={{ color: balance > 0 ? '#991B1B' : '#065F46', fontWeight: 800, fontSize: 14 }}>
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
  </main>
}
