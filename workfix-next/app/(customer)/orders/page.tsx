'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useOrders } from '@/features/orders/hooks/useOrders'
import { CustomerTabBar } from '@/shared/components/ui/TabBar'
import { StatusBadge } from '@/shared/components/ui/Badge'
import EmptyState from '@/shared/components/ui/EmptyState'
import Header from '@/shared/components/ui/Header'
import { t } from '@/shared/lib/i18n'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function formatCurrency(amount: number, currency = 'SAR') {
  return new Intl.NumberFormat('en', { style: 'currency', currency }).format(amount)
}

export default function OrdersPage() {
  const { profile } = useAuth()
  const { orders, loading, loadOrders } = useOrders()
  const [filter, setFilter] = useState('all')

  useEffect(() => { loadOrders(filter) }, [filter, loadOrders])

  const filters = ['all', 'active', 'completed', 'cancelled']

  return (
    <div className="screen active">
      <Header
        title={t('my_orders')}
        action={
          profile?.role === 'customer' ? (
            <Link href="/create-order"><Plus size={22} /></Link>
          ) : undefined
        }
      />
      <div className="chip-row">
        {filters.map(f => (
          <div key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {t(f as any)}
          </div>
        ))}
      </div>
      <div className="content">
        {loading ? (
          <div className="spinner-center"><div className="spinner" /></div>
        ) : orders.length === 0 ? (
          <EmptyState title={t('no_orders')} description={t('no_orders_desc')} />
        ) : (
          orders.map(o => (
            <Link key={o.id} href={`/orders/${o.id}`} className="order-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="order-card-top">
                <div className="order-card-title">{o.title}</div>
                <StatusBadge status={o.status} />
              </div>
              <div className="order-card-meta">
                <span>{timeAgo(o.created_at)}</span>
                {o.quoted_price && <span className="order-card-price">{formatCurrency(o.quoted_price, o.currency)}</span>}
              </div>
            </Link>
          ))
        )}
      </div>
      <CustomerTabBar />
    </div>
  )
}
