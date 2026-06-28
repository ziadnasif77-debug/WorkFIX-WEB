'use client'
import { useAuth, useRequireRole } from '@/features/auth/hooks/useAuth'
import Header from '@/shared/components/ui/Header'
import Button from '@/shared/components/ui/Button'
import { t } from '@/shared/lib/i18n'
import { CONFIG } from '@/shared/lib/config'

export default function SubscriptionPage() {
  useRequireRole(['provider'])
  const { providerProfile } = useAuth()
  const currentTier = providerProfile?.subscription_tier || 'free'

  const plans = Object.entries(CONFIG.SUBSCRIPTION_PLANS)

  return (
    <div className="screen active">
      <Header title={t('subscription')} showBack />
      <div className="content content-padded">
        {plans.map(([key, plan]) => (
          <div key={key} className="card card-padded" style={{
            marginBottom: 'var(--space-md)',
            borderColor: currentTier === plan.tier ? 'var(--c-primary)' : undefined,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
              <h3 style={{ textTransform: 'capitalize' }}>{plan.tier} - {plan.period}</h3>
              {currentTier === plan.tier && <span className="badge badge-success">Current</span>}
            </div>
            <div style={{ fontSize: 'var(--font-xxl)', fontWeight: 800, marginBottom: 'var(--space-sm)' }}>
              ${plan.price}<span style={{ fontSize: 'var(--font-sm)', fontWeight: 400 }}>/{plan.period === 'monthly' ? 'mo' : 'yr'}</span>
            </div>
            <Button variant={currentTier === plan.tier ? 'secondary' : 'primary'} className="btn-full">
              {currentTier === plan.tier ? 'Current Plan' : t('subscribe')}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
