// hooks/use-reproductions.ts
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { reproductionsApi } from '@/lib/api/client'
import type { CreateReproductionPayload, Reproduction } from '@/types'

export function useCreateReproduction() {
  const queryClient = useQueryClient()

  return useMutation<Reproduction, Error, CreateReproductionPayload>({
    mutationFn: async (data) => {
      // On cast en any car l'API backend accepte ce format étendu
      const response = await reproductionsApi.create(data as any)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reproductions'] })
      queryClient.invalidateQueries({ queryKey: ['pigeons'] })
    },
  })
}