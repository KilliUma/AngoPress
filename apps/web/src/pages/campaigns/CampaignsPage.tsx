import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Send, Trash2, BarChart2, Loader2 } from 'lucide-react'
import { useCampaigns, useDeleteCampaign, useSendCampaign } from '@/hooks/useCampaigns'
import type { CampaignStatus } from '@/services/campaigns.service'

const STATUS_LABELS: Record<CampaignStatus, string> = {
  DRAFT: 'Rascunho',
  QUEUED: 'Na fila',
  SENDING: 'A enviar',
  SENT: 'Enviado',
  FAILED: 'Falhou',
  SCHEDULED: 'Agendado',
  CANCELLED: 'Cancelado',
}

const STATUS_COLORS: Record<CampaignStatus, string> = {
  DRAFT: 'bg-neutral-100 text-neutral-700',
  QUEUED: 'bg-blue-100 text-blue-700',
  SENDING: 'bg-yellow-100 text-yellow-700',
  SENT: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  SCHEDULED: 'bg-violet-100 text-violet-700',
  CANCELLED: 'bg-orange-100 text-orange-700',
}

const TABS: { label: string; value: CampaignStatus | undefined }[] = [
  { label: 'Todas', value: undefined },
  { label: 'Rascunhos', value: 'DRAFT' },
  { label: 'Agendadas', value: 'SCHEDULED' },
  { label: 'Enviadas', value: 'SENT' },
  { label: 'Falhou', value: 'FAILED' },
]

export function CampaignsPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | undefined>()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useCampaigns({ status: statusFilter, page, limit: 20 })
  const deleteCampaign = useDeleteCampaign()
  const sendCampaign = useSendCampaign()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Campanhas</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Gerencie os envios dos seus press releases
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/campanhas/nova')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus size={16} /> Nova Campanha
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-200">
        {TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => {
              setStatusFilter(tab.value)
              setPage(1)
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              statusFilter === tab.value
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-neutral-400 text-sm flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> A carregar...
          </div>
        ) : !data?.data.length ? (
          <div className="p-12 text-center">
            <Send className="mx-auto mb-3 text-neutral-300" size={40} />
            <p className="text-neutral-500 text-sm">Nenhuma campanha encontrada.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Nome</th>
                <th className="text-left px-5 py-3 font-medium">Press Release</th>
                <th className="text-left px-5 py-3 font-medium">Estado</th>
                <th className="text-left px-5 py-3 font-medium">Destinatários</th>
                <th className="text-left px-5 py-3 font-medium">Criada em</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.data.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-neutral-800 max-w-xs truncate">
                    {c.name}
                  </td>
                  <td className="px-5 py-3 text-neutral-500 max-w-[160px] truncate">
                    {c.pressRelease?.title ?? '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status]}`}
                    >
                      {STATUS_LABELS[c.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-neutral-500">{c.totalRecipients}</td>
                  <td className="px-5 py-3 text-neutral-500">
                    {format(new Date(c.createdAt), 'dd MMM yyyy', { locale: ptBR })}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/campanhas/${c.id}`)}
                        title="Relatório"
                        className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500"
                      >
                        <BarChart2 size={15} />
                      </button>
                      {(c.status === 'DRAFT' || c.status === 'SCHEDULED') && (
                        <button
                          type="button"
                          onClick={() => sendCampaign.mutate(c.id)}
                          title="Enviar agora"
                          className="p-1.5 rounded hover:bg-green-50 text-green-600"
                        >
                          <Send size={15} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Eliminar esta campanha?')) deleteCampaign.mutate(c.id)
                        }}
                        title="Eliminar"
                        className="p-1.5 rounded hover:bg-red-50 text-red-500"
                      >
                        <Trash2 size={15} />
                      </button>
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
            {data.meta.total} campanhas — página {page} de {data.meta.totalPages}
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
