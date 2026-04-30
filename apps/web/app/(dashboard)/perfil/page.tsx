'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { User, Building2, Phone, Lock, Save, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useProfile, useUpdateProfile } from '@/hooks/useAuth'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import type { BadgeColor } from '@/components/ui/Badge'

// ──────────────────────────────────────────────────────────────
// Tipos de formulários
// ──────────────────────────────────────────────────────────────
interface ProfileFormData {
  name: string
  company: string
  phone: string
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, { label: string; color: BadgeColor }> = {
  ACTIVE: { label: 'Activo', color: 'success' },
  INACTIVE: { label: 'Inactivo', color: 'default' },
  PENDING: { label: 'Pendente', color: 'warning' },
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  CLIENT: 'Cliente',
}

// ──────────────────────────────────────────────────────────────
// Página
// ──────────────────────────────────────────────────────────────
export default function PerfilPage() {
  const { user: storeUser } = useAuthStore()
  const { data: profile, isLoading } = useProfile()
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile()

  const user = profile ?? storeUser

  // ── Formulário: dados pessoais ────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: profileErrors, isDirty: profileDirty },
  } = useForm<ProfileFormData>()

  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? '',
        company: user.company ?? '',
        phone: user.phone ?? '',
      })
    }
  }, [user, reset])

  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfile({
      name: data.name,
      company: data.company || null,
      phone: data.phone || null,
    })
  }

  // ── Formulário: password ──────────────────────────────────
  const [pwError, setPwError] = useState<string | null>(null)
  const {
    register: pwField,
    handleSubmit: handlePwSubmit,
    watch: watchPw,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm<PasswordFormData>()

  const onPasswordSubmit = (data: PasswordFormData) => {
    setPwError(null)
    updateProfile(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: () => resetPw(),
        onError: (e: { response?: { data?: { message?: string } } }) => {
          setPwError(e.response?.data?.message ?? 'Erro ao alterar password.')
        },
      },
    )
  }

  const statusInfo = STATUS_LABELS[user?.status ?? ''] ?? {
    label: user?.status ?? '—',
    color: 'default' as BadgeColor,
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Perfil</h1>
        <p className="text-neutral-500 mt-1">Gerencie as suas informações pessoais e segurança.</p>
      </div>

      {/* ── Cabeçalho do utilizador ─────────────────────────────── */}
      <Card>
        <div className="flex items-center gap-4">
          {/* Avatar placeholder */}
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
            <User size={28} className="text-brand-600" />
          </div>
          <div>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-5 w-40 bg-neutral-100 animate-pulse rounded" />
                <div className="h-4 w-56 bg-neutral-100 animate-pulse rounded" />
              </div>
            ) : (
              <>
                <p className="text-lg font-semibold text-neutral-900">{user?.name}</p>
                <p className="text-sm text-neutral-500">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge color="brand" size="sm">
                    {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
                  </Badge>
                  <Badge color={statusInfo.color} size="sm" dot>
                    {statusInfo.label}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* ── Dados pessoais ────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Dados pessoais"
          description="Actualize o seu nome, empresa e contacto."
        />
        <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
          <Input
            label="Nome completo"
            leftIcon={<User size={15} />}
            placeholder="Ex: Maria Santos"
            error={profileErrors.name?.message}
            {...register('name', {
              required: 'Nome obrigatório',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' },
            })}
          />
          <Input
            label="Empresa / Organização"
            leftIcon={<Building2 size={15} />}
            placeholder="Ex: Assessoria Angola Lda."
            error={profileErrors.company?.message}
            {...register('company')}
          />
          <Input
            label="Telefone"
            leftIcon={<Phone size={15} />}
            placeholder="+244 9xx xxx xxx"
            error={profileErrors.phone?.message}
            {...register('phone')}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              loading={isSaving}
              disabled={!profileDirty}
              icon={<Save size={15} />}
            >
              Guardar alterações
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Segurança / Password ──────────────────────────────────── */}
      <Card>
        <CardHeader title="Segurança" description="Altere a sua password de acesso." />
        <form onSubmit={handlePwSubmit(onPasswordSubmit)} className="space-y-4">
          {pwError && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle size={15} className="shrink-0" />
              {pwError}
            </div>
          )}
          <Input
            label="Password actual"
            type="password"
            leftIcon={<Lock size={15} />}
            autoComplete="current-password"
            error={pwErrors.currentPassword?.message}
            {...pwField('currentPassword', { required: 'Password actual obrigatória' })}
          />
          <Input
            label="Nova password"
            type="password"
            leftIcon={<Lock size={15} />}
            autoComplete="new-password"
            hint="Mínimo 8 caracteres"
            error={pwErrors.newPassword?.message}
            {...pwField('newPassword', {
              required: 'Nova password obrigatória',
              minLength: { value: 8, message: 'Mínimo 8 caracteres' },
            })}
          />
          <Input
            label="Confirmar nova password"
            type="password"
            leftIcon={<Lock size={15} />}
            autoComplete="new-password"
            error={pwErrors.confirmPassword?.message}
            {...pwField('confirmPassword', {
              required: 'Confirmação obrigatória',
              validate: (v) => v === watchPw('newPassword') || 'As passwords não coincidem',
            })}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={isSaving} icon={<Save size={15} />}>
              Alterar password
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Informação da conta ───────────────────────────────────── */}
      <Card>
        <CardHeader title="Informação da conta" />
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-neutral-500">ID da conta</dt>
            <dd className="font-mono text-neutral-700 text-xs mt-0.5 break-all">
              {user?.id ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500">Membro desde</dt>
            <dd className="text-neutral-700 mt-0.5">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('pt-PT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '—'}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
