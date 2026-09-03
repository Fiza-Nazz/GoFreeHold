import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { THEME, Icon, ICONS, CornerBrackets, portalPageCss, heroStyle, panelStyle } from '../../components/gfh/adminTheme'

interface NotificationSetting {
  id: number
  key: string
  enabled: boolean
  recipient_email: string
  days_before_expiry?: number
  description: string
}

const icons = {
  mail: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6',
}

interface NotificationLog {
  id: number
  type: string
  recipient?: { name: string; email: string }
  message: string
  status: string
  sent_at: string
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>([])
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTriggering, setIsTriggering] = useState(false)
  const [activeTrigger, setActiveTrigger] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; output?: string } | null>(null)

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/admin/settings/notifications')
      setSettings(res.data?.data?.settings || [])
      setLogs(res.data?.data?.logs || [])
    } catch (err) { console.error(err) }
    finally { setIsLoading(false) }
  }

  const handleToggle = async (setting: NotificationSetting) => {
    try {
      await api.put(`/admin/settings/notifications/${setting.id}`, {
        enabled: !setting.enabled,
        recipient_email: setting.recipient_email,
        days_before_expiry: setting.days_before_expiry,
      })
      fetchSettings()
    } catch (err) { alert('Error updating setting') }
  }

  const handleUpdateEmail = async (setting: NotificationSetting, newEmail: string) => {
    try {
      await api.put(`/admin/settings/notifications/${setting.id}`, {
        enabled: setting.enabled,
        recipient_email: newEmail,
        days_before_expiry: setting.days_before_expiry,
      })
      fetchSettings()
    } catch (err) { alert('Error updating email') }
  }

  const handleTriggerSingle = async (key: string) => {
    setActiveTrigger(key)
    setFeedback(null)
    try {
      let res
      try {
        res = await api.post(`/admin/settings/notifications/trigger/${key}`)
      } catch (err: any) {
        if (err.response?.status === 405) {
          res = await api.put(`/admin/settings/notifications/trigger/${key}`)
        } else {
          throw err
        }
      }
      setFeedback({
        type: 'success',
        message: res.data?.message || 'Alert triggered successfully',
        output: res.data?.data?.output,
      })
      if (res.data?.data?.logs) {
        setLogs(res.data.data.logs)
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to trigger alert',
      })
    } finally {
      setActiveTrigger(null)
    }
  }

  const handleRunAllSchedulers = async () => {
    setIsTriggering(true)
    setFeedback(null)
    try {
      let res
      try {
        res = await api.post('/admin/settings/notifications/run-scheduler')
      } catch (err: any) {
        if (err.response?.status === 405) {
          res = await api.put('/admin/settings/notifications/run-scheduler')
        } else {
          throw err
        }
      }
      const results = res.data?.data?.results || {}
      const outputText = Object.entries(results).map(([cmd, out]) => `[${cmd}]\n${out}`).join('\n\n')
      setFeedback({
        type: 'success',
        message: 'All 5 automated scheduler tasks executed successfully!',
        output: outputText,
      })
      if (res.data?.data?.logs) {
        setLogs(res.data.data.logs)
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to run schedulers',
      })
    } finally {
      setIsTriggering(false)
    }
  }

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}>
      <style>{`${portalPageCss}
        .gfh-as-email-input {
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }
        .gfh-as-email-input:focus {
          outline: none;
          border-color: ${THEME.violetLight};
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(36,0,70,0.15);
        }
      `}</style>

      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Admin System Settings
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Configure automated email alert triggers, scheduled tasks, and notification preferences
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            className="gfh-portal-btn"
            onClick={handleRunAllSchedulers}
            disabled={isTriggering}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: '#240046',
              color: '#fff',
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 0,
              border: 'none',
              cursor: isTriggering ? 'not-allowed' : 'pointer',
              opacity: isTriggering ? 0.7 : 1,
            }}
          >
            <Icon path={ICONS.refresh} size={15} />
            {isTriggering ? 'Running Schedulers...' : 'Run All Schedulers Now'}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className="fade-in"
          style={{
            position: 'relative',
            background: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1.5px solid ${feedback.type === 'success' ? '#86efac' : '#fca5a5'}`,
            padding: 16,
            marginBottom: 20,
            color: feedback.type === 'success' ? '#166534' : '#991b1b',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: feedback.output ? 8 : 0 }}>
            {feedback.message}
          </div>
          {feedback.output && (
            <pre style={{
              margin: 0,
              padding: 12,
              background: '#18002e',
              color: '#a7f3d0',
              fontSize: 12,
              fontFamily: 'monospace',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
            }}>
              {feedback.output}
            </pre>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, marginBottom: 24 }}>
        <div className="fade-in" style={{ ...panelStyle, minHeight: 0 }}>
          <CornerBrackets />
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 19, fontWeight: 700, color: THEME.ink, marginTop: 0, marginBottom: 22 }}>
            Automated Notification Triggers
          </h3>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {settings.map(setting => (
                <div
                  key={setting.id}
                  className="gfh-portal-stat"
                  style={{
                    position: 'relative',
                    padding: 20,
                    background: '#fff',
                    borderRadius: 0,
                    border: `1px solid ${THEME.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 20,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <strong style={{ fontSize: 15.5, fontWeight: 700, color: THEME.ink }}>{setting.description}</strong>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          letterSpacing: '0.4px',
                          padding: '3px 10px',
                          borderRadius: 0,
                          backgroundColor: setting.enabled ? '#dcfce7' : '#f3f4f6',
                          color: setting.enabled ? '#166534' : THEME.textMuted,
                        }}
                      >
                        {setting.enabled ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12.5, color: THEME.textMuted, fontWeight: 600 }}>Recipient:</span>
                      <input
                        type="email"
                        className="gfh-as-email-input"
                        style={{
                          padding: '7px 12px',
                          fontSize: 12.5,
                          fontWeight: 600,
                          width: 230,
                          borderRadius: 0,
                          border: `1px solid ${THEME.border}`,
                          background: '#faf8ff',
                          color: THEME.ink,
                        }}
                        defaultValue={setting.recipient_email}
                        onBlur={e => handleUpdateEmail(setting, e.target.value)}
                      />
                      {setting.days_before_expiry && setting.days_before_expiry > 0 && (
                        <span style={{ fontSize: 12.5, color: THEME.textMuted, fontWeight: 600 }}>
                          Notice window: <strong style={{ color: THEME.ink }}>{setting.days_before_expiry} days</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      className="gfh-portal-btn"
                      onClick={() => handleTriggerSingle(setting.key)}
                      disabled={activeTrigger === setting.key}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '8px 14px',
                        borderRadius: 0,
                        cursor: activeTrigger === setting.key ? 'not-allowed' : 'pointer',
                        backgroundColor: '#075985',
                        color: '#fff',
                        border: 'none',
                        opacity: activeTrigger === setting.key ? 0.7 : 1,
                      }}
                    >
                      <Icon path={ICONS.refresh} size={12} />
                      {activeTrigger === setting.key ? 'Testing...' : 'Test Alert'}
                    </button>

                    <button
                      className="gfh-portal-btn"
                      onClick={() => handleToggle(setting)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '8px 14px',
                        borderRadius: 0,
                        cursor: 'pointer',
                        backgroundColor: setting.enabled ? '#fee2e2' : '#dcfce7',
                        color: setting.enabled ? '#991b1b' : '#166534',
                        border: setting.enabled ? '1px solid #fca5a5' : '1px solid #86efac',
                      }}
                    >
                      <Icon path={setting.enabled ? ICONS.close : ICONS.check} size={12} />
                      {setting.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="fade-in" style={{ ...panelStyle, minHeight: 0, height: 'fit-content' }}>
          <CornerBrackets />
          <div style={{ width: 40, height: 40, borderRadius: 0, background: `linear-gradient(135deg, ${THEME.violetLight}, ${THEME.purple})`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Icon path={icons.mail} size={18} />
          </div>
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 17, fontWeight: 700, color: THEME.ink, marginTop: 0, marginBottom: 16 }}>
            Mail Server &amp; Scheduler Status
          </h3>
          <div style={{ borderRadius: 0, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>
            <div className="gfh-portal-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', borderBottom: `1px solid ${THEME.border}` }}>
              <span style={{ fontSize: 12.5, color: THEME.textMuted, fontWeight: 600 }}>Driver</span>
              <strong style={{ fontSize: 13, color: THEME.ink }}>Laravel Mail (SMTP)</strong>
            </div>
            <div className="gfh-portal-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', borderBottom: `1px solid ${THEME.border}` }}>
              <span style={{ fontSize: 12.5, color: THEME.textMuted, fontWeight: 600 }}>Environment</span>
              <strong style={{ fontSize: 13, color: THEME.ink }}>{import.meta.env.MODE}</strong>
            </div>
            <div className="gfh-portal-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: `1px solid ${THEME.border}` }}>
              <span style={{ fontSize: 12.5, color: THEME.textMuted, fontWeight: 600 }}>Cron Scheduler</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                <strong style={{ fontSize: 13, color: '#059669' }}>Active (5 Tasks)</strong>
              </span>
            </div>
            <div className="gfh-portal-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px' }}>
              <span style={{ fontSize: 12.5, color: THEME.textMuted, fontWeight: 600 }}>Audit Logging</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                <strong style={{ fontSize: 13, color: '#059669' }}>Enabled</strong>
              </span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 500, lineHeight: 1.5, marginTop: 14, marginBottom: 0 }}>
            Scheduled jobs: Monthly rent dues posting (1st of month), Expiry alerts (daily 08:00), Cheque alerts (daily 09:00), Vacancy reports (weekly Mondays).
          </p>
        </div>
      </div>

      {/* Notification and Scheduler Audit Log Table */}
      <div className="fade-in" style={{ ...panelStyle, minHeight: 0 }}>
        <CornerBrackets />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Recent Notification &amp; Scheduler Audit Log
          </h3>
          <button
            type="button"
            className="gfh-portal-btn"
            onClick={fetchSettings}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f6f1fe', border: `1px solid ${THEME.border}`, padding: '5px 10px', fontSize: 11.5, fontWeight: 700, color: THEME.purple, cursor: 'pointer' }}
          >
            <Icon path={ICONS.refresh} size={12} />
            Refresh Logs
          </button>
        </div>

        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: THEME.textMuted, fontSize: 13, fontWeight: 500 }}>
            No recent notification logs found. Click "Run All Schedulers Now" or "Test Alert" above to trigger.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase' }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase' }}>Message</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase' }}>Recipient</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase' }}>Date / Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const isSent = log.status === 'sent'
                  const isChecked = log.status === 'checked'
                  return (
                    <tr key={log.id} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={{ padding: '10px 12px', fontSize: 12.5, fontWeight: 700, color: THEME.ink }}>
                        {log.type.replace(/_/g, ' ').toUpperCase()}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12.5, color: THEME.ink, maxWidth: 400 }}>
                        {log.message}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: THEME.textMuted }}>
                        {log.recipient?.name || log.recipient?.email || 'System / Admin'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '3px 8px',
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 0,
                          backgroundColor: isSent ? '#dcfce7' : isChecked ? '#e0f2fe' : '#fee2e2',
                          color: isSent ? '#166534' : isChecked ? '#0369a1' : '#991b1b',
                        }}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: THEME.textMuted, whiteSpace: 'nowrap' }}>
                        {String(log.sent_at || '').replace('T', ' ').slice(0, 19)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
