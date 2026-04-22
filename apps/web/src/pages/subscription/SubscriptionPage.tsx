import { useState } from 'react'
import { CheckCircle2, Clock, XCircle, AlertCircle, Zap, Send } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { clsx } from 'clsx'
import {
  usePlans,
  useMySubscription,
  useRequestSubscription,
  useCancelSubscription,
} from '@/hooks/useSubscriptions'
import type { SubscriptionPlan } from '@/services/subscriptions.service'

const statusConfig = {
  ACTIVE: { label: 'Activa', color: 'text-emerald-700 bg-emerald-100', icon: CheckCircle2 },
  PENDING: { label: 'Pendente', color: 'text-amber-700 bg-amber-100', icon: Clock },
  EXPIRED: { label: 'Expirada', color: 'text-red-700 bg-red-100', icon: XCircle },
  CANCELLED: { label: 'Cancelada', color: 'text-neutral-600 bg-neutral-100', icon: XCircle },
}

function PlanCard({
  plan,
  isCurrentPlan,
  onSelect,
  loading,
  canRequest,
}: {
  plan: SubscriptionPlan
  isCurrentPlan: boolean
  onSelect: (id: string) => void
  loading: boolean
  canRequest: boolean
}) {
  return (
    <div
      className={clsx(
        'rounded-2xl border p-6 flex flex-col gap-4 transition-shadow',
        isCurrentPlan
          ? 'border-brand-500 ring-2 ring-brand-200 bg-brand-50'
          : 'border-neutral-200 bg-white hover:shadow-md',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-neutral-900 text-lg">{plan.name}</h3>
          {plan.description && (
            <p className="text-sm text-neutral-500 mt-0.5">{plan.description}</p>
          )}
        </div>
        {isCurrentPlan && (
          <span className="text-xs font-semibold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full shrink-0">
            Plano actual
          </span>
        )}
      </div>

      <div>
        <span className="text-3xl font-bold text-neutral-900">
          {Number(plan.priceMonthlyAoa).toLocaleString('pt-AO')} Kz
        </span>
        <span className="text-sm text-neutral-500">/mês</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-neutral-600">
        <Send size={14} className="text-brand-600" />
        <span>
          <strong>{plan.maxSendsMonth.toLocaleString('pt-AO')}</strong> envios/mês
        </span>
      </div>

      <ul className="space-y-1.5">
        {(plan.features as string[]).map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-neutral-700">
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      {!isCurrentPlan && canRequest && (
        <button
          type="button"
          disabled={loading}
          onClick={() => onSelect(plan.id)}
          className="mt-auto w-full py-2 text-sm font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'A solicitar…' : 'Solicitar este plano'}
        </button>
      )}
    </div>
  )
}

export function SubscriptionPage() {
  const [confirmCancel, setConfirmCancel] = useState(false)
  const { data: plans, isLoading: loadingPlans } = usePlans()
  const { data: subscription, isLoading: loadingSub } = useMySubscription()
  const { mutate: requestSub, isPending: requesting } = useRequestSubscription()
  const { mutate: cancelSub, isPending: cancelling } = useCancelSubscription()

  const status = subscription?.status
  const statusMeta = status ? statusConfig[status] : null
  const StatusIcon = statusMeta?.icon ?? AlertCircle

  const sendsUsed = subscription?.sendsUsed ?? 0
  const sendsMax = subscription?.plan?.maxSendsMonth ?? 0
  const sendsRemaining = subscription?.sendsRemaining ?? 0
  const progressPct = sendsMax > 0 ? Math.min(100, (sendsUsed / sendsMax) * 100) : 0

  const canRequest = !subscription || status === 'EXPIRED' || status === 'CANCELLED'

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Meu Plano</h1>
        <p className="text-neutral-500 mt-1">
          Gerencie a sua assinatura e veja os envios disponíveis.
        </p>
      </div>

      {/* Estado da assinatura actual */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <h2 className="font-semibold text-neutral-900 mb-4">Estado da assinatura</h2>
        {loadingSub ? (
          <div className="space-y-3">
            <div className="h-6 w-32 bg-neutral-100 animate-pulse rounded" />
            <div className="h-4 w-48 bg-neutral-100 animate-pulse rounded" />
          </div>
        ) : !subscription ? (
          <div className="flex items-center gap-3 text-neutral-500">
            <AlertCircle size={20} className="text-amber-500" />
            <span className="text-sm">
              Ainda não tem assinatura. Seleccione um plano abaixo para começar.
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div
                className={clsx(
                  'flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full',
                  statusMeta?.color,
                )}
              >
                <StatusIcon size={13} />
                {statusMeta?.label}
              </div>
              <span className="font-bold text-neutral-900 text-lg">{subscription.plan.name}</span>
              {subscription.expiresAt && (
                <span className="text-sm text-neutral-500">
                  Expira em{' '}
                  {format(new Date(subscription.expiresAt), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </span>
              )}
            </div>

            {status === 'ACTIVE' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">
                    Envios utilizados: <strong>{sendsUsed.toLocaleString('pt-AO')}</strong> /{' '}
                    {sendsMax.toLocaleString('pt-AO')}
                  </span>
                  <span className="text-neutral-600">
                    Restam:{' '}
                    <strong className="text-brand-700">
                      {sendsRemaining.toLocaleString('pt-AO')}
                    </strong>
                  </span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2.5">
                  <div
                    className={clsx(
                      'h-2.5 rounded-full transition-all',
                      progressPct > 90
                        ? 'bg-red-500'
                        : progressPct > 70
                          ? 'bg-amber-500'
                          : 'bg-brand-600',
                    )}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}

            {status === 'PENDING' && (
              <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-3">
                <Clock size={15} className="mt-0.5 shrink-0" />
                <span>
                  O seu pedido está pendente de aprovação. Após efectuar o pagamento via
                  transferência bancária, aguarde a confirmação do administrador.
                </span>
              </div>
            )}

            {(status === 'ACTIVE' || status === 'PENDING') && (
              <div className="pt-2">
                {confirmCancel ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-600">Confirmar cancelamento?</span>
                    <button
                      type="button"
                      disabled={cancelling}
                      onClick={() => {
                        cancelSub()
                        setConfirmCancel(false)
                      }}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      Sim, cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmCancel(false)}
                      className="text-sm text-neutral-500 hover:underline"
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(true)}
                    className="text-sm text-neutral-500 hover:text-red-600 hover:underline"
                  >
                    Cancelar assinatura
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Planos disponíveis */}
      <div>
        <h2 className="font-semibold text-neutral-900 mb-4">Planos disponíveis</h2>
        {loadingPlans ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-neutral-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : !plans?.length ? (
          <div className="text-center py-12 text-neutral-400 text-sm">
            Nenhum plano disponível de momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={subscription?.planId === plan.id && status === 'ACTIVE'}
                onSelect={(id) => requestSub(id)}
                loading={requesting}
                canRequest={canRequest}
              />
            ))}
          </div>
        )}
      </div>

      {/* Instruções de pagamento */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={18} className="text-amber-600" />
          <h2 className="font-semibold text-amber-900">Instruções de pagamento</h2>
        </div>
        <div className="text-sm text-amber-800 space-y-1">
          <p>
            1. Seleccione um plano e clique em <strong>"Solicitar este plano"</strong>.
          </p>
          <p>
            2. Efectue a transferência bancária para:{' '}
            <strong>IBAN AO06 0040 0000 1234 5678 1011 2</strong> (Banco BFA — AngoPress, Lda).
          </p>
          <p>
            3. Envie o comprovativo para{' '}
            <a href="mailto:pagamentos@angopress.ao" className="underline font-medium">
              pagamentos@angopress.ao
            </a>
            .
          </p>
          <p>
            4. O administrador irá activar a sua assinatura em até <strong>24 horas úteis</strong>.
          </p>
        </div>
      </div>
    </div>
  )
}
