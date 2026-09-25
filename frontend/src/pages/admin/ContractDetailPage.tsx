import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'
import ChequeDetails, { type ChequeDetailsData } from '../../components/gfh/ChequeDetails'
import { formatDate } from '../../utils/formatDate'
import { THEME, Icon, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'
import VacateSettlementModal from '../../components/gfh/VacateSettlementModal'

interface ContractDetail {
  id: number
  unit_id: number
  tenant_id: number
  owner_id: number
  start_date: string
  end_date: string
  due_date?: string
  rent_amount: number
  security_deposit: number
  dewa_deposit?: number
  deposit_type?: string
  lease_term?: string
  status: string
  type: string
  notes?: string
  on_case?: boolean
  last_renewed_at?: string | null
  mode_of_payment?: string
  contract_value?: number
  discount_type?: string
  discount_info?: string
  unit?: { id: number; number: string; property?: { name: string } }
  tenant?: { id: number; name: string; email: string; phone?: string; contact?: string; address?: string }
  owner?: { id: number; name: string; email?: string }
  cheques?: Array<ChequeDetailsData & { cheque_number: string | null; bank_name: string; amount: number; due_date: string; status: string }>
  callLogs?: Array<{ id: number; call_date: string; notes: string; outcome?: string }>
  payments?: Array<{ id: number; date: string; amount: number; mode: string; type: string; remarks?: string }>
}

// Deep Professional Dark Color Palette
const DARK_COLORS = {
  emeraldDark: '#065f46',   // Deep green for Renew / Positive
  navyDark: '#075985',      // Deep navy blue for PDF / Secondary
  cyanDark: '#0e7490',      // Deep cyan for Legal case
  crimsonDark: '#991b1b',   // Deep dark red for Vacate / Dues
  purpleDark: '#6B21A8',    // Deep dark purple header/accents
  slateDark: '#1e293b',     // Deep slate card headers
}

type TabType = 'lease' | 'documents' | 'cheques' | 'statement'
type WorkspaceTabType = 'overview' | 'payments' | 'cheques' | 'documents' | 'contract'

const LegalCaseBadge = ({ active }: { active?: boolean }) => {
  if (!active) return null

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: '#FEF2F2',
        color: '#991B1B',
        border: '1px solid #FECACA',
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: '0.6px',
        textTransform: 'uppercase',
        padding: '4px 12px',
        borderRadius: 6,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#DC2626' }} />
      LEGAL CASE ACTIVE
    </span>
  )
}

