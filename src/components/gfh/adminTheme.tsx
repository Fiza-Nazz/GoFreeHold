/** Admin design tokens — Modern Forest/Emerald Green Theme with Rounded Corners Pattern.
 *  Source of truth for Admin + Tenant + Owner portal visual consistency.
 */
import type { CSSProperties } from 'react'

/** Shared modern rounded radius used across Admin / Owner / Tenant. */
export const RADIUS = 14

// Forest Green / Emerald palette matching reference
export const THEME = {
  navy: '#0F8A67',          // Forest Emerald primary brand
  navyDeep: '#06382C',      // Dark Forest Green
  navyMid: '#0E5E48',       // Forest Mid
  navyLight: '#18A77A',     // Brand Emerald
  purpleDark: '#06382C',    // Replaced with Dark Forest
  purple: '#0E5E48',        // Replaced with Forest Mid
  purpleMid: '#18A77A',     // Brand Emerald
  violet: '#10B981',        // Emerald Accent
  violetLight: '#34D3A5',   // Light Emerald Accent
  border: '#E2E8F0',
  textMuted: '#64748B',
  ink: '#0F172A',
  pageBg: '#F8F7FD',        // Clean subtle off-white canvas
}

export const ADMIN_COLORS = {
  navy: '#06382C',          // Primary Dark Forest Green
  navyDeep: '#04281E',      // Darkest Forest Green
  navyLight: '#0E5E48',     // Mid Forest
  purple: '#0E5E48',
  purpleDark: '#06382C',
  purpleLight: '#ECFDF8',
  purpleBorder: '#A7F3DC',
  green: '#0F8A67',         // Positive / Active / Paid / Occupied
  greenDeep: '#06382C',
  greenLight: '#ECFDF8',
  greenBorder: '#A7F3DC',
  blue: '#0284C7',          // PDF / Download / Export / View
  blueLight: '#F0F9FF',
  blueBorder: '#BAE6FD',
  cyan: '#0891B2',          // Legal / Category / Neutral Action
  cyanLight: '#ECFEFF',
  cyanBorder: '#A5F3FC',
  amber: '#D97706',         // Pending / Booked / Attention Needed
  amberDeep: '#B45309',
  amberLight: '#FFFBEB',
  amberBorder: '#FDE68A',
  red: '#DC2626',           // Destructive / Overdue / Vacate / Delete
  redDeep: '#991B1B',
  redLight: '#FEF2F2',
  redBorder: '#FECACA',
  gray: '#475569',
  grayDeep: '#1E293B',
  slate: '#334155',
}

// Global SVG Icons dictionary for consistent action icons everywhere
export const ICONS = {
  plus: 'M12 5v14M5 12h14',
  edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  trash: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16z',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  refresh: 'M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  printer: 'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z',
  search: 'M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
  filter: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
  check: 'M20 6 9 17l-5-5',
  close: 'M18 6 6 18M6 6l12 12',
  building: 'M3 21h18M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v12M8 7h1M8 11h1M8 15h1M16 12h1M16 16h1',
  door: 'M14 3h5v18h-5M14 3L6 4.5v15L14 21M9.5 12h.01',
  contracts: 'M9 3h6l4 4v14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 9h6M9 13h6M9 17h4',
  wallet: 'M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z',
  wrench: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2 2.8-2.8z',
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z',
  alert: 'M12 9v4M12 17h.01M10.29 3.86 1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.72 0z',
  arrowRight: 'M5 12h14M12 5l7 7-7 7',
}

