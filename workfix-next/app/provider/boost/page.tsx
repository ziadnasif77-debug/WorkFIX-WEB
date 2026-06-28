'use client'
import { Zap } from 'lucide-react'
import { useRequireRole } from '@/features/auth/hooks/useAuth'
import Header from '@/shared/components/ui/Header'
import Button from '@/shared/components/ui/Button'
import { t } from '@/shared/lib/i18n'
import { CONFIG } from '@/shared/lib/config'

export default function BoostPage() {
  useRequireRole(['provider'])

  const plans = Object.entries(CONFIG.BOOST_PLANS)

  return (
    <div className="screen active">
      <Header title={t('boost_profile')} showBack />
      <div className="content content-padded">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          <Zap size={48} style={{ color: 'var(--c-warning)' }} />
          <h3 style={{ marginTop: 'var(--space-md)' }}>{t('boost_profile')}</h3>
          <p style={{ color: 'var(--c-text-secondary)' }}>Get more visibility and appear higher in search results</p>
        </div>
        {plans.map(([days, plan]) => (
          <div key={days} className="card card-padded card-hover" style={{ marginBottom: 'var(--space-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{days} days</div>
              <div style={{ fontSize: 'var(--font-sm)', color: 'var(--c-text-secondary)' }}>${plan.price}</div>
            </div>
            <Button size="sm">{t('subscribe')}</Button>
          </div>
        ))}
      </div>
    </div>
  )
}
