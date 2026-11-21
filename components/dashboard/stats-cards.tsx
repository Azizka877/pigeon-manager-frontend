// components/dashboard/stats-cards.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bird, Home, Heart, ArrowUpRight } from 'lucide-react'
import { useCages } from '@/hooks/use-cages'
import { usePigeons } from '@/hooks/use-pigeons'
import { useCouples } from '@/hooks/use-couples'
import { useSorties } from '@/hooks/use-sales'

export function StatsCards() {
  const { data: cages, isLoading: cagesEnChargement } = useCages()
  const { data: pigeons, isLoading: pigeonsEnChargement } = usePigeons()
  const { data: couples, isLoading: couplesEnChargement } = useCouples()
  const { data: sorties, isLoading: sortiesEnChargement } = useSorties()

  const cagesLibres = cages?.filter((c) => !c.occupation_actuelle).length || 0
  const totalCages = cages?.length || 0
  const pigeonsActifs = pigeons?.filter((p) => p.statut === 'actif').length || 0
  const totalCouples = couples?.results?.length || 0
  const couplesActifs = couples?.results?.filter((c) => c.statut === 'actif').length || 0
  const tauxOccupation = totalCages ? Math.round(((totalCages - cagesLibres) / totalCages) * 100) : 0
  const sortiesMois = sorties?.filter((s) => {
    const date = new Date(s.date_sortie)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length || 0

  const stats = [
    {
      title: 'Pigeons',
      value: pigeons?.length || 0,
      hint: `${pigeonsActifs} actif${pigeonsActifs > 1 ? 's' : ''}`,
      chargement: pigeonsEnChargement,
      icon: Bird,
      tuile: 'bg-primary-container/40',
      icone: 'text-primary',
      barre: 'bg-primary',
    },
    {
      title: 'Cages libres',
      value: `${cagesLibres}/${totalCages}`,
      hint: `${tauxOccupation}% d'occupation`,
      chargement: cagesEnChargement,
      icon: Home,
      tuile: 'bg-emerald-100',
      icone: 'text-emerald-600',
      barre: 'bg-emerald-500',
    },
    {
      title: 'Couples actifs',
      value: couplesActifs,
      hint: `${totalCouples} au total`,
      chargement: couplesEnChargement,
      icon: Heart,
      tuile: 'bg-tertiary-container/40',
      icone: 'text-tertiary',
      barre: 'bg-tertiary',
    },
    {
      title: 'Sorties du mois',
      value: sortiesMois,
      hint: 'sur le mois en cours',
      chargement: sortiesEnChargement,
      icon: ArrowUpRight,
      tuile: 'bg-amber-100',
      icone: 'text-amber-600',
      barre: 'bg-amber-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card
            key={stat.title}
            className="group relative overflow-hidden rounded-2xl border-outline-variant/60 bg-surface transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10"
          >
            <div className={`absolute inset-x-0 top-0 h-1 ${stat.barre} opacity-60 transition-opacity group-hover:opacity-100`} />
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-5">
              <CardTitle className="text-[13px] font-medium uppercase tracking-wide text-on-surface-variant">
                {stat.title}
              </CardTitle>
              <div className={`rounded-xl p-2.5 ${stat.tuile} transition-transform duration-300 group-hover:scale-110`}>
                <Icon className={`h-4 w-4 ${stat.icone}`} />
              </div>
            </CardHeader>
            <CardContent className="pb-5">
              {stat.chargement ? (
                <div className="h-8 w-16 animate-pulse rounded-lg bg-surface-container-high" />
              ) : (
                <div className="text-3xl font-bold tracking-tight text-on-surface">{stat.value}</div>
              )}
              <p className="mt-1 text-xs text-on-surface-variant/80">{stat.hint}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}