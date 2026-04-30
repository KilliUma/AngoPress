import { useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { differenceInDays, format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useMySubscription } from '@/hooks/useSubscriptions'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { useAuthStore } from '@/store/auth.store'
import { adminService } from '@/services/admin.service'

interface Notification {
  id: string
  type: 'warning' | 'info' | 'error' | 'success'
  title: string
  message: string
  link?: string
}

function useClientNotifications(): Notification[] {
  const { data: sub } = useMySubscription()
  const notifications: Notification[] = []
  if (!sub) return notifications

  // Plano activado recentemente (últimos 7 dias)
  if (sub.status === 'ACTIVE' && sub.activatedAt) {
    const daysActivated = differenceInDays(new Date(), parseISO(sub.activatedAt))
    if (daysActivated <= 7) {
      notifications.push({
        id: 'activated',
        type: 'success',
        title: 'Plano activado',
        message: `O seu plano "${sub.plan?.name}" está activo e pronto a usar.`,
        link: '/assinatura',
      })
    }
  }

  // Pedido pendente
  if (sub.status === 'PENDING') {
    notifications.push({
      id: 'pending',
      type: 'info',
      title: 'Pedido em análise',
      message: `O pedido do plano "${sub.plan?.name}" aguarda aprovação do administrador.`,
      link: '/assinatura',
    })
  }

  // A expirar em breve
  if (sub.status === 'ACTIVE' && sub.expiresAt) {
    const daysLeft = differenceInDays(parseISO(sub.expiresAt), new Date())
    if (daysLeft >= 0 && daysLeft <= 7) {
      notifications.push({
        id: 'expiry',
        type: daysLeft <= 2 ? 'error' : 'warning',
        title: 'Assinatura a expirar',
        message:
          daysLeft === 0
            ? 'A sua assinatura expira hoje.'
            : `A sua assinatura expira em ${daysLeft} dia${daysLeft !== 1 ? 's' : ''} (${format(parseISO(sub.expiresAt), "dd 'de' MMMM", { locale: ptBR })}).`,
        link: '/assinatura',
      })
    }
  }

  // Expirada
  if (sub.status === 'EXPIRED') {
    notifications.push({
      id: 'expired',
      type: 'error',
      title: 'Assinatura expirada',
      message: 'Renove a sua assinatura para continuar a enviar campanhas.',
      link: '/assinatura',
    })
  }

  // Quota quase esgotada
  const pct = sub.plan?.maxSendsMonth ? (sub.sendsUsed / sub.plan.maxSendsMonth) * 100 : 0
  if (pct >= 80) {
    notifications.push({
      id: 'quota',
      type: pct >= 90 ? 'error' : 'warning',
      title: 'Quota de envios',
      message: `Utilizou ${Math.round(pct)}% dos envios mensais (${sub.sendsUsed}/${sub.plan?.maxSendsMonth}).`,
      link: '/assinatura',
    })
  }

  return notifications
}

function useAdminNotifications(): Notification[] {
  const { data } = useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: () => adminService.getNotifications(),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })
  const notifications: Notification[] = []
  if (!data) return notifications

  if (data.pendingSubscriptions > 0) {
    const n = data.pendingSubscriptions
    notifications.push({
      id: 'pending-subs',
      type: 'warning',
      title: 'Assinaturas pendentes',
      message: `${n} pedido${n !== 1 ? 's' : ''} de assinatura aguarda${n === 1 ? '' : 'm'} aprovação.`,
      link: '/admin/assinaturas',
    })
  }

  if (data.pendingJournalistRegistrations > 0) {
    const n = data.pendingJournalistRegistrations
    notifications.push({
      id: 'pending-journalists',
      type: 'info',
      title: 'Registos de jornalistas',
      message: `${n} jornalista${n !== 1 ? 's' : ''} aguarda${n === 1 ? '' : 'm'} revisão.`,
      link: '/admin/jornalistas',
    })
  }

  return notifications
}

const typeStyles: Record<Notification['type'], string> = {
  error: 'bg-red-50 border-red-100',
  warning: 'bg-amber-50 border-amber-100',
  info: 'bg-blue-50 border-blue-100',
  success: 'bg-green-50 border-green-100',
}

const dotStyles: Record<Notification['type'], string> = {
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
  success: 'bg-green-500',
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'

  const clientNotifications = useClientNotifications()
  const adminNotifications = useAdminNotifications()
  const notifications = isAdmin ? adminNotifications : clientNotifications

  useOnClickOutside(ref, () => setOpen(false))

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
        aria-label="Notificações"
      >
        <Bell size={18} />
        {notifications.length > 0 && (
          <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-neutral-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
            <p className="text-sm font-semibold text-neutral-800">Notificações</p>
            {notifications.length > 0 && (
              <span className="text-xs bg-red-100 text-red-600 font-semibold px-1.5 py-0.5 rounded-full">
                {notifications.length}
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-neutral-400">Sem notificações</div>
          ) : (
            <ul className="divide-y divide-neutral-100 max-h-72 overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id} className={`flex gap-3 px-4 py-3 border-l-2 ${typeStyles[n.type]}`}>
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dotStyles[n.type]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-800">{n.title}</p>
                    <p className="text-xs text-neutral-600 mt-0.5">{n.message}</p>
                    {n.link && (
                      <Link
                        to={n.link}
                        onClick={() => setOpen(false)}
                        className="text-xs text-brand-600 hover:underline mt-1 inline-block"
                      >
                        Ver detalhes →
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="px-4 py-2.5 border-t border-neutral-100">
            <Link
              to={isAdmin ? '/admin/assinaturas' : '/assinatura'}
              onClick={() => setOpen(false)}
              className="text-xs text-brand-600 hover:underline font-medium"
            >
              {isAdmin ? 'Gerir assinaturas →' : 'Ver plano →'}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
