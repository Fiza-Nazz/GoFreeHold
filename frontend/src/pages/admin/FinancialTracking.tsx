import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { THEME, Icon, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'

interface FinancialEntry {
  id: number
  type: 'income' | 'expense' | 'loan'
  category: string
  amount: number
  entry_date: string
  description?: string
  recorded_by?: { name: string }
}

interface FinancialSummary {
  total_income: number
  total_expense: number
  total_loan: number
  net_cash_flow: number
}

const TYPE_STYLE: Record<string, { bg: string; color: string; prefix: string; border: string }> = {
  income:  { bg: '#f0fdf4', color: '#065f46', prefix: '+', border: '#bbf7d0' },
  expense: { bg: '#fef2f2', color: '#991b1b', prefix: '-', border: '#fecaca' },
  loan:    { bg: '#fffbeb', color: '#b45309', prefix: '',  border: '#fde68a' },
}

const inputStyle: React.CSSProperties = {
  background: '#ffffff',
  border: `1px solid ${THEME.border}`,
  borderRadius: 0,
  color: THEME.ink,
  fontSize: 14,
  fontWeight: 600,
  padding: '10px 12px',
  width: '100%',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12.5,
  fontWeight: 800,
  color: THEME.purple,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
}

const btnTint = {
  delete: { bg: '#991b1b', color: '#ffffff', border: 'none' },
  cancel: { bg: '#f1f5f9', color: THEME.textMuted, border: `1px solid ${THEME.border}` },
}

function StatCard({ label, value, color, icon, iconBg, delay }: { label: string; value: string; color: string; icon: string; iconBg: string; delay?: string }) {
  return (
    <div className="gfh-portal-stat" style={{ position: 'relative', background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 0, padding: 20, animationDelay: delay }}>
      <CornerBrackets />
      <div style={{ width: 40, height: 40, borderRadius: 0, background: iconBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <Icon path={icon} size={18} />
      </div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: THEME.textMuted, letterSpacing: '0.4px', textTransform: 'uppercase', marginTop: 6 }}>{label}</div>
    </div>
  )
}

export default function FinancialTracking() {
  const [entries, setEntries] = useState<FinancialEntry[]>([])
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    type: 'income',
    category: '',
    amount: '',
    entry_date: new Date().toISOString().split('T')[0],
    description: '',
  })

  useEffect(() => { fetchEntries() }, [typeFilter])

  const fetchEntries = async () => {
    setIsLoading(true)
    try {
      const url = typeFilter ? `/admin/financial-entries?type=${typeFilter}` : '/admin/financial-entries'
      const res = await api.get(url)
      setEntries(res.data?.data?.entries || [])
      setSummary(res.data.data.summary)
    } catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/admin/financial-entries', formData)
      setIsModalOpen(false)
      fetchEntries()
      setFormData({
        type: 'income',
        category: '',
        amount: '',
        entry_date: new Date().toISOString().split('T')[0],
        description: '',
      })
    } catch (err) { alert('Error recording entry') }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Delete this entry?')) {
      await api.delete(`/admin/financial-entries/${id}`)
      fetchEntries()
    }
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Financial Tracking
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Track income, expenses, and loans tied to accounting ledger
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            style={{
              borderRadius: 0,
              border: `1px solid ${THEME.border}`,
              background: '#ffffff',
              color: THEME.ink,
              fontSize: 13.5,
              fontWeight: 600,
              padding: '10px 14px',
            }}
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="loan">Loan</option>
          </select>
          <button
            className="gfh-portal-btn"
            onClick={() => setIsModalOpen(true)}
            style={ghostBtnStyle}
          >
            <Icon path="M12 5v14M5 12h14" size={15} />
            Add entry
          </button>
        </div>
      </div>

      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
          <StatCard
            label="Total income"
            value={`AED ${Number(summary.total_income).toLocaleString()}`}
            color="#fff"
            icon="M12 19V5M5 12l7-7 7 7"
            iconBg="#065f46"
          />
          <StatCard
            label="Total expense"
            value={`AED ${Number(summary.total_expense).toLocaleString()}`}
            color="#fff"
            icon="M12 5v14M19 12l-7 7-7-7"
            iconBg="#991b1b"
            delay="0.1s"
          />
          <StatCard
            label="Loans"
            value={`AED ${Number(summary.total_loan).toLocaleString()}`}
            color="#fff"
            icon="M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"
            iconBg="#b45309"
            delay="0.2s"
          />
          <StatCard
            label="Net cash flow"
            value={`AED ${Number(summary.net_cash_flow).toLocaleString()}`}
            color="#fff"
            icon="M3 3v18h18"
            iconBg={summary.net_cash_flow >= 0 ? '#065f46' : '#991b1b'}
            delay="0.3s"
          />
        </div>
      )}

      <div className="fade-in" style={{ ...panelStyle, minHeight: 350 }}>
        <CornerBrackets />
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontSize: 14.5, color: THEME.textMuted, fontWeight: 600 }}>No financial entries found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  {['Date', 'Type', 'Category', 'Description', 'Amount (AED)', 'Recorded by', 'Actions'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => {
                  const st = TYPE_STYLE[entry.type]
                  return (
                    <tr key={entry.id} className="gfh-portal-row" style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={tdStyle}>{entry.entry_date}</td>
                      <td style={tdStyle}>
                        <span style={{ backgroundColor: st.bg, color: st.color, border: `1px solid ${st.border}`, padding: '4px 11px', borderRadius: 0, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.3px' }}>
                          {(entry.type || '—').toString().toUpperCase()}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>{entry.category}</td>
                      <td style={{ ...tdStyle, color: THEME.textMuted }}>{entry.description || '-'}</td>
                      <td style={{ ...tdStyle, fontWeight: 800, color: st.color }}>
                        {st.prefix} AED {Number(entry.amount).toLocaleString()}
                      </td>
                      <td style={{ ...tdStyle, color: THEME.textMuted }}>{entry.recorded_by?.name || '-'}</td>
                      <td style={tdStyle}>
                        <button
                          className="gfh-portal-btn"
                          style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700, borderRadius: 0, backgroundColor: btnTint.delete.bg, color: btnTint.delete.color, border: btnTint.delete.border, cursor: 'pointer' }}
                          onClick={() => handleDelete(entry.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,61,58,0.55)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div
            className="fade-in"
            style={{
              position: 'relative',
              width: 480,
              padding: 30,
              background: '#ffffff',
              borderRadius: 0,
              border: `1px solid ${THEME.border}`,
              boxShadow: '0 20px 50px rgba(15,61,58,0.3)',
            }}
          >
            <CornerBrackets />
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 20,
                color: THEME.ink,
              }}
            >
              Add financial entry
            </h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select style={inputStyle} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })}>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                    <option value="loan">Loan</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Category</label>
                  <input style={inputStyle} placeholder="e.g. Maintenance, Salary" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Amount (AED)</label>
                  <input type="number" style={inputStyle} value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
                </div>
                <div>
                  <label style={labelStyle}>Entry date</label>
                  <input type="date" style={inputStyle} value={formData.entry_date} onChange={e => setFormData({ ...formData, entry_date: e.target.value })} required />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea rows={2} style={{ ...inputStyle, resize: 'vertical' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="gfh-portal-btn"
                  onClick={() => setIsModalOpen(false)}
                  style={{ borderRadius: 0, fontWeight: 700, fontSize: 13.5, padding: '10px 18px', backgroundColor: btnTint.cancel.bg, color: btnTint.cancel.color, border: btnTint.cancel.border, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gfh-portal-btn"
                  style={ghostBtnStyle}
                >
                  Save entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
