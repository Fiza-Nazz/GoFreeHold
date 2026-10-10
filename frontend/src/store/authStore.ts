import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, UserRole } from '../types'
import apiClient from '../api/axios'
import { exitImpersonation, startImpersonation } from '../api/platform'

// ΓöÇΓöÇΓöÇ Types ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
interface AuthStore {
  user: User | null
  token: string | null
  rememberMe: boolean
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  /** Platform admin identity preserved while impersonating an owner/staff user */
  impersonator: User | null

  // Actions
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>
  logout: () => Promise<void>
  register: (data: RegisterPayload) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (data: ResetPasswordPayload) => Promise<void>
  clearError: () => void
  setUser: (user: User) => void
  /** Rehydrate session from GET /user when a token exists */
  hydrateUser: () => Promise<void>
  startImpersonation: (userId: number) => Promise<void>
  exitImpersonation: () => Promise<void>
  hasPermission: (permission: string) => boolean
}

interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  role: UserRole
  recaptcha_token: string
}

interface ResetPasswordPayload {
  token: string
  email: string
  password: string
  password_confirmation: string
}

function persistSession(user: User, token: string, rememberMe: boolean) {
  const storage = rememberMe ? localStorage : sessionStorage
  const other = rememberMe ? sessionStorage : localStorage
  storage.setItem('gfh_token', token)
  storage.setItem('gfh_user', JSON.stringify(user))
  other.removeItem('gfh_token')
  other.removeItem('gfh_user')
}

function clearSessionStorage() {
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem('gfh_token')
    storage.removeItem('gfh_user')
    storage.removeItem('gfh-auth')
  }
}

function assertNotSuspended(user: User) {
  if (user.organization?.status === 'suspended') {
    const err = new Error('This organization account is suspended. Contact GoFreeHold support.')
    ;(err as any).code = 'ACCOUNT_ACCESS_DENIED'
    throw err
  }
  if (user.account_status === 'disabled') {
    const err = new Error('This user account is disabled.')
    ;(err as any).code = 'ACCOUNT_ACCESS_DENIED'
    throw err
  }
}

