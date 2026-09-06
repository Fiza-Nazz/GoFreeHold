import React, { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import api from '../../api/axios'
import { formatDate } from '../../utils/formatDate'
import { THEME, Icon, ICONS, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'
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
  unit?: { id: number; number: string; property?: { id: number; name: string } }
  tenant?: { id: number; name: string; email: string }
  owner?: { id: number; name: string }
}

interface Unit { id: number; number: string; property?: { id: number; name: string } }
interface Tenant { id: number; name: string; email: string }
interface Owner { id: number; name: string }

export default function ContractManagement() {
  const navigate = useNavigate()
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
      const [cRes, uRes, oRes, tRes, pRes] = await Promise.all([
        api.get('/admin/contracts'),
        api.get('/admin/units'),
        api.get('/admin/properties/owners'),
        api.get('/admin/tenants'),
        api.get('/admin/properties'),
      ])
      setContracts(cRes.data?.data?.contracts || [])
      setUnits(uRes.data?.data?.units || [])
      setOwners(oRes.data?.data?.owners || [])
      setTenants(tRes.data?.data?.tenants || [])
      setProperties(pRes.data?.data?.properties || [])
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
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif", padding: '20px 24px' }}>
      <style>{portalPageCss}</style>
      <style>{`
        .gfh-contract-filter {
          font-family: 'Poppins', system-ui, sans-serif;
          font-size: 13.5px;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 8px 14px;
          background: #FFFFFF;
          color: #334155;
          font-weight: 500;
          cursor: pointer;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .gfh-contract-filter:focus {
          border-color: #0F8A67;
          box-shadow: 0 0 0 3px rgba(15, 138, 103, 0.12);
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
          border-color: #0F8A67;
          color: #0F8A67;
        }
        .gfh-page-btn.active {
          background: #0F8A67 !important;
          border-color: #0F8A67 !important;
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
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          text-decoration: none;
        }
      `}</style>

      {/* Main Single Card Container matching media_1788523948275.png */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid #E2E8F0',
        padding: '24px 28px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
      }}>
        {/* Top Header Row with Title, Subtitle, and + New Contract Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 20,
        }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>
              Contract Management
            </h2>
            <p style={{ fontSize: 13.5, color: '#64748B', margin: '4px 0 0', fontWeight: 500 }}>
              Full contract lifecycle: create, renew, vacate, settle
            </p>
          </div>

          {/* + New Contract Button matching media_1788524086753.png */}
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#0E5E48',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              padding: '10px 20px',
              fontSize: 13.5,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(14, 94, 72, 0.25)',
              transition: 'background 0.15s ease, transform 0.15s ease',
              fontFamily: "'Poppins', sans-serif",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#094535'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#0E5E48'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>New Contract</span>
          </button>
        </div>

        {/* Filter Row matching screenshot */}
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
              style={{ minWidth: 160 }}
            >
              <option value="">All Properties</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            {/* Units Dropdown */}
            <select
              value={selectedUnitId}
              onChange={e => { setSelectedUnitId(e.target.value); setCurrentPage(1); }}
              className="gfh-contract-filter"
              style={{ minWidth: 140 }}
            >
              <option value="">All Units</option>
              {units.map(u => <option key={u.id} value={u.id}>{u.number}</option>)}
            </select>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="gfh-contract-filter"
              style={{ minWidth: 140 }}
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
                style={{ padding: '8px 36px 8px 12px', fontSize: 13, minWidth: 170 }}
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
                  color: '#0F8A67',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Right side: Filters button matching screenshot */}
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
              padding: '8px 16px',
              borderRadius: 8,
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#334155',
              fontSize: 13,
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
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B', fontWeight: 600 }}>
            Loading contracts…
          </div>
        ) : filteredContracts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B', fontWeight: 600 }}>
            No contracts found matching your filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 14px', fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>REF #</th>
                  <th style={{ padding: '12px 14px', fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>UNIT ⇅</th>
                  <th style={{ padding: '12px 14px', fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TENANT</th>
                  <th style={{ padding: '12px 14px', fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>OWNER</th>
                  <th style={{ padding: '12px 14px', fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DURATION</th>
                  <th style={{ padding: '12px 14px', fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>RENT (AED)</th>
                  <th style={{ padding: '12px 14px', fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>STATUS</th>
                  <th style={{ padding: '12px 14px', fontSize: 11.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedContracts.map(c => {
                  const isActive = c.status?.toLowerCase() === 'active'
                  return (
                    <tr key={c.id} className="gfh-contract-row" style={{ borderBottom: '1px solid #F1F5F9' }}>
                      {/* REF # Link */}
                      <td style={{ padding: '16px 14px' }}>
                        <Link to={`/admin/contracts/${c.id}`} style={{ textDecoration: 'none' }}>
                          <span style={{ color: '#0F8A67', fontWeight: 700, fontSize: 13.5, textDecoration: 'underline' }}>
                            GFH-{String(c.id).padStart(5, '0')}
                          </span>
                        </Link>
                      </td>

                      {/* UNIT */}
                      <td style={{ padding: '16px 14px' }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#0F172A' }}>
                          {c.unit?.number || '—'}
                        </div>
                        {c.unit?.property?.name && (
                          <div style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>{c.unit.property.name}</span>
                          </div>
                        )}
                      </td>

                      {/* TENANT */}
                      <td style={{ padding: '16px 14px', fontWeight: 700, fontSize: 13.5, color: '#0F172A' }}>
                        {c.tenant?.name || '—'}
                      </td>

                      {/* OWNER */}
                      <td style={{ padding: '16px 14px', fontWeight: 600, fontSize: 13.5, color: '#334155' }}>
                        {c.owner?.name || '—'}
                      </td>

                      {/* DURATION */}
                      <td style={{ padding: '16px 14px' }}>
                        <div style={{ fontSize: 12.5, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span>{formatDate(c.start_date)}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B', marginLeft: 19, marginTop: 2 }}>
                          – {formatDate(c.end_date)}
                        </div>
                      </td>

                      {/* RENT (AED) — PURPLE COLOR AS USER REQUESTED */}
                      <td style={{ padding: '16px 14px' }}>
                        <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>AED</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#6B21A8' }}>
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
                            fontWeight: 700,
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

                      {/* ACTIONS (Matching reference image) */}
                      <td style={{ padding: '14px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, width: 176 }}>
                            {/* Details button */}
                            <Link
                              to={`/admin/contracts/${c.id}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 5,
                                padding: '6px 10px',
                                borderRadius: 8,
                                border: '1px solid #CBD5E1',
                                background: '#FFFFFF',
                                color: '#1E293B',
                                fontSize: 12,
                                fontWeight: 600,
                                textDecoration: 'none',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
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
                                padding: '6px 10px',
                                borderRadius: 8,
                                border: '1px solid #CBD5E1',
                                background: '#FFFFFF',
                                color: '#1E293B',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
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
                            {c.status?.toLowerCase() === 'active' ? (
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
                                  padding: '6px 10px',
                                  borderRadius: 8,
                                  border: 'none',
                                  background: '#065F46',
                                  color: '#FFFFFF',
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l6.07-1.19" />
                                </svg>
                                <span>Renew</span>
                              </button>
                            ) : <div />}

                            {/* Vacate button */}
                            {c.status?.toLowerCase() === 'active' ? (
                              <button
                                onClick={() => setVacateContract(c)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 5,
                                  padding: '6px 10px',
                                  borderRadius: 8,
                                  border: '1px solid #FECACA',
                                  background: '#FFFFFF',
                                  color: '#DC2626',
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                <span>Vacate</span>
                              </button>
                            ) : <div />}
                          </div>

                          {/* 3-dot vertical menu button */}
                          <button
                            onClick={() => navigate(`/admin/contracts/${c.id}`)}
                            title="More Options"
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: '50%',
                              border: 'none',
                              background: 'transparent',
                              color: '#94A3B8',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="12" cy="5" r="2" />
                              <circle cx="12" cy="12" r="2" />
                              <circle cx="12" cy="19" r="2" />
                            </svg>
                          </button>
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

      {/* Modern Rounded Modal: Create New Contract */}
      {isModalOpen && (
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
            maxWidth: 580,
            padding: '28px 32px',
            maxHeight: '90vh',
            overflowY: 'auto',
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.22)',
            border: '1px solid #E2E8F0',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  New Contract
                </h2>
                <p style={{ fontSize: 13, color: '#64748B', margin: '3px 0 0' }}>
                  Fill in the details to create a lease agreement
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Unit & Owner */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>Unit</label>
                  <select
                    value={formData.unit_id}
                    onChange={e => setFormData({ ...formData, unit_id: e.target.value })}
                    required
                    className="gfh-contract-filter"
                    style={{ width: '100%' }}
                  >
                    <option value="">Select Unit</option>
                    {units.map(u => (
                      <option key={u.id} value={u.id}>{u.number} {u.property?.name ? `(${u.property.name})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>Owner</label>
                  <select
                    value={formData.owner_id}
                    onChange={e => setFormData({ ...formData, owner_id: e.target.value })}
                    required
                    className="gfh-contract-filter"
                    style={{ width: '100%' }}
                  >
                    <option value="">Select Owner</option>
                    {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Tenant */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>Tenant</label>
                <select
                  value={formData.tenant_id}
                  onChange={e => setFormData({ ...formData, tenant_id: e.target.value })}
                  required
                  className="gfh-contract-filter"
                  style={{ width: '100%' }}
                >
                  <option value="">Select Tenant</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}{t.email ? ` (${t.email})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    className="gfh-contract-filter"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>End Date</label>
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

              {/* Rent & Deposit */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>Rent Amount (AED)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 95000"
                    value={formData.rent_amount}
                    onChange={e => setFormData({ ...formData, rent_amount: e.target.value })}
                    className="gfh-contract-filter"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>Security Deposit (AED)</label>
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

              {/* Payment Mode & Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>Payment Mode</label>
                  <select
                    value={formData.mode_of_payment}
                    onChange={e => setFormData({ ...formData, mode_of_payment: e.target.value })}
                    className="gfh-contract-filter"
                    style={{ width: '100%' }}
                  >
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>Contract Type</label>
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
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
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
                  type="submit"
                  style={{
                    padding: '9px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#0E5E48',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(14, 94, 72, 0.25)',
                  }}
                >
                  Create Contract
                </button>
              </div>
            </form>
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

      {/* Modern Rounded Modal: Vacate Contract */}
      {vacateContract && (
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
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#D97706', margin: 0 }}>
              Vacate Contract
            </h2>
            <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 14px' }}>
              Unit will be marked as AVAILABLE upon vacating.
            </p>

            <textarea
              rows={3}
              placeholder="Reason / remarks for vacating..."
              value={vacateNote}
              onChange={e => setVacateNote(e.target.value)}
              className="gfh-contract-filter"
              style={{ width: '100%', marginBottom: 14, resize: 'vertical' }}
            />

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setVacateContract(null)}
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
                type="button"
                onClick={handleVacate}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#D97706',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
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
