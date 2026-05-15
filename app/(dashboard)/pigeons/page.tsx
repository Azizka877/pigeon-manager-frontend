'use client'

import { useState } from 'react'
import { usePigeons } from '@/hooks/use-pigeons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { Pigeon } from '@/types'

type FiltreStatut = 'tous' | 'actif' | 'vendu' | 'mort' | 'perdu'

export default function PigeonsPage() {
  const { data: pigeons, isLoading } = usePigeons()
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState<FiltreStatut>('tous')
  const [pageActuelle, setPageActuelle] = useState(1)
  const elementsParPage = 10

  const pigeonsFiltres = pigeons?.filter((pigeon) => {
    const correspondRecherche = pigeon.matricule.toLowerCase().includes(recherche.toLowerCase())
    const correspondStatut = filtreStatut === 'tous' || pigeon.statut === filtreStatut
    return correspondRecherche && correspondStatut
  }) || []

  const totalElements = pigeonsFiltres.length
  const totalPages = Math.ceil(totalElements / elementsParPage)
  const indexDebut = (pageActuelle - 1) * elementsParPage
  const pigeonsPagines = pigeonsFiltres.slice(indexDebut, indexDebut + elementsParPage)

  const getBadgeStatut = (statut: string) => {
    switch (statut) {
      case 'actif':
        return <Badge className="bg-[#00685f] text-white hover:bg-[#00685f]">ACTIF</Badge>
      case 'vendu':
        return <Badge className="bg-[#fee2e2] text-[#991b1b] hover:bg-[#fee2e2]">VENDU</Badge>
      case 'mort':
        return <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">DÉCÉDÉ</Badge>
      case 'perdu':
        return <Badge className="bg-[#ffedd5] text-[#9a3412] hover:bg-[#ffedd5]">PERDU</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600">INCONNU</Badge>
    }
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
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pigeons</h1>
      <p className="text-gray-500 mt-1 text-sm sm:text-base">
        Gérez votre registre complet de colombier.
      </p>
    </div>
    <Link href="/pigeons/new" className="w-full sm:w-auto">
      <Button className="bg-[#00685f] hover:bg-[#00554d] text-white gap-2 w-full sm:w-auto">
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Ajouter un pigeon</span>
        <span className="sm:hidden">Ajouter</span>
      </Button>
    </Link>
  </div>

  {/* Recherche & Filtres */}
  <div className="bg-white rounded-xl border border-gray-200 p-4">
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Barre de recherche */}
      <div className="relative w-full lg:w-72 shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Rechercher..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="pl-10 bg-gray-50 border-gray-200 w-full"
        />
      </div>
      
      {/* Filtres scrollables horizontalement sur mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 lg:flex-wrap scrollbar-hide">
        {(['tous', 'actif', 'vendu', 'mort', 'perdu'] as FiltreStatut[]).map((statut) => (
          <button
            key={statut}
            onClick={() => setFiltreStatut(statut)}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0',
              filtreStatut === statut
                ? 'bg-[#00685f] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {statut === 'tous' ? 'TOUS' : statut.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  </div>

  {/* Desktop : Tableau avec scroll horizontal */}
  <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Matricule
            </th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Race / Détails
            </th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Sexe / Âge
            </th>
            <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {pigeonsPagines.map((pigeon) => (
            <tr key={pigeon.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-700">
                  {pigeon.matricule}
                </code>
              </td>
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">{pigeon.race}</div>
                <div className="text-sm text-gray-500">
                  {pigeon.couleur || 'Aucune couleur spécifiée'}
                </div>
              </td>
              <td className="px-6 py-4">
                {getBadgeStatut(pigeon.statut)}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-700">
                  {pigeon.sexe === 'M' ? '♂ Mâle' : '♀ Femelle'}
                </div>
                <div className="text-sm text-gray-500">
                  {pigeon.age ? `${pigeon.age} an${pigeon.age > 1 ? 's' : ''}` : 'Âge inconnu'}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-1">
                  <Link href={`/pigeons/${pigeon.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="w-4 h-4 text-[#00685f]" />
                    </Button>
                  </Link>
                  <Link href={`/pigeons/${pigeon.id}/edit`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="w-4 h-4 text-gray-500" />
                    </Button>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Pagination desktop */}
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
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="flex items-center px-3 text-sm font-medium text-gray-700">
          {pageActuelle} / {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPageActuelle(p => Math.min(totalPages, p + 1))}
          disabled={pageActuelle === totalPages || totalPages === 0}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  </div>

  {/* Mobile : Cartes empilées */}
  <div className="md:hidden space-y-3">
    {pigeonsPagines.map((pigeon) => (
      <div 
        key={pigeon.id} 
        className="bg-white rounded-xl border border-gray-200 p-4 space-y-3"
      >
        {/* Ligne 1 : Matricule + Statut */}
        <div className="flex items-center justify-between">
          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-700">
            {pigeon.matricule}
          </code>
          {getBadgeStatut(pigeon.statut)}
        </div>

        {/* Ligne 2 : Race + Couleur */}
        <div>
          <div className="font-medium text-gray-900">{pigeon.race}</div>
          <div className="text-sm text-gray-500">
            {pigeon.couleur || 'Aucune couleur spécifiée'}
          </div>
        </div>

        {/* Ligne 3 : Sexe + Âge */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{pigeon.sexe === 'M' ? '♂ Mâle' : '♀ Femelle'}</span>
          <span className="text-gray-300">|</span>
          <span>
            {pigeon.age ? `${pigeon.age} an${pigeon.age > 1 ? 's' : ''}` : 'Âge inconnu'}
          </span>
        </div>

        {/* Ligne 4 : Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Link href={`/pigeons/${pigeon.id}`} className="flex-1">
            <Button variant="outline" className="w-full gap-2 text-[#00685f]">
              <Eye className="w-4 h-4" />
              Détails
            </Button>
          </Link>
          <Link href={`/pigeons/${pigeon.id}/edit`} className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <Pencil className="w-4 h-4" />
              Modifier
            </Button>
          </Link>
        </div>
      </div>
    ))}

    {pigeonsPagines.length === 0 && (
      <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
        <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Aucun pigeon trouvé</p>
      </div>
    )}

    {/* Pagination mobile simplifiée */}
    <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPageActuelle(p => Math.max(1, p - 1))}
        disabled={pageActuelle === 1}
        className="gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        Préc.
      </Button>
      
      <span className="text-sm font-medium text-gray-700">
        Page {pageActuelle} / {totalPages || 1}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPageActuelle(p => Math.min(totalPages, p + 1))}
        disabled={pageActuelle === totalPages || totalPages === 0}
        className="gap-1"
      >
        Suiv.
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  </div>
</div>
  )
}