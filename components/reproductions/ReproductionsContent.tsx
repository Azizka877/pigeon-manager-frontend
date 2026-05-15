// app/reproductions/ReproductionsContent.tsx
'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useReproductions } from '@/hooks/use-reproductions'
import { useCouples } from '@/hooks/use-couples'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  MoreVertical,
  Egg,
  Baby,
  Filter,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { Reproduction } from '@/types'

export default function ReproductionsContent() {
  const searchParams = useSearchParams()
  const coupleFilter = searchParams.get('couple')
  
  const { data: reproductionsData, isLoading } = useReproductions()
  const { data: couples } = useCouples()

  const reproductions = reproductionsData?.results || []

  // Filtre par couple si paramètre dans URL
  const filteredReproductions = coupleFilter
    ? reproductions.filter(r => r.couple === coupleFilter)
    : reproductions

  const getCoupleMatricules = (coupleId: string) => {
    const couple = couples?.results?.find(c => c.id === coupleId)
    if (!couple) return coupleId.slice(0, 8) + '...'
    const male = couple.male_details?.matricule || 'Inconnu'
    const femelle = couple.femelle_details?.matricule || 'Inconnue'
    return `${male} + ${femelle}`
  }

  const getStatutReproduction = (repro: Reproduction): { label: string; classe: string } => {
    const aujourdhui = new Date()
    const datePonte = new Date(repro.date_ponte)
    const dateEclosion = repro.date_eclosion ? new Date(repro.date_eclosion) : null
    
    if (!dateEclosion) {
      const joursDepuisPonte = Math.floor((aujourdhui.getTime() - datePonte.getTime()) / (1000 * 60 * 60 * 24))
      if (joursDepuisPonte < 15) {
        return { label: 'Incubation', classe: 'bg-[#d1fae5] text-[#065f46]' }
      }
      return { label: 'Éclosion imminente', classe: 'bg-[#ffedd5] text-[#9a3412]' }
    }
    
    if (repro.nombre_jeunes > 0) {
      const joursDepuisEclosion = Math.floor((aujourdhui.getTime() - dateEclosion.getTime()) / (1000 * 60 * 60 * 24))
      if (joursDepuisEclosion < 30) {
        return { label: 'Sevrage', classe: 'bg-[#00685f] text-white' }
      }
    }
    
    return { label: 'Terminé', classe: 'bg-gray-200 text-gray-700' }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00685f]" />
      </div>
    )
  }

  return (
   <div className="space-y-6">
  {/* En-tête responsive */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Registre des cycles d'élevage
      </h1>
      <p className="text-gray-500 mt-1 text-sm sm:text-base">
        {coupleFilter 
          ? `Pontes du couple : ${getCoupleMatricules(coupleFilter)}`
          : "Gérez et suivez les phases de reproduction actives du colombier."
        }
      </p>
    </div>
    <div className="flex gap-2">
      {coupleFilter && (
        <Link href="/reproductions">
          <Button variant="outline" className="gap-2 text-sm">
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Voir tout</span>
          </Button>
        </Link>
      )}
      <Link href="/reproductions/new">
        <Button className="bg-[#00685f] hover:bg-[#00554d] text-white gap-2 text-sm sm:text-base">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouvelle reproduction</span>
          <span className="sm:hidden">Nouvelle</span>
        </Button>
      </Link>
    </div>
  </div>

  {/* Vue Desktop : Tableau classique avec scroll horizontal */}
  <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Couple
            </th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Date de ponte
            </th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Jeunes
            </th>
            <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredReproductions.map((repro: Reproduction) => {
            const statut = getStatutReproduction(repro)
            return (
              <tr key={repro.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-700">
                    {getCoupleMatricules(repro.couple)}
                  </code>
                </td>
                <td className="px-6 py-4">
                  <Badge className={cn(statut.classe, 'font-medium whitespace-nowrap')}>
                    {statut.label}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Egg className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-700 whitespace-nowrap">
                      {new Date(repro.date_ponte).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Baby className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-700">
                      {repro.nombre_jeunes > 0 ? repro.nombre_jeunes : '--'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/reproductions/${repro.id}`}>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>

    {filteredReproductions.length === 0 && (
      <div className="text-center py-12 text-gray-500">
        <Egg className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Aucune reproduction enregistrée</p>
      </div>
    )}
  </div>

  {/* Vue Mobile : Cartes empilées */}
  <div className="md:hidden space-y-3">
    {filteredReproductions.map((repro: Reproduction) => {
      const statut = getStatutReproduction(repro)
      return (
        <Link 
          key={repro.id} 
          href={`/reproductions/${repro.id}`}
          className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-[#00685f] transition-colors active:scale-[0.99]"
        >
          <div className="flex items-start justify-between mb-3">
            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-700">
              {getCoupleMatricules(repro.couple)}
            </code>
            <Badge className={cn(statut.classe, 'font-medium text-xs shrink-0 ml-2')}>
              {statut.label}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Egg className="w-4 h-4 text-gray-400 shrink-0" />
              <span>
                {new Date(repro.date_ponte).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Baby className="w-4 h-4 text-gray-400 shrink-0" />
              <span>
                {repro.nombre_jeunes > 0 
                  ? `${repro.nombre_jeunes} jeune${repro.nombre_jeunes > 1 ? 's' : ''}`
                  : 'Aucun jeune'
                }
              </span>
            </div>
          </div>
        </Link>
      )
    })}

    {filteredReproductions.length === 0 && (
      <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
        <Egg className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Aucune reproduction enregistrée</p>
      </div>
    )}
  </div>
</div>
  )
}