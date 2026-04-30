'use client'

import Link from 'next/link'
import { AlertCircle, X } from 'lucide-react'
import { useState } from 'react'
import { useMySubscription } from '@/hooks/useSubscriptions'
import { differenceInDays, isAfter } from 'date-fns'
import { useAuthStore } from '@/store/auth.store'

export function SubscriptionExpiryBanner() {
  const { user } = useAuthStore()
  const [dismissed, setDismissed] = useState(false)
  const { data: subscription } = useMySubscription()

  if (!user || user.role === 'ADMIN' || dismissed) return null
  if (!subscription || subscription.status !== 'ACTIVE') return null
  if (!subscription.expiresAt) return null

  const expiresAt = new Date(subscription.expiresAt)
  if (isAfter(new Date(), expiresAt)) return null

  const daysLeft = differenceInDays(expiresAt, new Date())
  if (daysLeft > 7) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 text-amber-800">
        <AlertCircle size={15} className="shrink-0 text-amber-600" />
        <span>
          A sua assinatura expira{' '}
          {daysLeft === 0 ? 'hoje' : `em ${daysLeft} ${daysLeft === 1 ? 'dia' : 'dias'}`}.{' '}
          <Link href="/assinatura" className="underline font-medium hover:text-amber-900">
            Renovar agora
          </Link>
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-0.5 text-amber-600 hover:text-amber-900 rounded transition-colors"
        aria-label="Fechar"
      >
        <X size={14} />
      </button>
    </div>
  )
}
