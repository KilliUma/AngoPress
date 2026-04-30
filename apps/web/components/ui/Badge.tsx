import { clsx } from 'clsx'

export type BadgeColor = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'brand'

export type BadgeSize = 'sm' | 'md'

interface BadgeProps {
  children: React.ReactNode
  color?: BadgeColor
  size?: BadgeSize
  className?: string
  dot?: boolean
}

const colorMap: Record<BadgeColor, string> = {
  default: 'bg-neutral-100 text-neutral-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-sky-50 text-sky-700',
  purple: 'bg-violet-50 text-violet-700',
  brand: 'bg-brand-50 text-brand-700',
}

const dotColorMap: Record<BadgeColor, string> = {
  default: 'bg-neutral-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-400',
  danger: 'bg-red-500',
  info: 'bg-sky-500',
  purple: 'bg-violet-500',
  brand: 'bg-brand-600',
}

const sizeMap: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
}

export function Badge({ children, color = 'default', size = 'md', dot, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        colorMap[color],
        sizeMap[size],
        className,
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotColorMap[color])} />}
      {children}
    </span>
  )
}
