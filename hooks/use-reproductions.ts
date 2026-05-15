// hooks/use-reproductions.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reproductionsApi } from '@/lib/api/client'
import type { Reproduction, CreateReproductionPayload } from '@/types'

// ─── GET : Liste des reproductions ───
export function useReproductions() {
  return useQuery<Reproduction[], Error>({
    queryKey: ['reproductions'],
    queryFn: async () => {
      const response = await reproductionsApi.list()
      return response.data.results || []
    },
    staleTime: 1000 * 60 * 2,
  })
}

// ─── GET : Détail d'une reproduction ───
export function useReproduction(id: string | null) {
  return useQuery<Reproduction, Error>({
    queryKey: ['reproduction', id],
    queryFn: async () => {
      const response = await reproductionsApi.get(id!)
      return response.data
    },
    enabled: !!id,
  })
}

// ─── POST : Créer une reproduction ───
export function useCreateReproduction() {
  const queryClient = useQueryClient()

  return useMutation<Reproduction, Error, CreateReproductionPayload>({
    mutationFn: async (data) => {
      const response = await reproductionsApi.create(data as any)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reproductions'] })
      queryClient.invalidateQueries({ queryKey: ['pigeons'] })
    },
  })
}

// ─── PUT : Modifier une reproduction ───
export function useUpdateReproduction() {
  const queryClient = useQueryClient()

  return useMutation<Reproduction, Error, { id: string; data: Partial<Reproduction> }>({
    mutationFn: async ({ id, data }) => {
      const response = await reproductionsApi.update(id, data)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reproductions'] })
      queryClient.invalidateQueries({ queryKey: ['reproduction', variables.id] })
    },
  })
}

// ─── DELETE : Supprimer une reproduction ───
export function useDeleteReproduction() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await reproductionsApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reproductions'] })
    },
  })
}