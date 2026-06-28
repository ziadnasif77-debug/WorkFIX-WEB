'use client'
import { useEffect, useState, useCallback } from 'react'
import type { ToastType } from '@/shared/types'

interface ToastMessage {
  id: number
  text: string
  type: ToastType
}

let toastId = 0
let addToastExternal: ((text: string, type?: ToastType) => void) | null = null

export function showToast(text: string, type: ToastType = 'success') {
  addToastExternal?.(text, type)
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((text: string, type: ToastType = 'success') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, text, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  useEffect(() => {
    addToastExternal = addToast
    return () => { addToastExternal = null }
  }, [addToast])

  if (toasts.length === 0) return null

  return (
    <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.text}
        </div>
      ))}
    </div>
  )
}
