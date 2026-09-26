import { useEffect, useState, useMemo } from 'react'
import api from '../../api/axios'
import { THEME, Icon, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle } from '../../components/gfh/adminTheme'

interface VacantUnit {
  id: number
  number: string
  floor: number
  type: string
  size?: string | number
  furnished?: boolean
  status?: string
  price: number
  property?: { id?: number; name: string }
  owner?: { id?: number; name: string }
}

const icons = {
  printer: 'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6v-8z',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
}

export default function VacantPropertyReport() {
  const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/owner') ? '/owner' : '/admin'
  const [units, setUnits] = useState<VacantUnit[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [propertyFilter, setPropertyFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    fetchVacantUnits()
  }, [])

  const fetchVacantUnits = async () => {
    setIsLoading(true)
    try {
      const res = await api.get(`${basePath}/reports/vacant-properties`)
      setUnits(res.data?.data?.units || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const exportExcel = async () => {
    try {
      const response = await api.get(`${basePath}/reports/export/vacant-properties`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `GoFreeHold_Vacant_Properties_${new Date().toISOString().slice(0, 10)}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to export Excel report. Please try again.')
    }
  }

  // Summary Metrics
  const summaryStats = useMemo(() => {
    const totalUnits = units.length
    const totalPotentialRent = units.reduce((acc, u) => acc + (Number(u.price) || 0), 0)
    const uniqueProperties = new Set(units.map(u => u.property?.name).filter(Boolean)).size
    const avgPrice = totalUnits > 0 ? totalPotentialRent / totalUnits : 0
    return {
      totalUnits,
      totalPotentialRent,
      uniqueProperties,
      avgPrice,
    }
  }, [units])

  // Filter options
  const propertyOptions = useMemo(() => {
    const names = Array.from(new Set(units.map(u => u.property?.name).filter(Boolean))) as string[]
    return names.sort()
  }, [units])

  const typeOptions = useMemo(() => {
    const types = Array.from(new Set(units.map(u => (u.type || '').toLowerCase()).filter(Boolean))) as string[]
    return types.sort()
  }, [units])

  // Filtered unit list
  const filteredUnits = useMemo(() => {
    return units.filter(u => {
      if (propertyFilter !== 'all' && u.property?.name !== propertyFilter) {
        return false
      }
      if (typeFilter !== 'all' && (u.type || '').toLowerCase() !== typeFilter) {
        return false
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const num = (u.number || '').toLowerCase()
        const prop = (u.property?.name || '').toLowerCase()
        const owner = (u.owner?.name || '').toLowerCase()
        const type = (u.type || '').toLowerCase()
        return num.includes(q) || prop.includes(q) || owner.includes(q) || type.includes(q)
      }
      return true
    })
  }, [units, propertyFilter, typeFilter, searchTerm])

  return (
    <div className="gfh-portal-page gfh-vp-page" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`${portalPageCss}
        .gfh-vp-print-only { display: none; }

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

          nav, aside, header, .gfh-vp-noprint {
            display: none !important;
          }

          .gfh-portal-page, .gfh-vp-page {
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
          }

          .gfh-vp-printable {
            position: static !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }

          .gfh-vp-print-only {
            display: block !important;
          }

          .gfh-vp-letterhead {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-end !important;
            gap: 16px !important;
            padding-bottom: 14px !important;
            margin-bottom: 18px !important;
            border-bottom: 2px solid #0e5e48 !important;
          }

          .gfh-vp-brand-row {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
          }

          .gfh-vp-brand-mark {
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

          .gfh-vp-brand-text h2 {
            font-family: 'Playfair Display', Georgia, serif !important;
            font-size: 16px !important;
            font-weight: 800 !important;
            color: #0f172a !important;
            margin: 0 !important;
          }

          .gfh-vp-brand-text span {
            font-size: 9.5px !important;
            font-weight: 700 !important;
            color: #0e5e48 !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
          }

          .gfh-vp-print-only h1 {
            font-family: 'Playfair Display', Georgia, serif !important;
            font-size: 20px !important;
            font-weight: 800 !important;
            color: #0f172a !important;
            margin: 0 0 4px 0 !important;
            text-align: right !important;
          }

          .gfh-vp-print-only p {
            font-size: 10px !important;
            color: #64748b !important;
            margin: 0 !important;
            text-align: right !important;
          }

          .gfh-vp-print-summary {
            display: flex !important;
            gap: 24px !important;
            margin: 14px 0 16px 0 !important;
            padding: 10px 16px !important;
            background: #f8fafc !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 6px !important;
          }

          .gfh-vp-print-summary div {
            display: flex !important;
            flex-direction: column !important;
          }

          .gfh-vp-print-summary .gfh-vp-sum-label {
            font-size: 8.5px !important;
            font-weight: 700 !important;
            color: #475569 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
          }

          .gfh-vp-print-summary .gfh-vp-sum-value {
            font-family: 'Inter', sans-serif !important;
            font-size: 13.5px !important;
            font-weight: 800 !important;
            color: #0e5e48 !important;
          }

          .gfh-vp-print-footer {
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
      <div className="fade-in gfh-vp-noprint" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Vacant Property Report
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Live directory of available units, pricing, and potential rental capacity across all buildings
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => window.print()}
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

      {/* Printable area */}
      <div className="gfh-vp-printable">
        {/* Branded letterhead, shown only in print */}
        <div className="gfh-vp-print-only gfh-vp-letterhead">
          <div className="gfh-vp-brand-row">
            <div className="gfh-vp-brand-mark">G</div>
            <div className="gfh-vp-brand-text">
              <h2>GoFreeHold</h2>
              <span>Property Management & Real Estate</span>
            </div>
          </div>
          <div>
            <h1>Vacant Property Report</h1>
            <p>Generated on {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        {/* Summary strip (Print Only) */}
        <div className="gfh-vp-print-only gfh-vp-print-summary">
          <div>
            <span className="gfh-vp-sum-label">Total Vacant Units</span>
            <span className="gfh-vp-sum-value">{summaryStats.totalUnits} Units</span>
          </div>
          <div>
            <span className="gfh-vp-sum-label">Est. Potential Rent / Year</span>
            <span className="gfh-vp-sum-value">AED {Number(summaryStats.totalPotentialRent).toLocaleString()}</span>
          </div>
          <div>
            <span className="gfh-vp-sum-label">Buildings with Vacancy</span>
            <span className="gfh-vp-sum-value">{summaryStats.uniqueProperties} Buildings</span>
          </div>
          <div>
            <span className="gfh-vp-sum-label">Average Asking Rent</span>
            <span className="gfh-vp-sum-value">AED {Number(summaryStats.avgPrice).toLocaleString()} / yr</span>
          </div>
        </div>

        {/* Main Panel Content */}
        <div className="fade-in" style={{ ...panelStyle, minHeight: 400, padding: 24 }}>
          <span className="gfh-vp-noprint"><CornerBrackets /></span>

          {/* 4 Summary KPI Cards (Screen only) */}
          <div className="gfh-vp-noprint" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ padding: '16px 20px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748B' }}>
                Total Vacant Units
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0E5E48', marginTop: 4 }}>
                {summaryStats.totalUnits}
              </div>
              <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 2 }}>Ready for immediate lease</div>
            </div>

            <div style={{ padding: '16px 20px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#15803D' }}>
                Est. Potential Rent / Year
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#15803D', marginTop: 4 }}>
                AED {Number(summaryStats.totalPotentialRent).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div style={{ fontSize: 11.5, color: '#16A34A', marginTop: 2 }}>Total annual asking value</div>
            </div>

            <div style={{ padding: '16px 20px', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 10 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0369A1' }}>
                Properties With Vacancy
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0369A1', marginTop: 4 }}>
                {summaryStats.uniqueProperties}
              </div>
              <div style={{ fontSize: 11.5, color: '#0284C7', marginTop: 2 }}>Buildings with available units</div>
            </div>

            <div style={{ padding: '16px 20px', background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: 10 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#7E22CE' }}>
                Average Asking Rent
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#7E22CE', marginTop: 4 }}>
                AED {Number(summaryStats.avgPrice).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div style={{ fontSize: 11.5, color: '#9333EA', marginTop: 2 }}>Per unit per annum</div>
            </div>
          </div>

          {/* Filter & Search Bar (Screen only) */}
          <div className="gfh-vp-noprint" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18, background: '#F8FAFC', padding: '12px 16px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
              {/* Property Selector */}
              <select
                value={propertyFilter}
                onChange={e => setPropertyFilter(e.target.value)}
                style={{
                  padding: '7px 12px',
                  fontSize: 12.5,
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#334155',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="all">All Buildings ({summaryStats.totalUnits})</option>
                {propertyOptions.map(prop => (
                  <option key={prop} value={prop}>{prop}</option>
                ))}
              </select>

              {/* Type Selector */}
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                style={{
                  padding: '7px 12px',
                  fontSize: 12.5,
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#334155',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="all">All Unit Types</option>
                {typeOptions.map(t => (
                  <option key={t} value={t}>{t.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Search Bar */}
            <div style={{ position: 'relative', minWidth: 260, flex: '1 1 240px', maxWidth: 360 }}>
              <input
                type="text"
                placeholder="Search unit #, building, owner, type..."
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
          </div>

          {isLoading ? (
            <div className="gfh-vp-noprint" style={{ textAlign: 'center', padding: 60 }}>
              <span className="spinner" /> Loading vacant units...
            </div>
          ) : filteredUnits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>No vacant units found matching the selected criteria.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${THEME.border}`, background: '#F8FAFC' }}>
                    {['Unit Number', 'Property / Building', 'Owner / Landlord', 'Type & Specs', 'Asking Rent (AED / yr)', 'Status'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUnits.map(unit => {
                    return (
                      <tr key={unit.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                        <td style={{ ...tdStyle, fontWeight: 700 }}>
                          <span style={{ color: '#0E5E48', fontSize: 13.5 }}>Unit {unit.number}</span>
                          <span style={{ fontWeight: 500, fontSize: 12, color: THEME.textMuted, display: 'block' }}>
                            Floor {unit.floor}
                          </span>
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 600, color: THEME.ink }}>
                          {unit.property?.name || 'N/A'}
                        </td>
                        <td style={{ ...tdStyle, color: '#475569' }}>
                          {unit.owner?.name || 'N/A'}
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              background: '#F1F5F9',
                              color: '#334155',
                              border: '1px solid #CBD5E1',
                              textTransform: 'uppercase',
                            }}>
                              {unit.type}
                            </span>
                            {unit.size && (
                              <span style={{ fontSize: 11.5, color: '#64748B' }}>
                                {unit.size} sq.ft
                              </span>
                            )}
                            {unit.furnished !== undefined && (
                              <span style={{
                                fontSize: 10.5,
                                padding: '1px 6px',
                                borderRadius: 4,
                                background: unit.furnished ? '#EFF6FF' : '#F8FAFC',
                                color: unit.furnished ? '#1D4ED8' : '#94A3B8',
                                border: `1px solid ${unit.furnished ? '#BFDBFE' : '#E2E8F0'}`,
                              }}>
                                {unit.furnished ? 'Furnished' : 'Unfurnished'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ ...tdStyle, fontWeight: 700, color: '#0E5E48', fontSize: 13.5 }}>
                          AED {Number(unit.price).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          <span style={{ fontSize: 11, fontWeight: 500, color: '#64748B', display: 'block' }}>/ year</span>
                        </td>
                        <td style={tdStyle}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 9px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            background: '#DCFCE7',
                            color: '#15803D',
                            border: '1px solid #BBF7D0',
                            whiteSpace: 'nowrap',
                          }}>
                            AVAILABLE
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer, shown only in print */}
        <div className="gfh-vp-print-only gfh-vp-print-footer">
          <span>GoFreeHold Property Management — Vacant Property Capacity Report</span>
          <span>Confidential — For Authorized Personnel Only</span>
        </div>
      </div>
    </div>
  )
}


