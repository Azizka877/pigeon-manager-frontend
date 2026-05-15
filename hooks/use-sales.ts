'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sortiesApi, cagesApi, pigeonsApi } from '@/lib/api/client'
import type { Sortie, Pigeon, Cage, PaginatedResponse } from '@/types'
import type { AxiosResponse } from 'axios'

export function useSorties() {
  return useQuery<Sortie[], Error>({
    queryKey: ['sorties'],
    queryFn: async () => {
      const { data } = await sortiesApi.list()
      return (data.results || data) as Sortie[]
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

export function useSortie(id: string) {
  return useQuery<Sortie, Error>({
    queryKey: ['sorties', id],
    queryFn: async () => {
      const { data } = await sortiesApi.get(id)
      return data as Sortie
    },
    enabled: !!id,
  })
}

// 🔧 LIBÉRATION AUTOMATIQUE DE LA CAGE
export function useCreateSortie() {
  const queryClient = useQueryClient()

  return useMutation<Sortie, Error, {
    pigeon: string
    type_sortie: 'vente' | 'deces' | 'perte'
    date_sortie: string
    prix?: string | null
    acheteur?: string | null
    cause?: string | null
    circonstances?: string | null
    notes?: string | null
  }>({
    mutationFn: async (sortieData) => {
      // 1. Crée la sortie
      const { data: sortie } = await sortiesApi.create(sortieData)

      // 2. Récupère TOUTES les cages pour trouver celle qui contient ce pigeon
      const { data: cagesData } = await cagesApi.list()
      const cages = (cagesData.results || cagesData) as Cage[]

      // 3. Récupère TOUS les pigeons pour vérifier le statut de l'autre pigeon du couple
      const { data: pigeonsData } = await pigeonsApi.list()
      const pigeons = (pigeonsData.results || pigeonsData) as Pigeon[]

      // 4. Trouve la cage occupée par ce pigeon
      const cageOccupee = cages.find((cage: Cage) => {
        if (!cage.occupation_actuelle) return false

        // Pigeon seul → libère directement
        if (cage.occupation_actuelle.type === 'seul' && cage.occupation_actuelle.pigeon?.id === sortieData.pigeon) {
          return true
        }

        // Couple → vérifie si l'autre pigeon est aussi sorti
        if (cage.occupation_actuelle.type === 'couple' && cage.occupation_actuelle.couple) {
          const couple = cage.occupation_actuelle.couple
          const maleId = couple.male_details?.id || couple.male
          const femelleId = couple.femelle_details?.id || couple.femelle

          // Vérifie si c'est bien ce pigeon qui est dans le couple
          const isThisPigeon = maleId === sortieData.pigeon || femelleId === sortieData.pigeon
          if (!isThisPigeon) return false

          // Vérifie si l'autre pigeon du couple est encore actif
          const autrePigeonId = maleId === sortieData.pigeon ? femelleId : maleId
          const autrePigeon = pigeons.find((p: Pigeon) => p.id === autrePigeonId)

          // Si l'autre pigeon est inactif (vendu, décédé, perdu), on libère
          // Sinon, la cage reste occupée
          if (autrePigeon && autrePigeon.statut !== 'actif') {
            return true
          }

          // L'autre pigeon est encore actif, ne libère PAS
          return false
        }

        return false
      })

      // 5. Si une cage doit être libérée, appeler l'API
      if (cageOccupee) {
        await cagesApi.liberer(cageOccupee.id)
      }

      return sortie
    },
    onSuccess: () => {
      // Invalide TOUTES les queries concernées pour rafraîchir l'UI
      queryClient.invalidateQueries({ queryKey: ['sorties'] })
      queryClient.invalidateQueries({ queryKey: ['pigeons'] })
      queryClient.invalidateQueries({ queryKey: ['cages'] })
      queryClient.invalidateQueries({ queryKey: ['cage-history'] })
      queryClient.invalidateQueries({ queryKey: ['couples'] })
    },
  })
}

export function useDeleteSortie() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await sortiesApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sorties'] })
    },
  })
}