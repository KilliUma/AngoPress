import { Users, List, FileText, Send, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useJournalists } from '@/hooks/useJournalists'
import { useMailingLists } from '@/hooks/useMailingLists'
import { usePressReleases } from '@/hooks/usePressReleases'
import { useCampaigns } from '@/hooks/useCampaigns'
import { useAuthStore } from '@/store/auth.store'
import { clsx } from 'clsx'

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

export function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { data: journalistsData, isLoading: loadingJ } = useJournalists({ limit: 1 })
  const { data: listsData, isLoading: loadingL } = useMailingLists()
  const { data: prData, isLoading: loadingPR } = usePressReleases({ limit: 1 })
  const { data: campaignsData, isLoading: loadingC } = useCampaigns({ status: 'SENT', limit: 6 })

  const totalJournalists = journalistsData?.meta.total ?? 0
  const totalLists = listsData?.length ?? 0
  const totalPR = prData?.meta.total ?? 0
  const totalCampaigns = campaignsData?.meta.total ?? 0

  const chartData = (campaignsData?.data ?? [])
    .filter((c) => c.sentAt)
    .map((c) => ({
      name: c.name.length > 16 ? c.name.slice(0, 14) + '…' : c.name,
      Enviados: c.totalRecipients,
    }))
    .reverse()

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Bom dia, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-neutral-500 mt-1">Aqui está um resumo da sua actividade.</p>
      </div>

      {/* Cartões de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Jornalistas"
          value={totalJournalists}
          icon={Users}
          color="bg-brand-600"
          loading={loadingJ}
        />
        <StatCard
          label="Listas de Mailing"
          value={totalLists}
          icon={List}
          color="bg-emerald-500"
          loading={loadingL}
        />
        <StatCard
          label="Press Releases"
          value={totalPR}
          icon={FileText}
          color="bg-amber-500"
          loading={loadingPR}
        />
        <StatCard
          label="Campanhas Enviadas"
          value={totalCampaigns}
          icon={Send}
          color="bg-violet-500"
          loading={loadingC}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfico de campanhas */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-brand-600" />
            <h2 className="font-semibold text-neutral-900 text-sm">Envios por campanha</h2>
          </div>
          {loadingC ? (
            <div className="h-40 animate-pulse bg-neutral-100 rounded-lg" />
          ) : chartData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-neutral-400 text-sm">
              Sem campanhas enviadas ainda.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="Enviados" fill="#7c3aed" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick actions + últimas campanhas */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <h2 className="font-semibold text-neutral-900 text-sm mb-3">Acções rápidas</h2>
            <div className="space-y-1.5">
              <a
                href="/jornalistas"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-neutral-50 group"
              >
                <Users size={15} className="text-neutral-400 group-hover:text-brand-600" />
                <span className="text-sm text-neutral-600 group-hover:text-neutral-900">
                  Gerir jornalistas
                </span>
              </a>
              <a
                href="/press-releases/novo"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-neutral-50 group"
              >
                <FileText size={15} className="text-neutral-400 group-hover:text-brand-600" />
                <span className="text-sm text-neutral-600 group-hover:text-neutral-900">
                  Novo press release
                </span>
              </a>
              <a
                href="/campanhas/nova"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-neutral-50 group"
              >
                <Send size={15} className="text-neutral-400 group-hover:text-brand-600" />
                <span className="text-sm text-neutral-600 group-hover:text-neutral-900">
                  Nova campanha
                </span>
              </a>
            </div>
          </div>

          {/* Últimas campanhas */}
          {campaignsData?.data.length ? (
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-between">
                <h2 className="font-semibold text-neutral-900 text-sm">Últimas campanhas</h2>
                <button
                  type="button"
                  onClick={() => navigate('/campanhas')}
                  className="text-xs text-brand-600 hover:underline"
                >
                  Ver todas
                </button>
              </div>
              <ul className="divide-y divide-neutral-100">
                {campaignsData.data.slice(0, 4).map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between px-5 py-2.5 hover:bg-neutral-50 cursor-pointer"
                    onClick={() => navigate(`/campanhas/${c.id}`)}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">{c.name}</p>
                      <p className="text-xs text-neutral-500">
                        {c.sentAt ? format(new Date(c.sentAt), 'dd MMM', { locale: ptBR }) : '—'}
                      </p>
                    </div>
                    <span className="text-xs text-neutral-500 ml-3 shrink-0">
                      {c.totalRecipients} env.
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
