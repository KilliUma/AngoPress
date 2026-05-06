'use client'

import { NodeViewWrapper } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { Images, LayoutGrid, Rows3 } from 'lucide-react'
import { useMemo } from 'react'
import { clsx } from 'clsx'
import { ResizableImage } from './ResizableImage'
import type { GalleryImage, GalleryLayout, GalleryPreset } from './editorTypes'

interface GalleryNodeAttrs {
  images: string
  layout: GalleryLayout
  preset: GalleryPreset
}

const parseImages = (rawImages: string): GalleryImage[] => {
  try {
    const parsed = JSON.parse(rawImages) as GalleryImage[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const getGridClassName = (layout: GalleryLayout) => {
  if (layout === 'stack') return 'grid-cols-1'
  if (layout === 'grid-3') return 'grid-cols-1 md:grid-cols-3'
  return 'grid-cols-1 md:grid-cols-2'
}

const getPresetClassName = (preset: GalleryPreset) => {
  if (preset === 'hero') return 'bg-neutral-950/95 text-white border-neutral-900'
  if (preset === 'editorial') return 'bg-stone-50 border-stone-200'
  return 'bg-white border-neutral-200'
}

const getItemClassName = (preset: GalleryPreset, layout: GalleryLayout, index: number) => {
  if (preset === 'hero' && layout !== 'stack' && index === 0) {
    return layout === 'grid-3' ? 'md:col-span-2' : 'md:col-span-2'
  }

  if (preset === 'editorial' && layout === 'grid-3' && index % 5 === 0) {
    return 'md:col-span-2'
  }

  return ''
}

export default function GalleryNode({
  node,
  selected,
  updateAttributes,
  deleteNode,
}: NodeViewProps) {
  const attrs = node.attrs as GalleryNodeAttrs
  const images = useMemo(() => parseImages(attrs.images), [attrs.images])

  const updateImage = (imageId: string, partial: Partial<GalleryImage>) => {
    const nextImages = images.map((image) =>
      image.id === imageId ? { ...image, ...partial } : image,
    )
    updateAttributes({ images: JSON.stringify(nextImages) })
  }

  if (images.length === 0) {
    return (
      <NodeViewWrapper className="my-6">
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-center text-neutral-500">
          <Images className="mx-auto mb-3 h-6 w-6" />
          <p className="text-sm font-medium">Galeria vazia</p>
        </div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper className="my-6">
      <section
        className={clsx(
          'rounded-[28px] border p-4 md:p-6 transition-shadow',
          getPresetClassName(attrs.preset),
          selected ? 'shadow-[0_0_0_3px_rgba(152,11,44,0.18)]' : 'shadow-sm',
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {attrs.layout === 'stack' ? (
              <Rows3 className="h-4 w-4" />
            ) : (
              <LayoutGrid className="h-4 w-4" />
            )}
            <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-70">
              {attrs.preset === 'hero'
                ? 'Hero Gallery'
                : attrs.preset === 'editorial'
                  ? 'Editorial Gallery'
                  : 'Galeria'}
            </p>
          </div>
          <button
            type="button"
            onClick={deleteNode}
            className="rounded-full border border-current/15 px-3 py-1 text-xs font-medium opacity-80 transition-opacity hover:opacity-100"
          >
            Remover galeria
          </button>
        </div>

        <div className={clsx('grid gap-5', getGridClassName(attrs.layout))}>
          {images.map((image, index) => (
            <div
              key={image.id}
              className={clsx('min-w-0', getItemClassName(attrs.preset, attrs.layout, index))}
            >
              <ResizableImage
                src={image.src}
                initialAlign={image.align}
                initialWidth={image.width}
                onUpdate={(align, width) => updateImage(image.id, { align, width })}
                onRemove={() => {
                  const nextImages = images.filter((item) => item.id !== image.id)
                  if (nextImages.length === 0) {
                    deleteNode()
                    return
                  }

                  updateAttributes({ images: JSON.stringify(nextImages) })
                }}
              />
            </div>
          ))}
        </div>
      </section>
    </NodeViewWrapper>
  )
}
