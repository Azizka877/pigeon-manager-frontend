// components/activity/historique-content.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useRecentActivity } from '@/hooks/useRecentActivity'
import { ActivityFeed } from './activity-feed'
import { ActivityFilters } from './activity-filters'
import { AlertCircle } from 'lucide-react'

export function HistoriqueContent() {
  const searchParams = useSearchParams()
  const typeFilter = searchParams.get('type') || 'all'

  // Pas de limite = récupère tout
  const { data, isLoading, error } = useRecentActivity({ limit: 9999 })

  const activities = data?.results ?? []

  // Filtrage côté client par type
  const filteredActivities =
    typeFilter === 'all'
      ? activities
      : activities.filter((a) => a.type === typeFilter)

  return (
    <>
      <p className="text-sm text-on-surface-variant mb-6">
        {activities.length} activité{activities.length > 1 ? 's' : ''} au total
      </p>

      <ActivityFilters activeFilter={typeFilter} />

      {isLoading && (
        <div className="space-y-4 mt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 w-full rounded-xl bg-surface-container-low animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-500 mt-6 p-4 rounded-xl bg-red-50">
          <AlertCircle className="w-5 h-5" />
          <p>Erreur lors du chargement de l&apos;historique</p>
        </div>
      )}

      {!isLoading && !error && (
        <ActivityFeed
          activities={filteredActivities}
          emptyMessage="Aucune activité trouvée"
        />
      )}
    </>
  )
}