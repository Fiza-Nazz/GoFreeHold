import { useAuthStore } from '../../store/authStore'
import { THEME, ADMIN_COLORS, Icon, portalPageCss, heroStyle, RADIUS } from '../../components/gfh/adminTheme'

const icons = {
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  mail: 'M4 4h16v16H4V4zm0 0 8 9 8-9',
  shield: 'M12 2 4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5l-8-3z',
}

/** Profile from auth session (GET /user hydrate). No separate maintenance profile API. */
export default function MaintenanceProfile() {
  const { user } = useAuthStore()

  const initials = (user?.name || '?')
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const rows = [
    { icon: icons.user, label: 'Name', value: user?.name || '—' },
    { icon: icons.mail, label: 'Email', value: user?.email || '—' },
    { icon: icons.shield, label: 'Role', value: (user?.role || 'maintenance').toString() },
  ]

  return (
    <div className="gfh-portal-page" style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", background: THEME.pageBg }}>
      <style>{portalPageCss}</style>

      <div className="fade-in" style={heroStyle}>
        <div>
          <div style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 600 }}>My Profile</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.ink, marginTop: 4 }}>Account details</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Your maintenance account information</div>
        </div>
      </div>

      <div
        className="fade-in gfh-portal-stat"
        style={{
          position: 'relative',
          background: '#fff',
          border: `1px solid ${THEME.border}`,
          borderRadius: RADIUS,
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
              {(user?.role || 'maintenance').toString()}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
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
                borderRadius: RADIUS,
                background: '#fff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 0, background: '#075985', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon path={row.icon} size={16} />
                </div>
                <div style={{ fontSize: 12, color: THEME.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  {row.label}
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: THEME.ink, textAlign: 'right' }}>{row.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
