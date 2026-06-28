'use client'
import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import { useRequireRole } from '@/features/auth/hooks/useAuth'
import { useAdmin } from '@/features/admin/hooks/useAdmin'
import Header from '@/shared/components/ui/Header'
import EmptyState from '@/shared/components/ui/EmptyState'
import { t } from '@/shared/lib/i18n'
import type { AuditLog } from '@/shared/types'

export default function AuditLogsPage() {
  useRequireRole(['admin', 'superadmin'])
  const { loadAuditLogs } = useAdmin()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAuditLogs().then(data => { setLogs(data); setLoading(false) })
  }, [loadAuditLogs])

  return (
    <div className="screen active">
      <Header title={t('audit_logs')} showBack />
      <div className="content">
        {loading ? (
          <div className="spinner-center"><div className="spinner" /></div>
        ) : logs.length === 0 ? (
          <EmptyState icon={FileText} title="No audit logs" />
        ) : (
          logs.map(log => (
            <div key={log.id} className="order-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
                <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 'var(--font-sm)' }}>{log.action}</span>
                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--c-text-muted)' }}>
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
              <div style={{ fontSize: 'var(--font-xs)', color: 'var(--c-text-secondary)' }}>
                Actor: {log.actor_id.slice(0, 8)}...
              </div>
              {log.payload && (
                <pre style={{ fontSize: 'var(--font-xs)', color: 'var(--c-text-tertiary)', marginTop: 'var(--space-xs)', overflow: 'auto' }}>
                  {JSON.stringify(log.payload, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
