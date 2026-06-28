'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { Search, ClipboardList } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useOrders, useCategories } from '@/features/orders/hooks/useOrders'
import { CustomerTabBar } from '@/shared/components/ui/TabBar'
import { StatusBadge } from '@/shared/components/ui/Badge'
import Avatar from '@/shared/components/ui/Avatar'
import EmptyState from '@/shared/components/ui/EmptyState'
import { t } from '@/shared/lib/i18n'
import { catIconMap } from '@/shared/lib/config'
import type { Category } from '@/shared/types'

function getCategoryName(cat?: Category | null) {
  if (!cat) return ''
  return cat.name_en || ''
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return t('just_now')
  if (mins < 60) return `${mins}m ${t('ago')}`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ${t('ago')}`
  const days = Math.floor(hrs / 24)
  return `${days}d ${t('ago')}`
}

function formatCurrency(amount: number, currency = 'SAR') {
  return new Intl.NumberFormat('en', { style: 'currency', currency }).format(amount)
}

function getCatIcon(iconName: string) {
  const mapped = catIconMap(iconName)
  const pascalName = mapped.charAt(0).toUpperCase() + mapped.slice(1)
  const Icon = (LucideIcons as any)[pascalName]
  return Icon ? <Icon size={28} /> : <LucideIcons.Wrench size={28} />
}

export default function CustomerHomePage() {
  const { profile } = useAuth()
  const { orders, loadOrders } = useOrders()
  const { categories, loadCategories } = useCategories()

  useEffect(() => {
    loadCategories()
    loadOrders('all')
  }, [loadCategories, loadOrders])

  const firstName = profile?.display_name?.split(' ')[0] || ''

  return (
    <div className="screen active">
      <div className="header">
        <div className="header-title">{t('hello')}, {firstName}</div>
        <Link href="/profile" className="header-action">
          <Avatar name={profile?.display_name} size={32} src={profile?.photo_url} />
        </Link>
      </div>
      <div className="content">
        <Link href="/explore" className="search-bar" style={{ textDecoration: 'none' }}>
          <span className="search-icon"><Search size={18} /></span>
          <input placeholder={t('search_services')} readOnly style={{ cursor: 'pointer' }} />
        </Link>

        <div className="category-grid">
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={`/create-order?categoryId=${cat.id}&categoryName=${encodeURIComponent(getCategoryName(cat))}`}
              className="category-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="cat-icon">{getCatIcon(cat.icon)}</div>
              <div className="cat-name">{getCategoryName(cat)}</div>
            </Link>
          ))}
        </div>

        <div className="section-header">
          <div className="section-title">{t('recent_orders')}</div>
          <Link href="/orders" className="section-link">{t('view_all')}</Link>
        </div>

        {orders.length === 0 ? (
          <EmptyState icon={ClipboardList} title={t('no_orders')} description={t('no_orders_desc')} />
        ) : (
          <div className="h-scroll">
            {orders.slice(0, 5).map(o => (
              <Link key={o.id} href={`/orders/${o.id}`} className="card card-padded card-hover h-scroll-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
                  <span style={{ fontWeight: 600 }}>{o.title}</span>
                  <StatusBadge status={o.status} />
                </div>
                <div style={{ fontSize: 'var(--font-sm)', color: 'var(--c-text-secondary)' }}>{timeAgo(o.created_at)}</div>
                {o.quoted_price && (
                  <div className="order-card-price" style={{ marginTop: 'var(--space-xs)' }}>
                    {formatCurrency(o.quoted_price, o.currency)}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
      <CustomerTabBar />
    </div>
  )
}
