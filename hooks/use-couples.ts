'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { couplesApi, cagesApi } from '@/lib/api/client'
import type { Couple, PaginatedResponse, Cage } from '@/types'
import type { AxiosResponse } from 'axios'

// ─── GET : Liste des couples ───
export function useCouples() {
  return useQuery<PaginatedResponse<Couple>, Error>({
    queryKey: ['couples'],
    queryFn: async () => {
      const response: AxiosResponse<PaginatedResponse<Couple>> = await couplesApi.list()
      return response.data
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

// ─── GET : Détail d'un couple ───
export function useCouple(id: string) {
  return useQuery<Couple, Error>({
    queryKey: ['couples', id],
    queryFn: async () => {
      const response: AxiosResponse<Couple> = await couplesApi.get(id)
      return response.data
    },
    enabled: !!id,
  })
}

// ─── POST : Créer un couple ───
export function useCreateCouple() {
  const queryClient = useQueryClient()

  return useMutation<Couple, Error, { male: string; femelle: string }>({
    mutationFn: async (data) => {
      const response: AxiosResponse<Couple> = await couplesApi.create(data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couples'] })
      queryClient.invalidateQueries({ queryKey: ['pigeons'] })
    },
  })
}

// ─── PATCH : Mettre à jour un couple ───
export function useUpdateCouple() {
  const queryClient = useQueryClient()

  return useMutation<Couple, Error, { id: string; data: Partial<Couple> }>({
    mutationFn: async ({ id, data }) => {
      // 🔧 Utilise partialUpdate (PATCH) au lieu de update (PUT)
      const response: AxiosResponse<Couple> = await couplesApi.partialUpdate(id, data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['couples'] })
      queryClient.invalidateQueries({ queryKey: ['couples', data.id] })
    },
  })
}

// ─── 🔧 SEPARER UN COUPLE (rompre) ───
export function useSeparateCouple() {
  const queryClient = useQueryClient()

  return useMutation<Couple, Error, { id: string; date_rupture?: string }>({
    mutationFn: async ({ id, date_rupture }) => {
      const today = date_rupture || new Date().toISOString().split('T')[0]

      // 🔧 Utilise partialUpdate (PATCH) pour ne modifier que statut et date_rupture
      const response: AxiosResponse<Couple> = await couplesApi.partialUpdate(id, {
        statut: 'rompu',
        date_rupture: today,
      })

      // 2. Récupère TOUTES les cages pour trouver celle du couple
      const { data: cagesData } = await cagesApi.list()
      const cages = (cagesData.results || cagesData) as Cage[]

      // 3. Trouve la cage occupée par ce couple
      const cageOccupee = cages.find((cage: Cage) => {
        if (!cage.occupation_actuelle) return false
        if (cage.occupation_actuelle.type === 'couple' && cage.occupation_actuelle.couple?.id === id) {
          return true
        }
        return false
      })

      // 4. Libère la cage si trouvée
      if (cageOccupee) {
        await cagesApi.liberer(cageOccupee.id)
      }

      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couples'] })
      queryClient.invalidateQueries({ queryKey: ['pigeons'] })
      queryClient.invalidateQueries({ queryKey: ['cages'] })
      queryClient.invalidateQueries({ queryKey: ['cage-history'] })
    },
  })
}

// ─── DELETE : Supprimer un couple ───
export function useDeleteCouple() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await couplesApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couples'] })
    },
  })
}