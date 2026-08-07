import type { PropsWithChildren } from 'react'

interface BadgeProps {
  className?: string
}

export function Badge({ className = '', children }: PropsWithChildren<BadgeProps>) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-stone-900 px-3 py-1 text-xs font-medium text-white ${className}`}
    >
      {children}
    </span>
  )
}
