'use client'

import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query'
import { cagesApi } from '@/lib/api/client'
import type { Cage, CagesApiResponse } from '@/types'



export function useCages(): UseQueryResult<Cage[], Error> {
  return useQuery<Cage[], Error>({
    queryKey: ['cages'],
    queryFn: async () => {
      console.log('🔍 [useCages] Début requête...')
      
      try {
        const response = await cagesApi.list()
        console.log('🔍 [useCages] Response status:', response.status)
        console.log('🔍 [useCages] Response data:', response.data)
        
        // La réponse est de type PaginatedResponse
        const data = response.data as CagesApiResponse
        
        if (data && data.results && Array.isArray(data.results)) {
          console.log('🔍 [useCages] Cages trouvées:', data.results.length)
          return data.results
        }
        
        console.warn('🔍 [useCages] Format de réponse inattendu:', data)
        return []
      } catch (error) {
        console.error('🔍 [useCages] Erreur:', error)
        throw error
      }
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
  })
}

export function useCage(id: string) {
  return useQuery({
    queryKey: ['cages', id],
    queryFn: async () => {
      const { data } = await cagesApi.get(id)
      return data as Cage
    },
    enabled: !!id,
  })
}

export function useOccuperCage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ cageId, pigeonId, coupleId, type }: {
      cageId: string
      pigeonId?: string
      coupleId?: string
      type: 'seul' | 'couple'
    }) => {
      const { data } = await cagesApi.occuper(cageId, {
        pigeon: pigeonId,
        couple: coupleId,
        type_occupation: type,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cages'] })
    },
  })
}

export function useLibererCage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (cageId: string) => {
      await cagesApi.liberer(cageId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cages'] })
    },
  })
}