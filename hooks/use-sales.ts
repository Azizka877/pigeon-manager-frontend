'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sortiesApi } from '@/lib/api/client'
import type { Sortie } from '@/types'

export function useSorties() {
  return useQuery({
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
  return useQuery({
    queryKey: ['sorties', id],
    queryFn: async () => {
      const { data } = await sortiesApi.get(id)
      return data as Sortie
    },
    enabled: !!id,
  })
}

// 🔧 CORRECTION : Type de création avec prix en string
export function useCreateSortie() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (sortieData: {
      pigeon: string
      type_sortie: 'vente' | 'deces' | 'perte'
      date_sortie: string
      prix?: string | null           // ← string au lieu de number
      acheteur?: string | null
      cause?: string | null
      circonstances?: string | null
      notes?: string | null
    }) => {
      const { data } = await sortiesApi.create(sortieData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sorties'] })
      queryClient.invalidateQueries({ queryKey: ['pigeons'] })
    },
  })
}

export function useDeleteSortie() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await sortiesApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sorties'] })
    },
  })
}