'use client'

import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { useLogin } from '@/hooks/useAuth'

interface LoginFormData {
  email: string
  password: string
}

type ApiError = { response?: { data?: { message?: string } } }

export default function LoginPage() {
  const { mutate: login, isPending, isError, error } = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const serverMessage = (error as ApiError)?.response?.data?.message

  const onSubmit = (data: LoginFormData) => login(data)

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
          Bem-vindo de volta
        </h2>
        <p className="mt-1.5 text-sm text-neutral-500">
          Não tem conta?{' '}
          <Link
            href="/cadastro"
            className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            Criar conta grátis
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {isError && serverMessage && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">{serverMessage}</p>
          </div>
        )}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nome@empresa.ao"
            {...register('email', {
              required: 'Email obrigatório',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
            })}
            className="mt-1 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 disabled:bg-neutral-50 transition-colors"
            disabled={isPending}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="A sua password"
            {...register('password', { required: 'Password obrigatória' })}
            className="mt-1 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 disabled:bg-neutral-50 transition-colors"
            disabled={isPending}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end">
          <Link
            href="/esqueci-senha"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            Esqueceu a password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-brand-200 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
        >
          {isPending ? 'A entrar…' : 'Entrar na conta'}
        </button>
      </form>
    </div>
  )
}
