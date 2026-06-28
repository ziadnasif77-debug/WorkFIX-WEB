'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { handleOpenDispute } from '@/features/orders/hooks/useOrders'
import Header from '@/shared/components/ui/Header'
import Button from '@/shared/components/ui/Button'
import { showToast } from '@/shared/components/ui/Toast'
import { t } from '@/shared/lib/i18n'

export default function DisputePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [reason, setReason] = useState('')

  const handleSubmit = async () => {
    if (!reason || reason.length < 10) { showToast('Please describe the issue', 'error'); return }
    const ok = await handleOpenDispute(id, reason)
    if (ok) router.back()
  }

  return (
    <div className="screen active">
      <Header title={t('open_dispute')} showBack />
      <div className="content content-padded">
        <div className="input-group">
          <label className="input-label">{t('description')}</label>
          <textarea className="input" value={reason} onChange={e => setReason(e.target.value)} placeholder={t('description_ph')} />
        </div>
        <Button variant="danger" className="btn-full btn-lg" onClick={handleSubmit}>{t('open_dispute')}</Button>
      </div>
    </div>
  )
}
