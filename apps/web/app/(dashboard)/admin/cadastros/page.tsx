'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import { useJournalistRegistrations, useReviewJournalistRegistration } from '@/hooks/useAdmin'
import type { JournalistRegistration, JournalistRegistrationStatus } from '@/services/admin.service'

const STATUS: Record<
  JournalistRegistrationStatus,
  { label: string; color: 'success' | 'warning' | 'danger' }
> = {
  PENDING: { label: 'Pendente', color: 'warning' },
  APPROVED: { label: 'Aprovado', color: 'success' },
  REJECTED: { label: 'Rejeitado', color: 'danger' },
}

export default function JournalistRegistrationsAdminPage() {
  const [status, setStatus] = useState<JournalistRegistrationStatus | ''>('PENDING')
  const { data, isLoading } = useJournalistRegistrations({
    status: status || undefined,
    limit: 50,
  })
  const review = useReviewJournalistRegistration()

  const registrations = data?.data ?? []

  const submitReview = (id: string, nextStatus: JournalistRegistrationStatus) => {
    review.mutate({ id, status: nextStatus })
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 p-6 text-white shadow-xl shadow-brand-900/10 sm:p-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
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
            <Sparkles size={13} /> Admin
          </span>
          <h1 className="text-2xl tracking-tight sm:text-3xl title-strong">
            Cadastros de Jornalistas
          </h1>
          <p className="text-sm text-brand-100/80">
            Aprove pedidos públicos e converta-os em contactos da base AngoPress.
          </p>
        </div>
      </section>

      <Card>
        <CardHeader title="Filtros" />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as JournalistRegistrationStatus | '')}
          className="w-full sm:w-64 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
        >
          <option value="">Todos</option>
          <option value="PENDING">Pendentes</option>
          <option value="APPROVED">Aprovados</option>
          <option value="REJECTED">Rejeitados</option>
        </select>
      </Card>

      <Table<JournalistRegistration>
        data={registrations}
        loading={isLoading}
        keyExtractor={(registration) => registration.id}
        emptyMessage="Nenhum pedido encontrado."
        columns={[
          {
            key: 'name',
            header: 'Jornalista',
            render: (registration) => (
              <div>
                <p className="font-medium text-neutral-900">{registration.name}</p>
                <p className="text-xs text-neutral-500">{registration.email}</p>
              </div>
            ),
          },
          {
            key: 'outlet',
            header: 'Veículo',
            render: (registration) => (
              <div>
                <p>{registration.outlet}</p>
                <p className="text-xs text-neutral-500">{registration.jobTitle ?? '—'}</p>
              </div>
            ),
          },
          { key: 'mediaType', header: 'Média' },
          { key: 'city', header: 'Cidade', render: (registration) => registration.city ?? '—' },
          {
            key: 'status',
            header: 'Estado',
            render: (registration) => (
              <Badge color={STATUS[registration.status].color} dot>
                {STATUS[registration.status].label}
              </Badge>
            ),
          },
          {
            key: 'actions',
            header: 'Acções',
            render: (registration) =>
              registration.status === 'PENDING' ? (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    icon={<CheckCircle2 size={14} />}
                    loading={review.isPending}
                    onClick={() => submitReview(registration.id, 'APPROVED')}
                  >
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<XCircle size={14} />}
                    loading={review.isPending}
                    onClick={() => submitReview(registration.id, 'REJECTED')}
                  >
                    Rejeitar
                  </Button>
                </div>
              ) : (
                '—'
              ),
          },
        ]}
      />
    </div>
  )
}
