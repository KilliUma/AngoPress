'use client'

import { useEffect, useRef } from 'react'

interface AnimateInProps {
  children: React.ReactNode
  className?: string
  variant?: 'up' | 'left' | 'right' | 'scale'
  delay?: number
  threshold?: number
}

export function AnimateIn({
  children,
  className = '',
  variant = 'up',
  delay = 0,
  threshold = 0.12,
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const variantClass =
      variant === 'left'
        ? 'reveal-left'
        : variant === 'right'
          ? 'reveal-right'
          : variant === 'scale'
            ? 'reveal-scale'
            : 'reveal'

    el.classList.add(variantClass)
    if (delay) el.style.transitionDelay = `${delay}ms`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          observer.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [variant, delay, threshold])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

export default AnimateIn
