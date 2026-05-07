'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Pencil, Plus, PowerOff, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { useAdminPlans, useCreatePlan, useDeletePlan, useUpdatePlan } from '@/hooks/useAdmin'
import type { SubscriptionPlan } from '@/services/subscriptions.service'

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  description: z.string().optional(),
  maxSendsMonth: z.coerce.number().min(1, 'Informe a quota mensal'),
  priceMonthlyAoa: z.coerce.number().min(0, 'Preço inválido'),
  priceYearlyAoa: z.coerce.number().min(0).optional().or(z.literal('')),
  featuresText: z.string().min(3, 'Informe pelo menos uma funcionalidade'),
  sortOrder: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

function formatMoney(value: number) {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 0,
  }).format(value)
}

function planToForm(plan?: SubscriptionPlan): FormData {
  return {
    name: plan?.name ?? '',
    description: plan?.description ?? '',
    maxSendsMonth: plan?.maxSendsMonth ?? 1000,
    priceMonthlyAoa: plan?.priceMonthlyAoa ?? 0,
    priceYearlyAoa: plan?.priceYearlyAoa ?? '',
    featuresText: plan?.features?.join('\n') ?? '',
    sortOrder: plan?.sortOrder ?? 0,
    isActive: plan?.isActive ?? true,
  }
}

export default function PlansAdminPage() {
  const { data: plans = [], isLoading } = useAdminPlans()
  const createPlan = useCreatePlan()
  const updatePlan = useUpdatePlan()
  const deletePlan = useDeletePlan()
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null)
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: planToForm() })

  useEffect(() => {
    reset(planToForm(editing ?? undefined))
  }, [editing, reset, open])

  const submit = handleSubmit(async (data) => {
    const payload = {
      name: data.name,
      description: data.description || undefined,
      maxSendsMonth: data.maxSendsMonth,
      priceMonthlyAoa: data.priceMonthlyAoa,
      priceYearlyAoa: data.priceYearlyAoa === '' ? undefined : Number(data.priceYearlyAoa),
      features: data.featuresText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    }

    if (editing) {
      await updatePlan.mutateAsync({ id: editing.id, payload })
    } else {
      await createPlan.mutateAsync(payload)
    }
    setOpen(false)
    setEditing(null)
  })

  const openNew = () => {
    setEditing(null)
    setOpen(true)
  }

  const openEdit = (plan: SubscriptionPlan) => {
    setEditing(plan)
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 p-6 text-white shadow-xl shadow-brand-900/10 sm:p-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
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
              <Sparkles size={13} /> Admin
            </span>
            <h1 className="text-2xl tracking-tight sm:text-3xl title-strong">Planos e Preços</h1>
            <p className="text-sm text-brand-100/80">
              Configure quotas, preços e benefícios comerciais.
            </p>
          </div>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 self-start rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-brand-700 shadow-md hover:bg-neutral-50 transition-all shrink-0"
          >
            <Plus size={16} /> Novo plano
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.slice(0, 3).map((plan) => (
          <Card key={plan.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-neutral-900">{plan.name}</p>
                <p className="text-sm text-neutral-500 mt-1">{plan.description}</p>
              </div>
              <Badge color={plan.isActive ? 'success' : 'default'} dot>
                {plan.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-brand-700 mt-5">
              {formatMoney(plan.priceMonthlyAoa)}
            </p>
            <p className="text-xs text-neutral-500">até {plan.maxSendsMonth} envios/mês</p>
          </Card>
        ))}
      </div>

      <Table<SubscriptionPlan>
        data={plans}
        loading={isLoading}
        keyExtractor={(plan) => plan.id}
        emptyMessage="Nenhum plano configurado."
        columns={[
          {
            key: 'name',
            header: 'Plano',
            render: (plan) => (
              <div>
                <p className="font-medium text-neutral-900">{plan.name}</p>
                <p className="text-xs text-neutral-500">{plan.description ?? '—'}</p>
              </div>
            ),
          },
          { key: 'maxSendsMonth', header: 'Quota', render: (plan) => plan.maxSendsMonth },
          {
            key: 'priceMonthlyAoa',
            header: 'Mensal',
            render: (plan) => formatMoney(plan.priceMonthlyAoa),
          },
          {
            key: 'isActive',
            header: 'Estado',
            render: (plan) => (
              <Badge color={plan.isActive ? 'success' : 'default'} dot>
                {plan.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            ),
          },
          {
            key: 'actions',
            header: 'Acções',
            render: (plan) => (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Pencil size={14} />}
                  onClick={() => openEdit(plan)}
                >
                  Editar
                </Button>
                {plan.isActive && (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<PowerOff size={14} />}
                    onClick={() => deletePlan.mutate(plan.id)}
                  >
                    Desactivar
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar plano' : 'Novo plano'}
        description="Defina os limites comerciais apresentados aos clientes."
        size="lg"
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-neutral-700">Nome</span>
              <input
                {...register('name')}
                className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm"
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
            </label>
            <label className="block">
              <span className="text-sm font-medium text-neutral-700">Ordem</span>
              <input
                type="number"
                {...register('sortOrder')}
                className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-neutral-700">Envios/mês</span>
              <input
                type="number"
                {...register('maxSendsMonth')}
                className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm"
              />
              {errors.maxSendsMonth && (
                <p className="text-xs text-red-600 mt-1">{errors.maxSendsMonth.message}</p>
              )}
            </label>
            <label className="block">
              <span className="text-sm font-medium text-neutral-700">Preço mensal (AOA)</span>
              <input
                type="number"
                {...register('priceMonthlyAoa')}
                className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm"
              />
              {errors.priceMonthlyAoa && (
                <p className="text-xs text-red-600 mt-1">{errors.priceMonthlyAoa.message}</p>
              )}
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-neutral-700">Descrição</span>
              <input
                {...register('description')}
                className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-neutral-700">Funcionalidades</span>
              <textarea
                {...register('featuresText')}
                rows={5}
                className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm"
              />
              {errors.featuresText && (
                <p className="text-xs text-red-600 mt-1">{errors.featuresText.message}</p>
              )}
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" {...register('isActive')} className="accent-brand-600" />
            Plano activo
          </label>
          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={createPlan.isPending || updatePlan.isPending}
              icon={<Check size={16} />}
            >
              Guardar plano
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}
