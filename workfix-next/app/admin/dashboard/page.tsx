'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Scale, BarChart2, FileText, Globe, LogOut, ChevronRight } from 'lucide-react'
import { useAuth, useRequireRole } from '@/features/auth/hooks/useAuth'
import { useAdmin } from '@/features/admin/hooks/useAdmin'
import { useAuthStore } from '@/shared/stores/authStore'
import Avatar from '@/shared/components/ui/Avatar'
import Header from '@/shared/components/ui/Header'
import { t, setLanguage, getLanguage } from '@/shared/lib/i18n'
import type { AdminStats } from '@/shared/types'

export default function AdminDashboardPage() {
  const router = useRouter()
  useRequireRole(['admin', 'superadmin'])
  const { profile } = useAuth()
  const { loadStats } = useAdmin()
  const { logout } = useAuthStore()
  const [stats, setStats] = useState<AdminStats | null>(null)

  useEffect(() => { loadStats().then(setStats) }, [loadStats])

  const handleLogout = async () => {
    if (confirm(t('confirm') + '?')) {
      await logout()
      router.replace('/login')
    }
  }

  return (
    <div className="screen active">
      <Header title={t('admin_panel')} action={
        <Link href="/profile"><Avatar name={profile?.display_name} size={32} /></Link>
      } />
      <div className="content content-padded">
        <div className="stats-grid" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="stat-card">
            <div className="stat-value">{stats?.totalUsers ?? <div className="spinner" style={{ margin: '0 auto', width: 16, height: 16, borderWidth: 2 }} />}</div>
            <div className="stat-label">{t('total_users')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.activeOrders ?? <div className="spinner" style={{ margin: '0 auto', width: 16, height: 16, borderWidth: 2 }} />}</div>
            <div className="stat-label">{t('active_orders')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.pendingKyc ?? <div className="spinner" style={{ margin: '0 auto', width: 16, height: 16, borderWidth: 2 }} />}</div>
            <div className="stat-label">{t('pending_kyc')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.openDisputes ?? <div className="spinner" style={{ margin: '0 auto', width: 16, height: 16, borderWidth: 2 }} />}</div>
            <div className="stat-label">{t('open_disputes')}</div>
          </div>
        </div>

        <div className="settings-list">
          <Link href="/admin/users" className="settings-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="si-icon"><Users size={20} /></span>
            <span className="si-text">{t('users')}</span>
            <span className="si-chevron"><ChevronRight size={18} /></span>
          </Link>
          <Link href="/admin/disputes" className="settings-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="si-icon"><Scale size={20} /></span>
            <span className="si-text">{t('disputes')}</span>
            <span className="si-chevron"><ChevronRight size={18} /></span>
          </Link>
          <Link href="/admin/reports" className="settings-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="si-icon"><BarChart2 size={20} /></span>
            <span className="si-text">{t('reports')}</span>
            <span className="si-chevron"><ChevronRight size={18} /></span>
          </Link>
          <Link href="/admin/audit-logs" className="settings-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="si-icon"><FileText size={20} /></span>
            <span className="si-text">{t('audit_logs')}</span>
            <span className="si-chevron"><ChevronRight size={18} /></span>
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
          <div className="settings-item" style={{ color: 'var(--c-danger)', cursor: 'pointer' }} onClick={handleLogout}>
            <span className="si-icon"><LogOut size={20} /></span>
            <span className="si-text">{t('logout')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
