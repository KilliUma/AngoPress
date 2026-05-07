'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Plus,
  List,
  Trash2,
  X,
  Loader2,
  Users,
  ChevronRight,
  UserMinus,
  Sparkles,
  Pencil,
} from 'lucide-react'
import {
  useMailingLists,
  useMailingList,
  useCreateMailingList,
  useUpdateMailingList,
  useDeleteMailingList,
  useRemoveContact,
  useAddContacts,
} from '@/hooks/useMailingLists'
import { useJournalists } from '@/hooks/useJournalists'
import type { CreateMailingListPayload } from '@/services/mailing-lists.service'
import type { MediaType } from '@/services/journalists.service'

const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  TV: 'TV',
  RADIO: 'Rádio',
  PRINT: 'Imprensa',
  DIGITAL: 'Digital',
  PODCAST: 'Podcast',
}

function ListModal({ listId, onClose }: { listId?: string; onClose: () => void }) {
  const isEdit = !!listId
  const { data: list } = useMailingList(listId ?? '')
  const createMutation = useCreateMailingList()
  const updateMutation = useUpdateMailingList()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateMailingListPayload>({
    defaultValues: list ? { name: list.name, description: list.description ?? '' } : {},
  })

  const onSubmit = handleSubmit(async (data) => {
    if (isEdit && listId) {
      await updateMutation.mutateAsync({ id: listId, payload: data })
    } else {
      await createMutation.mutateAsync(data)
    }
    onClose()
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">
            {isEdit ? 'Editar lista' : 'Nova lista de mailing'}
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Nome *</label>
            <input
              {...register('name', { required: 'Nome obrigatório' })}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Media Angola — Economia"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Descrição</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              placeholder="Descrição opcional da lista..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-neutral-600">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-60 transition-colors"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? 'Guardar' : 'Criar lista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ListDetailPanel({ listId, onClose }: { listId: string; onClose: () => void }) {
  const { data: list, isLoading } = useMailingList(listId)
  const { data: journalistsData } = useJournalists({ limit: 200 })
  const removeContact = useRemoveContact()
  const addContacts = useAddContacts()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchJournalist, setSearchJournalist] = useState('')

  const existingIds = new Set(list?.contacts.map((c) => c.journalistId) ?? [])
  const available = (journalistsData?.data ?? []).filter(
    (j) =>
      !existingIds.has(j.id) &&
      (j.name.toLowerCase().includes(searchJournalist.toLowerCase()) ||
        j.outlet.toLowerCase().includes(searchJournalist.toLowerCase())),
  )

  const toggleSelect = (id: string) => {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]))
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-2xl h-[85vh] sm:h-auto sm:max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              {isLoading ? '...' : list?.name}
            </h2>
            <p className="text-sm text-neutral-500">{list?._count?.contacts ?? 0} contacto(s)</p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Contactos na lista</h3>
            {isLoading ? (
              <Loader2 size={20} className="animate-spin text-brand-600" />
            ) : !list?.contacts.length ? (
              <p className="text-sm text-neutral-400">Nenhum contacto adicionado ainda.</p>
            ) : (
              <div className="space-y-2">
                {list.contacts.map(
                  ({
                    journalist,
                    id: contactId,
                  }: {
                    journalist: { id: string; name: string; outlet: string; mediaType: MediaType }
                    id: string
                  }) => (
                    <div
                      key={contactId}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-neutral-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{journalist.name}</p>
                        <p className="text-xs text-neutral-500">
                          {journalist.outlet} · {MEDIA_TYPE_LABELS[journalist.mediaType]}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          removeContact.mutate({ listId, journalistId: journalist.id })
                        }
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remover da lista"
                      >
                        <UserMinus size={14} />
                      </button>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Adicionar jornalistas</h3>
            <input
              value={searchJournalist}
              onChange={(e) => setSearchJournalist(e.target.value)}
              placeholder="Pesquisar jornalista ou veículo..."
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <div className="space-y-1 max-h-48 overflow-y-auto border border-neutral-200 rounded-lg divide-y divide-neutral-100">
              {available.slice(0, 50).map((j) => (
                <label
                  key={j.id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(j.id)}
                    onChange={() => toggleSelect(j.id)}
                    className="accent-brand-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{j.name}</p>
                    <p className="text-xs text-neutral-500">{j.outlet}</p>
                  </div>
                </label>
              ))}
              {!available.length && (
                <p className="text-sm text-neutral-400 px-3 py-4 text-center">
                  Nenhum jornalista disponível
                </p>
              )}
            </div>
            {selectedIds.length > 0 && (
              <button
                onClick={async () => {
                  await addContacts.mutateAsync({ id: listId, journalistIds: selectedIds })
                  setSelectedIds([])
                  setSearchJournalist('')
                }}
                disabled={addContacts.isPending}
                className="mt-3 flex items-center gap-2 w-full justify-center py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-60 transition-colors"
              >
                {addContacts.isPending && <Loader2 size={14} className="animate-spin" />}
                Adicionar {selectedIds.length} jornalista(s)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MailingListsPage() {
  const { data: lists, isLoading } = useMailingLists()
  const deleteMutation = useDeleteMailingList()
  const [modalOpen, setModalOpen] = useState(false)
  const [editListId, setEditListId] = useState<string | undefined>()
  const [detailListId, setDetailListId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  return (
    <div className="space-y-5">
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
              Distribuição direcionada
            </span>
            <h1 className="text-2xl tracking-tight sm:text-3xl title-strong">Listas de Mailing</h1>
            <p className="text-sm text-brand-100/80">Agrupe jornalistas para as suas campanhas</p>
          </div>
          <button
            onClick={() => {
              setEditListId(undefined)
              setModalOpen(true)
            }}
            className="inline-flex items-center gap-2 self-start rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-brand-700 shadow-md hover:bg-neutral-50 transition-all shrink-0"
          >
            <Plus size={16} /> Nova lista
          </button>
        </div>
      </section>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-brand-600" />
          <p className="text-sm text-neutral-400">A carregar...</p>
        </div>
      ) : !lists?.length ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-[20px] border border-neutral-200 bg-white p-16 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 text-brand-600">
            <List size={30} />
          </div>
          <div>
            <p className="font-display font-semibold text-neutral-900">Nenhuma lista criada</p>
            <p className="mt-1 text-sm text-neutral-500">Crie a sua primeira lista de mailing</p>
          </div>
          <button
            onClick={() => {
              setEditListId(undefined)
              setModalOpen(true)
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            <Plus size={15} /> Nova lista
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map(
            (list: {
              id: string
              name: string
              description?: string | null
              _count: { contacts: number }
            }) => (
              <div
                key={list.id}
                className="group flex flex-col gap-4 rounded-[20px] border border-neutral-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <List size={18} />
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditListId(list.id)
                        setModalOpen(true)
                      }}
                      className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-brand-600 transition-colors"
                      title="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(list.id)}
                      className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-neutral-900 truncate">
                    {list.name}
                  </h3>
                  {list.description && (
                    <p className="mt-1 text-sm text-neutral-500 line-clamp-2">{list.description}</p>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
                  <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <Users size={13} />
                    {list._count.contacts} contacto(s)
                  </span>
                  <button
                    onClick={() => setDetailListId(list.id)}
                    className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    Gerir <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {modalOpen && <ListModal listId={editListId} onClose={() => setModalOpen(false)} />}
      {detailListId && (
        <ListDetailPanel listId={detailListId} onClose={() => setDetailListId(null)} />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-neutral-900 mb-2">Eliminar lista?</h3>
            <p className="text-sm text-neutral-500 mb-5">
              Todos os contactos desta lista serão removidos. Esta acção é irreversível.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm text-neutral-600"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await deleteMutation.mutateAsync(deleteTarget)
                  setDeleteTarget(null)
                }}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-60"
              >
                {deleteMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
