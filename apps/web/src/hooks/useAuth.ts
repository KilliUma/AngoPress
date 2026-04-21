import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authService, type LoginPayload, type RegisterPayload } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'

export function useLogin() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken)
      toast.success(`Bem-vindo, ${data.user.name}!`)
      navigate(data.user.role === 'ADMIN' ? '/admin' : '/dashboard')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Email ou password incorretos')
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken)
      toast.success('Conta criada com sucesso!')
      navigate('/dashboard')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Erro ao criar conta. Tente novamente.')
    },
  })
}

export function useLogout() {
  const navigate = useNavigate()
  const { clearAuth } = useAuthStore()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearAuth()
      navigate('/login')
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
      // Não revelar se o email existe
      toast.success('Se o email existir, receberá instruções em breve.')
    },
  })
}

export function useResetPassword() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authService.resetPassword(token, password),
    onSuccess: () => {
      toast.success('Password redefinida com sucesso!')
      navigate('/login')
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
