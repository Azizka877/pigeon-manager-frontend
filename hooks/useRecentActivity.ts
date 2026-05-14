// hooks/use-recent-activity.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import type { AxiosResponse } from 'axios'
import type { RecentActivityResponse } from '@/types'

export interface UseRecentActivityOptions {
  limit?: number
  enabled?: boolean
}

const RECENT_ACTIVITY_KEY = 'recent-activity'

export function useRecentActivity(options: UseRecentActivityOptions = {}) {
  const { limit = 5, enabled = true } = options

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
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
  })
}