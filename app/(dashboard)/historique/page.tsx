// app/historique/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useRecentActivity } from '@/hooks/useRecentActivity'
import { ActivityFeed } from '@/components/activity/activity-feed'
import { ActivityFilters } from '@/components/activity/activity-filters'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'

export default function HistoriquePage() {
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface mb-2">
          Historique des activités
        </h1>
        <p className="text-sm text-on-surface-variant">
          {activities.length} activité{activities.length > 1 ? 's' : ''} au total
        </p>
      </div>

      <ActivityFilters activeFilter={typeFilter} />

      {isLoading && (
        <div className="space-y-4 mt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
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
    </div>
  )
}