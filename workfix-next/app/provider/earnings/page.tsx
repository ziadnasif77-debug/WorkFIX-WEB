'use client'
import { useEffect, useState } from 'react'
import { Wallet } from 'lucide-react'
import { useRequireRole } from '@/features/auth/hooks/useAuth'
import { useProvider } from '@/features/provider/hooks/useProvider'
import { ProviderTabBar } from '@/shared/components/ui/TabBar'
import Header from '@/shared/components/ui/Header'
import Button from '@/shared/components/ui/Button'
import EmptyState from '@/shared/components/ui/EmptyState'
import { t } from '@/shared/lib/i18n'
import type { EarningsData } from '@/shared/types'

function formatCurrency(amount: number, currency = 'SAR') {
  return new Intl.NumberFormat('en', { style: 'currency', currency }).format(amount)
}

export default function EarningsPage() {
  useRequireRole(['provider'])
  const { loadEarnings } = useProvider()
  const [data, setData] = useState<EarningsData>({ available: 0, pending: 0, history: [] })

  useEffect(() => { loadEarnings().then(setData) }, [loadEarnings])

  return (
    <div className="screen active">
      <Header title={t('earnings')} />
      <div className="content content-padded">
        <div className="card card-padded" style={{ marginBottom: 'var(--space-md)', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--font-sm)', color: 'var(--c-text-secondary)' }}>{t('total_balance')}</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--c-success)', margin: 'var(--space-sm) 0' }}>
            {formatCurrency(data.available, 'SAR')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-xl)', marginBottom: 'var(--space-md)' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{formatCurrency(data.available, 'SAR')}</div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--c-text-secondary)' }}>{t('available_balance')}</div>
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{formatCurrency(data.pending, 'SAR')}</div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--c-text-secondary)' }}>{t('pending_balance')}</div>
            </div>
          </div>
          <Button className="btn-full">{t('request_payout')}</Button>
        </div>
        {data.history.length === 0 ? (
          <EmptyState icon={Wallet} title={t('no_orders_desc')} />
        ) : (
          data.history.map(p => (
            <div key={p.id} className="card card-padded" style={{ marginBottom: 'var(--space-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{formatCurrency(p.net_amount, p.currency)}</span>
                <span style={{ fontSize: 'var(--font-sm)', color: 'var(--c-text-secondary)' }}>
                  {new Date(p.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <ProviderTabBar />
    </div>
  )
}
