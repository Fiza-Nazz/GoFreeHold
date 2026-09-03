import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { THEME, Icon, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle } from '../../components/gfh/adminTheme'

interface CategorizedReceivable {
  contract_id: number
  status: string
  tenant_type: 'current' | 'previous'
  tenant_name: string
  owner_id: number
  owner_name: string
  unit_number: string
  building_name: string
  outstanding: number
}

interface Summary {
  total_current: number
  total_previous: number
  grand_total: number
}

interface Owner { id: number; name: string }

const selectStyle: React.CSSProperties = {
  borderRadius: 0,
  border: '1px solid rgba(255,255,255,0.35)',
  background: 'rgba(255,255,255,0.15)',
  color: '#fff',
  fontSize: 13.5,
  fontWeight: 600,
  padding: '10px 14px',
}

function StatCard({ label, value, color, icon, iconBg, delay }: { label: string; value: string; color: string; icon: string; iconBg: string; delay?: string }) {
  return (
    <div className="gfh-portal-stat" style={{ position: 'relative', background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 0, padding: 22, animationDelay: delay }}>
      <CornerBrackets />
      <div style={{ width: 40, height: 40, borderRadius: 0, background: iconBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Icon path={icon} size={18} />
      </div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted, letterSpacing: '0.4px', textTransform: 'uppercase', marginTop: 6 }}>{label}</div>
    </div>
  )
}

export default function OutstandingReceivables() {
  const [items, setItems] = useState<CategorizedReceivable[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [owners, setOwners] = useState<Owner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({ owner_id: '', tenant_type: '' })

  useEffect(() => { fetchOwners() }, [])
  useEffect(() => { fetchReport() }, [filters])

  const fetchOwners = async () => {
    try {
      const res = await api.get('/admin/properties/owners')
      setOwners(res.data?.data?.owners || [])
    } catch (err) { console.error(err) }
  }

  const fetchReport = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.owner_id) params.append('owner_id', filters.owner_id)
      if (filters.tenant_type) params.append('tenant_type', filters.tenant_type)
      const res = await api.get(`/admin/receivables/categorized?${params.toString()}`)
      setItems(res.data?.data?.receivables || [])
      setSummary(res.data.data.summary)
    } catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Categorized Outstanding Receivables
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Track current vs. previous tenant balances categorized by property owner
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select
            value={filters.owner_id}
            onChange={e => setFilters({ ...filters, owner_id: e.target.value })}
            style={selectStyle}
          >
            <option value="" style={{ color: '#111' }}>All Property Owners</option>
            {owners.map(o => <option key={o.id} value={o.id} style={{ color: '#111' }}>{o.name}</option>)}
          </select>
          <select
            value={filters.tenant_type}
            onChange={e => setFilters({ ...filters, tenant_type: e.target.value })}
            style={selectStyle}
          >
            <option value="" style={{ color: '#111' }}>All Tenants</option>
            <option value="current" style={{ color: '#111' }}>Current Tenants</option>
            <option value="previous" style={{ color: '#111' }}>Previous / Vacated Tenants</option>
          </select>
        </div>
      </div>

      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
          <StatCard
            label="Current Tenants Due"
            value={`AED ${Number(summary.total_current).toLocaleString()}`}
            color="#1d4ed8"
            icon="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
            iconBg="linear-gradient(135deg, #60a5fa, #1d4ed8)"
          />
          <StatCard
            label="Previous Tenants Due"
            value={`AED ${Number(summary.total_previous).toLocaleString()}`}
            color="#c2410c"
            icon="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
            iconBg="linear-gradient(135deg, #fb923c, #c2410c)"
            delay="0.1s"
          />
          <StatCard
            label="Grand Total Outstanding"
            value={`AED ${Number(summary.grand_total).toLocaleString()}`}
            color="#dc2626"
            icon="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
            iconBg="linear-gradient(135deg, #f87171, #b91c1c)"
            delay="0.2s"
          />
        </div>
      )}

      <div className="fade-in" style={{ ...panelStyle, minHeight: 350 }}>
        <CornerBrackets />
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 14.5, color: THEME.textMuted, fontWeight: 600 }}>No categorized receivables match the filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  {['Contract', 'Tenant', 'Type', 'Owner', 'Unit / Building', 'Outstanding'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                    <td style={{ ...tdStyle, fontWeight: 700, color: THEME.purple }}>GFH-{String(item.contract_id).padStart(5,'0')}</td>
                    <td style={tdStyle}>{item.tenant_name}</td>
                    <td style={tdStyle}>
                      <span style={{
                        backgroundColor: item.tenant_type === 'current' ? '#dbeafe' : '#fef3c7',
                        color: item.tenant_type === 'current' ? '#1e40af' : '#92400e',
                        padding: '4px 11px', borderRadius: 0, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.3px'
                      }}>
                        {(item.tenant_type || '—').toString().toUpperCase()}
                      </span>
                    </td>
                    <td style={tdStyle}>{item.owner_name}</td>
                    <td style={tdStyle}>
                      {item.unit_number} <span style={{ fontSize: 12.5, color: THEME.textMuted, fontWeight: 500 }}>({item.building_name})</span>
                    </td>
                    <td style={tdStyle}>
                      <strong style={{ color: '#dc2626', fontSize: 16.5, fontWeight: 800 }}>AED {Number(item.outstanding).toLocaleString()}</strong>
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
