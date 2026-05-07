'use client'

import {
  CheckCircle2,
  Copy,
  CreditCard,
  Send,
  Sparkles,
  CrownIcon,
  ShieldCheck,
} from 'lucide-react'
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
      {/* ── Banner ── */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 p-6 text-white shadow-xl shadow-brand-900/10 sm:p-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-32 w-64 rounded-full bg-brand-950/25 blur-2xl" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
              backgroundSize: '44px 44px',
            }}
          />
        </div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-100">
              <Sparkles size={13} />
              Plano e faturação
            </span>
            <h1 className="text-2xl tracking-tight sm:text-3xl title-strong">Meu Plano</h1>
            <p className="text-sm text-brand-100/80">
              Escolha, renove e acompanhe a sua assinatura.
            </p>
          </div>
          {subscription && (
            <div className="shrink-0 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-100">
                Plano actual
              </p>
              <p className="mt-1 text-xl title-strong">{subscription.plan?.name ?? '—'}</p>
              <Badge color={statusInfo.color} dot className="mt-2">
                {statusInfo.label}
              </Badge>
            </div>
          )}
        </div>
      </section>

      {/* ── Estado da assinatura ── */}
      <div className="rounded-[20px] border border-neutral-200/80 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <ShieldCheck size={16} />
          </span>
          <h2 className="text-neutral-800 title-strong">Estado da assinatura</h2>
        </div>
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
      </div>

      {subscription?.status === 'PENDING' && (
        <div className="rounded-[20px] border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="mb-4">
            <p className="text-amber-900 title-strong">Pagamento pendente</p>
            <p className="mt-0.5 text-sm text-amber-700">
              Faça a transferência bancária e envie o comprovativo para confirmação manual.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end">
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-amber-700">Titular:</span> <strong>{PAYMENT.holder}</strong>
              </p>
              <p>
                <span className="text-amber-700">IBAN:</span>{' '}
                <strong className="font-mono">{PAYMENT.iban}</strong>
              </p>
              <p className="text-amber-700">
                Envie o comprovativo para <strong>{PAYMENT.email}</strong> ou WhatsApp{' '}
                <strong>{PAYMENT.whatsapp}</strong>.
              </p>
            </div>
            <Button variant="outline" icon={<Copy size={16} />} onClick={copyIban}>
              Copiar IBAN
            </Button>
          </div>
        </div>
      )}

      <section>
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <CrownIcon size={16} />
          </span>
          <h2 className="text-neutral-800 title-strong">Planos disponíveis</h2>
          {loadingPlans && <span className="text-sm text-neutral-400">A carregar...</span>}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrent = subscription?.planId === plan.id
            return (
              <div
                key={plan.id}
                className={`flex flex-col rounded-[20px] border bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${isCurrent ? 'border-brand-300 ring-2 ring-brand-100' : 'border-neutral-200/80'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg text-neutral-900 title-strong">{plan.name}</p>
                    <p className="mt-1 text-sm text-neutral-500">{plan.description}</p>
                  </div>
                  {isCurrent && <Badge color="brand">Actual</Badge>}
                </div>
                <p className="mt-5 font-display text-3xl font-bold text-brand-700">
                  {formatMoney(plan.priceMonthlyAoa)}
                </p>
                <p className="text-xs text-neutral-500">por mês · {plan.maxSendsMonth} envios</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-neutral-700">
                  {plan.features.slice(0, 6).map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 w-full"
                  variant={isCurrent && subscription?.status === 'ACTIVE' ? 'outline' : 'primary'}
                  icon={<Send size={16} />}
                  loading={requestSubscription.isPending}
                  onClick={() => requestSubscription.mutate(plan.id)}
                >
                  {isCurrent && subscription?.status === 'ACTIVE'
                    ? 'Solicitar renovação'
                    : 'Solicitar adesão'}
                </Button>
              </div>
            )
          })}
        </div>
      </section>

      <div className="flex flex-col gap-4 rounded-[20px] border border-neutral-200/80 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-neutral-900 title-strong">Precisa de ajuda com pagamento?</p>
          <p className="mt-1 text-sm text-neutral-500">
            A equipa confirma transferências manualmente e activa o plano após validação.
          </p>
        </div>
        <a
          href={`mailto:${PAYMENT.email}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm hover:bg-neutral-50 transition-colors shrink-0"
        >
          <CreditCard size={16} />
          Contactar pagamentos
        </a>
      </div>
    </div>
  )
}
