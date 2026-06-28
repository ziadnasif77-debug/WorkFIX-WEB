'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/shared/stores/authStore'

export function useAuth(requireAuth = true) {
  const router = useRouter()
  const { user, profile, providerProfile, loading, initialized, initialize, getDefaultRoute } = useAuthStore()

  useEffect(() => {
    if (!initialized) initialize()
  }, [initialized, initialize])

  useEffect(() => {
    if (initialized && requireAuth && !user) {
      router.replace('/login')
    }
  }, [initialized, requireAuth, user, router])

  return { user, profile, providerProfile, loading, initialized }
}

export function useRequireRole(roles: string[]) {
  const { profile, initialized } = useAuth(true)
  const router = useRouter()
  const { getDefaultRoute } = useAuthStore()

  useEffect(() => {
    if (initialized && profile && !roles.includes(profile.role)) {
      router.replace(getDefaultRoute())
    }
  }, [initialized, profile, roles, router, getDefaultRoute])

  return { profile, initialized }
}
