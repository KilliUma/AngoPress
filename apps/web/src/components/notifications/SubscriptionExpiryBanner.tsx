import { differenceInDays, parseISO } from 'date-fns'
import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'
import { useMySubscription } from '@/hooks/useSubscriptions'

export function SubscriptionExpiryBanner() {
  const { data: subscription } = useMySubscription()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || !subscription) return null
  if (subscription.status !== 'ACTIVE') return null
  if (!subscription.expiresAt) return null

  const daysLeft = differenceInDays(parseISO(subscription.expiresAt as string), new Date())
  if (daysLeft > 7 || daysLeft < 0) return null

  const urgency =
    daysLeft <= 2
      ? 'bg-red-50 border-red-200 text-red-800'
      : 'bg-amber-50 border-amber-200 text-amber-800'

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-2.5 border-b text-sm ${urgency}`}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle size={15} className="shrink-0" />
        <span>
          A sua assinatura <strong>{subscription.plan.name}</strong> expira em{' '}
          <strong>{daysLeft === 0 ? 'hoje' : `${daysLeft} dia${daysLeft !== 1 ? 's' : ''}`}</strong>
          .{' '}
          <a href="/assinatura" className="underline font-medium">
            Renovar agora
          </a>
        </span>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Fechar aviso"
      >
        <X size={14} />
      </button>
    </div>
  )
}
