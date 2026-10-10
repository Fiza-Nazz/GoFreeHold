import { useEffect, useState } from 'react'
import { fetchAuditLogs } from '../../api/platform'
import type { AuditLog } from '../../types/platform'
import { THEME, portalPageCss } from '../../components/gfh/adminTheme'

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [action, setAction] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const list = await fetchAuditLogs({
        action: action || undefined,
        from: from || undefined,
        to: to || undefined,
      })
      setLogs(list)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load audit logs.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div>
      <style>{portalPageCss}</style>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: THEME.ink }}>Audit Logs</h1>
        <p style={{ margin: '6px 0 0', color: THEME.textMuted, fontSize: 14 }}>
          Platform security and support activity
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <input
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="Filter by action"
          style={{ padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 8, minWidth: 180 }}
        />
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 8 }} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 8 }} />
        <button type="button" onClick={() => void load()} style={{ padding: '10px 14px', borderRadius: 8, border: 'none', background: '#0F766E', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          Apply
        </button>
      </div>

      {error && (
        <div style={{ padding: 14, borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', marginBottom: 14 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, color: THEME.textMuted }}>Loading audit logsΓÇª</div>
      ) : logs.length === 0 ? (
        <div style={{ padding: 40, color: THEME.textMuted, textAlign: 'center' }}>No audit events found.</div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['When', 'Actor', 'Action', 'Organization', 'IP'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 14px', fontSize: 11, color: '#64748B', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: 14, fontSize: 13, whiteSpace: 'nowrap' }}>{new Date(log.created_at).toLocaleString()}</td>
                  <td style={{ padding: 14, fontSize: 13 }}>
                    <div style={{ fontWeight: 600 }}>{log.actor?.name || 'System'}</div>
                    <div style={{ color: '#64748B' }}>{log.actor?.email || ''}</div>
                  </td>
                  <td style={{ padding: 14, fontSize: 13, fontWeight: 600 }}>{log.action}</td>
                  <td style={{ padding: 14, fontSize: 13 }}>{log.organization?.name || 'ΓÇö'}</td>
                  <td style={{ padding: 14, fontSize: 13, color: '#64748B' }}>{log.ip_address || 'ΓÇö'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
