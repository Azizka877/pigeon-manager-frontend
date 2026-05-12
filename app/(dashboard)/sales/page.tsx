'use client'

import { useState } from 'react'
import { useSorties } from '@/hooks/use-sales'
import { usePigeons } from '@/hooks/use-pigeons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Plane,
  Skull,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { Sortie } from '@/types'

export default function SortiesPage() {
  const { data: sorties, isLoading } = useSorties()
  const { data: pigeons } = usePigeons()
  const [pageActuelle, setPageActuelle] = useState(1)
  const elementsParPage = 10

  // 🔧 Calcul des statistiques
  const stats = {
    ventes: sorties?.filter(s => s.type_sortie === 'vente').length || 0,
    pertes: sorties?.filter(s => s.type_sortie === 'perte').length || 0,
    deces: sorties?.filter(s => s.type_sortie === 'deces').length || 0,
    totalPrix: sorties?.reduce((acc, s) => acc + (s.prix ? parseFloat(s.prix) : 0), 0) || 0,
  }

  const getPigeonMatricule = (pigeonId: string) => {
    const pigeon = pigeons?.find(p => p.id === pigeonId)
    return pigeon?.matricule || pigeonId.slice(0, 8) + '...'
  }

  const getBadgeType = (type: string) => {
    switch (type) {
      case 'vente':
        return (
          <Badge className="bg-[#00685f] text-white hover:bg-[#00685f] gap-1">
            <DollarSign className="w-3 h-3" />
            VENTE
          </Badge>
        )
      case 'perte':
        return (
          <Badge className="bg-[#c2410c] text-white hover:bg-[#c2410c] gap-1">
            <Plane className="w-3 h-3" />
            PERTE
          </Badge>
        )
      case 'deces':
        return (
          <Badge className="bg-gray-400 text-white hover:bg-gray-400 gap-1">
            <Skull className="w-3 h-3" />
            DÉCÈS
          </Badge>
        )
      default:
        return <Badge className="bg-gray-100 text-gray-600">INCONNU</Badge>
    }
  }

  const getIconeType = (type: string) => {
    switch (type) {
      case 'vente': return <DollarSign className="w-5 h-5 text-[#00685f]" />
      case 'perte': return <Plane className="w-5 h-5 text-[#c2410c]" />
      case 'deces': return <Skull className="w-5 h-5 text-gray-500" />
      default: return <AlertTriangle className="w-5 h-5 text-gray-400" />
    }
  }

  // Pagination
  const totalElements = sorties?.length || 0
  const totalPages = Math.ceil(totalElements / elementsParPage)
  const indexDebut = (pageActuelle - 1) * elementsParPage
  const sortiesPagines = sorties?.slice(indexDebut, indexDebut + elementsParPage) || []

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
          <h1 className="text-3xl font-bold text-gray-900">Historique des sorties</h1>
          <p className="text-gray-500 mt-1">Gérez et consultez toutes les sorties de pigeons : ventes, pertes et décès.</p>
        </div>
        <Link href="/sales/new">
          <Button className="bg-[#00685f] hover:bg-[#00554d] text-white gap-2">
            <Plus className="w-4 h-4" />
            Enregistrer une sortie
          </Button>
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4">
        <CarteStat 
          titre="VENTES TOTALES"
          valeur={stats.ventes}
          icone={<DollarSign className="w-5 h-5 text-white" />}
          couleurFond="bg-[#00685f]"
          tendance="+12% ce mois"
          iconeTendance={<TrendingUp className="w-4 h-4 text-[#00685f]" />}
        />
        <CarteStat 
          titre="PERTES TOTALES"
          valeur={stats.pertes}
          icone={<Plane className="w-5 h-5 text-white" />}
          couleurFond="bg-[#c2410c]"
          tendance="-2% ce mois"
          iconeTendance={<TrendingDown className="w-4 h-4 text-[#c2410c]" />}
        />
        <CarteStat 
          titre="DÉCÈS TOTAUX"
          valeur={stats.deces}
          icone={<Skull className="w-5 h-5 text-gray-600" />}
          couleurFond="bg-gray-200"
          tendance="Stable"
          iconeTendance={<Minus className="w-4 h-4 text-gray-400" />}
        />
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Matricule
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Type de sortie
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Détails
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortiesPagines.map((sortie: Sortie) => (
              <tr key={sortie.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-700">
                    {getPigeonMatricule(sortie.pigeon)}
                  </code>
                </td>
                <td className="px-6 py-4">
                  {getBadgeType(sortie.type_sortie)}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-700">
                    {new Date(sortie.date_sortie).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {sortie.cause || sortie.circonstances || sortie.notes || 'Aucun détail'}
                  </p>
                  {sortie.prix && (
                    <p className="text-sm font-medium text-[#00685f] mt-1">
                      {parseFloat(sortie.prix).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </p>
                  )}
                  {sortie.acheteur && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Acheteur : {sortie.acheteur}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button className="p-1 hover:bg-gray-100 rounded-full">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Affichage de {indexDebut + 1} à {Math.min(indexDebut + elementsParPage, totalElements)} sur {totalElements} entrées
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageActuelle(p => Math.max(1, p - 1))}
                disabled={pageActuelle === 1}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageActuelle(p => Math.min(totalPages, p + 1))}
                disabled={pageActuelle === totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}

        {(!sorties || sorties.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune sortie enregistrée</p>
          </div>
        )}
      </div>
    </div>
  )
}

function CarteStat({ 
  titre, 
  valeur, 
  icone, 
  couleurFond, 
  tendance, 
  iconeTendance 
}: { 
  titre: string
  valeur: number
  icone: React.ReactNode
  couleurFond: string
  tendance: string
  iconeTendance: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', couleurFond)}>
          {icone}
        </div>
      </div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{titre}</p>
      <p className="text-2xl font-bold text-gray-900 mb-2">{valeur}</p>
      <div className="flex items-center gap-1 text-sm">
        {iconeTendance}
        <span className="text-gray-500">{tendance}</span>
      </div>
    </div>
  )
}