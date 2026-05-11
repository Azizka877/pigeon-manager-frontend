'use client'

import { useCages } from '@/hooks/use-cages'
import { useCageStore } from '@/stores/cage-store'
import { CageCard } from '@/components/cages/cage-card'
import { CageDetailPanel } from '@/components/cages/cage-detail-panel'
import { CageFilters } from '@/components/cages/cage-filters'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export default function CagesPage() {
  const { data: cages, isLoading } = useCages()
  const { selectedCage, filterStatus } = useCageStore()

  const filteredCages = cages?.filter((cage) => {
    switch (filterStatus) {
      case 'free': return !cage.occupation_actuelle
      case 'single': return cage.occupation_actuelle?.type === 'seul'
      case 'couple': return cage.occupation_actuelle?.type === 'couple'
      default: return true
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Volière</h1>
          <p className="text-on-surface-variant mt-1">Visualisation des cages et occupants</p>
        </div>
        <CageFilters />
      </div>

      <div className="flex gap-6">
        {/* Grille */}
        <div className={cn(
          "grid gap-3 transition-all duration-300 flex-1",
          selectedCage
            ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        )}>
          {isLoading ? (
            Array.from({ length: 20 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))
          ) : (
            filteredCages?.map((cage) => (
              <CageCard
                key={cage.id}
                cage={cage}
                isSelected={selectedCage === cage.id}
              />
            ))
          )}
        </div>

        {/* Panel détail */}
        {selectedCage && (
          <CageDetailPanel cageId={selectedCage} />
        )}
      </div>
    </div>
  )
}