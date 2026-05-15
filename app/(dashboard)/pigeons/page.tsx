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
      {/* En-tête */}
      <div className=" flex-col lg:flex-row flex items-center justify-between">
        <div className='mb-3 md:m-0'>
          <h1 className="text-3xl font-bold text-gray-900">Pigeons</h1>
          <p className="text-gray-500 mt-1">Gérez votre registre complet de colombier.</p>
        </div>
        <Link href="/pigeons/new">
          <Button className="bg-[#00685f] hover:bg-[#00554d] text-white gap-2">
            <Plus className="w-4 h-4" />
            Ajouter un pigeon
          </Button>
        </Link>
      </div>

      {/* Recherche & Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
    <div className="relative  sm:min-w-0 w-auto  max-w-[200px] md:max-w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input
        placeholder="Rechercher..."
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        className="pl-10 bg-gray-50 border-gray-200 w-full "
      />
    </div>
    <div className="flex gap-2 flex-wrap flex-1">
      {(['tous', 'actif', 'vendu', 'mort', 'perdu'] as FiltreStatut[]).map((statut) => (
        <button
          key={statut}
          onClick={() => setFiltreStatut(statut)}
          className={cn(
            'px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
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

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gray-200 ">
        <table className="w-full overflow-x-auto">
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
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                  <div className="flex gap-2">
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

        {/* Pagination */}
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
              {pageActuelle}
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
    </div>
  )
}