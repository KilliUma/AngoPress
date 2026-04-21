import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, List, Trash2, X, Loader2, Users, ChevronRight, UserMinus } from 'lucide-react'
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

// ─── Modal criar/editar lista ─────────────────────────────────────
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

// ─── Painel de detalhes da lista ──────────────────────────────────
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

  const handleAddSelected = async () => {
    if (!selectedIds.length) return
    await addContacts.mutateAsync({ id: listId, journalistIds: selectedIds })
    setSelectedIds([])
    setSearchJournalist('')
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-2xl h-[85vh] sm:h-auto sm:max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              {isLoading ? '...' : list?.name}
            </h2>
            <p className="text-sm text-neutral-500">{list?._count.contacts ?? 0} contacto(s)</p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Contactos existentes */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Contactos na lista</h3>
            {isLoading ? (
              <Loader2 size={20} className="animate-spin text-brand-600" />
            ) : !list?.contacts.length ? (
              <p className="text-sm text-neutral-400">Nenhum contacto adicionado ainda.</p>
            ) : (
              <div className="space-y-2">
                {list.contacts.map(({ journalist, id: contactId }) => (
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
                      onClick={() => removeContact.mutate({ listId, journalistId: journalist.id })}
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remover da lista"
                    >
                      <UserMinus size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Adicionar jornalistas */}
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
                onClick={handleAddSelected}
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

// ─── Página principal ─────────────────────────────────────────────
export function MailingListsPage() {
  const { data: lists, isLoading } = useMailingLists()
  const deleteMutation = useDeleteMailingList()

  const [modalOpen, setModalOpen] = useState(false)
  const [editListId, setEditListId] = useState<string | undefined>()
  const [detailListId, setDetailListId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Listas de Mailing</h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            Agrupe jornalistas para as suas campanhas
          </p>
        </div>
        <button
          onClick={() => {
            setEditListId(undefined)
            setModalOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
        >
          <Plus size={16} />
          Nova lista
        </button>
      </div>

      {/* Grid de listas */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="animate-spin text-brand-600" />
        </div>
      ) : !lists?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400 bg-white rounded-xl border border-neutral-200">
          <List size={40} className="mb-3" />
          <p className="font-medium">Nenhuma lista criada</p>
          <p className="text-sm mt-1">Crie a sua primeira lista de mailing</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map((list) => (
            <div
              key={list.id}
              className="bg-white rounded-xl border border-neutral-200 p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-900 truncate">{list.name}</h3>
                  {list.description && (
                    <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{list.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Users size={14} />
                <span>{list._count.contacts} contacto(s)</span>
              </div>

              <div className="flex items-center gap-2 border-t border-neutral-100 pt-3">
                <button
                  onClick={() => setDetailListId(list.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                >
                  Gerir contactos
                  <ChevronRight size={14} />
                </button>
                <button
                  onClick={() => {
                    setEditListId(list.id)
                    setModalOpen(true)
                  }}
                  className="p-1.5 text-neutral-400 hover:text-brand-600 hover:bg-neutral-100 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Plus size={14} className="rotate-45" />
                </button>
                <button
                  onClick={() => setDeleteTarget(list.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal criar/editar */}
      {modalOpen && <ListModal listId={editListId} onClose={() => setModalOpen(false)} />}

      {/* Painel de detalhes */}
      {detailListId && (
        <ListDetailPanel listId={detailListId} onClose={() => setDetailListId(null)} />
      )}

      {/* Confirmação de eliminação */}
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
