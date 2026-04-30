import { api } from './api'

export type CampaignStatus =
  | 'DRAFT'
  | 'QUEUED'
  | 'SENDING'
  | 'SENT'
  | 'FAILED'
  | 'SCHEDULED'
  | 'CANCELLED'

export type RecipientStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'BOUNCED' | 'FAILED' | 'OPTED_OUT'
export type EmailEventType =
  | 'DELIVERED'
  | 'OPENED'
  | 'CLICKED'
  | 'BOUNCED'
  | 'COMPLAINED'
  | 'UNSUBSCRIBED'

export interface CampaignJournalist {
  id: string
  name: string
  email: string
  outlet: string
}

export interface CampaignRecipient {
  id: string
  campaignId: string
  journalistId: string
  status: RecipientStatus
  sentAt: string | null
  trackingToken: string
  journalist: CampaignJournalist
}

export interface EmailEvent {
  id: string
  campaignId: string
  journalistId: string
  eventType: EmailEventType
  clickedUrl: string | null
  ipAddress: string | null
  userAgent: string | null
  occurredAt: string
  journalist: CampaignJournalist
}

export interface Campaign {
  id: string
  userId: string
  pressReleaseId: string
  name: string
  subject: string
  status: CampaignStatus
  scheduledAt: string | null
  sentAt: string | null
  totalRecipients: number
  createdAt: string
  updatedAt: string
  pressRelease?: { id: string; title: string }
  recipients?: CampaignRecipient[]
  _count?: { recipients: number; emailEvents: number }
}

export interface CampaignMetrics {
  id: string
  name: string
  subject: string
  status: CampaignStatus
  sentAt: string | null
  totalRecipients: number
  metrics: {
    delivered: number
    opened: number
    clicked: number
    bounced: number
    complained: number
    unsubscribed: number
    openRate: number
    clickRate: number
    bounceRate: number
  }
}

export interface CampaignReport {
  campaign: {
    id: string
    name: string
    subject: string
    status: CampaignStatus
    sentAt: string | null
    totalRecipients: number
  }
  metrics: CampaignMetrics['metrics']
  events: EmailEvent[]
}

export interface CampaignListResponse {
  data: Campaign[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export interface CampaignQuery {
  search?: string
  status?: CampaignStatus
  page?: number
  limit?: number
}

export interface CreateCampaignPayload {
  pressReleaseId: string
  name: string
  subject: string
  journalistIds?: string[]
  mailingListIds?: string[]
  scheduledAt?: string
}

export interface EventsResponse {
  data: EmailEvent[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export const campaignsService = {
  list: (query?: CampaignQuery) =>
    api.get<CampaignListResponse>('/campaigns', { params: query }).then((r) => r.data),

  get: (id: string) => api.get<Campaign>(`/campaigns/${id}`).then((r) => r.data),

  create: (payload: CreateCampaignPayload) =>
    api.post<Campaign>('/campaigns', payload).then((r) => r.data),

  remove: (id: string) => api.delete(`/campaigns/${id}`),

  send: (id: string) => api.post(`/campaigns/${id}/send`).then((r) => r.data),

  schedule: (id: string, scheduledAt: string) =>
    api.post(`/campaigns/${id}/schedule`, { scheduledAt }).then((r) => r.data),

  getReport: (id: string) => api.get<CampaignReport>(`/campaigns/${id}/report`).then((r) => r.data),

  getMetrics: (id: string) =>
    api.get<CampaignMetrics>(`/analytics/campaigns/${id}`).then((r) => r.data),

  getEvents: (id: string, page = 1, limit = 50) =>
    api
      .get<EventsResponse>(`/analytics/campaigns/${id}/events`, { params: { page, limit } })
      .then((r) => r.data),
}
