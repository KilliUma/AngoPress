'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  journalistsService,
  type JournalistQuery,
  type CreateJournalistPayload,
  type UpdateJournalistPayload,
} from '@/services/journalists.service'

export const journalistKeys = {
  all: ['journalists'] as const,
  list: (query?: JournalistQuery) => [...journalistKeys.all, 'list', query] as const,
  detail: (id: string) => [...journalistKeys.all, 'detail', id] as const,
}

export function useJournalists(query?: JournalistQuery) {
  return useQuery({
    queryKey: journalistKeys.list(query),
    queryFn: () => journalistsService.list(query),
  })
}

export function useJournalist(id: string) {
  return useQuery({
    queryKey: journalistKeys.detail(id),
    queryFn: () => journalistsService.get(id),
    enabled: !!id,
  })
}

export function useCreateJournalist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateJournalistPayload) => journalistsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: journalistKeys.all })
      toast.success('Jornalista criado com sucesso')
    },
    onError: (e: { response?: { data?: { message?: string } } }) =>
      toast.error(e.response?.data?.message || 'Erro ao criar jornalista'),
  })
}

export function useUpdateJournalist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateJournalistPayload }) =>
      journalistsService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: journalistKeys.all })
      toast.success('Jornalista actualizado')
    },
    onError: (e: { response?: { data?: { message?: string } } }) =>
      toast.error(e.response?.data?.message || 'Erro ao actualizar jornalista'),
  })
}

export function useDeleteJournalist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => journalistsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: journalistKeys.all })
      toast.success('Jornalista removido')
    },
    onError: () => toast.error('Erro ao remover jornalista'),
  })
}
