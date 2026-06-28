'use client'
import { useState, useCallback } from 'react'
import { db } from '@/shared/lib/supabase'
import { CONFIG } from '@/shared/lib/config'
import { useAuthStore } from '@/shared/stores/authStore'
import { showToast } from '@/shared/components/ui/Toast'
import type { Order, Quote, Category } from '@/shared/types'

export function useOrders() {
  const { user, profile } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  const loadOrders = useCallback(async (filter = 'all') => {
    if (!user) return
    setLoading(true)
    let q = db.from('orders').select('*, categories(*)')
    const role = profile?.role
    if (role === 'customer') q = q.eq('customer_id', user.id)
    else if (role === 'provider') q = q.eq('provider_id', user.id)
    if (filter === 'active') q = q.in('status', ['pending', 'quoted', 'confirmed', 'payment_pending', 'in_progress'])
    else if (filter === 'completed') q = q.in('status', ['completed', 'closed'])
    else if (filter === 'cancelled') q = q.eq('status', 'cancelled')
    q = q.order('created_at', { ascending: false }).limit(CONFIG.PAGE_SIZE)
    const { data } = await q
    setOrders(data || [])
    setLoading(false)
  }, [user, profile])

  return { orders, loading, loadOrders }
}

export function useOrder() {
  const [order, setOrder] = useState<Order | null>(null)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(false)

  const loadOrder = useCallback(async (id: string) => {
    setLoading(true)
    const { data: orderData } = await db.from('orders').select('*, categories(*)').eq('id', id).single()
    setOrder(orderData)
    const { data: quotesData } = await db.from('quotes')
      .select('*, profiles:provider_id(display_name, photo_url)')
      .eq('order_id', id).order('created_at')
    setQuotes(quotesData || [])
    setLoading(false)
  }, [])

  return { order, quotes, loading, loadOrder }
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])

  const loadCategories = useCallback(async () => {
    const { data } = await db.from('categories').select('*').eq('is_active', true).order('sort_order')
    setCategories(data || [])
  }, [])

  return { categories, loadCategories }
}

export async function createOrder(formData: {
  categoryId: string; title: string; description: string;
  lat?: number; lng?: number; address?: string; geohash?: string;
  budget?: number; currency?: string; photoFiles?: File[]
}) {
  let photoUrls: string[] = []
  if (formData.photoFiles?.length) {
    photoUrls = await uploadOrderPhotos(formData.photoFiles)
  }

  const { data, error } = await db.rpc('create_order', {
    p_category_id: formData.categoryId,
    p_title: formData.title,
    p_description: formData.description,
    p_lat: formData.lat,
    p_lng: formData.lng,
    p_address: formData.address,
    p_geohash: formData.geohash || 'u4pru',
    p_budget: formData.budget || null,
    p_currency: formData.currency || 'SAR'
  })

  if (error) { showToast(error.message, 'error'); return null }

  if (data && photoUrls.length > 0) {
    await db.from('orders').update({ photo_urls: photoUrls }).eq('id', data)
  }

  showToast('Done', 'success')
  return data
}

export async function submitQuote(orderId: string, price: number, estimatedHours?: number, notes?: string) {
  const { error } = await db.rpc('submit_quote', {
    p_order_id: orderId, p_price: price,
    p_estimated_hours: estimatedHours || null, p_notes: notes || null
  })
  if (error) { showToast(error.message, 'error'); return false }
  showToast('Done', 'success')
  return true
}

export async function acceptQuote(orderId: string, quoteId: string) {
  const { error } = await db.rpc('accept_quote', { p_order_id: orderId, p_quote_id: quoteId })
  if (error) { showToast(error.message, 'error'); return false }
  showToast('Done', 'success')
  return true
}

export async function cancelOrder(orderId: string) {
  const { error } = await db.rpc('cancel_order', { p_order_id: orderId })
  if (error) { showToast(error.message, 'error'); return false }
  showToast('Done', 'success')
  return true
}

export async function markComplete(orderId: string) {
  const { error } = await db.rpc('mark_order_complete', { p_order_id: orderId })
  if (error) { showToast(error.message, 'error'); return false }
  showToast('Done', 'success')
  return true
}

export async function confirmCompletion(orderId: string) {
  const { error } = await db.rpc('confirm_completion', { p_order_id: orderId })
  if (error) { showToast(error.message, 'error'); return false }
  showToast('Done', 'success')
  return true
}

