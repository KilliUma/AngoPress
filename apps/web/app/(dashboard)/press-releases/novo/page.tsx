'use client'

import dynamic from 'next/dynamic'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import {
  ArrowLeft,
  Loader2,
  Save,
  Send,
  Clock,
  Paperclip,
  X,
  FileText,
  Trash2,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { useCreatePressRelease } from '@/hooks/usePressReleases'
import { api } from '@/services/api'

// Editor TipTap carregado apenas no cliente (evita SSR)
const RichEditor = dynamic(
  () => import('@/components/editor/RichEditor').then((m) => ({ default: m.default })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64 text-sm border rounded-lg border-neutral-200 text-neutral-400">
        A carregar editor...
      </div>
    ),
  },
)

interface FormValues {
  title: string
  scheduledAt: string
}

interface UploadedFile {
  id: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
}

export default function NewPressReleasePage() {
  const router = useRouter()
  const createMutation = useCreatePressRelease()
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [prId, setPrId] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>()

  // Guardar como rascunho e obter/actualizar o ID
  const saveAsDraft = async (silent = false) => {
    const { title } = getValues()
    if (!title.trim()) {
      if (!silent) toast.error('O título é obrigatório')
      return null
    }
    setSaving(true)
    try {
      if (prId) {
        // actualizar rascunho existente
        await api.put(`/press-releases/${prId}`, { title, content, status: 'DRAFT' })
        if (!silent) toast.success('Rascunho guardado')
        return prId
      } else {
        const pr = await createMutation.mutateAsync({ title, content, status: 'DRAFT' })
        setPrId(pr.id)
        if (!silent) toast.success('Rascunho guardado')
        return pr.id
      }
    } catch {
      if (!silent) toast.error('Erro ao guardar rascunho')
      return null
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = handleSubmit(async ({ title }) => {
    if (!content.trim()) {
      toast.error('O conteúdo não pode estar vazio')
      return
    }
    setSaving(true)
    try {
      if (prId) {
        await api.put(`/press-releases/${prId}`, { title, content })
        await api.post(`/press-releases/${prId}/publish`)
        toast.success('Press release publicado!')
      } else {
        const pr = await createMutation.mutateAsync({ title, content, status: 'DRAFT' })
        await api.post(`/press-releases/${pr.id}/publish`)
        toast.success('Press release publicado!')
      }
      router.push('/press-releases')
    } catch {
      toast.error('Erro ao publicar')
    } finally {
      setSaving(false)
    }
  })

  const handleSchedule = handleSubmit(async ({ title, scheduledAt }) => {
    if (!scheduledAt) {
      toast.error('Seleccione uma data para agendamento')
      return
    }
    if (!content.trim()) {
      toast.error('O conteúdo não pode estar vazio')
      return
    }
    setSaving(true)
    try {
      if (prId) {
        await api.put(`/press-releases/${prId}`, {
          title,
          content,
          status: 'SCHEDULED',
          scheduledAt,
        })
        toast.success('Press release agendado!')
      } else {
        await createMutation.mutateAsync({
          title,
          content,
          status: 'SCHEDULED',
          scheduledAt,
        })
        toast.success('Press release agendado!')
      }
      router.push('/press-releases')
    } catch {
      toast.error('Erro ao agendar')
    } finally {
      setSaving(false)
      setScheduleOpen(false)
    }
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Guardar antes de carregar ficheiro (precisamos do id)
    const id = prId ?? (await saveAsDraft(true))
    if (!id) {
      toast.error('Guarde o press release antes de adicionar anexos')
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post<UploadedFile>(`/press-releases/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setAttachments((prev) => [...prev, data])
      toast.success(`${file.name} carregado`)
    } catch {
      toast.error('Erro ao carregar ficheiro')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removeAttachment = async (attachId: string) => {
    if (!prId) return
    try {
      await api.delete(`/press-releases/${prId}/attachments/${attachId}`)
      setAttachments((prev) => prev.filter((a) => a.id !== attachId))
    } catch {
      toast.error('Erro ao remover anexo')
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ── Banner de topo ── */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 p-6 text-white shadow-xl shadow-brand-900/10 sm:p-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-56 h-56 rounded-full -top-16 -right-16 bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 w-64 h-32 rounded-full left-1/4 bg-brand-950/25 blur-2xl" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
              backgroundSize: '44px 44px',
            }}
          />
        </div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <button
              onClick={() => router.push('/press-releases')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-100/80 hover:text-white transition-colors mb-1"
            >
              <ArrowLeft size={13} /> Press Releases
            </button>
            <span className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-100 w-fit">
              <Sparkles size={13} />
              Comunicado de imprensa
            </span>
            <h1 className="text-2xl tracking-tight sm:text-3xl title-strong">Novo Press Release</h1>
            <p className="text-sm text-brand-100/80">
              Redija e publique um comunicado de imprensa.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => saveAsDraft(false)}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-60 transition-all"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Guardar rascunho
            </button>
            <button
              onClick={() => setScheduleOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-all"
            >
              <Clock size={14} /> Agendar
            </button>
            <button
              onClick={handlePublish}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-brand-700 shadow-md hover:bg-neutral-50 disabled:opacity-60 transition-all"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin text-brand-700" />
              ) : (
                <Send size={14} />
              )}
              Publicar
            </button>
          </div>
        </div>
      </section>

      {/* Formulário */}
      <div className="p-6 space-y-5 bg-white border rounded-2xl border-neutral-200">
        {/* Título */}
        <div>
          <label className="block mb-1 text-sm font-medium text-neutral-700">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            {...register('title', { required: 'Título obrigatório' })}
            placeholder="Título do press release..."
            className="w-full px-4 py-3 text-lg border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-neutral-400"
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
        </div>

        {/* Editor */}
        <div>
          <label className="block mb-2 text-sm font-medium text-neutral-700">
            Conteúdo <span className="text-red-500">*</span>
          </label>
          <RichEditor
            value={content}
            onChange={setContent}
            placeholder="Escreva o conteúdo completo do press release..."
          />
        </div>

        {/* Anexos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-neutral-700">Anexos</label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-800 disabled:opacity-60"
            >
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Paperclip size={12} />}
              Adicionar ficheiro
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.docx"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
          <p className="mb-2 text-xs text-neutral-500">
            Tipos permitidos: PDF, JPG, PNG, GIF, WEBP e DOCX. Tamanho maximo por ficheiro: 20 MB.
          </p>
          {attachments.length === 0 ? (
            <p className="text-sm italic text-neutral-400">Sem anexos</p>
          ) : (
            <ul className="space-y-2">
              {attachments.map((att) => (
                <li
                  key={att.id}
                  className="flex items-center justify-between px-3 py-2 border rounded-lg bg-neutral-50 border-neutral-200"
                >
                  <div className="flex items-center min-w-0 gap-2">
                    <FileText size={14} className="text-neutral-400 shrink-0" />
                    <a
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm truncate text-brand-600 hover:underline"
                    >
                      {att.fileName}
                    </a>
                    <span className="text-xs text-neutral-400 shrink-0">
                      ({Math.round(att.fileSize / 1024)} KB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="p-1 transition-colors text-neutral-400 hover:text-red-500"
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal agendamento */}
      {scheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm p-6 space-y-4 bg-white shadow-xl rounded-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-neutral-900">Agendar publicação</h2>
              <button
                onClick={() => setScheduleOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X size={18} />
              </button>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-neutral-700">Data e hora</label>
              <input
                {...register('scheduledAt')}
                type="datetime-local"
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 text-sm border rounded-lg border-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setScheduleOpen(false)}
                className="px-4 py-2 text-sm text-neutral-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleSchedule}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-60"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Confirmar agendamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
