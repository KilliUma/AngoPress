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
    // Revalida a cada 15s — detecta activação pelo admin em tempo real
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
    onError: (e: Error) => toast.error(e.message || 'Erro ao solicitar assinatura'),
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
    onError: (e: Error) => toast.error(e.message || 'Erro ao cancelar assinatura'),
  })
}
