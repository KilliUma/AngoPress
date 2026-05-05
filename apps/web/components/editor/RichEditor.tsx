'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { ImageExtension } from './ImageExtension'
import { GalleryExtension } from './GalleryExtension'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import Placeholder from '@tiptap/extension-placeholder'
import Blockquote from '@tiptap/extension-blockquote'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import {
  Bold,
  Braces,
  Italic,
  List as ListIcon,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Images as ImagesIcon,
  Table as TableIcon,
  Undo,
  Redo,
  Quote,
  Minus,
  Heading2,
  Heading3,
  Strikethrough as StrikethroughIcon,
  Underline as UnderlineIcon,
  Highlighter,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ImageDialog } from './ImageDialog'
import { GalleryDialog } from './GalleryDialog'
import type { GalleryImage, GalleryLayout, GalleryPreset } from './editorTypes'

interface RichEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={clsx(
        'p-1.5 rounded text-sm transition-colors',
        active
          ? 'bg-brand-600 text-white'
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
        disabled && 'opacity-40 cursor-not-allowed',
      )}
    >
      {children}
    </button>
  )
}

export default function RichEditor({ value, onChange, placeholder, className }: RichEditorProps) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [galleryDialogOpen, setGalleryDialogOpen] = useState(false)
  const [urlDialog, setUrlDialog] = useState<'link' | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [varsOpen, setVarsOpen] = useState(false)
  const varsRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, blockquote: false }),
      Blockquote,
      Underline,
      Highlight.configure({ multicolor: true }),
      ImageExtension,
      GalleryExtension,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-brand-600 underline' } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder ?? 'Comece a escrever o press release...' }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-neutral max-w-none min-h-[300px] p-4 focus:outline-none text-neutral-900',
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files
        if (!files || files.length === 0) return false

        const imageFile = Array.from(files).find((file) => file.type.startsWith('image/'))
        if (!imageFile) return false

        event.preventDefault()

        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result
          if (typeof result !== 'string') return

          const imageNode = view.state.schema.nodes.image?.create({ src: result })
          if (!imageNode) return

          const dropPos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos
          const pos = dropPos ?? view.state.selection.from
          const tr = view.state.tr.insert(pos, imageNode)
          view.dispatch(tr)
        }
        reader.readAsDataURL(imageFile)
        return true
      },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (varsRef.current && !varsRef.current.contains(e.target as Node)) {
        setVarsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const insertVariable = useCallback(
    (variable: string) => {
      if (!editor) return
      editor.chain().focus().insertContent(variable).run()
      setVarsOpen(false)
    },
    [editor],
  )

  const openLinkDialog = useCallback(() => {
    if (!editor) return

    const isTextSelected = !editor.state.selection.empty
    const isCursorInLink = editor.isActive('link')
    if (!isTextSelected && !isCursorInLink) return

    const currentHref = (editor.getAttributes('link').href as string | undefined) ?? ''
    setUrlDialog('link')
    setUrlInput(currentHref)
  }, [editor])

  const insertImageFromFile = useCallback(
    (file: File) => {
      if (!editor || !file.type.startsWith('image/')) return

      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result
        if (typeof result !== 'string') return
        editor.chain().focus().setImage({ src: result }).run()
      }
      reader.readAsDataURL(file)
    },
    [editor],
  )

  const handleInsertImage = useCallback(
    (src: string, align: 'left' | 'center' | 'right' = 'center', width: number = 100) => {
      if (!editor) return
      const alignStyle =
        align === 'left'
          ? 'display: block; margin-right: auto;'
          : align === 'center'
            ? 'display: block; margin-left: auto; margin-right: auto;'
            : 'display: block; margin-left: auto;'
      const widthStyle = width < 100 ? `width: ${width}%;` : ''
      const style = `${alignStyle} ${widthStyle}`.trim()

      editor.chain().focus().setImage({ src, alt: 'Imagem inserida', title: style }).run()
    },
    [editor],
  )

  const handleInsertGallery = useCallback(
    (images: GalleryImage[], layout: GalleryLayout, preset: GalleryPreset) => {
      if (!editor || images.length === 0) return

      editor
        .chain()
        .focus()
        .insertContent({
          type: 'imageGallery',
          attrs: {
            images: JSON.stringify(images),
            layout,
            preset,
          },
        })
        .run()

      editor.chain().focus().createParagraphNear().run()
    },
    [editor, handleInsertImage],
  )

  const applyUrl = useCallback(() => {
    if (!editor || !urlDialog) return

    const raw = urlInput.trim()
    if (!raw) return

    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`

    if (urlDialog === 'link') {
      const isTextSelected = !editor.state.selection.empty
      if (isTextSelected) {
        editor.chain().focus().setLink({ href: normalized }).run()
      }
    }

    setUrlDialog(null)
    setUrlInput('')
  }, [editor, urlDialog, urlInput])

  const insertTable = useCallback(() => {
    if (!editor) return
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className={clsx('border border-neutral-300 rounded-xl overflow-visible', className)}>
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-neutral-200 bg-neutral-50">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Desfazer"
        >
          <Undo size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Refazer"
        >
          <Redo size={15} />
        </ToolbarButton>

        <div className="w-px h-5 bg-neutral-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Título 2"
        >
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Título 3"
        >
          <Heading3 size={15} />
        </ToolbarButton>

        <div className="w-px h-5 bg-neutral-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Negrito"
        >
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Itálico"
        >
          <Italic size={15} />
        </ToolbarButton>

        <div className="w-px h-5 bg-neutral-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Sublinhado"
        >
          <UnderlineIcon size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Rasurado"
        >
          <StrikethroughIcon size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive('highlight')}
          title="Destaque"
        >
          <Highlighter size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="Bloco de código"
        >
          <Code size={15} />
        </ToolbarButton>

        <div className="w-px h-5 bg-neutral-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Alinhar à esquerda"
        >
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Alinhar ao centro"
        >
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Alinhar à direita"
        >
          <AlignRight size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={editor.isActive({ textAlign: 'justify' })}
          title="Justificar"
        >
          <AlignJustify size={15} />
        </ToolbarButton>

        <div className="w-px h-5 bg-neutral-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Lista"
        >
          <ListIcon size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Lista numerada"
        >
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Citação"
        >
          <Quote size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Linha horizontal"
        >
          <Minus size={15} />
        </ToolbarButton>

        <div className="w-px h-5 bg-neutral-300 mx-1" />

        <ToolbarButton
          onClick={openLinkDialog}
          active={editor.isActive('link')}
          disabled={editor.state.selection.empty && !editor.isActive('link')}
          title="Inserir link"
        >
          <LinkIcon size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => setImageDialogOpen(true)} title="Inserir imagem">
          <ImageIcon size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setGalleryDialogOpen(true)}
          disabled={galleryImages.length === 0}
          title="Gerenciar galeria de imagens"
        >
          <ImagesIcon size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={insertTable} title="Inserir tabela">
          <TableIcon size={15} />
        </ToolbarButton>
        {/* Dropdown de variáveis de personalização */}
        <div ref={varsRef} className="relative">
          <button
            type="button"
            title="Inserir variável de personalização"
            onClick={() => setVarsOpen((v) => !v)}
            className={clsx(
              'flex items-center gap-1 px-2 py-1.5 rounded text-sm font-medium transition-colors',
              varsOpen
                ? 'bg-brand-600 text-white'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
            )}
          >
            <Braces size={15} />
            <span className="text-xs">Variáveis</span>
          </button>
          {varsOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-xl border border-neutral-200 bg-white shadow-lg py-1">
              <p className="px-3 py-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                Personalização
              </p>
              {[
                { label: 'Nome do jornalista', tag: '{{nome}}', example: 'Ex: Olá {{nome}},' },
                {
                  label: 'Órgão de comunicação',
                  tag: '{{veiculo}}',
                  example: 'Ex: da {{veiculo}}',
                },
              ].map((v) => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => insertVariable(v.tag)}
                  className="w-full text-left px-3 py-2 hover:bg-neutral-50 transition-colors"
                >
                  <span className="block text-sm font-medium text-neutral-800">{v.label}</span>
                  <span className="block text-xs text-neutral-400 font-mono mt-0.5">{v.tag}</span>
                  <span className="block text-xs text-neutral-400 mt-0.5 italic">{v.example}</span>
                </button>
              ))}
              <div className="mx-3 my-1 border-t border-neutral-100" />
              <p className="px-3 py-1.5 text-xs text-neutral-400 leading-relaxed">
                As variáveis são substituídas automaticamente no momento do envio.
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="border-b border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-500">
        Dica: para inserir link, selecione um texto primeiro. Para personalizar o email, use
        Variáveis como {'{{nome}}'} e {'{{veiculo}}'}.
      </p>

      {urlDialog && (
        <div className="border-b border-neutral-200 bg-white p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://exemplo.com"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  applyUrl()
                }
                if (e.key === 'Escape') {
                  setUrlDialog(null)
                  setUrlInput('')
                }
              }}
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={applyUrl}
                className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700"
              >
                Inserir
              </button>
              <button
                type="button"
                onClick={() => {
                  setUrlDialog(null)
                  setUrlInput('')
                }}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <EditorContent editor={editor} />

      {/* Dialogs */}
      <ImageDialog
        isOpen={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        onInsert={(src) => {
          handleInsertImage(src)
          setGalleryImages((prev) => [
            ...prev,
            { id: Math.random().toString(36), src, align: 'center', width: 100 },
          ])
        }}
      />

      <GalleryDialog
        isOpen={galleryDialogOpen}
        onClose={() => setGalleryDialogOpen(false)}
        images={galleryImages}
        onImagesChange={setGalleryImages}
        onInsert={handleInsertImage}
        onInsertGallery={handleInsertGallery}
      />
    </div>
  )
}
