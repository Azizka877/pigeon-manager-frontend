// hooks/use-cage-history.ts
import { useQuery } from '@tanstack/react-query'
import { historiqueApi } from '@/lib/api/client'
import type { HistoriqueItem } from '@/types'

export function useCageHistory(cageId: string) {
  return useQuery({
    queryKey: ['cages', cageId, 'historique'],
    queryFn: async () => {
      const { data } = await historiqueApi.list(cageId)
      return data
    },
    enabled: !!cageId,
  })
}