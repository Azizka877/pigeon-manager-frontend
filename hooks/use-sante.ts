'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { santeApi } from '@/lib/api/client'
import type { Soin, Rappel, EvenementAgenda, SanteStats } from '@/types/sante'

/** DRF renvoie soit une liste brute, soit une réponse paginée { results } */
function versListe<T>(data: { results?: T[] } | T[]): T[] {
  return Array.isArray(data) ? data : (data.results ?? [])
}

// ── Soins ───────────────────────────────────────────────────────────────────

export function useSoins() {
  return useQuery({
    queryKey: ['sante', 'soins'],
    queryFn: async () => {
      const { data } = await santeApi.listSoins()
      return versListe<Soin>(data)
    },
    staleTime: 30 * 1000,
  })
}

export function useCreateSoin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Soin>) => {
      const { data: soin } = await santeApi.createSoin(data)
      return soin
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sante'] })
    },
  })
}

export function useUpdateSoin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Soin> }) => {
      const { data: soin } = await santeApi.updateSoin(id, data)
      return soin
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sante'] })
    },
  })
}

export function useDeleteSoin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await santeApi.deleteSoin(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sante'] })
    },
  })
}

// ── Rappels ─────────────────────────────────────────────────────────────────

export function useRappels() {
  return useQuery({
    queryKey: ['sante', 'rappels'],
    queryFn: async () => {
      const { data } = await santeApi.listRappels()
      return versListe<Rappel>(data)
    },
    staleTime: 30 * 1000,
  })
}

export function useCreateRappel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Rappel>) => {
      const { data: rappel } = await santeApi.createRappel(data)
      return rappel
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sante'] })
    },
  })
}

export function useUpdateRappel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Rappel> }) => {
      const { data: rappel } = await santeApi.updateRappel(id, data)
      return rappel
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sante'] })
    },
  })
}

export function useDeleteRappel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await santeApi.deleteRappel(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sante'] })
    },
  })
}

// ── Agenda & statistiques ───────────────────────────────────────────────────

export function useAgenda(debut: string, fin: string) {
  return useQuery({
    queryKey: ['sante', 'agenda', debut, fin],
    queryFn: async () => {
      const { data } = await santeApi.agenda(debut, fin)
      return (data?.evenements ?? []) as EvenementAgenda[]
    },
    staleTime: 60 * 1000,
  })
}

export function useStatsSante() {
  return useQuery({
    queryKey: ['sante', 'stats'],
    queryFn: async () => {
      const { data } = await santeApi.stats()
      return data as SanteStats
    },
    staleTime: 60 * 1000,
    retry: 1,
  })
}
