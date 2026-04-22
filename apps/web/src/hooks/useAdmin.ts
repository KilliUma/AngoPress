import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminService } from '@/services/admin.service'
import type {
  UsersQuery,
  SubscriptionsQuery,
  JournalistRegistrationsQuery,
  ActivateSubscriptionPayload,
  CreatePlanPayload,
  UserStatus,
  JournalistRegistrationStatus,
} from '@/services/admin.service'

const KEYS = {
  stats: ['admin', 'stats'] as const,
  users: (q?: UsersQuery) => ['admin', 'users', q] as const,
  subscriptions: (q?: SubscriptionsQuery) => ['admin', 'subscriptions', q] as const,
  plans: ['admin', 'plans'] as const,
  journalistRegs: (q?: JournalistRegistrationsQuery) =>
    ['admin', 'journalist-registrations', q] as const,
}

export function useAdminStats() {
  return useQuery({
    queryKey: KEYS.stats,
    queryFn: () => adminService.getStats(),
  })
}

export function useAdminUsers(query?: UsersQuery) {
  return useQuery({
    queryKey: KEYS.users(query),
    queryFn: () => adminService.getUsers(query),
  })
}

export function useUpdateUserStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: UserStatus }) =>
      adminService.updateUserStatus(userId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('Estado do utilizador actualizado')
    },
    onError: (e: Error) => toast.error(e.message || 'Erro ao actualizar estado'),
  })
}

export function useAdminSubscriptions(query?: SubscriptionsQuery) {
  return useQuery({
    queryKey: KEYS.subscriptions(query),
    queryFn: () => adminService.getSubscriptions(query),
  })
}

export function useActivateSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: ActivateSubscriptionPayload }) =>
      adminService.activateSubscription(userId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'subscriptions'] })
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      toast.success('Assinatura activada com sucesso!')
    },
    onError: (e: Error) => toast.error(e.message || 'Erro ao activar assinatura'),
  })
}

export function useAdminPlans() {
  return useQuery({
    queryKey: KEYS.plans,
    queryFn: () => adminService.getPlans(),
  })
}

export function useCreatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePlanPayload) => adminService.createPlan(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.plans })
      toast.success('Plano criado com sucesso')
    },
    onError: (e: Error) => toast.error(e.message || 'Erro ao criar plano'),
  })
}

export function useUpdatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreatePlanPayload> }) =>
      adminService.updatePlan(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.plans })
      toast.success('Plano actualizado')
    },
    onError: (e: Error) => toast.error(e.message || 'Erro ao actualizar plano'),
  })
}

export function useDeletePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminService.deletePlan(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.plans })
      toast.success('Plano desactivado')
    },
    onError: (e: Error) => toast.error(e.message || 'Erro ao desactivar plano'),
  })
}

export function useJournalistRegistrations(query?: JournalistRegistrationsQuery) {
  return useQuery({
    queryKey: KEYS.journalistRegs(query),
    queryFn: () => adminService.getJournalistRegistrations(query),
  })
}

export function useReviewJournalistRegistration() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: string
      status: JournalistRegistrationStatus
      notes?: string
    }) => adminService.reviewJournalistRegistration(id, status, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'journalist-registrations'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      toast.success('Registo revisto com sucesso')
    },
    onError: (e: Error) => toast.error(e.message || 'Erro ao rever registo'),
  })
}
