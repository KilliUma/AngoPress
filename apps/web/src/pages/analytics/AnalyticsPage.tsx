import { useNavigate } from 'react-router-dom'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { BarChart2, Send, TrendingUp } from 'lucide-react'
import { useCampaigns } from '@/hooks/useCampaigns'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function AnalyticsPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useCampaigns({ status: 'SENT', limit: 10 })

  // Dados para o gráfico Recharts
  const chartData = (data?.data ?? [])
    .filter((c) => c.sentAt)
    .map((c) => ({
      name: c.name.length > 20 ? c.name.slice(0, 18) + '…' : c.name,
      Enviados: c.totalRecipients,
    }))
    .reverse()

  const totalCampaigns = data?.meta.total ?? 0
  const totalSent = (data?.data ?? []).reduce((s, c) => s + c.totalRecipients, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Analytics</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Desempenho geral das suas campanhas</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center">
            <Send size={18} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Campanhas enviadas</p>
            <p className="text-2xl font-bold text-neutral-900">{totalCampaigns}</p>
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
            <BarChart2 size={18} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Envios este mês</p>
            <p className="text-2xl font-bold text-neutral-900">{totalSent}</p>
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-violet-500 flex items-center justify-center">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-neutral-500">Média destinatários</p>
            <p className="text-2xl font-bold text-neutral-900">
              {totalCampaigns > 0 ? Math.round(totalSent / totalCampaigns) : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico de barras */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6">
        <h2 className="font-medium text-neutral-800 mb-4 text-sm">
          Envios por campanha (últimas 10)
        </h2>
        {isLoading ? (
          <div className="h-56 flex items-center justify-center text-neutral-400 text-sm">
            A carregar...
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-neutral-400 text-sm">
            Nenhuma campanha enviada ainda.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Enviados" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Últimas campanhas */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h2 className="font-medium text-neutral-800 text-sm">Últimas campanhas enviadas</h2>
        </div>
        {!data?.data.length ? (
          <div className="p-8 text-center text-neutral-400 text-sm">Nenhuma campanha enviada.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Campanha</th>
                <th className="text-left px-5 py-3 font-medium">Press Release</th>
                <th className="text-left px-5 py-3 font-medium">Enviados</th>
                <th className="text-left px-5 py-3 font-medium">Data envio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.data.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-neutral-50 cursor-pointer"
                  onClick={() => navigate(`/campanhas/${c.id}`)}
                >
                  <td className="px-5 py-3 font-medium text-neutral-800">{c.name}</td>
                  <td className="px-5 py-3 text-neutral-500 text-xs">
                    {c.pressRelease?.title ?? '—'}
                  </td>
                  <td className="px-5 py-3 text-neutral-600">{c.totalRecipients}</td>
                  <td className="px-5 py-3 text-neutral-500 text-xs">
                    {c.sentAt
                      ? format(new Date(c.sentAt), 'dd MMM yyyy HH:mm', { locale: ptBR })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
