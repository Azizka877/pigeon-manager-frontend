// hooks/use-couples.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { couplesApi } from '@/lib/api/client'
import type { Couple, PaginatedResponse } from '@/types'
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
    },
  })
}

// ─── PATCH : Mettre à jour un couple (pour Quick Ponte) ───
export function useUpdateCouple() {
  const queryClient = useQueryClient()
  
  return useMutation<Couple, Error, { id: string; data: Partial<Couple> }>({
    mutationFn: async ({ id, data }) => {
      const response: AxiosResponse<Couple> = await couplesApi.update(id, data)
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['couples'] })
      queryClient.invalidateQueries({ queryKey: ['couples', data.id] })
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