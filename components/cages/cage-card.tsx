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
        bg: 'bg-[#d1fae5]',
        border: 'border-[#34d399]',
        hover: 'hover:bg-[#a7f3d0]',
        dot: 'bg-[#10b981]',
        text: 'text-[#065f46]',
        label: 'Libre',
        iconColor: 'text-[#10b981]',
      }
    }

    if (cage.occupation_actuelle.type === 'couple') {
      return {
        bg: 'bg-[#ffedd5]',
        border: 'border-[#fb923c]',
        hover: 'hover:bg-[#fed7aa]',
        dot: 'bg-[#f97316]',
        text: 'text-[#9a3412]',
        label: 'Couple',
        iconColor: 'text-[#f97316]',
      }
    }

    return {
      bg: 'bg-[#fee2e2]',
      border: 'border-[#f87171]',
      hover: 'hover:bg-[#fecaca]',
      dot: 'bg-[#ef4444]',
      text: 'text-[#991b1b]',
      label: '1 pigeon',
      iconColor: 'text-[#ef4444]',
    }
  }

  const config = getStatusConfig()
  const isOccupied = !!cage.occupation_actuelle
  const isCouple = cage.occupation_actuelle?.type === 'couple'

  return (
    <div
      className={cn(
        'relative cursor-pointer transition-all duration-200 rounded-xl border-2',
        'p-4 aspect-square flex flex-col items-center justify-center',
        config.bg,
        config.border,
        config.hover,
        'hover:scale-[1.02] hover:shadow-lg',
        isSelected && 'ring-2 ring-primary ring-offset-2 scale-[1.02] shadow-lg'
      )}
      onClick={() => setSelectedCage(isSelected ? null : cage.id)}
    >
      {/* Numéro cage */}
      <span className="text-xl font-bold text-on-surface">{cage.numero}</span>

      {/* Icône(s) */}
      <div className="flex gap-1 my-2">
        {isCouple ? (
          <>
            <Bird className={cn('w-5 h-5', config.iconColor)} />
            <Bird className={cn('w-5 h-5', config.iconColor)} />
          </>
        ) : (
          <Bird className={cn('w-5 h-5', isOccupied ? 'text-on-surface' : config.iconColor)} />
        )}
      </div>

      {/* Status */}
      <div className="flex items-center gap-1.5">
        <div className={cn('w-2 h-2 rounded-full', config.dot)} />
        <span className={cn('text-xs font-semibold', config.text)}>
          {config.label}
        </span>
      </div>

      {/* Matricule si occupé */}
      {isOccupied && cage.occupation_actuelle && (
  <span className="text-xs text-on-surface-variant mt-1 truncate max-w-full px-1">
    {isCouple && cage.occupation_actuelle.couple
      ? `${cage.occupation_actuelle.couple.male?.matricule?.slice(0, 8) || ''}...`
      : cage.occupation_actuelle.pigeon?.matricule?.slice(0, 10) || ''
    }
  </span>
)}
    </div>
  )
}