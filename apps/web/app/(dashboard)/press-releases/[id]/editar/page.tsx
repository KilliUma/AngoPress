'use client'

import dynamic from 'next/dynamic'
import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Loader2, Save, Send, Clock, Paperclip, X, FileText, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { usePressRelease } from '@/hooks/usePressReleases'
import { api } from '@/services/api'
import type { PressReleaseAttachment } from '@/services/press-releases.service'

const RichEditor = dynamic(() => import('@/components/editor/RichEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-neutral-200 rounded-lg h-64 flex items-center justify-center text-neutral-400 text-sm">
      A carregar editor...
    </div>
  ),
})

interface FormValues {
  title: string
  summary: string
  scheduledAt: string
}

export default function EditPressReleasePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { data: pr, isLoading } = usePressRelease(id)

  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [attachments, setAttachments] = useState<PressReleaseAttachment[]>([])
  const [uploading, setUploading] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<FormValues>()

  // Popular formulário quando os dados chegarem
  useEffect(() => {
    if (pr) {
      reset({
        title: pr.title,
        summary: pr.summary ?? '',
        scheduledAt: pr.scheduledAt ? new Date(pr.scheduledAt).toISOString().slice(0, 16) : '',
      })
      setContent(pr.content)
      setAttachments(pr.attachments ?? [])
    }
  }, [pr, reset])

  const handleSaveDraft = async (silent = false) => {
    const { title, summary } = getValues()
    if (!title.trim()) {
      if (!silent) toast.error('O título é obrigatório')
      return
    }
    setSaving(true)
    try {
      await api.put(`/press-releases/${id}`, { title, summary, content, status: 'DRAFT' })
      if (!silent) toast.success('Rascunho guardado')
    } catch {
      if (!silent) toast.error('Erro ao guardar')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = handleSubmit(async ({ title, summary }) => {
    if (!content.trim()) return toast.error('O conteúdo não pode estar vazio')
    setSaving(true)
    try {
      await api.put(`/press-releases/${id}`, { title, summary, content })
      await api.post(`/press-releases/${id}/publish`)
      toast.success('Press release publicado!')
      router.push('/press-releases')
    } catch {
      toast.error('Erro ao publicar')
    } finally {
      setSaving(false)
    }
  })

  const handleSchedule = handleSubmit(async ({ title, summary, scheduledAt }) => {
    if (!scheduledAt) return toast.error('Seleccione uma data para agendamento')
    if (!content.trim()) return toast.error('O conteúdo não pode estar vazio')
    setSaving(true)
    try {
      await api.put(`/press-releases/${id}`, {
        title,
        summary,
        content,
        status: 'SCHEDULED',
        scheduledAt,
      })
      toast.success('Press release agendado!')
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
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post<PressReleaseAttachment>(
        `/press-releases/${id}/attachments`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
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
    try {
      await api.delete(`/press-releases/${id}/attachments/${attachId}`)
      setAttachments((prev) => prev.filter((a) => a.id !== attachId))
    } catch {
      toast.error('Erro ao remover anexo')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-brand-600" />
      </div>
    )
  }

  if (!pr) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-neutral-500 gap-4">
        <FileText size={40} />
        <p>Press release não encontrado</p>
        <button
          onClick={() => router.push('/press-releases')}
          className="text-brand-600 hover:underline text-sm"
        >
          Voltar à lista
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/press-releases')}
            className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Editar Press Release</h1>
            <p className="text-neutral-500 text-sm truncate max-w-xs">{pr.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSaveDraft(false)}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Guardar
          </button>
          {pr.status !== 'PUBLISHED' && (
            <>
              <button
                onClick={() => setScheduleOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-brand-300 rounded-lg text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
              >
                <Clock size={14} /> Agendar
              </button>
              <button
                onClick={handlePublish}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-60 transition-colors"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Publicar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Formulário */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            {...register('title', { required: 'Título obrigatório' })}
            placeholder="Título do press release..."
            className="w-full text-lg border border-neutral-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-neutral-400"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        {/* Resumo */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Resumo / Lead</label>
          <textarea
            {...register('summary')}
            rows={2}
            placeholder="Breve resumo do comunicado..."
            className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-neutral-400 resize-none"
          />
        </div>

        {/* Editor */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Conteúdo <span className="text-red-500">*</span>
          </label>
          <RichEditor
            content={content}
            onChange={setContent}
            placeholder="Escreva o conteúdo completo do press release..."
          />
        </div>

        {/* Anexos */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-neutral-700">
              Anexos ({attachments.length})
            </label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-800 disabled:opacity-60"
            >
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Paperclip size={12} />}
              Adicionar ficheiro
            </button>
            <input ref={fileRef} type="file" className="hidden" onChange={handleFileUpload} />
          </div>
          {attachments.length === 0 ? (
            <p className="text-sm text-neutral-400 italic">Sem anexos</p>
          ) : (
            <ul className="space-y-2">
              {attachments.map((att) => (
                <li
                  key={att.id}
                  className="flex items-center justify-between px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-200"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={14} className="text-neutral-400 shrink-0" />
                    <a
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand-600 hover:underline truncate"
                    >
                      {att.fileName}
                    </a>
                    <span className="text-xs text-neutral-400 shrink-0">
                      ({Math.round(att.fileSize / 1024)} KB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
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
              <label className="block text-sm font-medium text-neutral-700 mb-1">Data e hora</label>
              <input
                {...register('scheduledAt')}
                type="datetime-local"
                min={new Date().toISOString().slice(0, 16)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                className="flex items-center gap-2 px-5 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-60"
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
