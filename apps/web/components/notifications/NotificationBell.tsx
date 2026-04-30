'use client'

import { useState, useRef } from 'react'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import { useOnClickOutside } from '@/hooks/useOnClickOutside'
import { useQuery } from '@tanstack/react-query'
import { adminService } from '@/services/admin.service'
import { useAuthStore } from '@/store/auth.store'
import { clsx } from 'clsx'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore()
  useOnClickOutside(ref, () => setOpen(false))

  const { data: notifications = [] } = useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: () => adminService.getNotifications(),
    enabled: user?.role === 'ADMIN',
    refetchInterval: 60_000,
  })

  const count = notifications.length

  if (user?.role !== 'ADMIN') return null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
        aria-label="Notificações"
      >
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center bg-brand-600 text-white text-[10px] rounded-full font-bold">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-neutral-200 shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-neutral-800">Notificações</span>
            {count > 0 && (
              <span className="text-xs bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded font-medium">
                {count}
              </span>
            )}
          </div>
          <ul className="max-h-72 overflow-y-auto">
            {count === 0 ? (
              <li className="px-4 py-6 text-sm text-neutral-400 text-center">Sem notificações</li>
            ) : (
              notifications.map(
                (n: {
                  id: string
                  title: string
                  message: string
                  link?: string
                  createdAt: string
                }) => (
                  <li key={n.id} className="border-b border-neutral-50 last:border-0">
                    <Link
                      href={n.link || '/admin'}
                      className="block px-4 py-3 hover:bg-neutral-50 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <p className="text-sm font-medium text-neutral-800 mb-0.5">{n.title}</p>
                      <p className="text-xs text-neutral-500 line-clamp-2">{n.message}</p>
                    </Link>
                  </li>
                ),
              )
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
