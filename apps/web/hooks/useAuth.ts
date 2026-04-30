'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authService, type RegisterPayload, type LoginPayload } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'

export function useRegister() {
  const { setUser } = useAuthStore()
  const router = useRouter()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: ({ user }) => {
      setUser(user)
      qc.clear()
      // Novos registos são sempre CLIENT → dashboard do cliente
      router.push('/dashboard')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Erro ao criar conta. Tente novamente.')
    },
  })
}

export function useLogin() {
  const { setUser } = useAuthStore()
  const router = useRouter()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: ({ user }) => {
      setUser(user)
      qc.clear()
      // Redireccionamento por role: admin → /admin, cliente → /dashboard
      router.push(user.role === 'ADMIN' ? '/admin' : '/dashboard')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Credenciais inválidas. Tente novamente.')
    },
  })
}

export function useLogout() {
  const router = useRouter()
  const { clearAuth } = useAuthStore()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearAuth()
      router.push('/login')
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: () => {
      toast.success('Se o email existir, receberá instruções em breve.')
    },
    onError: () => {
      toast.success('Se o email existir, receberá instruções em breve.')
    },
  })
}

export function useResetPassword() {
  const router = useRouter()

  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authService.resetPassword(token, password),
    onSuccess: () => {
      toast.success('Password redefinida com sucesso!')
      router.push('/login')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Token inválido ou expirado')
    },
  })
}

export function useProfile() {
  return useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: () => authService.getProfile(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateProfile() {
  const { setUser } = useAuthStore()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: Parameters<typeof authService.updateProfile>[0]) =>
      authService.updateProfile(payload),
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      qc.setQueryData(['auth', 'profile'], updatedUser)
      toast.success('Perfil actualizado com sucesso!')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Erro ao actualizar perfil.')
    },
  })
}
