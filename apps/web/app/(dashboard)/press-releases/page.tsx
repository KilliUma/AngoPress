'use client'

import { useState } from 'react'
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
  DRAFT: 'bg-neutral-100 text-neutral-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  ARCHIVED: 'bg-orange-100 text-orange-700',
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
  const router = useRouter()
  const publish = usePublishPressRelease()
  const archive = useArchivePressRelease()
  const duplicate = useDuplicatePressRelease()
  const remove = useDeletePressRelease()

  return (
    <div className="relative" onBlur={() => setOpen(false)}>
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
            onMouseDown={() => {
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
              onMouseDown={() => {
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
              onMouseDown={() => {
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
            onMouseDown={() => {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Press Releases</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Crie e gerencie os seus comunicados de imprensa
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/press-releases/novo')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus size={16} /> Novo Press Release
        </button>
      </div>

      <div className="flex gap-1 border-b border-neutral-200">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => {
              setStatusFilter(tab.value)
              setPage(1)
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${statusFilter === tab.value ? 'border-brand-600 text-brand-600' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          placeholder="Pesquisar press releases..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-visible">
        {isLoading ? (
          <div className="p-12 text-center text-neutral-400 text-sm">A carregar...</div>
        ) : !data?.data.length ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto mb-3 text-neutral-300" size={40} />
            <p className="text-neutral-500 text-sm">Nenhum press release encontrado.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Título</th>
                <th className="text-left px-5 py-3 font-medium">Estado</th>
                <th className="text-left px-5 py-3 font-medium">Criado em</th>
                <th className="text-left px-5 py-3 font-medium">Publicado em</th>
                <th className="px-5 py-3" />
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
        <div className="flex items-center justify-between text-sm text-neutral-500">
          <span>
            {data.meta.total} resultados — página {page} de {data.meta.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
