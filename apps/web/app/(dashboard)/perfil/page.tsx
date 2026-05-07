'use client'

import { useEffect, useState } from 'react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import {
  User,
  Building2,
  Phone,
  Lock,
  Save,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
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

const SECURITY_TIPS = [
  'Use uma password com pelo menos 8 caracteres.',
  'Evite reutilizar a mesma password em outros serviços.',
  'Mantenha o seu telefone actualizado para contacto rápido.',
]

function getPasswordStrength(password: string) {
  let score = 0

  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  if (score <= 1) {
    return {
      label: 'Fraca',
      tone: 'text-red-700',
      bar: 'bg-red-500',
      width: 'w-1/4',
      surface: 'bg-red-50 border-red-100',
    }
  }

  if (score <= 3) {
    return {
      label: 'Média',
      tone: 'text-amber-700',
      bar: 'bg-amber-500',
      width: 'w-3/4',
      surface: 'bg-amber-50 border-amber-100',
    }
  }

  return {
    label: 'Forte',
    tone: 'text-emerald-700',
    bar: 'bg-emerald-500',
    width: 'w-full',
    surface: 'bg-emerald-50 border-emerald-100',
  }
}

function ProfileStat({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="p-4 border rounded-2xl border-white/15 bg-white/10 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-100/85">
        {label}
      </p>
      <p className="mt-2 text-xs font-bold text-white">{value}</p>
      {helper && <p className="mt-1 text-xs text-brand-100/75">{helper}</p>}
    </div>
  )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 border rounded-2xl border-neutral-200 bg-neutral-50">
      <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
        {icon}
      </span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium text-neutral-900">{value}</p>
      </div>
    </div>
  )
}

