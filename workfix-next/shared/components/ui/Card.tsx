import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated'
}

export default function Card({ variant = 'default', className = '', children, ...props }: CardProps) {
  const variants: Record<string, string> = {
    default: 'card',
    outlined: 'card card-outlined',
    elevated: 'card card-elevated',
  }

  return (
    <div className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  )
}
