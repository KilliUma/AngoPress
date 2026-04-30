import { api } from './api'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'CLIENT'
  status: string
  company: string | null
  phone: string | null
  avatarUrl: string | null
  createdAt: string
}

export interface AuthResponse {
  user: AuthUser
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  company: string
}

export interface LoginPayload {
  email: string
  password: string
}

export const authService = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    return data
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', payload)
    return data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email })
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, password })
  },

  getProfile: async (): Promise<AuthUser> => {
    const { data } = await api.get<AuthUser>('/auth/me')
    return data
  },

  updateProfile: async (payload: {
    name?: string
    company?: string | null
    phone?: string | null
    currentPassword?: string
    newPassword?: string
  }): Promise<AuthUser> => {
    const { data } = await api.patch<AuthUser>('/auth/me', payload)
    return data
  },
}
