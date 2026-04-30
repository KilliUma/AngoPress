import { api } from './api'
import type { SubscriptionPlan, Subscription } from './subscriptions.service'

export type UserRole = 'ADMIN' | 'CLIENT'
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING'
export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
export type JournalistRegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type MediaType = 'PRINT' | 'ONLINE' | 'TV' | 'RADIO' | 'AGENCY'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  company: string | null
  createdAt: string
  subscription: {
    id: string
    status: SubscriptionStatus
    expiresAt: string | null
    sendsUsed: number
    plan: { id: string; name: string; maxSendsMonth: number } | null
  } | null
}

export interface AdminSubscription {
  id: string
  userId: string
  planId: string
  status: SubscriptionStatus
  activatedAt: string | null
  expiresAt: string | null
  sendsUsed: number
  adminNotes: string | null
  createdAt: string
  user: { id: string; name: string; email: string; company: string | null }
  plan: { id: string; name: string; priceMonthlyAoa: number; maxSendsMonth: number }
}

export interface JournalistRegistration {
  id: string
  name: string
  email: string
  outlet: string
  jobTitle: string | null
  mediaType: MediaType
  city: string | null
  message: string | null
  status: JournalistRegistrationStatus
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
}

export interface AdminStats {
  totalUsers: number
  activeSubscriptions: number
  pendingSubscriptions: number
  totalCampaignsSent: number
  totalJournalists: number
  totalPressReleases: number
}

export interface PageMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UsersQuery {
  search?: string
  role?: UserRole
  status?: UserStatus
  page?: number
  limit?: number
}

export interface SubscriptionsQuery {
  status?: SubscriptionStatus
  page?: number
  limit?: number
}

export interface JournalistRegistrationsQuery {
  status?: JournalistRegistrationStatus
  page?: number
  limit?: number
}

export interface ActivateSubscriptionPayload {
  planId?: string
  expiresAt?: string
  adminNotes?: string
}

export interface CreatePlanPayload {
  name: string
  description?: string
  maxSendsMonth: number
  features: string[]
  priceMonthlyAoa: number
  priceYearlyAoa?: number
  isActive?: boolean
  sortOrder?: number
}

export const adminService = {
  getStats: () => api.get<AdminStats>('/admin/stats').then((r) => r.data),

  getUsers: (query?: UsersQuery) =>
    api
      .get<{ data: AdminUser[]; meta: PageMeta }>('/admin/users', { params: query })
      .then((r) => r.data),

  updateUserStatus: (userId: string, status: UserStatus) =>
    api.patch(`/admin/users/${userId}/status`, { status }).then((r) => r.data),

  getSubscriptions: (query?: SubscriptionsQuery) =>
    api
      .get<{ data: AdminSubscription[]; meta: PageMeta }>('/admin/subscriptions', { params: query })
      .then((r) => r.data),

  activateSubscription: (userId: string, payload: ActivateSubscriptionPayload) =>
    api.post<Subscription>(`/admin/subscriptions/${userId}/activate`, payload).then((r) => r.data),

  getPlans: () => api.get<SubscriptionPlan[]>('/admin/plans').then((r) => r.data),

  createPlan: (payload: CreatePlanPayload) =>
    api.post<SubscriptionPlan>('/admin/plans', payload).then((r) => r.data),

  updatePlan: (id: string, payload: Partial<CreatePlanPayload>) =>
    api.patch<SubscriptionPlan>(`/admin/plans/${id}`, payload).then((r) => r.data),

  deletePlan: (id: string) => api.delete(`/admin/plans/${id}`).then((r) => r.data),

  getJournalistRegistrations: (query?: JournalistRegistrationsQuery) =>
    api
      .get<{ data: JournalistRegistration[]; meta: PageMeta }>('/admin/journalist-registrations', {
        params: query,
      })
      .then((r) => r.data),

  reviewJournalistRegistration: (
    id: string,
    status: JournalistRegistrationStatus,
    notes?: string,
  ) =>
    api.post(`/admin/journalist-registrations/${id}/review`, { status, notes }).then((r) => r.data),

  getNotifications: () =>
    api
      .get<{
        pendingSubscriptions: number
        pendingJournalistRegistrations: number
      }>('/admin/notifications')
      .then((r) => r.data),
}
