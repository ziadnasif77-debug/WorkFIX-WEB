'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MapPin, DollarSign } from 'lucide-react'
import { useRequireRole } from '@/features/auth/hooks/useAuth'
import { useOrder, submitQuote } from '@/features/orders/hooks/useOrders'
import Header from '@/shared/components/ui/Header'
import Input from '@/shared/components/ui/Input'
import Button from '@/shared/components/ui/Button'
import { showToast } from '@/shared/components/ui/Toast'
import { t } from '@/shared/lib/i18n'

function formatCurrency(amount: number, currency = 'SAR') {
  return new Intl.NumberFormat('en', { style: 'currency', currency }).format(amount)
}

export default function QuoteSubmitPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  useRequireRole(['provider'])
  const { order, loadOrder } = useOrder()
  const [price, setPrice] = useState('')
  const [hours, setHours] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (id) loadOrder(id) }, [id, loadOrder])

  const handleSubmit = async () => {
    const p = parseFloat(price)
    if (!p || p <= 0) { showToast('Enter a valid price', 'error'); return }
    setLoading(true)
    const ok = await submitQuote(id, p, hours ? parseFloat(hours) : undefined, notes || undefined)
    setLoading(false)
    if (ok) router.back()
  }

  if (!order) return <div className="screen active"><div className="spinner-center"><div className="spinner" /></div></div>

  return (
    <div className="screen active">
      <Header title={t('submit_quote')} showBack />
      <div className="content content-padded">
        <div className="card card-padded" style={{ marginBottom: 'var(--space-md)' }}>
          <h3 style={{ marginBottom: 'var(--space-sm)' }}>{order.title}</h3>
          <p style={{ color: 'var(--c-text-secondary)', fontSize: 'var(--font-sm)' }}>{order.description}</p>
          <div style={{ marginTop: 'var(--space-sm)', fontSize: 'var(--font-sm)', color: 'var(--c-text-secondary)' }}>
            <MapPin size={14} /> {order.location_address || ''}
            {order.budget && <> · <DollarSign size={14} /> {formatCurrency(order.budget, order.currency)}</>}
          </div>
        </div>

        <Input label={`${t('your_price')} (${order.currency})`} type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" dir="ltr" />
        <Input label={t('estimated_hours')} type="number" value={hours} onChange={e => setHours(e.target.value)} placeholder="2" dir="ltr" />
        <div className="input-group">
          <label className="input-label">{t('notes')}</label>
          <textarea className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('notes_ph')} maxLength={500} />
        </div>

        <Button className="btn-full btn-lg" loading={loading} onClick={handleSubmit}>{t('send_quote')}</Button>
      </div>
    </div>
  )
}
