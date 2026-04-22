import { useState } from 'react'
import { Plus, Pencil, Trash2, X, CheckCircle2, Send } from 'lucide-react'
import { clsx } from 'clsx'
import { useAdminPlans, useCreatePlan, useUpdatePlan, useDeletePlan } from '@/hooks/useAdmin'
import type { SubscriptionPlan } from '@/services/subscriptions.service'
import type { CreatePlanPayload } from '@/services/admin.service'

const EMPTY_FORM: CreatePlanPayload = {
  name: '',
  description: '',
  maxSendsMonth: 100,
  features: [],
  priceMonthlyAoa: 0,
  priceYearlyAoa: undefined,
  isActive: true,
  sortOrder: 0,
}

function PlanForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
  title,
}: {
  initial: CreatePlanPayload
  onSubmit: (data: CreatePlanPayload) => void
  onCancel: () => void
  submitting: boolean
  title: string
}) {
  const [form, setForm] = useState<CreatePlanPayload>(initial)
  const [featuresText, setFeaturesText] = useState(
    Array.isArray(initial.features) ? initial.features.join('\n') : '',
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const features = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean)
    onSubmit({ ...form, features })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-semibold text-neutral-900">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Nome *</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Envios/mês *</label>
          <input
            type="number"
            required
            min={1}
            value={form.maxSendsMonth}
            onChange={(e) => setForm({ ...form, maxSendsMonth: Number(e.target.value) })}
            className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Preço/mês (Kz) *
          </label>
          <input
            type="number"
            required
            min={0}
            step="0.01"
            value={form.priceMonthlyAoa}
            onChange={(e) => setForm({ ...form, priceMonthlyAoa: Number(e.target.value) })}
            className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Preço/ano (Kz)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.priceYearlyAoa ?? ''}
            onChange={(e) =>
              setForm({
                ...form,
                priceYearlyAoa: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Ordem de exibição
          </label>
          <input
            type="number"
            min={0}
            value={form.sortOrder ?? 0}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="isActive"
            checked={form.isActive ?? true}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="isActive" className="text-sm text-neutral-700">
            Plano activo
          </label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Descrição</label>
        <input
          value={form.description ?? ''}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Funcionalidades (uma por linha)
        </label>
        <textarea
          value={featuresText}
          onChange={(e) => setFeaturesText(e.target.value)}
          rows={4}
          placeholder="Ex: Envio de press releases&#10;Listas de mailing ilimitadas&#10;Relatórios de campanha"
          className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
        >
          <CheckCircle2 size={15} />
          {submitting ? 'A guardar…' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

export function AdminPlansPage() {
  const { data: plans, isLoading } = useAdminPlans()
  const { mutate: create, isPending: creating } = useCreatePlan()
  const { mutate: update, isPending: updating } = useUpdatePlan()
  const { mutate: deletePlan, isPending: deleting } = useDeletePlan()

  const [showCreate, setShowCreate] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  function handleCreate(data: CreatePlanPayload) {
    create(data, { onSuccess: () => setShowCreate(false) })
  }

  function handleUpdate(data: CreatePlanPayload) {
    if (!editingPlan) return
    update({ id: editingPlan.id, payload: data }, { onSuccess: () => setEditingPlan(null) })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Planos</h1>
          <p className="text-neutral-500 mt-1">Configure os planos de assinatura da plataforma.</p>
        </div>
        {!showCreate && !editingPlan && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 text-sm font-semibold bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700"
          >
            <Plus size={16} />
            Novo plano
          </button>
        )}
      </div>

      {/* Formulário de criação */}
      {showCreate && (
        <div className="bg-white rounded-2xl border border-brand-200 p-6">
          <PlanForm
            initial={EMPTY_FORM}
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            submitting={creating}
            title="Novo plano"
          />
        </div>
      )}

      {/* Lista de planos */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-neutral-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : !plans?.length ? (
        <div className="text-center py-16 text-neutral-400">
          <Send size={32} className="mx-auto mb-3 text-neutral-300" />
          <p>Nenhum plano criado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) =>
            editingPlan?.id === plan.id ? (
              <div
                key={plan.id}
                className="bg-white rounded-2xl border border-brand-200 p-5 md:col-span-2 lg:col-span-3"
              >
                <PlanForm
                  initial={{
                    name: plan.name,
                    description: plan.description ?? '',
                    maxSendsMonth: plan.maxSendsMonth,
                    features: Array.isArray(plan.features) ? (plan.features as string[]) : [],
                    priceMonthlyAoa: Number(plan.priceMonthlyAoa),
                    priceYearlyAoa: plan.priceYearlyAoa ? Number(plan.priceYearlyAoa) : undefined,
                    isActive: plan.isActive,
                    sortOrder: plan.sortOrder,
                  }}
                  onSubmit={handleUpdate}
                  onCancel={() => setEditingPlan(null)}
                  submitting={updating}
                  title={`Editar: ${plan.name}`}
                />
              </div>
            ) : (
              <div
                key={plan.id}
                className={clsx(
                  'bg-white rounded-2xl border p-5 space-y-3',
                  plan.isActive ? 'border-neutral-200' : 'border-neutral-200 opacity-60',
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-neutral-900">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-xs text-neutral-500 mt-0.5">{plan.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {!plan.isActive && (
                      <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-2xl font-bold text-neutral-900">
                  {Number(plan.priceMonthlyAoa).toLocaleString('pt-AO')} Kz
                  <span className="text-sm font-normal text-neutral-500">/mês</span>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-neutral-600">
                  <Send size={13} className="text-brand-600" />
                  {plan.maxSendsMonth.toLocaleString('pt-AO')} envios/mês
                </div>

                <ul className="space-y-1">
                  {(Array.isArray(plan.features) ? (plan.features as string[]) : []).map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-neutral-700">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPlan(plan)
                      setShowCreate(false)
                    }}
                    className="flex items-center gap-1.5 text-xs font-medium text-brand-700 border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-50"
                  >
                    <Pencil size={12} />
                    Editar
                  </button>
                  {confirmDelete === plan.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={deleting}
                        onClick={() => {
                          deletePlan(plan.id)
                          setConfirmDelete(null)
                        }}
                        className="text-xs text-red-600 hover:underline disabled:opacity-50"
                      >
                        Confirmar
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs text-neutral-500 hover:underline"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(plan.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={12} />
                      Desactivar
                    </button>
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  )
}
