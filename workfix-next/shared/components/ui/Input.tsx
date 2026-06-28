'use client'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="form-group">
        {label && <label htmlFor={inputId} className="form-label">{label}</label>}
        <input
          ref={ref}
          id={inputId}
          className={`form-input ${error ? 'form-input-error' : ''} ${className}`}
          {...props}
        />
        {error && <span className="form-error">{error}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
