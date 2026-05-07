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
  Sparkles,
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
    <Card className="flex items-center gap-4 p-5">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-50 text-brand-600 shrink-0">
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
        <div className="w-8 h-8 border-4 rounded-full border-neutral-200 border-t-brand-600 animate-spin" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-neutral-400">
        <AlertCircle size={32} className="mb-2" />
        <p>Campanha não encontrada.</p>
        <Link href="/campanhas" className="mt-3 text-sm underline text-brand-600">
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
    <div className="max-w-6xl space-y-6">
      {/* ── Banner de topo ── */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 p-6 text-white shadow-xl shadow-brand-900/10 sm:p-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-56 h-56 rounded-full -top-16 -right-16 bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 w-64 h-32 rounded-full left-1/4 bg-brand-950/25 blur-2xl" />
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
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-100/80 hover:text-white transition-colors mb-1"
            >
              <ArrowLeft size={13} /> Campanhas
            </button>
            <span className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-100 w-fit">
              <Sparkles size={13} />
              Disparo de email
            </span>
            <h1 className="text-2xl tracking-tight sm:text-3xl title-strong">{campaign.name}</h1>
            <p className="text-sm text-brand-100/80">{campaign.subject}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/25 bg-white/15 text-white`}
            >
              {statusCfg.icon} {statusCfg.label}
            </span>
            {canSend && (
              <button
                onClick={handleSend}
                disabled={sendCampaign.isPending}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-brand-700 shadow-md hover:bg-neutral-50 disabled:opacity-40 transition-all"
              >
                {sendCampaign.isPending ? (
                  <div className="w-4 h-4 border-2 rounded-full border-brand-300 border-t-brand-700 animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                Enviar Agora
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Info Card */}
      <Card className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
        <div>
          <p className="text-xs text-neutral-500 mb-0.5">Destinatários</p>
          <p className="text-lg font-bold text-neutral-900">{campaign.totalRecipients}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 mb-0.5">Press Release</p>
          <p className="text-sm font-medium truncate text-neutral-900">
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
              <div className="w-3 h-3 border-2 rounded-full border-amber-500 border-t-transparent animate-spin" />
              A actualizar métricas em tempo real…
            </div>
          )}
          {hasValidApiMetrics ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
          <Send size={32} className="mx-auto mb-3 text-neutral-300" />
          <p className="font-medium text-neutral-600">Esta campanha ainda não foi enviada</p>
          <p className="mt-1 mb-4 text-sm text-neutral-400">
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
