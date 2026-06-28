'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Wrench } from 'lucide-react'
import Button from '@/shared/components/ui/Button'
import Input from '@/shared/components/ui/Input'
import { useAuthStore } from '@/shared/stores/authStore'
import { showToast } from '@/shared/components/ui/Toast'
import { t } from '@/shared/lib/i18n'

export default function LoginPage() {
  const router = useRouter()
  const { login, loading, getDefaultRoute } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await login(email, password)
    if (result.error) {
      showToast(result.error, 'error')
    } else {
      router.replace(useAuthStore.getState().getDefaultRoute())
    }
  }

  return (
    <div className="screen active" style={{ justifyContent: 'center' }}>
      <div className="content-padded" style={{ maxWidth: 400, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <div style={{ marginBottom: 'var(--space-md)' }}><Wrench size={48} /></div>
          <h1 style={{ fontSize: 'var(--font-xxl)', fontWeight: 800, marginBottom: 'var(--space-xs)' }}>WorkFix</h1>
          <p style={{ color: 'var(--c-text-secondary)' }}>{t('welcome_back')}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <Input
            label={t('email')}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="name@example.com"
            dir="ltr"
            autoComplete="email"
          />
          <Input
            label={t('password')}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <Button type="submit" loading={loading} className="btn-full btn-lg">
            {t('login')}
          </Button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 'var(--space-md)' }}>
          <Link href="/forgot-password" style={{ fontSize: 'var(--font-sm)' }}>{t('forgot_password')}</Link>
        </div>
        <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
          <span style={{ color: 'var(--c-text-secondary)', fontSize: 'var(--font-sm)' }}>{t('no_account')} </span>
          <Link href="/register" style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{t('sign_up')}</Link>
        </div>
      </div>
    </div>
  )
}
