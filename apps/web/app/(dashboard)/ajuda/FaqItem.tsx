'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-neutral-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-semibold text-neutral-800">{q}</span>
        {open ? (
          <ChevronUp size={16} className="shrink-0 text-brand-600" />
        ) : (
          <ChevronDown size={16} className="shrink-0 text-neutral-400" />
        )}
      </button>
      {open && <p className="pb-4 text-sm leading-relaxed text-neutral-600">{a}</p>}
    </div>
  )
}
