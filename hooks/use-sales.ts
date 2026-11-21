'use client'

// ─────────────────────────────────────────────────────────────────────────────
// hooks/use-sales.ts — hooks React Query des sorties (ventes, pertes, décès).
// La liste est normalisée : les réponses DRF brutes (tableaux) et paginées
// ({ results }) renvoient le même tableau Sortie[] (même garde que
// usePigeons / useReproductions).
// useCreateSortie conserve la LIBÉRATION AUTOMATIQUE DES CAGES : après la
// création, la cage est libérée si le pigeon l'occupait seul, ou s'il en
// occupait la moitié d'un couple dont le partenaire a déjà quitté le
// colombier (vendu / perdu / décédé).
// ─────────────────────────────────────────────────────────────────────────────

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cagesApi, pigeonsApi, sortiesApi } from '@/lib/api/client'
import type { Cage, CreateSortiePayload, Pigeon, Sortie } from '@/types'

// ─── GET : Liste des sorties ─────────────────────────────────────────────────
export function useSorties() {
  return useQuery<Sortie[], Error>({
    queryKey: ['sorties'],
    queryFn: async () => {
      const { data } = await sortiesApi.list()
      // DRF renvoie soit une liste brute, soit une réponse paginée { results }
      return (Array.isArray(data) ? data : data.results) as Sortie[]
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

// ─── GET : Détail d'une sortie ───────────────────────────────────────────────
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

// ─── POST : Création + libération automatique de la cage ────────────────────
export function useCreateSortie() {
  const queryClient = useQueryClient()

  return useMutation<Sortie, Error, CreateSortiePayload>({
    mutationFn: async (sortieData) => {
      // 1. Crée la sortie
      const { data: sortie } = await sortiesApi.create(sortieData)

      // 2. Récupère TOUTES les cages pour trouver celle qui contient ce pigeon
      const { data: cagesData } = await cagesApi.list()
      const cages = (Array.isArray(cagesData) ? cagesData : cagesData.results) as Cage[]

      // 3. Récupère TOUS les pigeons pour vérifier le statut de l'autre pigeon du couple
      const { data: pigeonsData } = await pigeonsApi.list()
      const pigeons = (Array.isArray(pigeonsData) ? pigeonsData : pigeonsData.results) as Pigeon[]

      // 4. Trouve la cage occupée par ce pigeon
      const cageOccupee = cages.find((cage: Cage) => {
        if (!cage.occupation_actuelle) return false

        // Pigeon seul → libère directement
        if (
          cage.occupation_actuelle.type === 'seul' &&
          cage.occupation_actuelle.pigeon?.id === sortieData.pigeon
        ) {
          return true
        }

        // Couple → vérifie si l'autre pigeon est aussi sorti
        if (cage.occupation_actuelle.type === 'couple' && cage.occupation_actuelle.couple) {
          const couple = cage.occupation_actuelle.couple
          const maleId = String(couple.male_details?.id ?? couple.male ?? '')
          const femelleId = String(couple.femelle_details?.id ?? couple.femelle ?? '')

          // Vérifie si c'est bien ce pigeon qui est dans le couple
          const isThisPigeon = maleId === sortieData.pigeon || femelleId === sortieData.pigeon
          if (!isThisPigeon) return false

          // Vérifie si l'autre pigeon du couple est encore actif
          const autrePigeonId = maleId === sortieData.pigeon ? femelleId : maleId
          const autrePigeon = pigeons.find((p: Pigeon) => p.id === autrePigeonId)

          // Si l'autre pigeon est inactif (vendu, décédé, perdu), on libère.
          // Sinon, la cage reste occupée par le partenaire encore présent.
          return !!autrePigeon && autrePigeon.statut !== 'actif'
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

// ─── DELETE : Supprimer une sortie du registre ───────────────────────────────
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