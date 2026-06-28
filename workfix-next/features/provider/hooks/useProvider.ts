'use client'
import { useState, useCallback } from 'react'
import { db } from '@/shared/lib/supabase'
import { useAuthStore } from '@/shared/stores/authStore'
import type { Order, EarningsData, ProviderDashboardData } from '@/shared/types'

export function useProvider() {
  const { user } = useAuthStore()
  const [flags, setFlags] = useState<Record<string, boolean>>({})

  const loadFlags = useCallback(async () => {
    const { data } = await db.from('feature_flags').select('*')
    if (data) {
      const flagMap: Record<string, boolean> = {}
      data.forEach((f: any) => { flagMap[f.key] = f.enabled })
      setFlags(flagMap)
    }
  }, [])

  const loadIncomingRequests = useCallback(async (): Promise<Order[]> => {
    const { data } = await db.from('orders').select('*, categories(*)')
      .in('status', ['pending', 'quoted']).order('created_at', { ascending: false }).limit(20)
    return (data || []) as Order[]
  }, [])

  const loadEarnings = useCallback(async (): Promise<EarningsData> => {
    if (!user) return { available: 0, pending: 0, history: [] }
    const { data } = await db.from('payments').select('*')
      .eq('provider_id', user.id).eq('status', 'captured').order('created_at', { ascending: false })
    const history = data || []
    const available = history.reduce((s: number, p: any) => s + (p.net_amount || 0), 0)
    return { available, pending: 0, history: history as any }
  }, [user])

  const loadDashboardData = useCallback(async (): Promise<ProviderDashboardData> => {
    if (!user) return { pendingQuotes: 0, activeJobs: 0, earnedToday: 0 }
    const today = new Date().toISOString().split('T')[0]

    const [quotes, jobs, earnings] = await Promise.all([
      db.from('quotes').select('*', { count: 'exact', head: true })
        .eq('provider_id', user.id).eq('status', 'pending'),
      db.from('orders').select('*', { count: 'exact', head: true })
        .eq('provider_id', user.id).eq('status', 'in_progress'),
      db.from('payments').select('net_amount')
        .eq('provider_id', user.id).eq('status', 'captured')
        .gte('created_at', today + 'T00:00:00')
    ])

    return {
      pendingQuotes: quotes.count || 0,
      activeJobs: jobs.count || 0,
      earnedToday: (earnings.data || []).reduce((s: number, p: any) => s + (p.net_amount || 0), 0)
    }
  }, [user])

  return { flags, loadFlags, loadIncomingRequests, loadEarnings, loadDashboardData }
}
