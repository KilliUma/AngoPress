'use client'

import { useState, useRef } from 'react'
import { Upload, Image as ImageIcon, Link as LinkIcon, X } from 'lucide-react'
import { clsx } from 'clsx'

interface ImageDialogProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (src: string) => void
}

export function ImageDialog({ isOpen, onClose, onInsert }: ImageDialogProps) {
  const [tab, setTab] = useState<'upload' | 'library' | 'url'>('upload')
  const [urlInput, setUrlInput] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewImages, setPreviewImages] = useState<string[]>([])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files) return

    setLoading(true)
    const newImages: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue

      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        newImages.push(result)
        if (
          newImages.length === Array.from(files).filter((f) => f.type.startsWith('image/')).length
        ) {
          setPreviewImages(newImages)
          setLoading(false)
        }
      }
      reader.readAsDataURL(file)
    }

    e.currentTarget.value = ''
  }

  const handleInsertUrl = () => {
    const normalized = /^https?:\/\//i.test(urlInput) ? urlInput : `https://${urlInput}`
    if (normalized.trim()) {
      onInsert(normalized)
      setUrlInput('')
      onClose()
    }
  }

  const handleInsertPreview = (src: string) => {
    onInsert(src)
    setPreviewImages([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <ImageIcon size={24} className="text-brand-600" />
            <h2 className="text-lg font-semibold text-neutral-900">Inserir Imagem</h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-neutral-200 bg-neutral-50 px-6">
          <div className="flex gap-8">
            {(['upload', 'library', 'url'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t)
                  setUrlInput('')
                  setPreviewImages([])
                }}
                className={clsx(
                  'border-b-2 px-0.5 py-4 font-medium transition-colors capitalize',
                  tab === t
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900',
                )}
              >
                {t === 'upload' && 'Carregar'}
                {t === 'library' && 'Biblioteca'}
                {t === 'url' && 'URL'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {tab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={clsx(
                  'flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 px-6 py-12 transition-colors cursor-pointer hover:border-brand-600 hover:bg-brand-50',
                )}
              >
                <Upload size={48} className="mb-3 text-neutral-400" />
                <p className="text-center font-medium text-neutral-900 mb-1">
                  Clique para carregar ou arraste ficheiros
                </p>
                <p className="text-sm text-neutral-500">PNG, JPG, GIF, WEBP até 20 MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />

              {loading && (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-brand-600" />
                  <p className="mt-2 text-sm text-neutral-500">A processar imagens...</p>
                </div>
              )}

              {previewImages.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-neutral-700">
                    {previewImages.length} imagem{previewImages.length !== 1 ? 'ns' : ''} pronta
                    {previewImages.length !== 1 ? 's' : ''}
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {previewImages.map((src, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={src}
                          alt={`Preview ${idx + 1}`}
                          className="h-32 w-full object-cover rounded-lg border border-neutral-200"
                        />
                        <button
                          onClick={() => handleInsertPreview(src)}
                          className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 text-white font-medium hover:bg-black/70"
                        >
                          Inserir
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'library' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 px-6 py-12">
                <ImageIcon size={48} className="mb-3 text-neutral-400" />
                <p className="text-center font-medium text-neutral-900 mb-1">Biblioteca de Media</p>
                <p className="text-sm text-neutral-500 mb-4">Funcionalidade em desenvolvimento</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Carregar Imagem
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  handleFileChange(e)
                  setTab('upload')
                }}
                className="hidden"
              />
            </div>
          )}

          {tab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  URL da Imagem
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleInsertUrl()
                  }}
                />
              </div>

              {urlInput && /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(urlInput) && (
                <div className="rounded-lg border border-neutral-200 overflow-hidden">
                  <img
                    src={urlInput}
                    alt="Preview"
                    className="h-64 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleInsertUrl}
                  disabled={!urlInput.trim()}
                  className="flex-1 rounded-lg bg-brand-600 px-4 py-3 font-medium text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Inserir Imagem
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-neutral-300 px-4 py-3 font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {tab !== 'url' && (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-neutral-300 px-4 py-3 font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
