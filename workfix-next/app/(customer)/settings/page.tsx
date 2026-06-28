'use client'
import { Bell, Mail, MessageCircle, Megaphone } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import Header from '@/shared/components/ui/Header'
import Button from '@/shared/components/ui/Button'
import { showToast } from '@/shared/components/ui/Toast'
import { t } from '@/shared/lib/i18n'

export default function SettingsPage() {
  useAuth()

  const requestNotifications = async () => {
    if (!('Notification' in window)) return
    const permission = await Notification.requestPermission()
    showToast(permission === 'granted' ? t('done') : 'Permission denied', permission === 'granted' ? 'success' : 'error')
  }

  return (
    <div className="screen active">
      <Header title={t('notifications')} showBack />
      <div className="content content-padded">
        <div className="card card-padded" style={{ marginBottom: 'var(--space-md)' }}>
          <Button className="btn-full" onClick={requestNotifications}>
            <Bell size={18} /> {t('notif_enable')}
          </Button>
        </div>
        <div className="settings-list">
          <div className="settings-item">
            <span className="si-icon"><Mail size={20} /></span>
            <span className="si-text">{t('notif_orders')}</span>
            <div className="toggle on" onClick={e => (e.currentTarget as HTMLElement).classList.toggle('on')} />
          </div>
          <div className="settings-item">
            <span className="si-icon"><MessageCircle size={20} /></span>
            <span className="si-text">{t('notif_chat')}</span>
            <div className="toggle on" onClick={e => (e.currentTarget as HTMLElement).classList.toggle('on')} />
          </div>
          <div className="settings-item">
            <span className="si-icon"><Megaphone size={20} /></span>
            <span className="si-text">{t('notif_promo')}</span>
            <div className="toggle" onClick={e => (e.currentTarget as HTMLElement).classList.toggle('on')} />
          </div>
        </div>
      </div>
    </div>
  )
}
