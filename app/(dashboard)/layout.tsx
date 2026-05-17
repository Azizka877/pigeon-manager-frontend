// app/(dashboard)/layout.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Sidebar } from '@/components/layout/sidebar'

export default function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const router = useRouter()
  const { fetchUser, user, isAuthenticated, isLoading } = useAuthStore()

  // Vérifie l'authentification au chargement
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token && !user) {
      fetchUser()
    }
  }, [fetchUser, user])

  // Redirige vers login si pas authentifié
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Loader pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00685f]" />
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
      <main className="flex-1 ml-0 md:ml-72 p-6 md:p-8">
        {children}
      </main>
    </div>
  )
}