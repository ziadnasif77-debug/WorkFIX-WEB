import { create } from 'zustand'
import { db } from '@/shared/lib/supabase'
import type { Profile, ProviderProfile, UserRole } from '@/shared/types'

interface AuthState {
  user: { id: string; email?: string } | null
  profile: Profile | null
  providerProfile: ProviderProfile | null
  loading: boolean
  initialized: boolean

  initialize: () => Promise<void>
  loadUserProfile: () => Promise<void>
  login: (email: string, password: string) => Promise<{ error?: string }>
  register: (name: string, email: string, password: string, role: UserRole) => Promise<{ error?: string; needsConfirmation?: boolean }>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
  getDefaultRoute: () => string
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  providerProfile: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    const { data: { session } } = await db.auth.getSession()
    if (session?.user) {
      set({ user: { id: session.user.id, email: session.user.email } })
      await get().loadUserProfile()
    }
    set({ initialized: true })

    db.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        set({ user: { id: session.user.id, email: session.user.email } })
        await get().loadUserProfile()
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, profile: null, providerProfile: null })
      }
    })
  },

  loadUserProfile: async () => {
    const { data: { user } } = await db.auth.getUser()
    if (!user) return
    set({ user: { id: user.id, email: user.email } })

    const { data: profile } = await db.from('profiles').select('*').eq('id', user.id).single()
    set({ profile })

    if (profile?.role === 'provider') {
      const { data: pp } = await db.from('provider_profiles').select('*').eq('id', user.id).single()
      set({ providerProfile: pp })
    }
  },

  login: async (email, password) => {
    set({ loading: true })
    const { error } = await db.auth.signInWithPassword({ email, password })
    set({ loading: false })
    if (error) return { error: error.message }
    await get().loadUserProfile()
    return {}
  },

  register: async (name, email, password, role) => {
    set({ loading: true })
    const { data, error } = await db.auth.signUp({
      email, password,
      options: { data: { display_name: name, role } }
    })
    set({ loading: false })
    if (error) return { error: error.message }
    if (data.user && !data.user.identities?.length) {
      return { error: 'Email already registered' }
    }
    if (data.session) {
      await get().loadUserProfile()
      return {}
    }
    return { needsConfirmation: true }
  },

  logout: async () => {
    await db.auth.signOut()
    set({ user: null, profile: null, providerProfile: null })
  },

  resetPassword: async (email) => {
    set({ loading: true })
    const { error } = await db.auth.resetPasswordForEmail(email)
    set({ loading: false })
    if (error) return { error: error.message }
    return {}
  },

  getDefaultRoute: () => {
    const { user, profile } = get()
    if (!user) return '/login'
    const role = profile?.role
    if (role === 'admin' || role === 'superadmin') return '/admin/dashboard'
    if (role === 'provider') return '/provider/dashboard'
    return '/home'
  },
}))
