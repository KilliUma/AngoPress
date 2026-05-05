export function CheckIcon({
  className = 'w-4 h-4 text-brand-500 flex-shrink-0',
}: {
  className?: string
}) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 text-[10px] font-bold text-brand-600 uppercase tracking-widest">
      <span className="w-5 h-px bg-brand-600" />
      {children}
    </p>
  )
}
