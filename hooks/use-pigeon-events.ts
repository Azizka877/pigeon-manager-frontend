// hooks/use-pigeon-events.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pigeonEventsApi } from '@/lib/api/client'
import type { PigeonEvent } from '@/types'

export function usePigeonEvents(pigeonId: string) {
  return useQuery({
    queryKey: ['pigeons', pigeonId, 'events'],
    queryFn: async () => {
      const { data } = await pigeonEventsApi.list(pigeonId)
      return data.results || []
    },
    enabled: !!pigeonId,
  })
}

export function useCreatePigeonEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ pigeonId, data }: { pigeonId: string; data: Partial<PigeonEvent> }) => {
      const { data: response } = await pigeonEventsApi.create(pigeonId, data)
      return response
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pigeons', variables.pigeonId, 'events'] })
    },
  })
}