export const Icon = ({ path, size = 15 }: { path: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d={path} />
  </svg>
)

/** Returns null to eliminate sharp sci-fi brackets in favor of clean modern rounded cards */
export const CornerBrackets = (_props?: { color?: string }) => null

export const portalPageCss = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
  .gfh-portal-page { background: #F8F7FD !important; font-family: 'Poppins', system-ui, sans-serif !important; }
  .gfh-portal-page * { font-family: 'Poppins', system-ui, sans-serif !important; }
  .gfh-portal-page h1, .gfh-portal-page h2, .gfh-portal-page h3,
  .gfh-portal-page h4, .gfh-portal-page h5, .gfh-portal-page h6 {
    font-family: 'Poppins', sans-serif !important;
    font-weight: 700 !important;
  }

  /* Modern rounded corners pattern across Admin UI */
  .gfh-portal-page button { border-radius: 8px !important; }
  .gfh-portal-page input, .gfh-portal-page select, .gfh-portal-page textarea { border-radius: 8px !important; }
  .gfh-portal-page .gfh-portal-stat {
    border-radius: 16px !important;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    box-shadow: 0 1px 3px rgba(16,24,40,0.05);
  }
  .gfh-portal-stat:hover { transform: translateY(-2px); box-shadow: 0 6px 18px -4px rgba(15, 23, 42, 0.12); }
  .gfh-portal-row { transition: background 0.15s ease; }
  .gfh-portal-row:hover { background: #F0FDF4; }
  .gfh-portal-btn {
    transition: background 0.15s ease, transform 0.15s ease;
    border-radius: 8px !important;
    font-weight: 600;
  }
  .gfh-portal-btn:hover { transform: translateY(-1px); }
  .gfh-portal-link { color: #0F8A67 !important; text-decoration: none; font-weight: 600; }
  .gfh-portal-link:hover { color: #06382C !important; }

  /* Standardized Rounded Pill Status Badges */
  .status-badge-green  { background-color: #f0fdf4 !important; color: #065f46 !important; border: 1px solid #bbf7d0 !important; border-radius: 999px !important; font-weight: 700; text-transform: uppercase; font-size: 10.5px; padding: 3px 10px; }
  .status-badge-blue   { background-color: #f0f9ff !important; color: #075985 !important; border: 1px solid #bae6fd !important; border-radius: 999px !important; font-weight: 700; text-transform: uppercase; font-size: 10.5px; padding: 3px 10px; }
  .status-badge-amber  { background-color: #fffbeb !important; color: #b45309 !important; border: 1px solid #fde68a !important; border-radius: 999px !important; font-weight: 700; text-transform: uppercase; font-size: 10.5px; padding: 3px 10px; }
  .status-badge-red    { background-color: #fef2f2 !important; color: #991b1b !important; border: 1px solid #fecaca !important; border-radius: 999px !important; font-weight: 700; text-transform: uppercase; font-size: 10.5px; padding: 3px 10px; }
  .status-badge-purple { background-color: #ecfdf8 !important; color: #065f46 !important; border: 1px solid #a7f3dc !important; border-radius: 999px !important; font-weight: 700; text-transform: uppercase; font-size: 10.5px; padding: 3px 10px; }
  .status-badge-cyan   { background-color: #ecfeff !important; color: #0e7490 !important; border: 1px solid #a5f3fc !important; border-radius: 999px !important; font-weight: 700; text-transform: uppercase; font-size: 10.5px; padding: 3px 10px; }
`

export const heroStyle: CSSProperties = {
  position: 'relative',
  background: '#FFFFFF',
  borderRadius: 14,
  padding: '20px 24px',
  marginBottom: 20,
  border: `1px solid ${THEME.border}`,
  boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
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
  borderRadius: 16,
  padding: 22,
  minHeight: 240,
  boxShadow: '0 1px 3px rgba(16,24,40,0.04)',
}

export const thStyle: CSSProperties = {
  padding: '12px 14px',
  fontWeight: 700,
  textAlign: 'left',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: THEME.textMuted,
  borderBottom: `2px solid ${THEME.border}`,
  background: '#F8F7FD',
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
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  padding: '9px 18px',
  background: '#0F8A67',
  border: 'none',
  color: '#ffffff',
  cursor: 'pointer',
  textDecoration: 'none',
  boxShadow: '0 1px 3px rgba(15, 138, 103, 0.2)',
}
