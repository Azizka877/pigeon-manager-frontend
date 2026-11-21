// app/dashboard/cages/page.tsx
'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useCages } from '@/hooks/use-cages'
import { useCageStore } from '@/stores/cage-store'
import { CageCard } from '@/components/cages/cage-card'
import { CageDetailSheet } from '@/components/cages/cage-detail-sheet'
import { CageFilters } from '@/components/cages/cage-filters'
import { Button } from '@/components/ui/button'
import { Home, Plus } from 'lucide-react'

export default function CagesPage() {
  const { data: cages, isLoading } = useCages()
  const { filterStatus } = useCageStore()

  const filteredCages = cages?.filter((cage) => {
    switch (filterStatus) {
      case 'free':
        return !cage.occupation_actuelle
      case 'single':
        return cage.occupation_actuelle?.type === 'seul'
      case 'couple':
        return cage.occupation_actuelle?.type === 'couple'
      default:
        return true
    }
  })

  const stats = useMemo(() => {
    if (!cages) return { total: 0, libres: 0, seuls: 0, couples: 0 }
    return {
      total: cages.length,
      libres: cages.filter((c) => !c.occupation_actuelle).length,
      seuls: cages.filter((c) => c.occupation_actuelle?.type === 'seul').length,
      couples: cages.filter((c) => c.occupation_actuelle?.type === 'couple').length,
    }
  }, [cages])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Volière</h1>
          <p className="mt-1 text-on-surface-variant">
            {stats.total} cages • {stats.libres} libres • {stats.seuls} en solo • {stats.couples} en couple
          </p>
        </div>
        <Link href="/cages/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle cage
          </Button>
        </Link>
      </div>

      {/* Filtres avec compteurs */}
      <CageFilters stats={stats} />

      {/* Grille */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-surface-container-high" />
          ))}
        </div>
      ) : filteredCages && filteredCages.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredCages.map((cage) => (
            <CageCard key={cage.id} cage={cage} isSelected={false} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant/60 py-16 text-center">
          <div className="rounded-2xl bg-primary-container/40 p-3">
            <Home className="h-6 w-6 text-primary" />
          </div>
          <p className="mt-3 text-sm font-medium text-on-surface">
            {cages && cages.length > 0 ? 'Aucune cage dans ce filtre' : 'Aucune cage pour le moment'}
          </p>
          <p className="mt-0.5 text-xs text-on-surface-variant">
            {cages && cages.length > 0
              ? 'Essaie un autre filtre.'
              : 'Crée ta première cage pour loger tes pigeons.'}
          </p>
        </div>
      )}

      <CageDetailSheet />
    </div>
  )
}