'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAuthStore } from '@/shared/stores/authStore'
import Header from '@/shared/components/ui/Header'
import Input from '@/shared/components/ui/Input'
import Button from '@/shared/components/ui/Button'
import { showToast } from '@/shared/components/ui/Toast'
import { t } from '@/shared/lib/i18n'
import { db } from '@/shared/lib/supabase'

export default function EditProfilePage() {
  const router = useRouter()
  const { profile, user } = useAuth()
  const [name, setName] = useState(profile?.display_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')

  const handleSave = async () => {
    if (!user) return
    const { error } = await db.from('profiles').update({
      display_name: name, phone
    }).eq('id', user.id)
    if (error) { showToast(error.message, 'error'); return }
    await useAuthStore.getState().loadUserProfile()
    showToast(t('done'), 'success')
    router.back()
  }

  return (
    <div className="screen active">
      <Header title={t('edit_profile')} showBack />
      <div className="content content-padded">
        <Input label={t('full_name')} value={name} onChange={e => setName(e.target.value)} />
        <Input label={t('phone')} type="tel" value={phone} onChange={e => setPhone(e.target.value)} dir="ltr" />
        <Button className="btn-full" onClick={handleSave}>{t('save')}</Button>
      </div>
    </div>
  )
}
