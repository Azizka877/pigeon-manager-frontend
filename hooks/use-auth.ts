// hooks/use-auth.ts
'use client'

import { useAuthStore } from '@/stores/auth-store'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi, colombierApi, billingApi } from '@/lib/api/client'
import type { User, ColombierConfig, Plan } from '@/types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// ═══════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════

export function useAuth() {
  const { user, isLoading, isAuthenticated } = useAuthStore()
  
  // Re-fetch le user au montage pour avoir les données fraîches
  useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await authApi.getMe()
      useAuthStore.setState({ user: response.data })
      return response.data
    },
    enabled: isAuthenticated && !isLoading,
    staleTime: 1000 * 60 * 5,
  })

  return { user, isLoading, isAuthenticated }
}

// ═══════════════════════════════════════════════════════════
// PROFIL
// ═══════════════════════════════════════════════════════════

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      if (!user?.id) throw new Error('Utilisateur non connecté')
      const response = await authApi.updateMe(user.id, data)
      return response.data
    },
    onSuccess: (data) => {
      // Mise à jour du store via invalidateQueries + re-fetch
      queryClient.invalidateQueries({ queryKey: ['me'] })
      toast.success('Profil mis à jour avec succès')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Erreur lors de la mise à jour')
    },
  })
}

// ═══════════════════════════════════════════════════════════
// SÉCURITÉ
// ═══════════════════════════════════════════════════════════

export function useChangePassword() {
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (data: { old_password: string; new_password: string }) => {
      if (!user?.id) throw new Error('Utilisateur non connecté')
      const response = await authApi.changePassword(user.id, data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Mot de passe changé avec succès')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Erreur lors du changement de mot de passe')
    },
  })
}

export function useDeleteAccount() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Utilisateur non connecté')
      const response = await authApi.deleteAccount(user.id)
      return response.data
    },
    onSuccess: () => {
      logout()
      router.push('/login')
      toast.success('Compte supprimé avec succès')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Erreur lors de la suppression')
    },
  })
}

// ═══════════════════════════════════════════════════════════
// COLOMBIER
// ═══════════════════════════════════════════════════════════

export function useColombierConfig() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['colombier-config'],
    queryFn: async () => {
      const response = await colombierApi.getConfig()
      return response.data
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  })
}

export function useUpdateColombier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<ColombierConfig>) => {
      const response = await colombierApi.updateConfig(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colombier-config'] })
      toast.success('Colombier mis à jour avec succès')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Erreur lors de la mise à jour')
    },
  })
}

// ═══════════════════════════════════════════════════════════
// FACTURATION
// ═══════════════════════════════════════════════════════════

export function useBillingPlan() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['billing-plan'],
    queryFn: async () => {
      const response = await billingApi.getPlan()
      return response.data
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  })
}

export function useBillingInvoices() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['billing-invoices'],
    queryFn: async () => {
      const response = await billingApi.getInvoices()
      return response.data
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  })
}