'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { Sidebar } from '@/components/layout/sidebar'

export default function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { fetchUser, user } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token && !user) {
      fetchUser()
    }
  }, [fetchUser, user])

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-72 p-6 md:p-8">
        {children}
      </main>
    </div>
  )
}