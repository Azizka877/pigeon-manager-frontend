'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bird, Home, Heart, ArrowUpRight } from 'lucide-react'
import { useCages } from '@/hooks/use-cages'
import { usePigeons } from '@/hooks/use-pigeons'
import { useCouples } from '@/hooks/use-couples'
import { useSorties } from '@/hooks/use-sales'

export function StatsCards() {
  const { data: cages } = useCages()
  const { data: pigeons } = usePigeons()
  const { data: couples } = useCouples()
  const { data: sorties } = useSorties()

  const cagesLibres = cages?.filter((c) => !c.occupation_actuelle).length || 0
  const totalCages = cages?.length || 0
  const couplesActifs = couples?.results?.filter((c) => c.statut === 'actif').length || 0
  const sortiesMois = sorties?.filter((s) => {
    const date = new Date(s.date_sortie)
    const now = new Date()
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length || 0

  const stats = [
    { title: 'Total Pigeons', value: pigeons?.length || 0, icon: Bird, color: 'text-primary', bg: 'bg-primary-container/30' },
    { title: 'Cages Libres', value: `${cagesLibres}/${totalCages}`, icon: Home, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Couples Actifs', value: couplesActifs, icon: Heart, color: 'text-tertiary', bg: 'bg-tertiary-container/30' },
    { title: 'Sorties ce mois', value: sortiesMois, icon: ArrowUpRight, color: 'text-destructive', bg: 'bg-error-container' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="border-outline-variant/50 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-on-surface-variant">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-on-surface">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}