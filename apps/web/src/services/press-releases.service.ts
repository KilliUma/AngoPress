import { api } from '@/lib/api'

export type PressReleaseStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED'

export interface PressReleaseAttachment {
  id: string
  pressReleaseId: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  createdAt: string
}

export interface PressRelease {
  id: string
  userId: string
  title: string
  content: string
  summary: string | null
  status: PressReleaseStatus
  scheduledAt: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  attachments: PressReleaseAttachment[]
  _count?: { campaigns: number }
}

export interface PressReleaseListResponse {
  data: PressRelease[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface PressReleaseQuery {
  search?: string
  status?: PressReleaseStatus
  page?: number
  limit?: number
}

export interface CreatePressReleasePayload {
  title: string
  content: string
  summary?: string
  status?: PressReleaseStatus
  scheduledAt?: string
}

export type UpdatePressReleasePayload = Partial<CreatePressReleasePayload>

export const pressReleasesService = {
  list: (query?: PressReleaseQuery) =>
    api.get<PressReleaseListResponse>('/press-releases', { params: query }).then((r) => r.data),

  get: (id: string) => api.get<PressRelease>(`/press-releases/${id}`).then((r) => r.data),

  create: (payload: CreatePressReleasePayload) =>
    api.post<PressRelease>('/press-releases', payload).then((r) => r.data),

  update: (id: string, payload: UpdatePressReleasePayload) =>
    api.put<PressRelease>(`/press-releases/${id}`, payload).then((r) => r.data),

  publish: (id: string) =>
    api.post<PressRelease>(`/press-releases/${id}/publish`).then((r) => r.data),

  archive: (id: string) =>
    api.post<PressRelease>(`/press-releases/${id}/archive`).then((r) => r.data),

  duplicate: (id: string) =>
    api.post<PressRelease>(`/press-releases/${id}/duplicate`).then((r) => r.data),

  remove: (id: string) => api.delete(`/press-releases/${id}`),

  previewUrl: (id: string) =>
    `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api/v1/press-releases/${id}/preview`,

  uploadAttachment: (id: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api
      .post<PressReleaseAttachment>(`/press-releases/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  removeAttachment: (id: string, attachmentId: string) =>
    api.delete(`/press-releases/${id}/attachments/${attachmentId}`),
}
