import axios, { CanceledError } from 'axios'

/**
 * Centralized Axios instance for GoFreeHold API.
 * Base URL is configured via VITE_API_BASE_URL in .env
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api2.gofreehold.com/public/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  withCredentials: false,
})

// ─── Request Interceptor ───────────────────────────────────────────────────────
// Attach Bearer token from storage on every request
apiClient.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      // The browser supplies the multipart boundary; JSON would discard file bytes.
      config.headers.delete('Content-Type')
    }
    const token =
      localStorage.getItem('gfh_token') || sessionStorage.getItem('gfh_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ──────────────────────────────────────────────────────
// Handle 401 globally → clear token and redirect to login
apiClient.interceptors.response.use(
  (response) => {
    const sent = response.config.headers.Authorization
    const current = localStorage.getItem('gfh_token') || sessionStorage.getItem('gfh_token')
    if (sent && sent !== `Bearer ${current}`) throw new CanceledError('Session changed')
    return response
  },
  (error) => {
    if (error.response?.status === 401 || error.response?.data?.code === 'ACCOUNT_ACCESS_DENIED') {
      localStorage.removeItem('gfh-auth')
      sessionStorage.removeItem('gfh-auth')
      localStorage.removeItem('gfh_token')
      sessionStorage.removeItem('gfh_token')
      localStorage.removeItem('gfh_user')
      sessionStorage.removeItem('gfh_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
