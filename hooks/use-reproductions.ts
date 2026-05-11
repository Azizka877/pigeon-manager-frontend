'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reproductionsApi } from '@/lib/api/client'
import type { Reproduction } from '@/types'

export function useReproductions() {
  return useQuery({
    queryKey: ['reproductions'],
    queryFn: async () => {
      const { data } = await reproductionsApi.list()
      return (data.results || data) as Reproduction[]
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

export function useReproduction(id: string) {
  return useQuery({
    queryKey: ['reproductions', id],
    queryFn: async () => {
      const { data } = await reproductionsApi.get(id)
      return data as Reproduction
    },
    enabled: !!id,
  })
}

export function useCreateReproduction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (reproductionData: { couple: string; date_ponte: string; nombre_oeufs: number; notes?: string }) => {
      const { data } = await reproductionsApi.create(reproductionData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reproductions'] })
      queryClient.invalidateQueries({ queryKey: ['couples'] })
    },
  })
}

export function useUpdateReproduction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Reproduction> }) => {
      const response = await reproductionsApi.update(id, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reproductions'] })
    },
  })
}

export function useDeleteReproduction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await reproductionsApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reproductions'] })
    },
  })
}