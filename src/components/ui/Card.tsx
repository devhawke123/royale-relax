import type { PropsWithChildren, ReactNode } from 'react'

interface CardProps {
  title: string
  description?: string
  image?: ReactNode
  footer?: ReactNode
  className?: string
}

export function Card({
  title,
  description,
  image,
  footer,
  className = '',
  children,
}: PropsWithChildren<CardProps>) {
  return (
    <div className={`rounded-2xl border border-stone-200 bg-white p-5 ${className}`}>
      {image}
      <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-stone-600">{description}</p>}
      {children}
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  )
}
