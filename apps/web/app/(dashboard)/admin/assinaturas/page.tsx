'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, Clock, CreditCard, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { useActivateSubscription, useAdminPlans, useAdminSubscriptions } from '@/hooks/useAdmin'
import type { AdminSubscription, SubscriptionStatus } from '@/services/admin.service'

const STATUS: Record<
  SubscriptionStatus,
  { label: string; color: 'success' | 'warning' | 'danger' | 'default' }
> = {
  ACTIVE: { label: 'Activa', color: 'success' },
  PENDING: { label: 'Pendente', color: 'warning' },
  EXPIRED: { label: 'Expirada', color: 'danger' },
  CANCELLED: { label: 'Cancelada', color: 'default' },
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 0,
  }).format(value)
}

function defaultExpiry() {
  const date = new Date()
  date.setMonth(date.getMonth() + 1)
  return date.toISOString().slice(0, 10)
}

export default function SubscriptionsAdminPage() {
  const [status, setStatus] = useState<SubscriptionStatus | ''>('PENDING')
  const [selected, setSelected] = useState<AdminSubscription | null>(null)
  const [planId, setPlanId] = useState('')
  const [expiresAt, setExpiresAt] = useState(defaultExpiry())
  const [adminNotes, setAdminNotes] = useState('')

  const { data, isLoading, refetch, isFetching } = useAdminSubscriptions({
    status: status || undefined,
    limit: 50,
  })
  const { data: plans = [] } = useAdminPlans()
  const activate = useActivateSubscription()

  const subscriptions = useMemo(() => data?.data ?? [], [data?.data])
  const pendingCount = useMemo(
    () => subscriptions.filter((sub) => sub.status === 'PENDING').length,
    [subscriptions],
  )

  const openActivation = (subscription: AdminSubscription) => {
    setSelected(subscription)
    setPlanId(subscription.planId)
    setExpiresAt(defaultExpiry())
    setAdminNotes(subscription.adminNotes ?? '')
  }

  const submitActivation = async () => {
    if (!selected) return
    await activate.mutateAsync({
      userId: selected.userId,
      payload: { planId, expiresAt, adminNotes },
    })
    setSelected(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Assinaturas</h1>
          <p className="text-neutral-500 mt-1">
            Confirme pagamentos, active renovações e acompanhe quotas.
          </p>
        </div>
        <Button
          variant="outline"
          icon={<RefreshCw size={16} />}
          loading={isFetching}
          onClick={() => refetch()}
        >
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-neutral-500">Pendentes nesta vista</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{pendingCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-500">Registos listados</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{data?.meta.total ?? 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-500">Planos disponíveis</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{plans.length}</p>
        </Card>
      </div>

      <Card>
        <CardHeader title="Filtros" />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as SubscriptionStatus | '')}
          className="w-full sm:w-64 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
        >
          <option value="">Todas</option>
          <option value="PENDING">Pendentes</option>
          <option value="ACTIVE">Activas</option>
          <option value="EXPIRED">Expiradas</option>
          <option value="CANCELLED">Canceladas</option>
        </select>
      </Card>

      <Table<AdminSubscription>
        data={subscriptions}
        loading={isLoading}
        keyExtractor={(sub) => sub.id}
        emptyMessage="Nenhuma assinatura encontrada."
        columns={[
          {
            key: 'user',
            header: 'Cliente',
            render: (sub) => (
              <div>
                <p className="font-medium text-neutral-900">{sub.user.name}</p>
                <p className="text-xs text-neutral-500">{sub.user.email}</p>
              </div>
            ),
          },
          {
            key: 'plan',
            header: 'Plano',
            render: (sub) => (
              <div>
                <p>{sub.plan.name}</p>
                <p className="text-xs text-neutral-500">{formatMoney(sub.plan.priceMonthlyAoa)}</p>
              </div>
            ),
          },
          {
            key: 'usage',
            header: 'Envios',
            render: (sub) => `${sub.sendsUsed} / ${sub.plan.maxSendsMonth}`,
          },
          {
            key: 'expiresAt',
            header: 'Validade',
            render: (sub) => formatDate(sub.expiresAt),
          },
          {
            key: 'status',
            header: 'Estado',
            render: (sub) => (
              <Badge color={STATUS[sub.status].color} dot>
                {STATUS[sub.status].label}
              </Badge>
            ),
          },
          {
            key: 'actions',
            header: 'Acções',
            render: (sub) => (
              <Button
                size="sm"
                variant={sub.status === 'PENDING' ? 'primary' : 'outline'}
                icon={sub.status === 'PENDING' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                onClick={() => openActivation(sub)}
              >
                {sub.status === 'PENDING' ? 'Activar' : 'Renovar'}
              </Button>
            ),
          },
        ]}
      />

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Activar assinatura"
        description="Confirme o plano, validade e notas internas do pagamento."
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-neutral-50 p-4 text-sm">
            <p className="font-medium text-neutral-900">{selected?.user.name}</p>
            <p className="text-neutral-500">{selected?.user.email}</p>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Plano</span>
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} — {formatMoney(plan.priceMonthlyAoa)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Válida até</span>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Notas do comprovativo</span>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-600"
              placeholder="Ex: comprovativo recebido por WhatsApp, referência bancária..."
            />
          </label>
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setSelected(null)}>
            Cancelar
          </Button>
          <Button
            icon={<CreditCard size={16} />}
            loading={activate.isPending}
            onClick={submitActivation}
          >
            Confirmar activação
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
