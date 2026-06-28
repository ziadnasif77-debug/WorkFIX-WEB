'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Button from '@/shared/components/ui/Button'
import Input from '@/shared/components/ui/Input'
import { useAuthStore } from '@/shared/stores/authStore'
import { showToast } from '@/shared/components/ui/Toast'
import { t } from '@/shared/lib/i18n'

export default function ForgotPasswordPage() {
  const { resetPassword, loading } = useAuthStore()
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await resetPassword(email)
    if (result.error) {
      showToast(result.error, 'error')
    } else {
      showToast(t('reset_sent'), 'info')
    }
  }

  return (
    <div className="screen active" style={{ justifyContent: 'center' }}>
      <div className="content-padded" style={{ maxWidth: 400, margin: '0 auto', width: '100%' }}>
        <Link href="/login" style={{ marginBottom: 'var(--space-lg)', display: 'inline-block' }}>
          <ArrowLeft size={20} />
        </Link>
        <h2 style={{ marginBottom: 'var(--space-md)' }}>{t('reset_password')}</h2>
        <form onSubmit={handleSubmit}>
          <Input label={t('email')} type="email" value={email} onChange={e => setEmail(e.target.value)} dir="ltr" autoComplete="email" />
          <Button type="submit" loading={loading} className="btn-full">
            {t('send_reset_link')}
          </Button>
        </form>
      </div>
    </div>
  )
}
