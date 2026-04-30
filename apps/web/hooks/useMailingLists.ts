'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  mailingListsService,
  type CreateMailingListPayload,
  type UpdateMailingListPayload,
} from '@/services/mailing-lists.service'

export const mailingListKeys = {
  all: ['mailing-lists'] as const,
  list: () => [...mailingListKeys.all, 'list'] as const,
  detail: (id: string) => [...mailingListKeys.all, 'detail', id] as const,
}

export function useMailingLists() {
  return useQuery({
    queryKey: mailingListKeys.list(),
    queryFn: () => mailingListsService.list(),
  })
}

export function useMailingList(id: string) {
  return useQuery({
    queryKey: mailingListKeys.detail(id),
    queryFn: () => mailingListsService.get(id),
    enabled: !!id,
  })
}

export function useCreateMailingList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateMailingListPayload) => mailingListsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mailingListKeys.all })
      toast.success('Lista criada com sucesso')
    },
    onError: () => toast.error('Erro ao criar lista'),
  })
}

export function useUpdateMailingList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMailingListPayload }) =>
      mailingListsService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mailingListKeys.all })
      toast.success('Lista actualizada')
    },
    onError: () => toast.error('Erro ao actualizar lista'),
  })
}

export function useDeleteMailingList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => mailingListsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: mailingListKeys.all })
      toast.success('Lista removida')
    },
    onError: () => toast.error('Erro ao remover lista'),
  })
}

export function useAddContacts() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, journalistIds }: { id: string; journalistIds: string[] }) =>
      mailingListsService.addContacts(id, journalistIds),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: mailingListKeys.detail(id) })
      toast.success('Jornalistas adicionados à lista')
    },
    onError: () => toast.error('Erro ao adicionar jornalistas'),
  })
}

export function useRemoveContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ listId, journalistId }: { listId: string; journalistId: string }) =>
      mailingListsService.removeContact(listId, journalistId),
    onSuccess: (_data, { listId }) => {
      qc.invalidateQueries({ queryKey: mailingListKeys.detail(listId) })
      toast.success('Jornalista removido da lista')
    },
    onError: () => toast.error('Erro ao remover jornalista'),
  })
}
