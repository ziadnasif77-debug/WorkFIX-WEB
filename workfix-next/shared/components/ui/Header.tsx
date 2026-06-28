'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface HeaderProps {
  title: string
  showBack?: boolean
  action?: React.ReactNode
}

export default function Header({ title, showBack = false, action }: HeaderProps) {
  const router = useRouter()

  return (
    <div className="header">
      {showBack && (
        <div className="header-back" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </div>
      )}
      <div className="header-title">{title}</div>
      {action && <div className="header-action">{action}</div>}
    </div>
  )
}
