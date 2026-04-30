import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/navigation/Sidebar'
import { Header } from '@/components/navigation/Header'
import { SubscriptionExpiryBanner } from '@/components/notifications/SubscriptionExpiryBanner'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <SubscriptionExpiryBanner />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
