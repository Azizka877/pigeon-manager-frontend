'use client'

import { useAuthStore } from '@/stores/auth-store'
import { Bird } from 'lucide-react'

export function Header() {
  const { user } = useAuthStore()

  return (
    <header className="h-16 bg-surface border-b border-outline-variant flex items-center justify-end px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
          <Bird className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-medium text-on-surface">{user?.username}</span>
      </div>
    </header>
  )
}