'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import {
  LayoutDashboard,
  Home,
  Bird,
  Heart,
  Egg,
  ArrowUpRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/cages', label: 'Volière', icon: Home },
  { href: '/pigeons', label: 'Pigeons', icon: Bird },
  { href: '/couples', label: 'Couples', icon: Heart },
  { href: '/reproductions', label: 'Reproductions', icon: Egg },
  { href: '/sales', label: 'Sorties', icon: ArrowUpRight },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { sidebarOpen, setSidebarOpen } = useUIStore()

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
          <Bird className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-on-surface">PigeonManager</h1>
        </div>
      </div>

      {/* User */}
      <div className="px-6 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
          <span className="text-sm font-semibold text-primary">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-on-surface">{user?.username || 'Utilisateur'}</p>
          <p className="text-xs text-on-surface-variant">Éleveur</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 mt-auto">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-error-container hover:text-destructive transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface shadow-md md:hidden"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-72 h-screen bg-surface-container-low border-r border-outline-variant fixed left-0 top-0 z-30">
        <NavContent />
      </aside>

      {/* Sidebar mobile */}
      <aside
        className={cn(
          'flex flex-col w-72 h-screen bg-surface-container-low border-r border-outline-variant fixed left-0 top-0 z-50 transition-transform md:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <NavContent />
      </aside>
    </>
  )
}