'use client'
import { useState } from 'react'
import { Camera, CheckCircle, Loader, XCircle, Clipboard } from 'lucide-react'
import { useAuth, useRequireRole } from '@/features/auth/hooks/useAuth'
import { useAuthStore } from '@/shared/stores/authStore'
import { uploadKycDocument } from '@/features/orders/hooks/useOrders'
import Header from '@/shared/components/ui/Header'
import Button from '@/shared/components/ui/Button'
import { showToast } from '@/shared/components/ui/Toast'
import { t } from '@/shared/lib/i18n'
import { db } from '@/shared/lib/supabase'

export default function KycPage() {
  useRequireRole(['provider'])
  const { profile, user } = useAuth()
  const [files, setFiles] = useState<Record<string, File | null>>({ front: null, back: null, license: null })
  const [loading, setLoading] = useState(false)

  const status = profile?.kyc_status || 'not_submitted'
  const StatusIcon = status === 'approved' ? CheckCircle : status === 'pending' ? Loader : status === 'rejected' ? XCircle : Clipboard

  const handleFileSelect = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(prev => ({ ...prev, [type]: e.target.files?.[0] || null }))
  }

  const handleSubmit = async () => {
    if (!files.front || !files.back || !user) {
      showToast('Please upload required documents', 'error')
      return
    }
    setLoading(true)
    const urls: Record<string, string | null> = {}
    if (files.front) urls.id_front = await uploadKycDocument(files.front, 'id_front', user.id)
    if (files.back) urls.id_back = await uploadKycDocument(files.back, 'id_back', user.id)
    if (files.license) urls.trade_license = await uploadKycDocument(files.license, 'trade_license', user.id)

    await db.from('profiles').update({ kyc_status: 'pending', kyc_documents: urls }).eq('id', user.id)
    await useAuthStore.getState().loadUserProfile()
    setLoading(false)
    showToast(t('done'), 'success')
  }

  return (
    <div className="screen active">
      <Header title={t('kyc_title')} showBack />
      <div className="content content-padded">
        <div className={`kyc-banner ${status}`}>
          <StatusIcon size={24} />
          <div>{t(`kyc_${status}` as any)}</div>
        </div>

        {status === 'rejected' && profile?.kyc_rejection_reason && (
          <div className="card card-padded" style={{ marginBottom: 'var(--space-md)', borderColor: 'var(--c-danger)' }}>
            <div style={{ fontWeight: 600, color: 'var(--c-danger)', marginBottom: 'var(--space-xs)' }}>Rejection Reason:</div>
            <p style={{ color: 'var(--c-text-secondary)' }}>{profile.kyc_rejection_reason}</p>
          </div>
        )}

        {status !== 'approved' && (
          <>
            <div className="card card-padded" style={{ marginBottom: 'var(--space-md)' }}>
              {(['front', 'back', 'license'] as const).map(type => (
                <div key={type} className="input-group">
                  <label className="input-label">
                    {type === 'front' ? t('national_id_front') : type === 'back' ? t('national_id_back') : t('trade_license')}
                  </label>
                  <label className="btn btn-secondary btn-full" style={{ cursor: 'pointer' }}>
                    {files[type] ? <><CheckCircle size={16} /> {files[type]!.name}</> : <><Camera size={16} /> {t('upload')}</>}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileSelect(type, e)} />
                  </label>
                </div>
              ))}
            </div>
            <Button className="btn-full btn-lg" loading={loading} onClick={handleSubmit}>
              {t('submit_for_review')}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
