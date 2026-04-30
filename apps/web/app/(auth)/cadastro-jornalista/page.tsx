'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import Link from 'next/link'
import { CheckCircle2, Loader2 } from 'lucide-react'
import {
  journalistsService,
  type JournalistRegistrationPayload,
  type MediaType,
} from '@/services/journalists.service'

const MEDIA_TYPES: { value: MediaType; label: string }[] = [
  { value: 'TV', label: 'Televisão' },
  { value: 'RADIO', label: 'Rádio' },
  { value: 'PRINT', label: 'Imprensa Escrita' },
  { value: 'DIGITAL', label: 'Digital / Online' },
  { value: 'PODCAST', label: 'Podcast' },
]

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório').max(100),
  email: z.string().email('E-mail inválido'),
  outlet: z.string().min(2, 'Veículo/Órgão obrigatório').max(150),
  mediaType: z.enum(['TV', 'RADIO', 'PRINT', 'DIGITAL', 'PODCAST'] as const),
  jobTitle: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  message: z.string().max(500).optional(),
})

type FormData = z.infer<typeof schema>

export default function JournalistRegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: (data: JournalistRegistrationPayload) =>
      journalistsService.submitRegistration(data),
    onSuccess: () => reset(),
    onError: (e: Error) => toast.error(e.message || 'Erro ao enviar pedido'),
  })

  if (mutation.isSuccess) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-neutral-200 p-10 max-w-md w-full text-center shadow-sm">
          <CheckCircle2 size={48} className="text-brand-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Pedido enviado!</h2>
          <p className="text-neutral-500 text-sm mb-6">
            O seu pedido de registo foi recebido. A nossa equipa irá analisá-lo e entrar em contacto
            em breve.
          </p>
          <Link href="/login" className="text-sm text-brand-600 hover:underline font-medium">
            Ir para o início de sessão
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 font-bold text-brand-800 text-xl mb-4">
            <span className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-black">
              A
            </span>
            AngoPress
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Registo de Jornalista</h1>
          <p className="text-neutral-500 mt-2 text-sm">
            Submeta o seu pedido para integrar a nossa base de dados de jornalistas angolanos. A
            aprovação é feita pelo administrador.
          </p>
        </div>

        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-5 shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Nome completo <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              placeholder="Maria da Silva"
              className="w-full h-10 px-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              E-mail profissional <span className="text-red-500">*</span>
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="maria@jornalangola.ao"
              className="w-full h-10 px-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Órgão de comunicação / Veículo <span className="text-red-500">*</span>
            </label>
            <input
              {...register('outlet')}
              placeholder="Jornal de Angola"
              className="w-full h-10 px-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.outlet && <p className="text-xs text-red-500 mt-1">{errors.outlet.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Tipo de média <span className="text-red-500">*</span>
            </label>
            <select
              {...register('mediaType')}
              className="w-full h-10 px-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="">Seleccione…</option>
              {MEDIA_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {errors.mediaType && (
              <p className="text-xs text-red-500 mt-1">{errors.mediaType.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Cargo</label>
              <input
                {...register('jobTitle')}
                placeholder="Repórter"
                className="w-full h-10 px-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Cidade</label>
              <input
                {...register('city')}
                placeholder="Luanda"
                className="w-full h-10 px-3 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Mensagem (opcional)
            </label>
            <textarea
              {...register('message')}
              rows={3}
              placeholder="Apresente-se brevemente, as suas áreas de cobertura, etc."
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full h-11 bg-brand-600 text-white font-semibold rounded-xl text-sm hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
            Submeter pedido de registo
          </button>

          <p className="text-center text-xs text-neutral-400">
            Já tem conta?{' '}
            <Link href="/login" className="text-brand-600 hover:underline">
              Iniciar sessão
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
