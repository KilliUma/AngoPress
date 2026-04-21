import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, CreditCard, Newspaper, Settings } from 'lucide-react'
import { clsx } from 'clsx'

const adminNavItems = [
  { to: '/admin', label: 'Dashboard Admin', icon: LayoutDashboard },
  { to: '/admin/utilizadores', label: 'Utilizadores', icon: Users },
  { to: '/admin/assinaturas', label: 'Assinaturas', icon: CreditCard },
  { to: '/admin/jornalistas', label: 'Jornalistas', icon: Newspaper },
  { to: '/admin/planos', label: 'Planos', icon: Settings },
]

export function AdminSidebar() {
  return (
    <aside className="w-64 bg-neutral-900 text-white flex flex-col shrink-0">
      <div className="p-6 border-b border-neutral-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-sm font-black">
            A
          </span>
          <span className="text-sm">
            AngoPress <br />
            <span className="text-neutral-400 text-xs font-normal">Administração</span>
          </span>
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {adminNavItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-700 text-white'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-white',
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
