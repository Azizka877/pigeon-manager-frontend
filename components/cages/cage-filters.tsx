'use client'

import { useCageStore } from '@/stores/cage-store'
import { cn } from '@/lib/utils'

const filters = [
  { key: 'all', label: 'Toutes', dot:null as string | null },
  { key: 'free', label: 'Libres', dot: 'bg-[#10b981]' },
  { key: 'single', label: 'Seul', dot: 'bg-[#ef4444]' },
  { key: 'couple', label: 'Couples', dot: 'bg-[#f97316]' },
] as const

export function CageFilters() {
  const { filterStatus, setFilterStatus } = useCageStore()

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => setFilterStatus(filter.key)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            filterStatus === filter.key
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          )}
        >
          {filter.dot && (
            <span className={cn('w-2 h-2 rounded-full', filter.dot)} />
          )}
          {filter.label}
        </button>
      ))}
    </div>
  )
}