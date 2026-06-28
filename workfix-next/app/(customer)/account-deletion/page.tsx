'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAdmin } from '@/features/admin/hooks/useAdmin'
import { useAuthStore } from '@/shared/stores/authStore'
import Header from '@/shared/components/ui/Header'
import Button from '@/shared/components/ui/Button'
import { t } from '@/shared/lib/i18n'

export default function AccountDeletionPage() {
  const router = useRouter()
  useAuth()
  const { requestAccountDeletion } = useAdmin()
  const { logout } = useAuthStore()

  const handleDelete = async () => {
    if (!confirm('Are you sure? This action cannot be undone.')) return
    await requestAccountDeletion()
    await logout()
    router.replace('/login')
  }

  return (
    <div className="screen active">
      <Header title={t('delete_account')} showBack />
      <div className="content content-padded" style={{ textAlign: 'center', paddingTop: 'var(--space-xl)' }}>
        <h3 style={{ marginBottom: 'var(--space-md)' }}>{t('delete_account')}</h3>
        <p style={{ color: 'var(--c-text-secondary)', marginBottom: 'var(--space-lg)' }}>
          Your account will be deactivated for 30 days before permanent deletion.
        </p>
        <Button variant="danger" className="btn-full btn-lg" onClick={handleDelete}>
          {t('delete_account')}
        </Button>
      </div>
    </div>
  )
}
