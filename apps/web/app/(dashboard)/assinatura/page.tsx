'use client'

import { CreditCard } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useMySubscription } from '@/hooks/useSubscriptions'

export default function AssinaturaPage() {
  const { data: subscription, isLoading } = useMySubscription()

  const STATUS_MAP: Record<
    string,
    { label: string; color: 'success' | 'warning' | 'default' | 'danger' }
  > = {
    ACTIVE: { label: 'Activa', color: 'success' },
    PENDING: { label: 'Pendente', color: 'warning' },
    EXPIRED: { label: 'Expirada', color: 'danger' },
    CANCELLED: { label: 'Cancelada', color: 'default' },
  }

  const statusInfo = STATUS_MAP[subscription?.status ?? ''] ?? {
    label: subscription?.status ?? '—',
    color: 'default' as const,
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Assinatura</h1>
        <p className="text-neutral-500 mt-1">Gerencie o seu plano e pagamentos.</p>
      </div>

      <Card>
        <CardHeader title="Plano actual" />
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-5 w-40 bg-neutral-100 animate-pulse rounded" />
            <div className="h-4 w-64 bg-neutral-100 animate-pulse rounded" />
          </div>
        ) : subscription ? (
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-neutral-500">Plano</dt>
              <dd className="font-semibold text-neutral-800 mt-0.5">
                {subscription.plan?.name ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Estado</dt>
              <dd className="mt-0.5">
                <Badge color={statusInfo.color} dot>
                  {statusInfo.label}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Envios usados</dt>
              <dd className="font-semibold text-neutral-800 mt-0.5">
                {subscription.sendsUsed} / {subscription.plan?.maxSendsMonth ?? '—'}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">Expira em</dt>
              <dd className="text-neutral-700 mt-0.5">
                {subscription.expiresAt
                  ? new Date(subscription.expiresAt).toLocaleDateString('pt-PT', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '—'}
              </dd>
            </div>
          </dl>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
              <CreditCard size={24} className="text-neutral-400" />
            </div>
            <p className="text-sm font-medium text-neutral-700">Sem assinatura activa</p>
            <p className="text-xs text-neutral-500 mt-1">
              Contacte o administrador para activar um plano.
            </p>
          </div>
        )}
      </Card>

      <Card>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-sm text-neutral-500 max-w-sm">
            Para alterar o seu plano ou solicitar uma nova assinatura, contacte{' '}
            <a
              href="mailto:suporte@angopress.ao"
              className="text-brand-600 font-semibold hover:underline"
            >
              suporte@angopress.ao
            </a>
            .
          </p>
        </div>
      </Card>
    </div>
  )
}
