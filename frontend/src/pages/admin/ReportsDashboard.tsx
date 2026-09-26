import { useEffect, useState, useMemo } from 'react'
import api from '../../api/axios'
import { formatDate } from '../../utils/formatDate'
import { THEME, Icon, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'

type ReportType = 'revenue' | 'receivables' | 'expired-contracts' | 'inventory-summary' | 'historical-ledgers'

const icons = {
  printer: 'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6v-8z',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
}

const REPORT_LABELS: Record<ReportType, string> = {
  'revenue': 'Revenue & Utility Analysis',
  'receivables': 'Receivables',
  'expired-contracts': 'Expiring Contracts (~100d)',
  'inventory-summary': 'Inventory Summary',
  'historical-ledgers': 'Historical Ledgers',
}

export default function ReportsDashboard() {
  const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/owner') ? '/owner' : '/admin'
  const [activeTab, setActiveTab] = useState<ReportType>('revenue')
  const [reportData, setReportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Granular Revenue Analysis States
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'dewa' | 'rent' | 'deposit' | 'service_charge'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [revenueView, setRevenueView] = useState<'detailed' | 'monthly'>('detailed')

  useEffect(() => {
    fetchReport()
  }, [activeTab])

  const fetchReport = async () => {
    setIsLoading(true)
    try {
      const res = await api.get(`${basePath}/reports/${activeTab}`)
      setReportData(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const exportExcel = async () => {
    try {
      const response = await api.get(`${basePath}/reports/export/${activeTab}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `GoFreeHold_Report_${activeTab}_${new Date().toISOString().slice(0,10)}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to export Excel report. Please try again.')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Filtered payments for Revenue Analysis
  const filteredPayments = useMemo(() => {
    if (!reportData?.payments) return []
    return reportData.payments.filter((p: any) => {
      // Category filter
      if (categoryFilter !== 'all' && (p.type || '').toLowerCase() !== categoryFilter) {
        return false
      }
      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const tenantName = (p.contract?.tenant?.name || p.tenant?.name || '').toLowerCase()
        const ownerName = (p.contract?.owner?.name || '').toLowerCase()
        const propName = (p.contract?.unit?.property?.name || '').toLowerCase()
        const unitNum = (p.contract?.unit?.number || '').toLowerCase()
        const ref = (p.receipt_number || p.reference_number || `RCP-${p.id}`).toLowerCase()
        const mode = (p.mode || '').toLowerCase()
        return (
          tenantName.includes(q) ||
          ownerName.includes(q) ||
          propName.includes(q) ||
          unitNum.includes(q) ||
          ref.includes(q) ||
          mode.includes(q)
        )
      }
      return true
    })
  }, [reportData?.payments, categoryFilter, searchTerm])

  const categoryCounts = useMemo(() => {
    const list = reportData?.payments || []
    return {
      all: list.length,
      dewa: list.filter((p: any) => (p.type || '').toLowerCase() === 'dewa').length,
      rent: list.filter((p: any) => (p.type || '').toLowerCase() === 'rent').length,
      deposit: list.filter((p: any) => (p.type || '').toLowerCase() === 'deposit').length,
      service_charge: list.filter((p: any) => (p.type || '').toLowerCase() === 'service_charge').length,
    }
  }, [reportData?.payments])

  return (
    <div className="gfh-portal-page gfh-rp-page" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`${portalPageCss}
        .gfh-rp-print-only { display: none; }

        @media print {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          @page {
            margin: 12mm 14mm;
            size: auto;
          }

          body {
            background: #ffffff !important;
            color: #0f172a !important;
          }

          nav, aside, header, .gfh-rp-noprint {
            display: none !important;
          }

          .gfh-portal-page, .gfh-rp-page {
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
          }

          .gfh-rp-printable {
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }

          .gfh-rp-print-only {
            display: block !important;
          }

          .gfh-rp-letterhead {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-end !important;
            gap: 16px !important;
            padding-bottom: 14px !important;
            margin-bottom: 18px !important;
            border-bottom: 2px solid #0e5e48 !important;
          }

          .gfh-rp-brand-row {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
          }

          .gfh-rp-brand-mark {
            width: 32px !important;
            height: 32px !important;
            border-radius: 6px !important;
            background: #0e5e48 !important;
            color: #fff !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-family: 'Playfair Display', Georgia, serif !important;
            font-weight: 800 !important;
            font-size: 16px !important;
            flex-shrink: 0 !important;
          }

          .gfh-rp-brand-text h2 {
            font-family: 'Playfair Display', Georgia, serif !important;
            font-size: 16px !important;
            font-weight: 800 !important;
            color: #0f172a !important;
            margin: 0 !important;
          }

          .gfh-rp-brand-text span {
            font-size: 9.5px !important;
            font-weight: 700 !important;
            color: #0e5e48 !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
          }

          .gfh-rp-print-only h1 {
            font-family: 'Playfair Display', Georgia, serif !important;
            font-size: 20px !important;
            font-weight: 800 !important;
            color: #0f172a !important;
            margin: 0 0 4px 0 !important;
            text-align: right !important;
          }

          .gfh-rp-print-only p {
            font-size: 10px !important;
            color: #64748b !important;
            margin: 0 !important;
            text-align: right !important;
          }

          .gfh-rp-print-footer {
            display: flex !important;
            justify-content: space-between !important;
            margin-top: 24px !important;
            padding-top: 10px !important;
            border-top: 1px solid #e2e8f0 !important;
            font-size: 9px !important;
            color: #94a3b8 !important;
            letter-spacing: 0.3px !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: auto !important;
          }

          thead {
            display: table-header-group !important;
          }

          tr {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }

          thead tr {
            background: #f1f5f9 !important;
          }

          th {
            text-align: left !important;
            color: #1e293b !important;
            font-size: 9.5px !important;
            font-weight: 700 !important;
            letter-spacing: 0.5px !important;
            text-transform: uppercase !important;
            padding: 8px 10px !important;
            border-bottom: 2px solid #cbd5e1 !important;
          }

          td {
            text-align: left !important;
            color: #0f172a !important;
            font-size: 10px !important;
            padding: 8px 10px !important;
            border-bottom: 1px solid #e2e8f0 !important;
          }

          tbody tr:nth-child(even) {
            background: #f8fafc !important;
          }
        }
      `}</style>

      {/* Hero Header */}
      <div className="fade-in gfh-rp-noprint" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            System Reports
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Exportable financial, contract, and inventory analytics
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handlePrint}
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
              fontFamily: "'Inter', sans-serif",
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
            <Icon path={icons.printer} size={15} />
            <span>Print Report</span>
          </button>
          <button
            onClick={exportExcel}
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
              fontFamily: "'Inter', sans-serif",
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
            <Icon path={icons.download} size={15} />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="gfh-rp-noprint" style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'revenue', label: 'Revenue Analysis' },
          { key: 'receivables', label: 'Receivables' },
          { key: 'expired-contracts', label: 'Expiring Contracts (~100d)' },
          { key: 'inventory-summary', label: 'Inventory Summary' },
          { key: 'historical-ledgers', label: 'Historical Ledgers' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as ReportType)}
            style={{
              fontSize: 13,
              fontWeight: 700,
              padding: '9px 18px',
              borderRadius: 10,
              border: activeTab === t.key ? 'none' : '1px solid #CBD5E1',
              background: activeTab === t.key ? '#0E5E48' : '#FFFFFF',
              color: activeTab === t.key ? '#FFFFFF' : '#334155',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: activeTab === t.key ? '0 1px 3px rgba(14, 94, 72, 0.25)' : 'none',
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={e => {
              if (activeTab !== t.key) {
                e.currentTarget.style.borderColor = '#0E5E48'
                e.currentTarget.style.color = '#0E5E48'
              }
            }}
            onMouseLeave={e => {
              if (activeTab !== t.key) {
                e.currentTarget.style.borderColor = '#CBD5E1'
                e.currentTarget.style.color = '#334155'
              }
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Printable area */}
      <div className="gfh-rp-printable">
        {/* Branded letterhead, shown only in print */}
        <div className="gfh-rp-print-only gfh-rp-letterhead">
          <div className="gfh-rp-brand-row">
            <div className="gfh-rp-brand-mark">G</div>
            <div className="gfh-rp-brand-text">
              <h2>GoFreeHold</h2>
              <span>Property Management</span>
            </div>
          </div>
          <div>
            <h1>{REPORT_LABELS[activeTab]}</h1>
            <p>Generated {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        <div className="fade-in" style={{ ...panelStyle, minHeight: 400 }}>
          <span className="gfh-rp-noprint"><CornerBrackets /></span>
          {isLoading ? (
            <div className="gfh-rp-noprint" style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /> Loading report...</div>
          ) : !reportData ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>No data found for this report.</p>
            </div>
          ) : (
            <div>
              {/* Revenue & Utility Analysis Tab */}
              {activeTab === 'revenue' && (
                <div>
                  {/* KPI Summary Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
                    <div style={{ padding: '16px 20px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B' }}>
                        Total Revenue ({reportData.year})
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#0E5E48', marginTop: 4 }}>
                        AED {Number(reportData.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 2 }}>All verified inflows</div>
                    </div>

                    <div style={{ padding: '16px 20px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#15803D' }}>
                        Rent Collected
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#15803D', marginTop: 4 }}>
                        AED {Number(reportData.total_rent || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#16A34A', marginTop: 2 }}>Contractual rent payments</div>
                    </div>

                    <div style={{ padding: '16px 20px', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 10 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0369A1' }}>
                        DEWA Utilities Collected
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#0369A1', marginTop: 4 }}>
                        AED {Number(reportData.total_dewa || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#0284C7', marginTop: 2 }}>Water & electricity collections</div>
                    </div>

                    <div style={{ padding: '16px 20px', background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: 10 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#7E22CE' }}>
                        Security Deposits
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#7E22CE', marginTop: 4 }}>
                        AED {Number(reportData.total_deposit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#9333EA', marginTop: 2 }}>Refundable security deposits</div>
                    </div>
                  </div>

                  {/* Interactive Controls Bar */}
                  <div className="gfh-rp-noprint" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18, background: '#F8FAFC', padding: '12px 16px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                    {/* View Switcher: Detailed Ledger vs Monthly Summary */}
                    <div style={{ display: 'flex', gap: 4, background: '#E2E8F0', padding: 3, borderRadius: 8 }}>
                      <button
                        onClick={() => setRevenueView('detailed')}
                        style={{
                          padding: '6px 14px',
                          fontSize: 12.5,
                          fontWeight: 700,
                          borderRadius: 6,
                          border: 'none',
                          cursor: 'pointer',
                          background: revenueView === 'detailed' ? '#FFFFFF' : 'transparent',
                          color: revenueView === 'detailed' ? '#0E5E48' : '#64748B',
                          boxShadow: revenueView === 'detailed' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                        }}
                      >
                        Detailed Ledger ({filteredPayments.length})
                      </button>
                      <button
                        onClick={() => setRevenueView('monthly')}
                        style={{
                          padding: '6px 14px',
                          fontSize: 12.5,
                          fontWeight: 700,
                          borderRadius: 6,
                          border: 'none',
                          cursor: 'pointer',
                          background: revenueView === 'monthly' ? '#FFFFFF' : 'transparent',
                          color: revenueView === 'monthly' ? '#0E5E48' : '#64748B',
                          boxShadow: revenueView === 'monthly' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                        }}
                      >
                        Monthly Summary ({reportData.breakdown?.length || 0})
                      </button>
                    </div>

                    {/* Category Filter Pills (When in Detailed View) */}
                    {revenueView === 'detailed' && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        {[
                          { key: 'all', label: `All (${categoryCounts.all})` },
                          { key: 'dewa', label: `DEWA Only (${categoryCounts.dewa})` },
                          { key: 'rent', label: `Rent Only (${categoryCounts.rent})` },
                          { key: 'deposit', label: `Deposits (${categoryCounts.deposit})` },
                          { key: 'service_charge', label: `Service Charges (${categoryCounts.service_charge})` },
                        ].map(pill => (
                          <button
                            key={pill.key}
                            onClick={() => setCategoryFilter(pill.key as any)}
                            style={{
                              padding: '5px 12px',
                              fontSize: 12,
                              fontWeight: 700,
                              borderRadius: 20,
                              border: categoryFilter === pill.key ? '1px solid #0E5E48' : '1px solid #CBD5E1',
                              background: categoryFilter === pill.key ? '#0E5E48' : '#FFFFFF',
                              color: categoryFilter === pill.key ? '#FFFFFF' : '#475569',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {pill.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Search Bar */}
                    {revenueView === 'detailed' && (
                      <div style={{ position: 'relative', minWidth: 260, flex: '1 1 240px', maxWidth: 360 }}>
                        <input
                          type="text"
                          placeholder="Search tenant, owner, building, unit, receipt..."
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px 8px 32px',
                            fontSize: 12.5,
                            borderRadius: 8,
                            border: '1px solid #CBD5E1',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', display: 'flex' }}>
                          <Icon path={icons.search} size={14} />
                        </span>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            style={{
                              position: 'absolute',
                              right: 8,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#94A3B8',
                              fontSize: 14,
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content: Detailed Transactions vs Monthly Summary */}
                  {revenueView === 'detailed' ? (
                    filteredPayments.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '50px 20px', color: THEME.textMuted }}>
                        <p style={{ fontSize: 14, fontWeight: 600 }}>No payments match the selected criteria.</p>
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: `2px solid ${THEME.border}`, background: '#F8FAFC' }}>
                              {['Date', 'Ref / Receipt #', 'Category', 'Tenant Name', 'Owner / Landlord', 'Property & Unit', 'Mode', 'Amount (AED)'].map(h => (
                                <th key={h} style={thStyle}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPayments.map((p: any) => {
                              const type = (p.type || '').toLowerCase()
                              const isDewa = type === 'dewa'
                              const isRent = type === 'rent'
                              const isDeposit = type === 'deposit'
                              const isServiceCharge = type === 'service_charge'

                              let badgeBg = '#F1F5F9'
                              let badgeColor = '#475569'
                              let badgeBorder = '#CBD5E1'
                              let badgeLabel = (p.type || 'Other').toUpperCase()

                              if (isDewa) {
                                badgeBg = '#E0F2FE'
                                badgeColor = '#0369A1'
                                badgeBorder = '#BAE6FD'
                                badgeLabel = 'DEWA Utility'
                              } else if (isRent) {
                                badgeBg = '#DCFCE7'
                                badgeColor = '#15803D'
                                badgeBorder = '#BBF7D0'
                                badgeLabel = 'Rent'
                              } else if (isDeposit) {
                                badgeBg = '#F3E8FF'
                                badgeColor = '#7E22CE'
                                badgeBorder = '#DDD6FE'
                                badgeLabel = 'Deposit'
                              } else if (isServiceCharge) {
                                badgeBg = '#FEF3C7'
                                badgeColor = '#B45309'
                                badgeBorder = '#FDE68A'
                                badgeLabel = 'Service Charge'
                              }

                              return (
                                <tr key={p.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                                  <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{formatDate(p.date)}</td>
                                  <td style={{ ...tdStyle, fontWeight: 600, fontSize: 12, color: '#334155' }}>
                                    {p.receipt_number || p.reference_number || `RCP-${String(p.id).padStart(5, '0')}`}
                                  </td>
                                  <td style={tdStyle}>
                                    <span style={{
                                      display: 'inline-block',
                                      padding: '3px 8px',
                                      borderRadius: 4,
                                      fontSize: 11,
                                      fontWeight: 700,
                                      background: badgeBg,
                                      color: badgeColor,
                                      border: `1px solid ${badgeBorder}`,
                                      whiteSpace: 'nowrap',
                                    }}>
                                      {badgeLabel}
                                    </span>
                                  </td>
                                  <td style={{ ...tdStyle, fontWeight: 600, color: THEME.ink }}>
                                    {p.contract?.tenant?.name || p.tenant?.name || '—'}
                                  </td>
                                  <td style={{ ...tdStyle, color: '#475569' }}>
                                    {p.contract?.owner?.name || '—'}
                                  </td>
                                  <td style={tdStyle}>
                                    {p.contract?.unit ? (
                                      <div>
                                        <span style={{ fontWeight: 600, color: '#0E5E48' }}>Unit {p.contract.unit.number}</span>
                                        {p.contract.unit.property?.name && (
                                          <span style={{ fontSize: 11.5, color: '#64748B', display: 'block' }}>
                                            {p.contract.unit.property.name}
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      '—'
                                    )}
                                  </td>
                                  <td style={{ ...tdStyle, textTransform: 'capitalize', fontSize: 12, color: '#64748B' }}>
                                    {(p.mode || '—').replace('_', ' ')}
                                  </td>
                                  <td style={{
                                    ...tdStyle,
                                    fontWeight: 700,
                                    fontSize: 13,
                                    whiteSpace: 'nowrap',
                                    color: isDewa ? '#0369A1' : isRent ? '#065F46' : '#1E293B',
                                    textAlign: 'right',
                                  }}>
                                    AED {Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )
                  ) : (
                    /* Monthly Aggregate Breakdown View */
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: `2px solid ${THEME.border}`, background: '#F8FAFC' }}>
                            {['Month', 'Category', 'Total collected (AED)'].map(h => (
                              <th key={h} style={thStyle}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.breakdown?.map((b: any, i: number) => {
                            const bType = (b.type || b.category || '').toLowerCase()
                            const isDewa = bType === 'dewa'
                            const isRent = bType === 'rent'
                            return (
                              <tr key={i} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                                <td style={{ ...tdStyle, fontWeight: 600 }}>Month {b.month}</td>
                                <td style={tdStyle}>
                                  <span style={{
                                    display: 'inline-block',
                                    padding: '3px 8px',
                                    borderRadius: 4,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    background: isDewa ? '#E0F2FE' : isRent ? '#DCFCE7' : '#F1F5F9',
                                    color: isDewa ? '#0369A1' : isRent ? '#15803D' : '#475569',
                                    border: `1px solid ${isDewa ? '#BAE6FD' : isRent ? '#BBF7D0' : '#CBD5E1'}`,
                                  }}>
                                    {String(b.type ?? b.category ?? '—').toUpperCase()}
                                  </span>
                                </td>
                                <td style={{ ...tdStyle, fontWeight: 700, color: '#0E5E48', textAlign: 'right' }}>
                                  AED {Number(b.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Receivables Tab */}
              {activeTab === 'receivables' && (
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: THEME.ink, marginBottom: 20, marginTop: 0 }}>
                    Total outstanding: <span style={{ color: '#ef4444' }}>AED {Number(reportData.total_outstanding ?? 0).toLocaleString()}</span>
                  </h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                        {['Contract', 'Unit / property', 'Tenant', 'Balance (AED)'].map(h => (
                          <th key={h} style={thStyle}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.entries?.map((e: any) => (
                        <tr key={e.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                          <td style={{ ...tdStyle, fontWeight: 700 }}>GFH-{String(e.contract_id).padStart(5,'0')}</td>
                          <td style={tdStyle}>{e.contract?.unit?.number} ({e.contract?.unit?.property?.name})</td>
                          <td style={tdStyle}>{e.contract?.tenant?.name}</td>
                          <td style={{ ...tdStyle, color: '#ef4444', fontWeight: 700 }}>AED {Number(e.balance).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Expiring Contracts Tab */}
              {activeTab === 'expired-contracts' && (
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: THEME.ink, marginBottom: 20, marginTop: 0 }}>
                    Contracts expiring within ~100 days ({reportData.total_count} found)
                  </h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                        {['Ref #', 'Tenant', 'Unit / property', 'End date', 'Rent (AED)'].map(h => (
                          <th key={h} style={thStyle}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.contracts?.map((c: any) => (
                        <tr key={c.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                          <td style={{ ...tdStyle, fontWeight: 700 }}>GFH-{String(c.id).padStart(5,'0')}</td>
                          <td style={tdStyle}>{c.tenant?.name}</td>
                          <td style={tdStyle}>{c.unit?.number} ({c.unit?.property?.name})</td>
                          <td style={{ ...tdStyle, color: '#f59e0b', fontWeight: 700 }}>{formatDate(c.end_date)}</td>
                          <td style={tdStyle}>AED {Number(c.rent_amount).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Inventory Summary Tab */}
              {activeTab === 'inventory-summary' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 20 }}>
                    {[
                      { value: reportData.total_warehouse_items, label: 'Warehouse items', color: THEME.ink },
                      { value: reportData.total_unit_items, label: 'Unit-assigned items', color: THEME.ink },
                      { value: reportData.low_stock_count, label: 'Low stock alerts', color: '#ef4444' },
                    ].map(card => (
                      <div key={card.label} className="gfh-portal-stat" style={{ position: 'relative', padding: 18, background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 8, textAlign: 'center' }}>
                        <span className="gfh-rp-noprint"><CornerBrackets /></span>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: card.color }}>{card.value}</div>
                        <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: 4 }}>{card.label}</div>
                      </div>
                    ))}
                  </div>

                  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 17, fontWeight: 700, color: THEME.ink }}>Low stock warning items</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                        {['Item', 'Category', 'Qty remaining', 'Min alert threshold'].map(h => (
                          <th key={h} style={thStyle}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.low_stock_items?.map((item: any) => (
                        <tr key={item.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                          <td style={{ ...tdStyle, fontWeight: 700 }}>{item.name}</td>
                          <td style={tdStyle}>{item.category}</td>
                          <td style={{ ...tdStyle, color: '#ef4444', fontWeight: 700 }}>{item.quantity}</td>
                          <td style={tdStyle}>{item.min_stock_alert}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Historical Ledgers Tab */}
              {activeTab === 'historical-ledgers' && (
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: THEME.ink, marginBottom: 20, marginTop: 0 }}>
                    Historical ledger entries
                  </h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                        {['Contract', 'Date', 'Description', 'Debit (AED)', 'Credit (AED)'].map(h => (
                          <th key={h} style={thStyle}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.ledgers?.map((l: any) => (
                        <tr key={l.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}`, opacity: l.deleted_at ? 0.5 : 1 }}>
                          <td style={{ ...tdStyle, fontWeight: 700 }}>GFH-{String(l.contract_id).padStart(5,'0')}</td>
                          <td style={tdStyle}>{formatDate(l.date)}</td>
                          <td style={tdStyle}>{l.description || '—'}</td>
                          <td style={tdStyle}>{Number(l.debit).toLocaleString()}</td>
                          <td style={{ ...tdStyle, color: '#10b981', fontWeight: 700 }}>{Number(l.credit).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer, shown only in print */}
        <div className="gfh-rp-print-only gfh-rp-print-footer">
          <span>GoFreeHold Property Management — Confidential Report</span>
          <span>Generated via Admin Portal</span>
        </div>
      </div>
    </div>
  )
}
