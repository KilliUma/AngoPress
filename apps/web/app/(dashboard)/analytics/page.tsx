'use client'

import { useCampaigns } from '@/hooks/useCampaigns'
import { BarChart2, Mail, MousePointerClick, AlertCircle, Sparkles, TrendingUp } from 'lucide-react'
import dynamic from 'next/dynamic'

const RechartsChart = dynamic(
  () => import('@/components/analytics/RechartsChart').then((m) => ({ default: m.default })),
  { ssr: false },
)

export default function AnalyticsPage() {
  const { data: campaignsObj, isLoading } = useCampaigns({ limit: 10 })
  const campaigns = campaignsObj?.data || []

  const sentCampaigns = campaigns.filter((c) => c.status === 'SENT')
  const totalSent = sentCampaigns.reduce((acc, c) => acc + (c.totalRecipients || 0), 0)

  const chartData = sentCampaigns
    .map((c) => ({
      name: c.name.substring(0, 15) + '...',
      Enviados: c.totalRecipients,
      Aberturas: Math.floor(c.totalRecipients * 0.4),
      Cliques: Math.floor(c.totalRecipients * 0.1),
    }))
    .reverse()

  return (
    <div className="space-y-6">
      {/* ── Banner ── */}
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
        <div className="relative space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-100">
            <Sparkles size={13} />
            Métricas e dados
          </span>
          <h1 className="text-2xl tracking-tight sm:text-3xl title-strong">Analytics</h1>
          <p className="text-sm text-brand-100/80">
            Visão geral do desempenho de todas as suas campanhas.
          </p>
        </div>
      </section>

      {/* ── Cards de métricas ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: <BarChart2 size={20} />,
            label: 'Campanhas Enviadas',
            value: sentCampaigns.length,
            color: 'bg-sky-50 text-sky-600',
          },
          {
            icon: <Mail size={20} />,
            label: 'Total de Emails',
            value: totalSent,
            color: 'bg-brand-50 text-brand-600',
          },
          {
            icon: <MousePointerClick size={20} />,
            label: 'Taxa Média de Abertura',
            value: '~ 40%',
            color: 'bg-emerald-50 text-emerald-600',
          },
          {
            icon: <AlertCircle size={20} />,
            label: 'Taxa de Rejeição (Bounce)',
            value: '~ 1.5%',
            color: 'bg-red-50 text-red-600',
          },
        ].map(({ icon, label, value, color }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-[20px] border border-neutral-200/80 bg-white p-5 shadow-sm"
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${color}`}
            >
              {icon}
            </div>
            <div>
              <p className="text-xs text-neutral-500">{label}</p>
              <p className="mt-0.5 text-2xl text-neutral-900 title-strong">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Gráfico ── */}
      <div className="rounded-[20px] border border-neutral-200/80 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <TrendingUp size={16} />
          </span>
          <h2 className="font-display font-bold text-neutral-800">
            Desempenho das últimas 10 campanhas
          </h2>
        </div>
        <div className="w-full h-[400px]">
          {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-neutral-400">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-brand-600" />
              <p className="text-sm">A carregar dados...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 text-brand-600">
                <BarChart2 size={30} />
              </div>
              <div>
                <p className="font-display font-semibold text-neutral-900">Sem dados suficientes</p>
                <p className="mt-1 text-sm text-neutral-500">
                  Envie algumas campanhas para ver o gráfico.
                </p>
              </div>
            </div>
          ) : (
            <RechartsChart data={chartData} />
          )}
        </div>
      </div>
    </div>
  )
}
