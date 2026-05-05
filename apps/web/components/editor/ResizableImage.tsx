'use client'

import { useState, useRef, useEffect } from 'react'
import { AlignLeft, AlignCenter, AlignRight, Maximize2, X } from 'lucide-react'
import { clsx } from 'clsx'

interface ResizableImageProps {
  src: string
  initialAlign?: 'left' | 'center' | 'right'
  initialWidth?: number
  onUpdate?: (align: 'left' | 'center' | 'right', width: number) => void
  onRemove?: () => void
}

export function ResizableImage({
  src,
  initialAlign = 'center',
  initialWidth = 100,
  onUpdate,
  onRemove,
}: ResizableImageProps) {
  const [isSelected, setIsSelected] = useState(false)
  const [align, setAlign] = useState<'left' | 'center' | 'right'>(initialAlign)
  const [width, setWidth] = useState(initialWidth)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeSide, setResizeSide] = useState<'left' | 'right'>('right')
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(width)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return

      const rawDelta = e.clientX - startX
      const delta = resizeSide === 'left' ? -rawDelta : rawDelta
      const containerWidth = containerRef.current.offsetWidth
      const newWidth = Math.max(30, Math.min(100, startWidth + (delta / containerWidth) * 100))

      setWidth(Math.round(newWidth))
    }

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false)
        onUpdate?.(align, Math.round(width))
      }
    }

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizing, startX, startWidth, width, align, onUpdate, resizeSide])

  useEffect(() => {
    setAlign(initialAlign)
  }, [initialAlign])

  useEffect(() => {
    setWidth(initialWidth)
  }, [initialWidth])

  const handleAlignChange = (newAlign: 'left' | 'center' | 'right') => {
    setAlign(newAlign)
    onUpdate?.(newAlign, width)
  }

  const handleResizeStart = (side: 'left' | 'right') => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setResizeSide(side)
    setIsResizing(true)
    setStartX(e.clientX)
    setStartWidth(width)
  }

  const marginStyle = {
    marginLeft: align === 'left' ? '0' : align === 'center' ? 'auto' : 'auto',
    marginRight: align === 'left' ? 'auto' : align === 'center' ? 'auto' : '0',
  }

  return (
    <div
      ref={containerRef}
      className={clsx(
        'relative my-4 group rounded-lg overflow-visible transition-all',
        isSelected ? 'ring-2 ring-brand-500 ring-offset-2' : '',
      )}
      onClick={() => setIsSelected(true)}
      onBlur={() => setIsSelected(false)}
      tabIndex={0}
      role="button"
    >
      {/* Image Container */}
      <div style={{ ...marginStyle, display: 'block', width: `${width}%` }}>
        <div className="relative bg-neutral-100 rounded-lg overflow-hidden">
          <img src={src} alt="editor" className="w-full h-auto block" />

          {/* Controls - Visible on Hover */}
          {isSelected && (
            <>
              {/* Top Controls */}
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-2 flex items-center justify-between">
                <div className="flex gap-1">
                  {(['left', 'center', 'right'] as const).map((a) => (
                    <button
                      key={a}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAlignChange(a)
                      }}
                      className={clsx(
                        'p-1.5 rounded transition-colors',
                        align === a
                          ? 'bg-brand-600 text-white'
                          : 'bg-white/20 text-white hover:bg-white/30',
                      )}
                      title={
                        a === 'left'
                          ? 'Alinhar à esquerda'
                          : a === 'center'
                            ? 'Alinhar ao centro'
                            : 'Alinhar à direita'
                      }
                    >
                      {a === 'left' && <AlignLeft size={16} />}
                      {a === 'center' && <AlignCenter size={16} />}
                      {a === 'right' && <AlignRight size={16} />}
                    </button>
                  ))}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove?.()
                  }}
                  className="p-1.5 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                  title="Remover imagem"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Width Indicator */}
              <div className="absolute bottom-2 left-2 right-2 bg-black/50 text-white text-xs rounded px-2 py-1 flex items-center gap-1">
                <Maximize2 size={12} />
                {width}%
              </div>
            </>
          )}
        </div>

        {/* Resize Handle - Always visible when selected */}
        {isSelected && (
          <>
            <div
              onMouseDown={handleResizeStart('left')}
              className={clsx(
                'absolute left-0 top-1/2 h-12 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500 cursor-col-resize transition-all',
                'hover:w-2 hover:bg-brand-600',
              )}
              title="Arrastar borda esquerda para redimensionar"
            />
            <div
              onMouseDown={handleResizeStart('right')}
              className={clsx(
                'absolute right-0 top-1/2 h-12 w-1 translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500 cursor-col-resize transition-all',
                'hover:w-2 hover:bg-brand-600',
              )}
              title="Arrastar borda direita para redimensionar"
            />
          </>
        )}
      </div>
    </div>
  )
}
