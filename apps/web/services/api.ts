import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

// Interceptor: em 401 tenta refresh automático, excepto em endpoints de auth.
let isRefreshing = false
let failedQueue: Array<{ resolve: () => void; reject: (e: unknown) => void }> = []

const AUTH_SKIP_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
]

function processQueue(error: unknown) {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()))
  failedQueue = []
}

function shouldSkipRefresh(url?: string): boolean {
  if (!url) return false
  return AUTH_SKIP_REFRESH_PATHS.some((path) => url.includes(path))
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined
    const status = error.response?.status
    const requestUrl = String(original?.url ?? '')

    if (status !== 401 || !original) {
      return Promise.reject(error)
    }

    // Login/registro/refresh nunca devem acionar refresh automático.
    if (shouldSkipRefresh(requestUrl) || original._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve: () => resolve(api(original)), reject })
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      await api.post('/auth/refresh')
      processQueue(null)
      return api(original)
    } catch (refreshError) {
      processQueue(refreshError)
      if (typeof window !== 'undefined') window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
