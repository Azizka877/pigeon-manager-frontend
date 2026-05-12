// components/cages/cage-card.tsx
'use client'

import { useCageStore } from '@/stores/cage-store'
import { cn } from '@/lib/utils'
import { Bird } from 'lucide-react'
import type { Cage } from '@/types'

interface CageCardProps {
  cage: Cage
  isSelected: boolean
}

export function CageCard({ cage, isSelected }: CageCardProps) {
  const setSelectedCage = useCageStore((state) => state.setSelectedCage)

  const getStatusConfig = () => {
    if (!cage.occupation_actuelle) {
      return {
        bg: 'bg-green-50',
        border: 'border-green-400',
        hover: 'hover:bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-700',
        label: 'Libre',
        iconColor: 'text-green-500',
      }
    }

    if (cage.occupation_actuelle.type === 'couple') {
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-400',
        hover: 'hover:bg-orange-100',
        dot: 'bg-orange-500',
        text: 'text-orange-700',
        label: 'Couple (2 pigeons)',
        iconColor: 'text-orange-500',
      }
    }

    return {
      bg: 'bg-red-50',
      border: 'border-red-400',
      hover: 'hover:bg-red-100',
      dot: 'bg-red-500',
      text: 'text-red-700',
      label: '1 pigeon',
      iconColor: 'text-red-500',
    }
  }

  const config = getStatusConfig()
  const isOccupied = !!cage.occupation_actuelle
  const isCouple = cage.occupation_actuelle?.type === 'couple'

  return (
    <div
      className={cn(
        'relative cursor-pointer transition-all duration-200 rounded-xl border-2',
        'p-3 aspect-square flex flex-col items-center justify-center gap-1',
        config.bg,
        config.border,
        config.hover,
        'hover:scale-[1.02] hover:shadow-md',
        isSelected && 'ring-2 ring-primary ring-offset-2 scale-[1.02] shadow-lg'
      )}
      onClick={() => setSelectedCage(cage.id)}
    >
      {/* Numéro cage */}
      <span className="text-lg font-bold text-gray-900">{cage.numero}</span>

      {/* Icône(s) pigeon */}
      <div className="flex items-center gap-0.5">
        {isCouple ? (
          <>
            <Bird className={cn('w-5 h-5', config.iconColor)} />
            <Bird className={cn('w-5 h-5', config.iconColor)} />
          </>
        ) : (
          <Bird className={cn('w-5 h-5', config.iconColor)} />
        )}
      </div>

      {/* Label status */}
      <span className={cn('text-xs font-medium', config.text)}>
        {config.label}
      </span>

      {/* Matricule au survol ou toujours visible si occupé */}
      {isOccupied && cage.occupation_actuelle && (
        <span className="text-[10px] text-gray-500 truncate max-w-full px-1 text-center leading-tight">
          {isCouple && cage.occupation_actuelle.couple
            ? `${cage.occupation_actuelle.couple.male_details?.matricule || ''} + ${cage.occupation_actuelle.couple.femelle_details?.matricule || ''}`
            : cage.occupation_actuelle.pigeon?.matricule || ''
          }
        </span>
      )}
    </div>
  )
}