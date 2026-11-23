'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import { usePathname, useRouter } from 'next/navigation'
import { clearTokenCookie } from '@/lib/auth-cookie'
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
  User,
  Stethoscope,
  CalendarDays,
  Dna,
} from 'lucide-react'
import { useStatsSante } from '@/hooks/use-sante'

const SECTIONS_NAV = [
  {
    titre: 'Pilotage',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/cages', label: 'Volière', icon: Home },
      { href: '/pigeons', label: 'Pigeons', icon: Bird },
    ],
  },
  {
    titre: 'Élevage',
    items: [
      { href: '/couples', label: 'Couples', icon: Heart },
      { href: '/couples/simulation', label: 'Génétique', icon: Dna },
      { href: '/reproductions', label: 'Reproductions', icon: Egg },
      { href: '/sales', label: 'Sorties', icon: ArrowUpRight },
    ],
  },
  {
    titre: 'Suivi',
    items: [
      { href: '/sante', label: 'Santé', icon: Stethoscope },
      { href: '/agenda', label: 'Agenda', icon: CalendarDays },
    ],
  },
  {
    titre: 'Compte',
    items: [{ href: '/profile', label: 'Profil', icon: User }],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  // Onglet actif : le lien qui correspond le PLUS précisément à l'URL gagne.
  // Sans cela, « Couples » (/couples) restait allumé aussi sur /couples/simulation.
  const hrefActif = SECTIONS_NAV.flatMap((section) => section.items.map((item) => item.href))
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0] ?? ''

  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const logout = useAuthStore((s) => s.logout)
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen)
  const { data: statsSante } = useStatsSante()
  const rappelsEnRetard = statsSante?.rappels_en_retard ?? 0

  const handleLogout = () => {
    clearTokenCookie()
    logout()
    router.push('/login')
  }

  const navContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00685f] via-[#005651] to-[#01352f] shadow-md shadow-primary/20">
          <Image
            src="/pigeon-vol.png"
            alt="PigeonManager"
            width={24}
            height={27}
            loading="eager"
            draggable={false}
          />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight text-on-surface">PigeonManager</h1>
          <p className="text-[11px] text-on-surface-variant">Gestion de colombier</p>
        </div>
      </div>

      {/* Utilisateur */}
      {isAuthenticated && user && (
        <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl bg-surface-container-high/70 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00685f] to-[#005651] text-sm font-semibold text-white">
            {user.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-on-surface">{user.username || 'Utilisateur'}</p>
            <p className="text-xs text-on-surface-variant">Éleveur</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {SECTIONS_NAV.map((section) => (
          <div key={section.titre}>
            <p className="px-4 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant/60">
              {section.titre}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = item.href === hrefActif
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'mb-0.5 flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-[#00685f] to-[#005651] text-primary-foreground shadow-md shadow-primary/25'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                  {item.href === '/sante' && rappelsEnRetard > 0 && !isActive && (
                    <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-100 px-1.5 text-[10px] font-bold text-red-600">
                      {rappelsEnRetard}
                    </span>
                  )}
                  {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/90" />}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Déconnexion */}
      {isAuthenticated && (
        <div className="border-t border-outline-variant/50 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-on-surface-variant transition-all hover:bg-error-container hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      )}
    </>
  )

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-surface p-2 shadow-md md:hidden"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 flex-col border-r border-outline-variant bg-surface-container-low md:flex">
        {navContent}
      </aside>

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-outline-variant bg-surface-container-low transition-transform duration-300 md:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {navContent}
      </aside>
    </>
  )
}
