import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import api from '../../api/axios'
import { formatDate } from '../../utils/formatDate'
import { THEME, Icon, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'
import TenancyContractTemplate, { type ContractData } from '../../components/gfh/TenancyContractTemplate'
import { generateContractPDF } from '../../utils/generateContractPDF'

interface Contract {
  id: number
  unit_id: number
  tenant_id: number
  owner_id: number
  start_date: string
  end_date: string
  rent_amount: number
  security_deposit: number
  status: string
  type: string
  notes?: string
  on_case?: boolean
  last_renewed_at?: string | null
  unit?: { id: number; number: string; property?: { name: string } }
  tenant?: { id: number; name: string; email: string }
  owner?: { id: number; name: string }
}

interface Unit { id: number; number: string; property?: { name: string } }
interface Tenant { id: number; name: string; email: string }
interface Owner { id: number; name: string }

/** Status badge styles — semantic color coding for contract lifecycle. */
const STATUS_BADGE: Record<string, { bg: string; color: string; border: string }> = {
  active:  { bg: '#f0fdf4', color: '#065f46', border: '#bbf7d0' },
  vacated: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  settled: { bg: '#f0f9ff', color: '#075985', border: '#bae6fd' },
  expired: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
}

const icons = {
  plus: 'M12 5v14M5 12h14',
}

export default function ContractManagement() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [renewModal, setRenewModal] = useState<Contract | null>(null)
  const [vacateContract, setVacateContract] = useState<Contract | null>(null)

  const [formData, setFormData] = useState({ 
    unit_id: '', tenant_id: '', owner_id: '', start_date: '', end_date: '', 
    rent_amount: '', security_deposit: '', type: 'residential', notes: '',
    mode_of_payment: 'cash', contract_value: '', discount_type: '', discount_info: '',
    passport_image: null as File | null, visa_page: null as File | null, 
    tenant_id_image: null as File | null, tenant_id_back_image: null as File | null 
  })
  const [renewData, setRenewData] = useState({ new_end_date: '', new_rent_amount: '' })
  const [vacateNote, setVacateNote] = useState('')

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setIsLoading(true)
    try {
      const [cRes, uRes, oRes, tRes] = await Promise.all([
        api.get('/admin/contracts'),
        api.get('/admin/units'),
        api.get('/admin/properties/owners'),
        api.get('/admin/tenants'),
      ])
      setContracts(cRes.data?.data?.contracts || [])
      setUnits(uRes.data?.data?.units || [])
      setOwners(oRes.data?.data?.owners || [])
      setTenants(tRes.data?.data?.tenants || [])
    } catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          data.append(key, value as any)
        }
      })
      await api.post('/admin/contracts', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setIsModalOpen(false)
      fetchAll()
    } catch (err: any) { alert(err.response?.data?.message || 'Error creating contract') }
  }

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!renewModal) return
    try {
      await api.post(`/admin/contracts/${renewModal.id}/renew`, renewData)
      setRenewModal(null)
      fetchAll()
    } catch (err: any) { alert(err.response?.data?.message || 'Error renewing') }
  }

  const handleVacate = async () => {
    if (!vacateContract) return
    try {
      await api.post(`/admin/contracts/${vacateContract.id}/vacate`, { notes: vacateNote })
      setVacateContract(null)
      fetchAll()
    } catch (err) { alert('Error vacating contract') }
  }

  const downloadPdf = async (id: number) => {
    if (pdfLoading !== null) return
    setPdfLoading(id)
    try {
      const response = await api.get(`/admin/contracts/${id}/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `GoFreeHold_Contract_${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
    } catch (err) {
      console.error('PDF download error:', err)
      alert('Failed to download PDF. Please try again.')
    } finally {
      setPdfLoading(null)
    }
  }

  const formCss = `
    .gfh-form * { font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif; }
    .gfh-section-title {
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 1.1px;
      text-transform: uppercase;
      color: ${THEME.violetLight};
      margin: 0 0 12px 0;
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .gfh-section-title::before {
      content: '';
      width: 7px;
      height: 7px;
      background: ${THEME.violetLight};
      display: inline-block;
    }
    .gfh-section {
      background: #ffffff !important;
      border: 1px solid ${THEME.border};
      border-left: 3px solid ${THEME.violetLight};
      padding: 15px 17px;
      margin-bottom: 13px;
    }
    .gfh-label {
      display: block;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      color: #0f172a !important;
      margin-bottom: 6px;
    }
    .gfh-input, .gfh-input:focus, .gfh-input:hover,
    select.gfh-input, textarea.gfh-input {
      background-color: #ffffff !important;
      color: #0f172a !important;
      border: 1px solid #94a3b8 !important;
      border-radius: 0 !important;
      width: 100%;
      padding: 10px 12px;
      font-size: 13.5px;
      font-weight: 600;
      box-sizing: border-box;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .gfh-input:focus {
      outline: none !important;
      border-color: #075985 !important;
      background: #ffffff !important;
      box-shadow: 0 0 0 3px rgba(7,89,133,0.15) !important;
    }
    .gfh-input::placeholder { color: #64748b !important; }
  `

  const inputInline: React.CSSProperties = {
    borderRadius: 0,
    background: '#ffffff',
    color: '#0f172a',
    border: '1px solid #94a3b8',
    width: '100%',
    padding: '10px 12px',
    fontSize: 13.5,
    fontWeight: 600,
    boxSizing: 'border-box',
  }

  const labelInline: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    color: '#0f172a',
    marginBottom: 6,
    display: 'block',
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Contract Management
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Full contract lifecycle: create, renew, vacate, settle
          </p>
        </div>
        <button className="gfh-portal-btn" onClick={() => setIsModalOpen(true)} style={ghostBtnStyle}>
          <Icon path={icons.plus} size={16} />
          New Contract
        </button>
      </div>

      <div className="fade-in" style={{ ...panelStyle, minHeight: 320 }}>
        <CornerBrackets />
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 32 }}><span className="spinner" /></div>
        ) : contracts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: THEME.textMuted, fontWeight: 600, fontSize: 13.5 }}>No contracts found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  {['Ref #', 'Unit', 'Tenant', 'Owner', 'Duration', 'Rent (AED)', 'Status', 'Actions'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contracts.map(c => (
                  <tr key={c.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                    <td style={tdStyle}>
                      <Link to={`/admin/contracts/${c.id}`} style={{ textDecoration: 'none' }}>
                        <strong style={{ color: THEME.purple, fontSize: 13, textDecoration: 'underline' }}>
                          GFH-{String(c.id).padStart(5,'0')}
                        </strong>
                      </Link>
                    </td>
                    <td style={tdStyle}>{c.unit?.number}<br /><span style={{ fontSize: 11, color: THEME.textMuted, fontWeight: 500 }}>{c.unit?.property?.name}</span></td>
                    <td style={tdStyle}>{c.tenant?.name}</td>
                    <td style={tdStyle}>{c.owner?.name}</td>
                    <td style={{ ...tdStyle, fontSize: 11 }}>{formatDate(c.start_date)}<br />→ {formatDate(c.end_date)}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: THEME.violet }}>AED {Number(c.rent_amount).toLocaleString()}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-start' }}>
                        <span style={{
                          backgroundColor: (STATUS_BADGE[c.status] || { bg: '#f3f4f6' }).bg,
                          color: (STATUS_BADGE[c.status] || { color: '#374151' }).color,
                          border: `1px solid ${(STATUS_BADGE[c.status] || { border: '#d1d5db' }).border}`,
                          padding: '3px 8px',
                          borderRadius: 0,
                          fontSize: 10.5,
                          fontWeight: 800,
                          letterSpacing: 0.3,
                        }}>
                          {(c.status || '—').toString().toUpperCase()}
                        </span>
                        {c.last_renewed_at && (
                          <span style={{
                            backgroundColor: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            padding: '2px 7px',
                            fontSize: 10,
                            fontWeight: 700,
                            borderRadius: 0,
                          }}>
                            Renewed on {formatDate(c.last_renewed_at)}
                          </span>
                        )}
                        {c.on_case && (
                          <span style={{
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            border: '1px solid #fecaca',
                            padding: '2px 7px',
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: 0.3,
                            borderRadius: 0,
                          }}>
                            LEGAL CASE ACTIVE
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        <Link
                          to={`/admin/contracts/${c.id}`}
                          className="gfh-portal-btn"
                          style={{
                            padding: '5px 10px', fontSize: 10.5, fontWeight: 700,
                            borderRadius: 0, border: 'none',
                            background: '#075985', color: '#fff', textDecoration: 'none',
                            display: 'inline-flex', alignItems: 'center'
                          }}
                        >
                          Details
                        </Link>
                        <button
                          className="gfh-portal-btn"
                          onClick={() => downloadPdf(c.id)}
                          disabled={pdfLoading !== null}
                          style={{
                            padding: '5px 10px', fontSize: 10.5, fontWeight: 700,
                            borderRadius: 0, border: 'none',
                            background: pdfLoading === c.id ? '#0e7490' : '#0e7490',
                            color: '#fff',
                            cursor: pdfLoading !== null ? 'not-allowed' : 'pointer',
                            opacity: pdfLoading !== null && pdfLoading !== c.id ? 0.5 : 1,
                            display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s',
                          }}
                        >
                          {pdfLoading === c.id ? (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                              </svg>
                              Generating...
                            </>
                          ) : 'PDF'}
                        </button>

                        {c.status === 'active' && <>
                          <button
                            className="gfh-portal-btn"
                            onClick={() => { setRenewModal(c); setRenewData({ new_end_date: '', new_rent_amount: String(c.rent_amount) }) }}
                            style={{ padding: '5px 10px', fontSize: 10.5, fontWeight: 700, borderRadius: 0, border: 'none', background: '#065f46', color: '#fff', cursor: 'pointer' }}
                          >
                            Renew
                          </button>
                          <button
                            className="gfh-portal-btn"
                            onClick={() => setVacateContract(c)}
                            style={{ padding: '5px 10px', fontSize: 10.5, fontWeight: 700, borderRadius: 0, border: 'none', background: '#991b1b', color: '#fff', cursor: 'pointer' }}
                          >
                            Vacate
                          </button>
                        </>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,61,58,0.55)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <style>{formCss}</style>
          <div style={{ position: 'relative', width: 540, padding: 0, maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', borderRadius: 0, border: `1px solid ${THEME.border}`, boxShadow: '0 20px 50px rgba(15,61,58,0.35)' }}>
            <CornerBrackets />
            <div style={{ background: `linear-gradient(135deg, ${THEME.purpleDark}, ${THEME.purpleMid})`, padding: '18px 24px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#fff', margin: 0, fontSize: 19, fontWeight: 700 }}>New Contract</h2>
              <p style={{ color: THEME.textMuted, fontSize: 12.5, margin: '4px 0 0' }}>Fill in the details to create a lease agreement</p>
            </div>

            <form onSubmit={handleCreate} className="gfh-form" style={{ display: 'flex', flexDirection: 'column', padding: '20px 24px 24px' }}>

              <div className="gfh-section">
                <p className="gfh-section-title">Property &amp; Ownership</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="gfh-label">Unit</label>
                    <select className="gfh-input" value={formData.unit_id} onChange={e => setFormData({...formData, unit_id: e.target.value})} required>
                      <option value="">Select Unit</option>
                      {units.filter(u => (u as any).status === 'AVAILABLE' || (u as any).status === 'BOOKED').map(u => (
                        <option key={u.id} value={u.id}>{u.number} — {u.property?.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="gfh-label">Owner</label>
                    <select className="gfh-input" value={formData.owner_id} onChange={e => setFormData({...formData, owner_id: e.target.value})} required>
                      <option value="">Select Owner</option>
                      {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <label className="gfh-label">Tenant</label>
                  <select className="gfh-input" value={formData.tenant_id} onChange={e => setFormData({...formData, tenant_id: e.target.value})} required>
                    <option value="">Select tenant</option>
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.name}{t.email ? ` (${t.email})` : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="gfh-section">
                <p className="gfh-section-title">Contract Duration</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="gfh-label">Start Date</label>
                    <input type="date" className="gfh-input" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} required />
                  </div>
                  <div>
                    <label className="gfh-label">End Date</label>
                    <input type="date" className="gfh-input" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} required />
                  </div>
                </div>
              </div>

              <div className="gfh-section">
                <p className="gfh-section-title">Financial Terms</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label className="gfh-label">Rent (AED)</label>
                    <input type="number" className="gfh-input" value={formData.rent_amount} onChange={e => setFormData({...formData, rent_amount: e.target.value})} required />
                  </div>
                  <div>
                    <label className="gfh-label">Security Deposit (AED)</label>
                    <input type="number" className="gfh-input" value={formData.security_deposit} onChange={e => setFormData({...formData, security_deposit: e.target.value})} required />
                  </div>
                  <div>
                    <label className="gfh-label">Type</label>
                    <select className="gfh-input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="industrial">Industrial</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="gfh-label">Mode of Payment</label>
                    <select className="gfh-input" value={formData.mode_of_payment} onChange={e => setFormData({...formData, mode_of_payment: e.target.value})}>
                      <option value="cash">Cash</option>
                      <option value="cheque">Cheque</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="gfh-label">Contract Value (AED)</label>
                    <input type="number" className="gfh-input" value={formData.contract_value} onChange={e => setFormData({...formData, contract_value: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="gfh-section">
                <p className="gfh-section-title">Discount Information</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                  <div>
                    <label className="gfh-label">Discount Type</label>
                    <select className="gfh-input" value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value})}>
                      <option value="">No Discount</option>
                      <option value="Period Rent Discount">Period Rent Discount</option>
                      <option value="Amount Discount">Amount Discount</option>
                    </select>
                  </div>
                  <div>
                    <label className="gfh-label">Discount Details</label>
                    <input type="text" className="gfh-input" placeholder="e.g. 1 month free" value={formData.discount_info} onChange={e => setFormData({...formData, discount_info: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="gfh-section">
                <p className="gfh-section-title">Tenant Documents</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="gfh-label">Passport Image</label>
                    <input type="file" className="gfh-input" accept="image/*,.pdf" onChange={e => setFormData({...formData, passport_image: e.target.files?.[0] || null})} />
                  </div>
                  <div>
                    <label className="gfh-label">Visa Page</label>
                    <input type="file" className="gfh-input" accept="image/*,.pdf" onChange={e => setFormData({...formData, visa_page: e.target.files?.[0] || null})} />
                  </div>
                  <div>
                    <label className="gfh-label">ID Front</label>
                    <input type="file" className="gfh-input" accept="image/*,.pdf" onChange={e => setFormData({...formData, tenant_id_image: e.target.files?.[0] || null})} />
                  </div>
                  <div>
                    <label className="gfh-label">ID Back</label>
                    <input type="file" className="gfh-input" accept="image/*,.pdf" onChange={e => setFormData({...formData, tenant_id_back_image: e.target.files?.[0] || null})} />
                  </div>
                </div>
              </div>

              <div className="gfh-section" style={{ marginBottom: 18 }}>
                <p className="gfh-section-title">Additional Notes</p>
                <textarea className="gfh-input" style={{ resize: 'vertical' }} rows={2} placeholder="Any special terms or remarks for this contract..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="gfh-portal-btn" onClick={() => setIsModalOpen(false)} style={{ padding: '9px 17px', border: `1px solid ${THEME.border}`, background: '#fff', color: THEME.textMuted, cursor: 'pointer', fontWeight: 700, fontSize: 12.5, borderRadius: 0 }}>
                  Cancel
                </button>
                <button type="submit" className="gfh-portal-btn" style={{ ...ghostBtnStyle, padding: '9px 19px', fontSize: 12.5 }}>
                  Create Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Renew Modal */}
      {renewModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ position: 'relative', width: 400, padding: 24, background: '#ffffff', borderRadius: 0, border: `1px solid ${THEME.border}`, boxShadow: '0 20px 50px rgba(15,23,42,0.3)' }}>
            <CornerBrackets />
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#0f172a', fontSize: 18, fontWeight: 800, textTransform: 'uppercase', marginBottom: 5 }}>Renew Contract</h2>
            <p style={{ color: '#334155', marginBottom: 16, fontSize: 13, fontWeight: 700 }}>GFH-{String(renewModal.id).padStart(5,'0')}</p>
            <form onSubmit={handleRenew} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelInline}>New End Date (must be after {formatDate(renewModal.end_date)})</label>
                <input type="date" style={inputInline} value={renewData.new_end_date} onChange={e => setRenewData({...renewData, new_end_date: e.target.value})} required />
              </div>
              <div>
                <label style={labelInline}>New Rent Amount (AED)</label>
                <input type="number" style={inputInline} value={renewData.new_rent_amount} onChange={e => setRenewData({...renewData, new_rent_amount: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="button"
                  className="gfh-portal-btn"
                  onClick={() => setRenewModal(null)}
                  style={{ padding: '9px 16px', borderRadius: 0, border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#0f172a', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gfh-portal-btn"
                  style={{ padding: '9px 18px', borderRadius: 0, border: 'none', background: '#065f46', color: '#ffffff', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
                >
                  Confirm Renewal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vacate Modal */}
      {vacateContract && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(20,5,40,0.55)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ position: 'relative', width: 380, padding: 24, background: '#fff', borderRadius: 0, border: `1px solid ${THEME.border}` }}>
            <CornerBrackets color="#f59e0b" />
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, marginBottom: 5, color: '#d97706' }}>Vacate Contract</h2>
            <p style={{ color: THEME.textMuted, marginBottom: 16, fontSize: 12.5, fontWeight: 500 }}>Unit will be set back to AVAILABLE after vacating.</p>
            <textarea
              rows={3}
              placeholder="Reason / notes for vacating..."
              value={vacateNote}
              onChange={e => setVacateNote(e.target.value)}
              style={{ ...inputInline, marginBottom: 14, resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                className="gfh-portal-btn"
                onClick={() => setVacateContract(null)}
                style={{ padding: '8px 15px', borderRadius: 0, border: `1px solid ${THEME.border}`, background: '#fff', color: THEME.textMuted, cursor: 'pointer', fontWeight: 700, fontSize: 12.5 }}
              >
                Cancel
              </button>
              <button
                className="gfh-portal-btn"
                onClick={handleVacate}
                style={{ padding: '8px 15px', borderRadius: 0, border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 12.5 }}
              >
                Confirm Vacate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
