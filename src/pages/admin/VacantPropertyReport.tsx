import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { THEME, Icon, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'

interface VacantUnit {
  id: number
  number: string
  floor: number
  type: string
  price: number
  property?: { name: string }
  owner?: { name: string }
}

const icons = {
  printer: 'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6v-8z',
}

export default function VacantPropertyReport() {
  const [units, setUnits] = useState<VacantUnit[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchVacantUnits()
  }, [])

  const fetchVacantUnits = async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/admin/reports/vacant-properties')
      setUnits(res.data?.data?.units || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="gfh-portal-page gfh-vp-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{`${portalPageCss}
        /* Screen-only print letterhead — hidden normally, shown only when printing */
        .gfh-vp-print-only {
          display: none;
        }

        /* ---- Print-only styles: premium branded, purple-accented professional report ---- */
        @media print {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;

          body * {
            visibility: hidden;
          }
          .gfh-vp-printable, .gfh-vp-printable * {
            visibility: visible;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .gfh-vp-printable {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
          .gfh-vp-noprint {
            display: none !important;
          }

          /* Letterhead */
          .gfh-vp-print-only {
            display: block !important;
          }
          .gfh-vp-letterhead {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-end !important;
            gap: 16px !important;
            padding-bottom: 14px !important;
            margin-bottom: 4px !important;
            border-bottom: 3px solid #115e59 !important;
          }
          .gfh-vp-brand-row {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
          }
          .gfh-vp-brand-mark {
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
          .gfh-vp-brand-text h2 {
            font-family: 'Playfair Display', Georgia, serif !important;
            font-size: 15px !important;
            font-weight: 800 !important;
            color: #1c1917 !important;
            margin: 0 !important;
            letter-spacing: 0.2px !important;
          }
          .gfh-vp-brand-text span {
            font-size: 9px !important;
            font-weight: 700 !important;
            color: #0f766e !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
          }
          .gfh-vp-print-only h1 {
            font-family: 'Playfair Display', Georgia, serif !important;
            font-size: 22px !important;
            font-weight: 800 !important;
            color: #1c1917 !important;
            margin: 0 0 3px 0 !important;
            text-align: right !important;
          }
          .gfh-vp-print-only p {
            font-size: 10px !important;
            color: #6b6478 !important;
            margin: 0 !important;
            text-align: right !important;
          }

          /* Summary strip */
          .gfh-vp-print-summary {
            display: flex !important;
            gap: 26px !important;
            margin: 16px 0 18px 0 !important;
            padding: 11px 16px !important;
            background: #f0fdfa !important;
            border: 1px solid #ded0f7 !important;
            border-radius: 4px !important;
          }
          .gfh-vp-print-summary div {
            display: flex !important;
            flex-direction: column !important;
          }
          .gfh-vp-print-summary .gfh-vp-sum-label {
            font-size: 8.5px !important;
            font-weight: 700 !important;
            color: #0f766e !important;
            text-transform: uppercase !important;
            letter-spacing: 0.6px !important;
          }
          .gfh-vp-print-summary .gfh-vp-sum-value {
            font-family: 'Playfair Display', Georgia, serif !important;
            font-size: 15px !important;
            font-weight: 800 !important;
            color: #1c1917 !important;
          }

          /* Table */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            border-radius: 4px !important;
            overflow: hidden !important;
          }
          thead tr {
            background: #2d1657 !important;
          }
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
          tr {
            border-bottom: 1px solid #e5e7eb !important;
          }
          tbody tr:nth-child(even) {
            background: #faf6ff !important;
          }

          /* Footer */
          .gfh-vp-print-footer {
            display: flex !important;
            justify-content: space-between !important;
            margin-top: 22px !important;
            padding-top: 10px !important;
            border-top: 1px solid #e5e7eb !important;
            font-size: 8.5px !important;
            color: #a89bc4 !important;
            letter-spacing: 0.3px !important;
          }

          @page {
            margin: 1.4cm;
          }
        }
      `}</style>

      {/* Hero Header — screen only */}
      <div className="fade-in gfh-vp-noprint" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Vacant Property Report
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            All currently available units across buildings
          </p>
        </div>
        <button
          className="gfh-portal-btn"
          onClick={() => window.print()}
          style={{
            ...ghostBtnStyle,
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.35)',
          }}
        >
          <Icon path={icons.printer} size={16} />
          Print Report
        </button>
      </div>

      {/* Printable area — includes a print-only plain letterhead + the table */}
      <div className="gfh-vp-printable">
        {/* Branded letterhead, shown only in print */}
        <div className="gfh-vp-print-only gfh-vp-letterhead">
          <div className="gfh-vp-brand-row">
            <div className="gfh-vp-brand-mark">G</div>
            <div className="gfh-vp-brand-text">
              <h2>GoFreeHold</h2>
              <span>Property Management</span>
            </div>
          </div>
          <div>
            <h1>Vacant Property Report</h1>
            <p>Generated {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        {/* Summary strip, shown only in print */}
        <div className="gfh-vp-print-only gfh-vp-print-summary">
          <div>
            <span className="gfh-vp-sum-label">Total Vacant Units</span>
            <span className="gfh-vp-sum-value">{units.length}</span>
          </div>
        </div>

        <div className="fade-in" style={{ ...panelStyle, minHeight: 400 }}>
          <span className="gfh-vp-noprint"><CornerBrackets /></span>
          {isLoading ? (
            <div className="gfh-vp-noprint" style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /> Loading...</div>
          ) : units.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500 }}>No vacant units found.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                    {['Unit Number', 'Property', 'Owner', 'Type', 'Price (AED)'].map(h => (
                      <th key={h} style={thStyle}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {units.map(unit => (
                    <tr key={unit.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>
                        {unit.number} <span style={{ fontWeight: 500, fontSize: 12.5, color: THEME.textMuted }}>(Fl: {unit.floor})</span>
                      </td>
                      <td style={tdStyle}>{unit.property?.name || 'N/A'}</td>
                      <td style={tdStyle}>{unit.owner?.name || 'N/A'}</td>
                      <td style={{ ...tdStyle, textTransform: 'capitalize' }}>{unit.type}</td>
                      <td style={{ ...tdStyle, fontWeight: 700, color: THEME.purple }}>{Number(unit.price).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer, shown only in print */}
        <div className="gfh-vp-print-only gfh-vp-print-footer">
          <span>GoFreeHold Property Management — Confidential Report</span>
          <span>Generated via Admin Portal</span>
        </div>
      </div>
    </div>
  )
}
