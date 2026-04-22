import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Send, Loader2, Download } from 'lucide-react'
import {
  useCampaign,
  useCampaignMetrics,
  useCampaignEvents,
  useSendCampaign,
} from '@/hooks/useCampaigns'
import type { EmailEventType } from '@/services/campaigns.service'

const EVENT_LABELS: Record<EmailEventType, string> = {
  DELIVERED: 'Entregue',
  OPENED: 'Aberto',
  CLICKED: 'Clique',
  BOUNCED: 'Bounce',
  COMPLAINED: 'Reclamação',
  UNSUBSCRIBED: 'Descadastro',
}

const EVENT_COLORS: Record<EmailEventType, string> = {
  DELIVERED: 'bg-green-100 text-green-700',
  OPENED: 'bg-blue-100 text-blue-700',
  CLICKED: 'bg-violet-100 text-violet-700',
  BOUNCED: 'bg-red-100 text-red-700',
  COMPLAINED: 'bg-orange-100 text-orange-700',
  UNSUBSCRIBED: 'bg-neutral-100 text-neutral-600',
}

function MetricCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5">
      <p className="text-xs text-neutral-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      {sub && <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function exportCsv(events: ReturnType<typeof useCampaignEvents>['data']) {
  if (!events?.data.length) return
  const header = 'Jornalista,E-mail,Veículo,Evento,URL Clicada,Data'
  const rows = events.data.map((e) =>
    [
      `"${e.journalist.name}"`,
      e.journalist.email,
      `"${e.journalist.outlet}"`,
      EVENT_LABELS[e.eventType],
      e.clickedUrl ?? '',
      format(new Date(e.occurredAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
    ].join(','),
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `relatorio-campanha.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [eventsPage, setEventsPage] = useState(1)

  const { data: campaign, isLoading } = useCampaign(id)
  // Polling a cada 5s quando está a enviar
  const { data: metrics } = useCampaignMetrics(
    id!,
    campaign?.status === 'SENDING' || campaign?.status === 'QUEUED' ? 5000 : 0,
  )
  const { data: events } = useCampaignEvents(id!, eventsPage)
  const sendCampaign = useSendCampaign()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400">
        <Loader2 className="animate-spin mr-2" size={20} /> A carregar...
      </div>
    )
  }

  if (!campaign) return null

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/campanhas')}
            className="text-neutral-500 hover:text-neutral-800"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">{campaign.name}</h1>
            <p className="text-sm text-neutral-500">{campaign.subject}</p>
          </div>
        </div>
        {(campaign.status === 'DRAFT' || campaign.status === 'SCHEDULED') && (
          <button
            type="button"
            onClick={() => sendCampaign.mutate(campaign.id)}
            disabled={sendCampaign.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-40"
          >
            {sendCampaign.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            Enviar agora
          </button>
        )}
      </div>

      {/* Métricas */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard label="Enviados" value={campaign.totalRecipients} />
          <MetricCard label="Entregues" value={metrics.metrics.delivered} />
          <MetricCard
            label="Abertos"
            value={metrics.metrics.opened}
            sub={`${metrics.metrics.openRate}%`}
          />
          <MetricCard
            label="Cliques"
            value={metrics.metrics.clicked}
            sub={`${metrics.metrics.clickRate}%`}
          />
          <MetricCard
            label="Bounces"
            value={metrics.metrics.bounced}
            sub={`${metrics.metrics.bounceRate}%`}
          />
          <MetricCard label="Descadastros" value={metrics.metrics.unsubscribed} />
        </div>
      )}

      {/* Tabela de eventos */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="font-medium text-neutral-800 text-sm">Relatório individual</h2>
          <button
            type="button"
            onClick={() => exportCsv(events)}
            className="flex items-center gap-1.5 text-xs text-brand-600 hover:underline"
          >
            <Download size={13} /> Exportar CSV
          </button>
        </div>
        {!events?.data.length ? (
          <div className="p-8 text-center text-neutral-400 text-sm">
            Sem eventos registados ainda.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Jornalista</th>
                <th className="text-left px-5 py-3 font-medium">Veículo</th>
                <th className="text-left px-5 py-3 font-medium">Evento</th>
                <th className="text-left px-5 py-3 font-medium">Data</th>
                <th className="text-left px-5 py-3 font-medium">URL clicada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {events.data.map((e) => (
                <tr key={e.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-2.5">
                    <p className="font-medium text-neutral-800">{e.journalist.name}</p>
                    <p className="text-xs text-neutral-500">{e.journalist.email}</p>
                  </td>
                  <td className="px-5 py-2.5 text-neutral-500 text-xs">{e.journalist.outlet}</td>
                  <td className="px-5 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${EVENT_COLORS[e.eventType]}`}
                    >
                      {EVENT_LABELS[e.eventType]}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-neutral-500 text-xs">
                    {format(new Date(e.occurredAt), 'dd MMM yyyy HH:mm', { locale: ptBR })}
                  </td>
                  <td className="px-5 py-2.5 text-xs">
                    {e.clickedUrl ? (
                      <a
                        href={e.clickedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:underline max-w-[200px] truncate block"
                      >
                        {e.clickedUrl}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginação eventos */}
      {events && events.meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-neutral-500">
          <span>{events.meta.total} eventos</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={eventsPage <= 1}
              onClick={() => setEventsPage((p) => p - 1)}
              className="px-3 py-1 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={eventsPage >= events.meta.totalPages}
              onClick={() => setEventsPage((p) => p + 1)}
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
