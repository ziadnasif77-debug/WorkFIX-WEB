'use client'
import { useCallback } from 'react'
import { db } from '@/shared/lib/supabase'
import { CONFIG } from '@/shared/lib/config'
import { useAuthStore } from '@/shared/stores/authStore'
import { showToast } from '@/shared/components/ui/Toast'
import type { Profile, Dispute, AuditLog, AdminStats, ReportData } from '@/shared/types'

export function useAdmin() {
  const { user } = useAuthStore()

  const loadUsers = useCallback(async (search = ''): Promise<Profile[]> => {
    let q = db.from('profiles').select('*').order('created_at', { ascending: false }).limit(CONFIG.PAGE_SIZE)
    if (search) q = q.ilike('display_name', `%${search}%`)
    const { data } = await q
    return (data || []) as Profile[]
  }, [])

  const loadDisputes = useCallback(async (filter = 'all'): Promise<Dispute[]> => {
    let q = db.from('disputes').select('*, orders(title)').order('created_at', { ascending: false })
    if (filter !== 'all') q = q.eq('status', filter)
    const { data } = await q
    return (data || []) as Dispute[]
  }, [])

  const banUser = useCallback(async (userId: string, ban: boolean, reason?: string) => {
    const { error } = await db.rpc('admin_ban_user', {
      p_user_id: userId, p_ban: ban, p_reason: reason || null
    })
    if (error) showToast(error.message, 'error')
    else showToast('Done', 'success')
    return !error
  }, [])

  const kycDecision = useCallback(async (uid: string, approved: boolean, reason?: string) => {
    const { error } = await db.rpc('admin_kyc_decision', {
      p_uid: uid, p_approved: approved, p_reason: reason || null
    })
    if (error) showToast(error.message, 'error')
    else showToast('Done', 'success')
    return !error
  }, [])

  const resolveDispute = useCallback(async (disputeId: string, resolution: string, note?: string) => {
    const { error } = await db.rpc('resolve_dispute', {
      p_dispute_id: disputeId, p_resolution: resolution, p_admin_note: note || null
    })
    if (error) showToast(error.message, 'error')
    else showToast('Done', 'success')
    return !error
  }, [])

  const loadStats = useCallback(async (): Promise<AdminStats> => {
    const [users, orders, kyc, disputes] = await Promise.all([
      db.from('profiles').select('*', { count: 'exact', head: true }),
      db.from('orders').select('*', { count: 'exact', head: true }).in('status', ['pending','quoted','confirmed','payment_pending','in_progress']),
      db.from('profiles').select('*', { count: 'exact', head: true }).eq('kyc_status', 'pending'),
      db.from('disputes').select('*', { count: 'exact', head: true }).eq('status', 'open')
    ])
    return {
      totalUsers: users.count || 0,
      activeOrders: orders.count || 0,
      pendingKyc: kyc.count || 0,
      openDisputes: disputes.count || 0
    }
  }, [])

  const loadReportData = useCallback(async (fromDate?: string, toDate?: string): Promise<ReportData> => {
    let q = db.from('payments').select('amount, commission, net_amount, currency, created_at, status')
      .eq('status', 'captured')
    if (fromDate) q = q.gte('created_at', fromDate)
    if (toDate) q = q.lte('created_at', toDate + 'T23:59:59')
    const { data: payments } = await q

    const { count: totalOrders } = await db.from('orders').select('*', { count: 'exact', head: true })
    const { count: cancelledOrders } = await db.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'cancelled')
    const { count: newUsers } = await db.from('profiles').select('*', { count: 'exact', head: true })
    const { count: activeProviders } = await db.from('provider_profiles').select('*', { count: 'exact', head: true }).eq('is_available', true)
    const { count: disputeCount } = await db.from('disputes').select('*', { count: 'exact', head: true })

    const totalRevenue = (payments || []).reduce((s, p: any) => s + (p.amount || 0), 0)
    const totalCommission = (payments || []).reduce((s, p: any) => s + (p.commission || 0), 0)
    const avgOrderValue = payments?.length ? totalRevenue / payments.length : 0
    const disputeRate = totalOrders ? ((disputeCount || 0) / totalOrders * 100).toFixed(1) : 0

    const weeklyData = [0,0,0,0,0,0,0]
    ;(payments || []).forEach((p: any) => {
      const day = new Date(p.created_at).getDay()
      weeklyData[day] += p.amount || 0
    })

    return {
      totalRevenue, totalCommission, totalOrders: totalOrders || 0,
      avgOrderValue, cancelledOrders: cancelledOrders || 0,
      disputeRate, newUsers: newUsers || 0,
      activeProviders: activeProviders || 0, weeklyData
    }
  }, [])

  const loadAuditLogs = useCallback(async (limit = 50): Promise<AuditLog[]> => {
    const { data } = await db.from('audit_logs').select('*')
      .order('created_at', { ascending: false }).limit(limit)
    return (data || []) as AuditLog[]
  }, [])

  const requestDataExport = useCallback(async () => {
    if (!user) return
    await db.from('audit_logs').insert({
      action: 'data_export_requested', actor_id: user.id,
      payload: { user_id: user.id }
    })
    showToast('Export requested', 'info')
  }, [user])

  const requestAccountDeletion = useCallback(async () => {
    if (!user) return
    const { error } = await db.from('profiles').update({
      is_active: false
    }).eq('id', user.id)
    if (!error) {
      await db.from('audit_logs').insert({
        action: 'account_deletion_requested', actor_id: user.id,
        payload: { user_id: user.id, grace_period_days: 30 }
      })
      showToast('Done', 'info')
    }
  }, [user])

  return {
    loadUsers, loadDisputes, banUser, kycDecision, resolveDispute,
    loadStats, loadReportData, loadAuditLogs, requestDataExport, requestAccountDeletion
  }
}
