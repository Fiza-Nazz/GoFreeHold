import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useEffect, useState } from 'react'
import type { UserRole } from '../types'

// ─── Hydration check: wait for Zustand persist to rehydrate ──────────────────
function useHydrated() {
  const [hydrated, setHydrated] = useState(false)
  
  useEffect(() => {
    // Just force the UI to render after a small tick
    // This entirely avoids the Zustand persist api bug 
    const timer = setTimeout(() => {
      setHydrated(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [])
  
  return hydrated
}

// ─── Protected Route (requires auth) ─────────────────────────────────────────
interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const hydrated = useHydrated()

  // Wait for localStorage to be read before deciding
  if (!hydrated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', gap: 16 }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading GoFreeHold...</p>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

// ─── Guest Route (redirects authenticated users) ──────────────────────────────
export function GuestRoute() {
  const { isAuthenticated, user } = useAuthStore()
  const hydrated = useHydrated()

  if (!hydrated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', gap: 16 }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading GoFreeHold...</p>
      </div>
    )
  }

  if (isAuthenticated && user) {
    const paths: Record<UserRole, string> = {
      admin: '/admin/dashboard',
      maintenance: '/maintenance/dashboard',
      owner: '/owner/dashboard',
      tenant: '/tenant/dashboard',
    }
    return <Navigate to={paths[user.role] || '/login'} replace />
  }

  return <Outlet />
}

