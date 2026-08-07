'use client'

import { useState } from 'react'

export interface AccordionItem {
  id: string
  title: string
  content: string
}

interface AccordionProps {
  items: AccordionItem[]
}

export function Accordion({ items }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
      {items.map((item) => {
        const isOpen = openId === item.id
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-stone-900"
              aria-expanded={isOpen}
            >
              {item.title}
              <span className="text-stone-400">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <p className="px-5 pb-4 text-sm text-stone-600">{item.content}</p>}
          </div>
        )
      })}
    </div>
  )
}
