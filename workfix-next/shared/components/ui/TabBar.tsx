'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ClipboardList, Compass, User, LayoutDashboard, Wallet } from 'lucide-react'
import { t } from '@/shared/lib/i18n'

const CUSTOMER_TABS = [
  { href: '/home', icon: Home, label: () => t('home') },
  { href: '/orders', icon: ClipboardList, label: () => t('my_orders') },
  { href: '/explore', icon: Compass, label: () => t('explore') },
  { href: '/profile', icon: User, label: () => t('profile') },
]

const PROVIDER_TABS = [
  { href: '/provider/dashboard', icon: LayoutDashboard, label: () => t('dashboard') },
  { href: '/provider/orders', icon: ClipboardList, label: () => t('my_orders') },
  { href: '/provider/earnings', icon: Wallet, label: () => t('earnings') },
  { href: '/provider/profile', icon: User, label: () => t('profile') },
]

function TabBarInner({ tabs }: { tabs: typeof CUSTOMER_TABS }) {
  const pathname = usePathname()

  return (
    <div className="tab-bar">
      {tabs.map(tab => {
        const Icon = tab.icon
        const active = pathname === tab.href || pathname.startsWith(tab.href + '/')
        return (
          <Link key={tab.href} href={tab.href} className={`tab-item ${active ? 'active' : ''}`}>
            <span className="tab-icon"><Icon size={22} /></span>
            <span className="tab-label">{tab.label()}</span>
          </Link>
        )
      })}
    </div>
  )
}

export function CustomerTabBar() {
  return <TabBarInner tabs={CUSTOMER_TABS} />
}

export function ProviderTabBar() {
  return <TabBarInner tabs={PROVIDER_TABS} />
}
