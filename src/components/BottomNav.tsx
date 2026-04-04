'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/', label: 'Today', icon: '◉' },
  { href: '/gold-ideas', label: 'Ideas', icon: '💡' },
  { href: '/concepts', label: 'Concepts', icon: '▦' },
  { href: '/tracker', label: 'Tracker', icon: '☰' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="glass fixed bottom-0 left-0 right-0 z-50 border-t border-[#2A2D37]"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
      <div className="flex items-center justify-around px-2 pt-2">
        {tabs.map(tab => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs transition-colors ${
                isActive ? 'text-[#10B981]' : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