function PasswordField({
  label,
  placeholder,
  autoComplete,
  error,
  visible,
  onToggle,
  registration,
}: {
  label: string
  placeholder?: string
  autoComplete?: string
  error?: string
  visible: boolean
  onToggle: () => void
  registration: UseFormRegisterReturn
}) {
  return (
    <div>
      <label className="block mb-1 text-xs font-semibold tracking-wide uppercase text-neutral-600">
        {label}
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 flex items-center pointer-events-none left-3 text-neutral-400">
          <Lock size={15} />
        </span>
        <input
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="block w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-11 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
          {...registration}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 flex items-center transition-colors right-3 text-neutral-400 hover:text-neutral-700 focus:outline-none focus:text-brand-600"
          aria-label={visible ? 'Ocultar password' : 'Mostrar password'}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Página
// ──────────────────────────────────────────────────────────────
export default function PerfilPage() {
  const { user: storeUser } = useAuthStore()
  const { data: profile } = useProfile()
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
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  })

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

  const initials =
    user?.name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') ?? 'AP'

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—'

  const newPassword = watchPw('newPassword') ?? ''
  const passwordStrength = getPasswordStrength(newPassword)
  const profileCompletion = [user?.name, user?.email, user?.phone, user?.company].filter(
    Boolean,
  ).length
  const completionLabel = `${Math.round((profileCompletion / 4) * 100)}% completo`

  return (
    <div className="max-w-[1280px] space-y-6">
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 p-6 text-white shadow-xl shadow-brand-900/10 sm:p-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute right-0 w-64 h-64 rounded-full -top-20 bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 h-40 rounded-full left-1/3 w-72 bg-brand-950/25 blur-2xl" />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
              backgroundSize: '44px 44px',
            }}
          />
        </div>

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-100">
              <Sparkles size={14} />
              Centro de perfil
            </div>

            <div className="flex items-start gap-4 sm:gap-5">
              <div className="flex items-center justify-center w-20 h-20 text-2xl font-black text-white shrink-0 rounded-3xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                {initials}
              </div>
              <div className="space-y-2">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight font-display sm:text-4xl">
                    {user?.name ?? 'O seu perfil'}
                  </h1>
                  <p className="mt-1 text-sm text-brand-100/85 sm:text-base">
                    Organize os seus dados, reforce a segurança e mantenha a sua conta pronta para o
                    trabalho diário.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge color="brand" className="text-white bg-white/15">
                    {ROLE_LABELS[user?.role ?? ''] ?? user?.role ?? 'Utilizador'}
                  </Badge>
                  <Badge color={statusInfo.color} dot className="bg-white/90 text-neutral-800">
                    {statusInfo.label}
                  </Badge>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-brand-100">
                    <CalendarDays size={12} />
                    Desde {memberSince}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[430px]">
            <ProfileStat
              label="Perfil"
              value={completionLabel}
              helper="Campos principais preenchidos"
            />
            <ProfileStat
              label="Estado"
              value={statusInfo.label}
              helper="Conta pronta para utilização"
            />
            <ProfileStat
              label="Email"
              value={user?.email ?? '—'}
              helper="Canal principal de acesso"
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_360px]">
        <div className="space-y-6">
          <Card className="rounded-[24px] border-neutral-200/80 shadow-sm">
            <CardHeader
              title="Dados pessoais"
              description="Actualize a sua identidade profissional e mantenha a informação de contacto sempre pronta."
              action={
                profileDirty ? (
                  <Badge color="warning" size="sm">
                    Alterações por guardar
                  </Badge>
                ) : (
                  <Badge color="success" size="sm" dot>
                    Sincronizado
                  </Badge>
                )
              }
            />

            <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
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
                <div className="space-y-1">
                  <label className="block text-xs font-semibold tracking-wide uppercase text-neutral-600">
                    Email da conta
                  </label>
                  <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-700">
                    <span className="flex items-center justify-center w-8 h-8 bg-white rounded-lg shadow-sm text-brand-600">
                      <Mail size={15} />
                    </span>
                    <div>
                      <p className="font-medium text-neutral-900">{user?.email ?? '—'}</p>
                      <p className="text-xs text-neutral-500">Usado para iniciar sessão</p>
                    </div>
                  </div>
                </div>
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
              </div>

              <div className="p-4 border rounded-2xl border-brand-100 bg-brand-50/60">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-10 h-10 bg-white shadow-sm rounded-2xl text-brand-600">
                    <ShieldCheck size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      Conta profissional bem apresentada
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">
                      Um nome claro, empresa actualizada e telefone correcto facilitam suporte,
                      faturação e gestão da conta.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-5 border-t border-neutral-200 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-neutral-500">
                  {profileDirty
                    ? 'Existem alterações pendentes neste formulário.'
                    : 'Os seus dados estão actualizados neste momento.'}
                </p>
                <Button
                  type="submit"
                  loading={isSaving}
                  disabled={!profileDirty}
                  icon={<Save size={15} />}
                  className="w-full sm:w-auto"
                >
                  Guardar alterações
                </Button>
              </div>
            </form>
          </Card>

          <Card className="rounded-[24px] border-neutral-200/80 shadow-sm">
            <CardHeader
              title="Segurança"
              description="Reforce o acesso à conta com uma password mais forte e melhor visibilidade do que está a escrever."
            />

            <form onSubmit={handlePwSubmit(onPasswordSubmit)} className="space-y-5">
              {pwError && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  <AlertCircle size={15} className="shrink-0" />
                  {pwError}
                </div>
              )}

              <div className="grid gap-4 lg:grid-cols-2">
                <PasswordField
                  label="Password actual"
                  placeholder="Introduza a password actual"
                  autoComplete="current-password"
                  error={pwErrors.currentPassword?.message}
                  visible={showPasswords.current}
                  onToggle={() =>
                    setShowPasswords((current) => ({ ...current, current: !current.current }))
                  }
                  registration={pwField('currentPassword', {
                    required: 'Password actual obrigatória',
                  })}
                />
                <div className="p-4 border rounded-2xl border-neutral-200 bg-neutral-50">
                  <p className="text-sm font-semibold text-neutral-900">
                    Indicador da nova password
                  </p>
                  <div className={`mt-3 rounded-2xl border p-3 ${passwordStrength.surface}`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                        Força
                      </span>
                      <span className={`text-sm font-semibold ${passwordStrength.tone}`}>
                        {newPassword ? passwordStrength.label : 'Ainda não definida'}
                      </span>
                    </div>
                    <div className="h-2 mt-3 rounded-full bg-white/80">
                      <div
                        className={`h-2 rounded-full transition-all ${passwordStrength.bar} ${newPassword ? passwordStrength.width : 'w-0'}`}
                      />
                    </div>
                    <p className="mt-3 text-xs text-neutral-600">
                      Combine letras maiúsculas, minúsculas, números e símbolos para uma password
                      mais segura.
                    </p>
                  </div>
                </div>
                <PasswordField
                  label="Nova password"
                  placeholder="Defina uma nova password"
                  autoComplete="new-password"
                  error={pwErrors.newPassword?.message}
                  visible={showPasswords.next}
                  onToggle={() =>
                    setShowPasswords((current) => ({ ...current, next: !current.next }))
                  }
                  registration={pwField('newPassword', {
                    required: 'Nova password obrigatória',
                    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                  })}
                />
                <PasswordField
                  label="Confirmar nova password"
                  placeholder="Repita a nova password"
                  autoComplete="new-password"
                  error={pwErrors.confirmPassword?.message}
                  visible={showPasswords.confirm}
                  onToggle={() =>
                    setShowPasswords((current) => ({ ...current, confirm: !current.confirm }))
                  }
                  registration={pwField('confirmPassword', {
                    required: 'Confirmação obrigatória',
                    validate: (v) => v === watchPw('newPassword') || 'As passwords não coincidem',
                  })}
                />
              </div>

              <div className="flex flex-col gap-3 pt-5 border-t border-neutral-200 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-neutral-500">
                  Depois de alterar a password, use a nova credencial no próximo acesso.
                </p>
                <Button
                  type="submit"
                  loading={isSaving}
                  icon={<Save size={15} />}
                  className="w-full sm:w-auto"
                >
                  Alterar password
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="rounded-[24px] border-neutral-200/80 shadow-sm">
            <CardHeader
              title="Resumo da conta"
              description="Visão rápida do estado actual do seu perfil."
            />
            <div className="space-y-3">
              <InfoItem icon={<User size={16} />} label="Perfil" value={user?.name ?? '—'} />
              <InfoItem
                icon={<Building2 size={16} />}
                label="Empresa"
                value={user?.company || 'Não definida'}
              />
              <InfoItem
                icon={<Phone size={16} />}
                label="Telefone"
                value={user?.phone || 'Não definido'}
              />
              <InfoItem icon={<Mail size={16} />} label="Email" value={user?.email ?? '—'} />
            </div>
          </Card>

          <Card className="rounded-[24px] border-neutral-200/80 shadow-sm">
            <CardHeader
              title="Boas práticas"
              description="Pequenos ajustes que melhoram segurança e operação."
            />
            <div className="space-y-3">
              {SECURITY_TIPS.map((tip) => (
                <div
                  key={tip}
                  className="flex items-start gap-3 px-4 py-3 border rounded-2xl border-neutral-200 bg-neutral-50"
                >
                  <span className="mt-0.5 text-emerald-600">
                    <CheckCircle2 size={16} />
                  </span>
                  <p className="text-sm text-neutral-700">{tip}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[24px] border-neutral-200/80 bg-gradient-to-br from-neutral-900 via-neutral-900 to-brand-950 text-white shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center h-11 w-11 rounded-2xl bg-white/10 text-brand-200">
                <ShieldCheck size={20} />
              </span>
              <div>
                <h2 className="text-lg font-semibold tracking-tight font-display">
                  Identidade e acesso
                </h2>
                <p className="mt-1 text-sm text-white/70">
                  Reveja o seu perfil periodicamente para manter o dashboard, suporte e equipa
                  alinhados com a mesma informação.
                </p>
              </div>
            </div>
            <div className="p-4 mt-5 border rounded-2xl border-white/10 bg-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                ID da conta
              </p>
              <p className="mt-2 font-mono text-xs break-all text-white/85">{user?.id ?? '—'}</p>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">
                Membro desde
              </p>
              <p className="mt-2 text-sm text-white/85">{memberSince}</p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
