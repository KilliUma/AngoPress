'use client'

import { CheckCircle2, Copy, CreditCard, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { useMySubscription, usePlans, useRequestSubscription } from '@/hooks/useSubscriptions'
import type { SubscriptionStatus } from '@/services/subscriptions.service'

const PAYMENT = {
  iban: process.env.NEXT_PUBLIC_PAYMENT_IBAN ?? 'AO06 0000 0000 0000 0000 0000 0',
  email: process.env.NEXT_PUBLIC_PAYMENT_EMAIL ?? 'pagamentos@angopress.ao',
  whatsapp: process.env.NEXT_PUBLIC_PAYMENT_WHATSAPP ?? '+244 923 000 000',
  holder: process.env.NEXT_PUBLIC_PAYMENT_HOLDER ?? 'AngoPress',
}

const STATUS_MAP: Record<
  SubscriptionStatus,
  { label: string; color: 'success' | 'warning' | 'default' | 'danger' }
> = {
  ACTIVE: { label: 'Activa', color: 'success' },
  PENDING: { label: 'Pendente', color: 'warning' },
  EXPIRED: { label: 'Expirada', color: 'danger' },
  CANCELLED: { label: 'Cancelada', color: 'default' },
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function AssinaturaPage() {
  const { data: subscription, isLoading: loadingSubscription } = useMySubscription()
  const { data: plans = [], isLoading: loadingPlans } = usePlans()
  const requestSubscription = useRequestSubscription()

  const statusInfo = subscription
    ? STATUS_MAP[subscription.status]
    : { label: 'Sem plano', color: 'default' as const }

  const copyIban = async () => {
    await navigator.clipboard.writeText(PAYMENT.iban)
    toast.success('IBAN copiado')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Meu Plano</h1>
        <p className="text-neutral-500 mt-1">Escolha, renove e acompanhe a sua assinatura.</p>
      </div>

      <Card>
        <CardHeader title="Estado da assinatura" />
        {loadingSubscription ? (
          <div className="space-y-3">
            <div className="h-5 w-40 bg-neutral-100 animate-pulse rounded" />
            <div className="h-4 w-64 bg-neutral-100 animate-pulse rounded" />
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-neutral-500">Plano actual</p>
              <p className="font-semibold text-neutral-900 mt-1">
                {subscription?.plan?.name ?? 'Sem assinatura'}
              </p>
            </div>
            <div>
              <p className="text-neutral-500">Estado</p>
              <Badge color={statusInfo.color} dot className="mt-1">
                {statusInfo.label}
              </Badge>
            </div>
            <div>
              <p className="text-neutral-500">Envios</p>
              <p className="font-semibold text-neutral-900 mt-1">
                {subscription
                  ? `${subscription.sendsUsed} usados · ${subscription.sendsRemaining} restantes`
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-neutral-500">Validade</p>
              <p className="font-semibold text-neutral-900 mt-1">
                {formatDate(subscription?.expiresAt ?? null)}
              </p>
            </div>
          </div>
        )}
      </Card>

      {subscription?.status === 'PENDING' && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader
            title="Pagamento pendente"
            description="Faça a transferência bancária e envie o comprovativo para confirmação manual."
          />
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-neutral-500">Titular:</span> <strong>{PAYMENT.holder}</strong>
              </p>
              <p>
                <span className="text-neutral-500">IBAN:</span>{' '}
                <strong className="font-mono">{PAYMENT.iban}</strong>
              </p>
              <p className="text-neutral-600">
                Envie o comprovativo para <strong>{PAYMENT.email}</strong> ou WhatsApp{' '}
                <strong>{PAYMENT.whatsapp}</strong>.
              </p>
            </div>
            <Button variant="outline" icon={<Copy size={16} />} onClick={copyIban}>
              Copiar IBAN
            </Button>
          </div>
        </Card>
      )}

      <section>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Planos disponíveis</h2>
          {loadingPlans && <span className="text-sm text-neutral-400">A carregar...</span>}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrent = subscription?.planId === plan.id
            return (
              <Card
                key={plan.id}
                className={isCurrent ? 'border-brand-300 ring-1 ring-brand-100' : ''}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-neutral-900">{plan.name}</p>
                    <p className="text-sm text-neutral-500 mt-1">{plan.description}</p>
                  </div>
                  {isCurrent && <Badge color="brand">Actual</Badge>}
                </div>
                <p className="text-3xl font-bold text-brand-700 mt-5">
                  {formatMoney(plan.priceMonthlyAoa)}
                </p>
                <p className="text-xs text-neutral-500">por mês · {plan.maxSendsMonth} envios</p>
                <ul className="space-y-2 mt-5 text-sm text-neutral-700">
                  {plan.features.slice(0, 6).map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-6"
                  variant={isCurrent && subscription?.status === 'ACTIVE' ? 'outline' : 'primary'}
                  icon={<Send size={16} />}
                  loading={requestSubscription.isPending}
                  onClick={() => requestSubscription.mutate(plan.id)}
                >
                  {isCurrent && subscription?.status === 'ACTIVE'
                    ? 'Solicitar renovação'
                    : 'Solicitar adesão'}
                </Button>
              </Card>
            )
          })}
        </div>
      </section>

      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="font-semibold text-neutral-900">Precisa de ajuda com pagamento?</p>
            <p className="text-sm text-neutral-500 mt-1">
              A equipa confirma transferências manualmente e activa o plano após validação.
            </p>
          </div>
          <a
            href={`mailto:${PAYMENT.email}`}
            className="inline-flex items-center justify-center gap-2 border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 rounded-lg h-9 px-4 text-sm font-semibold"
          >
            <CreditCard size={16} />
            Contactar pagamentos
          </a>
        </div>
      </Card>
    </div>
  )
}
