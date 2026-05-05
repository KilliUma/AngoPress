'use client'

import { Node, mergeAttributes, type DOMOutputSpec } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import GalleryNode from './GalleryNode'
import type { GalleryImage, GalleryLayout, GalleryPreset } from './editorTypes'

const parseImages = (rawImages: string): GalleryImage[] => {
  try {
    const parsed = JSON.parse(rawImages) as GalleryImage[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const getWrapperStyle = (layout: GalleryLayout, preset: GalleryPreset) => {
  const columns =
    layout === 'stack'
      ? '1fr'
      : layout === 'grid-3'
        ? 'repeat(3, minmax(0, 1fr))'
        : 'repeat(2, minmax(0, 1fr))'
  const background = preset === 'hero' ? '#111111' : preset === 'editorial' ? '#fafaf9' : '#ffffff'
  const border = preset === 'hero' ? '#171717' : preset === 'editorial' ? '#d6d3d1' : '#e5e5e5'

  return [
    'display:grid',
    `grid-template-columns:${columns}`,
    'gap:20px',
    'padding:24px',
    `background:${background}`,
    `border:1px solid ${border}`,
    'border-radius:28px',
    'margin:24px 0',
  ].join(';')
}

const getItemStyle = (layout: GalleryLayout, preset: GalleryPreset, index: number) => {
  const styles = ['min-width:0']

  if (preset === 'hero' && layout !== 'stack' && index === 0) {
    styles.push('grid-column:span 2')
  }

  if (preset === 'editorial' && layout === 'grid-3' && index % 5 === 0) {
    styles.push('grid-column:span 2')
  }

  return styles.join(';')
}

const getImageStyle = (image: GalleryImage) => {
  const alignStyle =
    image.align === 'left'
      ? 'display:block;margin-right:auto'
      : image.align === 'center'
        ? 'display:block;margin-left:auto;margin-right:auto'
        : 'display:block;margin-left:auto'

  const widthStyle = image.width < 100 ? `width:${image.width}%` : 'width:100%'

  return [alignStyle, widthStyle, 'max-width:100%', 'height:auto', 'border-radius:18px'].join(';')
}

export const GalleryExtension = Node.create({
  name: 'imageGallery',

  group: 'block',

  atom: true,

  draggable: true,

  addAttributes() {
    return {
      images: {
        default: '[]',
        parseHTML: (element) => element.getAttribute('data-images') ?? '[]',
        renderHTML: (attributes) => ({ 'data-images': attributes.images ?? '[]' }),
      },
      layout: {
        default: 'grid-2',
        parseHTML: (element) => element.getAttribute('data-layout') ?? 'grid-2',
        renderHTML: (attributes) => ({ 'data-layout': attributes.layout ?? 'grid-2' }),
      },
      preset: {
        default: 'uniform',
        parseHTML: (element) => element.getAttribute('data-preset') ?? 'uniform',
        renderHTML: (attributes) => ({ 'data-preset': attributes.preset ?? 'uniform' }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-type="image-gallery"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    const layout = (HTMLAttributes['data-layout'] ?? 'grid-2') as GalleryLayout
    const preset = (HTMLAttributes['data-preset'] ?? 'uniform') as GalleryPreset
    const images = parseImages((HTMLAttributes['data-images'] as string | undefined) ?? '[]')

    const items: DOMOutputSpec[] = images.map((image, index) => [
      'div',
      { style: getItemStyle(layout, preset, index) },
      ['img', { src: image.src, alt: 'Imagem da galeria', style: getImageStyle(image) }],
    ])

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'image-gallery',
        style: getWrapperStyle(layout, preset),
      }),
      ...items,
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(GalleryNode)
  },
})
