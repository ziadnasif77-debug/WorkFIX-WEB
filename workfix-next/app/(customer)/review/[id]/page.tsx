'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Wrench } from 'lucide-react'
import { handleSubmitReview } from '@/features/orders/hooks/useOrders'
import Header from '@/shared/components/ui/Header'
import Button from '@/shared/components/ui/Button'
import { showToast } from '@/shared/components/ui/Toast'
import { t } from '@/shared/lib/i18n'

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const handleSubmit = async () => {
    if (rating === 0) { showToast('Please select a rating', 'error'); return }
    const ok = await handleSubmitReview(id, rating, comment)
    if (ok) router.back()
  }

  return (
    <div className="screen active">
      <Header title={t('rate_service')} showBack />
      <div className="content content-padded" style={{ textAlign: 'center' }}>
        <div className="avatar avatar-xl" style={{ margin: 'var(--space-xl) auto var(--space-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Wrench size={32} />
        </div>
        <h3 style={{ marginBottom: 'var(--space-lg)' }}>{t('rate_provider')}</h3>
        <div className="stars" style={{ justifyContent: 'center', marginBottom: 'var(--space-lg)' }}>
          {[1,2,3,4,5].map(n => (
            <div key={n} className={`star ${n <= rating ? 'filled' : ''}`} onClick={() => setRating(n)} style={{ cursor: 'pointer', fontSize: 32 }}>
              &#9733;
            </div>
          ))}
        </div>
        <div className="input-group" style={{ textAlign: 'start' }}>
          <textarea className="input" value={comment} onChange={e => setComment(e.target.value)} placeholder={t('leave_comment')} />
        </div>
        <Button className="btn-full btn-lg" onClick={handleSubmit}>{t('submit_review')}</Button>
      </div>
    </div>
  )
}
