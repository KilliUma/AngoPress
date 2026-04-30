'use client'

import { useState } from 'react'
import { Search, UserCheck, UserX, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { Table } from '@/components/ui/Table'
import { useAdminUsers, useUpdateUserStatus } from '@/hooks/useAdmin'
import type { AdminUser, UserStatus } from '@/services/admin.service'

const STATUS: Record<UserStatus, { label: string; color: 'success' | 'warning' | 'danger' }> = {
  ACTIVE: { label: 'Activo', color: 'success' },
  PENDING: { label: 'Pendente', color: 'warning' },
  INACTIVE: { label: 'Inactivo', color: 'danger' },
}

export default function UsersAdminPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<UserStatus | ''>('')
  const { data, isLoading, refetch, isFetching } = useAdminUsers({
    search: search || undefined,
    status: status || undefined,
    limit: 50,
  })
  const updateStatus = useUpdateUserStatus()

  const users = data?.data ?? []

  const setUserStatus = (user: AdminUser, nextStatus: UserStatus) => {
    updateStatus.mutate({ userId: user.id, status: nextStatus })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Utilizadores</h1>
          <p className="text-neutral-500 mt-1">Active, pause e acompanhe clientes da plataforma.</p>
        </div>
        <Button
          variant="outline"
          icon={<RefreshCw size={16} />}
          loading={isFetching}
          onClick={() => refetch()}
        >
          Actualizar
        </Button>
      </div>

      <Card>
        <CardHeader title="Filtros" />
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3">
          <label className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              size={17}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar nome, email ou empresa..."
              className="w-full border border-neutral-200 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as UserStatus | '')}
            className="border border-neutral-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand-600"
          >
            <option value="">Todos os estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="PENDING">Pendentes</option>
            <option value="INACTIVE">Inactivos</option>
          </select>
        </div>
      </Card>

      <Table<AdminUser>
        data={users}
        loading={isLoading}
        keyExtractor={(user) => user.id}
        emptyMessage="Nenhum utilizador encontrado."
        columns={[
          {
            key: 'name',
            header: 'Utilizador',
            render: (user) => (
              <div>
                <p className="font-medium text-neutral-900">{user.name}</p>
                <p className="text-xs text-neutral-500">{user.email}</p>
              </div>
            ),
          },
          {
            key: 'company',
            header: 'Empresa',
            render: (user) => user.company ?? '—',
          },
          {
            key: 'subscription',
            header: 'Plano',
            render: (user) => user.subscription?.plan?.name ?? 'Sem plano',
          },
          {
            key: 'status',
            header: 'Estado',
            render: (user) => (
              <Badge color={STATUS[user.status].color} dot>
                {STATUS[user.status].label}
              </Badge>
            ),
          },
          {
            key: 'actions',
            header: 'Acções',
            render: (user) => (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={<UserCheck size={14} />}
                  disabled={user.status === 'ACTIVE'}
                  onClick={() => setUserStatus(user, 'ACTIVE')}
                >
                  Activar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<UserX size={14} />}
                  disabled={user.status === 'INACTIVE'}
                  onClick={() => setUserStatus(user, 'INACTIVE')}
                >
                  Pausar
                </Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}
