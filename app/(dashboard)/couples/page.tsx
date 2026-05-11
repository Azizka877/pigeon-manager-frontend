'use client'

import { useState } from 'react'
import { useCouples } from '@/hooks/use-couples'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Plus, 
  MoreVertical,
  Heart
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { Couple } from '@/types'

type FiltreStatut = 'tous' | 'actif' | 'rompu'

export default function CouplesPage() {
  const { data: couples, isLoading } = useCouples()
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState<FiltreStatut>('tous')

  const couplesFiltres = couples?.filter((couple: Couple) => {
    const maleMatricule = couple.male_details?.matricule || ''
    const femelleMatricule = couple.femelle_details?.matricule || ''
    
    const matchesSearch = 
      maleMatricule.toLowerCase().includes(recherche.toLowerCase()) ||
      femelleMatricule.toLowerCase().includes(recherche.toLowerCase())
    
    const matchesStatus = filtreStatut === 'tous' || couple.statut === filtreStatut
    
    return matchesSearch && matchesStatus
  }) || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00685f]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Couples d'élevage</h1>
          <p className="text-gray-500 mt-1">Gérez les couples actifs et historiques de votre colombier.</p>
        </div>
        <Link href="/couples/new">
          <Button className="bg-[#00685f] hover:bg-[#00554d] text-white gap-2">
            <Plus className="w-4 h-4" />
            Former un couple
          </Button>
        </Link>
      </div>

      {/* Recherche & Filtres */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher par matricule..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="pl-10 bg-white border-gray-200"
          />
        </div>
        <select
          className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value as FiltreStatut)}
        >
          <option value="tous">Tous les statuts</option>
          <option value="actif">Actifs</option>
          <option value="rompu">Séparés</option>
        </select>
      </div>

      {/* Grille de cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {couplesFiltres.map((couple: Couple) => (
          <CarteCouple 
            key={couple.id} 
            couple={couple}
          />
        ))}
      </div>

      {couplesFiltres.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Aucun couple trouvé</p>
        </div>
      )}
    </div>
  )
}

function CarteCouple({ couple }: { couple: Couple }) {
  const estActif = couple.statut === 'actif'
  const estSepare = couple.statut === 'rompu'
  
  const male = couple.male_details
  const femelle = couple.femelle_details
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // Si pas de détails, afficher un message
  if (!male || !femelle) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
        <p className="text-gray-500 text-center">Données incomplètes</p>
      </div>
    )
  }

  return (
    <div className={cn(
      'relative bg-white rounded-xl border border-gray-200 overflow-hidden transition-all hover:shadow-lg',
      estActif && 'border-l-4 border-l-[#00685f]',  // 🔧 Trait vert à gauche pour actifs
      estSepare && 'opacity-60 grayscale'             // 🔧 Effet flouté/grisé pour séparés
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        {estActif ? (
          <Badge className="bg-[#d1fae5] text-[#065f46] hover:bg-[#d1fae5] font-medium">
            ACTIF
          </Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100 font-medium">
            SÉPARÉ
          </Badge>
        )}
        <button className="p-1 hover:bg-gray-100 rounded-full">
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Pigeons */}
      <div className="flex items-center justify-center gap-3 px-4 pb-3">
        {/* Mâle */}
        <div className="text-center flex-1">
          <div className="text-blue-600 text-lg mb-1">♂</div>
          <div className="bg-gray-50 rounded-lg p-2 mb-1">
            <code className="text-sm font-mono text-gray-700 block leading-tight">
              {male.matricule}
            </code>
          </div>
          <p className="text-sm text-gray-500">{male.couleur || 'Blue Bar'}</p>
        </div>

        {/* Cœur */}
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
          estSepare ? 'bg-gray-100' : 'bg-pink-50'
        )}>
          <Heart className={cn(
            'w-4 h-4',
            estSepare ? 'text-gray-300' : 'text-pink-400'
          )} />
        </div>

        {/* Femelle */}
        <div className="text-center flex-1">
          <div className="text-pink-600 text-lg mb-1">♀</div>
          <div className="bg-gray-50 rounded-lg p-2 mb-1">
            <code className="text-sm font-mono text-gray-700 block leading-tight">
              {femelle.matricule}
            </code>
          </div>
          <p className="text-sm text-gray-500">{femelle.couleur || 'Checker'}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-400 uppercase mb-0.5">
            {estSepare ? 'Durée' : 'Formé le'}
          </p>
          <p className="text-sm font-medium text-gray-700">
            {estSepare && couple.date_rupture
              ? `${formatDate(couple.date_formation)} - ${formatDate(couple.date_rupture)}`
              : formatDate(couple.date_formation)
            }
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase mb-0.5">Pontes</p>
          <p className="text-sm font-medium text-gray-700">{couple.reproductions_count || 0}</p>
        </div>
      </div>
    </div>
  )
}