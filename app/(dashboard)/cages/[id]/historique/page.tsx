// app/dashboard/cages/[id]/historique/page.tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useCageHistory } from '@/hooks/use-cage-history'
import { useCage } from '@/hooks/use-cages'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowLeft, Clock, Calendar } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function CageHistoriquePage() {
  const params = useParams()
  const router = useRouter()
  const cageId = params.id as string
  
  const { data: cage, isLoading: cageLoading } = useCage(cageId)
  const { data: historique, isLoading: histLoading } = useCageHistory(cageId)

  const isLoading = cageLoading || histLoading

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Historique — Cage {cage?.numero}
          </h1>
          <p className="text-gray-500 text-sm">
            {historique?.length || 0} événements enregistrés
          </p>
        </div>
      </div>

      {/* Liste */}
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))
          ) : historique?.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3" />
              <p>Aucun historique pour cette cage</p>
            </div>
          ) : (
            historique?.map((item) => (
              <div 
                key={item.id} 
                className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">
                        {item.description}
                      </p>
                      <span className="text-xs text-gray-400">
                        {item.date_formatee}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Par {item.utilisateur_nom || 'Système'}
                    </p>
                    {item.metadata?.pigeon_id && (
                      <p className="text-xs text-gray-400 mt-1">
                        Pigeon: {item.metadata.pigeon_id}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}