import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { formatDate } from '../../utils/formatDate'
import { THEME, Icon, CornerBrackets, portalPageCss, heroStyle, panelStyle, ghostBtnStyle } from '../../components/gfh/adminTheme'

interface CallLog {
  id: number
  contract_id: number
  date: string
  remark: string
  logged_by?: { id: number; name: string }
}

const icons = {
  plus: 'M12 5v14M5 12h14',
}

export default function ContractCallLogPage() {
  const [logs, setLogs] = useState<CallLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [contractIdFilter, setContractIdFilter] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({ contract_id: '', date: '', remark: '' })

  useEffect(() => { fetchLogs() }, [contractIdFilter])

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const url = contractIdFilter ? `/admin/call-logs?contract_id=${contractIdFilter}` : '/admin/call-logs'
      const res = await api.get(url)
      setLogs(res.data.data.logs)
    } catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/admin/call-logs', formData)
      setIsFormOpen(false)
      fetchLogs()
      setFormData({ contract_id: '', date: '', remark: '' })
    } catch (err) { alert('Error logging call') }
  }

  const deleteLog = async (id: number) => {
    if (confirm('Delete this call log?')) {
      await api.delete(`/admin/call-logs/${id}`)
      fetchLogs()
    }
  }

  const inputStyle: React.CSSProperties = {
    borderRadius: 0,
    background: '#faf8ff',
    color: THEME.ink,
    border: `1px solid ${THEME.border}`,
    width: '100%',
    padding: '9px 11px',
    fontSize: 13,
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 10.5,
    fontWeight: 700,
    color: THEME.purpleMid,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    marginBottom: 5,
    display: 'block',
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Contract Call Logs
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Log all calls and communication related to contracts
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            placeholder="Filter by Contract ID"
            value={contractIdFilter}
            onChange={e => setContractIdFilter(e.target.value)}
            style={{
              width: 150,
              padding: '10px 12px',
              borderRadius: 0,
              border: `1px solid ${THEME.border}`,
              background: '#ffffff',
              color: THEME.ink,
              fontSize: 13,
            }}
          />
          <button className="gfh-portal-btn" onClick={() => setIsFormOpen(true)} style={ghostBtnStyle}>
            <Icon path={icons.plus} size={16} />
            Log Call
          </button>
        </div>
      </div>

      <div className="fade-in" style={{ ...panelStyle, minHeight: 320 }}>
        <CornerBrackets />
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 32 }}><span className="spinner" /></div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: THEME.textMuted, fontWeight: 600, fontSize: 13.5 }}>No call logs found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {logs.map(log => (
              <div
                key={log.id}
                className="gfh-portal-stat"
                style={{
                  position: 'relative',
                  padding: 14,
                  backgroundColor: '#fff',
                  borderRadius: 0,
                  border: `1px solid ${THEME.border}`,
                  borderLeft: '4px solid #075985',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11.5, color: THEME.textMuted, fontWeight: 700 }}>Contract: GFH-{String(log.contract_id).padStart(5,'0')}</span>
                    <span style={{ fontSize: 11.5, color: THEME.textMuted, fontWeight: 700 }}>{formatDate(log.date)}</span>
                    {log.logged_by && <span style={{ fontSize: 11.5, color: THEME.textMuted, fontWeight: 700 }}>By: {log.logged_by.name}</span>}
                  </div>
                  <p style={{ fontSize: 13, color: THEME.ink, margin: 0, fontWeight: 500 }}>{log.remark}</p>
                </div>
                <button
                  className="gfh-portal-btn"
                  onClick={() => deleteLog(log.id)}
                  style={{
                    padding: '4px 10px',
                    fontSize: 11.5,
                    fontWeight: 700,
                    alignSelf: 'flex-start',
                    borderRadius: 0,
                    border: 'none',
                    background: '#991b1b',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isFormOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(20,5,40,0.55)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ position: 'relative', width: 420, padding: 24, background: '#fff', borderRadius: 0, border: `1px solid ${THEME.border}` }}>
            <CornerBrackets />
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: THEME.purple, fontSize: 19, fontWeight: 700, marginBottom: 16 }}>Log a Call</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Contract ID</label>
                  <input type="number" style={inputStyle} placeholder="e.g. 1" value={formData.contract_id} onChange={e => setFormData({...formData, contract_id: e.target.value})} required />
                </div>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input type="date" style={inputStyle} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Remark</label>
                <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={4} placeholder="Subject, notes, outcome — all in one remark field" value={formData.remark} onChange={e => setFormData({...formData, remark: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="gfh-portal-btn"
                  onClick={() => setIsFormOpen(false)}
                  style={{ padding: '8px 15px', borderRadius: 0, border: `1px solid ${THEME.border}`, background: '#fff', color: THEME.textMuted, cursor: 'pointer', fontWeight: 700, fontSize: 12.5 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gfh-portal-btn"
                  style={{ ...ghostBtnStyle, padding: '8px 15px', fontSize: 12.5, background: '#065f46' }}
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
