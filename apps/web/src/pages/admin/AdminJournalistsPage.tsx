import { useState } from 'react'
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { clsx } from 'clsx'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useJournalistRegistrations, useReviewJournalistRegistration } from '@/hooks/useAdmin'
import type { JournalistRegistrationStatus, MediaType } from '@/services/admin.service'

const statusLabel: Record<JournalistRegistrationStatus, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
}
const statusColor: Record<JournalistRegistrationStatus, string> = {
  PENDING: 'text-amber-700 bg-amber-100',
  APPROVED: 'text-emerald-700 bg-emerald-100',
  REJECTED: 'text-red-700 bg-red-100',
}
const mediaTypeLabel: Record<MediaType, string> = {
  PRINT: 'Impresso',
  ONLINE: 'Online',
  TV: 'TV',
  RADIO: 'Rádio',
  AGENCY: 'Agência',
}

const TABS: Array<{ value: JournalistRegistrationStatus | ''; label: string }> = [
  { value: '', label: 'Todos' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'APPROVED', label: 'Aprovados' },
  { value: 'REJECTED', label: 'Rejeitados' },
]

export function AdminJournalistsPage() {
  const [tab, setTab] = useState<JournalistRegistrationStatus | ''>('PENDING')
  const [page, setPage] = useState(1)
  const { mutate: review, isPending: reviewing } = useReviewJournalistRegistration()

  const { data, isLoading } = useJournalistRegistrations({
    status: tab || undefined,
    page,
    limit: 20,
  })

  const totalPages = data?.meta.totalPages ?? 1

  function handleReview(id: string, status: JournalistRegistrationStatus) {
    review({ id, status })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Pedidos de Jornalistas</h1>
        <p className="text-neutral-500 mt-1">
          Revisão de pedidos de acesso de jornalistas à plataforma.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 rounded-xl p-1 w-fit">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setTab(value)
              setPage(1)
            }}
            className={clsx(
              'text-sm px-4 py-1.5 rounded-lg font-medium transition-colors',
              tab === value
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Jornalista
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Órgão / Cargo
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Tipo de Média
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Estado
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Data
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-neutral-100 animate-pulse rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !data?.data.length ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-neutral-400">
                    <Clock size={24} className="mx-auto mb-2 text-neutral-300" />
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : (
                data.data.map((reg) => (
                  <tr
                    key={reg.id}
                    className={clsx(
                      'hover:bg-neutral-50',
                      reg.status === 'PENDING' && 'bg-amber-50/40',
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-neutral-900">{reg.name}</p>
                      <p className="text-xs text-neutral-500">{reg.email}</p>
                      {reg.city && <p className="text-xs text-neutral-400">{reg.city}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-neutral-800">{reg.outlet}</p>
                      {reg.jobTitle && <p className="text-xs text-neutral-500">{reg.jobTitle}</p>}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{mediaTypeLabel[reg.mediaType]}</td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          'text-xs font-semibold px-2 py-0.5 rounded-full',
                          statusColor[reg.status],
                        )}
                      >
                        {statusLabel[reg.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-xs">
                      {format(new Date(reg.createdAt), 'dd MMM yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-4 py-3">
                      {reg.status === 'PENDING' && (
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            disabled={reviewing}
                            onClick={() => handleReview(reg.id, 'APPROVED')}
                            className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 disabled:opacity-50"
                          >
                            <CheckCircle2 size={12} />
                            Aprovar
                          </button>
                          <button
                            type="button"
                            disabled={reviewing}
                            onClick={() => handleReview(reg.id, 'REJECTED')}
                            className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-100 disabled:opacity-50"
                          >
                            <XCircle size={12} />
                            Rejeitar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