// ΓöÇΓöÇΓöÇ Store ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      rememberMe: false,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      impersonator: null,

      // ΓöÇΓöÇ Login ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
      login: async (email, password, rememberMe) => {
        clearSessionStorage()
        set({ isLoading: true, error: null, impersonator: null })
        try {
          const { data } = await apiClient.post('/auth/login', {
            email,
            password,
            remember_me: rememberMe,
          })

          const { user, token } = data.data
          assertNotSuspended(user)
          persistSession(user, token, rememberMe)
          set({ user, token, rememberMe, isAuthenticated: true, isLoading: false, impersonator: null })
        } catch (err: any) {
          const isNetwork = !err.response && (err.message === 'Network Error' || err.code === 'ERR_NETWORK' || err.name === 'AxiosError')
          const message =
            err.response?.data?.message ||
            err.message ||
            (isNetwork
              ? 'Unable to connect to the server. Please check your internet connection or try again.'
              : 'Login failed. Please try again.')
          set({ error: message, isLoading: false })
          throw err
        }
      },

      // ΓöÇΓöÇ Logout ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
      logout: async () => {
        try {
          await apiClient.post('/auth/logout')
        } catch {
          // Logout even if API call fails
        } finally {
          clearSessionStorage()
          set({ user: null, token: null, isAuthenticated: false, rememberMe: false, impersonator: null })
        }
      },

      // ΓöÇΓöÇ Register ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
      register: async (data) => {
        // Platform admin accounts are never created via public registration.
        if (data.role === 'admin') {
          const message = 'Platform admin accounts cannot be self-registered.'
          set({ error: message, isLoading: false })
          throw new Error(message)
        }
        set({ isLoading: true, error: null })
        try {
          await apiClient.post('/auth/register', data)
          set({ isLoading: false })
        } catch (err: any) {
          const message =
            err.response?.data?.message || 'Registration failed. Please try again.'
          set({ error: message, isLoading: false })
          throw err
        }
      },

      // ΓöÇΓöÇ Forgot Password ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null })
        try {
          await apiClient.post('/auth/forgot-password', { email })
          set({ isLoading: false })
        } catch (err: any) {
          const message = err.response?.data?.message || 'Failed to send reset email.'
          set({ error: message, isLoading: false })
          throw err
        }
      },

      // ΓöÇΓöÇ Reset Password ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
      resetPassword: async (data) => {
        set({ isLoading: true, error: null })
        try {
          await apiClient.post('/auth/reset-password', data)
          set({ isLoading: false })
        } catch (err: any) {
          const message = err.response?.data?.message || 'Failed to reset password.'
          set({ error: message, isLoading: false })
          throw err
        }
      },

      clearError: () => set({ error: null }),
      setUser: (user) => {
        const rememberMe = get().rememberMe
        const token = get().token
        if (token) persistSession(user, token, rememberMe)
        set({ user })
      },

      hydrateUser: async () => {
        const token =
          get().token ||
          localStorage.getItem('gfh_token') ||
          sessionStorage.getItem('gfh_token')
        if (!token) return
        try {
          const { data } = await apiClient.get('/user')
          if (token !== (localStorage.getItem('gfh_token') || sessionStorage.getItem('gfh_token'))) return
          const user = data.data?.user || data.data || data.user
          if (user) {
            assertNotSuspended(user)
            const rememberMe = get().rememberMe
            persistSession(user, token, rememberMe)
            set({
              user,
              token,
              isAuthenticated: true,
              impersonator: user.impersonation?.active ? get().impersonator : null,
            })
          }
        } catch {
          clearSessionStorage()
          set({ user: null, token: null, isAuthenticated: false, impersonator: null })
        }
      },

      startImpersonation: async (userId) => {
        const current = get().user
        if (!current || current.role !== 'admin') {
          throw new Error('Only platform admins can impersonate users.')
        }
        set({ isLoading: true, error: null })
        try {
          const result = await startImpersonation(userId)
          if (!result.token || !result.user) {
            throw new Error('Impersonation response was incomplete.')
          }
          const targetUser: User = {
            ...result.user,
            impersonation: result.impersonation || {
              active: true,
              actor_id: current.id,
              actor_name: current.name,
              target_user_id: userId,
              started_at: new Date().toISOString(),
            },
          }
          assertNotSuspended(targetUser)
          persistSession(targetUser, result.token, get().rememberMe)
          set({
            impersonator: current,
            user: targetUser,
            token: result.token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (err: any) {
          const message = err.response?.data?.message || err.message || 'Failed to start impersonation.'
          set({ error: message, isLoading: false })
          throw err
        }
      },

      exitImpersonation: async () => {
        set({ isLoading: true, error: null })
        try {
          const result = await exitImpersonation()
          const adminUser = result.user || get().impersonator
          const token = result.token || get().token
          if (!adminUser || !token) {
            throw new Error('Unable to restore platform admin session.')
          }
          const restored: User = { ...adminUser, impersonation: null }
          persistSession(restored, token, get().rememberMe)
          set({
            user: restored,
            token,
            impersonator: null,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (err: any) {
          const message = err.response?.data?.message || err.message || 'Failed to exit impersonation.'
          set({ error: message, isLoading: false })
          throw err
        }
      },

      hasPermission: (permission) => {
        const user = get().user
        if (!user) return false
        if (user.role === 'admin') return true
        return (user.permissions || []).includes(permission)
      },
    }),
    {
      name: 'gfh-auth',
      storage: createJSONStorage(() => ({
        getItem: (name: string): string | null => {
          try {
            return localStorage.getItem(name) ?? sessionStorage.getItem(name)
          } catch {
            return null
          }
        },
        setItem: (name: string, value: string): void => {
          try {
            const rememberMe = JSON.parse(value)?.state?.rememberMe === true
            if (rememberMe) {
              localStorage.setItem(name, value)
              sessionStorage.removeItem(name)
            } else {
              sessionStorage.setItem(name, value)
              localStorage.removeItem(name)
            }
          } catch {
            sessionStorage.setItem(name, value)
          }
        },
        removeItem: (name: string): void => {
          localStorage.removeItem(name)
          sessionStorage.removeItem(name)
        },
      })),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        rememberMe: state.rememberMe,
        isAuthenticated: state.isAuthenticated,
        impersonator: state.impersonator,
      }),
    }
  )
)

// ΓöÇΓöÇΓöÇ Role-based redirect helper ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
export const getRoleDashboardPath = (role: UserRole): string => {
  const paths: Record<UserRole, string> = {
    admin: '/admin/dashboard',
    maintenance: '/maintenance/dashboard',
    owner: '/owner/dashboard',
    tenant: '/tenant/dashboard',
    cashier: '/cashier/dashboard',
    accountant: '/accountant/dashboard',
  }
  return paths[role] || '/login'
}
