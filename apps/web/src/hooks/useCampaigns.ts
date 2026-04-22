import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { campaignsService } from '@/services/campaigns.service'
import type { CampaignQuery, CreateCampaignPayload } from '@/services/campaigns.service'

const KEYS = {
  list: (q?: CampaignQuery) => ['campaigns', q],
  detail: (id?: string) => ['campaigns', id],
  report: (id: string) => ['campaigns', id, 'report'],
  metrics: (id: string) => ['campaigns', id, 'metrics'],
  events: (id: string, page?: number) => ['campaigns', id, 'events', page],
}

export function useCampaigns(query?: CampaignQuery) {
  return useQuery({
    queryKey: KEYS.list(query),
    queryFn: () => campaignsService.list(query),
  })
}

export function useCampaign(id?: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => campaignsService.get(id!),
    enabled: Boolean(id),
  })
}

export function useCampaignMetrics(id: string, pollingMs = 0) {
  return useQuery({
    queryKey: KEYS.metrics(id),
    queryFn: () => campaignsService.getMetrics(id),
    refetchInterval: pollingMs > 0 ? pollingMs : false,
  })
}

export function useCampaignReport(id: string) {
  return useQuery({
    queryKey: KEYS.report(id),
    queryFn: () => campaignsService.getReport(id),
  })
}

export function useCampaignEvents(id: string, page = 1) {
  return useQuery({
    queryKey: KEYS.events(id, page),
    queryFn: () => campaignsService.getEvents(id, page),
  })
}

export function useCreateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCampaignPayload) => campaignsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Campanha criada com sucesso')
    },
    onError: (e: Error) => toast.error(e.message || 'Erro ao criar campanha'),
  })
}

export function useDeleteCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => campaignsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Campanha eliminada')
    },
    onError: () => toast.error('Erro ao eliminar campanha'),
  })
}

export function useSendCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => campaignsService.send(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Campanha enfileirada para envio')
    },
    onError: (e: Error) => toast.error(e.message || 'Erro ao enviar campanha'),
  })
}

export function useScheduleCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, scheduledAt }: { id: string; scheduledAt: string }) =>
      campaignsService.schedule(id, scheduledAt),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Campanha agendada com sucesso')
    },
    onError: (e: Error) => toast.error(e.message || 'Erro ao agendar campanha'),
  })
}
