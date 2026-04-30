'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart2,
  Mail,
  MousePointerClick,
  AlertTriangle,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useCampaign, useCampaignMetrics, useSendCampaign } from '@/hooks/useCampaigns'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import type { CampaignStatus } from '@/services/campaigns.service'

const STATUS_CONFIG: Record<
  CampaignStatus,
  { label: string; class: string; icon: React.ReactNode }
> = {
  DRAFT: { label: 'Rascunho', class: 'bg-neutral-100 text-neutral-700', icon: <Clock size={14} /> },
  SCHEDULED: { label: 'Agendada', class: 'bg-sky-100 text-sky-700', icon: <Clock size={14} /> },
  QUEUED: { label: 'Na fila', class: 'bg-amber-100 text-amber-700', icon: <Clock size={14} /> },
  SENDING: { label: 'A enviar', class: 'bg-amber-100 text-amber-700', icon: <Clock size={14} /> },
  SENT: {
    label: 'Enviada',
    class: 'bg-emerald-100 text-emerald-700',
    icon: <CheckCircle2 size={14} />,
  },
  FAILED: { label: 'Falhou', class: 'bg-red-100 text-red-700', icon: <XCircle size={14} /> },
  CANCELLED: {
    label: 'Cancelada',
    class: 'bg-neutral-100 text-neutral-700',
    icon: <XCircle size={14} />,
  },
}

const ACTIVE_STATUSES: CampaignStatus[] = ['QUEUED', 'SENDING']

function MetricCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="text-xl font-bold text-neutral-900">{value}</p>
        {sub && <p className="text-xs text-neutral-400">{sub}</p>}
      </div>
    </Card>
  )
}

export default function CampanhaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data: campaign, isLoading } = useCampaign(id)
  const { data: metrics } = useCampaignMetrics(
    id,
    campaign && ACTIVE_STATUSES.includes(campaign.status) ? 5000 : 0,
  )
  const sendCampaign = useSendCampaign()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-neutral-200 border-t-brand-600 animate-spin" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-neutral-400">
        <AlertCircle size={32} className="mb-2" />
        <p>Campanha não encontrada.</p>
        <Link href="/campanhas" className="mt-3 text-brand-600 text-sm underline">
          Voltar às campanhas
        </Link>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.DRAFT
  const canSend = campaign.status === 'DRAFT'
  const safeMetrics = metrics?.metrics ?? {
    delivered: campaign.totalRecipients,
    opened: 0,
    clicked: 0,
    bounced: 0,
    complained: 0,
    unsubscribed: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0,
  }
  const hasValidApiMetrics = Boolean(
    metrics?.metrics &&
    typeof metrics.metrics.delivered === 'number' &&
    typeof metrics.metrics.opened === 'number' &&
    typeof metrics.metrics.clicked === 'number' &&
    typeof metrics.metrics.bounced === 'number' &&
    typeof metrics.metrics.openRate === 'number' &&
    typeof metrics.metrics.clickRate === 'number' &&
    typeof metrics.metrics.bounceRate === 'number',
  )

  const handleSend = async () => {
    await sendCampaign.mutateAsync(campaign.id)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 mb-3 transition-colors"
          >
            <ArrowLeft size={15} /> Campanhas
          </button>
          <h1 className="text-2xl font-bold text-neutral-900">{campaign.name}</h1>
          <p className="text-neutral-500 text-sm mt-1">{campaign.subject}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusCfg.class}`}
          >
            {statusCfg.icon} {statusCfg.label}
          </span>
          {canSend && (
            <button
              onClick={handleSend}
              disabled={sendCampaign.isPending}
              className="inline-flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-40 transition-colors"
            >
              {sendCampaign.isPending ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Send size={15} />
              )}
              Enviar Agora
            </button>
          )}
        </div>
      </div>

      {/* Info Card */}
      <Card className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5">
        <div>
          <p className="text-xs text-neutral-500 mb-0.5">Destinatários</p>
          <p className="text-lg font-bold text-neutral-900">{campaign.totalRecipients}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 mb-0.5">Press Release</p>
          <p className="text-sm font-medium text-neutral-900 truncate">
            {campaign.pressRelease?.title || '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 mb-0.5">Criada em</p>
          <p className="text-sm text-neutral-700">
            {format(new Date(campaign.createdAt), "dd 'de' MMM, HH:mm", { locale: pt })}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 mb-0.5">
            {campaign.sentAt ? 'Enviada em' : campaign.scheduledAt ? 'Agendada para' : 'Estado'}
          </p>
          <p className="text-sm text-neutral-700">
            {campaign.sentAt
              ? format(new Date(campaign.sentAt), "dd 'de' MMM, HH:mm", { locale: pt })
              : campaign.scheduledAt
                ? format(new Date(campaign.scheduledAt), "dd 'de' MMM, HH:mm", { locale: pt })
                : statusCfg.label}
          </p>
        </div>
      </Card>

      {/* Métricas — só se enviada */}
      {(campaign.status === 'SENT' || campaign.status === 'SENDING' || metrics) && (
        <>
          {ACTIVE_STATUSES.includes(campaign.status) && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
              <div className="w-3 h-3 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
              A actualizar métricas em tempo real…
            </div>
          )}
          {hasValidApiMetrics ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetricCard
                icon={<Mail size={18} />}
                label="Entregues"
                value={safeMetrics.delivered}
              />
              <MetricCard
                icon={<BarChart2 size={18} />}
                label="Taxa de Abertura"
                value={`${(safeMetrics.openRate * 100).toFixed(1)}%`}
                sub={`${safeMetrics.opened} abertos`}
              />
              <MetricCard
                icon={<MousePointerClick size={18} />}
                label="Taxa de Cliques"
                value={`${(safeMetrics.clickRate * 100).toFixed(1)}%`}
                sub={`${safeMetrics.clicked} cliques`}
              />
              <MetricCard
                icon={<AlertTriangle size={18} />}
                label="Bounces"
                value={`${(safeMetrics.bounceRate * 100).toFixed(1)}%`}
                sub={`${safeMetrics.bounced} bounces`}
              />
            </div>
          ) : (
            <Card className="p-5 text-sm text-neutral-500">
              Métricas ainda não disponíveis para esta campanha.
            </Card>
          )}
        </>
      )}

      {/* Estado vazio para drafts */}
      {campaign.status === 'DRAFT' && (
        <Card className="p-10 text-center">
          <Send size={32} className="mx-auto text-neutral-300 mb-3" />
          <p className="text-neutral-600 font-medium">Esta campanha ainda não foi enviada</p>
          <p className="text-neutral-400 text-sm mt-1 mb-4">
            Clique em &quot;Enviar Agora&quot; para disparar o press release para os destinatários.
          </p>
          <button
            onClick={handleSend}
            disabled={sendCampaign.isPending}
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-40 transition-colors"
          >
            <Send size={15} /> Enviar Agora
          </button>
        </Card>
      )}
    </div>
  )
}
