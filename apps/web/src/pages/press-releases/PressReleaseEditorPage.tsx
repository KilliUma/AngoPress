import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, Send, Save, Paperclip, Trash2, Loader2 } from 'lucide-react'
import { RichEditor } from '../../components/editor/RichEditor'
import {
  usePressRelease,
  useCreatePressRelease,
  useUpdatePressRelease,
  usePublishPressRelease,
  useUploadAttachment,
  useRemoveAttachment,
} from '../../hooks/usePressReleases'
import { pressReleasesService } from '../../services/press-releases.service'
import type { PressReleaseStatus } from '../../services/press-releases.service'

export function PressReleaseEditorPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: existing, isLoading } = usePressRelease(id ?? '')
  const create = useCreatePressRelease()
  const update = useUpdatePressRelease()
  const publish = usePublishPressRelease()
  const uploadAttachment = useUploadAttachment()
  const removeAttachment = useRemoveAttachment()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [summary, setSummary] = useState('')
  const [status, setStatus] = useState<PressReleaseStatus>('DRAFT')
  const [scheduledAt, setScheduledAt] = useState('')
  const [savedId, setSavedId] = useState<string | undefined>(id)

  // Preencher formulário ao carregar press release existente
  useEffect(() => {
    if (existing) {
      setTitle(existing.title)
      setContent(existing.content)
      setSummary(existing.summary ?? '')
      setStatus(existing.status)
      setScheduledAt(existing.scheduledAt ? existing.scheduledAt.slice(0, 16) : '')
      setSavedId(existing.id)
    }
  }, [existing])

  async function handleSave() {
    const payload = {
      title,
      content,
      summary: summary || undefined,
      status,
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
    }
    if (isEdit && savedId) {
      await update.mutateAsync({ id: savedId, payload })
    } else {
      const created = await create.mutateAsync(payload)
      setSavedId(created.id)
      navigate(`/press-releases/${created.id}/editar`, { replace: true })
    }
  }

  async function handlePublish() {
    if (!savedId) {
      await handleSave()
    }
    if (savedId) publish.mutate(savedId)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !savedId) return
    uploadAttachment.mutate({ id: savedId, file })
    e.target.value = ''
  }

  if (isEdit && isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400">
        <Loader2 className="animate-spin mr-2" size={20} /> A carregar...
      </div>
    )
  }

  const isSaving = create.isPending || update.isPending

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/press-releases')}
          className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <div className="flex items-center gap-2">
          {savedId && (
            <button
              type="button"
              onClick={() => window.open(pressReleasesService.previewUrl(savedId), '_blank')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              <Eye size={15} /> Pré-visualizar
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !title}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-40"
          >
            {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Guardar
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={publish.isPending || !title}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-40"
          >
            <Send size={15} /> Publicar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6">
        {/* Editor principal */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Título do press release..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-semibold text-neutral-900 bg-transparent border-0 border-b border-neutral-200 pb-3 focus:outline-none focus:border-brand-400 placeholder:text-neutral-300"
          />
          <RichEditor value={content} onChange={setContent} />
        </div>

        {/* Painel lateral */}
        <div className="space-y-5">
          {/* Resumo */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Resumo</label>
            <textarea
              rows={4}
              placeholder="Breve descrição do press release..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              maxLength={500}
              className="w-full text-sm border border-neutral-300 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-xs text-neutral-400 mt-0.5 text-right">{summary.length}/500</p>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PressReleaseStatus)}
              className="w-full text-sm border border-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="DRAFT">Rascunho</option>
              <option value="SCHEDULED">Agendado</option>
              <option value="PUBLISHED">Publicado</option>
              <option value="ARCHIVED">Arquivado</option>
            </select>
          </div>

          {/* Agendamento */}
          {status === 'SCHEDULED' && (
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1.5">
                Data e hora de publicação
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full text-sm border border-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}

          {/* Anexos */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-neutral-500">Anexos</label>
              <button
                type="button"
                onClick={() => {
                  if (!savedId) {
                    alert('Guarde o press release primeiro para adicionar anexos.')
                    return
                  }
                  fileInputRef.current?.click()
                }}
                className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
              >
                <Paperclip size={12} /> Adicionar
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.docx"
                onChange={handleFileChange}
              />
            </div>
            {uploadAttachment.isPending && (
              <div className="text-xs text-neutral-400 flex items-center gap-1">
                <Loader2 size={12} className="animate-spin" /> A enviar...
              </div>
            )}
            {existing?.attachments?.length ? (
              <ul className="space-y-1.5">
                {existing.attachments.map((att) => (
                  <li
                    key={att.id}
                    className="flex items-center justify-between text-xs bg-neutral-50 rounded-lg px-2.5 py-1.5 border border-neutral-200"
                  >
                    <a
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:underline truncate max-w-[180px]"
                    >
                      {att.fileName}
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        savedId && removeAttachment.mutate({ id: savedId, attachmentId: att.id })
                      }
                      className="text-neutral-400 hover:text-red-500 ml-2 flex-shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-neutral-400">Sem anexos.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
