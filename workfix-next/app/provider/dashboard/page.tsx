'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Inbox, Star, ArrowRight, Loader, XCircle, Clipboard } from 'lucide-react'
import { useAuth, useRequireRole } from '@/features/auth/hooks/useAuth'
import { useProvider } from '@/features/provider/hooks/useProvider'
import { ProviderTabBar } from '@/shared/components/ui/TabBar'
import Avatar from '@/shared/components/ui/Avatar'
import EmptyState from '@/shared/components/ui/EmptyState'
import Header from '@/shared/components/ui/Header'
import { t } from '@/shared/lib/i18n'
import { db } from '@/shared/lib/supabase'
import type { ProviderDashboardData, Order } from '@/shared/types'

export default function ProviderDashboardPage() {
  const { profile, providerProfile } = useAuth()
  useRequireRole(['provider'])
  const { loadDashboardData, loadIncomingRequests } = useProvider()
  const [stats, setStats] = useState<ProviderDashboardData>({ pendingQuotes: 0, activeJobs: 0, earnedToday: 0 })
  const [requests, setRequests] = useState<Order[]>([])

  useEffect(() => {
    loadDashboardData().then(setStats)
    loadIncomingRequests().then(setRequests)
  }, [loadDashboardData, loadIncomingRequests])

  const toggleAvailability = async () => {
    if (!providerProfile) return
    const newVal = !providerProfile.is_available
    await db.from('provider_profiles').update({ is_available: newVal }).eq('id', profile?.id)
    window.location.reload()
  }

  return (
    <div className="screen active">
      <Header title={t('dashboard')} action={
        <Link href="/provider/profile"><Avatar name={profile?.display_name} size={32} /></Link>
      } />
      <div className="content content-padded">
        <div className="card card-padded" style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600 }}>{providerProfile?.is_available ? t('available') : t('unavailable')}</span>
          <div className={`toggle ${providerProfile?.is_available ? 'on' : ''}`} onClick={toggleAvailability} />
        </div>

        <div className="stats-grid" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="stat-card"><div className="stat-value">{stats.pendingQuotes}</div><div className="stat-label">{t('pending_quotes')}</div></div>
          <div className="stat-card"><div className="stat-value">{stats.activeJobs}</div><div className="stat-label">{t('active_jobs')}</div></div>
          <div className="stat-card"><div className="stat-value" style={{ color: 'var(--c-success)' }}>{stats.earnedToday}</div><div className="stat-label">{t('earned_today')}</div></div>
          <div className="stat-card">
            <div className="stat-value">{providerProfile?.avg_rating?.toFixed(1) || '4.0'}</div>
            <div className="stat-label"><Star size={14} /> {providerProfile?.rating_count || 0} {t('reviews_count')}</div>
          </div>
        </div>

        {profile?.kyc_status !== 'approved' && (
          <div className={`kyc-banner ${profile?.kyc_status || 'not_submitted'}`}>
            <span>{profile?.kyc_status === 'pending' ? <Loader size={24} /> : profile?.kyc_status === 'rejected' ? <XCircle size={24} /> : <Clipboard size={24} />}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{t('kyc_title')}</div>
              <div style={{ fontSize: 'var(--font-sm)' }}>{t(`kyc_${profile?.kyc_status || 'not_submitted'}` as any)}</div>
            </div>
            <Link href="/provider/kyc" className="btn btn-sm btn-secondary"><ArrowRight size={16} /></Link>
          </div>
        )}

        <div className="section-header" style={{ paddingInline: 0 }}>
          <div className="section-title">{t('incoming_requests')}</div>
        </div>
        {requests.length === 0 ? (
          <EmptyState icon={Inbox} title={t('no_orders_desc')} />
        ) : (
          requests.map(o => (
            <Link key={o.id} href={`/provider/quote/${o.id}`} className="order-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="order-card-title">{o.title}</div>
              <div className="order-card-meta" style={{ fontSize: 'var(--font-sm)', color: 'var(--c-text-secondary)' }}>
                {o.location_address || ''}
              </div>
            </Link>
          ))
        )}
      </div>
      <ProviderTabBar />
    </div>
  )
}
