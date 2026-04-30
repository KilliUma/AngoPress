import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from '@/components/guards/AuthGuard'
import { RoleGuard } from '@/components/guards/RoleGuard'

// Layouts
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import { AdminLayout } from '@/components/layouts/AdminLayout'

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
// Dashboard Pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { JournalistsPage } from '@/pages/journalists/JournalistsPage'
import { MailingListsPage } from '@/pages/mailing-lists/MailingListsPage'
import { PressReleasesPage } from '@/pages/press-releases/PressReleasesPage'
import { PressReleaseEditorPage } from '@/pages/press-releases/PressReleaseEditorPage'
import { CampaignsPage } from '@/pages/campaigns/CampaignsPage'
import { CampaignDetailPage } from '@/pages/campaigns/CampaignDetailPage'
import { NewCampaignPage } from '@/pages/campaigns/NewCampaignPage'
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage'
import { SubscriptionPage } from '@/pages/subscription/SubscriptionPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'

// Admin Pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'
import { AdminSubscriptionsPage } from '@/pages/admin/AdminSubscriptionsPage'
import { AdminJournalistsPage } from '@/pages/admin/AdminJournalistsPage'
import { AdminPlansPage } from '@/pages/admin/AdminPlansPage'

// Error Pages
import { NotFoundPage } from '@/pages/errors/NotFoundPage'

export const router = createBrowserRouter([
  // Redirecção raiz
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },

  // Rotas públicas de autenticação
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/cadastro', element: <RegisterPage /> },
      { path: '/esqueci-senha', element: <ForgotPasswordPage /> },
      { path: '/redefinir-senha', element: <ResetPasswordPage /> },
    ],
  },

  // Registo público de jornalistas — redirecciona para o login; o modal está na landing page
  { path: '/cadastro-jornalista', element: <Navigate to="/login" replace /> },

  // Rotas protegidas do cliente
  {
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/jornalistas', element: <JournalistsPage /> },
      { path: '/listas', element: <MailingListsPage /> },
      { path: '/press-releases', element: <PressReleasesPage /> },
      { path: '/press-releases/novo', element: <PressReleaseEditorPage /> },
      { path: '/press-releases/:id/editar', element: <PressReleaseEditorPage /> },
      { path: '/campanhas', element: <CampaignsPage /> },
      { path: '/campanhas/nova', element: <NewCampaignPage /> },
      { path: '/campanhas/:id', element: <CampaignDetailPage /> },
      { path: '/analytics', element: <AnalyticsPage /> },
      { path: '/assinatura', element: <SubscriptionPage /> },
      { path: '/perfil', element: <ProfilePage /> },
    ],
  },

  // Rotas protegidas do administrador
  {
    element: (
      <AuthGuard>
        <RoleGuard roles={['ADMIN']}>
          <AdminLayout />
        </RoleGuard>
      </AuthGuard>
    ),
    children: [
      { path: '/admin', element: <AdminDashboardPage /> },
      { path: '/admin/utilizadores', element: <AdminUsersPage /> },
      { path: '/admin/assinaturas', element: <AdminSubscriptionsPage /> },
      { path: '/admin/jornalistas', element: <AdminJournalistsPage /> },
      { path: '/admin/planos', element: <AdminPlansPage /> },
    ],
  },

  // 404
  { path: '*', element: <NotFoundPage /> },
])
