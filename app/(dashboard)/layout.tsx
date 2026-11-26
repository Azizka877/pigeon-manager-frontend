'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { useAuthStore } from '@/stores/auth-store'
import { Sidebar } from '@/components/layout/sidebar'
import { setTokenCookie } from '@/lib/auth-cookie'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { fetchUser, user, isAuthenticated, isLoading } = useAuthStore()

  // Vérifie l'authentification au chargement
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token && !user) {
      fetchUser()
    }
  }, [fetchUser, user])

  // Resynchronise le cookie à chaque montage (couvre le F5)
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) setTokenCookie(token)
  }, [])

  // Redirige vers login si pas authentifié, en mémorisant la page courante
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isLoading, isAuthenticated, router, pathname])

  // Loader pendant la vérification
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-surface">
        <div className="pm-flotte">
          <Image src="/pigeon-vol.png" alt="Chargement" width={80} height={88} priority draggable={false} />
        </div>
        <p className="animate-pulse text-sm text-on-surface-variant">Chargement de votre volière…</p>
      </div>
    )
  }

  // Si pas authentifié, ne rend rien
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main className="min-w-0 ml-0 flex-1 p-6 md:ml-72 md:p-8">
        {children}
      </main>
    </div>
  )
}