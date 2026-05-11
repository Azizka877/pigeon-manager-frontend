'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pigeonsApi } from '@/lib/api/client'
import type { Pigeon } from '@/types'

export function usePigeons() {
  return useQuery({
    queryKey: ['pigeons'],
    queryFn: async () => {
      const { data } = await pigeonsApi.list()
      return (data.results || data) as Pigeon[]
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

export function usePigeon(id: string) {
  return useQuery({
    queryKey: ['pigeons', id],
    queryFn: async () => {
      const { data } = await pigeonsApi.get(id)
      return data as Pigeon
    },
    enabled: !!id,
  })
}

export function useCreatePigeon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (pigeonData: Partial<Pigeon>) => {
      const { data } = await pigeonsApi.create(pigeonData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pigeons'] })
    },
  })
}

export function useUpdatePigeon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Pigeon> }) => {
      const response = await pigeonsApi.update(id, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pigeons'] })
    },
  })
}

export function useDeletePigeon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await pigeonsApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pigeons'] })
    },
  })
}