import { api } from '@/lib/api'
import type { Journalist } from './journalists.service'

export interface MailingList {
  id: string
  userId: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  _count: { contacts: number }
}

export interface MailingListContact {
  id: string
  listId: string
  journalistId: string
  addedAt: string
  journalist: Journalist
}

export interface MailingListDetail extends MailingList {
  contacts: MailingListContact[]
}

export interface CreateMailingListPayload {
  name: string
  description?: string
}

export type UpdateMailingListPayload = Partial<CreateMailingListPayload>

export const mailingListsService = {
  list: () => api.get<MailingList[]>('/mailing-lists').then((r) => r.data),

  get: (id: string) => api.get<MailingListDetail>(`/mailing-lists/${id}`).then((r) => r.data),

  create: (payload: CreateMailingListPayload) =>
    api.post<MailingList>('/mailing-lists', payload).then((r) => r.data),

  update: (id: string, payload: UpdateMailingListPayload) =>
    api.put<MailingList>(`/mailing-lists/${id}`, payload).then((r) => r.data),

  remove: (id: string) => api.delete(`/mailing-lists/${id}`),

  addContacts: (id: string, journalistIds: string[]) =>
    api
      .post<MailingListDetail>(`/mailing-lists/${id}/contacts`, { journalistIds })
      .then((r) => r.data),

  removeContact: (id: string, journalistId: string) =>
    api.delete(`/mailing-lists/${id}/contacts/${journalistId}`),
}
