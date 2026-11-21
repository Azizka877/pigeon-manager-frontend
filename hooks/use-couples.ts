'use client'

// ─────────────────────────────────────────────────────────────────────────────
// hooks/use-couples.ts — hooks React Query des couples d'élevage.
// Logique métier conservée : CRUD complet, PATCH partiel (partialUpdate),
// et SÉPARATION qui rompt l'union puis libère automatiquement la cage
// occupée par le couple (via cagesApi.liberer).
// ─────────────────────────────────────────────────────────────────────────────

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cagesApi, couplesApi } from '@/lib/api/client'
import type { Cage, Couple, PaginatedResponse } from '@/types'

// ─── GET : Liste des couples ────────────────────────────────────────────────
export function useCouples() {
  return useQuery<PaginatedResponse<Couple>, Error>({
    queryKey: ['couples'],
    queryFn: async () => {
      const { data } = await couplesApi.list()
      return data
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

// ─── GET : Détail d'un couple ───────────────────────────────────────────────
export function useCouple(id: string) {
  return useQuery<Couple, Error>({
    queryKey: ['couples', id],
    queryFn: async () => {
      const { data } = await couplesApi.get(id)
      return data
    },
    enabled: !!id,
  })
}

// ─── POST : Former un couple ────────────────────────────────────────────────
export function useCreateCouple() {
  const queryClient = useQueryClient()

  return useMutation<Couple, Error, { male: string; femelle: string }>({
    mutationFn: async (data) => {
      const { data: couple } = await couplesApi.create(data)
      return couple
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couples'] })
      queryClient.invalidateQueries({ queryKey: ['pigeons'] })
    },
  })
}

// ─── PATCH : Mettre à jour un couple ────────────────────────────────────────
export function useUpdateCouple() {
  const queryClient = useQueryClient()

  return useMutation<Couple, Error, { id: string; data: Partial<Couple> }>({
    mutationFn: async ({ id, data }) => {
      // PATCH et non PUT : on ne modifie que les champs envoyés
      const { data: couple } = await couplesApi.partialUpdate(id, data)
      return couple
    },
    onSuccess: (couple) => {
      queryClient.invalidateQueries({ queryKey: ['couples'] })
      queryClient.invalidateQueries({ queryKey: ['couples', couple.id] })
    },
  })
}

// ─── SÉPARER UN COUPLE (rompre) ─────────────────────────────────────────────
export function useSeparateCouple() {
  const queryClient = useQueryClient()

  return useMutation<Couple, Error, { id: string; date_rupture?: string }>({
    mutationFn: async ({ id, date_rupture }) => {
      const aujourdhui = date_rupture || new Date().toISOString().split('T')[0]

      // 1. PATCH : ne modifie que statut et date_rupture
      const { data: couple } = await couplesApi.partialUpdate(id, {
        statut: 'rompu',
        date_rupture: aujourdhui,
      })

      // 2. Récupère TOUTES les cages pour trouver celle du couple
      const { data: cagesData } = await cagesApi.list()
      const cages = (Array.isArray(cagesData) ? cagesData : cagesData.results) as Cage[]

      // 3. Trouve la cage occupée par ce couple
      const cageOccupee = cages.find(
        (cage) =>
          cage.occupation_actuelle?.type === 'couple' &&
          cage.occupation_actuelle.couple?.id === id,
      )

      // 4. Libère la cage si trouvée
      if (cageOccupee) {
        await cagesApi.liberer(cageOccupee.id)
      }

      return couple
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couples'] })
      queryClient.invalidateQueries({ queryKey: ['pigeons'] })
      queryClient.invalidateQueries({ queryKey: ['cages'] })
      queryClient.invalidateQueries({ queryKey: ['cage-history'] })
    },
  })
}

// ─── DELETE : Supprimer un couple ───────────────────────────────────────────
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