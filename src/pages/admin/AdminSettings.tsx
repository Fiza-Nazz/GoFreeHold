import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { THEME, Icon, CornerBrackets, portalPageCss, heroStyle, panelStyle } from '../../components/gfh/adminTheme'

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

export default function AdminSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const res = await api.get('/admin/settings/notifications')
      setSettings(res.data?.data?.settings || [])
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

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{`${portalPageCss}
        .gfh-as-email-input {
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }
        .gfh-as-email-input:focus {
          outline: none;
          border-color: ${THEME.violetLight};
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(15,118,110,0.15);
        }
      `}</style>

      <div className="fade-in" style={heroStyle}>
        <CornerBrackets />
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 700, color: THEME.ink, margin: 0 }}>
            Admin System Settings
          </h1>
          <p style={{ fontSize: 14, color: THEME.textMuted, marginTop: 8, marginBottom: 0 }}>
            Configure automated email alert triggers and notification preferences
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
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

                  <button
                    className="gfh-portal-btn"
                    onClick={() => handleToggle(setting)}
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      padding: '8px 16px',
                      borderRadius: 0,
                      cursor: 'pointer',
                      backgroundColor: setting.enabled ? '#fee2e2' : '#dcfce7',
                      color: setting.enabled ? '#991b1b' : '#166534',
                      border: setting.enabled ? '1px solid #fca5a5' : '1px solid #86efac',
                    }}
                  >
                    {setting.enabled ? 'Disable' : 'Enable'}
                  </button>
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
            Mail Server Status
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
            <div className="gfh-portal-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px' }}>
              <span style={{ fontSize: 12.5, color: THEME.textMuted, fontWeight: 600 }}>Task Scheduler</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                <strong style={{ fontSize: 13, color: '#059669' }}>Active</strong>
              </span>
            </div>
          </div>
          <p style={{ fontSize: 12.5, color: THEME.textMuted, fontWeight: 500, lineHeight: 1.6, marginTop: 16, marginBottom: 0 }}>
            System can easily switch between Mailtrap (for dev) and SendGrid/S3/SMTP (for production) via .env config.
          </p>
        </div>
      </div>
    </div>
  )
}
