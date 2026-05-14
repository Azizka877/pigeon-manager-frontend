// hooks/use-recent-activity.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import type { AxiosResponse } from 'axios'
import type { RecentActivityResponse } from '@/types'

export interface UseRecentActivityOptions {
  limit?: number
  days?: number
  enabled?: boolean
}

const RECENT_ACTIVITY_KEY = 'recent-activity'

export function useRecentActivity(options: UseRecentActivityOptions = {}) {
  const { limit = 5, days = 30, enabled = true } = options

  // Clamp limit côté client aussi
  const safeLimit = Math.min(Math.max(limit, 1), 100)

  return useQuery<RecentActivityResponse, Error>({
    queryKey: [RECENT_ACTIVITY_KEY, { limit: safeLimit, days }],
    queryFn: async () => {
      const response: AxiosResponse<RecentActivityResponse> = await apiClient.get(
        '/activites/',
        { params: { limit: safeLimit, days } }
      )
      return response.data
    },
    enabled,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
  })
}