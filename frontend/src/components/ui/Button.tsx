import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#B87333] text-white hover:bg-[#A3662E]',
  secondary: 'bg-white text-stone-900 border border-stone-300 hover:bg-stone-50',
  ghost: 'bg-transparent text-stone-900 hover:bg-stone-100',
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-none text-center transition-colors ${variantStyles[variant]} ${className}`}
      {...props}
    />
  )
}
