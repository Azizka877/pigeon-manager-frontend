// app/dashboard/cages/page.tsx
'use client'

import { useCages } from '@/hooks/use-cages'
import { useCageStore } from '@/stores/cage-store'
import { CageCard } from '@/components/cages/cage-card'
import { CageDetailSheet } from '@/components/cages/cage-detail-sheet'
import { CageFilters } from '@/components/cages/cage-filters'
import { Skeleton } from '@/components/ui/skeleton'

export default function CagesPage() {
  const { data: cages, isLoading } = useCages()
  const { filterStatus } = useCageStore()

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Volière</h1>
          <p className="text-gray-500 mt-1">Visualisation des cages et occupants</p>
        </div>
        <CageFilters />
      </div>

      {/* Légende */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-600">Libre</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-600">Occupée (1 pigeon)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-gray-600">Couple (2 pigeons)</span>
        </div>
      </div>

      {/* Grille - toujours pleine largeur */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {isLoading ? (
          Array.from({ length: 20 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))
        ) : (
          filteredCages?.map((cage) => (
            <CageCard
              key={cage.id}
              cage={cage}
              isSelected={false} // Plus besoin, géré par le Sheet
            />
          ))
        )}
      </div>

      {/* Sheet coulissant (affiché quand selectedCage !== null) */}
      <CageDetailSheet />
    </div>
  )
}