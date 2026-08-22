import { useAuthStore } from '../../store/authStore'
import { THEME, ADMIN_COLORS, Icon, portalPageCss, heroStyle } from '../../components/gfh/adminTheme'
import { safeUpper } from '../../utils/safeLabel'

const icons = {
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  mail: 'M4 4h16v16H4V4zm0 0 8 9 8-9',
  shield: 'M12 2 4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5l-8-3z',
  lock: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4',
  save: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8',
}

export default function TenantProfile() {
  const { user } = useAuthStore()

  const initials = (user?.name || '?')
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const rows = [
    { icon: icons.user, label: 'Full Name', value: user?.name || '—' },
    { icon: icons.mail, label: 'Email Address', value: user?.email || '—' },
    { icon: icons.shield, label: 'Role', value: safeUpper(user?.role || 'tenant') },
  ]

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", background: THEME.pageBg }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 600 }}>My Profile</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, marginTop: 4 }}>Account Settings</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Manage your account settings and personal information</div>
        </div>
      </div>

      <div
        className="fade-in gfh-portal-stat"
        style={{
          position: 'relative',
          background: '#fff',
          border: `1px solid ${THEME.border}`,
          borderRadius: 0,
          padding: 24,
          maxWidth: 560,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22, paddingBottom: 20, borderBottom: `1px solid ${THEME.border}` }}>
          <div
            style={{
              width: 56,
              height: 56,
              flexShrink: 0,
              borderRadius: 0,
              background: '#1e1b4b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: THEME.ink }}>
              {user?.name || '—'}
            </div>
            <div style={{ fontSize: 13.5, color: THEME.textMuted, marginTop: 4 }}>{user?.email || '—'}</div>
            <span
              style={{
                display: 'inline-block',
                marginTop: 10,
                padding: '4px 10px',
                borderRadius: 0,
                background: '#f0fdf4',
                color: '#065f46',
                border: '1px solid #bbf7d0',
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
              }}
            >
              Verified Account
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
          {rows.map(row => (
            <div
              key={row.label}
              className="gfh-portal-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '14px 16px',
                border: `1px solid ${THEME.border}`,
                borderRadius: 0,
                background: '#fff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 0, background: '#075985', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon path={row.icon} size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                    {row.label}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: THEME.ink, marginTop: 2 }}>{row.value}</div>
                </div>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: THEME.textMuted, textTransform: 'uppercase' }}>
                <Icon path={icons.lock} size={12} />
                Locked
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          style={{
            width: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderRadius: 0,
            fontSize: 14,
            fontWeight: 700,
            padding: '12px 18px',
            background: '#075985',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            marginBottom: 14,
          }}
        >
          <Icon path={icons.save} size={16} />
          Update Profile
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: `1px solid ${THEME.border}`, borderRadius: 0, background: '#f9fafb' }}>
          <div style={{ width: 36, height: 36, borderRadius: 0, background: '#1e1b4b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon path={icons.shield} size={16} />
          </div>
          <div style={{ fontSize: 12.5, color: THEME.textMuted, lineHeight: 1.45 }}>
            <strong style={{ color: THEME.ink }}>Your data is protected.</strong> Profile fields are currently read-only and managed by your administrator.
          </div>
        </div>
      </div>
    </div>
  )
}
