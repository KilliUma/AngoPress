'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Pencil, Plus, PowerOff, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import {
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/hooks/useAdmin'
import type { Category } from '@/services/admin.service'

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  slug: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

function categoryToForm(category?: Category): FormData {
  return {
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    description: category?.description ?? '',
    sortOrder: category?.sortOrder ?? 0,
    isActive: category?.isActive ?? true,
  }
}

export default function CategoriesAdminPage() {
  const { data: categories = [], isLoading } = useAdminCategories()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const [editing, setEditing] = useState<Category | null>(null)
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: categoryToForm() })

  useEffect(() => {
    reset(categoryToForm(editing ?? undefined))
  }, [editing, reset, open])

  const submit = handleSubmit(async (data) => {
    const payload = {
      name: data.name,
      slug: data.slug || undefined,
      description: data.description || undefined,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    }

    if (editing) {
      await updateCategory.mutateAsync({ id: editing.id, payload })
    } else {
      await createCategory.mutateAsync(payload)
    }
    setOpen(false)
    setEditing(null)
  })

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
            <h1 className="text-2xl tracking-tight sm:text-3xl title-strong">
              Categorias e Editorias
            </h1>
            <p className="text-sm text-brand-100/80">
              Configure os temas usados na segmentação da base de jornalistas.
            </p>
          </div>
          <button
            onClick={() => {
              setEditing(null)
              setOpen(true)
            }}
            className="inline-flex items-center gap-2 self-start rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-brand-700 shadow-md hover:bg-neutral-50 transition-all shrink-0"
          >
            <Plus size={16} /> Nova categoria
          </button>
        </div>
      </section>

      <Table<Category>
        data={categories}
        loading={isLoading}
        keyExtractor={(category) => category.id}
        emptyMessage="Nenhuma categoria configurada."
        columns={[
          {
            key: 'name',
            header: 'Categoria',
            render: (category) => (
              <div>
                <p className="font-medium text-neutral-900">{category.name}</p>
                <p className="text-xs text-neutral-500">{category.slug}</p>
              </div>
            ),
          },
          {
            key: 'description',
            header: 'Descrição',
            render: (category) => category.description ?? '—',
          },
          { key: 'sortOrder', header: 'Ordem' },
          {
            key: 'isActive',
            header: 'Estado',
            render: (category) => (
              <Badge color={category.isActive ? 'success' : 'default'} dot>
                {category.isActive ? 'Activa' : 'Inactiva'}
              </Badge>
            ),
          },
          {
            key: 'actions',
            header: 'Acções',
            render: (category) => (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Pencil size={14} />}
                  onClick={() => {
                    setEditing(category)
                    setOpen(true)
                  }}
                >
                  Editar
                </Button>
                {category.isActive && (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<PowerOff size={14} />}
                    onClick={() => deleteCategory.mutate(category.id)}
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
        title={editing ? 'Editar categoria' : 'Nova categoria'}
        description="O slug é gerado automaticamente se ficar vazio."
      >
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Nome</span>
            <input
              {...register('name')}
              className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm"
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </label>
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Slug</span>
            <input
              {...register('slug')}
              className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Descrição</span>
            <textarea
              {...register('description')}
              rows={3}
              className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm"
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-neutral-700">Ordem</span>
              <input
                type="number"
                {...register('sortOrder')}
                className="mt-1 w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm"
              />
            </label>
            <label className="flex items-end gap-2 text-sm text-neutral-700 pb-2">
              <input type="checkbox" {...register('isActive')} className="accent-brand-600" />
              Activa
            </label>
          </div>
          <ModalFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={createCategory.isPending || updateCategory.isPending}
              icon={<Check size={16} />}
            >
              Guardar categoria
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}
