'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
  RefreshCw,
  Users,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { clsx } from 'clsx'
import {
  useJournalists,
  useCreateJournalist,
  useUpdateJournalist,
  useDeleteJournalist,
  useExportJournalistsCsv,
  useImportJournalistsCsv,
} from '@/hooks/useJournalists'
import type { Journalist, CreateJournalistPayload, MediaType } from '@/services/journalists.service'
import { useAuthStore } from '@/store/auth.store'

/** Debounce simples */
function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  TV: 'Televisão',
  RADIO: 'Rádio',
  PRINT: 'Imprensa',
  DIGITAL: 'Digital',
  PODCAST: 'Podcast',
}

const MEDIA_TYPES = Object.keys(MEDIA_TYPE_LABELS) as MediaType[]

const FALLBACK_COVERAGE_AREAS = [
  'economia',
  'politica',
  'tecnologia',
  'saude',
  'desporto',
  'cultura',
  'sociedade',
  'negocios',
  'internacional',
  'educacao',
]

interface CategoryOption {
  name: string
  slug: string
}

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
  const { data: categories = [] } = useQuery<CategoryOption[]>({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((res) => res.json()),
  })
  const coverageAreas =
    categories.length > 0 ? categories.map((category) => category.slug) : FALLBACK_COVERAGE_AREAS
  const coverageLabels = Object.fromEntries(
    categories.map((category) => [category.slug, category.name]),
  )

  const toggleArea = (area: string) => {
    setValue(
      'coverageArea',
      selectedAreas.includes(area)
        ? selectedAreas.filter((a) => a !== area)
        : [...selectedAreas, area],
    )
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-neutral-700">Nome *</label>
              <input
                {...register('name', { required: 'Nome obrigatório' })}
                className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Nome completo"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-neutral-700">Email *</label>
              <input
                {...register('email', { required: 'Email obrigatório' })}
                type="email"
                className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="email@redaccao.ao"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-neutral-700">
                Veículo / Redacção *
              </label>
              <input
                {...register('outlet', { required: 'Veículo obrigatório' })}
                className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Jornal de Angola"
              />
              {errors.outlet && (
                <p className="mt-1 text-xs text-red-500">{errors.outlet.message}</p>
              )}
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-neutral-700">Função</label>
              <input
                {...register('jobTitle')}
                className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Repórter de Economia"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-neutral-700">
                Tipo de mídia *
              </label>
              <select
                {...register('mediaType', { required: 'Tipo obrigatório' })}
                className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Seleccionar...</option>
                {MEDIA_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {MEDIA_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
              {errors.mediaType && (
                <p className="mt-1 text-xs text-red-500">{errors.mediaType.message}</p>
              )}
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-neutral-700">Telefone</label>
              <input
                {...register('phone')}
                className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="+244 923 456 789"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-neutral-700">Cidade</label>
              <input
                {...register('city')}
                className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Luanda"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-neutral-700">Província</label>
              <input
                {...register('province')}
                className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Luanda"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-neutral-700">
              Áreas de cobertura
            </label>
            <div className="flex flex-wrap gap-2">
              {coverageAreas.map((area) => (
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
                  {coverageLabels[area] ?? area}
                </button>
              ))}
            </div>
          </div>

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
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-60"
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

export default function JournalistsPage() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN'
  const [searchInput, setSearchInput] = useState('')
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaType | ''>('')
  const [cityFilter, setCityFilter] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Journalist | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importErrors, setImportErrors] = useState<{ row: number; message: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Debounce 300ms na pesquisa
  const search = useDebounce(searchInput, 300)
  const cityDebounced = useDebounce(cityFilter, 300)

  const { data, isLoading, refetch } = useJournalists({
    search: search || undefined,
    mediaType: mediaTypeFilter || undefined,
    city: cityDebounced || undefined,
    page,
    limit: 20,
  })
  const deleteMutation = useDeleteJournalist()
  const exportCsv = useExportJournalistsCsv()
  const importCsv = useImportJournalistsCsv()

  const handleImport = async () => {
    if (!importFile) return
    setImportErrors([])
    const result = await importCsv.mutateAsync(importFile).catch((e) => {
      const errs = e?.response?.data?.errors ?? []
      setImportErrors(errs)
      return null
    })
    if (result) {
      setImportErrors(result.errors ?? [])
      setImportOpen(false)
      setImportFile(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Jornalistas</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Base de dados de jornalistas angolanos</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => exportCsv.mutate()}
                disabled={exportCsv.isPending}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 disabled:opacity-60 transition-colors"
                title="Exportar CSV"
              >
                {exportCsv.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                Exportar
              </button>
              <button
                onClick={() => setImportOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <Upload size={14} /> Importar CSV
              </button>
            </>
          )}
          {isAdmin && (
            <button
              onClick={() => {
                setEditTarget(undefined)
                setModalOpen(true)
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-brand-600 hover:bg-brand-700"
            >
              <Plus size={16} /> Novo jornalista
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute -translate-y-1/2 left-3 top-1/2 text-neutral-400" />
          <input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              setPage(1)
            }}
            placeholder="Pesquisar nome, email ou veículo..."
            className="w-full py-2 pr-4 text-sm border rounded-lg pl-9 border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select
          value={mediaTypeFilter}
          onChange={(e) => {
            setMediaTypeFilter(e.target.value as MediaType | '')
            setPage(1)
          }}
          className="px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">Todos os meios</option>
          {MEDIA_TYPES.map((t) => (
            <option key={t} value={t}>
              {MEDIA_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
        <input
          value={cityFilter}
          onChange={(e) => {
            setCityFilter(e.target.value)
            setPage(1)
          }}
          placeholder="Filtrar por cidade..."
          className="w-40 px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          onClick={() => refetch()}
          className="p-2 transition-colors rounded-lg text-neutral-500 hover:text-brand-600 hover:bg-neutral-100"
          title="Recarregar"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden bg-white border rounded-xl border-neutral-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-brand-600" />
          </div>
        ) : !data?.data.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
            <Users size={40} className="mb-3" />
            <p className="font-medium">Nenhum jornalista encontrado</p>
            <p className="mt-1 text-sm">Adicione o primeiro jornalista à base de dados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs tracking-wide uppercase border-b border-neutral-200 bg-neutral-50 text-neutral-500">
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="hidden px-4 py-3 text-left md:table-cell">Veículo</th>
                <th className="hidden px-4 py-3 text-left lg:table-cell">Meio</th>
                <th className="hidden px-4 py-3 text-left xl:table-cell">Áreas</th>
                <th className="px-4 py-3 text-left">Estado</th>
                {isAdmin && <th className="px-4 py-3 text-right">Acções</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.data.map((j) => (
                <tr key={j.id} className="transition-colors hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{j.name}</p>
                    <p className="text-xs text-neutral-500">{j.email}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-neutral-600 md:table-cell">
                    <p>{j.outlet}</p>
                    {j.jobTitle && <p className="text-xs text-neutral-400">{j.jobTitle}</p>}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
                      {MEDIA_TYPE_LABELS[j.mediaType]}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 xl:table-cell">
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
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditTarget(j)
                            setModalOpen(true)
                          }}
                          className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 hover:text-brand-600 transition-colors"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(j.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-neutral-500 hover:text-red-600 transition-colors"
                          title="Remover"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
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

      {/* Modal criar/editar */}
      {modalOpen && <JournalistModal journalist={editTarget} onClose={() => setModalOpen(false)} />}

      {/* Confirmar eliminação */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm p-6 bg-white shadow-xl rounded-xl">
            <h3 className="mb-2 font-semibold text-neutral-900">Confirmar eliminação</h3>
            <p className="mb-5 text-sm text-neutral-500">
              Esta acção é irreversível. O jornalista será removido permanentemente.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-800"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await deleteMutation.mutateAsync(deleteTarget)
                  setDeleteTarget(null)
                }}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60"
              >
                {deleteMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal importar CSV */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900">Importar Jornalistas (CSV)</h2>
              <button
                onClick={() => {
                  setImportOpen(false)
                  setImportFile(null)
                  setImportErrors([])
                }}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-neutral-600">
                O CSV deve ter as colunas:{' '}
                <code className="px-1 text-xs rounded bg-neutral-100">
                  name, email, outlet, mediaType
                </code>{' '}
                (obrigatórias) e opcionalmente{' '}
                <code className="px-1 text-xs rounded bg-neutral-100">
                  jobTitle, coverageArea, city, province, country, phone, isActive
                </code>
                .
              </p>
              <p className="text-xs text-neutral-500">
                Separar múltiplas áreas com ponto e vírgula (;). Tipos de média válidos: TV, RADIO,
                PRINT, DIGITAL, PODCAST.
              </p>
              <div
                className="p-8 text-center transition-colors border-2 border-dashed cursor-pointer border-neutral-300 rounded-xl hover:border-brand-400"
                onClick={() => fileInputRef.current?.click()}
              >
                {importFile ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-600">
                    <CheckCircle2 size={18} />
                    <span className="text-sm font-medium">{importFile.name}</span>
                  </div>
                ) : (
                  <div className="text-neutral-400">
                    <Upload size={24} className="mx-auto mb-2" />
                    <p className="text-sm">Clique para seleccionar um ficheiro CSV</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                />
              </div>
              {importErrors.length > 0 && (
                <div className="space-y-1 overflow-y-auto max-h-32">
                  {importErrors.map((err) => (
                    <div
                      key={err.row}
                      className="flex items-start gap-2 px-2 py-1 text-xs rounded text-amber-700 bg-amber-50"
                    >
                      <AlertCircle size={12} className="shrink-0 mt-0.5" />
                      Linha {err.row}: {err.message}
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setImportOpen(false)
                    setImportFile(null)
                    setImportErrors([])
                  }}
                  className="px-4 py-2 text-sm text-neutral-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleImport}
                  disabled={!importFile || importCsv.isPending}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-60"
                >
                  {importCsv.isPending && <Loader2 size={14} className="animate-spin" />}
                  Importar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
