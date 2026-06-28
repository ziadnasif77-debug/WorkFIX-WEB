'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CreditCard, Smartphone, Landmark, Banknote, ChevronRight } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useOrder, processPayment } from '@/features/orders/hooks/useOrders'
import Header from '@/shared/components/ui/Header'
import { t } from '@/shared/lib/i18n'
import { CONFIG } from '@/shared/lib/config'

function formatCurrency(amount: number, currency = 'SAR') {
  return new Intl.NumberFormat('en', { style: 'currency', currency }).format(amount)
}

const ICON_MAP: Record<string, any> = {
  'credit-card': CreditCard, smartphone: Smartphone, landmark: Landmark, banknote: Banknote,
}

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>()
  const { profile } = useAuth()
  const { order, loadOrder } = useOrder()
  const [paying, setPaying] = useState(false)

  useEffect(() => { if (id) loadOrder(id) }, [id, loadOrder])

  if (!order) {
    return <div className="screen active"><div className="spinner-center"><div className="spinner" /></div></div>
  }

  const country = profile?.country || 'SA'
  const countryConfig = CONFIG.SUPPORTED_COUNTRIES[country] || CONFIG.SUPPORTED_COUNTRIES.SA
  const vatRate = countryConfig.vat
  const subtotal = order.quoted_price || 0
  const vat = subtotal * vatRate
  const total = subtotal + vat

  const methods = [
    { id: 'card', label: t('card'), icon: 'credit-card', show: true },
    { id: 'apple_pay', label: t('apple_pay'), icon: 'smartphone', show: true },
    { id: 'mada', label: t('mada'), icon: 'landmark', show: country === 'SA' },
    { id: 'stc_pay', label: t('stc_pay'), icon: 'smartphone', show: country === 'SA' },
    { id: 'cash', label: t('cash'), icon: 'banknote', show: true },
  ].filter(m => m.show)

  const handlePay = async (method: string) => {
    setPaying(true)
    await processPayment(id, method, order, country)
    setPaying(false)
  }

  return (
    <div className="screen active">
      <Header title={t('payment')} showBack />
      <div className="content content-padded">
        <div className="card card-padded" style={{ marginBottom: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
            <span>{t('subtotal')}</span><span>{formatCurrency(subtotal, order.currency)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)', color: 'var(--c-text-secondary)' }}>
            <span>{t('vat')} ({(vatRate * 100).toFixed(0)}%)</span><span>{formatCurrency(vat, order.currency)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 'var(--font-lg)', borderTop: '1px solid var(--c-border)', paddingTop: 'var(--space-sm)' }}>
            <span>{t('total')}</span><span>{formatCurrency(total, order.currency)}</span>
          </div>
        </div>

        <h3 style={{ marginBottom: 'var(--space-md)' }}>{t('select_method')}</h3>
        {methods.map(m => {
          const Icon = ICON_MAP[m.icon] || CreditCard
          return (
            <div key={m.id} className="card card-padded card-hover" style={{ marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)', cursor: 'pointer' }}
                 onClick={() => handlePay(m.id)}>
              <Icon size={24} />
              <span style={{ flex: 1, fontWeight: 600 }}>{m.label}</span>
              <ChevronRight size={18} style={{ color: 'var(--c-text-muted)' }} />
            </div>
          )
        })}
        {paying && <div className="spinner-center"><div className="spinner" /></div>}
      </div>
    </div>
  )
}
