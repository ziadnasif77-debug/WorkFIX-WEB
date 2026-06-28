'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { Send } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useMessages } from '@/features/chat/hooks/useChat'
import Header from '@/shared/components/ui/Header'
import { t } from '@/shared/lib/i18n'

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { messages, loading, loadMessages, sendMessage } = useMessages(id)
  const [text, setText] = useState('')
  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadMessages() }, [loadMessages])

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!text.trim()) return
    const msg = text
    setText('')
    await sendMessage(msg)
  }

  return (
    <div className="screen active">
      <Header title={t('open_chat')} showBack />
      <div className="chat-container">
        <div className="chat-messages" ref={messagesRef}>
          {messages.map(m => (
            <div key={m.id} className={`msg-bubble ${m.sender_id === user?.id ? 'msg-mine' : m.type === 'system' ? 'msg-system' : 'msg-theirs'}`}>
              {m.text || ''}
              <div className="msg-time">{formatTime(m.created_at)}</div>
            </div>
          ))}
        </div>
        <div className="chat-input-bar">
          <input
            className="chat-input"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={t('type_message')}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSend() } }}
          />
          <div className="chat-send" onClick={handleSend}><Send size={20} /></div>
        </div>
      </div>
    </div>
  )
}
