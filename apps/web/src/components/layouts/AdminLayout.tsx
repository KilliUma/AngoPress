import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components/navigation/AdminSidebar'
import { Header } from '@/components/navigation/Header'

export function AdminLayout() {
  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header isAdmin />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
