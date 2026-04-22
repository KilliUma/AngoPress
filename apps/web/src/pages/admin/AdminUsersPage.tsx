import { useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAdminUsers, useUpdateUserStatus } from '@/hooks/useAdmin'
import type { UserStatus, UserRole } from '@/services/admin.service'

const roleLabel: Record<UserRole, string> = { ADMIN: 'Admin', CLIENT: 'Cliente' }
const roleColor: Record<UserRole, string> = {
  ADMIN: 'text-violet-700 bg-violet-100',
  CLIENT: 'text-blue-700 bg-blue-100',
}
const statusLabel: Record<UserStatus, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  PENDING: 'Pendente',
}
const statusColor: Record<UserStatus, string> = {
  ACTIVE: 'text-emerald-700 bg-emerald-100',
  INACTIVE: 'text-red-700 bg-red-100',
  PENDING: 'text-amber-700 bg-amber-100',
}

const subStatusLabel: Record<string, string> = {
  ACTIVE: 'Activa',
  PENDING: 'Pendente',
  EXPIRED: 'Expirada',
  CANCELLED: 'Cancelada',
}
const subStatusColor: Record<string, string> = {
  ACTIVE: 'text-emerald-700 bg-emerald-100',
  PENDING: 'text-amber-700 bg-amber-100',
  EXPIRED: 'text-red-700 bg-red-100',
  CANCELLED: 'text-neutral-600 bg-neutral-100',
}

export function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('')
  const [page, setPage] = useState(1)
  const { mutate: updateStatus, isPending: updatingStatus } = useUpdateUserStatus()

  const { data, isLoading } = useAdminUsers({
    search: search || undefined,
    role: roleFilter || undefined,
    status: statusFilter || undefined,
    page,
    limit: 20,
  })

  const totalPages = data?.meta.totalPages ?? 1

  function handleStatusToggle(userId: string, current: UserStatus) {
    const next: UserStatus = current === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    updateStatus({ userId, status: next })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Utilizadores</h1>
        <p className="text-neutral-500 mt-1">{data?.meta.total ?? '—'} utilizadores registados</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Pesquisar nome ou email…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as UserRole | '')
            setPage(1)
          }}
          className="text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
        >
          <option value="">Todos os roles</option>
          <option value="CLIENT">Cliente</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as UserStatus | '')
            setPage(1)
          }}
          className="text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
        >
          <option value="">Todos os estados</option>
          <option value="ACTIVE">Activo</option>
          <option value="PENDING">Pendente</option>
          <option value="INACTIVE">Inactivo</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Utilizador
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Role
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Estado
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Assinatura
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                  Registado
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-neutral-100 animate-pulse rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !data?.data.length ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-neutral-400">
                    Nenhum utilizador encontrado.
                  </td>
                </tr>
              ) : (
                data.data.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-neutral-900">{user.name}</p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                        {user.company && <p className="text-xs text-neutral-400">{user.company}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          'text-xs font-semibold px-2 py-0.5 rounded-full',
                          roleColor[user.role],
                        )}
                      >
                        {roleLabel[user.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          'text-xs font-semibold px-2 py-0.5 rounded-full',
                          statusColor[user.status],
                        )}
                      >
                        {statusLabel[user.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.subscription ? (
                        <div>
                          <p className="font-medium text-neutral-800">
                            {user.subscription.plan?.name ?? '—'}
                          </p>
                          <span
                            className={clsx(
                              'text-xs font-semibold px-2 py-0.5 rounded-full',
                              subStatusColor[user.subscription.status],
                            )}
                          >
                            {subStatusLabel[user.subscription.status]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-400">Sem assinatura</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-xs">
                      {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {user.role !== 'ADMIN' && (
                        <button
                          type="button"
                          disabled={updatingStatus}
                          onClick={() => handleStatusToggle(user.id, user.status)}
                          className={clsx(
                            'text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50',
                            user.status === 'ACTIVE'
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50',
                          )}
                        >
                          {user.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs text-neutral-500">
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
