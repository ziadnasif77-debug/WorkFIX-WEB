'use client'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }, ref) => {
    const base = 'btn'
    const variants: Record<string, string> = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      outline: 'btn-outline',
      danger: 'btn-danger',
      ghost: 'btn-ghost',
    }
    const sizes: Record<string, string> = {
      sm: 'btn-sm',
      md: '',
      lg: 'btn-lg',
    }

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
