'use client'

import Link from 'next/link'
import { Users, List, FileText, Send, TrendingUp } from 'lucide-react'
import { clsx } from 'clsx'
import { usePressReleases } from '@/hooks/usePressReleases'
import { useJournalists } from '@/hooks/useJournalists'
import { useMailingLists } from '@/hooks/useMailingLists'
import { useAuthStore } from '@/store/auth.store'

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  color: string
  loading?: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 flex items-center gap-4">
      <div
        className={clsx('w-12 h-12 rounded-lg flex items-center justify-center shrink-0', color)}
      >
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-neutral-500">{label}</p>
        {loading ? (
          <div className="h-7 w-16 bg-neutral-100 animate-pulse rounded mt-1" />
        ) : (
          <p className="text-2xl font-bold text-neutral-900">{value}</p>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: prData, isLoading: loadingPR } = usePressReleases({ limit: 1 })
  const { data: jData, isLoading: loadingJ } = useJournalists({ limit: 1 })
  const { data: mlData, isLoading: loadingML } = useMailingLists()

  const totalPR = prData?.meta?.total ?? 0
  const totalJournalists = jData?.meta?.total ?? 0
  const totalLists = mlData?.length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Bom dia, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-neutral-500 mt-1">Aqui está um resumo da sua actividade.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Jornalistas na BD"
          value={totalJournalists}
          icon={Users}
          color="bg-emerald-500"
          loading={loadingJ}
        />
        <StatCard
          label="Listas de Mailing"
          value={totalLists}
          icon={List}
          color="bg-violet-500"
          loading={loadingML}
        />
        <StatCard
          label="Press Releases"
          value={totalPR}
          icon={FileText}
          color="bg-brand-600"
          loading={loadingPR}
        />
        <StatCard label="Campanhas Enviadas" value="—" icon={Send} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-brand-600" />
            <h2 className="font-semibold text-neutral-900">Acções rápidas</h2>
          </div>
          <div className="space-y-2">
            <Link
              href="/press-releases/novo"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group"
            >
              <FileText size={16} className="text-neutral-400 group-hover:text-brand-600" />
              <span className="text-sm text-neutral-600 group-hover:text-neutral-900">
                Redigir novo press release
              </span>
            </Link>
            <Link
              href="/campanhas"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group"
            >
              <Send size={16} className="text-neutral-400 group-hover:text-brand-600" />
              <span className="text-sm text-neutral-600 group-hover:text-neutral-900">
                Criar nova campanha de envio
              </span>
            </Link>
            <Link
              href="/analytics"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group"
            >
              <TrendingUp size={16} className="text-neutral-400 group-hover:text-brand-600" />
              <span className="text-sm text-neutral-600 group-hover:text-neutral-900">
                Ver relatórios de desempenho
              </span>
            </Link>
            <Link
              href="/assinatura"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors group"
            >
              <List size={16} className="text-neutral-400 group-hover:text-brand-600" />
              <span className="text-sm text-neutral-600 group-hover:text-neutral-900">
                Consultar plano e assinatura
              </span>
            </Link>
          </div>
        </div>

        <div className="bg-brand-800 rounded-xl p-6 text-white flex flex-col justify-between">
          <div>
            <h2 className="font-semibold mb-2">AngoPress</h2>
            <p className="text-brand-300 text-sm">
              Plataforma de distribuição de press releases para os principais meios de comunicação
              de Angola.
            </p>
          </div>
          <div className="text-xs text-brand-400 border-t border-brand-700 pt-4 mt-6">v1.0.0</div>
        </div>
      </div>
    </div>
  )
}
