// app/dashboard/cages/page.tsx
'use client'

import { useCages } from '@/hooks/use-cages'
import { useCageStore } from '@/stores/cage-store'
import { CageCard } from '@/components/cages/cage-card'
import { CageDetailSheet } from '@/components/cages/cage-detail-sheet'
import { CageFilters } from '@/components/cages/cage-filters'
import { Skeleton } from '@/components/ui/skeleton'
import { useMemo } from 'react'

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

  // ─── COMPTER DYNAMIQUEMENT ──────────────────────────────────────
  const stats = useMemo(() => {
    if (!cages) return { libres: 0, seuls: 0, couples: 0, total: 0 }
    return {
      libres: cages.filter(c => !c.occupation_actuelle).length,
      seuls: cages.filter(c => c.occupation_actuelle?.type === 'seul').length,
      couples: cages.filter(c => c.occupation_actuelle?.type === 'couple').length,
      total: cages.length,
    }
  }, [cages])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Volière</h1>
          <p className="text-gray-500 mt-1">
            {stats.total} cages • {stats.libres} libres • {stats.seuls} occupées • {stats.couples} couples
          </p>
        </div>
        <CageFilters />
      </div>

      {/* Légende dynamique */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-600">
            Libre ({stats.libres})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-600">
            Occupée ({stats.seuls} pigeon{stats.seuls > 1 ? 's' : ''})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-gray-600">
            Couple ({stats.couples} {stats.couples > 1 ? 'couples' : 'couple'})
          </span>
        </div>
      </div>

      {/* Grille */}
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
              isSelected={false}
            />
          ))
        )}
      </div>

      <CageDetailSheet />
    </div>
  )
}