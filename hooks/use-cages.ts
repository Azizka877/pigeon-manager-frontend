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
    mutationFn: async (params: {
      cage_id: string
      pigeon_id?: string
      couple_id?: string
      type_occupation: 'seul' | 'couple'
    }) => {
      const { cage_id, pigeon_id, couple_id, type_occupation } = params
      
     

      const body: any = {}
      if (pigeon_id) body.pigeon_id = pigeon_id
      if (couple_id) body.couple_id = couple_id
      body.type_occupation = type_occupation


      const { data } = await cagesApi.occuper(cage_id, body)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cages'] })
       queryClient.invalidateQueries({ queryKey: ['pigeons'] }) 
      queryClient.invalidateQueries({ queryKey: ['couples'] })
    },
    onError: (err: any) => {
      console.error("🔴 HOOK - erreur:", err.response?.data || err.message)
    }
  })
}

export function useLibererCage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (cage_id: string) => {
      await cagesApi.liberer(cage_id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cages'] })
      queryClient.invalidateQueries({ queryKey: ['pigeons'] })  
      queryClient.invalidateQueries({ queryKey: ['couples'] })  
    },
  })
}