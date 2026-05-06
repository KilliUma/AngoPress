'use client'

import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ImageNode from './ImageNode'

interface ImageCommandOptions {
  src: string
  alt?: string | null
  title?: string | null
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      setImage: (options: ImageCommandOptions) => ReturnType
    }
  }
}

export const ImageExtension = Node.create({
  name: 'image',

  addOptions() {
    return {
      inline: false,
      allowBase64: true,
      HTMLAttributes: { class: 'rounded-lg' },
    }
  },

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute('src'),
        renderHTML: (attributes) => {
          return { src: attributes.src }
        },
      },
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute('alt'),
        renderHTML: (attributes) => {
          return { alt: attributes.alt }
        },
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('title'),
        renderHTML: (attributes) => {
          return attributes.title ? { title: attributes.title } : {}
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: 'img[src]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNode)
  },

  addCommands() {
    return {
      setImage:
        (options: ImageCommandOptions) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      Delete: () => this.editor.commands.deleteNode(this.name),
      Backspace: () => this.editor.commands.deleteNode(this.name),
    }
  },
})
