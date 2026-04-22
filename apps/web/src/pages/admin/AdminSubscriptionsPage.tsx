import { useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { clsx } from 'clsx'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAdminSubscriptions, useActivateSubscription, useAdminPlans } from '@/hooks/useAdmin'
import type { SubscriptionStatus, AdminSubscription } from '@/services/admin.service'

const statusLabel: Record<SubscriptionStatus, string> = {
  ACTIVE: 'Activa',
  PENDING: 'Pendente',
  EXPIRED: 'Expirada',
  CANCELLED: 'Cancelada',
}
const statusColor: Record<SubscriptionStatus, string> = {
  ACTIVE: 'text-emerald-700 bg-emerald-100',
  PENDING: 'text-amber-700 bg-amber-100',
  EXPIRED: 'text-red-700 bg-red-100',
  CANCELLED: 'text-neutral-600 bg-neutral-100',
}

const TABS: Array<{ value: SubscriptionStatus | ''; label: string }> = [
  { value: '', label: 'Todas' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'ACTIVE', label: 'Activas' },
  { value: 'EXPIRED', label: 'Expiradas' },
  { value: 'CANCELLED', label: 'Canceladas' },
]

function ActivateModal({ sub, onClose }: { sub: AdminSubscription; onClose: () => void }) {
  const { data: plans } = useAdminPlans()
  const { mutate: activate, isPending } = useActivateSubscription()

  const [planId, setPlanId] = useState(sub.planId)
  const [expiresAt, setExpiresAt] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    return d.toISOString().slice(0, 10)
  })
  const [adminNotes, setAdminNotes] = useState(sub.adminNotes ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    activate(
      {
        userId: sub.userId,
        payload: {
          planId,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
          adminNotes: adminNotes || undefined,
        },
      },
      { onSuccess: onClose },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-neutral-200">
          <div>
            <h2 className="font-semibold text-neutral-900">Activar assinatura</h2>
            <p className="text-sm text-neutral-500 mt-0.5">{sub.user.name}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Plano</label>
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              {plans?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {Number(p.priceMonthlyAoa).toLocaleString('pt-AO')} Kz/mês
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Data de expiração
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={2}
              placeholder="Ex: comprovativo recebido em 12/01/2025"
              className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || !planId}
              className="flex-1 py-2 text-sm font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={15} />
              {isPending ? 'A activar…' : 'Activar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function AdminSubscriptionsPage() {
  const [tab, setTab] = useState<SubscriptionStatus | ''>('PENDING')
  const [page, setPage] = useState(1)
  const [activating, setActivating] = useState<AdminSubscription | null>(null)

  const { data, isLoading } = useAdminSubscriptions({
    status: tab || undefined,
    page,
    limit: 20,
  })

  const totalPages = data?.meta.totalPages ?? 1

  return (
    <div className="space-y-4">
      {activating && <ActivateModal sub={activating} onClose={() => setActivating(null)} />}

      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Assinaturas</h1>
        <p className="text-neutral-500 mt-1">{data?.meta.total ?? '—'} assinaturas</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 rounded-xl p-1 w-fit">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setTab(value)
              setPage(1)
            }}
            className={clsx(
              'text-sm px-4 py-1.5 rounded-lg font-medium transition-colors',
              tab === value
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Utilizador
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Plano
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Estado
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Expira
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Envios usados
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Pedido em
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-neutral-100 animate-pulse rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !data?.data.length ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-400">
                    Nenhuma assinatura encontrada.
                  </td>
                </tr>
              ) : (
                data.data.map((sub) => (
                  <tr
                    key={sub.id}
                    className={clsx(
                      'hover:bg-neutral-50',
                      sub.status === 'PENDING' && 'bg-amber-50/40',
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-900">{sub.user.name}</p>
                      <p className="text-xs text-neutral-500">{sub.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-neutral-800">{sub.plan?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          'text-xs font-semibold px-2 py-0.5 rounded-full',
                          statusColor[sub.status],
                        )}
                      >
                        {statusLabel[sub.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-xs">
                      {sub.expiresAt
                        ? format(new Date(sub.expiresAt), 'dd/MM/yyyy', { locale: ptBR })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-neutral-600 text-sm">
                      {sub.sendsUsed} / {sub.plan?.maxSendsMonth ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-xs">
                      {format(new Date(sub.createdAt), 'dd MMM yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(sub.status === 'PENDING' || sub.status === 'EXPIRED') && (
                        <button
                          type="button"
                          onClick={() => setActivating(sub)}
                          className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          Activar
                        </button>
                      )}
                      {sub.status === 'ACTIVE' && (
                        <button
                          type="button"
                          onClick={() => setActivating(sub)}
                          className="text-xs font-medium text-brand-700 hover:underline"
                        >
                          Renovar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
