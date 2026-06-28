'use client'
import { useEffect, useState, useCallback } from 'react'
import { Scale } from 'lucide-react'
import { useRequireRole } from '@/features/auth/hooks/useAuth'
import { useAdmin } from '@/features/admin/hooks/useAdmin'
import Header from '@/shared/components/ui/Header'
import Badge from '@/shared/components/ui/Badge'
import Button from '@/shared/components/ui/Button'
import EmptyState from '@/shared/components/ui/EmptyState'
import { t } from '@/shared/lib/i18n'
import type { Dispute } from '@/shared/types'

export default function AdminDisputesPage() {
  useRequireRole(['admin', 'superadmin'])
  const { loadDisputes, resolveDispute } = useAdmin()
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async (f: string) => {
    setLoading(true)
    const data = await loadDisputes(f)
    setDisputes(data)
    setLoading(false)
  }, [loadDisputes])

  useEffect(() => { refresh(filter) }, [filter, refresh])

  const handleResolve = async (id: string, resolution: string) => {
    await resolveDispute(id, resolution)
    refresh(filter)
  }

  const statusVariant = (s: string) => s === 'open' ? 'danger' : s === 'investigating' ? 'warning' : 'success'

  return (
    <div className="screen active">
      <Header title={t('disputes')} showBack />
      <div className="chip-row">
        {['all','open','investigating','resolved'].map(f => (
          <div key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {t(f === 'all' ? 'all' : f as any)}
          </div>
        ))}
      </div>
      <div className="content">
        {loading ? (
          <div className="spinner-center"><div className="spinner" /></div>
        ) : disputes.length === 0 ? (
          <EmptyState icon={Scale} title="No disputes found" />
        ) : (
          disputes.map(d => (
            <div key={d.id} className="order-card">
              <div className="order-card-top">
                <div className="order-card-title">{d.orders?.title || d.order_id}</div>
                <Badge variant={statusVariant(d.status) as any}>{t(d.status as any)}</Badge>
              </div>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--c-text-secondary)', marginBottom: 'var(--space-sm)' }}>{d.reason}</p>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--c-text-muted)' }}>{new Date(d.created_at).toLocaleDateString()}</div>
              {d.status !== 'resolved' ? (
                <div style={{ marginTop: 'var(--space-sm)', display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                  <Button size="sm" onClick={() => handleResolve(d.id, 'customer_favor')}>{t('customer_favor')}</Button>
                  <Button size="sm" variant="secondary" onClick={() => handleResolve(d.id, 'provider_favor')}>{t('provider_favor')}</Button>
                  <Button size="sm" variant="secondary" onClick={() => handleResolve(d.id, 'settlement')}>{t('settlement')}</Button>
                </div>
              ) : d.resolution ? (
                <div style={{ marginTop: 'var(--space-sm)' }}><Badge variant="info">{t(d.resolution as any)}</Badge></div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
