import type { OrderStatus } from '@/shared/types'
import { t } from '@/shared/lib/i18n'

const STATUS_CLASSES: Record<string, string> = {
  pending: 'badge-warning',
  quoted: 'badge-info',
  confirmed: 'badge-primary',
  payment_pending: 'badge-warning',
  in_progress: 'badge-primary',
  completed: 'badge-success',
  closed: 'badge-neutral',
  cancelled: 'badge-danger',
  disputed: 'badge-danger',
}

interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  className?: string
  children: React.ReactNode
}

export default function Badge({ variant = 'neutral', className = '', children }: BadgeProps) {
  return <span className={`badge badge-${variant} ${className}`}>{children}</span>
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`badge ${STATUS_CLASSES[status] || 'badge-neutral'}`}>
      {t(`status_${status}` as any)}
    </span>
  )
}
