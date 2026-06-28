'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, Wrench } from 'lucide-react'
import Button from '@/shared/components/ui/Button'
import Input from '@/shared/components/ui/Input'
import { useAuthStore } from '@/shared/stores/authStore'
import { showToast } from '@/shared/components/ui/Toast'
import { t } from '@/shared/lib/i18n'
import type { UserRole } from '@/shared/types'

export default function RegisterPage() {
  const router = useRouter()
  const { register, loading } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [role, setRole] = useState<UserRole | ''>('')
  const [agreed, setAgreed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) { showToast('Please select a role', 'error'); return }
    if (password !== confirm) { showToast('Passwords do not match', 'error'); return }
    if (!agreed) { showToast('Please agree to terms', 'error'); return }

    const result = await register(name, email, password, role as UserRole)
    if (result.error) {
      showToast(result.error, 'error')
    } else if (result.needsConfirmation) {
      showToast('Check your email to confirm your account', 'info')
    } else {
      router.replace(useAuthStore.getState().getDefaultRoute())
    }
  }

  return (
    <div className="screen active">
      <div className="header">
        <Link href="/login" className="header-back"><Wrench size={20} /></Link>
        <div className="header-title">{t('create_account')}</div>
      </div>
      <div className="content content-padded" style={{ maxWidth: 400, margin: '0 auto', width: '100%' }}>
        <form onSubmit={handleSubmit}>
          <Input label={t('full_name')} value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
          <Input label={t('email')} type="email" value={email} onChange={e => setEmail(e.target.value)} dir="ltr" autoComplete="email" />
          <Input label={t('password')} type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
          <Input label={t('confirm_password')} type="password" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" />

          <div className="input-group">
            <label className="input-label" style={{ marginBottom: 'var(--space-sm)' }}>
              {t('looking_for_service')} {t('or')} {t('offering_service')}?
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <div
                className="card card-padded card-hover"
                style={{
                  flex: 1, textAlign: 'center', cursor: 'pointer',
                  borderColor: role === 'customer' ? 'var(--c-primary)' : undefined,
                  background: role === 'customer' ? 'var(--c-primary-light)' : undefined,
                }}
                onClick={() => setRole('customer')}
              >
                <div style={{ marginBottom: 'var(--space-xs)' }}><Home size={28} /></div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{t('looking_for_service')}</div>
              </div>
              <div
                className="card card-padded card-hover"
                style={{
                  flex: 1, textAlign: 'center', cursor: 'pointer',
                  borderColor: role === 'provider' ? 'var(--c-primary)' : undefined,
                  background: role === 'provider' ? 'var(--c-primary-light)' : undefined,
                }}
                onClick={() => setRole('provider')}
              >
                <div style={{ marginBottom: 'var(--space-xs)' }}><Wrench size={28} /></div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{t('offering_service')}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--c-primary)' }} />
            <label style={{ fontSize: 'var(--font-sm)', color: 'var(--c-text-secondary)' }}>{t('agree_terms')}</label>
          </div>

          <Button type="submit" loading={loading} className="btn-full btn-lg">
            {t('create_account')}
          </Button>
        </form>
      </div>
    </div>
  )
}
