'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Pencil, Plus, PowerOff } from 'lucide-react'
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Categorias e Editorias</h1>
          <p className="text-neutral-500 mt-1">
            Configure os temas usados na segmentação da base de jornalistas.
          </p>
        </div>
        <Button
          icon={<Plus size={16} />}
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
        >
          Nova categoria
        </Button>
      </div>

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
