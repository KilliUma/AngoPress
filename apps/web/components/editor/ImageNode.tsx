'use client'

import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { ResizableImage } from './ResizableImage'
import { useCallback } from 'react'

interface ImageNodeProps {
  node: any
  updateAttributes: (attrs: any) => void
  selected: boolean
  editor: any
}

export default function ImageNode({ node, updateAttributes, selected, editor }: ImageNodeProps) {
  const { src, alt, title } = node.attrs

  // Parse style from title attribute (contains CSS styles)
  const parseAlign = (styleStr: string): 'left' | 'center' | 'right' => {
    if (!styleStr) return 'center'
    if (styleStr.includes('margin-right: auto;') && !styleStr.includes('margin-left: auto;'))
      return 'left'
    if (styleStr.includes('margin-left: auto;') && styleStr.includes('margin-right: auto;'))
      return 'center'
    if (styleStr.includes('margin-left: auto;') && !styleStr.includes('margin-right: auto;'))
      return 'right'
    return 'center'
  }

  const parseWidth = (styleStr: string): number => {
    if (!styleStr) return 100
    const match = styleStr.match(/width:\s*(\d+)%/)
    return match ? parseInt(match[1]) : 100
  }

  const align = parseAlign(title)
  const width = parseWidth(title)

  const handleUpdate = useCallback(
    (newAlign: 'left' | 'center' | 'right', newWidth: number) => {
      const alignStyle =
        newAlign === 'left'
          ? 'display: block; margin-right: auto;'
          : newAlign === 'center'
            ? 'display: block; margin-left: auto; margin-right: auto;'
            : 'display: block; margin-left: auto;'
      const widthStyle = newWidth < 100 ? `width: ${newWidth}%;` : ''
      const newTitle = `${alignStyle} ${widthStyle}`.trim()
      updateAttributes({ title: newTitle })
    },
    [updateAttributes],
  )

  const handleDelete = useCallback(() => {
    editor.chain().focus().deleteNode('image').run()
  }, [editor])

  return (
    <NodeViewWrapper className="inline-block">
      <ResizableImage
        src={src}
        initialAlign={align}
        initialWidth={width}
        onUpdate={handleUpdate}
        onRemove={handleDelete}
      />
    </NodeViewWrapper>
  )
}
