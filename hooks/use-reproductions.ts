'use client'

// ─────────────────────────────────────────────────────────────────────────────
// hooks/use-reproductions.ts — hooks React Query des cycles d'élevage.
// CRUD complet + ponte express (depuis les cartes couple) + baguage des
// jeunes. La liste est normalisée : les réponses DRF brutes (tableaux) et
// paginées ({ results }) renvoient la même enveloppe PaginatedResponse.
// ⚠ Fix : le détail est mis en cache sous ['reproduction', id] — les
// mutations qui le touchent invalident CETTE clé (l'ancien useAjouterJeunes
// invalide ['reproductions', id], qui ne correspondait à rien).
// ─────────────────────────────────────────────────────────────────────────────

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { reproductionsApi } from '@/lib/api/client'
import type {
  CreateReproductionPayload,
  JeuneData,
  PaginatedResponse,
  PigeonMini,
  Reproduction,
} from '@/types'

// ─── GET : Liste des reproductions (optionnellement filtrée par couple) ─────
export function useReproductions(coupleId?: string) {
  return useQuery<PaginatedResponse<Reproduction>, Error>({
    queryKey: ['reproductions', coupleId ?? 'tous'],
    queryFn: async () => {
      const { data } = await reproductionsApi.list()
      const liste = Array.isArray(data) ? data : data.results
      const filtres = coupleId ? liste.filter((r) => r.couple === coupleId) : liste
      return { count: filtres.length, next: null, previous: null, results: filtres }
    },
    staleTime: 30 * 1000,
  })
}

// ─── GET : Détail d'un cycle ─────────────────────────────────────────────────
export function useReproduction(id: string | null) {
  return useQuery<Reproduction, Error>({
    queryKey: ['reproduction', id],
    queryFn: async () => {
      const { data } = await reproductionsApi.get(id!)
      return data
    },
    enabled: !!id,
  })
}

// ─── POST RAPIDE : Ponte express depuis une carte couple ────────────────────
export function useQuickCreateReproduction() {
  const queryClient = useQueryClient()

  return useMutation<
    Reproduction,
    Error,
    { couple: string; date_ponte: string; nombre_oeufs?: number }
  >({
    mutationFn: async (data) => {
      const { data: reproduction } = await reproductionsApi.create(data)
      return reproduction
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reproductions'] })
      queryClient.invalidateQueries({ queryKey: ['couples'] })
    },
  })
}

// ─── POST COMPLET : Création d'un cycle, avec jeunes optionnels ─────────────
export function useCreateReproduction() {
  const queryClient = useQueryClient()

  return useMutation<Reproduction, Error, CreateReproductionPayload>({
    mutationFn: async (data) => {
      const { data: reproduction } = await reproductionsApi.create(data)
      return reproduction
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reproductions'] })
      queryClient.invalidateQueries({ queryKey: ['couples'] })
      queryClient.invalidateQueries({ queryKey: ['pigeons'] })
    },
  })
}

// ─── PUT : Modifier un cycle (dates d'éclosion / sevrage, comptages…) ───────
export function useUpdateReproduction() {
  const queryClient = useQueryClient()

  return useMutation<Reproduction, Error, { id: string; data: Partial<Reproduction> }>({
    mutationFn: async ({ id, data }) => {
      const { data: reproduction } = await reproductionsApi.update(id, data)
      return reproduction
    },
    onSuccess: (reproduction) => {
      queryClient.invalidateQueries({ queryKey: ['reproductions'] })
      queryClient.invalidateQueries({ queryKey: ['reproduction', reproduction.id] })
      queryClient.invalidateQueries({ queryKey: ['couples'] })
    },
  })
}

// ─── DELETE : Supprimer un cycle ─────────────────────────────────────────────
export function useDeleteReproduction() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await reproductionsApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reproductions'] })
      queryClient.invalidateQueries({ queryKey: ['couples'] })
    },
  })
}

// ─── POST : Baguer les jeunes d'une couvée existante ────────────────────────
export function useAjouterJeunes() {
  const queryClient = useQueryClient()

  return useMutation<
    { message: string; jeunes: PigeonMini[] },
    Error,
    { id: string; jeunes: JeuneData[] }
  >({
    mutationFn: async ({ id, jeunes }) => {
      const { data } = await reproductionsApi.ajouterJeunes(id, jeunes)
      return data
    },
    onSuccess: (_, variables) => {
      // La fiche détail lit ['reproduction', id] — plus ['reproductions', id]
      queryClient.invalidateQueries({ queryKey: ['reproduction', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['reproductions'] })
      queryClient.invalidateQueries({ queryKey: ['pigeons'] })
    },
  })
}