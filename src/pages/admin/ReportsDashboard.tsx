import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { formatDate } from '../../utils/formatDate'
import { THEME, Icon, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'

type ReportType = 'revenue' | 'receivables' | 'expired-contracts' | 'inventory-summary' | 'historical-ledgers'

const icons = {
  printer: 'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6v-8z',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
}

const REPORT_LABELS: Record<ReportType, string> = {
  'revenue': 'Revenue Analysis',
  'receivables': 'Receivables',
  'expired-contracts': 'Expiring Contracts (~100d)',
  'inventory-summary': 'Inventory Summary',
  'historical-ledgers': 'Historical Ledgers',
}

export default function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState<ReportType>('revenue')
  const [reportData, setReportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchReport()
  }, [activeTab])

  const fetchReport = async () => {
    setIsLoading(true)
    try {
      const res = await api.get(`/admin/reports/${activeTab}`)
      setReportData(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const exportExcel = async () => {
    try {
      const response = await api.get(`/admin/reports/export/${activeTab}`, { responseType: 'blob' })
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

  return (
    <div className="gfh-portal-page gfh-rp-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
      <style>{`${portalPageCss}
        .gfh-rp-print-only { display: none; }

        /* ---- Print-only styles: premium branded, purple-accented professional report ---- */
        @media print {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;

          body * { visibility: hidden; }
          .gfh-rp-printable, .gfh-rp-printable * {
            visibility: visible;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .gfh-rp-printable {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
          .gfh-rp-noprint { display: none !important; }

          .gfh-rp-print-only { display: block !important; }
          .gfh-rp-letterhead {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-end !important;
            gap: 16px !important;
            padding-bottom: 14px !important;
            margin-bottom: 18px !important;
            border-bottom: 3px solid #115e59 !important;
          }
          .gfh-rp-brand-row {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
          }
          .gfh-rp-brand-mark {
            width: 30px !important;
            height: 30px !important;
            border-radius: 6px !important;
            background: linear-gradient(135deg, #0f766e, #115e59) !important;
            color: #fff !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-family: 'Playfair Display', Georgia, serif !important;
            font-weight: 800 !important;
            font-size: 15px !important;
            flex-shrink: 0 !important;
          }
          .gfh-rp-brand-text h2 {
            font-family: 'Playfair Display', Georgia, serif !important;
            font-size: 15px !important;
            font-weight: 800 !important;
            color: #1c1917 !important;
            margin: 0 !important;
          }
          .gfh-rp-brand-text span {
            font-size: 9px !important;
            font-weight: 700 !important;
            color: #0f766e !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
          }
          .gfh-rp-print-only h1 {
            font-family: 'Playfair Display', Georgia, serif !important;
            font-size: 22px !important;
            font-weight: 800 !important;
            color: #1c1917 !important;
            margin: 0 0 3px 0 !important;
            text-align: right !important;
          }
          .gfh-rp-print-only p {
            font-size: 10px !important;
            color: #6b6478 !important;
            margin: 0 !important;
            text-align: right !important;
          }
          .gfh-rp-print-footer {
            display: flex !important;
            justify-content: space-between !important;
            margin-top: 22px !important;
            padding-top: 10px !important;
            border-top: 1px solid #e5e7eb !important;
            font-size: 8.5px !important;
            color: #a89bc4 !important;
            letter-spacing: 0.3px !important;
          }

          table { width: 100% !important; border-collapse: collapse !important; }
          thead tr { background: #2d1657 !important; }
          th {
            text-align: left !important;
            color: #ffffff !important;
            font-size: 9px !important;
            font-weight: 700 !important;
            letter-spacing: 0.5px !important;
            text-transform: uppercase !important;
            padding: 8px 10px !important;
          }
          td {
            text-align: left !important;
            color: #1c1917 !important;
            font-size: 10.5px !important;
            padding: 8px 10px !important;
          }
          tr { border-bottom: 1px solid #e5e7eb !important; }
          tbody tr:nth-child(even) { background: #faf6ff !important; }

          h3 { color: #1c1917 !important; }

          @page { margin: 1.4cm; }
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
            className="gfh-portal-btn"
            onClick={handlePrint}
            style={{
              ...ghostBtnStyle,
              background: '#3C096C',
              color: '#ffffff',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Icon path={icons.printer} size={15} />
            Print Report
          </button>
          <button className="gfh-portal-btn" onClick={exportExcel} style={{ ...ghostBtnStyle, background: '#240046', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Icon path={icons.download} size={15} />
            Export to Excel
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
            className="gfh-portal-btn"
            onClick={() => setActiveTab(t.key as ReportType)}
            style={{
              fontSize: 13,
              fontWeight: 700,
              padding: '9px 16px',
              borderRadius: 0,
              border: activeTab === t.key ? 'none' : '1px solid #CBD5E1',
              background: activeTab === t.key ? '#240046' : '#F8FAFC',
              color: activeTab === t.key ? '#ffffff' : '#0F172A',
              cursor: 'pointer',
              transition: 'background 0.15s ease, color 0.15s ease',
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
              {/* Revenue Tab */}
              {activeTab === 'revenue' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: THEME.purple, margin: 0 }}>
                      Total revenue ({reportData.year}): <span style={{ color: '#10b981' }}>AED {Number(reportData.total_revenue).toLocaleString()}</span>
                    </h3>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                        {['Month', 'Category', 'Total collected (AED)'].map(h => (
                          <th key={h} style={thStyle}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.breakdown?.map((b: any, i: number) => (
                        <tr key={i} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                          <td style={tdStyle}>Month {b.month}</td>
                          <td style={tdStyle}>{String(b.type ?? b.category ?? '—').toUpperCase()}</td>
                          <td style={{ ...tdStyle, fontWeight: 700, color: '#10b981' }}>AED {Number(b.total).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Receivables Tab */}
              {activeTab === 'receivables' && (
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: THEME.purple, marginBottom: 20, marginTop: 0 }}>
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
                  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: THEME.purple, marginBottom: 20, marginTop: 0 }}>
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
                      <div key={card.label} className="gfh-portal-stat" style={{ position: 'relative', padding: 18, background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 0, textAlign: 'center' }}>
                        <span className="gfh-rp-noprint"><CornerBrackets /></span>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color: card.color }}>{card.value}</div>
                        <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: 4 }}>{card.label}</div>
                      </div>
                    ))}
                  </div>

                  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 17, fontWeight: 700, color: THEME.purple }}>Low stock warning items</h3>
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
                  <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: THEME.purple, marginBottom: 20, marginTop: 0 }}>
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
