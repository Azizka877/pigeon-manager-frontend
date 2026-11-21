'use client'

import Link from 'next/link'
import { Bird, Home, Egg, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const ACTIONS = [
  { href: '/cages', label: 'Voir la volière', desc: 'Gérer cages et occupants', icon: Home, majeure: true },
  { href: '/pigeons/new', label: 'Ajouter un pigeon', desc: 'Enregistrer un nouvel oiseau', icon: Bird, majeure: false },
  { href: '/reproductions/new', label: 'Nouvelle reproduction', desc: 'Suivre une ponte', icon: Egg, majeure: false },
]

export function QuickActions({ variante = 'clair' }: { variante?: 'clair' | 'sombre' }) {
  const sombre = variante === 'sombre'

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {ACTIONS.map((action) => {
        const Icon = action.icon
        return (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              'group flex items-center gap-3 rounded-xl p-3.5 transition-all duration-300 hover:-translate-y-0.5',
              sombre
                ? action.majeure
                  ? 'bg-white text-[#005651] shadow-lg hover:shadow-xl'
                  : 'border border-white/15 bg-white/10 text-white hover:bg-white/20'
                : action.majeure
                  ? 'bg-gradient-to-br from-[#00685f] via-[#005651] to-[#01352f] text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30'
                  : 'border border-outline-variant/60 bg-surface text-on-surface hover:border-primary/40 hover:shadow-md hover:shadow-primary/10',
            )}
          >
            <div
              className={cn(
                'shrink-0 rounded-lg p-2.5',
                sombre
                  ? action.majeure ? 'bg-[#00685f]/10' : 'bg-white/15'
                  : action.majeure ? 'bg-white/15' : 'bg-primary-container/40',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4',
                  sombre
                    ? action.majeure ? 'text-[#00685f]' : 'text-white'
                    : action.majeure ? 'text-white' : 'text-primary',
                )}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{action.label}</p>
              <p
                className={cn(
                  'truncate text-xs',
                  sombre
                    ? action.majeure ? 'text-[#005651]/70' : 'text-white/60'
                    : action.majeure ? 'text-white/70' : 'text-on-surface-variant',
                )}
              >
                {action.desc}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 opacity-60 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
          </Link>
        )
      })}
    </div>
  )
}