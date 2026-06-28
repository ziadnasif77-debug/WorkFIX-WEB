'use client'
import { useEffect, useState } from 'react'
import { Star, MapPin, Clock } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCategories } from '@/features/orders/hooks/useOrders'
import { CustomerTabBar } from '@/shared/components/ui/TabBar'
import Header from '@/shared/components/ui/Header'
import Avatar from '@/shared/components/ui/Avatar'
import Badge from '@/shared/components/ui/Badge'
import { t } from '@/shared/lib/i18n'
import { db } from '@/shared/lib/supabase'
import { CONFIG } from '@/shared/lib/config'
import { calculateDispatchScore } from '@/features/orders/hooks/useOrders'
import Link from 'next/link'

interface ScoredProvider {
  id: string
  profiles?: { display_name?: string; photo_url?: string }
  avg_rating?: number
  location_lat?: number
  location_lng?: number
  avg_response_minutes?: number
  score: number
  distanceKm: number
}

export default function ExplorePage() {
  useAuth()
  const { categories, loadCategories } = useCategories()
  const [providers, setProviders] = useState<ScoredProvider[]>([])

  useEffect(() => { loadCategories() }, [loadCategories])

  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    const { data: providerData } = await db.from('provider_profiles')
      .select('*, profiles!inner(display_name, photo_url, kyc_status)')
      .eq('is_available', true).eq('is_verified', true)
    if (!providerData?.length) return

    const userLat = 24.7136
    const userLng = 46.6753

    const { data: boosts } = await db.from('boosts').select('provider_id').eq('active', true)
    const boostedIds = new Set((boosts || []).map((b: any) => b.provider_id))

    const scored = providerData.map((p: any) => {
      const s = calculateDispatchScore({ ...p, has_active_boost: boostedIds.has(p.id) }, userLat, userLng)
      return { ...p, ...s }
    })
    scored.sort((a: any, b: any) => b.score - a.score)
    setProviders(scored.slice(0, CONFIG.DISPATCH_CAP))
  }

  return (
    <div className="screen active">
      <Header title={t('explore')} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="chip-row" style={{ padding: 'var(--space-sm)' }}>
          {categories.map(c => (
            <div key={c.id} className="chip">{c.name_en || ''}</div>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', background: 'var(--c-surface)' }}>
          {providers.length === 0 ? (
            <div style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--c-text-secondary)' }}>
              {t('no_orders_desc')}
            </div>
          ) : providers.map(p => (
            <Link key={p.id} href={`/explore/${p.id}`} className="provider-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Avatar name={p.profiles?.display_name} size={40} />
              <div className="provider-info">
                <div className="provider-name">{p.profiles?.display_name || t('provider')}</div>
                <div className="provider-meta">
                  <span><Star size={14} /> {(p.avg_rating || 4).toFixed(1)}</span>
                  <span><MapPin size={14} /> {p.distanceKm || '—'} {t('km')}</span>
                  <span><Clock size={14} /> {Math.round(p.avg_response_minutes || 30)} {t('min')}</span>
                </div>
              </div>
              <Badge variant="primary">{((p.score || 0) * 100).toFixed(0)}</Badge>
            </Link>
          ))}
        </div>
      </div>
      <CustomerTabBar />
    </div>
  )
}