export async function handleSubmitReview(orderId: string, rating: number, comment?: string) {
  const { error } = await db.rpc('submit_review', {
    p_order_id: orderId, p_rating: rating, p_comment: comment || null
  })
  if (error) { showToast(error.message, 'error'); return false }
  showToast('Done', 'success')
  return true
}

export async function handleOpenDispute(orderId: string, reason: string) {
  const { error } = await db.rpc('open_dispute', {
    p_order_id: orderId, p_reason: reason
  })
  if (error) { showToast(error.message, 'error'); return false }
  showToast('Done', 'success')
  return true
}

export async function processPayment(orderId: string, method: string, order: Order, country: string) {
  const countryConfig = CONFIG.SUPPORTED_COUNTRIES[country] || CONFIG.SUPPORTED_COUNTRIES.SA
  const vatRate = countryConfig.vat
  const subtotal = order.quoted_price || 0
  const vat = subtotal * vatRate
  const total = subtotal + vat
  const commissionAmount = subtotal * CONFIG.DEFAULT_COMMISSION_RATE
  const netAmount = subtotal - commissionAmount

  const { data: payment, error } = await db.from('payments').insert({
    order_id: orderId,
    customer_id: order.customer_id,
    provider_id: order.provider_id,
    amount: total,
    commission: commissionAmount,
    net_amount: netAmount,
    status: 'initiated',
    method,
    currency: order.currency
  }).select().single()

  if (error) { showToast('Payment failed', 'error'); return false }

  await db.from('orders').update({
    status: 'payment_pending',
    payment_status: 'initiated',
    payment_method: method,
    commission_amount: commissionAmount,
    net_amount: netAmount,
    final_price: total
  }).eq('id', orderId)

  setTimeout(async () => {
    await db.from('payments').update({ status: 'captured', captured_at: new Date().toISOString() }).eq('id', payment.id)
    await db.from('orders').update({ status: 'in_progress', payment_status: 'captured' }).eq('id', orderId)
    showToast('Payment successful', 'success')
  }, 2000)

  return true
}

async function uploadImage(file: File, bucket = 'photos', folder = '') {
  const ext = file.name.split('.').pop()
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const { data, error } = await db.storage.from(bucket).upload(path, file, {
    cacheControl: '3600', upsert: false
  })
  if (error) { showToast('Upload error', 'error'); return null }
  const { data: urlData } = db.storage.from(bucket).getPublicUrl(data.path)
  return urlData.publicUrl
}

async function uploadOrderPhotos(files: File[]) {
  const urls: string[] = []
  for (const file of files) {
    const url = await uploadImage(file, 'order-photos')
    if (url) urls.push(url)
  }
  return urls
}

export async function uploadKycDocument(file: File, type: string, userId: string) {
  return uploadImage(file, 'kyc-documents', `${userId}/${type}`)
}

export async function uploadAvatar(file: File, userId: string) {
  const url = await uploadImage(file, 'avatars', userId)
  if (url) {
    await db.from('profiles').update({ photo_url: url }).eq('id', userId)
  }
  return url
}

export function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  if (!lat1 || !lng1 || !lat2 || !lng2) return 999
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function calculateDispatchScore(
  provider: { avg_rating?: number; avg_response_minutes?: number; acceptance_rate?: number; completed_orders?: number; location_lat?: number; location_lng?: number; has_active_boost?: boolean },
  orderLat: number, orderLng: number
) {
  const ratingScore = provider.avg_rating || CONFIG.BAYESIAN_M
  const responseScore = Math.max(0, 1 - (provider.avg_response_minutes || 30) / 120)
  const acceptanceScore = provider.acceptance_rate || 0.8
  const completedScore = Math.min(1, (provider.completed_orders || 0) / 50)
  const distanceKm = haversine(orderLat, orderLng, provider.location_lat || 0, provider.location_lng || 0)
  const distanceScore = Math.max(0, 1 - distanceKm / 50)

  let boostMultiplier = 1.0
  if (provider.has_active_boost) boostMultiplier = 1.20
  if ((provider.completed_orders || 0) < 10) boostMultiplier *= 1.10

  const score = (
    ratingScore * 0.30 +
    responseScore * 0.20 +
    acceptanceScore * 0.15 +
    completedScore * 0.10 +
    distanceScore * 0.25
  ) * boostMultiplier

  return { score: Math.round(score * 1000) / 1000, distanceKm: Math.round(distanceKm * 10) / 10 }
}
