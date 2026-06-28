'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Edit, Clipboard, Globe, Crown, LogOut, ChevronRight, Clock } from 'lucide-react'
import { useAuth, useRequireRole } from '@/features/auth/hooks/useAuth'
import { useAuthStore } from '@/shared/stores/authStore'
import { ProviderTabBar } from '@/shared/components/ui/TabBar'
import Avatar from '@/shared/components/ui/Avatar'
import Badge from '@/shared/components/ui/Badge'
import Header from '@/shared/components/ui/Header'
import { t, setLanguage, getLanguage } from '@/shared/lib/i18n'

export default function ProviderProfilePage() {
  const router = useRouter()
  useRequireRole(['provider'])
  const { profile, providerProfile } = useAuth()
  const { logout } = useAuthStore()

  if (!profile) return null

  const handleLogout = async () => {
    if (confirm(t('confirm') + '?')) {
      await logout()
      router.replace('/login')
    }
  }

  return (
    <div className="screen active">
      <Header title={t('profile')} />
      <div className="content content-padded">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          <Avatar name={profile.display_name} src={profile.photo_url} size={80} className="mb-md" />
          <h2>{profile.display_name}</h2>
          <div className="stars" style={{ justifyContent: 'center', margin: 'var(--space-sm) 0' }}>
            {[1,2,3,4,5].map(n => (
              <span key={n} className={`star ${n <= Math.round(providerProfile?.avg_rating || 4) ? 'filled' : ''}`}>&#9733;</span>
            ))}
          </div>
          <span style={{ color: 'var(--c-text-secondary)', fontSize: 'var(--font-sm)' }}>
            {providerProfile?.avg_rating?.toFixed(1) || '4.0'} · {providerProfile?.rating_count || 0} {t('reviews_count')}
          </span>
          <div style={{ marginTop: 'var(--space-sm)' }}>
            <Badge variant="info"><Clock size={14} /> {t('response_time')} {Math.round(providerProfile?.avg_response_minutes || 30)} {t('minutes')}</Badge>
          </div>
        </div>

        <div className="settings-list">
          <Link href="/profile/edit" className="settings-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="si-icon"><Edit size={20} /></span>
            <span className="si-text">{t('edit_profile')}</span>
            <span className="si-chevron"><ChevronRight size={18} /></span>
          </Link>
          <Link href="/provider/kyc" className="settings-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="si-icon"><Clipboard size={20} /></span>
            <span className="si-text">{t('kyc_title')}</span>
            <Badge variant={profile.kyc_status === 'approved' ? 'success' : profile.kyc_status === 'pending' ? 'info' : 'warning'}>
              {t(`kyc_${profile.kyc_status || 'not_submitted'}` as any)}
            </Badge>
          </Link>
          <div className="settings-item">
            <span className="si-icon"><Globe size={20} /></span>
            <span className="si-text">{t('language')}</span>
            <select className="input" style={{ width: 'auto', padding: '6px 10px', fontSize: 'var(--font-sm)' }}
                    value={getLanguage()} onChange={e => { setLanguage(e.target.value as any); window.location.reload() }}>
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="no">Norsk</option>
              <option value="sv">Svenska</option>
            </select>
          </div>
          <Link href="/provider/subscription" className="settings-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="si-icon"><Crown size={20} /></span>
            <span className="si-text">{t('subscription')}</span>
            <span className="si-chevron"><ChevronRight size={18} /></span>
          </Link>
          <div className="settings-item" style={{ color: 'var(--c-danger)', cursor: 'pointer' }} onClick={handleLogout}>
            <span className="si-icon"><LogOut size={20} /></span>
            <span className="si-text">{t('logout')}</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)', color: 'var(--c-text-muted)', fontSize: 'var(--font-xs)' }}>
          {t('app_version')} 1.0.0
        </div>
      </div>
      <ProviderTabBar />
    </div>
  )
}
