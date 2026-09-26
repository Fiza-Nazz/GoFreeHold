import React, { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import api from '../../api/axios'
import { formatDate } from '../../utils/formatDate'
import { THEME, Icon, ICONS, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'
import TenancyContractTemplate, { type ContractData } from '../../components/gfh/TenancyContractTemplate'
import { generateContractPDF } from '../../utils/generateContractPDF'
import VacateSettlementModal from '../../components/gfh/VacateSettlementModal'

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
  unit?: { id: number; number: string; property?: { id: number; name: string } }
  tenant?: { id: number; name: string; email: string }
  owner?: { id: number; name: string }
}

interface Unit {
  id: number
  number: string
  status?: string
  price?: number
  property_id?: number
  property?: { id: number; name: string }
}
interface Tenant {
  id: number
  name: string
  email: string
  phone?: string
  contact?: string
  emirates_id?: string
  nationality?: string
  address?: string
}
interface Owner { id: number; name: string }

function computeOneYearLater(startStr: string): string {
  if (!startStr) return ''
  const d = new Date(startStr)
  if (isNaN(d.getTime())) return ''
  d.setFullYear(d.getFullYear() + 1)
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

export default function ContractManagement({ basePath }: { basePath?: string } = {}) {
  const navigate = useNavigate()
  const location = useLocation()

  const effectiveBasePath = basePath || (
    location.pathname.startsWith('/owner') ? '/owner' :
    location.pathname.startsWith('/cashier') ? '/cashier' :
    location.pathname.startsWith('/accountant') ? '/accountant' :
    '/admin'
  )
  const isOwnerStaff = effectiveBasePath !== '/admin'
  const isCashier = effectiveBasePath === '/cashier'
  const apiPrefix = isOwnerStaff ? '/owner' : '/admin'
  const [contracts, setContracts] = useState<Contract[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [properties, setProperties] = useState<{ id: number; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [renewModal, setRenewModal] = useState<Contract | null>(null)
  const [vacateContract, setVacateContract] = useState<Contract | null>(null)

  // Guided Contract Creation Wizard states
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 'success'>(1)
  const [tenantMode, setTenantMode] = useState<'existing' | 'new'>('existing')
  const [tenantSearch, setTenantSearch] = useState('')
  const [showMoreDetails, setShowMoreDetails] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdContract, setCreatedContract] = useState<Contract | null>(null)

  // Filters
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')
  const [selectedUnitId, setSelectedUnitId] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [startDateFilter, setStartDateFilter] = useState<string>('')
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = (searchParams.get('q') || '').trim()

  // Pagination (default 5 items per page as requested)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(5)

  const todayStr = new Date().toISOString().split('T')[0]
  const defaultEndStr = computeOneYearLater(todayStr)

  const [formData, setFormData] = useState({ 
    unit_id: '', tenant_id: '', owner_id: '',
    tenant_name: '', tenant_phone: '', tenant_emirates_id: '', tenant_email: '', tenant_nationality: '', tenant_address: '',
    start_date: todayStr, end_date: defaultEndStr,
    rent_amount: '', security_deposit: '5000',
    payment_frequency: '4 Cheques', number_of_cheques: '4', first_payment_due_date: todayStr,
    first_cheque_number: '', cheque_bank: 'Emirates NBD',
    dewa_deposit: '', deposit_type: 'CHEQUE',
    type: 'residential', notes: '',
    mode_of_payment: 'cheque', contract_value: '', discount_type: '', discount_info: '',
    passport_image: null as File | null, visa_page: null as File | null, 
    tenant_id_image: null as File | null, tenant_id_back_image: null as File | null 
  })
  const [renewData, setRenewData] = useState({ new_end_date: '', new_rent_amount: '' })
  const [vacateNote, setVacateNote] = useState('')
  const [modalPropertyId, setModalPropertyId] = useState<string>('')

  const availableUnits = useMemo(() => {
    return units.filter(u => !u.status || u.status === 'AVAILABLE' || String(u.id) === String(formData.unit_id))
  }, [units, formData.unit_id])

  const modalUnits = useMemo(() => {
    if (!modalPropertyId) return availableUnits
    return availableUnits.filter(u => String(u.property?.id || u.property_id || '') === String(modalPropertyId))
  }, [availableUnits, modalPropertyId])

  const unitsByProperty = useMemo(() => {
    const map = new Map<string, Unit[]>()
    modalUnits.forEach(u => {
      const pName = u.property?.name || 'General Units'
      if (!map.has(pName)) map.set(pName, [])
      map.get(pName)!.push(u)
    })
    return map
  }, [modalUnits])

  const filteredExistingTenants = useMemo(() => {
    const q = tenantSearch.trim().toLowerCase()
    if (!q) return tenants
    return tenants.filter(t =>
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.phone && t.phone.toLowerCase().includes(q)) ||
      (t.contact && t.contact.toLowerCase().includes(q)) ||
      (t.emirates_id && t.emirates_id.toLowerCase().includes(q)) ||
      (t.email && t.email.toLowerCase().includes(q))
    )
  }, [tenants, tenantSearch])

  const selectedTenantObj = useMemo(() => {
    if (!formData.tenant_id) return null
    return tenants.find(t => String(t.id) === String(formData.tenant_id)) || null
  }, [tenants, formData.tenant_id])

  const duplicateTenantMatch = useMemo(() => {
    if (tenantMode !== 'new') return null
    const phone = formData.tenant_phone.trim().toLowerCase()
    const eid = formData.tenant_emirates_id.trim().toLowerCase()
    const email = formData.tenant_email.trim().toLowerCase()
    if (!phone && !eid && !email) return null
    return tenants.find(t =>
      (phone && ((t.phone || '').toLowerCase() === phone || (t.contact || '').toLowerCase() === phone)) ||
      (eid && (t.emirates_id || '').toLowerCase() === eid) ||
      (email && (t.email || '').toLowerCase() === email)
    ) || null
  }, [tenantMode, formData.tenant_phone, formData.tenant_emirates_id, formData.tenant_email, tenants])

  const selectedUnitObj = useMemo(() => {
    if (!formData.unit_id) return null
    return units.find(u => String(u.id) === String(formData.unit_id)) || null
  }, [units, formData.unit_id])

  const openGuidedWizard = (preUnitId = '', prePropertyId = '') => {
    const matchedUnit = preUnitId ? units.find(u => String(u.id) === String(preUnitId)) : null
    const defaultRent = matchedUnit?.price ? String(matchedUnit.price) : ''
    const resolvedPropId = prePropertyId || (matchedUnit?.property?.id ? String(matchedUnit.property.id) : (matchedUnit?.property_id ? String(matchedUnit.property_id) : ''))
    setModalPropertyId(resolvedPropId)
    setWizardStep(1)
    setTenantMode('existing')
    setTenantSearch('')
    setShowMoreDetails(false)
    setCreatedContract(null)
    setFormData({
      unit_id: preUnitId,
      tenant_id: '',
      owner_id: owners[0]?.id ? String(owners[0].id) : '',
      tenant_name: '',
      tenant_phone: '',
      tenant_emirates_id: '',
      tenant_email: '',
      tenant_nationality: '',
      tenant_address: '',
      start_date: todayStr,
      end_date: defaultEndStr,
      rent_amount: defaultRent,
      security_deposit: '5000',
      payment_frequency: '4 Cheques',
      number_of_cheques: '4',
      first_payment_due_date: todayStr,
      first_cheque_number: '',
      cheque_bank: 'Emirates NBD',
      dewa_deposit: '',
      deposit_type: 'CHEQUE',
      type: 'residential',
      notes: '',
      mode_of_payment: 'cheque',
      contract_value: defaultRent,
      discount_type: '',
      discount_info: '',
      passport_image: null,
      visa_page: null,
      tenant_id_image: null,
      tenant_id_back_image: null,
    })
    setIsModalOpen(true)
  }

  useEffect(() => { fetchAll() }, [])

  // Auto-open guided wizard when navigated with ?create=1&unit_id=...
  useEffect(() => {
    if (!isLoading && searchParams.get('create') === '1') {
      const uId = searchParams.get('unit_id') || ''
      const pId = searchParams.get('property_id') || ''
      openGuidedWizard(uId, pId)
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('create')
      nextParams.delete('unit_id')
      nextParams.delete('property_id')
      setSearchParams(nextParams, { replace: true })
    }
  }, [isLoading, searchParams])

  const fetchAll = async () => {
    setIsLoading(true)
    try {
      const [cRes, uRes, oRes, tRes, pRes] = await Promise.all([
        api.get(`${apiPrefix}/contracts`),
        api.get(`${apiPrefix}/units`),
        isOwnerStaff ? Promise.resolve({ data: { data: { owners: [] } } }) : api.get('/admin/properties/owners'),
        api.get(`${apiPrefix}/tenants`),
        api.get(`${apiPrefix}/properties`),
      ])
      setContracts(cRes.data?.data?.contracts || [])
      setUnits(uRes.data?.data?.units || [])
      setOwners(oRes.data?.data?.owners || [])
      setTenants(tRes.data?.data?.tenants || [])
      setProperties(pRes.data?.data?.properties || [])
    } catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (tenantMode === 'existing' && key.startsWith('tenant_') && key !== 'tenant_id' && !key.includes('image')) {
          return
        }
        if (tenantMode === 'new' && key === 'tenant_id') {
          return
        }
        if (value !== null && value !== '') {
          data.append(key, value as any)
        }
      })
      if (!data.has('contract_value') && formData.rent_amount) {
        data.append('contract_value', formData.rent_amount)
      }
      const res = await api.post(`${apiPrefix}/contracts`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const created = res.data?.data?.contract || null
      setCreatedContract(created)
      setWizardStep('success')
      fetchAll()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating contract')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!renewModal) return
    try {
      await api.post(`${apiPrefix}/contracts/${renewModal.id}/renew`, renewData)
      setRenewModal(null)
      fetchAll()
    } catch (err: any) { alert(err.response?.data?.message || 'Error renewing') }
  }

  const handleVacate = async () => {
    if (!vacateContract) return
    try {
      await api.post(`${apiPrefix}/contracts/${vacateContract.id}/vacate`, { notes: vacateNote })
      setVacateContract(null)
      fetchAll()
    } catch (err) { alert('Error vacating contract') }
  }

  const downloadPdf = async (id: number) => {
    if (pdfLoading !== null) return
    setPdfLoading(id)
    try {
      const response = await api.get(`${apiPrefix}/contracts/${id}/pdf`, { responseType: 'blob' })
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
      border-radius: 8px !important;
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
    borderRadius: 8,
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

  // Filtered contracts
  const filteredContracts = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return contracts.filter(c => {
      if (q) {
        const refStr = `gfh-${String(c.id).padStart(5, '0')}`.toLowerCase()
        const unitNum = (c.unit?.number || '').toLowerCase()
        const propName = (c.unit?.property?.name || '').toLowerCase()
        const tenantName = (c.tenant?.name || '').toLowerCase()
        const tenantEmail = (c.tenant?.email || '').toLowerCase()
        const ownerName = (c.owner?.name || '').toLowerCase()
        const statusStr = (c.status || '').toLowerCase()
        const rentStr = String(c.rent_amount || '')
        const match = refStr.includes(q) ||
          unitNum.includes(q) ||
          propName.includes(q) ||
          tenantName.includes(q) ||
          tenantEmail.includes(q) ||
          ownerName.includes(q) ||
          statusStr.includes(q) ||
          rentStr.includes(q)
        if (!match) return false
      }
      if (selectedPropertyId && String(c.unit?.property?.id || '') !== String(selectedPropertyId)) {
        return false
      }
      if (selectedUnitId && String(c.unit_id) !== String(selectedUnitId)) {
        return false
      }
      if (statusFilter && c.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false
      }
      if (startDateFilter && c.start_date < startDateFilter) {
        return false
      }
      return true
    })
  }, [contracts, searchQuery, selectedPropertyId, selectedUnitId, statusFilter, startDateFilter])

  // Paginated contracts (5 per page default as requested)
  const totalContracts = filteredContracts.length
  const totalPages = Math.max(1, Math.ceil(totalContracts / pageSize))
  const paginatedContracts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredContracts.slice(start, start + pageSize)
  }, [filteredContracts, currentPage, pageSize])

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase()
    if (s === 'active') {
      return {
        bg: '#ECFDF8',
        color: '#0F8A67',
        border: '#A7F3DC',
        dot: '#10B981',
        label: 'Active'
      }
    }
    if (s === 'vacated') {
      return {
        bg: '#FFFBEB',
        color: '#D97706',
        border: '#FDE68A',
        dot: '#F59E0B',
        label: 'Vacated'
      }
    }
    if (s === 'settled') {
      return {
        bg: '#EFF6FF',
        color: '#2563EB',
        border: '#BFDBFE',
        dot: '#3B82F6',
        label: 'Settled'
      }
    }
    return {
      bg: '#FEF2F2',
      color: '#DC2626',
      border: '#FECACA',
      dot: '#EF4444',
      label: status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Expired'
    }
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{portalPageCss}</style>
      <style>{`
        .gfh-contract-filter {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 9px 14px;
          background: #FFFFFF;
          color: #0F172A;
          font-weight: 500;
          cursor: pointer;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .gfh-contract-filter:focus {
          border-color: #0D5C46;
          box-shadow: 0 0 0 3px rgba(13, 92, 70, 0.12);
        }
        .gfh-contract-row {
          transition: background-color 0.15s ease;
        }
        .gfh-contract-row:hover {
          background-color: #F8FAFC;
        }
        .gfh-page-btn {
          min-width: 34px;
          height: 34px;
          border-radius: 8px;
          border: 1px solid #E2E8F0;
          background: #FFFFFF;
          color: #334155;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .gfh-page-btn:hover:not(:disabled) {
          border-color: #0D5C46;
          color: #0D5C46;
        }
        .gfh-page-btn.active {
          background: #0D5C46 !important;
          border-color: #0D5C46 !important;
          color: #FFFFFF !important;
        }
        .gfh-page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .gfh-action-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 7px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          text-decoration: none;
        }
      `}</style>

      {/* Main Single Card Container */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E2E8F0',
        padding: '26px 28px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
      }}>
        {/* Top Header Row with Title, Subtitle, and + New Contract Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 22,
        }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.015em', lineHeight: 1.25 }}>
              Contract Management
            </h2>
            <p style={{ fontSize: 14, color: '#64748B', margin: '4px 0 0', fontWeight: 400, lineHeight: 1.5 }}>
              Full contract lifecycle: create, renew, vacate, settle
            </p>
          </div>

          {/* + Create Contract Button */}
          <button
            onClick={() => openGuidedWizard()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#0D5C46',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(13, 92, 70, 0.2)',
              transition: 'background 0.15s ease, transform 0.15s ease',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#094535'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#0D5C46'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Create Contract</span>
          </button>
        </div>

        {/* Filter Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 22,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Properties Dropdown */}
            <select
              value={selectedPropertyId}
              onChange={e => { setSelectedPropertyId(e.target.value); setCurrentPage(1); }}
              className="gfh-contract-filter"
              style={{ minWidth: 165 }}
            >
              <option value="">All Properties</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            {/* Units Dropdown */}
            <select
              value={selectedUnitId}
              onChange={e => { setSelectedUnitId(e.target.value); setCurrentPage(1); }}
              className="gfh-contract-filter"
              style={{ minWidth: 145 }}
            >
              <option value="">All Units</option>
              {units.map(u => <option key={u.id} value={u.id}>{u.number}</option>)}
            </select>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="gfh-contract-filter"
              style={{ minWidth: 145 }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="vacated">Vacated</option>
              <option value="settled">Settled</option>
              <option value="expired">Expired</option>
            </select>

            {/* Date Filter */}
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <input
                type="date"
                value={startDateFilter}
                onChange={e => { setStartDateFilter(e.target.value); setCurrentPage(1); }}
                className="gfh-contract-filter"
                style={{ padding: '8px 36px 8px 12px', fontSize: 14, minWidth: 170 }}
                title="Select Date Range"
              />
              <svg
                style={{ position: 'absolute', right: 12, pointerEvents: 'none', color: '#64748B' }}
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>

            {(selectedPropertyId || selectedUnitId || statusFilter || startDateFilter || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedPropertyId('')
                  setSelectedUnitId('')
                  setStatusFilter('')
                  setStartDateFilter('')
                  setSearchParams({})
                  setCurrentPage(1)
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#0D5C46',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Right side: Filters button */}
          <button
            onClick={() => {
              setSelectedPropertyId('')
              setSelectedUnitId('')
              setStatusFilter('')
              setStartDateFilter('')
              setSearchParams({})
              setCurrentPage(1)
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 16px',
              borderRadius: 8,
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#334155',
              fontSize: 13.5,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="10" y1="18" x2="14" y2="18" />
            </svg>
            <span>Filters</span>
          </button>
        </div>

        {/* Contracts Table */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B', fontWeight: 500, fontSize: 14 }}>
            Loading contracts…
          </div>
        ) : filteredContracts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B', fontWeight: 500, fontSize: 14 }}>
            No contracts found matching your filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                  <th style={{ padding: '13px 16px', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>REF #</th>
                  <th style={{ padding: '13px 16px', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>UNIT ⇅</th>
                  <th style={{ padding: '13px 16px', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>TENANT</th>
                  <th style={{ padding: '13px 16px', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>OWNER</th>
                  <th style={{ padding: '13px 16px', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>DURATION</th>
                  <th style={{ padding: '13px 16px', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>RENT (AED)</th>
                  <th style={{ padding: '13px 16px', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>STATUS</th>
                  <th style={{ padding: '13px 16px', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedContracts.map(c => {
                  const isActive = c.status?.toLowerCase() === 'active'
                  return (
                    <tr key={c.id} className="gfh-contract-row" style={{ borderBottom: '1px solid #E2E8F0' }}>
                      {/* REF # Link */}
                      <td style={{ padding: '16px 16px' }}>
                        <Link to={`${effectiveBasePath}/contracts/${c.id}`} style={{ textDecoration: 'none' }}>
                          <span style={{ color: '#0D5C46', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
                            GFH-{String(c.id).padStart(5, '0')}
                          </span>
                        </Link>
                      </td>

                      {/* UNIT */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ fontWeight: 600, fontSize: 14.5, color: '#0F172A', lineHeight: 1.35 }}>
                          {c.unit?.number || '—'}
                        </div>
                        {c.unit?.property?.name && (
                          <div style={{ fontSize: 13, color: '#64748B', display: 'flex', alignItems: 'center', gap: 5, marginTop: 3, fontWeight: 400 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>{c.unit.property.name}</span>
                          </div>
                        )}
                      </td>

                      {/* TENANT */}
                      <td style={{ padding: '16px 16px', fontWeight: 600, fontSize: 14.5, color: '#0F172A', lineHeight: 1.4 }}>
                        {c.tenant?.name || '—'}
                      </td>

                      {/* OWNER */}
                      <td style={{ padding: '16px 16px', fontWeight: 500, fontSize: 14, color: '#334155', lineHeight: 1.4 }}>
                        {c.owner?.name || '—'}
                      </td>

                      {/* DURATION */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ fontSize: 14, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span>{formatDate(c.start_date)}</span>
                        </div>
                        <div style={{ fontSize: 13, color: '#64748B', marginLeft: 19, marginTop: 2, fontWeight: 400 }}>
                          – {formatDate(c.end_date)}
                        </div>
                      </td>

                      {/* RENT (AED) — Financial values: 16–20px, bold */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>AED</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
                          {Number(c.rent_amount).toLocaleString()}
                        </div>
                      </td>

                      {/* STATUS (Clean rounded pill with dot) */}
                      <td style={{ padding: '16px 14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '4px 12px',
                            borderRadius: 999,
                            background: isActive ? '#ECFDF5' : '#FFFBEB',
                            color: isActive ? '#065F46' : '#D97706',
                            border: isActive ? '1px solid #D1FAE5' : '1px solid #FEF3C7',
                            fontSize: 12,
                            fontWeight: 600,
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#10B981' : '#F59E0B' }} />
                            {isActive ? 'Active' : (c.status === 'vacated' ? 'Vacated' : c.status || 'Active')}
                          </span>
                          {c.last_renewed_at && (
                            <span style={{ fontSize: 10.5, color: '#2563EB', fontWeight: 600 }}>
                              Renewed {formatDate(c.last_renewed_at)}
                            </span>
                          )}
                          {c.on_case && (
                            <span style={{ fontSize: 10.5, color: '#DC2626', fontWeight: 700 }}>
                              ● Legal Case Active
                            </span>
                          )}
                        </div>
                      </td>

                      {/* ACTIONS (Clean spacious horizontal row) */}
                      <td style={{ padding: '14px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          {/* Details button */}
                          <Link
                            to={`${effectiveBasePath}/contracts/${c.id}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 5,
                              padding: '7px 12px',
                              borderRadius: 8,
                              border: '1px solid #CBD5E1',
                              background: '#FFFFFF',
                              color: '#0F172A',
                              fontSize: 12.5,
                              fontWeight: 600,
                              textDecoration: 'none',
                              boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
                            }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="3" />
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            </svg>
                            <span>Details</span>
                          </Link>

                          {/* PDF button */}
                          <button
                            onClick={() => downloadPdf(c.id)}
                            disabled={pdfLoading === c.id}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 5,
                              padding: '7px 12px',
                              borderRadius: 8,
                              border: '1px solid #CBD5E1',
                              background: '#FFFFFF',
                              color: '#0F172A',
                              fontSize: 12.5,
                              fontWeight: 600,
                              cursor: 'pointer',
                              boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
                            }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="7 10 12 15 17 10" />
                              <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            <span>{pdfLoading === c.id ? '...' : 'PDF'}</span>
                          </button>

                          {/* Renew button */}
                          {!isCashier && c.status?.toLowerCase() === 'active' && (
                            <button
                              onClick={() => {
                                setRenewModal(c)
                                setRenewData({ new_end_date: '', new_rent_amount: String(c.rent_amount) })
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 5,
                                padding: '7px 12px',
                                borderRadius: 8,
                                border: 'none',
                                background: '#0D5C46',
                                color: '#FFFFFF',
                                fontSize: 12.5,
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l6.07-1.19" />
                              </svg>
                              <span>Renew</span>
                            </button>
                          )}

                          {/* Vacate button */}
                          {!isCashier && c.status?.toLowerCase() === 'active' && (
                            <button
                              onClick={() => setVacateContract(c)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 5,
                                padding: '7px 12px',
                                borderRadius: 8,
                                border: '1px solid #FECACA',
                                background: '#FEF2F2',
                                color: '#DC2626',
                                fontSize: 12.5,
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                              <span>Vacate</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Row matching reference image */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
          marginTop: 22,
          paddingTop: 16,
          borderTop: '1px solid #F1F5F9',
        }}>
          {/* Showing X to Y of Z contracts */}
          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
            Showing {totalContracts === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalContracts)} of {totalContracts} contracts
          </div>

          {/* Page Buttons & Page Size Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Prev Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="gfh-page-btn"
              title="Previous Page"
            >
              &lt;
            </button>

            {/* Numeric Page Buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`gfh-page-btn ${currentPage === p ? 'active' : ''}`}
                style={{
                  background: currentPage === p ? '#065F46' : '#FFFFFF',
                  borderColor: currentPage === p ? '#065F46' : '#E2E8F0',
                  color: currentPage === p ? '#FFFFFF' : '#334155',
                }}
              >
                {p}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="gfh-page-btn"
              title="Next Page"
            >
              &gt;
            </button>

            {/* Page Size Select */}
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="gfh-contract-filter"
              style={{ padding: '6px 10px', fontSize: 12.5 }}
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Guided 3-Step Contract Creation Wizard + Post-Save Confirmation */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          padding: 16,
        }}>
          <div style={{
            width: '100%',
            maxWidth: 660,
            padding: '28px 32px',
            maxHeight: '92vh',
            overflowY: 'auto',
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.25)',
            border: '1px solid #E2E8F0',
          }}>
            {/* Wizard Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {wizardStep === 'success'
                    ? 'Contract Created'
                    : wizardStep === 1
                      ? 'Create Contract – Step 1: Tenant'
                      : wizardStep === 2
                        ? 'Create Contract – Step 2: Contract Details'
                        : 'Create Contract – Step 3: Review'}
                </h2>
                <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0' }}>
                  {wizardStep === 'success'
                    ? 'System automatically updated unit occupancy, default addendum, and rent ledger'
                    : 'Simple, guided contract creation'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            {/* Step Progress Indicator (Steps 1, 2, 3) */}
            {wizardStep !== 'success' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 8,
                marginBottom: 22,
                padding: '10px 12px',
                background: '#F8FAFC',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
              }}>
                {[
                  { num: 1, label: 'Step 1: Tenant' },
                  { num: 2, label: 'Step 2: Contract Details' },
                  { num: 3, label: 'Step 3: Review' },
                ].map(st => {
                  const isCurrent = wizardStep === st.num
                  const isDone = typeof wizardStep === 'number' && wizardStep > st.num
                  return (
                    <div
                      key={st.num}
                      onClick={() => {
                        if (isDone) setWizardStep(st.num as 1 | 2 | 3)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '7px 10px',
                        borderRadius: 8,
                        background: isCurrent ? '#0E5E48' : isDone ? '#ECFDF5' : 'transparent',
                        color: isCurrent ? '#FFFFFF' : isDone ? '#065F46' : '#64748B',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: isDone ? 'pointer' : 'default',
                      }}
                    >
                      <span style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: isCurrent ? '#FFFFFF' : isDone ? '#10B981' : '#E2E8F0',
                        color: isCurrent ? '#0E5E48' : isDone ? '#FFFFFF' : '#475569',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 800,
                        flexShrink: 0,
                      }}>
                        {isDone ? '✓' : st.num}
                      </span>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {st.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── STEP 1: TENANT ───────────────────────────────────────────────── */}
            {wizardStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Pre-selected Unit Banner if launched from [ Create Contract ] on a unit */}
                {selectedUnitObj && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: '#ECFDF5',
                    border: '1px solid #A7F3DC',
                    borderRadius: 10,
                    fontSize: 13,
                    color: '#065F46',
                    fontWeight: 600,
                  }}>
                    <span>
                      Selected Unit: <strong>{selectedUnitObj.number}</strong>
                      {selectedUnitObj.property?.name ? ` (${selectedUnitObj.property.name})` : ''}
                    </span>
                    <span style={{ fontSize: 11.5, background: '#10B981', color: '#FFFFFF', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                      AVAILABLE
                    </span>
                  </div>
                )}

                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                  Tenant Information
                </div>

                {/* Toggle Buttons: [ Select Existing Tenant ] | [ + Create New Tenant ] */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setTenantMode('existing')}
                    style={{
                      padding: '11px 14px',
                      borderRadius: 10,
                      border: tenantMode === 'existing' ? '2px solid #0E5E48' : '1px solid #CBD5E1',
                      background: tenantMode === 'existing' ? '#ECFDF5' : '#FFFFFF',
                      color: tenantMode === 'existing' ? '#065F46' : '#334155',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Select Existing Tenant
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTenantMode('new')
                      setFormData(prev => ({ ...prev, tenant_id: '' }))
                    }}
                    style={{
                      padding: '11px 14px',
                      borderRadius: 10,
                      border: tenantMode === 'new' ? '2px solid #0E5E48' : '1px solid #CBD5E1',
                      background: tenantMode === 'new' ? '#ECFDF5' : '#FFFFFF',
                      color: tenantMode === 'new' ? '#065F46' : '#334155',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    + Create New Tenant
                  </button>
                </div>

                {tenantMode === 'existing' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                        Search existing tenant (by Name / Mobile / Emirates ID)
                      </label>
                      <input
                        type="text"
                        placeholder="Type Name, Mobile number, or Emirates ID..."
                        value={tenantSearch}
                        onChange={e => setTenantSearch(e.target.value)}
                        className="gfh-contract-filter"
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                        Choose Tenant ({filteredExistingTenants.length} found) *
                      </label>
                      <select
                        value={formData.tenant_id}
                        onChange={e => setFormData({ ...formData, tenant_id: e.target.value })}
                        className="gfh-contract-filter"
                        style={{ width: '100%' }}
                      >
                        <option value="">-- Select Existing Tenant --</option>
                        {filteredExistingTenants.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                            {t.phone || t.contact ? ` • ${t.phone || t.contact}` : ''}
                            {t.emirates_id ? ` • EID: ${t.emirates_id}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Selected Tenant Basic Information Confirmation Card */}
                    {selectedTenantObj && (
                      <div style={{
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderLeft: '4px solid #0F8A67',
                        borderRadius: 10,
                        padding: '14px 16px',
                      }}>
                        <div style={{ fontSize: 11.5, fontWeight: 800, color: '#0F8A67', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                          ✓ Selected Tenant Confirmation
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, color: '#1E293B' }}>
                          <div><strong>Name:</strong> {selectedTenantObj.name}</div>
                          <div><strong>Mobile:</strong> {selectedTenantObj.phone || selectedTenantObj.contact || '—'}</div>
                          <div><strong>Emirates ID:</strong> {selectedTenantObj.emirates_id || '—'}</div>
                          <div><strong>Email:</strong> {selectedTenantObj.email || '—'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Duplicate Prevention Alert */}
                    {duplicateTenantMatch && (
                      <div style={{
                        background: '#FFFBEB',
                        border: '1px solid #FDE68A',
                        borderRadius: 10,
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        flexWrap: 'wrap',
                      }}>
                        <div style={{ fontSize: 12.5, color: '#92400E', fontWeight: 600 }}>
                          ⚠️ Matching tenant already exists: <strong>{duplicateTenantMatch.name}</strong> ({duplicateTenantMatch.phone || duplicateTenantMatch.contact || duplicateTenantMatch.emirates_id || duplicateTenantMatch.email})
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTenantMode('existing')
                            setFormData(prev => ({ ...prev, tenant_id: String(duplicateTenantMatch.id) }))
                          }}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 6,
                            border: '1px solid #D97706',
                            background: '#FFFFFF',
                            color: '#B45309',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Use Existing Tenant
                        </button>
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                          Tenant Name *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. John Smith"
                          value={formData.tenant_name}
                          onChange={e => setFormData({ ...formData, tenant_name: e.target.value })}
                          className="gfh-contract-filter"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                          Mobile Number *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. +971 50 123 4567"
                          value={formData.tenant_phone}
                          onChange={e => setFormData({ ...formData, tenant_phone: e.target.value })}
                          className="gfh-contract-filter"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                          Emirates ID
                        </label>
                        <input
                          type="text"
                          placeholder="784-XXXX-XXXXXXX-X"
                          value={formData.tenant_emirates_id}
                          onChange={e => setFormData({ ...formData, tenant_emirates_id: e.target.value })}
                          className="gfh-contract-filter"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="john@example.com"
                          value={formData.tenant_email}
                          onChange={e => setFormData({ ...formData, tenant_email: e.target.value })}
                          className="gfh-contract-filter"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                          Nationality
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. British / UAE"
                          value={formData.tenant_nationality}
                          onChange={e => setFormData({ ...formData, tenant_nationality: e.target.value })}
                          className="gfh-contract-filter"
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                          Address
                        </label>
                        <input
                          type="text"
                          placeholder="Dubai, UAE"
                          value={formData.tenant_address}
                          onChange={e => setFormData({ ...formData, tenant_address: e.target.value })}
                          className="gfh-contract-filter"
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      padding: '9px 18px',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F8FAFC',
                      color: '#475569',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (tenantMode === 'existing' && !formData.tenant_id) {
                        alert('Please select an existing tenant or click "+ Create New Tenant".')
                        return
                      }
                      if (tenantMode === 'new' && !formData.tenant_name.trim()) {
                        alert('Please enter the new tenant name.')
                        return
                      }
                      setWizardStep(2)
                    }}
                    style={{
                      padding: '9px 22px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#0E5E48',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Next: Contract Details →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: CONTRACT DETAILS ─────────────────────────────────────── */}
            {wizardStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                {/* Unit Section: Building & Unit number */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#0F8A67', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                    Unit
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: isOwnerStaff ? '1fr 1fr' : '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                        Building
                      </label>
                      <select
                        value={modalPropertyId}
                        onChange={e => {
                          setModalPropertyId(e.target.value)
                          setFormData({ ...formData, unit_id: '' })
                        }}
                        className="gfh-contract-filter"
                        style={{ width: '100%' }}
                      >
                        <option value="">All Buildings ({properties.length})</option>
                        {properties.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                        Unit Number *
                      </label>
                      <select
                        value={formData.unit_id}
                        onChange={e => {
                          const newUnitId = e.target.value
                          const uObj = units.find(u => String(u.id) === String(newUnitId))
                          setFormData(prev => ({
                            ...prev,
                            unit_id: newUnitId,
                            rent_amount: prev.rent_amount || (uObj?.price ? String(uObj.price) : ''),
                            contract_value: prev.contract_value || (uObj?.price ? String(uObj.price) : ''),
                          }))
                        }}
                        required
                        className="gfh-contract-filter"
                        style={{ width: '100%' }}
                      >
                        <option value="">Select Available Unit</option>
                        {Array.from(unitsByProperty.entries()).map(([propName, pUnits]) => (
                          <optgroup key={propName} label={propName}>
                            {pUnits.map(u => (
                              <option key={u.id} value={u.id}>
                                {u.number} ({propName}){u.price ? ` — AED ${Number(u.price).toLocaleString()}` : ''}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    {!isOwnerStaff && (
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>Owner *</label>
                        <select
                          value={formData.owner_id}
                          onChange={e => setFormData({ ...formData, owner_id: e.target.value })}
                          required={!isOwnerStaff}
                          className="gfh-contract-filter"
                          style={{ width: '100%' }}
                        >
                          <option value="">Select Owner</option>
                          {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contract Period Section */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#0F8A67', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                    Contract Period
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                        Start Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.start_date}
                        onChange={e => {
                          const s = e.target.value
                          const autoEnd = computeOneYearLater(s)
                          setFormData(prev => ({
                            ...prev,
                            start_date: s,
                            end_date: autoEnd || prev.end_date,
                            first_payment_due_date: s || prev.first_payment_due_date,
                          }))
                        }}
                        className="gfh-contract-filter"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                        End Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.end_date}
                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                        className="gfh-contract-filter"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Details Section */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#0F8A67', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                    Financial Details
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                        Annual / Contract Rent (AED) *
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 60000"
                        value={formData.rent_amount}
                        onChange={e => setFormData({
                          ...formData,
                          rent_amount: e.target.value,
                          contract_value: e.target.value,
                        })}
                        className="gfh-contract-filter"
                        style={{ width: '100%' }}
                      />
                      {Number(formData.rent_amount) > 0 && (
                        <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                          Monthly Equivalent: AED {Math.round(Number(formData.rent_amount) / 12).toLocaleString()} / mo
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                        Security Deposit (AED) *
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 5000"
                        value={formData.security_deposit}
                        onChange={e => setFormData({ ...formData, security_deposit: e.target.value })}
                        className="gfh-contract-filter"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                        Payment Frequency
                      </label>
                      <select
                        value={formData.payment_frequency}
                        onChange={e => {
                          const freq = e.target.value
                          const m = freq.match(/^(\d+)\s*Cheque/i)
                          const chequesCount = m ? m[1] : (freq === 'Cash' || freq === 'Bank Transfer' ? '0' : formData.number_of_cheques)
                          const mode = freq === 'Cash' ? 'cash' : freq === 'Bank Transfer' ? 'bank_transfer' : 'cheque'
                          setFormData({
                            ...formData,
                            payment_frequency: freq,
                            number_of_cheques: chequesCount,
                            mode_of_payment: mode,
                          })
                        }}
                        className="gfh-contract-filter"
                        style={{ width: '100%' }}
                      >
                        <option value="1 Cheque">1 Cheque (Annual)</option>
                        <option value="2 Cheques">2 Cheques (Semi-Annual)</option>
                        <option value="4 Cheques">4 Cheques (Quarterly)</option>
                        <option value="6 Cheques">6 Cheques (Bi-Monthly)</option>
                        <option value="12 Cheques">12 Cheques (Monthly)</option>
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                        Number of Cheques
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={24}
                        value={formData.number_of_cheques}
                        onChange={e => setFormData({ ...formData, number_of_cheques: e.target.value })}
                        className="gfh-contract-filter"
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                        First Payment Due Date
                      </label>
                      <input
                        type="date"
                        value={formData.first_payment_due_date}
                        onChange={e => setFormData({ ...formData, first_payment_due_date: e.target.value })}
                        className="gfh-contract-filter"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Collapsible [ More Contract Details ] */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowMoreDetails(prev => !prev)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 14px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      color: '#334155',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <span>{showMoreDetails ? '▾ Hide More Contract Details' : '▸ More Contract Details'}</span>
                  </button>

                  {showMoreDetails && (
                    <div style={{
                      marginTop: 10,
                      padding: '14px 16px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                            Contract Type
                          </label>
                          <select
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                            className="gfh-contract-filter"
                            style={{ width: '100%' }}
                          >
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="industrial">Industrial</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                            DEWA Deposit (AED)
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 2000"
                            value={formData.dewa_deposit}
                            onChange={e => setFormData({ ...formData, dewa_deposit: e.target.value })}
                            className="gfh-contract-filter"
                            style={{ width: '100%' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                            Cheque Bank Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Emirates NBD"
                            value={formData.cheque_bank}
                            onChange={e => setFormData({ ...formData, cheque_bank: e.target.value })}
                            className="gfh-contract-filter"
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                            First Cheque Number
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 100201"
                            value={formData.first_cheque_number}
                            onChange={e => setFormData({ ...formData, first_cheque_number: e.target.value })}
                            className="gfh-contract-filter"
                            style={{ width: '100%' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                            Special Notes
                          </label>
                          <input
                            type="text"
                            placeholder="Optional remarks or contract notes..."
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            className="gfh-contract-filter"
                            style={{ width: '100%' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 2 Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    style={{
                      padding: '9px 18px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      color: '#334155',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ← Back: Tenant
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.unit_id) {
                        alert('Please select a unit.')
                        return
                      }
                      if (!formData.start_date || !formData.end_date) {
                        alert('Please select the contract start and end dates.')
                        return
                      }
                      if (!formData.rent_amount || Number(formData.rent_amount) <= 0) {
                        alert('Please enter a valid rent amount.')
                        return
                      }
                      setWizardStep(3)
                    }}
                    style={{
                      padding: '9px 22px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#0E5E48',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Next: Review Contract →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: REVIEW ───────────────────────────────────────────────── */}
            {wizardStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderLeft: '4px solid #0E5E48',
                  borderRadius: 12,
                  padding: '20px 22px',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0E5E48', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 14 }}>
                    Contract Summary
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: '#0F172A' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
                      <span style={{ color: '#64748B', fontWeight: 600 }}>Tenant:</span>
                      <span style={{ fontWeight: 800 }}>
                        {tenantMode === 'existing' ? (selectedTenantObj?.name || '—') : (formData.tenant_name || '—')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
                      <span style={{ color: '#64748B', fontWeight: 600 }}>Unit:</span>
                      <span style={{ fontWeight: 800 }}>
                        {selectedUnitObj?.number || '—'}
                        {selectedUnitObj?.property?.name ? ` (${selectedUnitObj.property.name})` : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
                      <span style={{ color: '#64748B', fontWeight: 600 }}>Contract:</span>
                      <span style={{ fontWeight: 700 }}>
                        {formatDate(formData.start_date)} – {formatDate(formData.end_date)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
                      <span style={{ color: '#64748B', fontWeight: 600 }}>Annual Rent:</span>
                      <span style={{ fontWeight: 800, color: '#0E5E48' }}>
                        AED {Number(formData.rent_amount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
                      <span style={{ color: '#64748B', fontWeight: 600 }}>Security Deposit:</span>
                      <span style={{ fontWeight: 700 }}>
                        AED {Number(formData.security_deposit || 0).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: 8 }}>
                      <span style={{ color: '#64748B', fontWeight: 600 }}>Payment Frequency:</span>
                      <span style={{ fontWeight: 700 }}>
                        {formData.payment_frequency}
                        {Number(formData.number_of_cheques) > 0 ? ` (${formData.number_of_cheques} Cheques)` : ''}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B', fontWeight: 600 }}>First Payment Due:</span>
                      <span style={{ fontWeight: 700 }}>
                        {formatDate(formData.first_payment_due_date || formData.start_date)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Automatic system transitions note */}
                <div style={{
                  background: '#ECFDF5',
                  border: '1px solid #A7F3DC',
                  borderRadius: 10,
                  padding: '12px 16px',
                  fontSize: 12.5,
                  color: '#065F46',
                  lineHeight: 1.6,
                }}>
                  <strong>Upon Save, the system will automatically:</strong>
                  <div>• Set contract status to <strong>Active (Current)</strong> & change unit status from <strong>Available → Occupied</strong></div>
                  <div>• Create the default Ejari addendum, post the first rent due, and prepare the contract PDF</div>
                </div>

                {/* Actions: [ Edit ] | [ Save Contract ] */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      color: '#1E293B',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleCreate()}
                    style={{
                      padding: '10px 26px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#0E5E48',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: isSubmitting ? 'wait' : 'pointer',
                      boxShadow: '0 2px 6px rgba(14, 94, 72, 0.25)',
                    }}
                  >
                    {isSubmitting ? 'Saving Contract...' : 'Save Contract'}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 4 (AFTER SAVE): CONFIRMATION ────────────────────────────── */}
            {wizardStep === 'success' && createdContract && (
              <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#ECFDF5',
                  border: '2px solid #10B981',
                  color: '#059669',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  fontWeight: 800,
                  marginBottom: 14,
                }}>
                  ✓
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#065F46', margin: '0 0 8px' }}>
                  ✓ Contract Created Successfully
                </h3>
                <p style={{ fontSize: 13.5, color: '#475569', margin: '0 0 18px' }}>
                  Contract <strong>GFH-{String(createdContract.id).padStart(5, '0')}</strong> for Unit{' '}
                  <strong>{createdContract.unit?.number || selectedUnitObj?.number}</strong> is now{' '}
                  <strong style={{ color: '#059669' }}>Active</strong> and the unit is marked{' '}
                  <strong style={{ color: '#2563EB' }}>Occupied</strong>.
                </p>

                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 10,
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: 12.5,
                  color: '#334155',
                  marginBottom: 22,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                }}>
                  <div>✓ Contract Status: <strong>Active</strong></div>
                  <div>✓ Unit Status: <strong>Available → Occupied</strong></div>
                  <div>✓ Default Addendum: <strong>Created</strong></div>
                  <div>✓ First Rent Due: <strong>Posted</strong></div>
                </div>

                {/* [ Print Contract ] | [ View Contract ] | [ Done ] */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => downloadPdf(createdContract.id)}
                    disabled={pdfLoading === createdContract.id}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 8,
                      border: '1px solid #0E5E48',
                      background: '#FFFFFF',
                      color: '#0E5E48',
                      fontWeight: 700,
                      fontSize: 13.5,
                      cursor: 'pointer',
                    }}
                  >
                    {pdfLoading === createdContract.id ? 'Generating PDF...' : 'Print Contract'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false)
                      navigate(`${effectiveBasePath}/contracts/${createdContract.id}`)
                    }}
                    style={{
                      padding: '10px 22px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#0E5E48',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: 13.5,
                      cursor: 'pointer',
                    }}
                  >
                    View Contract
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      background: '#F8FAFC',
                      color: '#334155',
                      fontWeight: 700,
                      fontSize: 13.5,
                      cursor: 'pointer',
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modern Rounded Modal: Renew Contract */}
      {renewModal && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          padding: 16,
        }}>
          <div style={{
            width: '100%',
            maxWidth: 420,
            padding: '24px 28px',
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.22)',
            border: '1px solid #E2E8F0',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Renew Contract
            </h2>
            <p style={{ fontSize: 13, color: '#0F8A67', fontWeight: 700, margin: '4px 0 16px' }}>
              GFH-{String(renewModal.id).padStart(5, '0')}
            </p>

            <form onSubmit={handleRenew} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                  New End Date (after {formatDate(renewModal.end_date)})
                </label>
                <input
                  type="date"
                  required
                  value={renewData.new_end_date}
                  onChange={e => setRenewData({ ...renewData, new_end_date: e.target.value })}
                  className="gfh-contract-filter"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                  New Rent Amount (AED)
                </label>
                <input
                  type="number"
                  value={renewData.new_rent_amount}
                  onChange={e => setRenewData({ ...renewData, new_rent_amount: e.target.value })}
                  className="gfh-contract-filter"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setRenewModal(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#0E5E48',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Confirm Renewal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Rounded Modal: Vacate Contract & Settlement */}
      <VacateSettlementModal
        isOpen={Boolean(vacateContract)}
        onClose={() => setVacateContract(null)}
        contract={vacateContract}
        basePath={effectiveBasePath}
        onSuccess={fetchAll}
      />
    </div>
  )
}
