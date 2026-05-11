'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { couplesApi } from '@/lib/api/client'
import type { Couple } from '@/types'

export function useCouples() {
  return useQuery({
    queryKey: ['couples'],
    queryFn: async () => {
      const { data } = await couplesApi.list()
      return (data.results || data) as Couple[]
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

export function useCouple(id: string) {
  return useQuery({
    queryKey: ['couples', id],
    queryFn: async () => {
      const { data } = await couplesApi.get(id)
      return data as Couple
    },
    enabled: !!id,
  })
}

export function useCreateCouple() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (coupleData: { male: string; femelle: string }) => {
      const { data } = await couplesApi.create(coupleData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couples'] })
    },
  })
}

export function useDeleteCouple() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await couplesApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couples'] })
    },
  })
}