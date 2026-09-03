import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { formatDate } from '../../utils/formatDate'
import { THEME, Icon, CornerBrackets, portalPageCss, heroStyle, panelStyle, thStyle, tdStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'

interface LedgerEntry {
  id: number
  contract_id: number
  date: string
  description?: string
  debit: number
  credit: number
  deleted_at?: string
  contract?: {
    unit?: { number: string; property?: { name: string } }
    tenant?: { name: string }
  }
}

interface LedgerSummary {
  total_debit: number
  total_credit: number
  total_balance: number
}

const icons = {
  alert: 'M12 9v4M12 17h.01M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0z',
  trash: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z',
  close: 'M18 6 6 18M6 6l12 12',
  check: 'M20 6 9 17l-5-5',
  debit: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
}

const filterInputStyle: React.CSSProperties = {
  padding: '10px 13px',
  border: `1px solid ${THEME.border}`,
  borderRadius: 0,
  background: '#ffffff',
  color: THEME.ink,
  fontSize: 13,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 13px',
  border: `1px solid ${THEME.border}`,
  borderRadius: 0,
  fontSize: 13.5,
  color: THEME.ink,
  background: '#ffffff',
  boxSizing: 'border-box',
  resize: 'vertical',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: THEME.purple,
  textTransform: 'uppercase',
  letterSpacing: '0.3px',
  marginBottom: 6,
}

function StatCard({ label, value, color, icon, iconBg }: { label: string; value: string; color: string; icon: string; iconBg: string }) {
  return (
    <div className="gfh-portal-stat" style={{ position: 'relative', flex: '1 1 200px', padding: 20, background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 0 }}>
      <CornerBrackets />
      <div style={{ width: 40, height: 40, borderRadius: 0, background: iconBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <Icon path={icon} size={18} />
      </div>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: 2 }}>{label}</div>
    </div>
  )
}

export default function RentLedger() {
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [summary, setSummary] = useState<LedgerSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({ contract_id: '', month: '', property_id: '', tenant_id: '' })
  const [deleteModal, setDeleteModal] = useState<LedgerEntry | null>(null)
  const [deleteReason, setDeleteReason] = useState('')

  useEffect(() => { fetchLedger() }, [filters])

  const fetchLedger = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.contract_id) params.append('contract_id', filters.contract_id)
      if (filters.month) params.append('month', filters.month)
      if (filters.property_id) params.append('property_id', filters.property_id)
      if (filters.tenant_id) params.append('tenant_id', filters.tenant_id)
      // Plan path: /api/rent-ledger?month=&property_id=&tenant_id=
      const res = await api.get(`/admin/rent-ledger?${params.toString()}`)
      setEntries(res.data?.data?.entries || [])
      setSummary(res.data.data.summary)
    } catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  const handleSoftDelete = async () => {
    if (!deleteModal || !deleteReason.trim()) return
    try {
      await api.delete(`/admin/ledger/${deleteModal.id}/soft-delete`, { data: { reason: deleteReason } })
      setDeleteModal(null)
      setDeleteReason('')
      fetchLedger()
    } catch (err) { alert('Error deleting ledger entry') }
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>
      <style>{`
        @keyframes gfhOverlayFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes gfhModalPop { from { opacity: 0; transform: scale(0.94) translateY(14px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .gfh-portal-page .gfh-filter-input::placeholder { color: rgba(255,255,255,0.55); }
        .gfh-portal-page .gfh-filter-input:focus { outline: none; background: rgba(255,255,255,0.16); border-color: ${THEME.violetLight}; }
      `}</style>

      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Rent Ledger
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Double-entry rent transactions (debit / credit)
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            className="gfh-filter-input"
            placeholder="Contract ID"
            value={filters.contract_id}
            onChange={e => setFilters({ ...filters, contract_id: e.target.value })}
            style={{ ...filterInputStyle, width: 120 }}
          />
          <input
            className="gfh-filter-input"
            placeholder="Property ID"
            value={filters.property_id}
            onChange={e => setFilters({ ...filters, property_id: e.target.value })}
            style={{ ...filterInputStyle, width: 120 }}
          />
          <input
            className="gfh-filter-input"
            placeholder="Tenant ID"
            value={filters.tenant_id}
            onChange={e => setFilters({ ...filters, tenant_id: e.target.value })}
            style={{ ...filterInputStyle, width: 110 }}
          />
          <input
            type="month"
            className="gfh-filter-input"
            value={filters.month}
            onChange={e => setFilters({ ...filters, month: e.target.value })}
            style={{ ...filterInputStyle, width: 150 }}
          />
        </div>
      </div>

      {summary && (
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginBottom: 22 }}>
          <StatCard
            label="Total Debit (Due)"
            value={`AED ${Number(summary.total_debit).toLocaleString()}`}
            color="#fff"
            icon={icons.debit}
            iconBg="#991b1b"
          />
          <StatCard
            label="Total Credit (Paid)"
            value={`AED ${Number(summary.total_credit).toLocaleString()}`}
            color="#fff"
            icon={icons.check}
            iconBg="#065f46"
          />
          <StatCard
            label="Outstanding Balance"
            value={`AED ${Number(summary.total_balance).toLocaleString()}`}
            color="#fff"
            icon={icons.debit}
            iconBg="#b45309"
          />
        </div>
      )}

      <div className="fade-in" style={{ ...panelStyle, minHeight: 300 }}>
        <CornerBrackets />
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
        ) : entries.length === 0 ? (
          <p style={{ fontSize: 14, color: THEME.textMuted, fontWeight: 500, textAlign: 'center', padding: 30 }}>No ledger entries found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  {['Contract', 'Unit / Tenant', 'Date', 'Description', 'Debit (AED)', 'Credit (AED)', 'Actions'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr
                    key={entry.id}
                    className="gfh-portal-row"
                    style={{
                      borderBottom: `1px solid ${THEME.border}`,
                      opacity: entry.deleted_at ? 0.42 : 1,
                    }}
                  >
                    <td style={{ ...tdStyle, fontWeight: 700 }}>GFH-{String(entry.contract_id).padStart(5, '0')}</td>
                    <td style={tdStyle}>
                      {entry.contract?.unit?.number}
                      <span style={{ display: 'block', fontSize: 11.5, color: THEME.textMuted, marginTop: 2 }}>
                        {entry.contract?.tenant?.name}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{formatDate(entry.date)}</td>
                    <td style={tdStyle}>{entry.description || '—'}</td>
                    <td style={{ ...tdStyle, color: '#991b1b', fontWeight: 700 }}>{Number(entry.debit).toLocaleString()}</td>
                    <td style={{ ...tdStyle, color: '#065f46', fontWeight: 700 }}>{Number(entry.credit).toLocaleString()}</td>
                    <td style={tdStyle}>
                      {!entry.deleted_at && (
                        <button
                          onClick={() => setDeleteModal(entry)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                          background: '#991b1b', border: 'none', color: '#fff',
                          borderRadius: 0, fontWeight: 700, fontSize: 11, cursor: 'pointer',
                          }}
                        >
                          <Icon path={icons.trash} size={13} />
                          Soft Delete
                        </button>
                      )}
                      {entry.deleted_at && (
                        <span style={{ fontSize: 11.5, color: THEME.textMuted, fontStyle: 'italic' }}>Deleted</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(27, 14, 51, 0.55)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          animation: 'gfhOverlayFade 0.2s ease',
        }}>
          <div style={{
            position: 'relative', width: 440, maxWidth: '92vw', background: '#ffffff', borderRadius: 0,
            padding: 28, border: `1px solid ${THEME.border}`,
            boxShadow: '0 24px 60px -12px rgba(27, 14, 51, 0.5)',
            animation: 'gfhModalPop 0.28s cubic-bezier(.2,.8,.2,1)',
          }}>
            <CornerBrackets />
            <h2 style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: "'Playfair Display', Georgia, serif", fontSize: 19, fontWeight: 700,
              color: '#dc2626', margin: '0 0 8px 0',
            }}>
              <Icon path={icons.alert} size={19} />
              Soft Delete Ledger Entry
            </h2>
            <p style={{ fontSize: 13, color: THEME.textMuted, marginBottom: 16, lineHeight: 1.5 }}>
              This entry will be marked as deleted and an audit log will be created. It can never be permanently erased.
              <br />
              <strong style={{ color: THEME.purple }}>
                Date: {formatDate(deleteModal.date)} | Debit: AED {Number(deleteModal.debit).toLocaleString()} | Credit: AED {Number(deleteModal.credit).toLocaleString()}
              </strong>
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Reason for deletion (required)</label>
              <textarea
                style={inputStyle}
                rows={3}
                placeholder="Explain why this entry is being deleted..."
                value={deleteReason}
                onChange={e => setDeleteReason(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setDeleteModal(null); setDeleteReason('') }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                  background: '#f1f5f9', border: `1px solid ${THEME.border}`, color: THEME.textMuted,
                  borderRadius: 0, fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
                }}
              >
                <Icon path={icons.close} size={15} />
                Cancel
              </button>
              <button
                onClick={handleSoftDelete}
                disabled={deleteReason.trim().length < 5}
                style={{
                  ...ghostBtnStyle,
                  background: deleteReason.trim().length < 5 ? '#fca5a5' : '#991b1b',
                  opacity: deleteReason.trim().length < 5 ? 0.5 : 1,
                  cursor: deleteReason.trim().length < 5 ? 'not-allowed' : 'pointer',
                }}
              >
                <Icon path={icons.check} size={15} />
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
