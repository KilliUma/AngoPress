'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { subscriptionsService } from '@/services/subscriptions.service'

const KEYS = {
  plans: ['subscriptions', 'plans'] as const,
  my: ['subscriptions', 'my'] as const,
}

export function usePlans() {
  return useQuery({
    queryKey: KEYS.plans,
    queryFn: () => subscriptionsService.getPlans(),
  })
}

export function useMySubscription() {
  return useQuery({
    queryKey: KEYS.my,
    queryFn: () => subscriptionsService.getMySubscription(),
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  })
}

export function useRequestSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (planId: string) => subscriptionsService.requestSubscription(planId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.my })
      toast.success('Pedido de assinatura enviado! Aguarde a confirmação pelo administrador.')
    },
    onError: (e: { response?: { data?: { message?: string } }; message?: string }) =>
      toast.error(e.response?.data?.message || e.message || 'Erro ao solicitar assinatura'),
  })
}

export function useCancelSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => subscriptionsService.cancelSubscription(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.my })
      toast.success('Assinatura cancelada')
    },
    onError: (e: { response?: { data?: { message?: string } }; message?: string }) =>
      toast.error(e.response?.data?.message || e.message || 'Erro ao cancelar assinatura'),
  })
}
