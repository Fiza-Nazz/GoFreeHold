/**
 * TenancyContractTemplate.tsx
 * Pixel-perfect match with Dubai Land Department official tenancy contract.
 * Uses Amiri font for Arabic, html2canvas-compatible inline styles.
 */
import React from 'react'

// ΓöÇΓöÇ Types ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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

// ΓöÇΓöÇ Helpers ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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

// ΓöÇΓöÇ Style constants ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const NAVY  = '#1a2b6d'
const RED   = '#c8102e'
const ARFNT = "'Amiri', 'Times New Roman', serif"  // Arabic font
const ENFNT = "'Arial', 'Helvetica', sans-serif"   // English font

// ΓöÇΓöÇ Arabic text wrapper ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const Ar = ({ children, size=10, bold=false, style={} }: {
  children: React.ReactNode; size?: number; bold?: boolean; style?: React.CSSProperties
}) => (
  <span style={{ fontFamily: ARFNT, fontSize: size, fontWeight: bold?700:400,
    direction: 'rtl', unicodeBidi: 'embed', color: '#555', ...style }}>
    {children}
  </span>
)

// ΓöÇΓöÇ Circle checkbox ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const Circle = ({ checked }: { checked: boolean }) => (
  <span style={{
    display:'inline-block', width:13, height:13,
    border:`1.5px solid ${checked?NAVY:'#555'}`,
    borderRadius:'50%', textAlign:'center', lineHeight:'11px',
    fontSize:9, fontWeight: 600, color:checked?NAVY:'transparent',
    verticalAlign:'middle',
  }}>
    {checked ? 'Γèù' : ''}
  </span>
)

// ΓöÇΓöÇ Field row ΓÇö full width dashed underline ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const FR = ({ en, val, ar }: { en:string; val:string; ar:string }) => (
  <tr>
    <td style={{ fontFamily:ENFNT, fontSize:8, color:'#666', whiteSpace:'nowrap',
      paddingBottom:3, paddingTop:3, width:100 }}>
      {en}
    </td>
    <td style={{ fontFamily:ENFNT, fontSize:9, fontWeight: 600, color:'#000',
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

// ΓöÇΓöÇ Two-column field row ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const FR2 = ({en1,val1,ar1,en2,val2,ar2}:{
  en1:string;val1:string;ar1:string;
  en2:string;val2:string;ar2:string;
}) => (
  <tr>
    <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',whiteSpace:'nowrap',paddingTop:3,paddingBottom:3,width:100}}>{en1}</td>
    <td style={{fontFamily:ENFNT,fontSize:9,fontWeight: 600,color:'#000',borderBottom:'1px dashed #bbb',padding:'1px 4px 2px 4px',width:120}}>{val1}</td>
    <td style={{fontFamily:ARFNT,fontSize:10,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',whiteSpace:'nowrap',paddingLeft:6,width:120}}>{ar1}</td>
    <td style={{width:8}}/>
    <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',whiteSpace:'nowrap',paddingLeft:6,width:85}}>{en2}</td>
    <td style={{fontFamily:ENFNT,fontSize:9,fontWeight: 600,color:'#000',borderBottom:'1px dashed #bbb',padding:'1px 4px 2px 4px'}}>{val2}</td>
    <td style={{fontFamily:ARFNT,fontSize:10,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',whiteSpace:'nowrap',paddingLeft:6,width:110}}>{ar2}</td>
  </tr>
)

// ΓöÇΓöÇ Section bar ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const SecBar = ({ en, ar }: { en:string; ar:string }) => (
  <tr>
    <td colSpan={99}>
      <div style={{ background:NAVY, display:'flex', justifyContent:'space-between',
        alignItems:'center', padding:'5px 10px', marginTop:8, marginBottom:2 }}>
        <span style={{ fontFamily:ENFNT, fontSize:8.5, fontWeight: 600, color:'#fff' }}>{en}</span>
        <span style={{ fontFamily:ARFNT, fontSize:12, fontWeight: 600, color:'#fff',
          direction:'rtl', unicodeBidi:'embed' }}>{ar}</span>
      </div>
    </td>
  </tr>
)

// ΓöÇΓöÇ Clause row ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const Clause = ({ n, en, ar }: { n:number|string; en:string; ar:string }) => (
  <tr style={{ borderBottom:'1px solid #eef2f7' }}>
    <td style={{ width:18, verticalAlign:'top', paddingTop:4 }}>
      <div style={{ width:14,height:14,border:'1px solid #aaa',borderRadius:'50%',
        textAlign:'center',lineHeight:'12px',fontSize:7,color:'#555',fontWeight: 600 }}>{n}</div>
    </td>
    <td style={{ width:'47%', fontFamily:ENFNT, fontSize:7.5, lineHeight:1.4,
      color:'#111', padding:'3px 5px', verticalAlign:'top' }}>{en}</td>
    <td style={{ width:'47%', fontFamily:ARFNT, fontSize:9.5, textAlign:'right',
      color:'#111', padding:'3px 5px', lineHeight:1.5, verticalAlign:'top',
      direction:'rtl', unicodeBidi:'embed' }}>{ar}</td>
    <td style={{ width:18, verticalAlign:'top', paddingTop:4 }}>
      <div style={{ width:14,height:14,border:'1px solid #aaa',borderRadius:'50%',
        textAlign:'center',lineHeight:'12px',fontSize:7,color:'#555',fontWeight: 600 }}>{n}</div>
    </td>
  </tr>
)

// ΓöÇΓöÇ Signatures ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const Sigs = () => (
  <table style={{ width:'100%', borderCollapse:'collapse', marginTop:16 }}>
    <tbody>
      <tr>
        {[['╪Ñ┘à╪╢╪º╪í ╪º┘ä┘à╪│╪¬╪ú╪¼╪▒','Tenant Signature'],['╪Ñ┘à╪╢╪º╪í ╪º┘ä┘à╪ñ╪¼╪▒','Landlord Signature']].map(([ar,en])=>(
          <td key={en} style={{ width:'50%', textAlign:'center', padding:'0 16px' }}>
            <div style={{ fontFamily:ARFNT, fontSize:11, fontWeight: 600, color:NAVY,
              direction:'rtl', unicodeBidi:'embed' }}>{ar}</div>
            <div style={{ fontFamily:ENFNT, fontSize:8, fontWeight: 600, color:NAVY }}>{en}</div>
            <div style={{ borderBottom:'1px dashed #777', marginTop:22 }}/>
            <div style={{ fontFamily:ENFNT, fontSize:7, color:'#777', marginTop:3 }}>
              Date: ................. &nbsp;
              <span style={{ fontFamily:ARFNT, fontSize:8.5, direction:'rtl', unicodeBidi:'embed' }}>╪º┘ä╪¬╪º╪▒┘è╪«</span>
            </div>
          </td>
        ))}
      </tr>
    </tbody>
  </table>
)

// ΓöÇΓöÇ Footer ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const Footer = () => (
  <div style={{ borderTop:`1.5px solid ${NAVY}`, marginTop:10, paddingTop:4,
    fontFamily:ENFNT, fontSize:6.5, color:'#555', textAlign:'center', lineHeight:1.6 }}>
    Tel: 8004488 &nbsp;|&nbsp; Fax: +971 4 222 2251 &nbsp;|&nbsp; P.O.Box 1166, Dubai, U.A.E. &nbsp;|&nbsp;
    Website: www.dubailand.gov.ae &nbsp;|&nbsp; Email: info@dubailand.gov.ae
    <br/>
    <span style={{ fontFamily:ARFNT, fontSize:7.5, direction:'rtl', unicodeBidi:'embed' }}>
      ┘ç╪º╪¬┘ü: 8004488 &nbsp;|&nbsp; ┘ü╪º┘â╪│: 4 222 2251 971+ &nbsp;|&nbsp; ╪╡.╪¿ 1166╪î ╪»╪¿┘è╪î ╪º┘ä╪Ñ┘à╪º╪▒╪º╪¬ ╪º┘ä╪╣╪▒╪¿┘è╪⌐ ╪º┘ä┘à╪¬╪¡╪»╪⌐
    </span>
  </div>
)

