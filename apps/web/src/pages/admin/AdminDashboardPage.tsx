import { Users, CreditCard, Send, Newspaper, FileText, Clock } from 'lucide-react'
import { clsx } from 'clsx'
import { useAdminStats, useAdminSubscriptions } from '@/hooks/useAdmin'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  loading,
  badge,
}: {
  label: string
  value: number
  icon: React.ElementType
  color: string
  loading?: boolean
  badge?: number
}) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 flex items-center gap-4">
      <div
        className={clsx('w-12 h-12 rounded-lg flex items-center justify-center shrink-0', color)}
      >
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-500">{label}</p>
        {loading ? (
          <div className="h-7 w-16 bg-neutral-100 animate-pulse rounded mt-1" />
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-neutral-900">{value.toLocaleString('pt-AO')}</p>
            {badge !== undefined && badge > 0 && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                {badge} pendente{badge !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const { data: stats, isLoading } = useAdminStats()
  const { data: pendingData } = useAdminSubscriptions({ status: 'PENDING', limit: 5 })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard Administração</h1>
        <p className="text-neutral-500 mt-1">Visão geral da plataforma AngoPress.</p>
      </div>

      {/* Cartões de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Utilizadores"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          color="bg-brand-600"
          loading={isLoading}
        />
        <StatCard
          label="Assinaturas Activas"
          value={stats?.activeSubscriptions ?? 0}
          icon={CreditCard}
          color="bg-emerald-500"
          loading={isLoading}
          badge={stats?.pendingSubscriptions}
        />
        <StatCard
          label="Campanhas Enviadas"
          value={stats?.totalCampaignsSent ?? 0}
          icon={Send}
          color="bg-violet-500"
          loading={isLoading}
        />
        <StatCard
          label="Jornalistas"
          value={stats?.totalJournalists ?? 0}
          icon={Newspaper}
          color="bg-amber-500"
          loading={isLoading}
        />
        <StatCard
          label="Press Releases"
          value={stats?.totalPressReleases ?? 0}
          icon={FileText}
          color="bg-rose-500"
          loading={isLoading}
        />
      </div>

      {/* Assinaturas pendentes */}
      {(pendingData?.data?.length ?? 0) > 0 && (
        <div className="bg-white rounded-xl border border-amber-200">
          <div className="px-5 py-3 border-b border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-amber-600" />
              <h2 className="font-semibold text-neutral-900 text-sm">
                Assinaturas pendentes de aprovação
              </h2>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                {pendingData?.meta.total}
              </span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/assinaturas')}
              className="text-xs text-brand-600 hover:underline"
            >
              Ver todas
            </button>
          </div>
          <ul className="divide-y divide-neutral-100">
            {pendingData?.data.map((sub) => (
              <li
                key={sub.id}
                className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 cursor-pointer"
                onClick={() => navigate('/admin/assinaturas')}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">{sub.user.name}</p>
                  <p className="text-xs text-neutral-500">{sub.user.email}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-medium text-neutral-800">{sub.plan?.name}</p>
                  <p className="text-xs text-neutral-500">
                    {format(new Date(sub.createdAt), 'dd MMM yyyy', { locale: ptBR })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
