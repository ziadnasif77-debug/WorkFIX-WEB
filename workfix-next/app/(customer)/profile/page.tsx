'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Edit, Bell, Globe, Lock, Download, Trash2, LogOut, ChevronRight, Camera } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAdmin } from '@/features/admin/hooks/useAdmin'
import { useAuthStore } from '@/shared/stores/authStore'
import { CustomerTabBar } from '@/shared/components/ui/TabBar'
import Avatar from '@/shared/components/ui/Avatar'
import Badge from '@/shared/components/ui/Badge'
import Header from '@/shared/components/ui/Header'
import { t, setLanguage, getLanguage } from '@/shared/lib/i18n'
import { uploadAvatar } from '@/features/orders/hooks/useOrders'

export default function ProfilePage() {
  const router = useRouter()
  const { profile, user } = useAuth()
  const { requestDataExport } = useAdmin()
  const { logout } = useAuthStore()

  if (!profile) return null

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && user) {
      await uploadAvatar(file, user.id)
      window.location.reload()
    }
  }

  const handleLogout = async () => {
    if (confirm(t('confirm') + '?')) {
      await logout()
      router.replace('/login')
    }
  }

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as any)
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    window.location.reload()
  }

  return (
    <div className="screen active">
      <Header title={t('profile')} />
      <div className="content content-padded">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <div style={{ position: 'relative', display: 'inline-block', cursor: 'pointer' }}
               onClick={() => document.getElementById('avatar-upload')?.click()}>
            <Avatar name={profile.display_name} src={profile.photo_url} size={80} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: 'var(--c-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Camera size={14} />
            </div>
          </div>
          <input type="file" id="avatar-upload" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
          <h2>{profile.display_name}</h2>
          <p style={{ color: 'var(--c-text-secondary)' }}>{profile.email || ''}</p>
          <Badge variant="primary">{t(profile.role as any)}</Badge>
        </div>

        <div className="settings-list">
          <Link href="/profile/edit" className="settings-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="si-icon"><Edit size={20} /></span>
            <span className="si-text">{t('edit_profile')}</span>
            <span className="si-chevron"><ChevronRight size={18} /></span>
          </Link>
          <Link href="/settings" className="settings-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="si-icon"><Bell size={20} /></span>
            <span className="si-text">{t('notifications')}</span>
            <span className="si-chevron"><ChevronRight size={18} /></span>
          </Link>
          <div className="settings-item">
            <span className="si-icon"><Globe size={20} /></span>
            <span className="si-text">{t('language')}</span>
            <select className="input" style={{ width: 'auto', padding: '6px 10px', fontSize: 'var(--font-sm)' }}
                    value={getLanguage()} onChange={e => handleLanguageChange(e.target.value)}>
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="no">Norsk</option>
              <option value="sv">Svenska</option>
            </select>
          </div>
          <Link href="/settings" className="settings-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="si-icon"><Lock size={20} /></span>
            <span className="si-text">{t('security')}</span>
            <span className="si-chevron"><ChevronRight size={18} /></span>
          </Link>
          <div className="settings-item" onClick={requestDataExport} style={{ cursor: 'pointer' }}>
            <span className="si-icon"><Download size={20} /></span>
            <span className="si-text">{t('export_data')}</span>
            <span className="si-chevron"><ChevronRight size={18} /></span>
          </div>
          <Link href="/account-deletion" className="settings-item" style={{ textDecoration: 'none', color: 'var(--c-danger)' }}>
            <span className="si-icon"><Trash2 size={20} /></span>
            <span className="si-text">{t('delete_account')}</span>
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
      <CustomerTabBar />
    </div>
  )
}
