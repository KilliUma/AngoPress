import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Search, Pencil, Trash2, X, Loader2, RefreshCw } from 'lucide-react'
import { clsx } from 'clsx'
import {
  useJournalists,
  useCreateJournalist,
  useUpdateJournalist,
  useDeleteJournalist,
} from '@/hooks/useJournalists'
import type { Journalist, CreateJournalistPayload, MediaType } from '@/services/journalists.service'
import { useAuthStore } from '@/store/auth.store'

const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  TV: 'Televisão',
  RADIO: 'Rádio',
  PRINT: 'Imprensa',
  DIGITAL: 'Digital',
  PODCAST: 'Podcast',
}

const MEDIA_TYPES = Object.keys(MEDIA_TYPE_LABELS) as MediaType[]

const COVERAGE_AREAS = [
  'economia',
  'política',
  'tecnologia',
  'saúde',
  'desporto',
  'cultura',
  'sociedade',
  'negócios',
  'internacional',
  'educação',
]

// ─── Modal de criação / edição ───────────────────────────────────
function JournalistModal({
  journalist,
  onClose,
}: {
  journalist?: Journalist
  onClose: () => void
}) {
  const isEdit = !!journalist
  const createMutation = useCreateJournalist()
  const updateMutation = useUpdateJournalist()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateJournalistPayload>({
    defaultValues: journalist
      ? {
          name: journalist.name,
          email: journalist.email,
          outlet: journalist.outlet,
          jobTitle: journalist.jobTitle ?? '',
          mediaType: journalist.mediaType,
          coverageArea: journalist.coverageArea,
          city: journalist.city ?? '',
          province: journalist.province ?? '',
          phone: journalist.phone ?? '',
          isActive: journalist.isActive,
        }
      : { isActive: true, coverageArea: [] },
  })

  const selectedAreas = watch('coverageArea') ?? []

  const toggleArea = (area: string) => {
    if (selectedAreas.includes(area)) {
      setValue(
        'coverageArea',
        selectedAreas.filter((a) => a !== area),
      )
    } else {
      setValue('coverageArea', [...selectedAreas, area])
    }
  }

  const onSubmit = handleSubmit(async (data) => {
    if (isEdit) {
      await updateMutation.mutateAsync({ id: journalist!.id, payload: data })
    } else {
      await createMutation.mutateAsync(data)
    }
    onClose()
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">
            {isEdit ? 'Editar Jornalista' : 'Novo Jornalista'}
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Nome *</label>
              <input
                {...register('name', { required: 'Nome obrigatório' })}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Nome completo"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email *</label>
              <input
                {...register('email', { required: 'Email obrigatório' })}
                type="email"
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="email@redaccao.ao"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Veículo / Redacção *
              </label>
              <input
                {...register('outlet', { required: 'Veículo obrigatório' })}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Jornal de Angola"
              />
              {errors.outlet && (
                <p className="text-red-500 text-xs mt-1">{errors.outlet.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Função</label>
              <input
                {...register('jobTitle')}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Repórter de Economia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Tipo de média *
              </label>
              <select
                {...register('mediaType', { required: 'Tipo obrigatório' })}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Seleccionar...</option>
                {MEDIA_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {MEDIA_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
              {errors.mediaType && (
                <p className="text-red-500 text-xs mt-1">{errors.mediaType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Telefone</label>
              <input
                {...register('phone')}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="+244 923 456 789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Cidade</label>
              <input
                {...register('city')}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Luanda"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Província</label>
              <input
                {...register('province')}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Luanda"
              />
            </div>
          </div>

          {/* Áreas de cobertura */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Áreas de cobertura
            </label>
            <div className="flex flex-wrap gap-2">
              {COVERAGE_AREAS.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleArea(area)}
                  className={clsx(
                    'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                    selectedAreas.includes(area)
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-neutral-600 border-neutral-300 hover:border-brand-400',
                  )}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Estado activo */}
          <div className="flex items-center gap-2">
            <input
              {...register('isActive')}
              type="checkbox"
              id="isActive"
              className="w-4 h-4 accent-brand-600"
            />
            <label htmlFor="isActive" className="text-sm text-neutral-700">
              Jornalista activo
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-60 transition-colors"
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? 'Guardar alterações' : 'Criar jornalista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────
export function JournalistsPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'

  const [search, setSearch] = useState('')
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaType | ''>('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Journalist | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const { data, isLoading, refetch } = useJournalists({
    search: search || undefined,
    mediaType: mediaTypeFilter || undefined,
    page,
    limit: 20,
  })

  const deleteMutation = useDeleteJournalist()

  const openCreate = () => {
    setEditTarget(undefined)
    setModalOpen(true)
  }

  const openEdit = (j: Journalist) => {
    setEditTarget(j)
    setModalOpen(true)
  }

  const confirmDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Jornalistas</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Base de dados de jornalistas angolanos</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
        >
          <Plus size={16} />
          Novo jornalista
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Pesquisar nome, email ou veículo..."
            className="w-full pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <select
          value={mediaTypeFilter}
          onChange={(e) => {
            setMediaTypeFilter(e.target.value as MediaType | '')
            setPage(1)
          }}
          className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Todos os meios</option>
          {MEDIA_TYPES.map((t) => (
            <option key={t} value={t}>
              {MEDIA_TYPE_LABELS[t]}
            </option>
          ))}
        </select>

        <button
          onClick={() => refetch()}
          className="p-2 text-neutral-500 hover:text-brand-600 hover:bg-neutral-100 rounded-lg transition-colors"
          title="Recarregar"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-brand-600" />
          </div>
        ) : !data?.data.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
            <Users size={40} className="mb-3" />
            <p className="font-medium">Nenhum jornalista encontrado</p>
            <p className="text-sm mt-1">Adicione o primeiro jornalista à base de dados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3">Nome</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Veículo</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Meio</th>
                <th className="text-left px-4 py-3 hidden xl:table-cell">Áreas</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-right px-4 py-3">Acções</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.data.map((j) => (
                <tr key={j.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-neutral-900">{j.name}</p>
                      <p className="text-xs text-neutral-500">{j.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 hidden md:table-cell">
                    <div>
                      <p>{j.outlet}</p>
                      {j.jobTitle && <p className="text-xs text-neutral-400">{j.jobTitle}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
                      {MEDIA_TYPE_LABELS[j.mediaType]}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {j.coverageArea.slice(0, 3).map((a) => (
                        <span
                          key={a}
                          className="px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded text-xs"
                        >
                          {a}
                        </span>
                      ))}
                      {j.coverageArea.length > 3 && (
                        <span className="text-xs text-neutral-400">
                          +{j.coverageArea.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                        j.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-neutral-100 text-neutral-500',
                      )}
                    >
                      <span
                        className={clsx(
                          'w-1.5 h-1.5 rounded-full',
                          j.isActive ? 'bg-emerald-500' : 'bg-neutral-400',
                        )}
                      />
                      {j.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(j)}
                        className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 hover:text-brand-600 transition-colors"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => setDeleteTarget(j.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-neutral-500 hover:text-red-600 transition-colors"
                          title="Remover"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginação */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-neutral-500">
          <span>
            {(page - 1) * 20 + 1}–{Math.min(page * 20, data.meta.total)} de {data.meta.total}{' '}
            jornalistas
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 border border-neutral-300 rounded-lg disabled:opacity-40 hover:bg-neutral-50 transition-colors"
            >
              Anterior
            </button>
            <span className="px-2">
              {page} / {data.meta.totalPages}
            </span>
            <button
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 border border-neutral-300 rounded-lg disabled:opacity-40 hover:bg-neutral-50 transition-colors"
            >
              Seguinte
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && <JournalistModal journalist={editTarget} onClose={() => setModalOpen(false)} />}

      {/* Confirmação de eliminação */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-neutral-900 mb-2">Confirmar eliminação</h3>
            <p className="text-sm text-neutral-500 mb-5">
              Esta acção é irreversível. O jornalista será removido permanentemente.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmDelete(deleteTarget)}
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

// Icone necessário na tabela vazia
function Users({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
