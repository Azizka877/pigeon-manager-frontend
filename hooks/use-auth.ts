// hooks/use-auth.ts — COMPLET et fonctionnel

import { useAuthStore } from '@/stores/auth-store'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi, colombierApi, billingApi } from '@/lib/api/client'
import type { User, ColombierConfig, Plan } from '@/types'
import { toast } from 'sonner'

export function useAuth() {
  const { user, isLoading, isAuthenticated } = useAuthStore()
  return { user, isLoading, isAuthenticated }
}

// ✅ Profil utilisateur
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
      useAuthStore.setState({ user: data })
      toast.success('Profil mis à jour avec succès')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Erreur lors de la mise à jour')
    },
  })
}

// ✅ Changer le mot de passe
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

// ✅ Supprimer le compte
export function useDeleteAccount() {
  const { user, logout } = useAuthStore()

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Utilisateur non connecté')
      const response = await authApi.deleteAccount(user.id)
      return response.data
    },
    onSuccess: () => {
      logout()
      toast.success('Compte supprimé avec succès')
      window.location.href = '/login'
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Erreur lors de la suppression')
    },
  })
}

// ✅ Configuration du colombier
export function useColombierConfig() {
  return useQuery({
    queryKey: ['colombier-config'],
    queryFn: async () => {
      const response = await colombierApi.getConfig()
      return response.data
    },
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

// ✅ Facturation
export function useBillingPlan() {
  return useQuery({
    queryKey: ['billing-plan'],
    queryFn: async () => {
      const response = await billingApi.getPlan()
      return response.data
    },
  })
}