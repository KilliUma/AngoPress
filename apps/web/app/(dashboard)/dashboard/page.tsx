'use client'

import Link from 'next/link'
import {
  Users,
  List,
  FileText,
  Send,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Clock,
  PlusCircle,
  CalendarDays,
  BarChart2,
} from 'lucide-react'
import { clsx } from 'clsx'
import { usePressReleases } from '@/hooks/usePressReleases'
import { useJournalists } from '@/hooks/useJournalists'
import { useMailingLists } from '@/hooks/useMailingLists'
import { useCampaigns } from '@/hooks/useCampaigns'
import { useAuthStore } from '@/store/auth.store'

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  sub,
  trend,
  href,
  ctaLabel = 'Ver todos',
  loading,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  accent: 'brand' | 'emerald' | 'violet' | 'amber'
  sub?: string
  trend?: { label: string; positive: boolean }
  href: string
  ctaLabel?: string
  loading?: boolean
}) {
  const colors = {
    brand: {
      top: 'bg-brand-600',
      iconBg: 'bg-brand-50',
      text: 'text-brand-600',
      iconText: 'text-brand-600',
      pill: 'bg-brand-50 text-brand-700',
      shadow: 'hover:shadow-brand-900/10',
    },
    emerald: {
      top: 'bg-emerald-500',
      iconBg: 'bg-emerald-50',
      text: 'text-emerald-600',
      iconText: 'text-emerald-600',
      pill: 'bg-emerald-50 text-emerald-700',
      shadow: 'hover:shadow-emerald-900/10',
    },
    violet: {
      top: 'bg-violet-500',
      iconBg: 'bg-violet-50',
      text: 'text-violet-600',
      iconText: 'text-violet-600',
      pill: 'bg-violet-50 text-violet-700',
      shadow: 'hover:shadow-violet-900/10',
    },
    amber: {
      top: 'bg-amber-500',
      iconBg: 'bg-amber-50',
      text: 'text-amber-600',
      iconText: 'text-amber-600',
      pill: 'bg-amber-50 text-amber-700',
      shadow: 'hover:shadow-amber-900/10',
    },
  }
  const c = colors[accent]
  const badgeLabel = trend?.label ?? sub

  return (
    <div
      className={clsx(
        'group relative overflow-hidden rounded-xl border border-neutral-100 bg-white p-3.5 shadow-sm shadow-neutral-900/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-4',
        c.shadow,
      )}
    >
      <span className={clsx('absolute inset-x-0 top-0 h-0.5', c.top)} />

      <div className="flex items-start justify-between gap-2 pt-2">
        <div
          className={clsx(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-105',
            c.iconBg,
          )}
        >
          <Icon size={17} className={c.iconText} strokeWidth={2.1} />
        </div>
        {badgeLabel && (
          <span
            className={clsx(
              'inline-flex min-h-6 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold',
              trend && !trend.positive ? 'bg-red-50 text-red-600' : c.pill,
            )}
          >
            {trend && <TrendingUp size={10} className="mr-1" />}
            {badgeLabel}
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="text-xs font-semibold leading-snug text-neutral-600">{label}</p>
        {loading ? (
          <div className="mt-2 h-7 w-14 animate-pulse rounded-md bg-neutral-100" />
        ) : (
          <p className="mt-2 text-2xl leading-none text-neutral-900 title-heavy">{value}</p>
        )}
      </div>

      <Link
        href={href}
        className={clsx(
          'mt-3 inline-flex w-fit items-center gap-1.5 text-xs font-semibold transition-colors',
          c.text,
        )}
      >
        {ctaLabel}
        <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  )
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    SENT: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    SCHEDULED: 'text-blue-700 bg-blue-50 border-blue-200',
    DRAFT: 'text-neutral-500 bg-neutral-100 border-neutral-200',
    SENDING: 'text-amber-700 bg-amber-50 border-amber-200',
  }
  const labels: Record<string, string> = {
    SENT: 'Enviado',
    SCHEDULED: 'Agendado',
    DRAFT: 'Rascunho',
    SENDING: 'A enviar',
  }
  return (
    <span
      className={clsx(
        'text-[11px] font-bold px-2 py-0.5 rounded-full border',
        map[status] ?? map.DRAFT,
      )}
    >
      {labels[status] ?? status}
    </span>
  )
}

const QUICK_ACTIONS = [
  {
    href: '/press-releases/novo',
    icon: FileText,
    label: 'Novo press release',
    desc: 'Redigir e formatar',
  },
  { href: '/campanhas/nova', icon: Send, label: 'Nova campanha', desc: 'Enviar para jornalistas' },
  { href: '/analytics', icon: BarChart2, label: 'Analytics', desc: 'Ver desempenho' },
  { href: '/assinatura', icon: CreditCard, label: 'Assinatura', desc: 'Gerir plano' },
]

function CreditCard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
      />
    </svg>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: prData, isLoading: loadingPR } = usePressReleases({ limit: 5 })
  const { data: jData, isLoading: loadingJ } = useJournalists({ limit: 1 })
  const { data: mlData, isLoading: loadingML } = useMailingLists()
  const { data: campData, isLoading: loadingCamp } = useCampaigns({ limit: 3 })

  const totalPR = prData?.meta?.total ?? 0
  const totalJournalists = jData?.meta?.total ?? 0
  const totalLists = mlData?.length ?? 0
  const totalCampaigns = campData?.meta?.total ?? 0

  const recentPR = prData?.data?.slice(0, 4) ?? []
  const recentCamps = campData?.data?.slice(0, 3) ?? []

  const firstName = user?.name?.split(' ')[0] ?? 'utilizador'

  const today = new Date().toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <>
      <div className="space-y-6 max-w-[1280px]">
        {/* ── Welcome banner ── */}
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 p-6 text-white shadow-xl shadow-brand-900/10 sm:p-8">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute rounded-full -top-20 -right-20 h-72 w-72 bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 w-64 h-40 rounded-full left-1/3 bg-brand-900/40 blur-2xl" />
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
                backgroundSize: '44px 44px',
              }}
            />
          </div>
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-brand-100">👋 Olá!, {firstName}</p>
              <div>
                <h1 className="text-2xl tracking-tight sm:text-3xl title-strong">
                  Bem-vindo de volta à AngoPress
                </h1>
                <p className="mt-1.5 text-sm text-brand-100/80">
                  Distribua press releases e alcance jornalistas em todo Angola.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 shrink-0 sm:items-end">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90">
                <CalendarDays size={12} />
                {today}
              </span>
              <Link
                href="/press-releases/novo"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all border rounded-xl bg-white/15 border-white/20 backdrop-blur-sm hover:bg-white/25"
              >
                <FileText size={14} />
                Novo press release
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-50 text-brand-600">
              <BarChart2 size={16} />
            </span>
            <h2 className="font-bold font-display text-neutral-800">Estatísticas</h2>
            <span className="flex items-center gap-1 ml-auto rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-500">
              <RefreshCw size={11} />
              Actualizado agora
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Jornalistas na BD"
              value={totalJournalists}
              icon={Users}
              accent="emerald"
              href="/jornalistas"
              ctaLabel="Ver todos"
              trend={{ label: 'Base verificada', positive: true }}
              loading={loadingJ}
            />
            <StatCard
              label="Listas de Mailing"
              value={totalLists}
              icon={List}
              accent="violet"
              href="/listas"
              ctaLabel="Ver todas"
              trend={{ label: 'Segmentadas', positive: true }}
              loading={loadingML}
            />
            <StatCard
              label="Press Releases"
              value={totalPR}
              icon={FileText}
              accent="brand"
              sub="Total criados"
              href="/press-releases"
              loading={loadingPR}
            />
            <StatCard
              label="Campanhas"
              value={totalCampaigns}
              icon={Send}
              accent="amber"
              sub="Total enviadas"
              href="/campanhas"
              ctaLabel="Ver todas"
              loading={loadingCamp}
            />
          </div>
        </div>

        {/* ── Status dos press releases + acções rápidas ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Press releases recentes — 2/3 */}
          <div className="overflow-hidden bg-white border lg:col-span-2 rounded-2xl border-neutral-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-50 text-brand-600">
                  <FileText size={15} />
                </span>
                <h2 className="text-sm font-bold font-display text-neutral-800">
                  Press Releases Recentes
                </h2>
              </div>
              <Link
                href="/press-releases"
                className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
              >
                Ver todos <ArrowRight size={12} />
              </Link>
            </div>
            {loadingPR ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-lg bg-neutral-100 animate-pulse" />
                ))}
              </div>
            ) : recentPR.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-neutral-400">
                <FileText size={32} className="text-neutral-200" />
                <p>Ainda não criou nenhum press release.</p>
                <Link
                  href="/press-releases/novo"
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  Criar o primeiro →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {recentPR.map(
                  (pr: { id: string; title: string; status: string; createdAt: string }) => (
                    <div
                      key={pr.id}
                      className="flex items-center justify-between px-6 py-3.5 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center min-w-0 gap-3">
                        <span
                          className={clsx(
                            'w-2 h-2 rounded-full shrink-0',
                            pr.status === 'SENT'
                              ? 'bg-emerald-400'
                              : pr.status === 'SCHEDULED'
                                ? 'bg-blue-400'
                                : pr.status === 'SENDING'
                                  ? 'bg-amber-400'
                                  : 'bg-neutral-300',
                          )}
                        />
                        <p className="text-sm font-medium truncate text-neutral-800">{pr.title}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4 shrink-0">
                        <span className="text-xs text-neutral-400">
                          {new Date(pr.createdAt).toLocaleDateString('pt-PT', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                        <StatusChip status={pr.status} />
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Acções rápidas — 1/3 */}
          <div className="overflow-hidden bg-white border rounded-2xl border-neutral-200">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-neutral-100">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-50 text-brand-600">
                <TrendingUp size={15} />
              </span>
              <h2 className="text-sm font-bold text-neutral-800">Acções Rápidas</h2>
            </div>
            <div className="p-3 space-y-1">
              {QUICK_ACTIONS.map(({ href, icon: Icon, label, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 p-3 transition-colors rounded-xl hover:bg-neutral-50 group"
                >
                  <span className="flex items-center justify-center transition-colors rounded-lg w-9 h-9 bg-brand-50 shrink-0 group-hover:bg-brand-100">
                    <Icon size={16} className="text-brand-600" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight text-neutral-800 group-hover:text-brand-700">
                      {label}
                    </p>
                    <p className="text-xs truncate text-neutral-400">{desc}</p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="ml-auto transition-colors text-neutral-300 group-hover:text-brand-500 shrink-0"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Campanhas recentes ── */}
        {!loadingCamp && recentCamps.length > 0 && (
          <div className="overflow-hidden bg-white border rounded-2xl border-neutral-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-50 text-brand-600">
                  <Send size={15} />
                </span>
                <h2 className="text-sm font-bold font-display text-neutral-800">
                  Campanhas Recentes
                </h2>
              </div>
              <Link
                href="/campanhas"
                className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
              >
                Ver todas <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-y-0 sm:divide-x divide-neutral-100">
              {recentCamps.map(
                (c: {
                  id: string
                  name: string
                  status: string
                  totalRecipients?: number
                  createdAt: string
                }) => (
                  <div
                    key={c.id}
                    className="flex flex-col gap-2 px-6 py-4 transition-colors hover:bg-neutral-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-snug text-neutral-800 line-clamp-2">
                        {c.name}
                      </p>
                      <StatusChip status={c.status} />
                    </div>
                    <div className="flex items-center gap-4 mt-auto text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Users size={11} />
                        {c.totalRecipients ?? 0} destinatários
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(c.createdAt).toLocaleDateString('pt-PT', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── FAB: Nova Campanha ── */}
      <Link
        href="/campanhas/nova"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-4 py-3 rounded-2xl shadow-xl shadow-brand-900/30 hover:shadow-2xl hover:shadow-brand-900/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
      >
        <PlusCircle size={18} />
        Nova Campanha
      </Link>
    </>
  )
}
