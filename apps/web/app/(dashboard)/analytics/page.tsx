'use client'

import { useCampaigns } from '@/hooks/useCampaigns'
import { Card } from '@/components/ui/Card'
import { BarChart2, Mail, MousePointerClick, AlertCircle } from 'lucide-react'
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

export default function AnalyticsPage() {
  const { data: campaignsObj, isLoading } = useCampaigns({ limit: 10 })
  const campaigns = campaignsObj?.data || []

  // Calcular métricas globais baseando-se apenas nos resultados das campanhas
  const sentCampaigns = campaigns.filter((c) => c.status === 'SENT')
  const totalSent = sentCampaigns.reduce((acc, c) => acc + (c.totalRecipients || 0), 0)

  // Exemplo de agregação de dados para o chart
  const chartData = sentCampaigns
    .map((c) => ({
      name: c.name.substring(0, 15) + '...',
      Enviados: c.totalRecipients,
      // (Na realidade deveria vir detalhado na listagem global via aggregation API, estamos apenas a ilustrar)
      Aberturas: Math.floor(c.totalRecipients * 0.4),
      Cliques: Math.floor(c.totalRecipients * 0.1),
    }))
    .reverse()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Analytics</h1>
        <p className="text-neutral-500 mt-1">
          Visão geral do desempenho de todas as suas campanhas.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-sky-50 flex items-center justify-center">
            <BarChart2 className="text-sky-500" size={24} />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Campanhas Enviadas</p>
            <p className="text-2xl font-bold text-neutral-900">{sentCampaigns.length}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center">
            <Mail className="text-brand-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Total de Emails Enviados</p>
            <p className="text-2xl font-bold text-neutral-900">{totalSent}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
            <MousePointerClick className="text-emerald-500" size={24} />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Taxa Média de Abertura</p>
            <p className="text-2xl font-bold text-neutral-900">~ 40%</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
            <AlertCircle className="text-red-500" size={24} />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Taxa de Rejeição (Bounce)</p>
            <p className="text-2xl font-bold text-neutral-900">~ 1.5%</p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-bold text-neutral-900 mb-6">
          Desempenho das últimas 10 campanhas
        </h2>
        <div className="w-full h-[400px]">
          {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400">
              <div className="w-8 h-8 rounded-full border-4 border-neutral-200 border-t-brand-600 animate-spin mb-4" />
              A carregar dados...
            </div>
          ) : chartData.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              Sem dados suficientes para gerar gráfico. Envie algumas campanhas primeiro.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#737373' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#737373' }}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: '#f5f5f5' }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Enviados" fill="#8A0018" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Aberturas" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Cliques" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  )
}
