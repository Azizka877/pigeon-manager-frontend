// components/activity/activity-filters.tsx
'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Home, Bird, Heart, Egg, ShoppingCart, LayoutGrid } from 'lucide-react'

const filters = [
  { key: 'all', label: 'Tout', icon: LayoutGrid },
  { key: 'cage', label: 'Cages', icon: Home },
  { key: 'pigeon', label: 'Pigeons', icon: Bird },
  { key: 'couple', label: 'Couples', icon: Heart },
  { key: 'reproduction', label: 'Repros', icon: Egg },
  { key: 'sortie', label: 'Sorties', icon: ShoppingCart },
]

interface ActivityFiltersProps {
  activeFilter: string
}

export function ActivityFilters({ activeFilter }: ActivityFiltersProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = (type: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (type === 'all') {
      params.delete('type')
    } else {
      params.set('type', type)
    }
    return params.toString()
  }

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const Icon = filter.icon
        const isActive = activeFilter === filter.key
        const query = createQueryString(filter.key)

        return (
          <Link
            key={filter.key}
            href={`${pathname}${query ? `?${query}` : ''}`}
            scroll={false}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${
                isActive
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            {filter.label}
          </Link>
        )
      })}
    </div>
  )
}