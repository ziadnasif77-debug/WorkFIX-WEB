'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Smartphone } from 'lucide-react'
import Button from '@/shared/components/ui/Button'
import { t } from '@/shared/lib/i18n'

export default function PhoneVerifyPage() {
  const router = useRouter()
  const [otp, setOtp] = useState(['','','','','',''])
  const [countdown, setCountdown] = useState(59)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleInput = (idx: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1)
    const newOtp = [...otp]
    newOtp[idx] = digit
    setOtp(newOtp)
    if (digit && idx < 5) inputRefs.current[idx + 1]?.focus()
    if (idx === 5 && digit) {
      // verify OTP
    }
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  return (
    <div className="screen active" style={{ justifyContent: 'center' }}>
      <div className="content-padded" style={{ maxWidth: 400, margin: '0 auto', width: '100%', textAlign: 'center' }}>
        <div style={{ marginBottom: 'var(--space-md)' }}><Smartphone size={48} /></div>
        <h2 style={{ marginBottom: 'var(--space-sm)' }}>{t('otp_title')}</h2>
        <p style={{ color: 'var(--c-text-secondary)', marginBottom: 'var(--space-lg)' }}>{t('enter_otp')}</p>
        <div className="otp-row">
          {[0,1,2,3,4,5].map(i => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el }}
              className="otp-cell"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otp[i]}
              onChange={e => handleInput(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
            />
          ))}
        </div>
        <div style={{ color: 'var(--c-text-secondary)', marginBottom: 'var(--space-lg)' }}>
          {countdown > 0 ? `${t('resend_in')} 0:${countdown.toString().padStart(2, '0')}` : ''}
        </div>
        <Button variant="ghost" className="btn-full" disabled={countdown > 0}>{t('resend_code')}</Button>
        <Button variant="secondary" className="btn-full" style={{ marginTop: 'var(--space-sm)' }} onClick={() => router.back()}>
          {t('back')}
        </Button>
      </div>
    </div>
  )
}
