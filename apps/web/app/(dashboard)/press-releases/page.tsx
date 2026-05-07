'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Copy,
  Trash2,
  Archive,
  Send,
  MoreHorizontal,
  FileText,
  Sparkles,
} from 'lucide-react'
import {
  usePressReleases,
  usePublishPressRelease,
  useArchivePressRelease,
  useDuplicatePressRelease,
  useDeletePressRelease,
} from '@/hooks/usePressReleases'
import { pressReleasesService } from '@/services/press-releases.service'
import type { PressRelease, PressReleaseStatus } from '@/services/press-releases.service'

const STATUS_LABELS: Record<PressReleaseStatus, string> = {
  DRAFT: 'Rascunho',
  PUBLISHED: 'Publicado',
  SCHEDULED: 'Agendado',
  ARCHIVED: 'Arquivado',
}
const STATUS_COLORS: Record<PressReleaseStatus, string> = {
  DRAFT: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
  PUBLISHED: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  SCHEDULED: 'bg-sky-50 text-sky-700 border border-sky-100',
  ARCHIVED: 'bg-orange-50 text-orange-700 border border-orange-100',
}
const TABS: { label: string; value: PressReleaseStatus | undefined }[] = [
  { label: 'Todos', value: undefined },
  { label: 'Rascunhos', value: 'DRAFT' },
  { label: 'Publicados', value: 'PUBLISHED' },
  { label: 'Agendados', value: 'SCHEDULED' },
  { label: 'Arquivados', value: 'ARCHIVED' },
]

function RowMenu({ pr }: { pr: PressRelease }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()
  const publish = usePublishPressRelease()
  const archive = useArchivePressRelease()
  const duplicate = useDuplicatePressRelease()
  const remove = useDeletePressRelease()

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-1 rounded hover:bg-neutral-100 text-neutral-500"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-neutral-200 bg-white shadow-lg py-1 text-sm">
          <button
            type="button"
            className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-neutral-50 text-neutral-700"
            onClick={() => {
              setOpen(false)
              router.push(`/press-releases/${pr.id}/editar`)
            }}
          >
            <Pencil size={14} /> Editar
          </button>
          <button
            type="button"
            className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-neutral-50 text-neutral-700"
            onClick={() => {
              setOpen(false)
              window.open(pressReleasesService.previewUrl(pr.id), '_blank')
            }}
          >
            <Eye size={14} /> Pré-visualizar
          </button>
          <button
            type="button"
            className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-neutral-50 text-neutral-700"
            onClick={() => {
              setOpen(false)
              duplicate.mutate(pr.id)
            }}
          >
            <Copy size={14} /> Duplicar
          </button>
          {(pr.status === 'DRAFT' || pr.status === 'SCHEDULED') && (
            <button
              type="button"
              className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-neutral-50 text-green-700"
              onClick={() => {
                setOpen(false)
                publish.mutate(pr.id)
              }}
            >
              <Send size={14} /> Publicar
            </button>
          )}
          {pr.status !== 'ARCHIVED' && (
            <button
              type="button"
              className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-neutral-50 text-orange-700"
              onClick={() => {
                setOpen(false)
                archive.mutate(pr.id)
              }}
            >
              <Archive size={14} /> Arquivar
            </button>
          )}
          <div className="my-1 border-t border-neutral-100" />
          <button
            type="button"
            className="flex items-center gap-2 w-full px-3 py-1.5 hover:bg-neutral-50 text-red-600"
            onClick={() => {
              setOpen(false)
              if (window.confirm('Eliminar este press release?')) remove.mutate(pr.id)
            }}
          >
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      )}
    </div>
  )
}

export default function PressReleasesPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PressReleaseStatus | undefined>(undefined)
  const [page, setPage] = useState(1)

  const { data, isLoading } = usePressReleases({
    search: search || undefined,
    status: statusFilter,
    page,
    limit: 20,
  })

  return (
    <div className="space-y-6">
      {/* ── Banner de topo ── */}
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
              Comunicados de imprensa
            </span>
            <h1 className="text-2xl tracking-tight sm:text-3xl title-strong">Press Releases</h1>
            <p className="text-sm text-brand-100/80">
              Crie, publique e agende os seus comunicados para jornalistas angolanos.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/press-releases/novo')}
            className="inline-flex items-center gap-2 self-start rounded-2xl bg-white text-brand-700 px-5 py-2.5 text-sm font-bold shadow-md hover:bg-neutral-50 transition-all shrink-0"
          >
            <Plus size={16} /> Novo Press Release
          </button>
        </div>
      </section>

      {/* ── Filtros e pesquisa ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto border-b border-neutral-200 pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => {
                setStatusFilter(tab.value)
                setPage(1)
              }}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-colors ${statusFilter === tab.value ? 'border-brand-600 text-brand-600' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative shrink-0 sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Pesquisar press releases..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm shadow-sm placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
          />
        </div>
      </div>

      <div className="overflow-visible rounded-[20px] border border-neutral-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-neutral-400 text-sm">
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-brand-600" />
            </div>
            <p className="mt-3">A carregar...</p>
          </div>
        ) : !data?.data.length ? (
          <div className="flex flex-col items-center justify-center gap-4 p-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 text-brand-600">
              <FileText size={32} />
            </div>
            <div>
              <p className="font-display font-semibold text-neutral-900">
                Nenhum press release encontrado
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Comece por criar o seu primeiro comunicado de imprensa.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/press-releases/novo')}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
            >
              <Plus size={15} /> Criar press release
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-100 bg-neutral-50/80">
              <tr>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                  Título
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                  Estado
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                  Criado em
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                  Publicado em
                </th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.data.map((pr: PressRelease) => (
                <tr key={pr.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-neutral-800 max-w-xs truncate">
                    {pr.title}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[pr.status]}`}
                    >
                      {STATUS_LABELS[pr.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-neutral-500">
                    {format(new Date(pr.createdAt), 'dd MMM yyyy', { locale: ptBR })}
                  </td>
                  <td className="px-5 py-3 text-neutral-500">
                    {pr.publishedAt
                      ? format(new Date(pr.publishedAt), 'dd MMM yyyy', { locale: ptBR })
                      : '—'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <RowMenu pr={pr} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm text-neutral-500 shadow-sm">
          <span>
            {data.meta.total} resultados — página{' '}
            <span className="font-semibold text-neutral-800">{page}</span> de{' '}
            <span className="font-semibold text-neutral-800">{data.meta.totalPages}</span>
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border border-neutral-200 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