// ΓöÇΓöÇ Land Department SVG Logo ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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

// ΓöÇΓöÇ Gov Dubai styled logo (red Arabic calligraphy style) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
const GovDubaiLogo = () => (
  <div>
    <div style={{
      fontFamily: ARFNT, fontSize: 32, fontWeight: 600,
      color: RED, direction: 'rtl', unicodeBidi: 'embed',
      lineHeight: 1.1, letterSpacing: 2,
    }}>
      ╪¡┘â┘ê┘à╪⌐ ╪»╪¿┘è
    </div>
    <div style={{ fontFamily: ENFNT, fontSize: 7.5, fontWeight: 600,
      color: RED, letterSpacing: 0.8, marginTop: 2 }}>
      GOVERNMENT OF DUBAI
    </div>
  </div>
)

// ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
// Main Template
// ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ
interface Props {
  data: ContractData
  containerRef: React.RefObject<HTMLDivElement | null>
  documentStatus?: string
}

export default function TenancyContractTemplate({ data, containerRef, documentStatus }: Props) {
  const res  = data.tenancyRes
  const unit = data.unit
  const ten  = data.tenant
  const own  = data.owner
  const add  = data.tenancyContracts?.[0]

  // ΓöÇΓöÇ Derived values ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
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

  // ΓöÇΓöÇ Page base style ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  const P: React.CSSProperties = {
    width: 794, minHeight: 1123, background: '#fff',
    padding: '24px 30px 44px 30px', fontFamily: ENFNT,
    fontSize: 8, color: '#000', boxSizing: 'border-box',
    position: 'relative', overflow: 'hidden',
  }

  const StatusBanner = () => documentStatus ? (
    <div style={{
      position: 'absolute', top: 5, left: 30, right: 30, zIndex: 10,
      border: `1px solid ${RED}`, borderRadius: 3, background: '#fff',
      color: RED, fontFamily: ENFNT, fontSize: 7, fontWeight: 700,
      letterSpacing: 0.7, textAlign: 'center', padding: '2px 6px',
    }}>
      {documentStatus}
    </div>
  ) : null

  return (
    <div ref={containerRef} style={{ position:'absolute', left:-9999, top:0, zIndex:-1 }}>

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ PAGE 1 ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <div style={P} id="contract-page-1">
        <StatusBanner/>

        {/* Watermark */}
        <div style={{
          position:'absolute', top:'42%', left:'50%',
          transform:'translate(-50%,-50%)', opacity:0.035, zIndex:0,
          pointerEvents:'none',
        }}>
          <LandLogo size={340}/>
        </div>

        {/* ΓöÇΓöÇ HEADER ΓöÇΓöÇ */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10, position:'relative', zIndex:1 }}>
          {/* Left: Gov Dubai */}
          <GovDubaiLogo/>

          {/* Right: Land Department */}
          <div style={{ textAlign:'right', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2 }}>
            <div style={{ fontFamily:ARFNT, fontSize:14, fontWeight: 600, color:NAVY,
              direction:'rtl', unicodeBidi:'embed', letterSpacing:0.5 }}>
              ╪»╪º╪ª╪▒╪⌐ ╪º┘ä╪ú╪▒╪º╪╢┘è ┘ê╪º┘ä╪ú┘à┘ä╪º┘â
            </div>
            <div style={{ fontFamily:ENFNT, fontSize:8.5, fontWeight: 600, color:NAVY }}>
              Land Department
            </div>
            <LandLogo size={52}/>
          </div>
        </div>

        {/* ΓöÇΓöÇ TITLE BOX ΓöÇΓöÇ */}
        <div style={{
          border:`1.8px solid #4a6fa5`, borderRadius:6,
          display:'flex', marginBottom:10, position:'relative', zIndex:1,
        }}>
          {/* Left: Date + No */}
          <div style={{ width:'34%', padding:'8px 10px', borderRight:'1px solid #4a6fa5' }}>
            {/* Date */}
            <div style={{ display:'flex', alignItems:'center', gap:3, marginBottom:6 }}>
              <span style={{ fontFamily:ENFNT, fontSize:7.5, color:'#444', marginRight:3 }}>Date</span>
              <span style={{ fontFamily:ENFNT, fontSize:9.5, fontWeight: 600, borderBottom:'1.2px solid #333', minWidth:20, textAlign:'center', padding:'0 2px' }}>{dd}</span>
              <span style={{ fontFamily:ENFNT, fontSize:9.5, fontWeight: 600 }}>/</span>
              <span style={{ fontFamily:ENFNT, fontSize:9.5, fontWeight: 600, borderBottom:'1.2px solid #333', minWidth:20, textAlign:'center', padding:'0 2px' }}>{mm}</span>
              <span style={{ fontFamily:ENFNT, fontSize:9.5, fontWeight: 600 }}>/</span>
              <span style={{ fontFamily:ENFNT, fontSize:9.5, fontWeight: 600, borderBottom:'1.2px solid #333', minWidth:34, textAlign:'center', padding:'0 2px' }}>{yy}</span>
              <span style={{ fontFamily:ARFNT, fontSize:10, color:NAVY, marginLeft:6,
                direction:'rtl', unicodeBidi:'embed' }}>╪º┘ä╪¬╪º╪▒┘è╪«</span>
            </div>
            {/* No */}
            <div style={{ display:'flex', alignItems:'center', gap:3 }}>
              <span style={{ fontFamily:ENFNT, fontSize:7.5, color:'#444', marginRight:3 }}>No.</span>
              <span style={{ fontFamily:ENFNT, fontSize:9.5, fontWeight: 600, borderBottom:'1.2px solid #333', minWidth:90, padding:'0 4px' }}>{cNo}</span>
              <span style={{ fontFamily:ARFNT, fontSize:10, color:NAVY, marginLeft:6,
                direction:'rtl', unicodeBidi:'embed' }}>╪º┘ä╪▒┘é┘à</span>
            </div>
          </div>

          {/* Right: Title */}
          <div style={{ flex:1, textAlign:'center', padding:'6px 12px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
            <div style={{ fontFamily:ARFNT, fontSize:28, fontWeight: 600, color:NAVY,
              letterSpacing:6, direction:'rtl', unicodeBidi:'embed', lineHeight:1.1 }}>
              ╪╣┘Ç┘é┘Ç╪» ╪Ñ┘è┘Ç╪¼┘Ç╪º╪▒
            </div>
            <div style={{ fontFamily:ENFNT, fontSize:13, fontWeight: 600, color:NAVY, letterSpacing:3, marginTop:3 }}>
              TENANCY CONTRACT
            </div>
          </div>
        </div>

        {/* ΓöÇΓöÇ PROPERTY USAGE ΓöÇΓöÇ */}
        <div style={{ display:'flex', alignItems:'flex-end', gap:0, marginBottom:8, position:'relative', zIndex:1 }}>
          <span style={{ fontFamily:ENFNT, fontSize:8, color:'#666', marginRight:16, whiteSpace:'nowrap' }}>Property Usage</span>

          {[
            { arLabel:'╪╡┘å╪º╪╣┘è', enLabel:'Industrial', checked: isInd },
            { arLabel:'╪¬╪¼╪º╪▒┘è', enLabel:'Commercial',  checked: isCom },
            { arLabel:'╪│┘â┘å┘è',  enLabel:'Residential', checked: isRes || defRes },
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
              direction:'rtl', unicodeBidi:'embed' }}>╪º╪│╪¬╪«╪»╪º┘à ╪º┘ä┘ê╪¡╪»╪⌐</span>
          </div>
        </div>

        {/* ΓöÇΓöÇ DATA FIELDS ΓöÇΓöÇ */}
        <div style={{ position:'relative', zIndex:1 }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <tbody>
              <FR en="Owner Name"    val={ownerN}  ar="╪º╪│┘à ╪º┘ä┘à╪º┘ä┘â"/>
              <FR en="Landlord Name" val={ownerN}  ar="╪º╪│┘à ╪º┘ä┘à╪ñ╪¼╪▒"/>
              <FR en="Tenant Name"   val={tenN}    ar="╪º╪│┘à ╪º┘ä┘à╪│╪¬╪ú╪¼╪▒"/>
              <FR2 en1="Tenant Email"  val1={tenEm}  ar1="╪º┘ä╪¿╪▒┘è╪» ╪º┘ä╪º┘ä┘â╪¬╪▒┘ê┘å┘è ┘ä┘ä┘à╪│╪¬╪ú╪¼╪▒"
                   en2="Landlord Email" val2={lanEm}  ar2="╪º┘ä╪¿╪▒┘è╪» ╪º┘ä╪º┘ä┘â╪¬╪▒┘ê┘å┘è ┘ä┘ä┘à╪ñ╪¼╪▒"/>
              <FR2 en1="Tenant Phone"  val1={tenPh}  ar1="┘ç╪º╪¬┘ü ╪º┘ä┘à╪│╪¬╪ú╪¼╪▒"
                   en2="Landlord Phone" val2={lanPh}  ar2="┘ç╪º╪¬┘ü ╪º┘ä┘à╪ñ╪¼╪▒"/>
              <FR2 en1="Building Name" val1={bld}    ar1="╪Ñ╪│┘à ╪º┘ä┘à╪¿┘å┘ë"
                   en2="Location"       val2={loc}    ar2="╪º┘ä┘à┘å╪╖┘é╪⌐"/>

              {/* 3-column: Size | Type | No */}
              <tr>
                <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',whiteSpace:'nowrap',paddingTop:3,paddingBottom:3,width:100}}>Property Size (S.M)</td>
                <td style={{fontFamily:ENFNT,fontSize:9,fontWeight: 600,color:'#000',borderBottom:'1px dashed #bbb',padding:'1px 4px',width:55}}>{pSz}</td>
                <td style={{fontFamily:ARFNT,fontSize:9.5,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',paddingLeft:4,width:120}}>┘à╪│╪º╪¡╪⌐ ╪º┘ä┘ê╪¡╪»╪⌐ (┘à╪¬╪▒ ┘à╪▒╪¿╪╣)</td>
                <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',paddingLeft:6,whiteSpace:'nowrap',width:80}}>Property Type</td>
                <td style={{fontFamily:ENFNT,fontSize:9,fontWeight: 600,color:'#000',borderBottom:'1px dashed #bbb',padding:'1px 4px',width:65}}>{pTp}</td>
                <td style={{fontFamily:ARFNT,fontSize:9.5,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',paddingLeft:4,width:70}}>┘å┘ê╪╣ ╪º┘ä┘ê╪¡╪»╪⌐</td>
                <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',paddingLeft:6,whiteSpace:'nowrap',width:70}}>Property No.</td>
                <td style={{fontFamily:ENFNT,fontSize:9,fontWeight: 600,color:'#000',borderBottom:'1px dashed #bbb',padding:'1px 4px'}}>{pNo}</td>
                <td style={{fontFamily:ARFNT,fontSize:9.5,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',paddingLeft:4,width:65}}>╪▒┘é┘à ╪º┘ä┘ê╪¡╪»╪⌐</td>
              </tr>

              {/* DEWA / Plot */}
              <tr>
                <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',whiteSpace:'nowrap',paddingTop:3,paddingBottom:3}}>Premises No (DEWA)</td>
                <td colSpan={2} style={{fontFamily:ENFNT,fontSize:9,fontWeight: 600,color:'#000',borderBottom:'1px dashed #bbb',padding:'1px 4px'}}>{dewa}</td>
                <td style={{fontFamily:ARFNT,fontSize:9.5,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',paddingLeft:4}}>╪▒┘é┘à ╪º┘ä╪╣┘é╪º╪▒ (╪»┘è┘ê╪º)</td>
                <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',paddingLeft:6,whiteSpace:'nowrap'}}>Plot No.</td>
                <td colSpan={2} style={{fontFamily:ENFNT,fontSize:9,fontWeight: 600,color:'#000',borderBottom:'1px dashed #bbb',padding:'1px 4px'}}>{plot}</td>
                <td colSpan={2} style={{fontFamily:ARFNT,fontSize:9.5,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',paddingLeft:4}}>╪▒┘é┘à ╪º┘ä╪ú╪▒╪╢</td>
              </tr>

              {/* Contract Period */}
              <tr>
                <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',whiteSpace:'nowrap',paddingTop:3,paddingBottom:3}}>Contract Period</td>
                <td colSpan={7} style={{fontFamily:ENFNT,fontSize:9,fontWeight: 600,borderBottom:'1px dashed #bbb',padding:'1px 6px'}}>
                  To &nbsp;<strong>{pTo}</strong>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <span style={{fontFamily:ARFNT,fontSize:10,direction:'rtl',unicodeBidi:'embed'}}>╪Ñ┘ä┘ë</span>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  From &nbsp;<strong>{pFrom}</strong>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <span style={{fontFamily:ARFNT,fontSize:10,direction:'rtl',unicodeBidi:'embed'}}>┘à┘å</span>
                </td>
                <td style={{fontFamily:ARFNT,fontSize:10,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',whiteSpace:'nowrap',paddingLeft:4}}>┘ü╪¬╪▒╪⌐ ╪º┘ä╪Ñ┘è╪¼╪º╪▒</td>
              </tr>

              {/* Annual Rent */}
              <tr>
                <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',whiteSpace:'nowrap',paddingTop:3,paddingBottom:3}}>Annual Rent</td>
                <td colSpan={7} style={{fontFamily:ENFNT,fontSize:9,fontWeight: 600,borderBottom:'1px dashed #bbb',padding:'1px 6px'}}>
                  <strong>{fmtNum(rentAmt)}</strong>&nbsp;&nbsp;({rentW})
                </td>
                <td style={{fontFamily:ARFNT,fontSize:10,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',whiteSpace:'nowrap',paddingLeft:4}}>╪º┘ä╪Ñ┘è╪¼╪º╪▒ ╪º┘ä╪│┘å┘ê┘è</td>
              </tr>

              {/* Contract Value */}
              <tr>
                <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',whiteSpace:'nowrap',paddingTop:3,paddingBottom:3}}>Contract Value</td>
                <td colSpan={7} style={{fontFamily:ENFNT,fontSize:9,fontWeight: 600,borderBottom:'1px dashed #bbb',padding:'1px 6px'}}>
                  <strong>{fmtNum(cValAmt)}</strong>&nbsp;&nbsp;({cValW})
                </td>
                <td style={{fontFamily:ARFNT,fontSize:10,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',whiteSpace:'nowrap',paddingLeft:4}}>┘é┘è┘à╪⌐ ╪º┘ä╪╣┘é╪»</td>
              </tr>

              {/* Security Deposit | MOP */}
              <tr>
                <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',whiteSpace:'nowrap',paddingTop:3}}>Security Deposit Amount</td>
                <td colSpan={2} style={{fontFamily:ENFNT,fontSize:9,fontWeight: 600,borderBottom:'1px dashed #bbb',padding:'1px 4px'}}>{secDep}</td>
                <td style={{fontFamily:ARFNT,fontSize:10,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',paddingLeft:4}}>┘à╪¿┘ä╪║ ╪º┘ä╪¬╪ú┘à┘è┘å</td>
                <td style={{fontFamily:ENFNT,fontSize:8,color:'#666',paddingLeft:6,whiteSpace:'nowrap'}}>Mode of Payment</td>
                <td colSpan={2} style={{fontFamily:ENFNT,fontSize:9,fontWeight: 600,borderBottom:'1px dashed #bbb',padding:'1px 4px'}}>{mop}</td>
                <td colSpan={2} style={{fontFamily:ARFNT,fontSize:10,color:'#666',textAlign:'right',direction:'rtl',unicodeBidi:'embed',paddingLeft:4}}>╪╖╪▒┘è┘é╪⌐ ╪º┘ä╪│╪»╪º╪»</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ΓöÇΓöÇ TERMS & CONDITIONS ΓöÇΓöÇ */}
        <div style={{ position:'relative', zIndex:1 }}>
          <table style={{ width:'100%', borderCollapse:'collapse', marginTop:8 }}>
            <tbody>
              <SecBar en="Terms &amp; Conditions:" ar="╪º┘ä╪┤╪▒┘ê╪╖ ┘ê╪º┘ä╪ú╪¡┘â╪º┘à:"/>
              <Clause n={1} en="The tenant has inspected the premises and agreed to lease the unit on its current condition." ar="╪Ñ╪│╪¬╪ª╪¼╪º╪▒ ╪º┘ä┘à╪│╪¬╪ú╪¼╪▒ ╪º┘ä╪╣┘é╪º╪▒ ┘à┘ê╪╢┘ê╪╣ ╪º┘ä╪Ñ┘è╪¼╪º╪▒ ┘ê┘ê╪º┘ü┘é ╪╣┘ä┘ë ╪Ñ╪│╪¬╪ª╪¼╪º╪▒ ╪º┘ä╪╣┘é╪º╪▒ ╪╣┘ä┘ë ╪¡╪º┘ä╪¬┘ç ╪º┘ä╪¡╪º┘ä┘è╪⌐."/>
              <Clause n={2} en="Tenant undertakes to use the premises for designated purpose; tenant has no rights to transfer or relinquish the tenancy contract either with or without counterpart to any person without landlord's written approval. Also tenant is not allowed to sublease the premises or any part thereof to third party in whole or in part unless it is legally permitted." ar="┘è╪¬╪╣┘ç╪» ╪º┘ä┘à╪│╪¬╪ú╪¼╪▒ ╪¿╪º╪│╪¬╪«╪»╪º┘à ╪º┘ä┘à╪ú╪¼┘ê╪▒ ┘ä┘ä╪║╪▒╪╢ ╪º┘ä┘à╪«╪╡╪╡ ┘ä┘ç╪î ┘ê┘ä╪º ┘è╪¼┘ê╪▓ ┘ä┘ä┘à╪│╪¬╪ú╪¼╪▒ ╪¬╪¡┘ê┘è┘ä ╪ú┘ê ╪º┘ä╪¬┘å╪º╪▓┘ä ╪╣┘å ╪╣┘é╪» ╪º┘ä╪Ñ┘è╪¼╪º╪▒ ┘ä┘ä╪║┘è╪▒ ╪¿┘à┘é╪º╪¿┘ä ╪ú┘ê ╪»┘ê┘å ┘à┘é╪º╪¿┘ä ╪»┘ê┘å ┘à┘ê╪º┘ü┘é╪⌐ ╪º┘ä┘à╪º┘ä┘â ╪«╪╖┘è╪º┘ï╪î ┘â┘à╪º ┘ä╪º ┘è╪¼┘ê╪▓ ┘ä┘ä┘à╪│╪¬╪ú╪¼╪▒ ╪¬╪ú╪¼┘è╪▒ ╪º┘ä┘à╪ú╪¼┘ê╪▒ ┘à┘å ╪º┘ä╪¿╪º╪╖┘å ┘à╪º┘ä┘à ┘è╪│┘à╪¡ ╪¿╪░┘ä┘â ┘é╪º┘å┘ê┘å╪º┘ï."/>
              <Clause n={3} en="The tenant undertakes not to make any amendments, modifications or addendums to the premises subject of the contract without obtaining the landlord written approval; tenant shall be liable for any damages or failure due to that." ar="┘è╪¬╪╣┘ç╪» ╪º┘ä┘à╪│╪¬╪ú╪¼╪▒ ╪¿╪╣╪»┘à ╪Ñ╪¼╪▒╪º╪í ╪ú┘è ╪¬╪╣╪»┘è┘ä╪º╪¬ ╪ú┘ê ╪Ñ╪╢╪º┘ü╪º╪¬ ╪╣┘ä┘ë ╪º┘ä╪╣┘é╪º╪▒ ╪»┘ê┘å ┘à┘ê╪º┘ü┘é╪⌐ ╪º┘ä┘à╪º┘ä┘â ╪º┘ä╪«╪╖┘è╪⌐╪î ┘ê┘è┘â┘ê┘å ╪º┘ä┘à╪│╪¬╪ú╪¼╪▒ ┘à╪│╪ñ┘ê┘ä╪º┘ï ╪╣┘å ╪ú┘è ╪ú╪╢╪▒╪º╪▒ ╪ú┘ê ┘å┘é╪╡ ┘è┘ä╪¡┘é ╪¿╪º┘ä╪╣┘é╪º╪▒."/>
              <Clause n={4} en="The tenant shall be responsible for payment of all electricity, water, cooling and gas charges resulting of occupying leased unit unless other condition agreed in written." ar="┘è┘â┘ê┘å ╪º┘ä┘à╪│╪¬╪ú╪¼╪▒ ┘à╪│╪ñ┘ê┘ä╪º┘ï ╪╣┘å ╪│╪»╪º╪» ┘â╪º┘ü╪⌐ ┘ü┘ê╪º╪¬┘è╪▒ ╪º┘ä┘â┘ç╪▒╪¿╪º╪í ┘ê╪º┘ä┘à┘è╪º┘ç ┘ê╪º┘ä╪¬╪¿╪▒┘è╪» ┘ê╪º┘ä╪║╪º╪▓ ╪º┘ä┘à╪¬╪▒╪¬╪¿╪⌐ ╪╣┘å ╪Ñ╪┤╪║╪º┘ä┘ç ╪º┘ä┘à╪ú╪¼┘ê╪▒╪î ┘à╪º┘ä┘à ┘è╪¬┘à ╪º┘ä╪º╪¬┘ü╪º┘é ╪╣┘ä┘ë ╪║┘è╪▒ ╪░┘ä┘â ┘â╪¬╪º╪¿┘è╪º┘ï."/>
              <Clause n={5} en="The tenant must pay the rent amount in the manner and dates agreed with the landlord." ar="┘è╪¬╪╣┘ç╪» ╪º┘ä┘à╪│╪¬╪ú╪¼╪▒ ╪¿╪│╪»╪º╪» ┘à╪¿┘ä╪║ ╪º┘ä╪Ñ┘è╪¼╪º╪▒ ╪º┘ä┘à╪¬┘ü┘é ╪╣┘ä┘è┘ç ┘ü┘è ┘ç╪░╪º ╪º┘ä╪╣┘é╪» ┘ü┘è ╪º┘ä╪¬┘ê╪º╪▒┘è╪« ┘ê╪º┘ä╪╖╪▒┘è┘é╪⌐ ╪º┘ä┘à╪¬┘ü┘é ╪╣┘ä┘è┘ç╪º."/>
              <Clause n={6} en="The Tenant fully undertakes to comply with all the regulations and instructions related to the management of the property and the use of the premises and of common areas such (parking, swimming pools, gymnasium, etc...)." ar="┘è┘ä╪¬╪▓┘à ╪º┘ä┘à╪│╪¬╪ú╪¼╪▒ ╪º┘ä╪¬┘é┘è╪» ╪º┘ä╪¬╪º┘à ╪¿╪º┘ä╪ú┘å╪╕┘à╪⌐ ┘ê╪º┘ä╪¬╪╣┘ä┘è┘à╪º╪¬ ╪º┘ä┘à╪¬╪╣┘ä┘é╪⌐ ╪¿╪º╪│╪¬╪«╪»╪º┘à ╪º┘ä┘à╪ú╪¼┘ê╪▒ ┘ê╪º┘ä┘à┘å╪º┘ü╪╣ ╪º┘ä┘à╪┤╪¬╪▒┘â╪⌐ (┘â┘à┘ê╪º┘é┘ü ╪º┘ä╪│┘è╪º╪▒╪º╪¬╪î ╪ú╪¡┘ê╪º╪╢ ╪º┘ä╪│╪¿╪º╪¡╪⌐╪î ╪º┘ä┘å╪º╪»┘è ╪º┘ä╪╡╪¡┘è╪î ╪º┘ä╪«)."/>
              <Clause n={7} en="Tenancy contract parties declare all mentioned emails addresses and phone numbers are correct; all formal and legal notifications will be sent to those addresses in case of dispute between parties." ar="┘è┘é╪▒ ╪ú╪╖╪▒╪º┘ü ╪º┘ä╪¬╪╣╪º┘é╪» ╪¿╪╡╪¡╪⌐ ╪º┘ä╪╣┘å╪º┘ê┘è┘å ┘ê╪ú╪▒┘é╪º┘à ╪º┘ä┘ç┘ê╪º╪¬┘ü ╪º┘ä┘à╪░┘â┘ê╪▒╪⌐ ╪ú╪╣┘ä╪º┘ç╪î ┘ê╪¬┘â┘ê┘å ╪¬┘ä┘â ╪º┘ä╪╣┘å╪º┘ê┘è┘å ┘ç┘è ╪º┘ä┘à╪╣╪¬┘à╪»╪⌐ ╪▒╪│┘à┘è╪º┘ï ┘ä┘ä╪Ñ╪«╪╖╪º╪▒╪º╪¬ ╪º┘ä┘é╪╢╪º╪ª┘è╪⌐ ┘ü┘è ╪¡╪º┘ä╪⌐ ┘å╪┤┘ê╪í ╪ú┘è ┘å╪▓╪º╪╣."/>
              <Clause n={8} en="The Landlord undertakes to enable the tenant of the full use of the premises including its facilities (Swimming pool, gym, parking lot, etc) and do the regular maintenance as intended unless other condition agreed in written." ar="┘è╪¬╪╣┘ç╪» ╪º┘ä┘à╪ñ╪¼╪▒ ╪¿╪¬┘à┘â┘è┘å ╪º┘ä┘à╪│╪¬╪ú╪¼╪▒ ┘à┘å ╪º┘ä╪º┘å╪¬┘ü╪º╪╣ ╪º┘ä╪¬╪º┘à ╪¿╪º┘ä╪╣┘é╪º╪▒ ┘ê╪º┘ä┘à╪▒╪º┘ü┘é ╪º┘ä╪«╪º╪╡╪⌐ ╪¿┘ç ┘â┘à╪º ┘è┘â┘ê┘å ┘à╪│╪ñ┘ê┘ä╪º┘ï ╪╣┘å ╪ú╪╣┘à╪º┘ä ╪º┘ä╪╡┘è╪º┘å╪⌐ ┘à╪º┘ä┘à ┘è╪¬┘à ╪º┘ä╪º╪¬┘ü╪º┘é ╪╣┘ä┘ë ╪║┘è╪▒ ╪░┘ä┘â."/>
              <Clause n={9} en="By signing this agreement, the Landlord hereby confirms and undertakes that he is the current owner of the property or his legal representative under legal power of attorney duly entitled by the competent authorities." ar="┘è╪╣╪¬╪¿╪▒ ╪¬┘ê┘é┘è╪╣ ╪º┘ä┘à╪ñ╪¼╪▒ ╪╣┘ä┘ë ┘ç╪░╪º ╪º┘ä╪╣┘é╪» ╪Ñ┘é╪▒╪º╪▒╪º┘ï ┘à┘å┘ç ╪¿╪ú┘å┘ç ╪º┘ä┘à╪º┘ä┘â ╪º┘ä╪¡╪º┘ä┘è ┘ä┘ä╪╣┘é╪º╪▒ ╪ú┘ê ╪º┘ä┘ê┘â┘è┘ä ╪º┘ä┘é╪º┘å┘ê┘å┘è ┘ä╪░┘ä┘â ╪º┘ä┘à╪º┘ä┘â ╪¿┘à┘ê╪¼╪¿ ┘ê┘â╪º┘ä╪⌐ ┘é╪º┘å┘ê┘å┘è╪⌐ ┘à┘ê╪½┘é╪⌐ ╪ú╪╡┘ê┘ä╪º┘ï."/>
            </tbody>
          </table>
        </div>

        <Sigs/>
        <Footer/>
      </div>

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ PAGE 2 ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <div style={{...P, minHeight:1123}} id="contract-page-2">
        <StatusBanner/>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <tbody>
            <Clause n={10} en="Any disagreement or dispute may arise from execution or interpretation of this contract shall be settled by the Rental Dispute Center." ar="╪ú┘è ╪«┘ä╪º┘ü ╪ú┘ê ┘å╪▓╪º╪╣ ┘é╪» ┘è┘å╪┤╪ú ╪╣┘å ╪¬┘å┘ü┘è╪░ ╪ú┘ê ╪¬┘ü╪│┘è╪▒ ┘ç╪░╪º ╪º┘ä╪╣┘é╪» ┘è╪╣┘ê╪» ╪º┘ä╪¿╪¬ ┘ü┘è┘ç ┘ä┘à╪▒┘â╪▓ ┘ü╪╢ ╪º┘ä┘à┘å╪º╪▓╪╣╪º╪¬ ╪º┘ä╪Ñ┘è╪¼╪º╪▒┘è╪⌐."/>
            <Clause n={11} en="This Contract is subject to all provisions of Law No (26) of 2007 regulating the relation between landlords and tenants in the Emirate of Dubai as amended, and as it will be changed or amended from time to time." ar="┘è╪«╪╢╪╣ ┘ç╪░╪º ╪º┘ä╪╣┘é╪» ┘ä╪ú╪¡┘â╪º┘à ╪º┘ä┘é╪º┘å┘ê┘å ╪▒┘é┘à (26) ┘ä╪│┘å╪⌐ 2007 ╪¿╪┤╪ú┘å ╪¬┘å╪╕┘è┘à ╪º┘ä╪╣┘ä╪º┘é╪⌐ ╪¿┘è┘å ┘à╪ñ╪¼╪▒┘è ┘ê┘à╪│╪¬╪ú╪¼╪▒┘è ╪º┘ä╪╣┘é╪º╪▒╪º╪¬ ┘ü┘è ╪Ñ┘à╪º╪▒╪⌐ ╪»╪¿┘è ┘ê╪ú┘è ╪¬╪╣╪»┘è┘ä ╪╖╪▒╪ú ╪╣┘ä┘è┘ç."/>
            <Clause n={12} en="Any additional condition will not be considered in case it conflicts with law." ar="┘ä╪º ┘è╪╣╪¬╪» ╪¿╪ú┘è ╪┤╪▒╪╖ ╪¬┘à ╪Ñ╪╢╪º┘ü╪¬┘ç ╪Ñ┘ä┘ë ┘ç╪░╪º ╪º┘ä╪╣┘é╪» ┘ü┘è ╪¡╪º┘ä ╪¬╪╣╪º╪▒╪╢┘ç ┘à╪╣ ╪º┘ä┘é╪º┘å┘ê┘å."/>
            <Clause n={13} en="In case of discrepancy occurs between Arabic and non Arabic texts with regards to the interpretation of this agreement, the Arabic text shall prevail." ar="┘ü┘è ╪¡╪º┘ä ╪¡╪»┘ê╪½ ╪ú┘è ╪¬╪╣╪º╪▒╪╢ ┘ü┘è ╪º┘ä╪¬┘ü╪│┘è╪▒ ╪¿┘è┘å ╪º┘ä┘å╪╡ ╪º┘ä╪╣╪▒╪¿┘è ┘ê╪º┘ä┘å╪╡ ╪º┘ä╪ú╪¼┘å╪¿┘è ┘è╪╣╪¬┘à╪» ╪º┘ä┘å╪╡ ╪º┘ä╪╣╪▒╪¿┘è."/>
            <Clause n={14} en="The Landlord undertakes to register this tenancy contract on EJARI affiliated to Dubai Land Department and provide with all required documents." ar="┘è╪¬╪╣┘ç╪» ╪º┘ä┘à╪ñ╪¼╪▒ ╪¿╪¬╪│╪¼┘è┘ä ╪╣┘é╪» ╪º┘ä╪Ñ┘è╪¼╪º╪▒ ┘ü┘è ┘å╪╕╪º┘à ╪Ñ┘è╪¼╪º╪▒┘è ╪º┘ä╪¬╪º╪¿╪╣ ┘ä╪»╪º╪ª╪▒╪⌐ ╪º┘ä╪ú╪▒╪º╪╢┘è ┘ê╪º┘ä╪ú┘à┘ä╪º┘â ┘ê╪¬┘ê┘ü┘è╪▒ ┘â╪º┘ü╪⌐ ╪º┘ä┘à╪│╪¬┘å╪»╪º╪¬ ╪º┘ä┘ä╪º╪▓┘à╪⌐ ┘ä╪░┘ä┘â."/>

            <SecBar en="Know your rights:" ar="┘ä┘à╪╣╪▒┘ü╪⌐ ╪¡┘é┘ê┘é ╪º┘ä╪ú╪╖╪▒╪º┘ü:"/>
            {[
              ['You may visit Rental Dispute Center website www.rdc.gov.ae and use Smart Judge service in case of any rental dispute between parties.','┘è┘à┘â┘å┘â┘à ╪▓┘è╪º╪▒╪⌐ ┘à┘ê┘é╪╣ ┘à╪▒┘â╪▓ ┘ü╪╢ ╪º┘ä┘à┘å╪º╪▓╪╣╪º╪¬ ╪º┘ä╪Ñ┘è╪¼╪º╪▒┘è╪⌐ www.rdc.gov.ae ┘ê╪º╪│╪¬╪«╪»╪º┘à ╪«╪»┘à╪⌐ ╪º┘ä┘é╪º╪╢┘è ╪º┘ä╪░┘â┘è ┘ü┘è ╪¡╪º┘ä ┘å╪┤┘ê╪í ╪ú┘è ┘å╪▓╪º╪╣ ╪Ñ┘è╪¼╪º╪▒┘è.'],
              ['Law No 26 of 2007 regulating relationship between landlords and tenants.','╪º┘ä╪º╪╖┘ä╪º╪╣ ╪╣┘ä┘ë ┘é╪º┘å┘ê┘å ╪▒┘é┘à 26 ┘ä╪│┘å╪⌐ 2007 ╪¿╪┤╪ú┘å ╪¬┘å╪╕┘è┘à ╪º┘ä╪╣┘ä╪º┘é╪⌐ ╪¿┘è┘å ╪º┘ä┘à╪ñ╪¼╪▒┘è┘å ┘ê╪º┘ä┘à╪│╪¬╪ú╪¼╪▒┘è┘å.'],
              ['Law No 33 of 2008 amending law 26 of year 2007.','╪º┘ä╪º╪╖┘ä╪º╪╣ ╪╣┘ä┘ë ┘é╪º┘å┘ê┘å ╪▒┘é┘à 33 ┘ä╪│┘å╪⌐ 2008 ╪º┘ä╪«╪º╪╡ ╪¿╪¬╪╣╪»┘è┘ä ╪¿╪╣╪╢ ╪ú╪¡┘â╪º┘à ┘é╪º┘å┘ê┘å 26 ┘ä╪╣╪º┘à 2007.'],
              ['Law No 43 of 2013 determining rent increases for properties.','╪º┘ä╪º╪╖┘ä╪º╪╣ ╪╣┘ä┘ë ┘é╪º┘å┘ê┘å ╪▒┘é┘à 43 ┘ä╪│┘å╪⌐ 2013 ╪¿╪┤╪ú┘å ╪¬╪¡╪»┘è╪» ╪▓┘è╪º╪»╪⌐ ╪¿╪»┘ä ╪º┘ä╪Ñ┘è╪¼╪º╪▒.'],
            ].map(([en,ar],i)=>(
              <tr key={i} style={{borderBottom:'1px solid #eef2f7'}}>
                <td style={{width:18,fontSize:11,verticalAlign:'top',paddingTop:3}}>ΓÇó</td>
                <td style={{width:'47%',fontFamily:ENFNT,fontSize:7.5,lineHeight:1.4,color:'#111',padding:'3px 5px',verticalAlign:'top'}}>{en}</td>
                <td style={{width:'47%',fontFamily:ARFNT,fontSize:9.5,textAlign:'right',color:'#111',padding:'3px 5px',lineHeight:1.5,verticalAlign:'top',direction:'rtl',unicodeBidi:'embed'}}>{ar}</td>
                <td style={{width:18,fontSize:11,verticalAlign:'top',paddingTop:3}}>ΓÇó</td>
              </tr>
            ))}

            <SecBar en="Attachments for EJARI registration:" ar="╪º┘ä┘à╪▒┘ü┘é╪º╪¬ ┘ä┘ä╪¬╪│╪¼┘è┘ä ╪╣┘ä┘ë ╪Ñ┘è╪¼╪º╪▒┘è:"/>
            <Clause n={1} en="Original unified tenancy contract." ar="┘å╪│╪«╪⌐ ╪ú╪╡┘ä┘è╪⌐ ╪╣┘å ╪╣┘é╪» ╪º┘ä╪Ñ┘è╪¼╪º╪▒ ╪º┘ä┘à┘ê╪¡╪»."/>
            <Clause n={2} en="Copy of Emirates ID or passport for tenant (individuals) Or trade license for tenant (companies)." ar="╪╡┘ê╪▒ ┘à┘å ╪¿╪╖╪º┘é╪⌐ ╪º┘ä┘ç┘ê┘è╪⌐ ╪ú┘ê ╪¼┘ê╪º╪▓ ╪│┘ü╪▒ ╪º┘ä┘à╪│╪¬╪ú╪¼╪▒ (┘ä┘ä╪ú┘ü╪▒╪º╪») ╪ú┘ê ╪╡┘ê╪▒ ┘à┘å ╪º┘ä╪▒╪«╪╡╪⌐ ╪º┘ä╪¬╪¼╪º╪▒┘è╪⌐ ┘ä┘ä┘à╪│╪¬╪ú╪¼╪▒ (┘ä┘ä╪┤╪▒┘â╪º╪¬)."/>
            <Clause n={3} en="Original Emirates ID of applicant or representative card by DNRD." ar="╪ú╪╡┘ä ┘ç┘ê┘è╪⌐ ╪º┘ä╪Ñ┘à╪º╪▒╪º╪¬ ┘ä┘à┘é╪»┘à ╪º┘ä╪╖┘ä╪¿ ╪ú┘ê ╪¿╪╖╪º┘é╪⌐ ┘à┘å╪»┘ê╪¿ ╪╡╪º╪»╪▒╪⌐ ╪╣┘å ╪º┘ä╪Ñ╪»╪º╪▒╪⌐ ╪º┘ä╪╣╪º┘à╪⌐ ┘ä┘ä╪Ñ┘é╪º┘à╪⌐ ┘ê╪┤╪ñ┘ê┘å ╪º┘ä╪ú╪¼╪º┘å╪¿."/>

            <SecBar en="Additional Terms:" ar="╪┤╪▒┘ê╪╖ ╪Ñ╪╢╪º┘ü┘è╪⌐:"/>
            {add && ['c1','c2','c3','c4','c5','c6','c7','c8'].some(k=>!!(add as any)[k]) ? (
              ['c1','c2','c3','c4','c5','c6','c7','c8']
                .filter(k => !!(add as any)[k])
                .map((k,i) =>
                  <tr key={k} style={{borderBottom:'1px solid #eef2f7'}}>
                    <td style={{width:18}}><div style={{width:14,height:14,border:'1px solid #aaa',borderRadius:'50%',textAlign:'center',lineHeight:'12px',fontSize:7}}>{i+1}</div></td>
                    <td colSpan={2} style={{fontFamily:ENFNT,fontSize:7.5,padding:'3px 5px'}}>{(add as any)[k]}</td>
                    <td style={{width:18}}><div style={{width:14,height:14,border:'1px solid #aaa',borderRadius:'50%',textAlign:'center',lineHeight:'12px',fontSize:7}}>{i+1}</div></td>
                  </tr>
                )
            ) : (
              <tr><td style={{width:18}}>-</td><td colSpan={2} style={{fontFamily:ENFNT,fontSize:7.5,color:'#aaa',fontStyle:'italic',padding:'3px 5px'}}>No additional terms.</td><td style={{width:18}}>-</td></tr>
            )}
          </tbody>
        </table>
        <p style={{fontFamily:ENFNT,fontSize:6.5,color:'#777',margin:'6px 0',textAlign:'center'}}>
          Note: You may add an addendum in case of additional terms; must be signed by all parties. |&nbsp;
          <span style={{fontFamily:ARFNT,fontSize:8,direction:'rtl',unicodeBidi:'embed'}}>┘à┘ä╪º╪¡╪╕╪⌐: ┘è┘à┘â┘å ╪Ñ╪╢╪º┘ü╪⌐ ┘à┘ä╪¡┘é ╪Ñ┘ä┘ë ┘ç╪░╪º ╪º┘ä╪╣┘é╪» ╪╣┘ä┘ë ╪ú┘å ┘è┘ê┘é╪╣ ┘à┘å ╪ú╪╖╪▒╪º┘ü ╪º┘ä╪¬╪╣╪º┘é╪».</span>
        </p>
        <Sigs/>
        <Footer/>
      </div>

      {/* ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ PAGE 3: ADDENDUM ΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉΓòÉ */}
      <div style={{...P, minHeight:1123}} id="contract-page-3">
        <StatusBanner/>
        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
          <GovDubaiLogo/>
          <div style={{textAlign:'right',display:'flex',flexDirection:'column',alignItems:'flex-end',gap:2}}>
            <div style={{fontFamily:ARFNT,fontSize:14,fontWeight: 600,color:NAVY,direction:'rtl',unicodeBidi:'embed'}}>╪»╪º╪ª╪▒╪⌐ ╪º┘ä╪ú╪▒╪º╪╢┘è ┘ê╪º┘ä╪ú┘à┘ä╪º┘â</div>
            <div style={{fontFamily:ENFNT,fontSize:8.5,fontWeight: 600,color:NAVY}}>Land Department</div>
            <LandLogo size={48}/>
          </div>
        </div>

        <div style={{textAlign:'center',fontFamily:ENFNT,fontSize:11,fontWeight: 600,border:`1.8px solid #4a6fa5`,borderRadius:5,padding:'6px 10px',marginBottom:12,color:NAVY,display:'flex',justifyContent:'center',alignItems:'center',gap:16}}>
          ADDENDUM NO.{add?.addendum_no ?? '1'} TO TENANCY CONTRACT
          <span style={{fontFamily:ARFNT,fontSize:14,direction:'rtl',unicodeBidi:'embed'}}>┘à┘ä╪¡┘é ╪╣┘é╪» ╪º┘ä╪Ñ┘è╪¼╪º╪▒</span>
        </div>

        <table style={{width:'100%',fontFamily:ENFNT,fontSize:8.5,marginBottom:12,borderCollapse:'collapse'}}>
          <tbody>
            {[['Tenant',tenN,'╪º┘ä┘à╪│╪¬╪ú╪¼╪▒'],['Contact',tenEm,'╪º┘ä╪¬┘ê╪º╪╡┘ä'],['Building',`${bld} - ${pNo} - ${pTp}`,'╪º┘ä┘à╪¿┘å┘ë']].map(([lbl,val,ar])=>(
              <tr key={lbl as string}>
                <td style={{width:70,fontWeight: 600,padding:'2px 4px'}}>{lbl}</td>
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
              <td style={{padding:'4px 8px',color:'#fff',fontFamily:ENFNT,fontSize:8,fontWeight: 600}}>Item</td>
              <td style={{padding:'4px 8px',color:'#fff',fontFamily:ENFNT,fontSize:8,fontWeight: 600,textAlign:'center',width:80}}>Qty</td>
              <td style={{padding:'4px 8px',color:'#fff',fontFamily:ENFNT,fontSize:8,fontWeight: 600,textAlign:'center',width:90}}>Condition</td>
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

        <p style={{fontFamily:ENFNT,fontSize:8.5,marginTop:16,fontWeight: 600,color:NAVY}}>
          Agreed and Accepted /&nbsp;
          <span style={{fontFamily:ARFNT,fontSize:11,direction:'rtl',unicodeBidi:'embed'}}>┘à┘ê╪º┘ü┘é ┘ê┘à┘é╪¿┘ê┘ä</span>
        </p>
        <Sigs/>
        <Footer/>
      </div>
    </div>
  )
}
