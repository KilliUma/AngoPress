'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Megaphone, Plus, Search, CheckCircle2, Clock, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useCampaigns } from '@/hooks/useCampaigns'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'

const STATUS_BADGE = {
  DRAFT: { label: 'Rascunho', class: 'bg-neutral-100 text-neutral-600 border border-neutral-200' },
  SCHEDULED: { label: 'Agendada', class: 'bg-sky-50 text-sky-700 border border-sky-100' },
  QUEUED: { label: 'Na fila', class: 'bg-amber-50 text-amber-700 border border-amber-100' },
  SENDING: { label: 'A enviar', class: 'bg-amber-50 text-amber-700 border border-amber-100' },
  SENT: { label: 'Enviada', class: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
  FAILED: { label: 'Falhou', class: 'bg-red-50 text-red-700 border border-red-100' },
  CANCELLED: {
    label: 'Cancelada',
    class: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
  },
}

export default function CampanhasPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useCampaigns({ search })

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
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-100">
              <Sparkles size={13} />
              Disparos de email
            </span>
            <h1 className="text-2xl tracking-tight sm:text-3xl title-strong">Campanhas</h1>
            <p className="text-sm text-brand-100/80">
              Gerir e acompanhar os disparos de press releases para jornalistas.
            </p>
          </div>
          <Link
            href="/campanhas/nova"
            className="inline-flex items-center gap-2 self-start rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-brand-700 shadow-md hover:bg-neutral-50 transition-all shrink-0"
          >
            <Plus size={16} /> Nova Campanha
          </Link>
        </div>
      </section>

      <Card className="rounded-[20px] p-0 overflow-hidden shadow-sm">
        <div className="border-b border-neutral-100 px-5 py-4 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              size={15}
            />
            <input
              type="text"
              placeholder="Procurar campanhas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm shadow-sm placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b border-neutral-100 bg-neutral-50/80">
              <tr>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                  Campanha
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                  Estado
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                  Destinatários
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
                  Data de Envio
                </th>
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
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-50 text-brand-600">
                        <Megaphone size={30} />
                      </div>
                      <div>
                        <p className="font-display font-semibold text-neutral-900">
                          Nenhuma campanha encontrada
                        </p>
                        <p className="mt-1 text-sm text-neutral-500">
                          Crie a sua primeira campanha de distribuição.
                        </p>
                      </div>
                      <Link
                        href="/campanhas/nova"
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
                      >
                        <Plus size={15} /> Nova campanha
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.data?.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/campanhas/${campaign.id}`} className="block">
                        <p className="font-semibold text-neutral-900">{campaign.name}</p>
                        <p className="text-xs text-neutral-500 mt-0.5 truncate max-w-xs">
                          {campaign.subject}
                        </p>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          STATUS_BADGE[campaign.status]?.class ||
                          'bg-neutral-100 text-neutral-600 border border-neutral-200'
                        }`}
                      >
                        {STATUS_BADGE[campaign.status]?.label || campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700 font-medium">
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
