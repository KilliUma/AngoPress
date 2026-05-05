'use client'

import { useState, useRef } from 'react'
import {
  Upload,
  GripVertical,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
} from 'lucide-react'
import { clsx } from 'clsx'
import type { GalleryImage, GalleryLayout, GalleryPreset } from './editorTypes'

interface GalleryDialogProps {
  isOpen: boolean
  onClose: () => void
  images: GalleryImage[]
  onImagesChange: (images: GalleryImage[]) => void
  onInsert: (src: string, align: 'left' | 'center' | 'right', width: number) => void
  onInsertGallery: (images: GalleryImage[], layout: GalleryLayout, preset: GalleryPreset) => void
}

export function GalleryDialog({
  isOpen,
  onClose,
  images,
  onImagesChange,
  onInsert,
  onInsertGallery,
}: GalleryDialogProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null)
  const [layout, setLayout] = useState<GalleryLayout>('grid-2')
  const [preset, setPreset] = useState<GalleryPreset>('uniform')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files) return

    const newImages: GalleryImage[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue

      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        newImages.push({
          id: Math.random().toString(36).substr(2, 9),
          src: result,
          align: 'center',
          width: 100,
        })
        if (
          newImages.length === Array.from(files).filter((f) => f.type.startsWith('image/')).length
        ) {
          onImagesChange([...images, ...newImages])
        }
      }
      reader.readAsDataURL(file)
    }

    e.currentTarget.value = ''
  }

  const handleDragStart = (id: string) => {
    setDraggingId(id)
  }

  const handleDragOver = (id: string) => {
    if (draggingId && draggingId !== id) {
      setDragOverId(id)
    }
  }

  const handleDrop = (id: string) => {
    if (draggingId && draggingId !== id) {
      const draggedIndex = images.findIndex((img) => img.id === draggingId)
      const targetIndex = images.findIndex((img) => img.id === id)

      const newImages = [...images]
      ;[newImages[draggedIndex], newImages[targetIndex]] = [
        newImages[targetIndex],
        newImages[draggedIndex],
      ]
      onImagesChange(newImages)
    }

    setDraggingId(null)
    setDragOverId(null)
  }

  const handleDelete = (id: string) => {
    onImagesChange(images.filter((img) => img.id !== id))
    setEditingImage(null)
  }

  const handleAlignChange = (id: string, align: 'left' | 'center' | 'right') => {
    const updated = images.map((img) => (img.id === id ? { ...img, align } : img))
    onImagesChange(updated)
    if (editingImage?.id === id) {
      setEditingImage({ ...editingImage, align })
    }
  }

  const handleWidthChange = (id: string, width: number) => {
    width = Math.max(30, Math.min(100, width))
    const updated = images.map((img) => (img.id === id ? { ...img, width } : img))
    onImagesChange(updated)
    if (editingImage?.id === id) {
      setEditingImage({ ...editingImage, width })
    }
  }

  const handleInsert = (image: GalleryImage) => {
    onInsert(image.src, image.align, image.width)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">Galeria de Imagens</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Upload Section */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">Adicionar Imagens</h3>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 px-6 py-8 transition-colors cursor-pointer hover:border-brand-600 hover:bg-brand-50"
            >
              <Upload size={32} className="mb-2 text-neutral-400" />
              <p className="text-center font-medium text-neutral-900">
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
          </div>

          <div className="mb-8 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-neutral-900">Disposicao da galeria</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  value: 'stack',
                  title: 'Uma por linha',
                  description: 'Cada imagem em uma linha separada.',
                },
                {
                  value: 'grid-2',
                  title: '2 colunas',
                  description: 'Duas imagens por linha com espaco.',
                },
                {
                  value: 'grid-3',
                  title: '3 colunas',
                  description: 'Tres imagens por linha para galerias densas.',
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setLayout(option.value as GalleryLayout)}
                  className={clsx(
                    'rounded-xl border px-4 py-3 text-left transition-colors',
                    layout === option.value
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100',
                  )}
                >
                  <p className="text-sm font-semibold">{option.title}</p>
                  <p className="mt-1 text-xs text-neutral-500">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8 rounded-xl border border-neutral-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-neutral-900">Preset visual</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { value: 'uniform', title: 'Uniforme', description: 'Grade limpa e equilibrada.' },
                {
                  value: 'hero',
                  title: 'Hero',
                  description: 'Primeira imagem ganha mais destaque.',
                },
                {
                  value: 'editorial',
                  title: 'Editorial',
                  description: 'Ritmo mais assimetrico para destaque visual.',
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPreset(option.value as GalleryPreset)}
                  className={clsx(
                    'rounded-xl border px-4 py-3 text-left transition-colors',
                    preset === option.value
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50',
                  )}
                >
                  <p className="text-sm font-semibold">{option.title}</p>
                  <p className="mt-1 text-xs text-neutral-500">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Images Grid */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">
              Imagens ({images.length})
            </h3>

            {images.length === 0 ? (
              <p className="text-center py-8 text-neutral-500">
                Nenhuma imagem carregada. Comece por carregar uma imagem.
              </p>
            ) : (
              <div className="space-y-3">
                {images.map((image, idx) => (
                  <div
                    key={image.id}
                    draggable
                    onDragStart={() => handleDragStart(image.id)}
                    onDragOver={() => handleDragOver(image.id)}
                    onDrop={() => handleDrop(image.id)}
                    onDragLeave={() => setDragOverId(null)}
                    className={clsx(
                      'flex items-center gap-4 rounded-lg border p-4 transition-colors',
                      draggingId === image.id ? 'bg-brand-50 border-brand-300' : '',
                      dragOverId === image.id
                        ? 'bg-brand-50 border-brand-400 border-2'
                        : 'border-neutral-200',
                    )}
                  >
                    {/* Drag Handle */}
                    <div className="text-neutral-400 flex-shrink-0">
                      <GripVertical size={20} />
                    </div>

                    {/* Image Preview */}
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200">
                      <img
                        src={image.src}
                        alt={`Image ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Image Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900">Imagem {idx + 1}</p>
                      <p className="text-xs text-neutral-500">
                        Largura: {image.width}% | Alinhamento:{' '}
                        {image.align === 'left'
                          ? 'Esquerda'
                          : image.align === 'center'
                            ? 'Centro'
                            : 'Direita'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setEditingImage(image)}
                        className="rounded-lg bg-neutral-100 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-200"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleInsert(image)}
                        className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-medium text-white hover:bg-brand-700"
                      >
                        Inserir
                      </button>
                      <button
                        onClick={() => handleDelete(image.id)}
                        className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image Editor Panel */}
          {editingImage && (
            <div className="border-t border-neutral-200 pt-6">
              <h3 className="text-sm font-semibold text-neutral-900 mb-4">Editar Imagem</h3>

              {/* Preview */}
              <div className="mb-6 rounded-lg border border-neutral-200 overflow-hidden bg-neutral-50 p-4">
                <div className="flex items-center justify-center">
                  <img
                    src={editingImage.src}
                    alt="Edit preview"
                    style={{
                      maxWidth: `${editingImage.width}%`,
                      margin:
                        editingImage.align === 'left'
                          ? '0 auto 0 0'
                          : editingImage.align === 'center'
                            ? '0 auto'
                            : '0 0 0 auto',
                    }}
                    className="max-h-64 object-cover rounded"
                  />
                </div>
              </div>

              {/* Width Control */}
              <div className="mb-4">
                <label className="flex items-center gap-2 mb-2">
                  <Maximize2 size={16} className="text-neutral-600" />
                  <span className="text-sm font-medium text-neutral-700">
                    Largura: {editingImage.width}%
                  </span>
                </label>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={editingImage.width}
                  onChange={(e) => handleWidthChange(editingImage.id, parseInt(e.target.value))}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Alignment Control */}
              <div className="mb-4">
                <p className="text-sm font-medium text-neutral-700 mb-2">Alinhamento</p>
                <div className="flex gap-2">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => handleAlignChange(editingImage.id, align)}
                      className={clsx(
                        'flex items-center justify-center gap-2 rounded-lg px-3 py-2 transition-colors',
                        editingImage.align === align
                          ? 'bg-brand-600 text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
                      )}
                    >
                      {align === 'left' && <AlignLeft size={16} />}
                      {align === 'center' && <AlignCenter size={16} />}
                      {align === 'right' && <AlignRight size={16} />}
                      <span className="text-xs font-medium capitalize">
                        {align === 'left' ? 'Esq' : align === 'center' ? 'Centro' : 'Dir'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Close Editor */}
              <button
                onClick={() => setEditingImage(null)}
                className="w-full rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Concluído
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={() => {
              onInsertGallery(images, layout, preset)
              onClose()
            }}
            disabled={images.length === 0}
            className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Inserir galeria
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-neutral-300 px-4 py-2 font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
