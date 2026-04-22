import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  pressReleasesService,
  type PressReleaseQuery,
  type CreatePressReleasePayload,
  type UpdatePressReleasePayload,
} from '@/services/press-releases.service'
import { toast } from 'sonner'

export const pressReleaseKeys = {
  all: ['press-releases'] as const,
  list: (query?: PressReleaseQuery) => [...pressReleaseKeys.all, 'list', query] as const,
  detail: (id: string) => [...pressReleaseKeys.all, 'detail', id] as const,
}

export function usePressReleases(query?: PressReleaseQuery) {
  return useQuery({
    queryKey: pressReleaseKeys.list(query),
    queryFn: () => pressReleasesService.list(query),
  })
}

export function usePressRelease(id: string) {
  return useQuery({
    queryKey: pressReleaseKeys.detail(id),
    queryFn: () => pressReleasesService.get(id),
    enabled: !!id,
  })
}

export function useCreatePressRelease() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePressReleasePayload) => pressReleasesService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pressReleaseKeys.all })
      toast.success('Press release criado')
    },
    onError: () => toast.error('Erro ao criar press release'),
  })
}

export function useUpdatePressRelease() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePressReleasePayload }) =>
      pressReleasesService.update(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: pressReleaseKeys.detail(id) })
      qc.invalidateQueries({ queryKey: pressReleaseKeys.list() })
    },
  })
}

export function usePublishPressRelease() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pressReleasesService.publish(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pressReleaseKeys.all })
      toast.success('Press release publicado!')
    },
    onError: () => toast.error('Erro ao publicar'),
  })
}

export function useArchivePressRelease() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pressReleasesService.archive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pressReleaseKeys.all })
      toast.success('Press release arquivado')
    },
  })
}

export function useDuplicatePressRelease() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pressReleasesService.duplicate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pressReleaseKeys.all })
      toast.success('Press release duplicado como rascunho')
    },
  })
}

export function useDeletePressRelease() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pressReleasesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pressReleaseKeys.all })
      toast.success('Press release eliminado')
    },
    onError: () => toast.error('Erro ao eliminar'),
  })
}

export function useUploadAttachment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      pressReleasesService.uploadAttachment(id, file),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: pressReleaseKeys.detail(id) })
      toast.success('Ficheiro carregado')
    },
    onError: () => toast.error('Erro ao carregar ficheiro'),
  })
}

export function useRemoveAttachment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, attachmentId }: { id: string; attachmentId: string }) =>
      pressReleasesService.removeAttachment(id, attachmentId),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: pressReleaseKeys.detail(id) })
      toast.success('Anexo removido')
    },
  })
}
