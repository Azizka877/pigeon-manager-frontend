// hooks/use-recent-activity.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import type { AxiosResponse } from 'axios'

// Types basés strictement sur la réponse API réelle
export interface ActivityItem {
  id: string
  type: 'cage' | 'pigeon' | 'couple' | 'reproduction' | 'sortie'
  type_action: string
  titre: string
  description: string
  date: string
  badge?: string
  utilisateur?: string | null
  metadata?: {
    couple_id?: string | null
    pigeon_id?: string | null
    type_occupation?: string
    matricule?: string
    sexe?: string
    male?: string
    femelle?: string
    [key: string]: unknown
  }
}

export interface RecentActivityResponse {
  count: number
  results: ActivityItem[]
}

export interface UseRecentActivityOptions {
  limit?: number
  enabled?: boolean
}

const RECENT_ACTIVITY_KEY = 'recent-activity'

/**
 * Hook pour récupérer les activités récentes globales du colombier.
 * GET /api/activites/?limit={limit}
 */
export function useRecentActivity(options: UseRecentActivityOptions = {}) {
  const { limit = 10, enabled = true } = options

  return useQuery<RecentActivityResponse, Error>({
    queryKey: [RECENT_ACTIVITY_KEY, { limit }],
    queryFn: async () => {
      const response: AxiosResponse<RecentActivityResponse> = await apiClient.get(
        '/activites/',
        { params: { limit } }
      )
      return response.data
    },
    enabled,
    staleTime: 1000 * 60 * 2,      // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refresh auto toutes les 5 min
  })
}