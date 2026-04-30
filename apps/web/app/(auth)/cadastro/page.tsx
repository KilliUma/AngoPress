'use client'

import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { useRegister } from '@/hooks/useAuth'

interface RegisterFormData {
  name: string
  email: string
  company: string
  password: string
  confirmPassword: string
}

const inputCls =
  'mt-1 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 disabled:bg-neutral-50 disabled:text-neutral-400 transition-colors'

const labelCls = 'block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1'

export default function RegisterPage() {
  const { mutate: register, isPending } = useRegister()
  const {
    register: field,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>()

  const onSubmit = ({ name, email, password, company }: RegisterFormData) =>
    register({ name, email, password, company })

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">Criar conta</h2>
        <p className="mt-1.5 text-sm text-neutral-500">
          Já tem conta?{' '}
          <Link
            href="/login"
            className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            Iniciar sessão
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className={labelCls}>
            Nome completo
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Ex: Maria Santos"
            {...field('name', {
              required: 'Nome obrigatório',
              minLength: { value: 2, message: 'Mínimo 2 caracteres' },
            })}
            className={inputCls}
            disabled={isPending}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="company" className={labelCls}>
            Empresa / Organização
          </label>
          <input
            id="company"
            type="text"
            autoComplete="organization"
            placeholder="Ex: Assessoria Angola Lda."
            {...field('company', { required: 'Empresa obrigatória' })}
            className={inputCls}
            disabled={isPending}
          />
          {errors.company && <p className="mt-1 text-xs text-red-600">{errors.company.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className={labelCls}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nome@empresa.ao"
            {...field('email', {
              required: 'Email obrigatório',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
            })}
            className={inputCls}
            disabled={isPending}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className={labelCls}>
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            {...field('password', {
              required: 'Password obrigatória',
              minLength: { value: 8, message: 'Mínimo 8 caracteres' },
            })}
            className={inputCls}
            disabled={isPending}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className={labelCls}>
            Confirmar password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repita a password"
            {...field('confirmPassword', {
              required: 'Confirme a password',
              validate: (val) => val === watch('password') || 'As passwords não coincidem',
            })}
            className={inputCls}
            disabled={isPending}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-brand-200 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 transition-colors mt-2"
        >
          {isPending ? 'A criar conta…' : 'Criar conta gratuitamente'}
        </button>
      </form>

      <p className="mt-6 text-xs text-neutral-400 text-center">
        Ao criar conta, aceita os nossos{' '}
        <a href="/termos" className="text-brand-600 hover:underline">
          Termos de Uso
        </a>{' '}
        e{' '}
        <a href="/privacidade" className="text-brand-600 hover:underline">
          Política de Privacidade
        </a>
        .
      </p>
    </div>
  )
}
