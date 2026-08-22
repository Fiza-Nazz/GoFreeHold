/** Shared Purchases / Maintenance portal visual tokens — presentation only. */
import type { CSSProperties } from 'react'

export const THEME = {
  purpleDark: '#1e0a3c',
  purple: '#2e0f5e',
  purpleMid: '#3f1670',
  violet: '#6d28d9',
  violetLight: '#7c3aed',
  border: '#d9cdf5',
  textMuted: '#57534e',
  ink: '#1c1917',
}

export const Icon = ({ path, size = 15 }: { path: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
)

export const CornerBrackets = ({ color = THEME.violetLight }: { color?: string }) => {
  const glow = `0 0 10px ${color}, 0 0 2px ${color}`
  return (
    <>
      <span style={{ position: 'absolute', top: -2, left: -2, width: 18, height: 18, borderTop: `3px solid ${color}`, borderLeft: `3px solid ${color}`, boxShadow: glow }} />
      <span style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderTop: `3px solid ${color}`, borderRight: `3px solid ${color}`, boxShadow: glow }} />
      <span style={{ position: 'absolute', bottom: -2, left: -2, width: 18, height: 18, borderBottom: `3px solid ${color}`, borderLeft: `3px solid ${color}`, boxShadow: glow }} />
      <span style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderBottom: `3px solid ${color}`, borderRight: `3px solid ${color}`, boxShadow: glow }} />
    </>
  )
}

export const portalPageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
  .gfh-portal-page * { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }
  .gfh-portal-page button,
  .gfh-portal-page input,
  .gfh-portal-page select,
  .gfh-portal-page textarea,
  .gfh-portal-page a,
  .gfh-portal-page .gfh-portal-stat,
  .gfh-portal-page .gfh-portal-row,
  .gfh-portal-page .gfh-portal-btn { border-radius: 0 !important; }
  @keyframes gfhPortalPop { from { opacity: 0; transform: scale(0.96) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
  .gfh-portal-stat { animation: gfhPortalPop 0.4s ease backwards; transition: transform 0.25s ease, box-shadow 0.25s ease; }
  .gfh-portal-stat:hover { transform: translateY(-4px); box-shadow: 0 16px 30px -8px rgba(30, 10, 60, 0.25); }
  .gfh-portal-row { transition: background 0.15s ease; }
  .gfh-portal-row:hover { background: #faf7ff; }
  .gfh-portal-btn { transition: transform 0.2s cubic-bezier(.2,.8,.2,1), box-shadow 0.2s ease, background 0.2s ease; }
  .gfh-portal-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 24px -4px rgba(124,58,237,0.55); }
  .gfh-portal-link { color: ${THEME.violetLight}; font-weight: 700; text-decoration: none; display: inline-block; transition: transform 0.18s ease; }
  .gfh-portal-link:hover { transform: translateX(3px); }
`

export const heroStyle: CSSProperties = {
  position: 'relative',
  background: `linear-gradient(135deg, ${THEME.purpleDark} 0%, ${THEME.purple} 45%, ${THEME.purpleMid} 100%)`,
  borderRadius: 0,
  padding: '30px 34px',
  marginBottom: 24,
  boxShadow: '0 0 34px rgba(30, 10, 60, 0.5)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 16,
}

export const panelStyle: CSSProperties = {
  position: 'relative',
  background: '#fff',
  border: `1px solid ${THEME.border}`,
  borderRadius: 0,
  padding: 24,
  minHeight: 280,
}

export const thStyle: CSSProperties = {
  padding: '12px 14px',
  fontWeight: 700,
  textAlign: 'left',
  fontSize: 11.5,
  textTransform: 'uppercase',
  letterSpacing: '0.4px',
  color: THEME.textMuted,
}

export const tdStyle: CSSProperties = {
  padding: '14px',
  fontSize: 14,
  fontWeight: 500,
  color: THEME.ink,
}

export const ghostBtnStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  borderRadius: 0,
  fontSize: 13.5,
  fontWeight: 700,
  padding: '10px 18px',
  background: THEME.violetLight,
  border: 'none',
  color: '#fff',
  cursor: 'pointer',
  textDecoration: 'none',
}
