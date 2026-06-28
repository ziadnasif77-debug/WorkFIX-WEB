'use client'
import { useEffect, useState, useCallback } from 'react'
import { Search, Check, Users } from 'lucide-react'
import { useRequireRole } from '@/features/auth/hooks/useAuth'
import { useAdmin } from '@/features/admin/hooks/useAdmin'
import Header from '@/shared/components/ui/Header'
import Avatar from '@/shared/components/ui/Avatar'
import Badge from '@/shared/components/ui/Badge'
import Button from '@/shared/components/ui/Button'
import EmptyState from '@/shared/components/ui/EmptyState'
import { t } from '@/shared/lib/i18n'
import type { Profile } from '@/shared/types'

export default function AdminUsersPage() {
  useRequireRole(['admin', 'superadmin'])
  const { loadUsers, banUser, kycDecision } = useAdmin()
  const [users, setUsers] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const doSearch = useCallback(async (q: string) => {
    setLoading(true)
    const data = await loadUsers(q)
    setUsers(data)
    setLoading(false)
  }, [loadUsers])

  useEffect(() => { doSearch('') }, [doSearch])

  useEffect(() => {
    const timer = setTimeout(() => doSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search, doSearch])

  const roleBadge: Record<string, 'neutral' | 'primary' | 'warning' | 'danger'> = {
    customer: 'neutral', provider: 'primary', admin: 'warning', superadmin: 'danger'
  }

  return (
    <div className="screen active">
      <Header title={t('users')} showBack />
      <div className="search-bar">
        <span className="search-icon"><Search size={18} /></span>
        <input placeholder={t('search_users')} value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="content">
        {loading ? (
          <div className="spinner-center"><div className="spinner" /></div>
        ) : users.length === 0 ? (
          <EmptyState icon={Users} title="No users found" />
        ) : (
          users.map(u => (
            <div key={u.id} className="order-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <Avatar name={u.display_name} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{u.display_name}</div>
                  <div style={{ fontSize: 'var(--font-sm)', color: 'var(--c-text-secondary)' }}>{u.email || u.phone || ''}</div>
                </div>
                <Badge variant={roleBadge[u.role] || 'neutral'}>{t(u.role as any)}</Badge>
                {u.is_banned && <Badge variant="danger">{t('banned')}</Badge>}
              </div>
              <div style={{ marginTop: 'var(--space-sm)', display: 'flex', gap: 'var(--space-sm)' }}>
                {u.role === 'provider' && u.kyc_status === 'pending' && (
                  <Button size="sm" variant="primary" onClick={async () => {
                    await kycDecision(u.id, true)
                    doSearch(search)
                  }}><Check size={14} /> KYC</Button>
                )}
                {!u.is_banned ? (
                  <Button size="sm" variant="danger" onClick={async () => {
                    const reason = prompt(t('ban_reason'))
                    if (reason !== null) {
                      await banUser(u.id, true, reason)
                      doSearch(search)
                    }
                  }}>{t('ban_user')}</Button>
                ) : (
                  <Button size="sm" variant="primary" onClick={async () => {
                    await banUser(u.id, false)
                    doSearch(search)
                  }}>{t('unban_user')}</Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
