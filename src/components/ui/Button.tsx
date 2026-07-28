import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-stone-900 text-white hover:bg-stone-700',
  secondary: 'bg-white text-stone-900 border border-stone-300 hover:bg-stone-50',
  ghost: 'bg-transparent text-stone-900 hover:bg-stone-100',
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${variantStyles[variant]} ${className}`}
      {...props}
    />
  )
}
