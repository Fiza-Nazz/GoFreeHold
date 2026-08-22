/** Admin design tokens — reference RMS palette in DARK form.
 *  Source of truth for Admin + Tenant + Owner portal visual consistency.
 *  Do not invent alternate colors in portal pages — import from here.
 */
import type { CSSProperties } from 'react'

/** Shared sharp-corner radius used across Admin / Owner / Tenant. */
export const RADIUS = 0

export const THEME = {
  purpleDark: '#1e1b4b',
  purple: '#0f172a',
  purpleMid: '#1e293b',
  violet: '#0e7490',
  violetLight: '#075985',
  border: '#cbd5e1',
  textMuted: '#334155',
  ink: '#0f172a',
  pageBg: '#FFFFFF',
}

export const ADMIN_COLORS = {
  teal: '#075985',
  tealDeep: '#1e1b4b',
  green: '#065f46',        // Positive / Active / Paid / Occupied
  greenDeep: '#044e38',
  greenLight: '#f0fdf4',
  greenBorder: '#bbf7d0',
  blue: '#075985',         // PDF / Download / Export / View
  blueLight: '#f0f9ff',
  blueBorder: '#bae6fd',
  cyan: '#0e7490',         // Legal / Category / Neutral Action
  cyanLight: '#ecfeff',
  cyanBorder: '#a5f3fc',
  amber: '#b45309',        // Pending / Booked / Attention Needed
  amberDeep: '#92400e',
  amberLight: '#fffbeb',
  amberBorder: '#fde68a',
  red: '#991b1b',          // Destructive / Overdue / Vacate / Delete
  redDeep: '#7f1d1d',
  redLight: '#fef2f2',
  redBorder: '#fecaca',
  gray: '#374151',
  grayDeep: '#1f2937',
  navy: '#1e1b4b',         // Primary Main Button / Deep Accent
  slate: '#1e293b',        // Dark Card Header / Subtitle
}

export const Icon = ({ path, size = 15 }: { path: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
)

export const CornerBrackets = ({ color = ADMIN_COLORS.green }: { color?: string }) => {
  const glow = `0 0 6px ${color}44`
  return (
    <>
      <span style={{ position: 'absolute', top: -1, left: -1, width: 12, height: 12, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}`, boxShadow: glow, zIndex: 2 }} />
      <span style={{ position: 'absolute', top: -1, right: -1, width: 12, height: 12, borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}`, boxShadow: glow, zIndex: 2 }} />
      <span style={{ position: 'absolute', bottom: -1, left: -1, width: 12, height: 12, borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}`, boxShadow: glow, zIndex: 2 }} />
      <span style={{ position: 'absolute', bottom: -1, right: -1, width: 12, height: 12, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}`, boxShadow: glow, zIndex: 2 }} />
    </>
  )
}

export const portalPageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  .gfh-portal-page { background: #FFFFFF !important; }
  .gfh-portal-page * { font-family: 'Inter', -apple-system, sans-serif; }
  
  /* Sharp corners everywhere across Admin UI */
  .gfh-portal-page button,
  .gfh-portal-page input,
  .gfh-portal-page select,
  .gfh-portal-page textarea,
  .gfh-portal-page a,
  .gfh-portal-page table,
  .gfh-portal-page th,
  .gfh-portal-page td,
  .gfh-portal-page div,
  .gfh-portal-page .gfh-portal-stat,
  .gfh-portal-page .gfh-portal-row,
  .gfh-portal-page .gfh-portal-btn {
    border-radius: 0px !important;
  }
  
  .gfh-portal-stat { transition: transform 0.15s ease, box-shadow 0.15s ease; border-radius: 0px !important; }
  .gfh-portal-stat:hover { transform: translateY(-2px); box-shadow: 0 8px 20px -6px rgba(15, 23, 42, 0.15); }
  .gfh-portal-row { transition: background 0.15s ease; }
  .gfh-portal-row:hover { background: #f8fafc; }
  .gfh-portal-btn { transition: background 0.15s ease, transform 0.15s ease; border-radius: 0px !important; text-transform: uppercase; font-weight: 700; letter-spacing: 0.4px; }
  .gfh-portal-btn:hover { transform: translateY(-1px); }
  
  /* Standardized Status Badges */
  .status-badge-green { background-color: #f0fdf4 !important; color: #065f46 !important; border: 1px solid #bbf7d0 !important; border-radius: 0px !important; font-weight: 800; text-transform: uppercase; font-size: 10px; padding: 3px 8px; }
  .status-badge-blue { background-color: #f0f9ff !important; color: #075985 !important; border: 1px solid #bae6fd !important; border-radius: 0px !important; font-weight: 800; text-transform: uppercase; font-size: 10px; padding: 3px 8px; }
  .status-badge-amber { background-color: #fffbeb !important; color: #b45309 !important; border: 1px solid #fde68a !important; border-radius: 0px !important; font-weight: 800; text-transform: uppercase; font-size: 10px; padding: 3px 8px; }
  .status-badge-red { background-color: #fef2f2 !important; color: #991b1b !important; border: 1px solid #fecaca !important; border-radius: 0px !important; font-weight: 800; text-transform: uppercase; font-size: 10px; padding: 3px 8px; }
  .status-badge-cyan { background-color: #ecfeff !important; color: #0e7490 !important; border: 1px solid #a5f3fc !important; border-radius: 0px !important; font-weight: 800; text-transform: uppercase; font-size: 10px; padding: 3px 8px; }
`

export const heroStyle: CSSProperties = {
  position: 'relative',
  background: '#FFFFFF',
  borderRadius: 0,
  padding: '20px 24px',
  marginBottom: 20,
  border: `1px solid ${THEME.border}`,
  boxShadow: 'none',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 14,
}

export const panelStyle: CSSProperties = {
  position: 'relative',
  background: '#FFFFFF',
  border: `1px solid ${THEME.border}`,
  borderRadius: 0,
  padding: 22,
  minHeight: 240,
}

export const thStyle: CSSProperties = {
  padding: '12px 14px',
  fontWeight: 800,
  textAlign: 'left',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: THEME.textMuted,
  borderBottom: `2px solid ${THEME.border}`,
  background: '#f8fafc',
}

export const tdStyle: CSSProperties = {
  padding: '14px',
  fontSize: 13.5,
  fontWeight: 500,
  color: THEME.ink,
}

export const ghostBtnStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  borderRadius: 0,
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
  padding: '10px 18px',
  background: ADMIN_COLORS.navy,
  border: 'none',
  color: '#ffffff',
  cursor: 'pointer',
  textDecoration: 'none',
}
