'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/lib/api/client'
import { setTokenCookie, clearTokenCookie } from '@/lib/auth-cookie'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  fetchUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username, password) => {
        set({ isLoading: true })
        try {
          const { data: tokens } = await authApi.login(username, password)
          localStorage.setItem('access_token', tokens.access)
          localStorage.setItem('refresh_token', tokens.refresh)
          setTokenCookie(tokens.access) // le proxy Next dépend de ce cookie

          const { data: user } = await authApi.getMe()

          set({ user, isAuthenticated: !!user, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        clearTokenCookie()
        set({ user: null, isAuthenticated: false })
      },

      fetchUser: async () => {
        const token = localStorage.getItem('access_token')
        if (!token) {
          set({ user: null, isAuthenticated: false })
          return
        }

        set({ isLoading: true })
        try {
          const { data: user } = await authApi.getMe()
          set({ user, isAuthenticated: !!user, isLoading: false })
        } catch (error) {
          // Token invalide même après refresh → purge complète
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          clearTokenCookie()
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)