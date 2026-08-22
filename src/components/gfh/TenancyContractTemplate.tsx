/**
 * TenancyContractTemplate.tsx
 * Pixel-perfect match with Dubai Land Department official tenancy contract.
 * Uses Amiri font for Arabic, html2canvas-compatible inline styles.
 */
import React from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ContractData {
  id: number
  contract_no?: string
  start_date?: string
  end_date?: string
  rent_amount?: number | string
  contract_value?: number | string
  security_deposit?: number | string
  mode_of_payment?: string
  type?: string
  unit?: {
    number?: string; type?: string; size?: number | string
    dhewa_no?: string; property?: { name?: string; address?: string }
  }
  tenant?: { name?: string; email?: string; phone?: string }
  owner?:  { name?: string; email?: string; phone?: string }
  tenancyRes?: {
    contract_no?: string; owner_name?: string; tenant_name?: string
    tenant_email?: string; lessor_email?: string; tenant_phone?: string
    lessor_phone?: string; property_name?: string; location?: string
    property_area?: string|number; property_type?: string; plot_no?: string
    period_from?: string; period_to?: string; annual_rent?: number|string
    security_deposit_amount?: string; property_usage?: string
  }
  tenancyContracts?: Array<{
    addendum_no?: string
    c1?:string; c2?:string; c3?:string; c4?:string
    c5?:string; c6?:string; c7?:string; c8?:string
  }>
  unit_items?: Array<{ name: string; quantity?: number }>
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function pick(...vals: (string|number|null|undefined)[]): string {
  for (const v of vals) if (v !== null && v !== undefined && String(v).trim() !== '' && String(v) !== 'undefined') return String(v)
  return ''
}
function fmtDate(d?: string): string {
  if (!d) return ''
  const dt = new Date(d)
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})
}
function safeNum(v?: number|string): number {
  const n = Number(v)
  return isNaN(n) ? 0 : n
}
function fmtNum(v?: number|string): string {
  const n = safeNum(v)
  return n > 0 ? n.toLocaleString() : ''
}

const ONES = ['','ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE',
  'TEN','ELEVEN','TWELVE','THIRTEEN','FOURTEEN','FIFTEEN','SIXTEEN','SEVENTEEN','EIGHTEEN','NINETEEN']
const TENS = ['','','TWENTY','THIRTY','FORTY','FIFTY','SIXTY','SEVENTY','EIGHTY','NINETY']
function n2w(n: number): string {
  if(n===0) return 'ZERO'
  if(n<20)  return ONES[n]
  if(n<100) return TENS[Math.floor(n/10)]+(n%10?' '+ONES[n%10]:'')
  if(n<1000) return ONES[Math.floor(n/100)]+' HUNDRED'+(n%100?' AND '+n2w(n%100):'')
  if(n<1000000) return n2w(Math.floor(n/1000))+' THOUSAND'+(n%1000?' '+n2w(n%1000):'')
  return n.toLocaleString()
}

// ── Style constants ────────────────────────────────────────────────────────────
const NAVY  = '#1a2b6d'
const RED   = '#c8102e'
const ARFNT = "'Amiri', 'Times New Roman', serif"  // Arabic font
const ENFNT = "'Arial', 'Helvetica', sans-serif"   // English font

// ── Arabic text wrapper ────────────────────────────────────────────────────────
const Ar = ({ children, size=10, bold=false, style={} }: {
  children: React.ReactNode; size?: number; bold?: boolean; style?: React.CSSProperties
}) => (
  <span style={{ fontFamily: ARFNT, fontSize: size, fontWeight: bold?700:400,
    direction: 'rtl', unicodeBidi: 'embed', color: '#555', ...style }}>
    {children}
  </span>
)

// ── Circle checkbox ────────────────────────────────────────────────────────────
const Circle = ({ checked }: { checked: boolean }) => (
  <span style={{
    display:'inline-block', width:13, height:13,
    border:`1.5px solid ${checked?NAVY:'#555'}`,
    borderRadius:'50%', textAlign:'center', lineHeight:'11px',
    fontSize:9, fontWeight:900, color:checked?NAVY:'transparent',
    verticalAlign:'middle',
  }}>
    {checked ? '⊗' : ''}
  </span>
)

// ── Field row — full width dashed underline ────────────────────────────────────
const FR = ({ en, val, ar }: { en:string; val:string; ar:string }) => (
  <tr>
    <td style={{ fontFamily:ENFNT, fontSize:8, color:'#666', whiteSpace:'nowrap',
      paddingBottom:3, paddingTop:3, width:100 }}>
      {en}
    </td>
    <td style={{ fontFamily:ENFNT, fontSize:9, fontWeight:700, color:'#000',
      borderBottom:'1px dashed #bbb', padding:'1px 5px 2px 5px' }}>
      {val}
    </td>
    <td style={{ fontFamily:ARFNT, fontSize:10, color:'#666',
      textAlign:'right', direction:'rtl', unicodeBidi:'embed',
      whiteSpace:'nowrap', paddingLeft:8, width:110 }}>
      {ar}
    </td>
  </tr>
)

