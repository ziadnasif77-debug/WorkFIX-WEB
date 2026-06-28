import type { Metadata, Viewport } from 'next'
import '@/shared/styles/globals.css'
import ToastContainer from '@/shared/components/ui/Toast'

export const metadata: Metadata = {
  title: 'WorkFix',
  description: 'On-demand home services marketplace',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#2563eb',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          {children}
        </div>
        <ToastContainer />
      </body>
    </html>
  )
}
