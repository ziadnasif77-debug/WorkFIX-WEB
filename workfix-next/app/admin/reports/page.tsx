'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRequireRole } from '@/features/auth/hooks/useAuth'
import { useAdmin } from '@/features/admin/hooks/useAdmin'
import { useAuth } from '@/features/auth/hooks/useAuth'
import Header from '@/shared/components/ui/Header'
import { t } from '@/shared/lib/i18n'
import { CONFIG } from '@/shared/lib/config'
import type { ReportData } from '@/shared/types'

function formatCurrency(amount: number, currency = 'SAR') {
  return new Intl.NumberFormat('en', { style: 'currency', currency }).format(amount)
}

export default function AdminReportsPage() {
  useRequireRole(['admin', 'superadmin'])
  const { profile } = useAuth()
  const { loadReportData } = useAdmin()
  const [period, setPeriod] = useState('this_month')
  const [data, setData] = useState<ReportData | null>(null)

  const currency = CONFIG.SUPPORTED_COUNTRIES[profile?.country || 'SA']?.currency || 'SAR'
  const dayLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  const loadPeriod = useCallback(async (p: string) => {
    const now = new Date()
    let fromDate: string, toDate: string

    if (p === 'this_month') {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      toDate = now.toISOString().split('T')[0]
    } else if (p === 'last_month') {
      fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
      toDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
    } else if (p === 'three_months') {
      fromDate = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().split('T')[0]
      toDate = now.toISOString().split('T')[0]
    } else {
      fromDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
      toDate = now.toISOString().split('T')[0]
    }

    const rd = await loadReportData(fromDate, toDate)
    setData(rd)
  }, [loadReportData])

  useEffect(() => { loadPeriod(period) }, [period, loadPeriod])

  const rd = data || {} as ReportData

  return (
    <div className="screen active">
      <Header title={t('reports')} showBack />
      <div className="content content-padded">
        <div className="chip-row" style={{ padding: 0, marginBottom: 'var(--space-md)' }}>
          {['this_month','last_month','three_months','this_year'].map(p => (
            <div key={p} className={`chip ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
              {t(p as any)}
            </div>
          ))}
        </div>

        <div className="stats-grid" style={{ marginBottom: 'var(--space-md)' }}>
          <div className="stat-card"><div className="stat-value">{formatCurrency(rd.totalRevenue || 0, currency)}</div><div className="stat-label">{t('revenue')}</div></div>
          <div className="stat-card"><div className="stat-value">{formatCurrency(rd.totalCommission || 0, currency)}</div><div className="stat-label">{t('commission')}</div></div>
          <div className="stat-card"><div className="stat-value">{rd.totalOrders || 0}</div><div className="stat-label">{t('total_orders_label')}</div></div>
          <div className="stat-card"><div className="stat-value">{formatCurrency(rd.avgOrderValue || 0, currency)}</div><div className="stat-label">{t('avg_order_value')}</div></div>
        </div>

        <div className="stats-grid" style={{ marginBottom: 'var(--space-lg)', gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="stat-card"><div className="stat-value">{rd.cancelledOrders || 0}</div><div className="stat-label">{t('cancelled')}</div></div>
          <div className="stat-card"><div className="stat-value">{rd.disputeRate || 0}%</div><div className="stat-label">{t('disputes')}</div></div>
          <div className="stat-card"><div className="stat-value">{rd.newUsers || 0}</div><div className="stat-label">{t('total_users')}</div></div>
          <div className="stat-card"><div className="stat-value">{rd.activeProviders || 0}</div><div className="stat-label">{t('provider')}</div></div>
        </div>

        <div className="card card-padded">
          <h3 style={{ marginBottom: 'var(--space-md)' }}>{t('revenue')}</h3>
          <div className="bar-chart">
            {(rd.weeklyData || [0,0,0,0,0,0,0]).map((val: number, i: number) => {
              const maxVal = Math.max(...(rd.weeklyData || [1]))
              const h = maxVal > 0 ? (val / maxVal * 100) : 5
              return (
                <div key={i} className="bar-col">
                  <div className="bar-fill" style={{ height: `${Math.max(h, 4)}%` }} />
                  <div className="bar-label">{dayLabels[i]}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
