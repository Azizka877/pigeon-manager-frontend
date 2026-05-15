// app/couples/page.tsx
'use client'

import { useState } from 'react'
import { useCouples, useUpdateCouple } from '@/hooks/use-couples'
import { useQuickCreateReproduction } from '@/hooks/use-reproductions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Plus, 
  MoreVertical,
  Heart,
  Egg,
  Check,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Couple } from '@/types'

type FiltreStatut = 'tous' | 'actif' | 'rompu'

export default function CouplesPage() {
  const { data: couplesData, isLoading } = useCouples()
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState<FiltreStatut>('tous')

  const couples = couplesData?.results || []

  const couplesFiltres = couples.filter((couple: Couple) => {
    const maleMatricule = couple.male_details?.matricule || ''
    const femelleMatricule = couple.femelle_details?.matricule || ''
    
    const matchesSearch = 
      maleMatricule.toLowerCase().includes(recherche.toLowerCase()) ||
      femelleMatricule.toLowerCase().includes(recherche.toLowerCase())
    
    const matchesStatus = filtreStatut === 'tous' || couple.statut === filtreStatut
    
    return matchesSearch && matchesStatus
  })

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
          <CarteCouple key={couple.id} couple={couple} />
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

// ─── CarteCouple avec Quick Ponte ───
function CarteCouple({ couple }: { couple: Couple }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const quickCreate = useQuickCreateReproduction()
  const updateCouple = useUpdateCouple()

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

  // 🥚 QUICK PONTE : 1 clic pour noter une ponte aujourd'hui
  const handleQuickPonte = async () => {
    const today = new Date().toISOString().split('T')[0]
    
    try {
      // 1. Crée la reproduction
      await quickCreate.mutateAsync({
        couple: couple.id,
        date_ponte: today,
        nombre_oeufs: 2,
      })
      
      // 2. Met à jour le compteur du couple
      await updateCouple.mutateAsync({
        id: couple.id,
        data: {
          reproductions_count: (couple.reproductions_count || 0) + 1
        }
      })
      
      toast.success(`✅ Ponte du ${today} enregistrée pour ${male?.matricule} + ${femelle?.matricule}`)
      setShowConfirm(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Erreur lors de l'enregistrement")
    }
  }

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
      estActif && 'border-l-4 border-l-[#00685f]',
      estSepare && 'opacity-60 grayscale'
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
        
        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* 🥚 BOUTON QUICK PONTE */}
          {estActif && (
            <>
              {showConfirm ? (
                <div className="flex items-center gap-1 bg-[#f5faf8] rounded-lg px-2 py-1">
                  <span className="text-xs text-[#00685f] font-medium">Aujourd'hui ?</span>
                  <button 
                    onClick={handleQuickPonte}
                    disabled={quickCreate.isPending}
                    className="p-1 hover:bg-[#00685f] hover:text-white rounded text-[#00685f] transition-colors"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => setShowConfirm(false)}
                    className="p-1 hover:bg-red-50 rounded text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowConfirm(true)}
                  className="p-1.5 hover:bg-[#f5faf8] rounded-full text-[#00685f] transition-colors"
                  title="Noter une ponte aujourd'hui"
                >
                  <Egg className="w-4 h-4" />
                </button>
              )}
            </>
          )}
          
          <button className="p-1.5 hover:bg-gray-100 rounded-full">
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Pigeons */}
      <div className="flex items-center justify-center gap-3 px-4 py-4">
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
        <Link 
          href={`/reproductions?couple=${couple.id}`}
          className="text-right hover:bg-gray-50 p-2 rounded-lg transition-colors"
        >
          <p className="text-xs text-gray-400 uppercase mb-0.5">Pontes</p>
          <p className="text-sm font-medium text-[#00685f]">{couple.reproductions_count || 0}</p>
        </Link>
      </div>
    </div>
  )
}