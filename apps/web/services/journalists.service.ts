import { api } from './api'

export type MediaType = 'TV' | 'RADIO' | 'PRINT' | 'DIGITAL' | 'PODCAST'

export interface Journalist {
  id: string
  name: string
  email: string
  outlet: string
  jobTitle: string | null
  coverageArea: string[]
  mediaType: MediaType
  city: string | null
  province: string | null
  country: string
  phone: string | null
  isActive: boolean
  isOptedOut: boolean
  bounceCount: number
  createdAt: string
  updatedAt: string
}

export interface JournalistListResponse {
  data: Journalist[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export interface JournalistQuery {
  search?: string
  mediaType?: MediaType
  coverageArea?: string
  isActive?: string
  page?: number
  limit?: number
}

export interface CreateJournalistPayload {
  name: string
  email: string
  outlet: string
  jobTitle?: string
  mediaType: MediaType
  coverageArea?: string[]
  city?: string
  province?: string
  phone?: string
  isActive?: boolean
}

export type UpdateJournalistPayload = Partial<CreateJournalistPayload>

export interface JournalistRegistrationPayload {
  name: string
  email: string
  outlet: string
  mediaType: MediaType
  jobTitle?: string
  city?: string
  message?: string
}

export const journalistsService = {
  list: (query?: JournalistQuery) =>
    api.get<JournalistListResponse>('/journalists', { params: query }).then((r) => r.data),

  get: (id: string) => api.get<Journalist>(`/journalists/${id}`).then((r) => r.data),

  create: (payload: CreateJournalistPayload) =>
    api.post<Journalist>('/journalists', payload).then((r) => r.data),

  update: (id: string, payload: UpdateJournalistPayload) =>
    api.put<Journalist>(`/journalists/${id}`, payload).then((r) => r.data),

  remove: (id: string) => api.delete(`/journalists/${id}`),

  submitRegistration: (payload: JournalistRegistrationPayload) =>
    api.post('/journalists/registrations', payload).then((r) => r.data),
}
