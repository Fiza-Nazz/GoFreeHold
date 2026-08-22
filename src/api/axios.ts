import axios from 'axios'

/**
 * Centralized Axios instance for GoFreeHold API.
 * Base URL is configured via VITE_API_BASE_URL in .env
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false,
})

// ─── Request Interceptor ───────────────────────────────────────────────────────
// Attach Bearer token from storage on every request
apiClient.interceptors.request.use(
  (config) => {
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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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
