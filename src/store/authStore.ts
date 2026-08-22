import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, UserRole } from '../types'
import apiClient from '../api/axios'

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuthStore {
  user: User | null
  token: string | null
  rememberMe: boolean
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

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

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      rememberMe: false,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ── Login ──────────────────────────────────────────────────────────────
      login: async (email, password, rememberMe) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await apiClient.post('/auth/login', {
            email,
            password,
            remember_me: rememberMe,
          })

          const { user, token } = data.data

          // Store token: localStorage for "remember me", sessionStorage otherwise
          if (rememberMe) {
            localStorage.setItem('gfh_token', token)
            localStorage.setItem('gfh_user', JSON.stringify(user))
          } else {
            sessionStorage.setItem('gfh_token', token)
            sessionStorage.setItem('gfh_user', JSON.stringify(user))
          }

          set({ user, token, rememberMe, isAuthenticated: true, isLoading: false })
        } catch (err: any) {
          const message =
            err.response?.data?.message || 'Login failed. Please try again.'
          set({ error: message, isLoading: false })
          throw err
        }
      },

      // ── Logout ─────────────────────────────────────────────────────────────
      logout: async () => {
        try {
          await apiClient.post('/auth/logout')
        } catch {
          // Logout even if API call fails
        } finally {
          localStorage.removeItem('gfh_token')
          localStorage.removeItem('gfh_user')
          sessionStorage.removeItem('gfh_token')
          sessionStorage.removeItem('gfh_user')
          set({ user: null, token: null, isAuthenticated: false, rememberMe: false })
        }
      },

      // ── Register ───────────────────────────────────────────────────────────
      register: async (data) => {
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

      // ── Forgot Password ────────────────────────────────────────────────────
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

      // ── Reset Password ─────────────────────────────────────────────────────
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
      setUser: (user) => set({ user }),

      hydrateUser: async () => {
        const token =
          get().token ||
          localStorage.getItem('gfh_token') ||
          sessionStorage.getItem('gfh_token')
        if (!token) return
        try {
          const { data } = await apiClient.get('/user')
          const user = data.data?.user || data.data || data.user
          if (user) {
            set({ user, token, isAuthenticated: true })
          }
        } catch {
          // Token invalid/expired — clear session
          localStorage.removeItem('gfh_token')
          localStorage.removeItem('gfh_user')
          sessionStorage.removeItem('gfh_token')
          sessionStorage.removeItem('gfh_user')
          set({ user: null, token: null, isAuthenticated: false })
        }
      },
    }),
    {
      name: 'gfh-auth',
      // Dynamic storage: localStorage when rememberMe, sessionStorage otherwise.
      // Must be wrapped in createJSONStorage — zustand persist expects a
      // string-based StateStorage from this factory, not raw objects.
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
      }),
    }
  )
)

// ─── Role-based redirect helper ───────────────────────────────────────────────
export const getRoleDashboardPath = (role: UserRole): string => {
  const paths: Record<UserRole, string> = {
    admin: '/admin/dashboard',
    maintenance: '/maintenance/dashboard',
    owner: '/owner/dashboard',
    tenant: '/tenant/dashboard',
  }
  return paths[role] || '/login'
}
