import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { THEME, Icon, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle } from '../../components/gfh/adminTheme'

interface Receivable {
  contract_id: number
  unit: string
  building: string
  tenant: string
  rent_outstanding: number
  service_outstanding: number
  total_payable: number
}

export default function ReceivablesSummary() {
  const [receivables, setReceivables] = useState<Receivable[]>([])
  const [grandTotal, setGrandTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/admin/payables/summary')
      setReceivables(res.data?.data?.payables || [])
      setGrandTotal(res.data.data.grand_total)
    } catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Receivables &amp; Payables
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Outstanding dues across all active contracts
          </p>
        </div>
      </div>

      <div className="fade-in gfh-portal-stat" style={{ position: 'relative', background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 0, padding: '26px 30px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <CornerBrackets />
        <div>
          <p style={{ fontSize: 12.5, fontWeight: 800, color: THEME.textMuted, margin: '0 0 8px', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
            Total Outstanding Receivables
          </p>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 700, color: '#dc2626' }}>
            AED {Number(grandTotal).toLocaleString()}
          </div>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 0, background: '#991b1b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon path="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" size={20} />
        </div>
      </div>

      <div className="fade-in" style={{ ...panelStyle, minHeight: 300 }}>
        <CornerBrackets />
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : receivables.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 14.5, color: THEME.textMuted, fontWeight: 600 }}>
              No outstanding receivables found.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  {['Contract', 'Unit / Building', 'Tenant', 'Rent Due (AED)', 'Service Due (AED)', 'Total Outstanding'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {receivables.map(r => (
                  <tr key={r.contract_id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                    <td style={{ ...tdStyle, fontWeight: 700, color: THEME.purple }}>
                      GFH-{String(r.contract_id).padStart(5, '0')}
                    </td>
                    <td style={tdStyle}>
                      {r.unit}
                      <div style={{ fontSize: 12.5, color: THEME.textMuted, fontWeight: 500, marginTop: 2 }}>
                        {r.building}
                      </div>
                    </td>
                    <td style={tdStyle}>{r.tenant}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: r.rent_outstanding > 0 ? '#991b1b' : '#065f46' }}>
                      {Number(r.rent_outstanding).toLocaleString()}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: r.service_outstanding > 0 ? '#b45309' : '#065f46' }}>
                      {Number(r.service_outstanding).toLocaleString()}
                    </td>
                    <td style={tdStyle}>
                      <strong style={{ fontSize: 16.5, fontWeight: 800, color: '#dc2626' }}>
                        AED {Number(r.total_payable).toLocaleString()}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
