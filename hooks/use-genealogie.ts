// hooks/use-genealogie.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { genealogieApi } from '@/lib/api/client'
import type {
  ArbreResponse,
  ParentsResponse,
  FreresSoeursResponse,
  DescendantsResponse,
} from '@/types'

const ARBRE_KEY = 'arbre-genealogique'
const PARENTS_KEY = 'pigeon-parents'
const FRERES_KEY = 'pigeon-freres-soeurs'
const DESCENDANTS_KEY = 'pigeon-descendants'

export function useArbreGenealogique(pigeonId: string | null, profondeur: number = 3) {
  return useQuery<ArbreResponse, Error>({
    queryKey: [ARBRE_KEY, pigeonId, profondeur],
    queryFn: async () => {
      const response = await genealogieApi.arbre(pigeonId!, profondeur)
      return response.data
    },
    enabled: !!pigeonId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useParents(pigeonId: string | null) {
  return useQuery<ParentsResponse, Error>({
    queryKey: [PARENTS_KEY, pigeonId],
    queryFn: async () => {
      const response = await genealogieApi.parents(pigeonId!)
      return response.data
    },
    enabled: !!pigeonId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useFreresSoeurs(pigeonId: string | null) {
  return useQuery<FreresSoeursResponse, Error>({
    queryKey: [FRERES_KEY, pigeonId],
    queryFn: async () => {
      const response = await genealogieApi.freresSoeurs(pigeonId!)
      return response.data
    },
    enabled: !!pigeonId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useDescendants(pigeonId: string | null) {
  return useQuery<DescendantsResponse, Error>({
    queryKey: [DESCENDANTS_KEY, pigeonId],
    queryFn: async () => {
      const response = await genealogieApi.descendants(pigeonId!)
      return response.data
    },
    enabled: !!pigeonId,
    staleTime: 1000 * 60 * 5,
  })
}