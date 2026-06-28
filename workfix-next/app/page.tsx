'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/shared/stores/authStore'

export default function RootPage() {
  const router = useRouter()
  const { initialized, initialize, getDefaultRoute } = useAuthStore()

  useEffect(() => {
    if (!initialized) {
      initialize().then(() => {
        const route = useAuthStore.getState().getDefaultRoute()
        router.replace(route)
      })
    } else {
      router.replace(getDefaultRoute())
    }
  }, [initialized, initialize, getDefaultRoute, router])

  return (
    <div className="screen active" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="spinner" />
    </div>
  )
}
