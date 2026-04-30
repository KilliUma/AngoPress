import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/auth.store'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de request — adicionar o Access Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Controle de refresh em curso
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

// Interceptor de response — refresh token automático
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = useAuthStore.getState().refreshToken
        if (!refreshToken) {
          throw new Error('Sem refresh token')
        }
        const { data } = await axios.post(
          `${BASE_URL}/api/v1/auth/refresh`,
          { refreshToken },
          { withCredentials: true },
        )
        const newToken = data.accessToken
        useAuthStore.getState().setAccessToken(newToken)
        // Actualizar o refreshToken se a API devolver um novo (rotação)
        if (data.refreshToken) {
          useAuthStore.setState({ refreshToken: data.refreshToken })
        }
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