// ── Two-column field row ───────────────────────────────────────────────────────
const FR2 = ({en1,val1,ar1,en2,val2,ar2}:{
  en1:string;val1:string;ar1:string;
  en2:string;val2:string;ar2:string;
}) => (
  <tr>
    <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',whiteSpace:'nowrap',paddingTop:3,paddingBottom:3,width:100}}>{en1}</td>
    <td style={{fontFamily:ENFNT,fontSize:9,fontWeight:700,color:'#000',borderBottom:'1px dashed #bbb',padding:'1px 4px 2px 4px',width:120}}>{val1}</td>
    <td style={{fontFamily:ARFNT,fontSize:10,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',whiteSpace:'nowrap',paddingLeft:6,width:120}}>{ar1}</td>
    <td style={{width:8}}/>
    <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',whiteSpace:'nowrap',paddingLeft:6,width:85}}>{en2}</td>
    <td style={{fontFamily:ENFNT,fontSize:9,fontWeight:700,color:'#000',borderBottom:'1px dashed #bbb',padding:'1px 4px 2px 4px'}}>{val2}</td>
    <td style={{fontFamily:ARFNT,fontSize:10,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',whiteSpace:'nowrap',paddingLeft:6,width:110}}>{ar2}</td>
  </tr>
)

// ── Section bar ───────────────────────────────────────────────────────────────
const SecBar = ({ en, ar }: { en:string; ar:string }) => (
  <tr>
    <td colSpan={99}>
      <div style={{ background:NAVY, display:'flex', justifyContent:'space-between',
        alignItems:'center', padding:'5px 10px', marginTop:8, marginBottom:2 }}>
        <span style={{ fontFamily:ENFNT, fontSize:8.5, fontWeight:700, color:'#fff' }}>{en}</span>
        <span style={{ fontFamily:ARFNT, fontSize:12, fontWeight:700, color:'#fff',
          direction:'rtl', unicodeBidi:'embed' }}>{ar}</span>
      </div>
    </td>
  </tr>
)

// ── Clause row ────────────────────────────────────────────────────────────────
const Clause = ({ n, en, ar }: { n:number|string; en:string; ar:string }) => (
  <tr style={{ borderBottom:'1px solid #eef2f7' }}>
    <td style={{ width:18, verticalAlign:'top', paddingTop:4 }}>
      <div style={{ width:14,height:14,border:'1px solid #aaa',borderRadius:'50%',
        textAlign:'center',lineHeight:'12px',fontSize:7,color:'#555',fontWeight:700 }}>{n}</div>
    </td>
    <td style={{ width:'47%', fontFamily:ENFNT, fontSize:7.5, lineHeight:1.4,
      color:'#111', padding:'3px 5px', verticalAlign:'top' }}>{en}</td>
    <td style={{ width:'47%', fontFamily:ARFNT, fontSize:9.5, textAlign:'right',
      color:'#111', padding:'3px 5px', lineHeight:1.5, verticalAlign:'top',
      direction:'rtl', unicodeBidi:'embed' }}>{ar}</td>
    <td style={{ width:18, verticalAlign:'top', paddingTop:4 }}>
      <div style={{ width:14,height:14,border:'1px solid #aaa',borderRadius:'50%',
        textAlign:'center',lineHeight:'12px',fontSize:7,color:'#555',fontWeight:700 }}>{n}</div>
    </td>
  </tr>
)

// ── Signatures ────────────────────────────────────────────────────────────────
const Sigs = () => (
  <table style={{ width:'100%', borderCollapse:'collapse', marginTop:16 }}>
    <tbody>
      <tr>
        {[['إمضاء المستأجر','Tenant Signature'],['إمضاء المؤجر','Landlord Signature']].map(([ar,en])=>(
          <td key={en} style={{ width:'50%', textAlign:'center', padding:'0 16px' }}>
            <div style={{ fontFamily:ARFNT, fontSize:11, fontWeight:700, color:NAVY,
              direction:'rtl', unicodeBidi:'embed' }}>{ar}</div>
            <div style={{ fontFamily:ENFNT, fontSize:8, fontWeight:700, color:NAVY }}>{en}</div>
            <div style={{ borderBottom:'1px dashed #777', marginTop:22 }}/>
            <div style={{ fontFamily:ENFNT, fontSize:7, color:'#777', marginTop:3 }}>
              Date: ................. &nbsp;
              <span style={{ fontFamily:ARFNT, fontSize:8.5, direction:'rtl', unicodeBidi:'embed' }}>التاريخ</span>
            </div>
          </td>
        ))}
      </tr>
    </tbody>
  </table>
)

// ── Footer ────────────────────────────────────────────────────────────────────
const Footer = () => (
  <div style={{ borderTop:`1.5px solid ${NAVY}`, marginTop:10, paddingTop:4,
    fontFamily:ENFNT, fontSize:6.5, color:'#555', textAlign:'center', lineHeight:1.6 }}>
    Tel: 8004488 &nbsp;|&nbsp; Fax: +971 4 222 2251 &nbsp;|&nbsp; P.O.Box 1166, Dubai, U.A.E. &nbsp;|&nbsp;
    Website: www.dubailand.gov.ae &nbsp;|&nbsp; Email: info@dubailand.gov.ae
    <br/>
    <span style={{ fontFamily:ARFNT, fontSize:7.5, direction:'rtl', unicodeBidi:'embed' }}>
      هاتف: 8004488 &nbsp;|&nbsp; فاكس: 4 222 2251 971+ &nbsp;|&nbsp; ص.ب 1166، دبي، الإمارات العربية المتحدة
    </span>
  </div>
)

// ── Land Department SVG Logo ───────────────────────────────────────────────────
const LandLogo = ({ size=56 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
    <circle cx="28" cy="28" r="26" fill="#e8f5e9" stroke="#2e7d32" strokeWidth="2"/>
    <circle cx="28" cy="28" r="22" fill="none" stroke="#43a047" strokeWidth="0.8"/>
    {/* trunk */}
    <rect x="26" y="32" width="4" height="14" fill="#6d4c41" rx="1"/>
    {/* ground */}
    <ellipse cx="28" cy="46" rx="8" ry="2" fill="#a5d6a7"/>
    {/* center frond */}
    <path d="M28 32 Q26 22 28 14 Q30 22 28 32Z" fill="#2e7d32"/>
    {/* left fronds */}
    <path d="M27 30 Q20 22 12 22 Q16 25 20 28 Q22 24 27 30Z" fill="#388e3c"/>
    <path d="M27 31 Q18 26 13 18 Q17 23 22 27 Q23 23 27 31Z" fill="#43a047"/>
    {/* right fronds */}
    <path d="M29 30 Q36 22 44 22 Q40 25 36 28 Q34 24 29 30Z" fill="#388e3c"/>
    <path d="M29 31 Q38 26 43 18 Q39 23 34 27 Q33 23 29 31Z" fill="#43a047"/>
    {/* top fronds */}
    <path d="M27 30 Q22 19 16 14 Q20 20 24 26 Q24 21 27 30Z" fill="#1b5e20"/>
    <path d="M29 30 Q34 19 40 14 Q36 20 32 26 Q32 21 29 30Z" fill="#1b5e20"/>
  </svg>
)

// ── Gov Dubai styled logo (red Arabic calligraphy style) ──────────────────────
const GovDubaiLogo = () => (
  <div>
    <div style={{
      fontFamily: ARFNT, fontSize: 32, fontWeight: 700,
      color: RED, direction: 'rtl', unicodeBidi: 'embed',
      lineHeight: 1.1, letterSpacing: 2,
    }}>
      حكومة دبي
    </div>
    <div style={{ fontFamily: ENFNT, fontSize: 7.5, fontWeight: 700,
      color: RED, letterSpacing: 0.8, marginTop: 2 }}>
      GOVERNMENT OF DUBAI
    </div>
  </div>
)

// ═══════════════════════════════════════════════════════════════════════════════
// Main Template
// ═══════════════════════════════════════════════════════════════════════════════
interface Props {
  data: ContractData
  containerRef: React.RefObject<HTMLDivElement>
}

export default function TenancyContractTemplate({ data, containerRef }: Props) {
  const res  = data.tenancyRes
  const unit = data.unit
  const ten  = data.tenant
  const own  = data.owner
  const add  = data.tenancyContracts?.[0]

  // ── Derived values ───────────────────────────────────────────────────────
  const usage  = pick(res?.property_usage, data.type, 'residential').toLowerCase()
  const isRes  = usage.includes('resid') || usage === 'r'
  const isCom  = usage.includes('comm')  || usage === 'c'
  const isInd  = usage.includes('ind')   || usage === 'i'
  const defRes = !isRes && !isCom && !isInd

  const cNo     = pick(res?.contract_no, data.contract_no, 'GFH-'+String(data.id).padStart(4,'0'))
  const ownerN  = pick(res?.owner_name,  own?.name,  '').toUpperCase()
  const tenN    = pick(res?.tenant_name, ten?.name,  '').toUpperCase()
  const tenEm   = pick(res?.tenant_email, ten?.email, '')
  const lanEm   = pick(res?.lessor_email, own?.email, '')
  const tenPh   = pick(res?.tenant_phone, ten?.phone, '')
  const lanPh   = pick(res?.lessor_phone, own?.phone, '')
  const bld     = pick(res?.property_name, unit?.property?.name, '').toUpperCase()
  const loc     = pick(res?.location, unit?.property?.address, '').toUpperCase()
  const pSz     = pick(res?.property_area, unit?.size, '')
  const pTp     = pick(res?.property_type, unit?.type, '').toUpperCase()
  const pNo     = pick(unit?.number, '')
  const dewa    = pick(unit?.dhewa_no, '')
  const plot    = pick(res?.plot_no, '')
  const pFrom   = fmtDate(pick(data.start_date, res?.period_from))
  const pTo     = fmtDate(pick(data.end_date, res?.period_to))
  const rentAmt = safeNum(pick(res?.annual_rent, data.rent_amount))
  const cValAmt = safeNum(pick(data.contract_value, data.rent_amount))
  const secDep  = pick(String(data.security_deposit??''), res?.security_deposit_amount, '')
  const mop     = pick(data.mode_of_payment, 'MONTHLY').toUpperCase()
  const rentW   = (rentAmt > 0 ? n2w(rentAmt) : 'ZERO') + ' DIRHAMS ONLY'
  const cValW   = (cValAmt > 0 ? n2w(cValAmt) : 'ZERO') + ' DIRHAMS ONLY'

  const t = new Date()
  const dd = String(t.getDate()).padStart(2,'0')
  const mm = String(t.getMonth()+1).padStart(2,'0')
  const yy = String(t.getFullYear())

  // ── Page base style ─────────────────────────────────────────────────────
  const P: React.CSSProperties = {
    width: 794, minHeight: 1123, background: '#fff',
    padding: '24px 30px 44px 30px', fontFamily: ENFNT,
    fontSize: 8, color: '#000', boxSizing: 'border-box',
    position: 'relative', overflow: 'hidden',
  }

  return (
    <div ref={containerRef} style={{ position:'absolute', left:-9999, top:0, zIndex:-1 }}>

      {/* ═══════════════════════ PAGE 1 ═══════════════════════ */}
      <div style={P} id="contract-page-1">

        {/* Watermark */}
        <div style={{
          position:'absolute', top:'42%', left:'50%',
          transform:'translate(-50%,-50%)', opacity:0.035, zIndex:0,
          pointerEvents:'none',
        }}>
          <LandLogo size={340}/>
        </div>

        {/* ── HEADER ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10, position:'relative', zIndex:1 }}>
          {/* Left: Gov Dubai */}
          <GovDubaiLogo/>

          {/* Right: Land Department */}
          <div style={{ textAlign:'right', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2 }}>
            <div style={{ fontFamily:ARFNT, fontSize:14, fontWeight:700, color:NAVY,
              direction:'rtl', unicodeBidi:'embed', letterSpacing:0.5 }}>
              دائرة الأراضي والأملاك
            </div>
            <div style={{ fontFamily:ENFNT, fontSize:8.5, fontWeight:700, color:NAVY }}>
              Land Department
            </div>
            <LandLogo size={52}/>
          </div>
        </div>

        {/* ── TITLE BOX ── */}
        <div style={{
          border:`1.8px solid #4a6fa5`, borderRadius:6,
          display:'flex', marginBottom:10, position:'relative', zIndex:1,
        }}>
          {/* Left: Date + No */}
          <div style={{ width:'34%', padding:'8px 10px', borderRight:'1px solid #4a6fa5' }}>
            {/* Date */}
            <div style={{ display:'flex', alignItems:'center', gap:3, marginBottom:6 }}>
              <span style={{ fontFamily:ENFNT, fontSize:7.5, color:'#444', marginRight:3 }}>Date</span>
              <span style={{ fontFamily:ENFNT, fontSize:9.5, fontWeight:700, borderBottom:'1.2px solid #333', minWidth:20, textAlign:'center', padding:'0 2px' }}>{dd}</span>
              <span style={{ fontFamily:ENFNT, fontSize:9.5, fontWeight:700 }}>/</span>
              <span style={{ fontFamily:ENFNT, fontSize:9.5, fontWeight:700, borderBottom:'1.2px solid #333', minWidth:20, textAlign:'center', padding:'0 2px' }}>{mm}</span>
              <span style={{ fontFamily:ENFNT, fontSize:9.5, fontWeight:700 }}>/</span>
              <span style={{ fontFamily:ENFNT, fontSize:9.5, fontWeight:700, borderBottom:'1.2px solid #333', minWidth:34, textAlign:'center', padding:'0 2px' }}>{yy}</span>
              <span style={{ fontFamily:ARFNT, fontSize:10, color:NAVY, marginLeft:6,
                direction:'rtl', unicodeBidi:'embed' }}>التاريخ</span>
            </div>
            {/* No */}
            <div style={{ display:'flex', alignItems:'center', gap:3 }}>
              <span style={{ fontFamily:ENFNT, fontSize:7.5, color:'#444', marginRight:3 }}>No.</span>
              <span style={{ fontFamily:ENFNT, fontSize:9.5, fontWeight:700, borderBottom:'1.2px solid #333', minWidth:90, padding:'0 4px' }}>{cNo}</span>
              <span style={{ fontFamily:ARFNT, fontSize:10, color:NAVY, marginLeft:6,
                direction:'rtl', unicodeBidi:'embed' }}>الرقم</span>
            </div>
          </div>

          {/* Right: Title */}
          <div style={{ flex:1, textAlign:'center', padding:'6px 12px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <div style={{ fontFamily:ARFNT, fontSize:28, fontWeight:700, color:NAVY,
              letterSpacing:6, direction:'rtl', unicodeBidi:'embed', lineHeight:1.1 }}>
              عـقـد إيـجـار
            </div>
            <div style={{ fontFamily:ENFNT, fontSize:13, fontWeight:700, color:NAVY, letterSpacing:3, marginTop:3 }}>
              TENANCY CONTRACT
            </div>
          </div>
        </div>

        {/* ── PROPERTY USAGE ── */}
        <div style={{ display:'flex', alignItems:'flex-end', gap:0, marginBottom:8, position:'relative', zIndex:1 }}>
          <span style={{ fontFamily:ENFNT, fontSize:8, color:'#666', marginRight:16, whiteSpace:'nowrap' }}>Property Usage</span>

          {[
            { arLabel:'صناعي', enLabel:'Industrial', checked: isInd },
            { arLabel:'تجاري', enLabel:'Commercial',  checked: isCom },
            { arLabel:'سكني',  enLabel:'Residential', checked: isRes || defRes },
          ].map(({ arLabel, enLabel, checked }) => (
            <div key={enLabel} style={{ textAlign:'center', marginRight:22 }}>
              <div style={{ fontFamily:ARFNT, fontSize:10, color:'#444',
                direction:'rtl', unicodeBidi:'embed' }}>{arLabel}</div>
              <div style={{ fontFamily:ENFNT, fontSize:7.5, color:'#666' }}>{enLabel}</div>
              <Circle checked={checked}/>
            </div>
          ))}

          <div style={{ flex:1, textAlign:'right' }}>
            <span style={{ fontFamily:ARFNT, fontSize:10, color:'#666',
              direction:'rtl', unicodeBidi:'embed' }}>استخدام الوحدة</span>
          </div>
        </div>

        {/* ── DATA FIELDS ── */}
        <div style={{ position:'relative', zIndex:1 }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <tbody>
              <FR en="Owner Name"    val={ownerN}  ar="اسم المالك"/>
              <FR en="Landlord Name" val={ownerN}  ar="اسم المؤجر"/>
              <FR en="Tenant Name"   val={tenN}    ar="اسم المستأجر"/>
              <FR2 en1="Tenant Email"  val1={tenEm}  ar1="البريد الالكتروني للمستأجر"
                   en2="Landlord Email" val2={lanEm}  ar2="البريد الالكتروني للمؤجر"/>
              <FR2 en1="Tenant Phone"  val1={tenPh}  ar1="هاتف المستأجر"
                   en2="Landlord Phone" val2={lanPh}  ar2="هاتف المؤجر"/>
              <FR2 en1="Building Name" val1={bld}    ar1="إسم المبنى"
                   en2="Location"       val2={loc}    ar2="المنطقة"/>

              {/* 3-column: Size | Type | No */}
              <tr>
                <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',whiteSpace:'nowrap',paddingTop:3,paddingBottom:3,width:100}}>Property Size (S.M)</td>
                <td style={{fontFamily:ENFNT,fontSize:9,fontWeight:700,color:'#000',borderBottom:'1px dashed #bbb',padding:'1px 4px',width:55}}>{pSz}</td>
                <td style={{fontFamily:ARFNT,fontSize:9.5,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',paddingLeft:4,width:120}}>مساحة الوحدة (متر مربع)</td>
                <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',paddingLeft:6,whiteSpace:'nowrap',width:80}}>Property Type</td>
                <td style={{fontFamily:ENFNT,fontSize:9,fontWeight:700,color:'#000',borderBottom:'1px dashed #bbb',padding:'1px 4px',width:65}}>{pTp}</td>
                <td style={{fontFamily:ARFNT,fontSize:9.5,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',paddingLeft:4,width:70}}>نوع الوحدة</td>
                <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',paddingLeft:6,whiteSpace:'nowrap',width:70}}>Property No.</td>
                <td style={{fontFamily:ENFNT,fontSize:9,fontWeight:700,color:'#000',borderBottom:'1px dashed #bbb',padding:'1px 4px'}}>{pNo}</td>
                <td style={{fontFamily:ARFNT,fontSize:9.5,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',paddingLeft:4,width:65}}>رقم الوحدة</td>
              </tr>

              {/* DEWA / Plot */}
              <tr>
                <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',whiteSpace:'nowrap',paddingTop:3,paddingBottom:3}}>Premises No (DEWA)</td>
                <td colSpan={2} style={{fontFamily:ENFNT,fontSize:9,fontWeight:700,color:'#000',borderBottom:'1px dashed #bbb',padding:'1px 4px'}}>{dewa}</td>
                <td style={{fontFamily:ARFNT,fontSize:9.5,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',paddingLeft:4}}>رقم العقار (ديوا)</td>
                <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',paddingLeft:6,whiteSpace:'nowrap'}}>Plot No.</td>
                <td colSpan={2} style={{fontFamily:ENFNT,fontSize:9,fontWeight:700,color:'#000',borderBottom:'1px dashed #bbb',padding:'1px 4px'}}>{plot}</td>
                <td colSpan={2} style={{fontFamily:ARFNT,fontSize:9.5,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',paddingLeft:4}}>رقم الأرض</td>
              </tr>

              {/* Contract Period */}
              <tr>
                <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',whiteSpace:'nowrap',paddingTop:3,paddingBottom:3}}>Contract Period</td>
                <td colSpan={7} style={{fontFamily:ENFNT,fontSize:9,fontWeight:700,borderBottom:'1px dashed #bbb',padding:'1px 6px'}}>
                  To &nbsp;<strong>{pTo}</strong>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <span style={{fontFamily:ARFNT,fontSize:10,direction:'rtl',unicodeBidi:'embed'}}>إلى</span>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  From &nbsp;<strong>{pFrom}</strong>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <span style={{fontFamily:ARFNT,fontSize:10,direction:'rtl',unicodeBidi:'embed'}}>من</span>
                </td>
                <td style={{fontFamily:ARFNT,fontSize:10,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',whiteSpace:'nowrap',paddingLeft:4}}>فترة الإيجار</td>
              </tr>

              {/* Annual Rent */}
              <tr>
                <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',whiteSpace:'nowrap',paddingTop:3,paddingBottom:3}}>Annual Rent</td>
                <td colSpan={7} style={{fontFamily:ENFNT,fontSize:9,fontWeight:700,borderBottom:'1px dashed #bbb',padding:'1px 6px'}}>
                  <strong>{fmtNum(rentAmt)}</strong>&nbsp;&nbsp;({rentW})
                </td>
                <td style={{fontFamily:ARFNT,fontSize:10,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',whiteSpace:'nowrap',paddingLeft:4}}>الإيجار السنوي</td>
              </tr>

              {/* Contract Value */}
              <tr>
                <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',whiteSpace:'nowrap',paddingTop:3,paddingBottom:3}}>Contract Value</td>
                <td colSpan={7} style={{fontFamily:ENFNT,fontSize:9,fontWeight:700,borderBottom:'1px dashed #bbb',padding:'1px 6px'}}>
                  <strong>{fmtNum(cValAmt)}</strong>&nbsp;&nbsp;({cValW})
                </td>
                <td style={{fontFamily:ARFNT,fontSize:10,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',whiteSpace:'nowrap',paddingLeft:4}}>قيمة العقد</td>
              </tr>

              {/* Security Deposit | MOP */}
              <tr>
                <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',whiteSpace:'nowrap',paddingTop:3}}>Security Deposit Amount</td>
                <td colSpan={2} style={{fontFamily:ENFNT,fontSize:9,fontWeight:700,borderBottom:'1px dashed #bbb',padding:'1px 4px'}}>{secDep}</td>
                <td style={{fontFamily:ARFNT,fontSize:10,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',paddingLeft:4}}>مبلغ التأمين</td>
                <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',paddingLeft:6,whiteSpace:'nowrap'}}>Mode of Payment</td>
                <td colSpan={2} style={{fontFamily:ENFNT,fontSize:9,fontWeight:700,borderBottom:'1px dashed #bbb',padding:'1px 4px'}}>{mop}</td>
                <td colSpan={2} style={{fontFamily:ARFNT,fontSize:10,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',paddingLeft:4}}>طريقة السداد</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── TERMS & CONDITIONS ── */}
        <div style={{ position:'relative', zIndex:1 }}>
          <table style={{ width:'100%', borderCollapse:'collapse', marginTop:8 }}>
            <tbody>
              <SecBar en="Terms &amp; Conditions:" ar="الشروط والأحكام:"/>
              <Clause n={1} en="The tenant has inspected the premises and agreed to lease the unit on its current condition." ar="إستئجار المستأجر العقار موضوع الإيجار ووافق على إستئجار العقار على حالته الحالية."/>
              <Clause n={2} en="Tenant undertakes to use the premises for designated purpose; tenant has no rights to transfer or relinquish the tenancy contract either with or without counterpart to any person without landlord's written approval. Also tenant is not allowed to sublease the premises or any part thereof to third party in whole or in part unless it is legally permitted." ar="يتعهد المستأجر باستخدام المأجور للغرض المخصص له، ولا يجوز للمستأجر تحويل أو التنازل عن عقد الإيجار للغير بمقابل أو دون مقابل دون موافقة المالك خطياً، كما لا يجوز للمستأجر تأجير المأجور من الباطن مالم يسمح بذلك قانوناً."/>
              <Clause n={3} en="The tenant undertakes not to make any amendments, modifications or addendums to the premises subject of the contract without obtaining the landlord written approval; tenant shall be liable for any damages or failure due to that." ar="يتعهد المستأجر بعدم إجراء أي تعديلات أو إضافات على العقار دون موافقة المالك الخطية، ويكون المستأجر مسؤولاً عن أي أضرار أو نقص يلحق بالعقار."/>
              <Clause n={4} en="The tenant shall be responsible for payment of all electricity, water, cooling and gas charges resulting of occupying leased unit unless other condition agreed in written." ar="يكون المستأجر مسؤولاً عن سداد كافة فواتير الكهرباء والمياه والتبريد والغاز المترتبة عن إشغاله المأجور، مالم يتم الاتفاق على غير ذلك كتابياً."/>
              <Clause n={5} en="The tenant must pay the rent amount in the manner and dates agreed with the landlord." ar="يتعهد المستأجر بسداد مبلغ الإيجار المتفق عليه في هذا العقد في التواريخ والطريقة المتفق عليها."/>
              <Clause n={6} en="The Tenant fully undertakes to comply with all the regulations and instructions related to the management of the property and the use of the premises and of common areas such (parking, swimming pools, gymnasium, etc...)." ar="يلتزم المستأجر التقيد التام بالأنظمة والتعليمات المتعلقة باستخدام المأجور والمنافع المشتركة (كمواقف السيارات، أحواض السباحة، النادي الصحي، الخ)."/>
              <Clause n={7} en="Tenancy contract parties declare all mentioned emails addresses and phone numbers are correct; all formal and legal notifications will be sent to those addresses in case of dispute between parties." ar="يقر أطراف التعاقد بصحة العناوين وأرقام الهواتف المذكورة أعلاه، وتكون تلك العناوين هي المعتمدة رسمياً للإخطارات القضائية في حالة نشوء أي نزاع."/>
              <Clause n={8} en="The Landlord undertakes to enable the tenant of the full use of the premises including its facilities (Swimming pool, gym, parking lot, etc) and do the regular maintenance as intended unless other condition agreed in written." ar="يتعهد المؤجر بتمكين المستأجر من الانتفاع التام بالعقار والمرافق الخاصة به كما يكون مسؤولاً عن أعمال الصيانة مالم يتم الاتفاق على غير ذلك."/>
              <Clause n={9} en="By signing this agreement, the Landlord hereby confirms and undertakes that he is the current owner of the property or his legal representative under legal power of attorney duly entitled by the competent authorities." ar="يعتبر توقيع المؤجر على هذا العقد إقراراً منه بأنه المالك الحالي للعقار أو الوكيل القانوني لذلك المالك بموجب وكالة قانونية موثقة أصولاً."/>
            </tbody>
          </table>
        </div>

        <Sigs/>
        <Footer/>
      </div>

      {/* ═══════════════════════ PAGE 2 ═══════════════════════ */}
      <div style={{...P, minHeight:1123}} id="contract-page-2">
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <tbody>
            <Clause n={10} en="Any disagreement or dispute may arise from execution or interpretation of this contract shall be settled by the Rental Dispute Center." ar="أي خلاف أو نزاع قد ينشأ عن تنفيذ أو تفسير هذا العقد يعود البت فيه لمركز فض المنازعات الإيجارية."/>
            <Clause n={11} en="This Contract is subject to all provisions of Law No (26) of 2007 regulating the relation between landlords and tenants in the Emirate of Dubai as amended, and as it will be changed or amended from time to time." ar="يخضع هذا العقد لأحكام القانون رقم (26) لسنة 2007 بشأن تنظيم العلاقة بين مؤجري ومستأجري العقارات في إمارة دبي وأي تعديل طرأ عليه."/>
            <Clause n={12} en="Any additional condition will not be considered in case it conflicts with law." ar="لا يعتد بأي شرط تم إضافته إلى هذا العقد في حال تعارضه مع القانون."/>
            <Clause n={13} en="In case of discrepancy occurs between Arabic and non Arabic texts with regards to the interpretation of this agreement, the Arabic text shall prevail." ar="في حال حدوث أي تعارض في التفسير بين النص العربي والنص الأجنبي يعتمد النص العربي."/>
            <Clause n={14} en="The Landlord undertakes to register this tenancy contract on EJARI affiliated to Dubai Land Department and provide with all required documents." ar="يتعهد المؤجر بتسجيل عقد الإيجار في نظام إيجاري التابع لدائرة الأراضي والأملاك وتوفير كافة المستندات اللازمة لذلك."/>

            <SecBar en="Know your rights:" ar="لمعرفة حقوق الأطراف:"/>
            {[
              ['You may visit Rental Dispute Center website www.rdc.gov.ae and use Smart Judge service in case of any rental dispute between parties.','يمكنكم زيارة موقع مركز فض المنازعات الإيجارية www.rdc.gov.ae واستخدام خدمة القاضي الذكي في حال نشوء أي نزاع إيجاري.'],
              ['Law No 26 of 2007 regulating relationship between landlords and tenants.','الاطلاع على قانون رقم 26 لسنة 2007 بشأن تنظيم العلاقة بين المؤجرين والمستأجرين.'],
              ['Law No 33 of 2008 amending law 26 of year 2007.','الاطلاع على قانون رقم 33 لسنة 2008 الخاص بتعديل بعض أحكام قانون 26 لعام 2007.'],
              ['Law No 43 of 2013 determining rent increases for properties.','الاطلاع على قانون رقم 43 لسنة 2013 بشأن تحديد زيادة بدل الإيجار.'],
            ].map(([en,ar],i)=>(
              <tr key={i} style={{borderBottom:'1px solid #eef2f7'}}>
                <td style={{width:18,fontSize:11,verticalAlign:'top',paddingTop:3}}>•</td>
                <td style={{width:'47%',fontFamily:ENFNT,fontSize:7.5,lineHeight:1.4,color:'#111',padding:'3px 5px',verticalAlign:'top'}}>{en}</td>
                <td style={{width:'47%',fontFamily:ARFNT,fontSize:9.5,textAlign:'right',color:'#111',padding:'3px 5px',lineHeight:1.5,verticalAlign:'top',direction:'rtl',unicodeBidi:'embed'}}>{ar}</td>
                <td style={{width:18,fontSize:11,verticalAlign:'top',paddingTop:3}}>•</td>
              </tr>
            ))}

            <SecBar en="Attachments for EJARI registration:" ar="المرفقات للتسجيل على إيجاري:"/>
            <Clause n={1} en="Original unified tenancy contract." ar="نسخة أصلية عن عقد الإيجار الموحد."/>
            <Clause n={2} en="Copy of Emirates ID or passport for tenant (individuals) Or trade license for tenant (companies)." ar="صور من بطاقة الهوية أو جواز سفر المستأجر (للأفراد) أو صور من الرخصة التجارية للمستأجر (للشركات)."/>
            <Clause n={3} en="Original Emirates ID of applicant or representative card by DNRD." ar="أصل هوية الإمارات لمقدم الطلب أو بطاقة مندوب صادرة عن الإدارة العامة للإقامة وشؤون الأجانب."/>

            <SecBar en="Additional Terms:" ar="شروط إضافية:"/>
            {add && ['c1','c2','c3','c4','c5','c6','c7','c8'].some(k=>!!(add as any)[k]) ? (
              ['c1','c2','c3','c4','c5','c6','c7','c8'].map((k,i)=>
                (add as any)[k] ? (
                  <tr key={k} style={{borderBottom:'1px solid #eef2f7'}}>
                    <td style={{width:18}}><div style={{width:14,height:14,border:'1px solid #aaa',borderRadius:'50%',textAlign:'center',lineHeight:'12px',fontSize:7}}>{i+1}</div></td>
                    <td colSpan={2} style={{fontFamily:ENFNT,fontSize:7.5,padding:'3px 5px'}}>{(add as any)[k]}</td>
                    <td style={{width:18}}><div style={{width:14,height:14,border:'1px solid #aaa',borderRadius:'50%',textAlign:'center',lineHeight:'12px',fontSize:7}}>{i+1}</div></td>
                  </tr>
                ) : null
              )
            ) : (
              <tr><td style={{width:18}}>-</td><td colSpan={2} style={{fontFamily:ENFNT,fontSize:7.5,color:'#aaa',fontStyle:'italic',padding:'3px 5px'}}>No additional terms.</td><td style={{width:18}}>-</td></tr>
            )}
          </tbody>
        </table>
        <p style={{fontFamily:ENFNT,fontSize:6.5,color:'#777',margin:'6px 0',textAlign:'center'}}>
          Note: You may add an addendum in case of additional terms; must be signed by all parties. |&nbsp;
          <span style={{fontFamily:ARFNT,fontSize:8,direction:'rtl',unicodeBidi:'embed'}}>ملاحظة: يمكن إضافة ملحق إلى هذا العقد على أن يوقع من أطراف التعاقد.</span>
        </p>
        <Sigs/>
        <Footer/>
      </div>

      {/* ═══════════════════════ PAGE 3: ADDENDUM ═══════════════ */}
      <div style={{...P, minHeight:1123}} id="contract-page-3">
        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
          <GovDubaiLogo/>
          <div style={{textAlign:'right',display:'flex',flexDirection:'column',alignItems:'flex-end',gap:2}}>
            <div style={{fontFamily:ARFNT,fontSize:14,fontWeight:700,color:NAVY,direction:'rtl',unicodeBidi:'embed'}}>دائرة الأراضي والأملاك</div>
            <div style={{fontFamily:ENFNT,fontSize:8.5,fontWeight:700,color:NAVY}}>Land Department</div>
            <LandLogo size={48}/>
          </div>
        </div>

        <div style={{textAlign:'center',fontFamily:ENFNT,fontSize:11,fontWeight:700,border:`1.8px solid #4a6fa5`,borderRadius:5,padding:'6px 10px',marginBottom:12,color:NAVY,display:'flex',justifyContent:'center',alignItems:'center',gap:16}}>
          ADDENDUM NO.{add?.addendum_no ?? '1'} TO TENANCY CONTRACT
          <span style={{fontFamily:ARFNT,fontSize:14,direction:'rtl',unicodeBidi:'embed'}}>ملحق عقد الإيجار</span>
        </div>

        <table style={{width:'100%',fontFamily:ENFNT,fontSize:8.5,marginBottom:12,borderCollapse:'collapse'}}>
          <tbody>
            {[['Tenant',tenN,'المستأجر'],['Contact',tenEm,'التواصل'],['Building',`${bld} - ${pNo} - ${pTp}`,'المبنى']].map(([lbl,val,ar])=>(
              <tr key={lbl as string}>
                <td style={{width:70,fontWeight:700,padding:'2px 4px'}}>{lbl}</td>
                <td style={{padding:'2px 4px',borderBottom:'1px dashed #aaa'}}>{val}</td>
                <td style={{width:70,fontFamily:ARFNT,fontSize:10,textAlign:'right',direction:'rtl',unicodeBidi:'embed',padding:'2px 4px'}}>{ar}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{fontFamily:ENFNT,fontSize:8,marginBottom:10,color:'#333'}}>
          I have received the following items in good working condition. I shall reimburse the cost of items in case of damage while vacating the apartment.
        </p>

        <table style={{width:'100%',borderCollapse:'collapse',border:'1px solid #ddd'}}>
          <thead>
            <tr style={{background:NAVY}}>
              <td style={{padding:'4px 8px',color:'#fff',fontFamily:ENFNT,fontSize:8,fontWeight:700}}>Item</td>
              <td style={{padding:'4px 8px',color:'#fff',fontFamily:ENFNT,fontSize:8,fontWeight:700,textAlign:'center',width:80}}>Qty</td>
              <td style={{padding:'4px 8px',color:'#fff',fontFamily:ENFNT,fontSize:8,fontWeight:700,textAlign:'center',width:90}}>Condition</td>
            </tr>
          </thead>
          <tbody>
            {(data.unit_items?.length ? data.unit_items : [
              {name:'GAS RANGE (COOKER)',quantity:1},{name:'GAS CYLINDER',quantity:1},
              {name:'WASHING MACHINE',quantity:1},{name:'LED TV',quantity:1},
              {name:'REFRIGERATOR',quantity:1},{name:'AIR CONDITIONER',quantity:1},
            ]).map((item,i)=>(
              <tr key={i} style={{borderBottom:'1px solid #eee',background:i%2===0?'#fff':'#f9faff'}}>
                <td style={{padding:'4px 8px',fontFamily:ENFNT,fontSize:8}}>{item.name.toUpperCase()}</td>
                <td style={{padding:'4px 8px',fontFamily:ENFNT,fontSize:8,textAlign:'center'}}>{item.quantity??1}</td>
                <td style={{padding:'4px 8px',fontFamily:ENFNT,fontSize:8,textAlign:'center'}}>Good</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={{fontFamily:ENFNT,fontSize:8.5,marginTop:16,fontWeight:700,color:NAVY}}>
          Agreed and Accepted /&nbsp;
          <span style={{fontFamily:ARFNT,fontSize:11,direction:'rtl',unicodeBidi:'embed'}}>موافق ومقبول</span>
        </p>
        <Sigs/>
        <Footer/>
      </div>
    </div>
  )
}
