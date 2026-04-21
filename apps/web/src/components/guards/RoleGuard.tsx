import { Navigate } from 'react-router-dom'
import { useAuthStore, type UserRole } from '@/store/auth.store'

interface RoleGuardProps {
  children: React.ReactNode
  roles: UserRole[]
}

export function RoleGuard({ children, roles }: RoleGuardProps) {
  const { user } = useAuthStore()

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
