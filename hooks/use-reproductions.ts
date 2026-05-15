// hooks/use-reproductions.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reproductionsApi } from '@/lib/api/client'
import type { Reproduction, CreateReproductionPayload, PaginatedResponse, JeuneData, PigeonMini } from '@/types'
import type { AxiosResponse } from 'axios'

// ─── GET : Liste des reproductions ───
export function useReproductions() {
  return useQuery<PaginatedResponse<Reproduction>, Error>({
    queryKey: ['reproductions'],
    queryFn: async () => {
      const response: AxiosResponse<PaginatedResponse<Reproduction>> = await reproductionsApi.list()
      return response.data
    },
    staleTime: 1000 * 60 * 2,
  })
}

// ─── GET : Détail d'une reproduction ───
export function useReproduction(id: string | null) {
  return useQuery<Reproduction, Error>({
    queryKey: ['reproduction', id],
    queryFn: async () => {
      const response: AxiosResponse<Reproduction> = await reproductionsApi.get(id!)
      return response.data
    },
    enabled: !!id,
  })
}

// ─── POST RAPIDE : Quick ponte depuis Couples ───
export function useQuickCreateReproduction() {
  const queryClient = useQueryClient()

  return useMutation<Reproduction, Error, { couple: string; date_ponte: string; nombre_oeufs?: number }>({
    mutationFn: async (data) => {
      const response = await reproductionsApi.create(data as any)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reproductions'] })
      queryClient.invalidateQueries({ queryKey: ['couples'] })
    },
  })
}

// ─── POST COMPLET : Création avec jeunes ───
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
      queryClient.invalidateQueries({ queryKey: ['couples'] })
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


// hooks/use-reproductions.ts
// hooks/use-reproductions.ts
export function useAjouterJeunes() {
  const queryClient = useQueryClient()
  
  return useMutation<
    { message: string; jeunes: PigeonMini[] }, 
    Error, 
    { id: string; jeunes: JeuneData[] }
  >({
    mutationFn: async ({ id, jeunes }) => {
      const response = await reproductionsApi.ajouterJeunes(id, jeunes)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reproductions', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['reproductions'] })
    },
  })
}