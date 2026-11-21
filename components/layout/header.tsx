'use client'

import { useAuthStore } from '@/stores/auth-store'

export function Header() {
  const user = useAuthStore((s) => s.user)
  const initiale = user?.username?.charAt(0).toUpperCase() || 'U'

  const dateDuJour = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-outline-variant bg-surface/80 px-6 backdrop-blur">
      <p className="hidden text-sm capitalize text-on-surface-variant sm:block">{dateDuJour}</p>

      <div className="flex items-center gap-2 rounded-full border border-outline-variant/60 bg-surface-container-low py-1 pl-1 pr-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#00685f] to-[#005651] text-xs font-semibold text-white">
          {initiale}
        </div>
        <span className="text-sm font-medium text-on-surface">{user?.username}</span>
      </div>
    </header>
  )
}