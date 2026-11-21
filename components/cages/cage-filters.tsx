'use client'

import { useCageStore } from '@/stores/cage-store'
import { cn } from '@/lib/utils'

const FILTRES = [
  { key: 'all', label: 'Toutes', dot: null as string | null },
  { key: 'free', label: 'Libres', dot: 'bg-emerald-500' },
  { key: 'single', label: 'Seuls', dot: 'bg-sky-500' },
  { key: 'couple', label: 'Couples', dot: 'bg-amber-500' },
] as const

interface CageFiltersProps {
  stats?: { total: number; libres: number; seuls: number; couples: number }
}

export function CageFilters({ stats }: CageFiltersProps) {
  const { filterStatus, setFilterStatus } = useCageStore()

  const compteDe = (key: string) => {
    if (!stats) return undefined
    if (key === 'free') return stats.libres
    if (key === 'single') return stats.seuls
    if (key === 'couple') return stats.couples
    return stats.total
  }

  return (
    <div className="flex flex-wrap gap-2">
      {FILTRES.map((filter) => {
        const actif = filterStatus === filter.key
        const compte = compteDe(filter.key)
        return (
          <button
            key={filter.key}
            onClick={() => setFilterStatus(filter.key)}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
              actif
                ? 'bg-gradient-to-r from-[#00685f] to-[#005651] text-primary-foreground shadow-md shadow-primary/25'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
            )}
          >
            {filter.dot && <span className={cn('h-2 w-2 rounded-full', filter.dot)} />}
            {filter.label}
            {compte !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
                  actif
                    ? 'bg-white/20 text-primary-foreground'
                    : 'bg-surface-container-high text-on-surface-variant',
                )}
              >
                {compte}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}