export default function ContractDetailPage({ basePath }: { basePath?: string } = {}) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  const effectiveBasePath = basePath || (
    location.pathname.startsWith('/owner') ? '/owner' :
    location.pathname.startsWith('/cashier') ? '/cashier' :
    location.pathname.startsWith('/accountant') ? '/accountant' :
    '/admin'
  )
  const isOwnerStaff = effectiveBasePath !== '/admin'
  const isCashier = user?.role === 'cashier' || effectiveBasePath === '/cashier'
  const apiPrefix = isOwnerStaff ? '/owner' : '/admin'
  const [contract, setContract] = useState<ContractDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('lease')
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTabType>('overview')
  const [pdfLoading, setPdfLoading] = useState(false)
  const [mode, setMode] = useState<'view' | 'edit'>('view')

  // Rent Statement / Ledger state (Image 2)
  const [ledgerEntries, setLedgerEntries] = useState<Array<{
    id: number
    contract_id: number
    date: string
    description: string
    debit: number | string
    credit: number | string
    running_balance?: number
  }>>([])
  const [ledgerSummary, setLedgerSummary] = useState({ total_debit: 0, total_credit: 0, total_balance: 0 })
  const [ledgerLoading, setLedgerLoading] = useState(false)
  const [bottomTab, setBottomTab] = useState<'statement' | 'cheques'>('statement')
  const [exportLoading, setExportLoading] = useState(false)

  // Modals & Action States
  const [renewModalOpen, setRenewModalOpen] = useState(false)
  const [renewData, setRenewData] = useState({ new_end_date: '', new_rent_amount: '' })

  const [vacateModalOpen, setVacateModalOpen] = useState(false)
  const [vacateNote, setVacateNote] = useState('')

  const [callLogModalOpen, setCallLogModalOpen] = useState(false)
  const [callLogData, setCallLogData] = useState({ call_date: new Date().toISOString().split('T')[0], notes: '', outcome: 'follow_up' })

  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [newPayment, setNewPayment] = useState({ amount: '', type: 'rent', mode: 'bank_transfer', date: new Date().toISOString().split('T')[0], remarks: '' })

  const [chargeModalOpen, setChargeModalOpen] = useState(false)
  const [newCharge, setNewCharge] = useState({ amount: '', description: 'Service / Maintenance Charge', date: new Date().toISOString().split('T')[0] })
  const [chargeSubmitting, setChargeSubmitting] = useState(false)

  const [chequeModalOpen, setChequeModalOpen] = useState(false)
  const [newCheque, setNewCheque] = useState({ cheque_number: '', bank_name: 'Emirates NBD', amount: '', due_date: new Date().toISOString().split('T')[0] })

  // 3-dots action menu state
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null)

  // Lease Form State (Matches fields in reference image)
  const [editForm, setEditForm] = useState({
    tenant_name: '',
    tenant_address: '',
    tenant_contact: '',
    tenant_email: '',
    lease_term: 'Monthly',
    rent_amount: '',
    start_date: '',
    end_date: '',
    due_date: '',
    security_deposit: '',
    deposit_type: 'CHEQUE',
    dewa_deposit: '',
    cheque_date: '',
    cheque_number: '',
    cheque_bank: 'Emirates NBD',
  })

  useEffect(() => {
    if (id) fetchContract()
  }, [id])

  useEffect(() => {
    const sp = new URLSearchParams(location.search)
    if (sp.get('action') === 'vacate' && contract?.status === 'active') {
      setVacateModalOpen(true)
    }
  }, [location.search, contract?.status])

  // Close action menus when clicking anywhere outside
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.gfh-action-menu-dropdown') && !target.closest('.gfh-action-menu-btn')) {
        setActionMenuOpen(null)
      }
    }
    if (actionMenuOpen !== null) {
      document.addEventListener('mousedown', handleDocClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleDocClick)
    }
  }, [actionMenuOpen])

  const fetchContract = async () => {
    setIsLoading(true)
    try {
      const res = await api.get(`${apiPrefix}/contracts/${id}`)
      const data = res.data?.data?.contract
      setContract(data)
      if (data) {
        setEditForm({
          tenant_name: data.tenant?.name || '',
          tenant_address: data.tenant?.address || 'DUBAI',
          tenant_contact: data.tenant?.phone || data.tenant?.contact || '',
          tenant_email: data.tenant?.email || '',
          lease_term: data.lease_term || 'Monthly',
          rent_amount: String(data.rent_amount ?? ''),
          start_date: data.start_date ? data.start_date.split('T')[0] : '',
          end_date: data.end_date ? data.end_date.split('T')[0] : '',
          due_date: data.due_date ? data.due_date.split('T')[0] : (data.start_date ? data.start_date.split('T')[0] : ''),
          security_deposit: String(data.security_deposit ?? ''),
          deposit_type: data.deposit_type || 'CHEQUE',
          dewa_deposit: String(data.dewa_deposit ?? ''),
          cheque_date: data.cheques?.[0]?.due_date ? data.cheques[0].due_date.split('T')[0] : (data.start_date ? data.start_date.split('T')[0] : ''),
          cheque_number: data.cheques?.[0]?.cheque_number || '123456',
          cheque_bank: data.cheques?.[0]?.bank_name || 'Emirates NBD',
        })
      }
      if (id) {
        fetchLedger(id)
      }
    } catch (err) {
      console.error('Failed to load contract:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLedger = async (contractId: string | number) => {
    setLedgerLoading(true)
    try {
      const res = await api.get(`${apiPrefix}/rent-ledger?contract_id=${contractId}`)
      const raw = res.data?.data?.entries || []
      // Sort chronologically (earliest first) to compute running balance
      const sorted = [...raw].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.id - b.id)
      let running = 0
      const calculated = sorted.map((item: any) => {
        const d = Number(item.debit) || 0
        const c = Number(item.credit) || 0
        running += (d - c)
        return {
          ...item,
          running_balance: running,
        }
      })
      setLedgerEntries(calculated)
      if (res.data?.data?.summary) {
        setLedgerSummary(res.data.data.summary)
      } else {
        const totDeb = calculated.reduce((acc: number, curr: any) => acc + (Number(curr.debit) || 0), 0)
        const totCred = calculated.reduce((acc: number, curr: any) => acc + (Number(curr.credit) || 0), 0)
        setLedgerSummary({
          total_debit: totDeb,
          total_credit: totCred,
          total_balance: totDeb - totCred,
        })
      }
    } catch (err) {
      console.error('Failed to load ledger', err)
    } finally {
      setLedgerLoading(false)
    }
  }

  const handleExportExcel = async () => {
    if (!contract) return
    setExportLoading(true)
    try {
      const response = await api.get(`/admin/reports/export/historical-ledgers?contract_id=${contract.id}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Rent_Statement_Contract_${contract.id}_${new Date().toISOString().slice(0, 10)}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.warn('Server export failed, falling back to CSV export:', err)
      try {
        const headers = ['Date', 'Description', 'Debit (AED)', 'Credit (AED)', 'Balance (AED)']
        const rows = ledgerEntries.map(e => [
          `"${e.date}"`,
          `"${(e.description || '').replace(/"/g, '""')}"`,
          `"${Number(e.debit || 0).toFixed(2)}"`,
          `"${Number(e.credit || 0).toFixed(2)}"`,
          `"${Number(e.running_balance || 0).toFixed(2)}"`,
        ])
        rows.push([])
        rows.push(['"Total Receivable"', '', `"${Number(ledgerSummary.total_debit).toFixed(2)}"`, '', ''])
        rows.push(['"Total Received"', '', '', `"${Number(ledgerSummary.total_credit).toFixed(2)}"`, ''])
        rows.push(['"Other Due / Balance"', '', '', '', `"${Number(ledgerSummary.total_balance).toFixed(2)}"`])

        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `Rent_Statement_Contract_${contract.id}_${new Date().toISOString().slice(0, 10)}.csv`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } catch (fallbackErr) {
        alert('Could not export statement.')
      }
    } finally {
      setExportLoading(false)
    }
  }

  // Printable receipt generator for SEC and DEWA
  const printReceipt = (type: 'SEC' | 'DEWA') => {
    const win = window.open('', '_blank')
    if (!win) {
      alert('Please allow popups to print receipts')
      return
    }
    const isSec = type === 'SEC'
    const title = isSec ? 'SECURITY DEPOSIT RECEIPT' : 'DEWA DEPOSIT RECEIPT'
    const amountVal = isSec ? (editForm.security_deposit || contract?.security_deposit || 0) : (editForm.dewa_deposit || contract?.dewa_deposit || 0)
    const depositPurpose = isSec ? 'Refundable Tenancy Security Deposit' : 'DEWA Utilities Connection Deposit'

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - GFH-${String(contract?.id || '').padStart(5, '0')}</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #0f172a; max-width: 780px; margin: 0 auto; }
            .header { border-bottom: 2px solid #0E5E48; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
            .logo { font-size: 26px; font-weight: 800; color: #0E5E48; }
            .sub-logo { font-size: 11px; font-weight: 700; color: #065F46; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }
            .receipt-title { font-size: 18px; font-weight: 800; color: #0F172A; text-transform: uppercase; text-align: right; }
            .ref-no { font-size: 13px; color: #64748B; margin-top: 4px; text-align: right; }
            .table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            .table th, .table td { padding: 12px 14px; border-bottom: 1px solid #E2E8F0; text-align: left; font-size: 13.5px; }
            .table th { background: #F8FAFC; color: #64748B; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.5px; width: 35%; }
            .total-box { margin-top: 24px; background: #ECFDF5; border: 1px solid #A7F3DC; border-radius: 8px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
            .total-label { font-size: 14px; font-weight: 700; color: #065F46; text-transform: uppercase; }
            .total-val { font-size: 24px; font-weight: 800; color: #065F46; }
            .signatures { margin-top: 60px; display: flex; justify-content: space-between; }
            .sig-line { width: 220px; border-bottom: 1px solid #94A3B8; margin-bottom: 8px; }
            .sig-text { font-size: 12px; color: #64748B; }
            .footer { margin-top: 50px; font-size: 11px; color: #94A3B8; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">GoFreeHold</div>
              <div class="sub-logo">Property & Asset Management</div>
            </div>
            <div>
              <div class="receipt-title">${title}</div>
              <div class="ref-no">Receipt #: GFH-REC-${String(contract?.id || '')}-${type}</div>
              <div class="ref-no">Date: ${new Date().toLocaleDateString('en-GB')}</div>
            </div>
          </div>

          <table class="table">
            <tr><th>Property / Tower</th><td><strong>${contract?.unit?.property?.name || 'Morocco-I-11'}</strong></td></tr>
            <tr><th>Unit Number</th><td><strong>${contract?.unit?.number || '105'}</strong> (${contract?.type || 'STUDIO'})</td></tr>
            <tr><th>Tenant Name</th><td><strong>${editForm.tenant_name || contract?.tenant?.name || '—'}</strong></td></tr>
            <tr><th>Contact Number</th><td>${editForm.tenant_contact || contract?.tenant?.phone || '—'}</td></tr>
            <tr><th>Email Address</th><td>${editForm.tenant_email || contract?.tenant?.email || '—'}</td></tr>
            <tr><th>Deposit Description</th><td>${depositPurpose}</td></tr>
            <tr><th>Payment Type</th><td>${editForm.deposit_type || 'CHEQUE'}</td></tr>
            <tr><th>Tenancy Period</th><td>${editForm.start_date} &nbsp;to&nbsp; ${editForm.end_date}</td></tr>
          </table>

          <div class="total-box">
            <div class="total-label">Amount Received</div>
            <div class="total-val">AED ${Number(amountVal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>

          <div class="signatures">
            <div>
              <div class="sig-line"></div>
              <div class="sig-text">Tenant's Signature</div>
            </div>
            <div>
              <div class="sig-line"></div>
              <div class="sig-text">GoFreeHold Authorized Stamp / Officer</div>
            </div>
          </div>

          <div class="footer">
            Official System Generated Document • GoFreeHold Property Management Systems Dubai • All rights reserved
          </div>
        </body>
      </html>
    `)
    win.document.close()
    setTimeout(() => {
      win.print()
    }, 400)
  }

  const downloadPdf = async () => {
    if (!id || pdfLoading) return
    setPdfLoading(true)
    try {
      const response = await api.get(`${apiPrefix}/contracts/${id}/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Tenancy_Contract_GFH_${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
    } catch (err) {
      alert('Error downloading PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  const handleToggleOnCase = async () => {
    if (!contract) return
    try {
      await api.put(`${apiPrefix}/contracts/${contract.id}/on-case`, { on_case: !contract.on_case })
      fetchContract()
    } catch (err) {
      alert('Failed to update case status')
    }
  }

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contract) return
    try {
      await api.post(`${apiPrefix}/contracts/${contract.id}/renew`, renewData)
      setRenewModalOpen(false)
      fetchContract()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to renew contract')
    }
  }

  const handleVacateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contract) return
    try {
      await api.post(`${apiPrefix}/contracts/${contract.id}/vacate`, { notes: vacateNote })
      setVacateModalOpen(false)
      fetchContract()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to vacate contract')
    }
  }

  const handleCallLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contract) return
    try {
      await api.post(`${apiPrefix}/call-logs`, { contract_id: contract.id, ...callLogData })
      setCallLogModalOpen(false)
      fetchContract()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add call log')
    }
  }

  const handleDeletePayment = async (paymentId: number) => {
    try {
      setActionMenuOpen(null)
      // Optimistically remove from state so row disappears instantly
      setContract(prev => prev ? {
        ...prev,
        payments: (prev.payments || []).filter(p => p.id !== paymentId)
      } : prev)

      await api.delete(`${apiPrefix}/payments/${paymentId}`, {
        data: { reason: 'Cancelled by administrator' }
      })
      await fetchContract()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete payment')
      await fetchContract()
    }
  }

  const handleDeleteCheque = async (chequeId: number) => {
    if (!contract) return
    try {
      setActionMenuOpen(null)
      setContract(prev => prev ? {
        ...prev,
        cheques: (prev.cheques || []).filter(c => c.id !== chequeId)
      } : prev)

      await api.delete(`${apiPrefix}/contracts/${contract.id}/cheques/${chequeId}`)
      await fetchContract()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete cheque')
      await fetchContract()
    }
  }

  // Print official payment receipt for any payment row
  const printPaymentReceipt = (p: any) => {
    const win = window.open('', '_blank')
    if (!win) {
      alert('Please allow popups to print receipts')
      return
    }
    const amountVal = p.amount || 0
    const dateVal = p.date || formatDate(new Date())
    const typeVal = (p.type || 'RENT').toUpperCase()
    const modeVal = (p.mode || 'CASH').toUpperCase()

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PAYMENT RECEIPT - GFH-${String(contract?.id || '').padStart(5, '0')}</title>
          <style>
            body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 40px; color: #0f172a; max-width: 780px; margin: 0 auto; }
            .header { border-bottom: 2px solid #0E5E48; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
            .logo { font-size: 26px; font-weight: 800; color: #0E5E48; }
            .sub-logo { font-size: 11px; font-weight: 700; color: #065F46; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }
            .receipt-title { font-size: 18px; font-weight: 800; color: #0F172A; text-transform: uppercase; text-align: right; }
            .ref-no { font-size: 13px; color: #64748B; margin-top: 4px; text-align: right; }
            .table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            .table th, .table td { padding: 12px 14px; border-bottom: 1px solid #E2E8F0; text-align: left; font-size: 13.5px; }
            .table th { background: #F8FAFC; color: #64748B; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.5px; width: 35%; }
            .total-box { margin-top: 24px; background: #ECFDF5; border: 1px solid #A7F3DC; border-radius: 8px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
            .total-label { font-size: 14px; font-weight: 700; color: #065F46; text-transform: uppercase; }
            .total-val { font-size: 24px; font-weight: 800; color: #065F46; }
            .signatures { margin-top: 60px; display: flex; justify-content: space-between; }
            .sig-line { width: 220px; border-bottom: 1px solid #94A3B8; margin-bottom: 8px; }
            .sig-text { font-size: 12px; color: #64748B; }
            .footer { margin-top: 50px; font-size: 11px; color: #94A3B8; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">GoFreeHold</div>
              <div class="sub-logo">Property Management System • Dubai, UAE</div>
            </div>
            <div>
              <div class="receipt-title">OFFICIAL PAYMENT RECEIPT</div>
              <div class="ref-no">Contract Ref: GFH-${String(contract?.id || '').padStart(5, '0')}</div>
              <div class="ref-no">Receipt Date: ${dateVal}</div>
            </div>
          </div>

          <table class="table">
            <tr>
              <th>Tenant Name</th>
              <td><strong>${contract?.tenant?.name || 'N/A'}</strong></td>
            </tr>
            <tr>
              <th>Property & Unit</th>
              <td>${contract?.unit?.property?.name || ''} - Unit ${contract?.unit?.number || ''}</td>
            </tr>
            <tr>
              <th>Payment Type</th>
              <td><strong>${typeVal} PAYMENT</strong></td>
            </tr>
            <tr>
              <th>Payment Mode</th>
              <td>${modeVal}</td>
            </tr>
            <tr>
              <th>Remarks / Notes</th>
              <td>${p.remarks || '—'}</td>
            </tr>
          </table>

          <div class="total-box">
            <div class="total-label">Amount Received</div>
            <div class="total-val">AED ${typeof amountVal === 'number' ? amountVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : amountVal}</div>
          </div>

          <div class="signatures">
            <div>
              <div class="sig-line"></div>
              <div class="sig-text">Tenant's Signature</div>
            </div>
            <div>
              <div class="sig-line"></div>
              <div class="sig-text">GoFreeHold Authorized Stamp / Officer</div>
            </div>
          </div>

          <div class="footer">
            Official System Generated Document • GoFreeHold Property Management Systems Dubai • All rights reserved
          </div>
        </body>
      </html>
    `)
    win.document.close()
    setTimeout(() => {
      win.print()
    }, 400)
  }

  const openPaymentModal = (type: 'rent' | 'dewa' | 'other' | 'deposit' | 'service_charge' = 'rent') => {
    let defaultAmount = ''
    if (type === 'rent' && contract?.rent_amount) defaultAmount = String(contract.rent_amount)
    if (type === 'dewa' && contract?.dewa_deposit) defaultAmount = String(contract.dewa_deposit)
    setNewPayment({
      amount: defaultAmount,
      type: type,
      mode: 'cash',
      date: new Date().toISOString().split('T')[0],
      remarks: ''
    })
    setPaymentModalOpen(true)
  }

  const handleAddPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contract) return
    try {
      await api.post(`${apiPrefix}/payments`, {
        contract_id: contract.id,
        tenant_id: contract.tenant_id,
        ...newPayment
      })
      setPaymentModalOpen(false)
      fetchContract()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record payment')
    }
  }

  const handleAddChargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contract || isCashier) return
    setChargeSubmitting(true)
    try {
      await api.post(`${apiPrefix}/rent-transactions`, {
        contract_id: contract.id,
        date: newCharge.date,
        description: newCharge.description || 'Manual Charge / Adjustment',
        debit: Number(newCharge.amount),
        credit: 0,
      })
      setChargeModalOpen(false)
      setNewCharge({ amount: '', description: 'Service / Maintenance Charge', date: new Date().toISOString().split('T')[0] })
      fetchContract()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add charge')
    } finally {
      setChargeSubmitting(false)
    }
  }

  const handleWorkspaceTabChange = (tab: WorkspaceTabType) => {
    setWorkspaceTab(tab)
    if (tab === 'overview') {
      setMode('view')
    } else if (tab === 'payments') {
      setMode('edit')
      setActiveTab('statement')
    } else if (tab === 'cheques') {
      setMode('edit')
      setActiveTab('cheques')
    } else if (tab === 'documents') {
      setMode('edit')
      setActiveTab('documents')
    } else if (tab === 'contract') {
      setMode('edit')
      setActiveTab('lease')
    }
  }

  const handleAddChequeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contract) return
    try {
      await api.post(`${apiPrefix}/contracts/${contract.id}/cheques`, {
        ...newCheque,
        status: 'pending',
      })
      setChequeModalOpen(false)
      fetchContract()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add cheque')
    }
  }

  const handleSaveContractEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contract) return
    setIsSaving(true)
    try {
      await api.put(`${apiPrefix}/contracts/${contract.id}`, {
        tenant_name: editForm.tenant_name,
        tenant_address: editForm.tenant_address,
        tenant_contact: editForm.tenant_contact,
        tenant_email: editForm.tenant_email,
        rent_amount: editForm.rent_amount,
        start_date: editForm.start_date,
        end_date: editForm.end_date,
        due_date: editForm.due_date,
        security_deposit: editForm.security_deposit,
        dewa_deposit: editForm.dewa_deposit,
        deposit_type: editForm.deposit_type,
        lease_term: editForm.lease_term,
      })

      if (contract.tenant_id) {
        try {
          await api.put(`${apiPrefix}/tenants/${contract.tenant_id}`, {
            name: editForm.tenant_name,
            address: editForm.tenant_address,
            contact: editForm.tenant_contact,
            phone: editForm.tenant_contact,
            email: editForm.tenant_email,
          })
        } catch {
          // Handled via contract endpoint
        }
      }

      if (editForm.cheque_number && editForm.cheque_date) {
        await api.post(`${apiPrefix}/contracts/${contract.id}/cheques`, {
          cheque_number: editForm.cheque_number,
          bank_name: editForm.cheque_bank,
          amount: editForm.rent_amount,
          due_date: editForm.cheque_date,
          status: 'pending',
        })
      }

      alert('Contract details saved successfully!')
      await fetchContract()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update contract')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="gfh-portal-page" style={{ padding: 40, textAlign: 'center' }}>
        <span className="spinner" />
        <p style={{ color: THEME.textMuted, marginTop: 12 }}>Loading Contract Details...</p>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="gfh-portal-page" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ color: '#0f172a', fontSize: '22px', fontWeight: 700, marginBottom: 10 }}>
          Contract Not Found or Access Restricted
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', maxWidth: 480, margin: '0 auto 24px' }}>
          This contract either does not exist or belongs to another owner account. Please select a contract from your active contracts list.
        </p>
        <button onClick={() => navigate(`${effectiveBasePath}/contracts`)} className="gfh-portal-btn" style={{ ...ghostBtnStyle, margin: '0 auto' }}>
          Back to Contracts
        </button>
      </div>
    )
  }

  const propertyName = contract.unit?.property?.name || 'Morocco-I-11'
  const unitNumber = contract.unit?.number || '105'
  const contractType = (contract.type || 'STUDIO').toUpperCase()
  const tenantName = editForm.tenant_name || contract.tenant?.name || 'Tenant'
  const tenantContact = editForm.tenant_contact || contract.tenant?.phone || contract.tenant?.contact || '—'
  const tenantInitials = tenantName ? tenantName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : 'TN'
  const totalRentFormatted = Number(contract.rent_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const startDateStr = contract.start_date ? contract.start_date.split('T')[0] : '—'
  const endDateStr = contract.end_date ? contract.end_date.split('T')[0] : '—'
  const totalReceived = contract.payments?.reduce((acc, p) => acc + Number(p.amount), 0) || 0
  const balanceDue = Math.max(0, (ledgerSummary.total_debit > 0 ? ledgerSummary.total_balance : (Number(contract.rent_amount) - totalReceived)))
  const nextPendingCheque = (contract.cheques || [])
    .filter(c => (c.status || 'pending').toLowerCase() === 'pending')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0]
  const nextDueDateStr = nextPendingCheque?.due_date
    ? formatDate(nextPendingCheque.due_date)
    : (contract.due_date ? formatDate(contract.due_date) : formatDate(contract.start_date))

  const recentPaymentsList = (contract.payments && contract.payments.length > 0)
    ? contract.payments.slice(0, 8).map(p => ({
        id: p.id,
        date: p.date ? p.date.split('T')[0].split('-').reverse().join('-') : '25-07-2024',
        type: (p.type || 'RENT').toUpperCase(),
        amount: Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        mode: (p.mode || 'CASH').toUpperCase(),
        remarks: p.remarks || '—',
      }))
    : []

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 40,
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #E2E8F0',
    background: '#FFFFFF',
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: 500,
    fontFamily: "'Poppins', system-ui, sans-serif",
    boxSizing: 'border-box',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 6,
    fontFamily: "'Poppins', system-ui, sans-serif",
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif", background: '#F8F7FD', minHeight: '100vh', paddingBottom: 40 }}>
      <style>{`
        ${portalPageCss}
        .gfh-input-ctrl:focus {
          border-color: #0E5E48 !important;
          box-shadow: 0 0 0 2px rgba(14, 94, 72, 0.15);
        }
      `}</style>

      {/* ─── PAUL BRIT SECTION 6: ACTIVE CONTRACT WORKSPACE HEADER & SUMMARY ─── */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 14,
          border: '1px solid #E2E8F0',
          padding: '22px 26px 0 26px',
          marginBottom: 20,
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        }}
      >
        {/* Top Row: Unit – Tenant + Status Badge + Back */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#065F46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 17,
                flexShrink: 0,
              }}
            >
              {unitNumber}
            </div>
            <div>
              <div style={{ fontSize: 12.5, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {propertyName} • {contractType} • Contract GFH-{String(contract.id).padStart(5, '0')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 3 }}>
                <h1 style={{ margin: 0, fontSize: 23, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  {unitNumber} – {tenantName}
                </h1>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 12px',
                    borderRadius: 999,
                    background: contract.status === 'active' ? '#ECFDF5' : (contract.status === 'vacated' ? '#FEF2F2' : '#FFFBEB'),
                    border: `1px solid ${contract.status === 'active' ? '#A7F3D0' : (contract.status === 'vacated' ? '#FECACA' : '#FDE68A')}`,
                    color: contract.status === 'active' ? '#065F46' : (contract.status === 'vacated' ? '#991B1B' : '#B45309'),
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: contract.status === 'active' ? '#10B981' : (contract.status === 'vacated' ? '#EF4444' : '#F59E0B'),
                    }}
                  />
                  Status: {contract.status === 'active' ? 'Active' : contract.status.toUpperCase()}
                </span>
                <LegalCaseBadge active={contract.on_case} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={downloadPdf}
              disabled={pdfLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 8,
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1D4ED8',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {pdfLoading ? 'Preparing PDF...' : 'Print Contract'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`${effectiveBasePath}/contracts`)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 8,
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#334155',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ← Back to Contracts
            </button>
          </div>
        </div>

        {/* Financial Summary 4-Card Bar: Rent | Outstanding | Deposit | Next Due */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 12,
            marginBottom: 18,
          }}
        >
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Rent</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>AED {totalRentFormatted}</div>
            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>{contract.lease_term || '1 Year'} • {startDateStr} → {endDateStr}</div>
          </div>

          <div style={{ background: balanceDue > 0 ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${balanceDue > 0 ? '#FECACA' : '#BBF7D0'}`, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: balanceDue > 0 ? '#991B1B' : '#065F46', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Outstanding</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: balanceDue > 0 ? '#DC2626' : '#059669', marginTop: 4 }}>
              AED {Number(balanceDue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>Received: AED {Number(totalReceived).toLocaleString()}</div>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Deposit</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
              AED {Number(contract.security_deposit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>Mode: {contract.deposit_type || 'CHEQUE'}</div>
          </div>

          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Next Due</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: '#0E7490', marginTop: 4 }}>{nextDueDateStr}</div>
            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>
              {nextPendingCheque ? `Cheque #${nextPendingCheque.cheque_number || 'Pending'}` : `${contract.cheques?.length || 0} Cheques on file`}
            </div>
          </div>
        </div>

        {/* Main Actions Bar: [ + Collect Payment ] [ Manage Cheques ] [ Add Charge ] [ Edit Contract ] [ Vacate Unit ] */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            paddingBottom: 18,
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <button
            type="button"
            onClick={() => openPaymentModal('rent')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 18px',
              borderRadius: 8,
              border: 'none',
              background: '#065F46',
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(6, 95, 70, 0.2)',
            }}
          >
            + Collect Payment
          </button>

          <button
            type="button"
            onClick={() => handleWorkspaceTabChange('cheques')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 18px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              background: workspaceTab === 'cheques' ? '#0F172A' : '#FFFFFF',
              color: workspaceTab === 'cheques' ? '#FFFFFF' : '#0F172A',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Manage Cheques ({contract.cheques?.length || 0})
          </button>

          {!isCashier && (
            <button
              type="button"
              onClick={() => setChargeModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 18px',
                borderRadius: 8,
                border: '1px solid #BAE6FD',
                background: '#F0F9FF',
                color: '#0369A1',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Add Charge
            </button>
          )}

          {!isCashier && (
            <button
              type="button"
              onClick={() => handleWorkspaceTabChange('contract')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 18px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                background: workspaceTab === 'contract' ? '#0E5E48' : '#FFFFFF',
                color: workspaceTab === 'contract' ? '#FFFFFF' : '#0F172A',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Edit Contract
            </button>
          )}

          {!isCashier && contract.status === 'active' && (
            <button
              type="button"
              onClick={() => setVacateModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 18px',
                borderRadius: 8,
                border: '1px solid #FECACA',
                background: '#FEF2F2',
                color: '#991B1B',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                marginLeft: 'auto',
              }}
            >
              Vacate Unit
            </button>
          )}
        </div>

        {/* Workspace 5 Tabs: Overview | Payments | Cheques | Documents | Contract */}
        <div style={{ display: 'flex', gap: 26, overflowX: 'auto', paddingTop: 12 }}>
          {[
            { key: 'overview' as WorkspaceTabType, label: 'Overview' },
            { key: 'payments' as WorkspaceTabType, label: `Payments (${contract.payments?.length || 0})` },
            { key: 'cheques' as WorkspaceTabType, label: `Cheques (${contract.cheques?.length || 0})` },
            { key: 'documents' as WorkspaceTabType, label: 'Documents' },
            { key: 'contract' as WorkspaceTabType, label: 'Contract' },
          ].map(t => {
            const active = workspaceTab === t.key
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => handleWorkspaceTabChange(t.key)}
                style={{
                  padding: '6px 4px 12px 4px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: active ? '3px solid #065F46' : '3px solid transparent',
                  color: active ? '#065F46' : '#64748B',
                  fontSize: 13.5,
                  fontWeight: active ? 800 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── VIEW MODE: OVERVIEW TAB ──────────────── */}
      {mode === 'view' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Middle Card: Tenant & Quick Actions */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 14,
              border: '1px solid #E2E8F0',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
              boxShadow: '0 1px 3px rgba(16, 24, 40, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: '#D1FAE5',
                  color: '#065F46',
                  fontWeight: 800,
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {tenantInitials}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', letterSpacing: '0.2px' }}>
                  {tenantName}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, fontSize: 13, color: '#334155', fontWeight: 600 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    {tenantContact}
                  </span>
                  <span style={{ color: '#CBD5E1' }}>|</span>
                  <span style={{ color: '#0284C7', display: 'inline-flex', alignItems: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => openPaymentModal('rent')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#065F46',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(6, 95, 70, 0.2)',
                }}
              >
                <span>+ Add Rent</span>
              </button>

              <button
                type="button"
                onClick={() => openPaymentModal('dewa')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#0E7490',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(14, 116, 144, 0.2)',
                }}
              >
                <span>+ Add Dewa</span>
              </button>

              <button
                type="button"
                onClick={() => openPaymentModal('other')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#475569',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(71, 85, 105, 0.2)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                <span>Other Payments</span>
              </button>

              {!isCashier && (
                contract.status === 'active' ? (
                  <button
                    type="button"
                    onClick={() => setVacateModalOpen(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '9px 18px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#DC2626',
                      color: '#FFFFFF',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(220, 38, 38, 0.2)',
                    }}
                    title="Start end contract, record settlement, and free unit"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Vacate / End Contract</span>
                  </button>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 8,
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#991B1B',
                      fontSize: 12,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                    }}
                  >
                    Status: {contract.status}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Bottom Grid: Recent Payments (Left) + Contract Details (Right) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 20 }}>
            {/* Left: Recent Payments Table */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 14,
                border: '1px solid #E2E8F0',
                padding: '22px 24px',
                boxShadow: '0 1px 3px rgba(16, 24, 40, 0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Recent Payments
                </h3>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Payment Date</th>
                      <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Description</th>
                      <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Amount</th>
                      <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Pay Mode</th>
                      <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B' }}>Remarks</th>
                      <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPaymentsList.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '36px 14px', color: '#64748B', fontSize: 13.5 }}>
                          No payments recorded yet for this contract.
                        </td>
                      </tr>
                    ) : (
                      recentPaymentsList.map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '14px', fontWeight: 600, fontSize: 13, color: '#334155' }}>
                            {p.date}
                          </td>
                          <td style={{ padding: '14px', fontWeight: 800, fontSize: 12.5, color: '#0F172A', textTransform: 'uppercase' }}>
                            {p.type}
                          </td>
                          <td style={{ padding: '14px', fontWeight: 700, fontSize: 13.5, color: '#0F172A' }}>
                            {p.amount}
                          </td>
                          <td style={{ padding: '14px', fontWeight: 600, fontSize: 12, color: '#334155', textTransform: 'uppercase' }}>
                            {p.mode}
                          </td>
                          <td style={{ padding: '14px', color: '#64748B', fontSize: 12.5 }}>
                            {p.remarks || '—'}
                          </td>
                          <td style={{ padding: '14px', textAlign: 'center' }}>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                              <button
                                type="button"
                                className="gfh-action-menu-btn"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setActionMenuOpen(actionMenuOpen === p.id ? null : p.id)
                                }}
                                title="Payment Actions"
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  border: '1px solid #E2E8F0',
                                  background: '#FFFFFF',
                                  color: '#64748B',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <circle cx="12" cy="5" r="2" />
                                  <circle cx="12" cy="12" r="2" />
                                  <circle cx="12" cy="19" r="2" />
                                </svg>
                              </button>
                              {actionMenuOpen === p.id && (
                                <div
                                  className="gfh-action-menu-dropdown"
                                  style={{
                                    position: 'absolute', right: 0, top: 36, background: '#FFFFFF',
                                    border: '1px solid #E2E8F0', borderRadius: 8, boxShadow: '0 8px 24px rgba(15,23,42,0.18)',
                                    zIndex: 9999, minWidth: 145, overflow: 'hidden',
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setActionMenuOpen(null)
                                      printPaymentReceipt(p)
                                    }}
                                    style={{
                                      width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                                      color: '#065F46', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                      textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#ECFDF5')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                                  >
                                    Print Receipt
                                  </button>
                                  {!isCashier && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeletePayment(p.id)
                                      }}
                                      style={{
                                        width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                                        color: '#991B1B', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                        textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                                      }}
                                      onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
                                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                      </svg>
                                      Delete
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Contract Details Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 14,
                  border: '1px solid #E2E8F0',
                  padding: '22px 24px',
                  boxShadow: '0 1px 3px rgba(16, 24, 40, 0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Contract Details
                  </h3>
                  {!isCashier && (
                    <button
                      type="button"
                      onClick={() => handleWorkspaceTabChange('contract')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        background: 'transparent',
                        border: 'none',
                        color: '#059669',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 500 }}>Lease Term</span>
                    <strong style={{ color: '#0F172A', fontWeight: 700 }}>{contract.lease_term || editForm.lease_term || 'Monthly'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 500 }}>Rent Amount</span>
                    <strong style={{ color: '#0F172A', fontWeight: 700 }}>{totalRentFormatted}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 500 }}>Security Deposit</span>
                    <strong style={{ color: '#0F172A', fontWeight: 700 }}>{editForm.security_deposit || '10,000.00'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 500 }}>Dewa Deposit</span>
                    <strong style={{ color: '#0F172A', fontWeight: 700 }}>{editForm.dewa_deposit || '1,000.00'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 500 }}>Start Date</span>
                    <strong style={{ color: '#0F172A', fontWeight: 700 }}>{startDateStr}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B', fontWeight: 500 }}>End Date</span>
                    <strong style={{ color: '#0F172A', fontWeight: 700 }}>{endDateStr}</strong>
                  </div>

                  {/* Dewa Due Box */}
                  <div
                    style={{
                      background: '#FEF2F2',
                      borderRadius: 8,
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 8,
                    }}
                  >
                    <span style={{ color: '#DC2626', fontWeight: 800, fontSize: 13.5 }}>Dewa Due</span>
                    <span style={{ color: '#DC2626', fontWeight: 800, fontSize: 14 }}>AED 0.00</span>
                  </div>

                  {/* Action buttons matching Image 2 right column */}
                  <button
                    type="button"
                    onClick={() => openPaymentModal('dewa')}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#0F8A67',
                      color: '#FFFFFF',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      marginTop: 10,
                      boxShadow: '0 1px 2px rgba(15, 138, 103, 0.2)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#0E5E48')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#0F8A67')}
                  >
                    <span>Add Utility Bill / Other Charges</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCallLogModalOpen(true)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#0284C7',
                      color: '#FFFFFF',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      marginTop: 6,
                      boxShadow: '0 1px 2px rgba(2, 132, 199, 0.2)',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#0369A1')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#0284C7')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>Add Call Log</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'view' && (
        <section
          style={{
            marginTop: 20,
            padding: '24px 28px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 14,
            boxShadow: '0 1px 3px rgba(16, 24, 40, 0.03)',
          }}
        >
          {/* Top Bar: Title & Tabs & Green Export Button (Left) + Totals Box (Right) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 20,
              paddingBottom: 20,
              borderBottom: '1px solid #F1F5F9',
              marginBottom: 16,
            }}
          >
            {/* Left: Title, View Switcher, and Green Export to Excel button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>
                  {bottomTab === 'statement' ? 'Rent Statement' : 'Contract Cheques'}
                </h3>

                {/* View Switcher Tabs */}
                <div style={{ display: 'inline-flex', background: '#F1F5F9', padding: 3, borderRadius: 8, gap: 4 }}>
                  <button
                    type="button"
                    onClick={() => setBottomTab('statement')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 6,
                      border: 'none',
                      background: bottomTab === 'statement' ? '#0E5E48' : 'transparent',
                      color: bottomTab === 'statement' ? '#FFFFFF' : '#64748B',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Rent Statement
                  </button>
                  <button
                    type="button"
                    onClick={() => setBottomTab('cheques')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 6,
                      border: 'none',
                      background: bottomTab === 'cheques' ? '#0E5E48' : 'transparent',
                      color: bottomTab === 'cheques' ? '#FFFFFF' : '#64748B',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>Cheques</span>
                    <span
                      style={{
                        fontSize: 10.5,
                        padding: '1px 6px',
                        borderRadius: 999,
                        background: bottomTab === 'cheques' ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                        color: bottomTab === 'cheques' ? '#FFFFFF' : '#475569',
                      }}
                    >
                      {contract.cheques?.length || 0}
                    </span>
                  </button>
                </div>
              </div>

              {/* Green [Export to Excel] Button (Matches Image 2 exactly) */}
              {bottomTab === 'statement' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    disabled={exportLoading}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 18px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#0F8A67',
                      color: '#FFFFFF',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: exportLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 4px rgba(15, 138, 103, 0.25)',
                      opacity: exportLoading ? 0.75 : 1,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#0E5E48')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#0F8A67')}
                  >
                    {/* Excel File Icon */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="8" y1="13" x2="16" y2="13" />
                      <line x1="8" y1="17" x2="16" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <span>{exportLoading ? 'Exporting...' : 'Export to Excel'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Right Side: Totals Summary Box (Matches Image 2 exactly) */}
            {bottomTab === 'statement' && (
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 10,
                  padding: '12px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  minWidth: 260,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Receivable</span>
                  <strong style={{ color: '#0F172A', fontWeight: 800, fontSize: 14 }}>
                    AED {Number(ledgerSummary.total_debit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                  <span style={{ color: '#64748B', fontWeight: 600 }}>Received</span>
                  <strong style={{ color: '#059669', fontWeight: 800, fontSize: 14 }}>
                    AED {Number(ledgerSummary.total_credit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 13,
                    borderTop: '1px solid #E2E8F0',
                    paddingTop: 8,
                    marginTop: 2,
                  }}
                >
                  <span style={{ color: '#0F172A', fontWeight: 700 }}>Other Due</span>
                  <strong
                    style={{
                      color: Number(ledgerSummary.total_balance) > 0 ? '#DC2626' : '#059669',
                      fontWeight: 800,
                      fontSize: 15,
                    }}
                  >
                    AED {Number(ledgerSummary.total_balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>
            )}
          </div>

          {/* TAB 1: RENT STATEMENT TABLE (Exact Match to Image 2) */}
          {bottomTab === 'statement' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', width: '15%' }}>Date</th>
                    <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', width: '37%' }}>Description</th>
                    <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', width: '16%' }}>Debit</th>
                    <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', width: '16%' }}>Credit</th>
                    <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', width: '16%' }}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerLoading ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '36px 14px', color: '#64748B', fontSize: 13.5 }}>
                        Loading statement records...
                      </td>
                    </tr>
                  ) : ledgerEntries.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '36px 14px', color: '#64748B', fontSize: 13.5 }}>
                        No statement records recorded yet for this contract.
                      </td>
                    </tr>
                  ) : (
                    ledgerEntries.map((row) => (
                      <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px', fontWeight: 600, fontSize: 13, color: '#0F172A' }}>
                          {formatDate(row.date)}
                        </td>
                        <td style={{ padding: '14px', fontWeight: 700, fontSize: 13.5, color: '#0F172A' }}>
                          {row.description || 'Rent Entry'}
                        </td>
                        <td style={{ padding: '14px', fontWeight: 700, fontSize: 13.5, color: Number(row.debit) > 0 ? '#0F172A' : '#475569' }}>
                          {Number(row.debit) > 0 ? Number(row.debit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                        </td>
                        <td style={{ padding: '14px', fontWeight: 800, fontSize: 13.5, color: Number(row.credit) > 0 ? '#065F46' : '#475569' }}>
                          {Number(row.credit) > 0 ? Number(row.credit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                        </td>
                        <td style={{ padding: '14px', fontWeight: 800, fontSize: 14, color: Number(row.running_balance) > 0 ? '#0F172A' : '#065F46' }}>
                          {Number(row.running_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: CHEQUES TABLE (Original Preserved) */}
          {bottomTab === 'cheques' && (
            <div>
              {!contract.cheques?.length ? (
                <p style={{ color: '#64748B', margin: 0, padding: '24px 0', textAlign: 'center', fontSize: 13.5 }}>
                  No cheques recorded for this contract.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                        {['Cheque No / Details', 'Bank', 'Amount (AED)', 'Date', 'Status'].map(label => (
                          <th key={label} style={{ padding: '12px 14px', color: '#64748B', fontSize: 12, fontWeight: 700 }}>
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {contract.cheques.map(cheque => (
                        <tr key={cheque.id} style={{ borderTop: '1px solid #E2E8F0' }}>
                          <td style={{ padding: 14 }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', letterSpacing: '0.3px', marginBottom: 4 }}>
                              {cheque.cheque_number || 'Not provided'}
                            </div>
                            <ChequeDetails cheque={cheque} contractId={contract.id} />
                          </td>
                          <td style={{ padding: 14, fontWeight: 700, color: '#0F172A', fontSize: 13.5 }}>
                            {cheque.bank_name}
                          </td>
                          <td style={{ padding: 14, color: '#065F46', fontWeight: 800, fontSize: 14 }}>
                            {Number(cheque.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: 14, color: '#0F172A', fontWeight: 600, fontSize: 13.5 }}>
                            {formatDate(cheque.due_date)}
                          </td>
                          <td style={{ padding: 14 }}>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                borderRadius: 999,
                                fontSize: 11,
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.4px',
                                background: cheque.status === 'cleared' ? '#F0FDF4' : (cheque.status === 'bounced' ? '#FEF2F2' : '#FFFBEB'),
                                color: cheque.status === 'cleared' ? '#065F46' : (cheque.status === 'bounced' ? '#991B1B' : '#B45309'),
                                border: `1px solid ${cheque.status === 'cleared' ? '#BBF7D0' : (cheque.status === 'bounced' ? '#FECACA' : '#FDE68A')}`,
                              }}
                            >
                              {cheque.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ─── EDIT MODE: IMAGE 2 (Full Lease & Contract Edit with Tabs) ───── */}
      {mode === 'edit' && (
        <div className="fade-in">
          {/* CARD 1: UNIT & CONTRACT HEADER (Exact Match to Reference Image 2) */}
          <div
        className="fade-in"
        style={{
          background: '#FFFFFF',
          borderRadius: 14,
          border: '1px solid #E2E8F0',
          padding: '20px 24px',
          boxShadow: '0 1px 3px rgba(16, 24, 40, 0.03)',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        {/* Left Side: Circular Icon + Property/Unit + Subtitle Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: '#E6F7F0',
              color: '#0F8A67',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <path d="M9 22v-4h6v4" />
              <line x1="8" y1="6" x2="10" y2="6" />
              <line x1="14" y1="6" x2="16" y2="6" />
              <line x1="8" y1="10" x2="10" y2="10" />
              <line x1="14" y1="10" x2="16" y2="10" />
              <line x1="8" y1="14" x2="10" y2="14" />
              <line x1="14" y1="14" x2="16" y2="14" />
            </svg>
          </div>

          <div>
            {/* Property Name */}
            <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
              {propertyName}
            </div>

            {/* Unit Number - Type */}
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0E5E48', letterSpacing: '-0.01em', marginTop: 2 }}>
              {unitNumber} - {contractType}
            </div>

            {/* Subtitle Info Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 6, fontSize: 13 }}>
              {/* Tenant Icon & Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#1E293B' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span style={{ textTransform: 'uppercase' }}>{tenantName}</span>
              </div>

              <span style={{ color: '#CBD5E1' }}>|</span>

              {/* Rent Amount */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748B', fontWeight: 500 }}>
                <span>Rent</span>
                <strong style={{ color: '#1E293B', fontWeight: 700 }}>{totalRentFormatted}</strong>
              </div>

              <span style={{ color: '#CBD5E1' }}>|</span>

              {/* Date Range with Calendar Icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', fontWeight: 500 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{startDateStr} &nbsp;→&nbsp; {endDateStr}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Status Badge + Action Buttons (Unit, Print SEC, Print DEWA) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
            <LegalCaseBadge active={contract.on_case} />
            <span
              style={{
                background: contract.status === 'vacated' ? '#DC2626' : '#16A34A',
                color: '#FFFFFF',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
                padding: '4px 12px',
                borderRadius: 6,
              }}
            >
              {contract.status === 'vacated' ? 'VACATED' : 'CURRENT'}
            </span>
          </div>

          {/* Action Buttons Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* ← Unit button */}
            <button
              type="button"
              onClick={() => setMode('view')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 6,
                background: '#FFFFFF',
                border: '1px solid #D1D5DB',
                color: '#374151',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
              onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Unit</span>
            </button>

            {/* Print SEC button */}
            <button
              type="button"
              onClick={() => printReceipt('SEC')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 14px',
                borderRadius: 6,
                background: '#FFFFFF',
                border: '1px solid #3B82F6',
                color: '#2563EB',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#EFF6FF')}
              onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}
            >
              <span>Print SEC</span>
            </button>

            {/* Print DEWA button */}
            <button
              type="button"
              onClick={() => printReceipt('DEWA')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 14px',
                borderRadius: 6,
                background: '#FFFFFF',
                border: '1px solid #3B82F6',
                color: '#2563EB',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#EFF6FF')}
              onMouseLeave={e => (e.currentTarget.style.background = '#FFFFFF')}
            >
              <span>Print DEWA</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── TABS ROW (Lease, Documents, Cheques, Statement) ────────────────── */}
      <div
        className="fade-in"
        style={{
          display: 'flex',
          gap: 28,
          borderBottom: '1px solid #E5E7EB',
          padding: '0 4px',
          marginBottom: 20,
        }}
      >
        {[
          {
            key: 'lease' as TabType,
            label: 'Lease',
            icon: (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            ),
          },
          {
            key: 'documents' as TabType,
            label: 'Documents',
            icon: (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            ),
          },
          {
            key: 'cheques' as TabType,
            label: 'Cheques',
            icon: (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            ),
          },
          {
            key: 'statement' as TabType,
            label: 'Statement',
            icon: (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            ),
          },
        ].map(tab => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 0 12px 0',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid #0E5E48' : '3px solid transparent',
                color: isActive ? '#0E5E48' : '#6B7280',
                fontSize: 14,
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ─── TAB 1: LEASE (Exact Match to Reference Image) ──────────────────── */}
      {activeTab === 'lease' && (
        <form onSubmit={handleSaveContractEdit} className="fade-in">
          <fieldset disabled={isCashier} style={{ border: 'none', padding: 0, margin: 0 }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 14,
              border: '1px solid #E2E8F0',
              padding: '24px 28px',
              boxShadow: '0 1px 3px rgba(16, 24, 40, 0.02)',
              marginBottom: 20,
            }}
          >
            {/* 1. TENANT SECTION */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0E5E48" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#0E5E48', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                  TENANT
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Name</label>
                  <input
                    type="text"
                    className="gfh-input-ctrl"
                    value={editForm.tenant_name}
                    onChange={e => setEditForm({ ...editForm, tenant_name: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Address</label>
                  <input
                    type="text"
                    className="gfh-input-ctrl"
                    value={editForm.tenant_address}
                    onChange={e => setEditForm({ ...editForm, tenant_address: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Contact No</label>
                  <input
                    type="text"
                    className="gfh-input-ctrl"
                    value={editForm.tenant_contact}
                    onChange={e => setEditForm({ ...editForm, tenant_contact: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    className="gfh-input-ctrl"
                    value={editForm.tenant_email}
                    onChange={e => setEditForm({ ...editForm, tenant_email: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* 2. LEASE & RENT SECTION */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0E5E48" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#0E5E48', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                  LEASE &amp; RENT
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Lease Term</label>
                  <select
                    className="gfh-input-ctrl"
                    value={editForm.lease_term}
                    onChange={e => setEditForm({ ...editForm, lease_term: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Semi-Annual">Semi-Annual</option>
                    <option value="1 Year">1 Year</option>
                    <option value="2 Years">2 Years</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Rent Amount (AED)</label>
                  <input
                    type="number"
                    className="gfh-input-ctrl"
                    value={editForm.rent_amount}
                    onChange={e => setEditForm({ ...editForm, rent_amount: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input
                    type="date"
                    className="gfh-input-ctrl"
                    value={editForm.start_date}
                    onChange={e => setEditForm({ ...editForm, start_date: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>End Date</label>
                  <input
                    type="date"
                    className="gfh-input-ctrl"
                    value={editForm.end_date}
                    onChange={e => setEditForm({ ...editForm, end_date: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Due Date</label>
                  <input
                    type="date"
                    className="gfh-input-ctrl"
                    value={editForm.due_date}
                    onChange={e => setEditForm({ ...editForm, due_date: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* 3. DEPOSITS SECTION */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0E5E48" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#0E5E48', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                  DEPOSITS
                </span>
              </div>

              {/* Row 1: Rent Deposit, Deposit Type, DEWA Deposit */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 18 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>
                      Rent Deposit <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => printReceipt('SEC')}
                      style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                      Print
                    </button>
                  </div>
                  <input
                    type="number"
                    className="gfh-input-ctrl"
                    value={editForm.security_deposit}
                    onChange={e => setEditForm({ ...editForm, security_deposit: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Deposit Type <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    className="gfh-input-ctrl"
                    value={editForm.deposit_type}
                    onChange={e => setEditForm({ ...editForm, deposit_type: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="CHEQUE">CHEQUE</option>
                    <option value="CASH">CASH</option>
                    <option value="BANK TRANSFER">BANK TRANSFER</option>
                    <option value="Security Deposit">Security Deposit</option>
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>
                      DEWA Deposit <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => printReceipt('DEWA')}
                      style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                      Print
                    </button>
                  </div>
                  <input
                    type="number"
                    className="gfh-input-ctrl"
                    value={editForm.dewa_deposit}
                    onChange={e => setEditForm({ ...editForm, dewa_deposit: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Row 2: Cheque Date, Cheque No, Bank */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Cheque Date</label>
                  <input
                    type="date"
                    className="gfh-input-ctrl"
                    value={editForm.cheque_date}
                    onChange={e => setEditForm({ ...editForm, cheque_date: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Cheque No</label>
                  <input
                    type="text"
                    className="gfh-input-ctrl"
                    value={editForm.cheque_number}
                    onChange={e => setEditForm({ ...editForm, cheque_number: e.target.value })}
                    style={inputStyle}
                    placeholder="123456"
                  />
                </div>

                <div>
                  <label style={labelStyle}>Bank</label>
                  <input
                    type="text"
                    className="gfh-input-ctrl"
                    value={editForm.cheque_bank}
                    onChange={e => setEditForm({ ...editForm, cheque_bank: e.target.value })}
                    style={inputStyle}
                    placeholder="Emirates NBD"
                  />
                </div>
              </div>
            </div>
          </div>
          </fieldset>

          {/* Form Action Buttons Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            {!isCashier ? (
              <button
                type="submit"
                disabled={isSaving}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '11px 28px',
                  borderRadius: 8,
                  background: '#0E5E48',
                  color: '#FFFFFF',
                  fontSize: 13.5,
                  fontWeight: 700,
                  border: 'none',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 1px 3px rgba(14, 94, 72, 0.25)',
                }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            ) : (
              <span style={{ fontSize: 12.5, color: '#64748B', fontWeight: 600 }}>
                Read-only contract terms view (Owner permission required to modify contract terms)
              </span>
            )}

            {/* Quick Actions Row */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => openPaymentModal('rent')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px', fontSize: 13, fontWeight: 700, borderRadius: 8,
                  border: 'none', background: '#065F46', color: '#ffffff', cursor: 'pointer',
                }}
              >
                + Add Rent
              </button>

              <button
                type="button"
                onClick={() => openPaymentModal('dewa')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px', fontSize: 13, fontWeight: 700, borderRadius: 8,
                  border: 'none', background: '#0284C7', color: '#ffffff', cursor: 'pointer',
                }}
              >
                + Add Dewa
              </button>

              {!isCashier && contract.status === 'active' && (
                <button
                  type="button"
                  onClick={() => {
                    setRenewData({ new_end_date: '', new_rent_amount: String(contract.rent_amount) })
                    setRenewModalOpen(true)
                  }}
                  style={{
                    padding: '10px 18px', fontSize: 13, fontWeight: 700, borderRadius: 8,
                    border: 'none', background: '#047857', color: '#ffffff', cursor: 'pointer',
                  }}
                >
                  Renew
                </button>
              )}

              {!isCashier && contract.status !== 'vacated' && (
                <button
                  type="button"
                  onClick={() => setVacateModalOpen(true)}
                  style={{
                    padding: '10px 18px', fontSize: 13, fontWeight: 700, borderRadius: 8,
                    border: 'none', background: '#DC2626', color: '#ffffff', cursor: 'pointer',
                  }}
                >
                  Vacate
                </button>
              )}

              <button
                type="button"
                onClick={downloadPdf}
                disabled={pdfLoading}
                style={{
                  padding: '10px 18px', fontSize: 13, fontWeight: 700, borderRadius: 8,
                  border: '1px solid #BAE6FD', background: '#FFFFFF', color: '#0284C7', cursor: 'pointer',
                }}
              >
                {pdfLoading ? 'Downloading...' : 'PDF Agreement'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ─── TAB 2: DOCUMENTS ───────────────────────────────────────────────── */}
      {activeTab === 'documents' && (
        <div
          className="fade-in"
          style={{
            background: '#FFFFFF',
            borderRadius: 14,
            border: '1px solid #E2E8F0',
            padding: '24px 28px',
            boxShadow: '0 1px 3px rgba(16, 24, 40, 0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>Contract Documents</h3>
              <p style={{ fontSize: 12.5, color: '#64748B', marginTop: 4 }}>
                Official signed tenancy agreement, receipts, and identification copies for GFH-{String(contract.id).padStart(5, '0')}.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadPdf}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 18px',
                borderRadius: 8,
                background: '#0E5E48',
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Download Full PDF
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                  <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Document Title</th>
                  <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Issue Date</th>
                  <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Format</th>
                  <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '14px', fontWeight: 700, color: '#0F172A' }}>Tenancy Contract Agreement</td>
                  <td style={{ padding: '14px', color: '#64748B' }}>Ejari / Lease</td>
                  <td style={{ padding: '14px', color: '#64748B' }}>{formatDate(contract.start_date)}</td>
                  <td style={{ padding: '14px' }}><span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>PDF</span></td>
                  <td style={{ padding: '14px' }}>
                    <button type="button" onClick={downloadPdf} style={{ padding: '6px 14px', borderRadius: 6, background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                      Download
                    </button>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '14px', fontWeight: 700, color: '#0F172A' }}>Security Deposit Receipt (SEC-{contract.id})</td>
                  <td style={{ padding: '14px', color: '#64748B' }}>Receipt</td>
                  <td style={{ padding: '14px', color: '#64748B' }}>{formatDate(contract.start_date)}</td>
                  <td style={{ padding: '14px' }}><span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>Printable</span></td>
                  <td style={{ padding: '14px' }}>
                    <button type="button" onClick={() => printReceipt('SEC')} style={{ padding: '6px 14px', borderRadius: 6, background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                      Print Receipt
                    </button>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ padding: '14px', fontWeight: 700, color: '#0F172A' }}>DEWA Deposit Receipt (DEWA-{contract.id})</td>
                  <td style={{ padding: '14px', color: '#64748B' }}>Receipt</td>
                  <td style={{ padding: '14px', color: '#64748B' }}>{formatDate(contract.start_date)}</td>
                  <td style={{ padding: '14px' }}><span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>Printable</span></td>
                  <td style={{ padding: '14px' }}>
                    <button type="button" onClick={() => printReceipt('DEWA')} style={{ padding: '6px 14px', borderRadius: 6, background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                      Print Receipt
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: CHEQUES (PDC Cheques List) ──────────────────────────────── */}
      {activeTab === 'cheques' && (
        <div
          className="fade-in"
          style={{
            background: '#FFFFFF',
            borderRadius: 14,
            border: '1px solid #E2E8F0',
            padding: '24px 28px',
            boxShadow: '0 1px 3px rgba(16, 24, 40, 0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>PDC Cheques Schedule</h3>
              <p style={{ fontSize: 12.5, color: '#64748B', marginTop: 4 }}>
                Post-dated cheques logged for this lease agreement.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setNewCheque({ cheque_number: '', bank_name: 'Emirates NBD', amount: String(contract.rent_amount || ''), due_date: new Date().toISOString().split('T')[0] })
                setChequeModalOpen(true)
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 18px',
                borderRadius: 8,
                background: '#0E5E48',
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              + Add Cheque
            </button>
          </div>

          {!contract.cheques || contract.cheques.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
              <p style={{ fontSize: 14, fontWeight: 500 }}>No cheques logged for this contract.</p>
              <button
                type="button"
                onClick={() => {
                  setNewCheque({ cheque_number: '', bank_name: 'Emirates NBD', amount: String(contract.rent_amount || ''), due_date: new Date().toISOString().split('T')[0] })
                  setChequeModalOpen(true)
                }}
                style={{ marginTop: 10, padding: '8px 18px', background: '#0E5E48', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
              >
                + Add First Cheque
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                    <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Cheque #</th>
                    <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Bank</th>
                    <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Amount</th>
                    <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Due Date</th>
                    <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                    {!isCashier && <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', textAlign: 'center' }}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {contract.cheques.map(c => {
                    const st = (c.status || 'pending').toLowerCase()
                    const isCleared = st === 'cleared'
                    const isBounced = st === 'bounced'
                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '14px' }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#0F172A', letterSpacing: '0.3px', marginBottom: 4 }}>
                            {c.cheque_number || 'Not provided'}
                          </div>
                          <ChequeDetails cheque={c} contractId={contract.id} />
                        </td>
                        <td style={{ padding: '14px', color: '#0F172A', fontWeight: 700, fontSize: 13.5 }}>{c.bank_name}</td>
                        <td style={{ padding: '14px', fontWeight: 800, color: '#065F46', fontSize: 14 }}>AED {Number(c.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td style={{ padding: '14px', color: '#0F172A', fontWeight: 600, fontSize: 13.5 }}>{formatDate(c.due_date)}</td>
                        <td style={{ padding: '14px' }}>
                          <span
                            style={{
                              padding: '3px 10px',
                              borderRadius: 999,
                              fontSize: 11,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background: isCleared ? '#F0FDF4' : (isBounced ? '#FEF2F2' : '#FFFBEB'),
                              color: isCleared ? '#166534' : (isBounced ? '#991B1B' : '#B45309'),
                              border: `1px solid ${isCleared ? '#BBF7D0' : (isBounced ? '#FECACA' : '#FDE68A')}`,
                            }}
                          >
                            {c.status || 'PENDING'}
                          </span>
                        </td>
                        {!isCashier && (
                          <td style={{ padding: '14px', textAlign: 'center' }}>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                              <button
                                type="button"
                                className="gfh-action-menu-btn"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setActionMenuOpen(actionMenuOpen === (c.id + 100000) ? null : (c.id + 100000))
                                }}
                                title="Cheque Actions"
                                style={{
                                  width: 32, height: 32, borderRadius: '50%',
                                  border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#64748B',
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <circle cx="12" cy="5" r="2" />
                                  <circle cx="12" cy="12" r="2" />
                                  <circle cx="12" cy="19" r="2" />
                                </svg>
                              </button>
                              {actionMenuOpen === (c.id + 100000) && (
                                <div
                                  className="gfh-action-menu-dropdown"
                                  style={{
                                    position: 'absolute', right: 0, top: 36, background: '#FFFFFF',
                                    border: '1px solid #E2E8F0', borderRadius: 8, boxShadow: '0 8px 24px rgba(15,23,42,0.18)',
                                    zIndex: 9999, minWidth: 125, overflow: 'hidden',
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteCheque(c.id)
                                    }}
                                    style={{
                                      width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                                      color: '#991B1B', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                      textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polyline points="3 6 5 6 21 6" />
                                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                    </svg>
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 4: STATEMENT (Rent Ledger & Payments) ───────────────────────── */}
      {activeTab === 'statement' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div style={{ background: '#FFFFFF', borderRadius: 12, padding: '18px 20px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Total Rent Value</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>AED {Number(contract.rent_amount).toLocaleString()}</div>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: 12, padding: '18px 20px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Total Received</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#059669', marginTop: 4 }}>AED {totalReceived.toLocaleString()}</div>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: 12, padding: '18px 20px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Net Balance Due</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: balanceDue > 0 ? '#DC2626' : '#0F172A', marginTop: 4 }}>
                AED {balanceDue.toLocaleString()}
              </div>
            </div>

            <div style={{ background: '#FEF2F2', borderRadius: 12, padding: '18px 20px', border: '1px solid #FECACA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 12, color: '#991B1B', fontWeight: 700, textTransform: 'uppercase' }}>Dewa Due</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#DC2626', marginTop: 2 }}>AED 0.00</div>
              </div>
              <button
                type="button"
                onClick={() => openPaymentModal('dewa')}
                style={{ padding: '6px 12px', borderRadius: 6, background: '#DC2626', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                + Add Dewa
              </button>
            </div>
          </div>

          {/* Recent Payments Table */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 14,
              border: '1px solid #E2E8F0',
              padding: '24px 28px',
              boxShadow: '0 1px 3px rgba(16, 24, 40, 0.02)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0E5E48" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A', margin: 0 }}>Recent Payments</h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleExportExcel}
                  disabled={exportLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 18px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#0F8A67',
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: exportLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 3px rgba(15, 138, 103, 0.2)',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="8" y1="13" x2="16" y2="13" />
                    <line x1="8" y1="17" x2="16" y2="17" />
                  </svg>
                  <span>{exportLoading ? 'Exporting...' : 'Export to Excel'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => openPaymentModal('rent')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '9px 18px',
                    borderRadius: 8,
                    background: '#0E5E48',
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  + Add Payment
                </button>
              </div>
            </div>

            {!contract.payments || contract.payments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
                <p style={{ fontSize: 14, fontWeight: 500 }}>No payments recorded yet.</p>
                <button
                  type="button"
                  onClick={() => openPaymentModal('rent')}
                  style={{ marginTop: 10, padding: '8px 18px', background: '#0E5E48', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                >
                  + Record First Payment
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                      <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Payment Date</th>
                      <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Description</th>
                      <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Amount</th>
                      <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Pay Mode</th>
                      <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Remarks</th>
                      <th style={{ padding: '12px 14px', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contract.payments.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '14px', color: '#334155', fontWeight: 600 }}>{formatDate(p.date)}</td>
                        <td style={{ padding: '14px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase' }}>{p.type || 'RENT'}</td>
                        <td style={{ padding: '14px', fontWeight: 800, color: '#059669' }}>AED {Number(p.amount).toLocaleString()}</td>
                        <td style={{ padding: '14px', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>{p.mode}</td>
                        <td style={{ padding: '14px', color: '#64748B' }}>{p.remarks || '—'}</td>
                        <td style={{ padding: '14px', textAlign: 'center' }}>
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                              type="button"
                              className="gfh-action-menu-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                setActionMenuOpen(actionMenuOpen === (p.id + 200000) ? null : (p.id + 200000))
                              }}
                              title="Payment Actions"
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                border: '1px solid #E2E8F0',
                                background: '#FFFFFF',
                                color: '#64748B',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="5" r="2" />
                                <circle cx="12" cy="12" r="2" />
                                <circle cx="12" cy="19" r="2" />
                              </svg>
                            </button>
                            {actionMenuOpen === (p.id + 200000) && (
                              <div
                                className="gfh-action-menu-dropdown"
                                style={{
                                  position: 'absolute', right: 0, top: 36, background: '#FFFFFF',
                                  border: '1px solid #E2E8F0', borderRadius: 8, boxShadow: '0 8px 24px rgba(15,23,42,0.18)',
                                  zIndex: 9999, minWidth: 145, overflow: 'hidden',
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setActionMenuOpen(null)
                                    printPaymentReceipt(p)
                                  }}
                                  style={{
                                    width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                                    color: '#065F46', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                    textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                                  }}
                                  onMouseEnter={e => (e.currentTarget.style.background = '#ECFDF5')}
                                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                                >
                                  Print Receipt
                                </button>
                                {!isCashier && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeletePayment(p.id)
                                    }}
                                    style={{
                                      width: '100%', padding: '10px 14px', background: 'none', border: 'none',
                                      color: '#991B1B', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                      textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polyline points="3 6 5 6 21 6" />
                                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                    </svg>
                                    Delete
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
      )}

      {/* ─── MODALS ─────────────────────────────────────────────────────── */}
      
      {/* RENEW MODAL */}
      {renewModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 28, width: 420, borderRadius: 16, position: 'relative', boxShadow: '0 20px 50px rgba(15,23,42,0.25)' }}>
            <h3 style={{ margin: '0 0 14px 0', color: '#0f172a', fontSize: 17, fontWeight: 800 }}>Renew Contract</h3>
            <form onSubmit={handleRenewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>New End Date</label>
                <input type="date" required value={renewData.new_end_date} onChange={e => setRenewData({ ...renewData, new_end_date: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>New Rent Amount (AED)</label>
                <input type="number" value={renewData.new_rent_amount} onChange={e => setRenewData({ ...renewData, new_rent_amount: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" onClick={() => setRenewModalOpen(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#0f172a', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '9px 18px', borderRadius: 8, background: '#065f46', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Confirm Renew</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VACATE & MOVE-OUT SETTLEMENT MODAL */}
      <VacateSettlementModal
        isOpen={vacateModalOpen}
        onClose={() => setVacateModalOpen(false)}
        contract={contract}
        basePath={effectiveBasePath}
        onSuccess={fetchContract}
      />

      {/* ADD PAYMENT MODAL */}
      {paymentModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 28, width: 460, borderRadius: 16, position: 'relative', boxShadow: '0 20px 50px rgba(15,23,42,0.25)' }}>
            <h3 style={{ margin: '0 0 14px 0', color: '#0f172a', fontSize: 17, fontWeight: 800 }}>Collect Payment</h3>
            <form onSubmit={handleAddPaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Amount (AED)</label>
                <input type="number" required value={newPayment.amount} onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Type</label>
                  <select value={newPayment.type} onChange={e => setNewPayment({ ...newPayment, type: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }}>
                    <option value="rent">Rent</option>
                    <option value="deposit">Deposit</option>
                    <option value="dewa">DEWA</option>
                    <option value="service_charge">Service Charge</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Mode</label>
                  <select value={newPayment.mode} onChange={e => setNewPayment({ ...newPayment, mode: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }}>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="card">Card</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Date</label>
                <input type="date" required value={newPayment.date} onChange={e => setNewPayment({ ...newPayment, date: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Remarks</label>
                <input type="text" placeholder="Remarks..." value={newPayment.remarks} onChange={e => setNewPayment({ ...newPayment, remarks: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" onClick={() => setPaymentModalOpen(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#0f172a', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '9px 18px', borderRadius: 8, background: '#065f46', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MANUAL CHARGE / ADJUSTMENT MODAL (Owner Only) */}
      {chargeModalOpen && !isCashier && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 28, width: 460, borderRadius: 16, position: 'relative', boxShadow: '0 20px 50px rgba(15,23,42,0.25)' }}>
            <h3 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: 17, fontWeight: 800 }}>Add Manual Charge / Adjustment</h3>
            <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: 12.5 }}>
              Posts a debit charge directly to the contract statement ledger.
            </p>
            <form onSubmit={handleAddChargeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Charge Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maintenance Charge / Utility Adjustment"
                  value={newCharge.description}
                  onChange={e => setNewCharge({ ...newCharge, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Amount (AED) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    placeholder="e.g. 500"
                    value={newCharge.amount}
                    onChange={e => setNewCharge({ ...newCharge, amount: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Date *</label>
                  <input
                    type="date"
                    required
                    value={newCharge.date}
                    onChange={e => setNewCharge({ ...newCharge, date: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" onClick={() => setChargeModalOpen(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#0f172a', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={chargeSubmitting} style={{ padding: '9px 18px', borderRadius: 8, background: '#0369a1', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  {chargeSubmitting ? 'Posting...' : 'Add Charge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CALL LOG MODAL */}
      {callLogModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 28, width: 440, borderRadius: 16, position: 'relative', boxShadow: '0 20px 50px rgba(15,23,42,0.25)' }}>
            <h3 style={{ margin: '0 0 14px 0', color: '#0f172a', fontSize: 17, fontWeight: 800 }}>Add Call Log</h3>
            <form onSubmit={handleCallLogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Call Date</label>
                <input type="date" required value={callLogData.call_date} onChange={e => setCallLogData({ ...callLogData, call_date: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0f172a', textTransform: 'uppercase' }}>Notes</label>
                <textarea required rows={3} placeholder="Discussion notes..." value={callLogData.notes} onChange={e => setCallLogData({ ...callLogData, notes: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #94a3b8', background: '#ffffff', color: '#0f172a', fontWeight: 600, fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" onClick={() => setCallLogModalOpen(false)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#0f172a', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '9px 18px', borderRadius: 8, background: '#075985', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Save Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CHEQUE MODAL */}
      {chequeModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFFFFF', padding: 28, width: 460, borderRadius: 16, position: 'relative', boxShadow: '0 20px 50px rgba(15,23,42,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#ECFDF8', color: '#0E5E48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#0F172A', fontSize: 17, fontWeight: 800 }}>Add PDC Cheque</h3>
                  <p style={{ margin: 0, color: '#64748B', fontSize: 12, marginTop: 2 }}>Contract GFH-{String(contract.id).padStart(5, '0')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChequeModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddChequeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0F172A', textTransform: 'uppercase' }}>
                    Cheque Number <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 123456"
                    value={newCheque.cheque_number}
                    onChange={e => setNewCheque({ ...newCheque, cheque_number: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A', fontWeight: 600, fontSize: 13.5, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0F172A', textTransform: 'uppercase' }}>
                    Bank Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Emirates NBD"
                    value={newCheque.bank_name}
                    onChange={e => setNewCheque({ ...newCheque, bank_name: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A', fontWeight: 600, fontSize: 13.5, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0F172A', textTransform: 'uppercase' }}>
                  Amount (AED) <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 2500"
                  value={newCheque.amount}
                  onChange={e => setNewCheque({ ...newCheque, amount: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A', fontWeight: 600, fontSize: 13.5, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 6, color: '#0F172A', textTransform: 'uppercase' }}>
                  Due Date <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="date"
                  required
                  value={newCheque.due_date}
                  onChange={e => setNewCheque({ ...newCheque, due_date: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#0F172A', fontWeight: 600, fontSize: 13.5, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setChequeModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#F1F5F9', color: '#0F172A', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: 8, background: '#0E5E48', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 1px 3px rgba(14, 94, 72, 0.25)' }}
                >
                  Add Cheque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
