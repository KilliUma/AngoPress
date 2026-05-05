'use client'

import { useState, useRef } from 'react'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/services/admin.service'
import { subscriptionsService } from '@/services/subscriptions.service'
import { useAuthStore } from '@/store/auth.store'

interface NotificationItem {
  id: string
  title: string
  message: string
  link: string
  count: number
}

const formatDate = (date?: string | null) =>
  date
    ? new Intl.DateTimeFormat('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' }).format(
        new Date(date),
      )
    : null

const daysUntil = (date?: string | null) => {
  if (!date) return null
  const diff = new Date(date).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore()
  useOnClickOutside(ref, () => setOpen(false))

  const { data: adminNotifications } = useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: () => adminService.getNotifications(),
    enabled: user?.role === 'ADMIN',
    refetchInterval: 60_000,
  })

  const { data: subscription } = useQuery({
    queryKey: ['subscriptions', 'my'],
    queryFn: () => subscriptionsService.getMySubscription(),
    enabled: user?.role === 'CLIENT',
    refetchInterval: 60_000,
  })

  const adminItems: NotificationItem[] = [
    {
      id: 'pending-subscriptions',
      title: 'Assinaturas pendentes',
      message: `${adminNotifications?.pendingSubscriptions ?? 0} pedido(s) aguardam confirmação de pagamento.`,
      link: '/admin/assinaturas',
      count: adminNotifications?.pendingSubscriptions ?? 0,
    },
    {
      id: 'pending-journalists',
      title: 'Cadastros de jornalistas',
      message: `${adminNotifications?.pendingJournalistRegistrations ?? 0} pedido(s) aguardam aprovação.`,
      link: '/admin/cadastros',
      count: adminNotifications?.pendingJournalistRegistrations ?? 0,
    },
  ].filter((item) => item.count > 0)

  const expiryDays = daysUntil(subscription?.expiresAt)
  const expiryDate = formatDate(subscription?.expiresAt)
  const quotaLimit = subscription?.plan?.maxSendsMonth ?? 0
  const quotaLow =
    subscription?.status === 'ACTIVE' &&
    quotaLimit > 0 &&
    subscription.sendsRemaining > 0 &&
    subscription.sendsRemaining <= Math.max(1, Math.floor(quotaLimit * 0.2))

  const clientItems: NotificationItem[] = [
    !subscription
      ? {
          id: 'no-subscription',
          title: 'Escolha um plano',
          message: 'Ainda não existe uma assinatura associada à sua conta.',
          link: '/assinatura',
          count: 1,
        }
      : null,
    subscription?.status === 'PENDING'
      ? {
          id: 'subscription-pending',
          title: 'Pagamento em análise',
          message: 'O seu pedido de assinatura aguarda confirmação do administrador.',
          link: '/assinatura',
          count: 1,
        }
      : null,
    subscription?.status === 'EXPIRED'
      ? {
          id: 'subscription-expired',
          title: 'Assinatura expirada',
          message: 'Renove o plano para voltar a enviar campanhas.',
          link: '/assinatura',
          count: 1,
        }
      : null,
    subscription?.status === 'CANCELLED'
      ? {
          id: 'subscription-cancelled',
          title: 'Assinatura cancelada',
          message: 'Escolha um plano para reactivar os envios.',
          link: '/assinatura',
          count: 1,
        }
      : null,
    subscription?.status === 'ACTIVE' && expiryDays !== null && expiryDays <= 7
      ? {
          id: 'subscription-expiring',
          title: expiryDays < 0 ? 'Assinatura expirada' : 'Assinatura perto do fim',
          message:
            expiryDays < 0
              ? 'Renove o plano para manter a conta activa.'
              : `A sua assinatura termina${expiryDate ? ` em ${expiryDate}` : ' em breve'}.`,
          link: '/assinatura',
          count: 1,
        }
      : null,
    subscription?.status === 'ACTIVE' && subscription.sendsRemaining <= 0
      ? {
          id: 'quota-ended',
          title: 'Quota mensal esgotada',
          message: 'Atingiu o limite de envios deste mês. Renove ou altere o plano.',
          link: '/assinatura',
          count: 1,
        }
      : null,
    quotaLow
      ? {
          id: 'quota-low',
          title: 'Poucos envios restantes',
          message: `Restam ${subscription?.sendsRemaining ?? 0} envio(s) no plano actual.`,
          link: '/assinatura',
          count: 1,
        }
      : null,
  ].filter(Boolean) as NotificationItem[]

  const notifications = user?.role === 'ADMIN' ? adminItems : clientItems

  const count = notifications.reduce((total, item) => total + item.count, 0)

  if (!user) return null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
        aria-label="Notificações"
      >
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center bg-brand-600 text-white text-[10px] rounded-full font-bold">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-neutral-200 shadow-2xl shadow-black/20 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-800">Notificações</span>
            {count > 0 && (
              <span className="text-xs bg-brand-600/20 text-brand-300 px-1.5 py-0.5 rounded font-medium border border-brand-500/30">
                {count}
              </span>
            )}
          </div>
          <ul className="max-h-72 overflow-y-auto">
            {count === 0 ? (
              <li className="px-4 py-6 text-sm text-neutral-500 text-center">Sem notificações</li>
            ) : (
              notifications.map((n) => (
                <li key={n.id} className="border-b border-neutral-100 last:border-0">
                  <Link
                    href={n.link}
                    className="block px-4 py-3 hover:bg-neutral-50 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <p className="text-sm font-medium text-neutral-800 mb-0.5">{n.title}</p>
                    <p className="text-xs text-neutral-500 line-clamp-2">{n.message}</p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
