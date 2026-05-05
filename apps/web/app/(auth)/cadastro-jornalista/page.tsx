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
      <div className="flex items-center justify-center min-h-screen p-4 bg-neutral-50">
        <div className="w-full max-w-md p-10 text-center bg-white border shadow-sm rounded-2xl border-neutral-200">
          <CheckCircle2 size={48} className="mx-auto mb-4 text-brand-600" />
          <h2 className="mb-2 text-xl font-bold text-neutral-900">Pedido enviado!</h2>
          <p className="mb-6 text-sm text-neutral-500">
            O seu pedido de registo foi recebido. A nossa equipa irá analisá-lo e entrar em contacto
            em breve.
          </p>
          <Link href="/login" className="text-sm font-medium text-brand-600 hover:underline">
            Ir para o início de sessão
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-12 bg-neutral-50">
      <div className="max-w-lg mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4 text-xl font-bold text-brand-800">
            <span className="flex items-center justify-center w-8 h-8 text-sm font-black text-white rounded-full bg-brand-600">
              A
            </span>
            AngoPress
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Registo de Jornalista</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Submeta o seu pedido para integrar a nossa base de dados de jornalistas angolanos. A
            aprovação é feita pelo administrador.
          </p>
        </div>

        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="p-6 space-y-5 bg-white border shadow-sm rounded-2xl border-neutral-200 sm:p-8"
        >
          <div>
            <label className="block mb-1 text-sm font-medium text-neutral-700">
              Nome completo <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              placeholder="Maria da Silva"
              className="w-full h-10 px-3 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-neutral-700">
              E-mail profissional <span className="text-red-500">*</span>
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="maria@jornalangola.ao"
              className="w-full h-10 px-3 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-neutral-700">
              Órgão de comunicação / Veículo <span className="text-red-500">*</span>
            </label>
            <input
              {...register('outlet')}
              placeholder="Jornal de Angola"
              className="w-full h-10 px-3 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {errors.outlet && <p className="mt-1 text-xs text-red-500">{errors.outlet.message}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-neutral-700">
              Tipo de mídia <span className="text-red-500">*</span>
            </label>
            <select
              {...register('mediaType')}
              className="w-full h-10 px-3 text-sm bg-white border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Seleccione…</option>
              {MEDIA_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {errors.mediaType && (
              <p className="mt-1 text-xs text-red-500">{errors.mediaType.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-neutral-700">Cargo</label>
              <input
                {...register('jobTitle')}
                placeholder="Repórter"
                className="w-full h-10 px-3 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-neutral-700">Cidade</label>
              <input
                {...register('city')}
                placeholder="Luanda"
                className="w-full h-10 px-3 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-neutral-700">
              Mensagem (opcional)
            </label>
            <textarea
              {...register('message')}
              rows={3}
              placeholder="Apresente-se brevemente, as suas áreas de cobertura, etc."
              className="w-full px-3 py-2 text-sm border rounded-lg resize-none border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center justify-center w-full gap-2 text-sm font-semibold text-white h-11 bg-brand-600 rounded-xl hover:bg-brand-700 disabled:opacity-50"
          >
            {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
            Submeter pedido de registo
          </button>

          <p className="text-xs text-center text-neutral-400">
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
