import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type UserRole = 'ADMIN' | 'CLIENT'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string | null
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  setAccessToken: (token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),

      setAccessToken: (accessToken) => set({ accessToken }),

      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: 'angopress-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
