'use client'

export interface GalleryImage {
  id: string
  src: string
  align: 'left' | 'center' | 'right'
  width: number
}

export type GalleryLayout = 'stack' | 'grid-2' | 'grid-3'

export type GalleryPreset = 'uniform' | 'hero' | 'editorial'
