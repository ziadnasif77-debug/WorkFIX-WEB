'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { db } from '@/shared/lib/supabase'
import { useAuthStore } from '@/shared/stores/authStore'
import { showToast } from '@/shared/components/ui/Toast'
import type { Message, Conversation } from '@/shared/types'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useConversations() {
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)

  const loadConversations = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await db.from('conversations').select('*')
      .contains('participants', [user.id]).order('last_message_at', { ascending: false })
    setConversations(data || [])
    setLoading(false)
  }, [user])

  return { conversations, loading, loadConversations }
}

export function useMessages(conversationId: string | null) {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const loadMessages = useCallback(async () => {
    if (!conversationId) return
    setLoading(true)
    const { data } = await db.from('messages').select('*')
      .eq('conversation_id', conversationId).order('created_at', { ascending: true }).limit(50)
    setMessages(data || [])
    setLoading(false)
  }, [conversationId])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !user || !conversationId) return
    const { error } = await db.from('messages').insert({
      conversation_id: conversationId, sender_id: user.id, text: text.trim(), type: 'text'
    })
    if (error) { showToast(error.message, 'error'); return }
    await db.from('conversations').update({
      last_message: text.trim(), last_message_at: new Date().toISOString()
    }).eq('id', conversationId)
  }, [user, conversationId])

  useEffect(() => {
    if (!conversationId) return

    channelRef.current = db.channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, payload => {
        setMessages(prev => [...prev, payload.new as Message])
      }).subscribe()

    return () => {
      if (channelRef.current) {
        db.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [conversationId])

  return { messages, loading, loadMessages, sendMessage }
}

export function useOrderRealtime(orderId: string | null, onUpdate: (order: any) => void) {
  useEffect(() => {
    if (!orderId) return
    const channel = db.channel(`order:${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'orders',
        filter: `id=eq.${orderId}`
      }, payload => {
        onUpdate(payload.new)
      }).subscribe()

    return () => { db.removeChannel(channel) }
  }, [orderId, onUpdate])
}
