'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Calendar, DollarSign } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useOrder } from '@/features/orders/hooks/useOrders'
import { acceptQuote, cancelOrder, markComplete, confirmCompletion } from '@/features/orders/hooks/useOrders'
import { useOrderRealtime } from '@/features/chat/hooks/useChat'
import { StatusBadge } from '@/shared/components/ui/Badge'
import Header from '@/shared/components/ui/Header'
import Button from '@/shared/components/ui/Button'
import Avatar from '@/shared/components/ui/Avatar'
import { showToast } from '@/shared/components/ui/Toast'
import { t } from '@/shared/lib/i18n'
import { db } from '@/shared/lib/supabase'

function formatCurrency(amount: number, currency = 'SAR') {
  return new Intl.NumberFormat('en', { style: 'currency', currency }).format(amount)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString()
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, profile } = useAuth()
  const { order, quotes, loading, loadOrder } = useOrder()

  useEffect(() => { if (id) loadOrder(id) }, [id, loadOrder])

  useOrderRealtime(id, () => { loadOrder(id) })

  if (loading || !order) {
    return <div className="screen active"><div className="spinner-center"><div className="spinner" /></div></div>
  }

  const isCustomer = order.customer_id === user?.id
  const isProvider = order.provider_id === user?.id
  const steps = ['pending','quoted','confirmed','payment_pending','in_progress','completed','closed'] as const
  const currentStep = steps.indexOf(order.status as any)

  const handleAcceptQuote = async (quoteId: string) => {
    const ok = await acceptQuote(id, quoteId)
    if (ok) loadOrder(id)
  }

  const handleCancel = async () => {
    if (confirm(t('confirm') + '?')) {
      const ok = await cancelOrder(id)
      if (ok) router.push('/orders')
    }
  }

  const handleMarkComplete = async () => {
    const ok = await markComplete(id)
    if (ok) loadOrder(id)
  }

  const handleConfirmCompletion = async () => {
    const ok = await confirmCompletion(id)
    if (ok) loadOrder(id)
  }

  const openChat = async () => {
    const { data } = await db.from('conversations').select('*')
      .eq('order_id', id).contains('participants', [user!.id]).limit(1).single()
    if (data) router.push(`/chat/${data.id}`)
  }

  return (
    <div className="screen active">
      <Header title={t('order_details')} showBack action={<StatusBadge status={order.status} />} />
      <div className="content content-padded">
        <div className="card card-padded" style={{ marginBottom: 'var(--space-md)' }}>
          <h3 style={{ marginBottom: 'var(--space-sm)' }}>{order.title}</h3>
          <p style={{ color: 'var(--c-text-secondary)', marginBottom: 'var(--space-md)' }}>{order.description}</p>
          <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', fontSize: 'var(--font-sm)', color: 'var(--c-text-secondary)' }}>
            <span><MapPin size={14} /> {order.location_address || t('location')}</span>
            <span><Calendar size={14} /> {formatDate(order.created_at)}</span>
            {order.budget && <span><DollarSign size={14} /> {formatCurrency(order.budget, order.currency)}</span>}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
          <div className="timeline">
            {steps.map((s, i) => (
              <div key={s} className="timeline-step">
                <div className={`timeline-dot ${i < currentStep ? 'done' : i === currentStep ? 'current' : 'pending'}`}>
                  {i < currentStep ? '✔' : i + 1}
                </div>
                <div className="timeline-content">
                  <div className="timeline-title">{t(`status_${s}` as any)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {(order.status === 'quoted' || order.status === 'pending') && isCustomer && (
          <>
            <h3 style={{ marginBottom: 'var(--space-sm)' }}>{t('quotes')} ({quotes.length})</h3>
            {quotes.filter(q => q.status === 'pending').map(q => (
              <div key={q.id} className="quote-card">
                <div className="quote-card-header">
                  <Avatar name={q.profiles?.display_name} size={32} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{q.profiles?.display_name || t('provider')}</div>
                    {q.estimated_hours && <div style={{ fontSize: 'var(--font-xs)', color: 'var(--c-text-secondary)' }}>~{q.estimated_hours}h</div>}
                  </div>
                </div>
                <div className="quote-card-price">{formatCurrency(q.price, q.currency)}</div>
                {q.notes && <p style={{ fontSize: 'var(--font-sm)', color: 'var(--c-text-secondary)', marginTop: 'var(--space-sm)' }}>{q.notes}</p>}
                <div className="quote-card-actions">
                  <Button size="sm" onClick={() => handleAcceptQuote(q.id)}>{t('accept')}</Button>
                  <Button size="sm" variant="secondary">{t('reject')}</Button>
                </div>
              </div>
            ))}
            {quotes.length === 0 && (
              <div className="card card-padded" style={{ textAlign: 'center', color: 'var(--c-text-secondary)', marginBottom: 'var(--space-md)' }}>
                {t('waiting_quotes')}
              </div>
            )}
          </>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
          {order.status === 'confirmed' && isCustomer && (
            <Link href={`/payment/${id}`}><Button className="btn-full">{t('pay_now')}</Button></Link>
          )}
          {order.status === 'in_progress' && isProvider && (
            <Button className="btn-full" onClick={handleMarkComplete}>{t('mark_complete')}</Button>
          )}
          {order.status === 'completed' && isCustomer && (
            <Button className="btn-full" onClick={handleConfirmCompletion}>{t('confirm_completion')}</Button>
          )}
          {order.status === 'closed' && isCustomer && (
            <Link href={`/review/${id}`}><Button variant="secondary" className="btn-full">{t('rate_service')}</Button></Link>
          )}
          {['pending','quoted','confirmed'].includes(order.status) && isCustomer && (
            <Button variant="secondary" className="btn-full btn-sm" style={{ color: 'var(--c-danger)' }} onClick={handleCancel}>
              {t('cancel_order')}
            </Button>
          )}
          {order.provider_id && (isCustomer || isProvider) && (
            <Button variant="secondary" className="btn-full" onClick={openChat}>{t('open_chat')}</Button>
          )}
        </div>
      </div>
    </div>
  )
}
