import { api } from '@/lib/api'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'CLIENT' | 'ADMIN'
  status: string
  company: string | null
  phone: string | null
  avatarUrl: string | null
  createdAt: string
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
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
}
