import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import type { UserRole } from '../../types'
import { getPortalNavConfig, icons, resolvePageTitle, type MenuGroup } from './navConfig'
import { portalPageCss } from '../gfh/adminTheme'
import './portalShell.css'
import '../rbac/rbac.css'

const SIDEBAR_COLLAPSED_KEY = 'gfh-sidebar-collapsed'

const Icon = ({ path, size = 18 }: { path: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    <path d={path} />
  </svg>
)

function initialsFromName(name?: string | null, fallback = 'U') {
  if (!name) return fallback
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function firstNameFrom(name?: string | null) {
  if (!name?.trim()) return 'there'
  return name.trim().split(/\s+/)[0]
}

function topbarSubtitle(pathname: string, role: UserRole, userName?: string | null) {
  if (pathname.endsWith('/dashboard')) {
    if (role === 'owner') {
      return `Welcome back, ${firstNameFrom(userName)}! Here's an overview of your portfolio.`
    }
    return `Welcome back, ${firstNameFrom(userName)}! Here's what's happening today.`
  }
  return null
}

function readCollapsedPreference() {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

function resolveBreadcrumbParent(pathname: string, config: ReturnType<typeof getPortalNavConfig>, pageTitle: string) {
  const dashboardKey = Object.keys(config.pageTitles).find((k) => k.endsWith('/dashboard'))
  const keys = Object.keys(config.pageTitles)
    .filter((k) => k !== dashboardKey)
    .sort((a, b) => b.length - a.length)

  const exact = keys.find((k) => k === pathname)
  if (exact) {
    const segments = exact.split('/').filter(Boolean)
    if (segments.length <= 2) return null
    const parentPath = '/' + segments.slice(0, -1).join('/')
    const parentTitle = config.pageTitles[parentPath]
    if (parentTitle && parentTitle !== pageTitle) return parentTitle
    return config.logoSub
  }

  const prefix = keys.find((k) => pathname.startsWith(k + '/'))
  if (prefix) {
    const parentTitle = config.pageTitles[prefix]
    if (parentTitle && parentTitle !== pageTitle) return parentTitle
  }

  const depth = pathname.split('/').filter(Boolean).length
  if (depth > 2) return config.logoSub
  return null
}

export default function PortalLayout() {
  const { user, logout, impersonator, exitImpersonation, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readCollapsedPreference)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const role = (user?.role || 'owner') as UserRole
  const config = useMemo(() => getPortalNavConfig(role), [role])
  const groups = config.groups || []
  const isImpersonating = Boolean(user?.impersonation?.active || impersonator)

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  const pageTitle = resolvePageTitle(location.pathname, config)
  const breadcrumbParent = resolveBreadcrumbParent(location.pathname, config, pageTitle)
  const pageSubtitle = topbarSubtitle(location.pathname, role, user?.name)
  const searchQuery = searchParams.get('q') || ''
  const showSearch = (config.searchPaths || []).includes(location.pathname)
  const avatar = initialsFromName(user?.name, role.slice(0, 2).toUpperCase())
  const profilePath = Object.keys(config.pageTitles).find((k) => k.endsWith('/profile')) || null

  const isGroupActive = (group: MenuGroup) =>
    group.paths.some(
      (path) => location.pathname === path || location.pathname.startsWith(path + '/'),
    )

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [collapsed])

  useEffect(() => {
    if (!groups.length) return
    setOpenGroups(() => {
      const next: Record<string, boolean> = {}
      groups.forEach((group) => {
        next[group.key] = isGroupActive(group)
      })
      return next
    })
  }, [location.pathname, role])

  useEffect(() => {
    setUserMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!userMenuOpen) return
    const onPointerDown = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [userMenuOpen])

  const toggleGroup = (key: string) => {
    if (collapsed) {
      setCollapsed(false)
      setOpenGroups(() => {
        const next: Record<string, boolean> = {}
        groups.forEach((group) => {
          next[group.key] = group.key === key || isGroupActive(group)
        })
        return next
      })
      return
    }

    setOpenGroups((current) => {
      const willOpen = !current[key]
      const next: Record<string, boolean> = {}
      groups.forEach((group) => {
        next[group.key] = group.key === key ? willOpen : isGroupActive(group)
      })
      return next
    })
  }

  const isMenuLinkActive = (target: string) => {
    const [targetPath, targetQuery = ''] = target.split('?')
    if (location.pathname !== targetPath) return false
    const requiredParams = new URLSearchParams(targetQuery)
    if ([...requiredParams.entries()].length === 0) return !location.search
    return [...requiredParams.entries()].every(
      ([key, value]) => searchParams.get(key) === value,
    )
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleExitImpersonation = async () => {
    try {
      await exitImpersonation()
      navigate('/admin/dashboard')
    } catch (err: any) {
      alert(err?.message || 'Failed to exit impersonation.')
    }
  }

  const closeMobileSidebar = () => setSidebarOpen(false)

  const renderGroups = () =>
    groups.map((group) => {
      const isOpen = !!openGroups[group.key] && !collapsed
      const activeGroup = isGroupActive(group)
      return (
        <div key={group.key} style={{ marginBottom: 2 }}>
          <button
            type="button"
            className={`gfh-nav-group-toggle${activeGroup ? ' active-group' : ''}`}
            aria-expanded={isOpen}
            aria-controls={`portal-${group.key}-submenu`}
            title={group.label}
            onClick={() => toggleGroup(group.key)}
          >
            <span className="gfh-group-icon-circle">
              <Icon path={group.icon} size={15} />
            </span>
            <span className="gfh-nav-label">{group.label}</span>
            <span className={`gfh-nav-group-chevron ${isOpen ? '' : 'closed'}`}>
              <Icon path={icons.chevronDown} size={14} />
            </span>
          </button>
          {isOpen && (
            <div id={`portal-${group.key}-submenu`} className="gfh-nav-submenu">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={() => `gfh-sub-item ${isMenuLinkActive(item.to) ? 'active' : ''}`}
                  onClick={closeMobileSidebar}
                >
                  <span className="gfh-sub-bullet" />
                  <span className="gfh-nav-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      )
    })

  return (
    <div className="gfh-app-layout">
      {isImpersonating && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '8px 16px',
            background: '#1E3A8A',
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <span>
            Support mode: viewing as <strong>{user?.name}</strong>
            {user?.impersonation?.actor_name ? ` (started by ${user.impersonation.actor_name})` : impersonator ? ` (started by ${impersonator.name})` : ''}
          </span>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void handleExitImpersonation()}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.45)',
              background: 'rgba(255,255,255,0.12)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Exit impersonation
          </button>
        </div>
      )}
      <aside className={`gfh-sidebar${sidebarOpen ? ' open' : ''}${collapsed ? ' collapsed' : ''}`} style={isImpersonating ? { top: 40 } : undefined}>
        <div className="gfh-sidebar-logo">
          <div className="gfh-logo-icon" title="GoFreeHold">
            <Icon path={config.logoIcon} size={20} />
          </div>
          <div className="gfh-logo-copy">
            <div className="gfh-logo-text">GoFreeHold</div>
            <div className="gfh-logo-sub">{config.logoSub}</div>
          </div>
          <button
            type="button"
            className="gfh-collapse-btn"
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-pressed={collapsed}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              {collapsed ? (
                <polyline points="9 18 15 12 9 6" />
              ) : (
                <polyline points="15 18 9 12 15 6" />
              )}
            </svg>
          </button>
        </div>

        <nav className="gfh-sidebar-nav">
          {config.dashboard && (
            <NavLink
              to={config.dashboard.to}
              className={({ isActive }) => `gfh-dashboard-item ${isActive ? 'active' : ''}`}
              onClick={closeMobileSidebar}
              title={config.dashboard.label}
            >
              <span className="gfh-dash-icon" style={{ display: 'flex' }}>
                <Icon path={config.dashboard.icon || icons.dashboard} size={17} />
              </span>
              <span className="gfh-nav-label">{config.dashboard.label}</span>
            </NavLink>
          )}

          {config.dashboard && groups.length > 0 && !config.sections?.length && renderGroups()}

          {(config.sections || []).map((section, sectionIndex) => (
            <div key={section.section || `section-${sectionIndex}`}>
              {section.section ? (
                <div className="gfh-nav-section-label">{section.section}</div>
              ) : null}
              {section.items.map((item) => (
                <NavLink
                  end={item.end}
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `gfh-nav-item ${isActive ? 'active' : ''}`}
                  onClick={closeMobileSidebar}
                  title={item.label}
                >
                  {item.icon && (
                    <span className="gfh-nav-icon">
                      <Icon path={item.icon} size={17} />
                    </span>
                  )}
                  <span className="gfh-nav-label">{item.label}</span>
                </NavLink>
              ))}
              {section.insertGroups && renderGroups()}
            </div>
          ))}
        </nav>

        <div className="gfh-sidebar-footer">
          <div className="gfh-user-row">
            <div className="gfh-user-avatar" title={user?.name || 'User'}>
              {user?.name?.charAt(0).toUpperCase() || avatar.charAt(0)}
            </div>
            <div className="gfh-user-meta">
              <div className="gfh-user-name">{user?.name || 'User'}</div>
              <div className="gfh-user-role">{config.roleLabel}</div>
            </div>
            <button type="button" onClick={() => void handleLogout()} title="Logout" className="gfh-logout-btn">
              <Icon path={icons.logout} size={17} />
            </button>
          </div>
        </div>
      </aside>

      <div className="gfh-main-content" style={isImpersonating ? { paddingTop: 40 } : undefined}>
        <header className="gfh-topbar">
          <div className="gfh-topbar-left">
            <button
              type="button"
              className="gfh-icon-btn gfh-icon-btn--ghost gfh-mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              title="Open menu"
              aria-label="Open menu"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>

            <div className="gfh-title-block">
              {breadcrumbParent && !pageSubtitle ? (
                <div className="gfh-breadcrumb" aria-label="Breadcrumb">
                  <span>{breadcrumbParent}</span>
                  <span className="gfh-breadcrumb-sep">/</span>
                  <span className="gfh-breadcrumb-current">{pageTitle}</span>
                </div>
              ) : null}
              <h1 className="gfh-page-title">{pageTitle}</h1>
              {pageSubtitle ? (
                <p className="gfh-page-subtitle">{pageSubtitle}</p>
              ) : null}
            </div>
          </div>

          <div className="gfh-topbar-right">
            {showSearch && (
              <div className="gfh-topbar-search">
                <span className="gfh-topbar-search-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  className="gfh-topbar-search-input"
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value
                    setSearchParams(val ? { q: val } : {}, { replace: true })
                  }}
                  placeholder={
                    location.pathname.endsWith('/inventory')
                      ? 'Search inventory...'
                      : 'Search contracts...'
                  }
                />
              </div>
            )}

            <button
              type="button"
              className="gfh-notif-btn has-unread"
              title="Notifications"
              aria-label="Notifications"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="gfh-notif-dot" />
            </button>

            <div className="gfh-user-menu" ref={userMenuRef}>
              <button
                type="button"
                className={`gfh-user-menu-trigger${userMenuOpen ? ' open' : ''}`}
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                <span className="gfh-topbar-avatar" aria-hidden="true">{avatar}</span>
                <span className="gfh-topbar-user-meta">
                  <span className="gfh-topbar-user-name">{user?.name || 'User'}</span>
                  <span className="gfh-topbar-user-role">{config.roleLabel}</span>
                </span>
                <svg
                  className="gfh-user-menu-caret"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="gfh-user-menu-dropdown" role="menu">
                  {profilePath && (
                    <Link
                      to={profilePath}
                      role="menuitem"
                      className="gfh-user-menu-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Icon path={icons.user} size={15} />
                      Profile
                    </Link>
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    className="gfh-user-menu-item gfh-user-menu-item--danger"
                    onClick={() => void handleLogout()}
                  >
                    <Icon path={icons.logout} size={15} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="gfh-page-content">
          <style>{portalPageCss}</style>
          <div className="gfh-portal-page">
            <Outlet key={user?.id} />
          </div>
        </main>
      </div>

      {sidebarOpen && (
        <div
          onClick={closeMobileSidebar}
          className="gfh-sidebar-overlay open"
          role="presentation"
        />
      )}
    </div>
  )
}
