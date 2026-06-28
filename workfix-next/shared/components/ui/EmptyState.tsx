import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state" style={{ textAlign: 'center', padding: '48px 24px' }}>
      {Icon && <Icon size={48} style={{ color: 'var(--text-tertiary)', marginBottom: 16 }} />}
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
      {description && <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{description}</p>}
      {action}
    </div>
  )
}
