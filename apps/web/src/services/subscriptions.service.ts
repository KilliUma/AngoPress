import { api } from '@/lib/api'

export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'

export interface SubscriptionPlan {
  id: string
  name: string
  description: string | null
  maxSendsMonth: number
  features: string[]
  priceMonthlyAoa: number
  priceYearlyAoa: number | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  userId: string
  planId: string
  status: SubscriptionStatus
  activatedAt: string | null
  expiresAt: string | null
  sendsUsed: number
  periodStart: string | null
  periodEnd: string | null
  adminNotes: string | null
  createdAt: string
  updatedAt: string
  plan: SubscriptionPlan
  sendsRemaining: number
}

export const subscriptionsService = {
  getPlans: () => api.get<SubscriptionPlan[]>('/subscriptions/plans').then((r) => r.data),

  getMySubscription: () => api.get<Subscription | null>('/subscriptions/my').then((r) => r.data),

  requestSubscription: (planId: string) =>
    api.post<Subscription>('/subscriptions/request', { planId }).then((r) => r.data),

  cancelSubscription: () => api.delete('/subscriptions/cancel').then((r) => r.data),
}
