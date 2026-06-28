'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Star, Clock, MapPin, CheckCircle } from 'lucide-react'
import Header from '@/shared/components/ui/Header'
import Avatar from '@/shared/components/ui/Avatar'
import { t } from '@/shared/lib/i18n'
import { db } from '@/shared/lib/supabase'

export default function ProviderDetailPage() {
  const { providerId } = useParams<{ providerId: string }>()
  const [provider, setProvider] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const { data } = await db.from('provider_profiles')
        .select('*, profiles!inner(display_name, photo_url, email)')
        .eq('id', providerId).single()
      setProvider(data)
    }
    load()
  }, [providerId])

  if (!provider) {
    return <div className="screen active"><div className="spinner-center"><div className="spinner" /></div></div>
  }

  return (
    <div className="screen active">
      <Header title={t('provider')} showBack />
      <div className="content content-padded" style={{ textAlign: 'center' }}>
        <Avatar name={provider.profiles?.display_name} src={provider.profiles?.photo_url} size={80} className="mb-md" />
        <h2>{provider.profiles?.display_name}</h2>
        <div className="stars" style={{ justifyContent: 'center', margin: 'var(--space-sm) 0' }}>
          {[1,2,3,4,5].map(n => (
            <span key={n} className={`star ${n <= Math.round(provider.avg_rating || 4) ? 'filled' : ''}`}>&#9733;</span>
          ))}
        </div>
        <p style={{ color: 'var(--c-text-secondary)' }}>
          {(provider.avg_rating || 4).toFixed(1)} · {provider.rating_count || 0} {t('reviews_count')}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-lg)', margin: 'var(--space-lg) 0' }}>
          <div><Clock size={18} /><br />{Math.round(provider.avg_response_minutes || 30)} {t('min')}</div>
          <div><CheckCircle size={18} /><br />{provider.completed_orders || 0} {t('completed')}</div>
        </div>
        {provider.bio && <p style={{ textAlign: 'left', marginTop: 'var(--space-md)' }}>{provider.bio}</p>}
      </div>
    </div>
  )
}
