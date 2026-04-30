'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: ModalSize
  className?: string
  /** Bloqueia fecho ao clicar no backdrop */
  persistent?: boolean
}

const sizeMap: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className,
  persistent,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Fechar com ESC
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !persistent) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose, persistent])

  // Bloquear scroll do body
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={persistent ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Painel */}
      <div
        ref={dialogRef}
        className={clsx(
          'relative w-full bg-white rounded-2xl shadow-xl',
          'animate-in fade-in zoom-in-95 duration-200',
          sizeMap[size],
          className,
        )}
      >
        {(title || !persistent) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-neutral-100">
            <div>
              {title && (
                <h2 id="modal-title" className="text-base font-semibold text-neutral-900">
                  {title}
                </h2>
              )}
              {description && <p className="text-sm text-neutral-500 mt-0.5">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
              aria-label="Fechar modal"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

interface ModalFooterProps {
  children: React.ReactNode
  className?: string
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={clsx(
        'flex items-center justify-end gap-3 pt-4 mt-4 border-t border-neutral-100',
        className,
      )}
    >
      {children}
    </div>
  )
}
