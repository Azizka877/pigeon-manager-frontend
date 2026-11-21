// app/dashboard/cages/[id]/historique/page.tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useCageHistory } from '@/hooks/use-cage-history'
import { useCage } from '@/hooks/use-cages'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'

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
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Historique — Cage {cage?.numero}</h1>
          <p className="text-sm text-on-surface-variant">{historique?.length || 0} événements enregistrés</p>
        </div>
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-surface-container-high" />
          ))}
        </div>
      ) : historique && historique.length > 0 ? (
        <div className="space-y-3">
          {historique.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-2xl border border-outline-variant/60 bg-surface p-4 shadow-sm"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-container/40">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-on-surface">{item.description}</p>
                  <span className="flex-shrink-0 text-xs text-on-surface-variant/70">
                    {item.date_formatee}
                  </span>
                </div>
                <p className="mt-1 text-sm text-on-surface-variant">Par {item.utilisateur_nom || 'Système'}</p>
                {item.metadata?.pigeon_id && (
                  <p className="mt-1 font-mono text-xs text-on-surface-variant/60">
                    Pigeon : {item.metadata.pigeon_id}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant/60 py-16 text-center">
          <div className="rounded-2xl bg-primary-container/40 p-3">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <p className="mt-3 text-sm font-medium text-on-surface">Aucun historique pour cette cage</p>
          <p className="mt-0.5 text-xs text-on-surface-variant">
            Les occupations et libérations apparaîtront ici.
          </p>
        </div>
      )}
    </div>
  )
}