'use client'
import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Camera, MapPin } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useCategories, createOrder } from '@/features/orders/hooks/useOrders'
import Header from '@/shared/components/ui/Header'
import Input from '@/shared/components/ui/Input'
import Button from '@/shared/components/ui/Button'
import Badge from '@/shared/components/ui/Badge'
import { t } from '@/shared/lib/i18n'

export default function CreateOrderPage() {
  return (
    <Suspense fallback={<div className="screen active"><div className="spinner-center"><div className="spinner" /></div></div>}>
      <CreateOrderContent />
    </Suspense>
  )
}

function CreateOrderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profile } = useAuth()
  const { categories, loadCategories } = useCategories()

  const catId = searchParams.get('categoryId') || ''
  const catName = searchParams.get('categoryName') || ''

  const [categoryId, setCategoryId] = useState(catId)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [budget, setBudget] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [lat, setLat] = useState<number | undefined>()
  const [lng, setLng] = useState<number | undefined>()

  useEffect(() => { loadCategories() }, [loadCategories])

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setPhotos(prev => [...prev, ...files].slice(0, 5))
  }

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx))
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(pos => {
      setLat(pos.coords.latitude)
      setLng(pos.coords.longitude)
      setAddress(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`)
    })
  }

  const handleSubmit = async () => {
    const finalCatId = categoryId || catId
    if (!finalCatId || !title || !description) return
    setLoading(true)
    const orderId = await createOrder({
      categoryId: finalCatId, title, description,
      lat, lng, address,
      budget: budget ? parseFloat(budget) : undefined,
      currency: 'SAR',
      photoFiles: photos
    })
    setLoading(false)
    if (orderId) router.push('/orders')
  }

  return (
    <div className="screen active">
      <Header title={t('new_order')} showBack />
      <div className="content content-padded">
        {catId ? (
          <Badge variant="primary" className="mb-md">{catName}</Badge>
        ) : (
          <div className="input-group">
            <label className="input-label">{t('service_categories')}</label>
            <select className="input" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              <option value="">{t('select_method')}</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name_en || ''}</option>
              ))}
            </select>
          </div>
        )}

        <Input label={t('order_title')} value={title} onChange={e => setTitle(e.target.value)} placeholder={t('order_title_ph')} maxLength={200} />
        <div className="input-group">
          <label className="input-label">{t('description')}</label>
          <textarea className="input" value={description} onChange={e => setDescription(e.target.value)} placeholder={t('description_ph')} maxLength={2000} />
        </div>

        <div className="input-group">
          <label className="input-label">{t('location')}</label>
          <input className="input" value={address} readOnly placeholder={t('location')} />
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 'var(--space-sm)' }} onClick={useMyLocation}>
            <MapPin size={16} /> {t('use_my_location')}
          </button>
        </div>

        <div className="input-group">
          <label className="input-label">{t('photos')}</label>
          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
            <Camera size={16} /> {t('add_photo')}
            <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoSelect} />
          </label>
          {photos.length > 0 && (
            <div className="photo-grid">
              {photos.map((f, i) => (
                <div key={i} className="photo-thumb">
                  <img src={URL.createObjectURL(f)} alt="" />
                  <div className="remove-photo" onClick={() => removePhoto(i)}>x</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Input label={t('budget')} type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="0.00" dir="ltr" />

        <Button className="btn-full btn-lg" loading={loading} onClick={handleSubmit}>
          {t('submit_order')}
        </Button>
      </div>
    </div>
  )
}
