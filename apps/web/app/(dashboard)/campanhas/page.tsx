'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Megaphone, Plus, Search, CheckCircle2, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useCampaigns } from '@/hooks/useCampaigns'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'

const STATUS_BADGE = {
  DRAFT: { label: 'Rascunho', class: 'bg-neutral-100 text-neutral-700' },
  SCHEDULED: { label: 'Agendada', class: 'bg-sky-100 text-sky-700' },
  QUEUED: { label: 'Na fila', class: 'bg-amber-100 text-amber-700' },
  SENDING: { label: 'A enviar', class: 'bg-amber-100 text-amber-700' },
  SENT: { label: 'Enviada', class: 'bg-emerald-100 text-emerald-700' },
  FAILED: { label: 'Falhou', class: 'bg-red-100 text-red-700' },
  CANCELLED: { label: 'Cancelada', class: 'bg-neutral-100 text-neutral-700' },
}

export default function CampanhasPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useCampaigns({ search })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Campanhas</h1>
          <p className="text-neutral-500 mt-1">Gerir e acompanhar disparos de press releases.</p>
        </div>
        <Link
          href="/campanhas/nova"
          className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus size={18} /> Nova Campanha
        </Link>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Procurar campanhas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-100">
              <tr>
                <th className="px-6 py-4 font-medium">Campanha</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Destinatários</th>
                <th className="px-6 py-4 font-medium">Data de Envio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">
                    A carregar campanhas...
                  </td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center mb-3">
                        <Megaphone size={24} />
                      </div>
                      <p className="text-neutral-900 font-medium">Nenhuma campanha encontrada</p>
                      <p className="text-neutral-500 text-sm mt-1">Crie a sua primeira campanha.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.data?.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/campanhas/${campaign.id}`} className="block">
                        <p className="font-medium text-neutral-900">{campaign.name}</p>
                        <p className="text-xs text-neutral-500 mt-0.5 truncate max-w-xs">
                          {campaign.subject}
                        </p>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_BADGE[campaign.status]?.class || 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {STATUS_BADGE[campaign.status]?.label || campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {campaign.totalRecipients || campaign._count?.recipients || 0}
                    </td>
                    <td className="px-6 py-4">
                      {campaign.sentAt ? (
                        <span className="flex items-center gap-1.5 text-neutral-600">
                          <CheckCircle2 size={16} className="text-emerald-500" />
                          {format(new Date(campaign.sentAt), "dd 'de' MMM, HH:mm", { locale: pt })}
                        </span>
                      ) : campaign.scheduledAt ? (
                        <span className="flex items-center gap-1.5 text-neutral-600">
                          <Clock size={16} className="text-sky-500" />
                          {format(new Date(campaign.scheduledAt), "dd 'de' MMM, HH:mm", {
                            locale: pt,
                          })}
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
