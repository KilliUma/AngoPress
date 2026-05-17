import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'ADMIN' | 'CLIENT'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: string
  company: string | null
  phone: string | null
  avatarUrl: string | null
  senderName: string | null
  senderEmail: string | null
  emailSignatureText: string | null
  emailSignatureImageUrl: string | null
  createdAt: string
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  setUser: (user: AuthUser) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      clearAuth: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'angopress-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      skipHydration: true,
    },
  ),
)
