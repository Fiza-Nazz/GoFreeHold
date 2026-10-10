import { useEffect, useState } from 'react'
import { fetchPlatformSettings, updatePlatformSettings } from '../../api/platform'
import type { PlatformSettings } from '../../types/platform'
import { THEME, portalPageCss } from '../../components/gfh/adminTheme'

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  border: '1px solid #CBD5E1',
  borderRadius: 8,
  fontSize: 13.5,
}

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    support_email: '',
    default_trial_days: 14,
    branding_name: 'GoFreeHold',
    feature_flags: {
      impersonation: true,
      prepared_contracts: true,
      owner_self_signup: true,
    },
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let alive = true
    setLoading(true)
    fetchPlatformSettings()
      .then((data) => {
        if (!alive) return
        setSettings((prev) => ({
          ...prev,
          ...data,
          feature_flags: {
            ...(prev.feature_flags || {}),
            ...(data.feature_flags || {}),
          },
        }))
      })
      .catch((err: any) => {
        if (alive) setError(err.response?.data?.message || 'Unable to load platform settings. Showing defaults.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const updated = await updatePlatformSettings(settings)
      setSettings((prev) => ({ ...prev, ...updated }))
      setMessage('Platform settings saved.')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  const flags = settings.feature_flags || {}

  return (
    <div>
      <style>{portalPageCss}</style>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: THEME.ink }}>Platform Settings</h1>
        <p style={{ margin: '6px 0 0', color: THEME.textMuted, fontSize: 14 }}>
          Global SaaS configuration ΓÇö not organization notification settings
        </p>
      </div>

      {error && (
        <div style={{ padding: 14, borderRadius: 10, background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', marginBottom: 14 }}>
          {error}
        </div>
      )}
      {message && (
        <div style={{ padding: 14, borderRadius: 10, background: '#ECFDF5', border: '1px solid #A7F3DC', color: '#065F46', marginBottom: 14 }}>
          {message}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, color: THEME.textMuted }}>Loading settingsΓÇª</div>
      ) : (
        <form onSubmit={save} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 20, maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Branding name</div>
            <input value={String(settings.branding_name || '')} onChange={(e) => setSettings({ ...settings, branding_name: e.target.value })} style={inputStyle} />
          </label>
          <label>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Support email</div>
            <input type="email" value={String(settings.support_email || '')} onChange={(e) => setSettings({ ...settings, support_email: e.target.value })} style={inputStyle} />
          </label>
          <label>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Default trial days</div>
            <input
              type="number"
              min={0}
              value={Number(settings.default_trial_days || 0)}
              onChange={(e) => setSettings({ ...settings, default_trial_days: Number(e.target.value || 0) })}
              style={inputStyle}
            />
          </label>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 8 }}>Feature flags</div>
            {Object.entries(flags).map(([key, enabled]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13.5 }}>
                <input
                  type="checkbox"
                  checked={Boolean(enabled)}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      feature_flags: { ...flags, [key]: e.target.checked },
                    })
                  }
                />
                {key}
              </label>
            ))}
          </div>

          <button type="submit" disabled={saving} style={{ alignSelf: 'flex-start', padding: '10px 18px', borderRadius: 8, border: 'none', background: '#10B981', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
            {saving ? 'SavingΓÇª' : 'Save settings'}
          </button>
        </form>
      )}
    </div>
  )
}
