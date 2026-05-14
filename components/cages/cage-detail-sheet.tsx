// components/cages/cage-detail-sheet.tsx
'use client'

import { useCageStore } from '@/stores/cage-store'
import { useCageHistory } from '@/hooks/use-cage-history'
import { useCage, useCages, useLibererCage, useOccuperCage } from '@/hooks/use-cages'
import { usePigeons } from '@/hooks/use-pigeons'
import { useCouples } from '@/hooks/use-couples'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Clock,
  UserPlus,
  Users,
  Trash2,
  FileText,
  X,
  ChevronRight,
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getPigeonImage } from '@/lib/pigeon-images'
import { HistoriqueItem } from '@/types'
import { useRouter } from 'next/navigation'


export function CageDetailSheet() {
  const { selectedCage, setSelectedCage } = useCageStore()
  const { data: cage, isLoading } = useCage(selectedCage || '')
  const { data: allCages } = useCages()
  const { data: pigeons } = usePigeons()
  const { data: couples } = useCouples()
  const libererMutation = useLibererCage()
  const occuperMutation = useOccuperCage()
const { data: historiqueAPI } = useCageHistory(selectedCage || '')
  const [selectedPigeon, setSelectedPigeon] = useState('')
  const [selectedCouple, setSelectedCouple] = useState('')
  const [showAffecterPigeon, setShowAffecterPigeon] = useState(false)
  const [showAffecterCouple, setShowAffecterCouple] = useState(false)
const router = useRouter()
  const isOpen = !!selectedCage

  const handleClose = () => {
    setSelectedCage(null)
    setSelectedPigeon('')
    setSelectedCouple('')
    setShowAffecterPigeon(false)
    setShowAffecterCouple(false)
  }

  // ─── FILTRAGE DES PIGEONS DISPONIBLES ─────────────────────────────
  const pigeonsDisponibles = useMemo(() => {
    if (!pigeons || !allCages) return []
    const pigeonsEnCage = new Set<string>()
    allCages.forEach((c) => {
      if (!c.occupation_actuelle) return
      if (c.occupation_actuelle.type === 'seul' && c.occupation_actuelle.pigeon) {
        pigeonsEnCage.add(c.occupation_actuelle.pigeon.id)
      }
      if (c.occupation_actuelle.type === 'couple' && c.occupation_actuelle.couple) {
        if (c.occupation_actuelle.couple.male) pigeonsEnCage.add(c.occupation_actuelle.couple.male)
        if (c.occupation_actuelle.couple.femelle) pigeonsEnCage.add(c.occupation_actuelle.couple.femelle)
      }
    })
    return pigeons.filter((p) => p.statut === 'actif' && !pigeonsEnCage.has(p.id))
  }, [pigeons, allCages])

  // ─── FILTRAGE DES COUPLES ACTIFS ──────────────────────────────────
  const couplesActifs = useMemo(() => {
    if (!couples || !allCages) return []
    const couplesEnCage = new Set<string>()
    allCages.forEach((c) => {
      if (c.occupation_actuelle?.type === 'couple' && c.occupation_actuelle.couple) {
        couplesEnCage.add(c.occupation_actuelle.couple.id)
      }
    })
    return couples.filter((c) => c.statut === 'actif' && !couplesEnCage.has(c.id))
  }, [couples, allCages])


  const handleVoirHistorique = () => {
    if (selectedCage) {
      router.push(`/cages/${selectedCage}/historique`)
      handleClose()
    }
  }
  // ─── HISTORIQUE MOCK (à remplacer par vraie API) ──────────────────
   const historique = useMemo(() => {
  const items: HistoriqueItem[] = []
  
  // Occupation actuelle
  if (cage?.occupation_actuelle?.date_debut) {
    items.push({
      id: 'current',
      type_action: 'occupation',
      description: cage.occupation_actuelle.type === 'couple' 
        ? 'Couple affecté' 
        : 'Pigeon affecté',
      date_action: cage.occupation_actuelle.date_debut,
      date_formatee: new Date(cage.occupation_actuelle.date_debut).toLocaleDateString('fr-FR'),
      utilisateur_nom: '',
      metadata: {},
    })
  }
  
  // Historique depuis l'API
  if (historiqueAPI) {
    items.push(...historiqueAPI)
  }
  
  return items.sort((a, b) => 
    new Date(b.date_action).getTime() - new Date(a.date_action).getTime()
  )
}, [cage, historiqueAPI])




  const handleLiberer = async () => {
  if (!selectedCage) return
  try {
    console.log("🔴 LIBERER - cageId:", selectedCage)
    const result = await libererMutation.mutateAsync(selectedCage)
    console.log("🔴 LIBERER - succès:", result)
    toast.success('Cage libérée avec succès')
    handleClose()
  } catch (err: any) {
    console.error("🔴 LIBERER - ERREUR COMPLÈTE:", err)
    console.error("🔴 LIBERER - err.response:", err.response)
    console.error("🔴 LIBERER - err.response?.data:", err.response?.data)
    console.error("🔴 LIBERER - err.response?.status:", err.response?.status)
    console.error("🔴 LIBERER - err.message:", err.message)
    toast.error(`Erreur libération: ${err.response?.data?.detail || err.message || 'Inconnue'}`)
  }
}


 const handleAffecterPigeon = async () => {
  if (!selectedCage || !selectedPigeon) return
  
  const payload = {
    cage_id: selectedCage,      // ✅ snake_case
    pigeon_id: selectedPigeon,  // ✅ snake_case
    type_occupation: 'seul' as const,     // ✅ snake_case
  }
  
  console.log("🔴 AFFECTER PIGEON - payload:", payload)
  
  try {
    const result = await occuperMutation.mutateAsync(payload)
    console.log("🔴 AFFECTER PIGEON - succès:", result)
    toast.success('Pigeon affecté avec succès')
    setSelectedPigeon('')
    setShowAffecterPigeon(false)
  } catch (err: any) {
    console.error("🔴 AFFECTER PIGEON - ERREUR COMPLÈTE:", err)
    console.error("🔴 AFFECTER PIGEON - err.response:", err.response)
    console.error("🔴 AFFECTER PIGEON - err.response?.data:", err.response?.data)
    console.error("🔴 AFFECTER PIGEON - err.response?.status:", err.response?.status)
    console.error("🔴 AFFECTER PIGEON - err.message:", err.message)
    toast.error(`Erreur affectation: ${JSON.stringify(err.response?.data) || err.message || 'Inconnue'}`)
  }
}



  const handleAffecterCouple = async () => {
  if (!selectedCage || !selectedCouple) return
  
  const payload = {
    cage_id: selectedCage,       // ✅ snake_case
    couple_id: selectedCouple,   // ✅ snake_case
    type_occupation: 'couple' as const,   // ✅ snake_case
  }
  
  console.log("🔴 AFFECTER COUPLE - payload:", payload)
  
  try {
    const result = await occuperMutation.mutateAsync(payload)
    console.log("🔴 AFFECTER COUPLE - succès:", result)
    toast.success('Couple affecté avec succès')
    setSelectedCouple('')
    setShowAffecterCouple(false)
  } catch (err: any) {
    console.error("🔴 AFFECTER COUPLE - ERREUR COMPLÈTE:", err)
    console.error("🔴 AFFECTER COUPLE - err.response:", err.response)
    console.error("🔴 AFFECTER COUPLE - err.response?.data:", err.response?.data)
    console.error("🔴 AFFECTER COUPLE - err.response?.status:", err.response?.status)
    console.error("🔴 AFFECTER COUPLE - err.message:", err.message)
    toast.error(`Erreur affectation: ${JSON.stringify(err.response?.data) || err.message || 'Inconnue'}`)
  }
}




  const isOccupied = !!cage?.occupation_actuelle
  const isCouple = cage?.occupation_actuelle?.type === 'couple'

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-[420px] p-0 overflow-hidden flex flex-col bg-white"
      >
        {/* ─── HEADER ─────────────────────────────────────────────── */}
        <SheetHeader className="relative pt-6 pb-2 px-6 border-b-0">
         

          <SheetTitle className="text-center text-2xl font-bold text-gray-900">
            Cage {cage?.numero}
          </SheetTitle>

          <div className="flex justify-center mt-2">
            <div className={cn(
              'inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium',
              !isOccupied && 'bg-green-100 text-green-700',
              isOccupied && !isCouple && 'bg-red-100 text-red-700',
              isCouple && 'bg-orange-100 text-orange-700'
            )}>
              {!isOccupied && (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Libre
                </>
              )}
              {isOccupied && !isCouple && (
                <>
                  <Users className="w-4 h-4" />
                  Occupée par un pigeon
                </>
              )}
              {isCouple && (
                <>
                  <Users className="w-4 h-4" />
                  Occupée par un couple
                </>
              )}
            </div>
          </div>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        ) : (
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-6 py-4">
              
              {/* ═══ SECTION: PIGEONS ═════════════════════════════════ */}
              {isOccupied && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Pigeons
                  </h3>

                  {/* PIGEON SEUL */}
                  {!isCouple && cage.occupation_actuelle?.pigeon && (
                    <div className="flex gap-3 p-3 rounded-xl border border-gray-200 bg-white shadow-sm">
                      {/* Image locale */}
                      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={getPigeonImage(cage.occupation_actuelle.pigeon.id, cage.occupation_actuelle.pigeon.sexe)}
                          alt={cage.occupation_actuelle.pigeon.matricule}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'font-semibold text-sm',
                          cage.occupation_actuelle.pigeon.sexe === 'M' ? 'text-blue-600' : 'text-pink-500'
                        )}>
                          {cage.occupation_actuelle.pigeon.sexe === 'M' ? 'Mâle' : 'Femelle'}
                        </p>
                        <p className="text-sm text-gray-700">
                          Matricule : {cage.occupation_actuelle.pigeon.matricule}
                        </p>
                        <p className="text-sm text-gray-700">
                          Race : {cage.occupation_actuelle.pigeon.race}
                        </p>
                        <p className="text-sm text-gray-700">
                          Âge : {cage.occupation_actuelle.pigeon.age} {cage.occupation_actuelle.pigeon.age > 1 ? 'ans' : 'an'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* COUPLE */}
                  {isCouple && cage.occupation_actuelle?.couple && (
                    <div className="space-y-3">
                      {/* MÂLE */}
                      <div className="flex gap-3 p-3 rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={getPigeonImage(
                              cage.occupation_actuelle.couple.male_details?.id || cage.occupation_actuelle.couple.male,
                              'M'
                            )}
                            alt="Mâle"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-blue-600">
                            Mâle
                          </p>
                          <p className="text-sm text-gray-700">
                            Matricule : {cage.occupation_actuelle.couple.male_details?.matricule || cage.occupation_actuelle.couple.male}
                          </p>
                          <p className="text-sm text-gray-700">
                            Race : {cage.occupation_actuelle.couple.male_details?.race || 'Voyageur'}
                          </p>
                          <p className="text-sm text-gray-700">
                            Âge : {cage.occupation_actuelle.couple.male_details?.age || 2} {cage.occupation_actuelle.couple.male_details?.age && cage.occupation_actuelle.couple.male_details.age > 1 ? 'ans' : 'an'}
                          </p>
                        </div>
                      </div>

                      {/* FEMELLE */}
                      <div className="flex gap-3 p-3 rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={getPigeonImage(
                              cage.occupation_actuelle.couple.femelle_details?.id || cage.occupation_actuelle.couple.femelle,
                              'F'
                            )}
                            alt="Femelle"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-pink-500">
                            Femelle
                          </p>
                          <p className="text-sm text-gray-700">
                            Matricule : {cage.occupation_actuelle.couple.femelle_details?.matricule || cage.occupation_actuelle.couple.femelle}
                          </p>
                          <p className="text-sm text-gray-700">
                            Race : {cage.occupation_actuelle.couple.femelle_details?.race || 'Voyageur'}
                          </p>
                          <p className="text-sm text-gray-700">
                            Âge : {cage.occupation_actuelle.couple.femelle_details?.age || 1} {cage.occupation_actuelle.couple.femelle_details?.age && cage.occupation_actuelle.couple.femelle_details.age > 1 ? 'ans' : 'an'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ═══ SECTION: HISTORIQUE ══════════════════════════════ */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700">
                  Historique
                </h3>
                <div className="space-y-2">
                  {historique.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      {item.type_action === 'occupation' ? (
                        <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                      )}
                      <span className="text-gray-600">
                        <span className="font-medium">{item.date_formatee}</span> : {item.description}
                      </span>
                    </div>
                  ))}
                </div>
                <button 
                 onClick={handleVoirHistorique}
                 className="text-blue-500 text-sm font-medium hover:text-blue-600 flex items-center gap-1"
               >
                 Voir tout l'historique
                 <ChevronRight className="w-4 h-4" />
               </button>
              </div>

              {/* ═══ SECTION: ACTIONS ═════════════════════════════════ */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-700">
                  Actions
                </h3>

                <div className="space-y-2.5">
                  {/* AFFECTER UN PIGEON */}
                  {!isOccupied && (
                    <>
                      <Dialog open={showAffecterPigeon} onOpenChange={setShowAffecterPigeon}>
                        <DialogTrigger asChild>
                          <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-blue-500 text-blue-600 font-medium hover:bg-blue-50 transition-colors">
                            <UserPlus className="w-5 h-5" />
                            Affecter un pigeon
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Affecter un pigeon à la cage {cage?.numero}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <Select value={selectedPigeon} onValueChange={setSelectedPigeon}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choisir un pigeon..." />
                              </SelectTrigger>
                              <SelectContent>
                                {pigeonsDisponibles.length === 0 && (
                                  <SelectItem value="none" disabled>
                                    Aucun pigeon disponible
                                  </SelectItem>
                                )}
                                {pigeonsDisponibles.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.matricule} — {p.race} ({p.sexe_display})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" onClick={() => setShowAffecterPigeon(false)}>
                                Annuler
                              </Button>
                              <Button 
                                onClick={handleAffecterPigeon}
                                disabled={!selectedPigeon || occuperMutation.isPending}
                              >
                                Confirmer
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* AFFECTER UN COUPLE */}
                      <Dialog open={showAffecterCouple} onOpenChange={setShowAffecterCouple}>
                        <DialogTrigger asChild>
                          <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-orange-500 text-orange-600 font-medium hover:bg-orange-50 transition-colors">
                            <Users className="w-5 h-5" />
                            Affecter un couple
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Affecter un couple à la cage {cage?.numero}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <Select value={selectedCouple} onValueChange={setSelectedCouple}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choisir un couple..." />
                              </SelectTrigger>
                              <SelectContent>
                                {couplesActifs.length === 0 && (
                                  <SelectItem value="none" disabled>
                                    Aucun couple disponible
                                  </SelectItem>
                                )}
                                {couplesActifs.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.male_details?.matricule || c.male} + {c.femelle_details?.matricule || c.femelle}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" onClick={() => setShowAffecterCouple(false)}>
                                Annuler
                              </Button>
                              <Button 
                                onClick={handleAffecterCouple}
                                disabled={!selectedCouple || occuperMutation.isPending}
                              >
                                Confirmer
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}

                  {/* LIBÉRER LA CAGE (si occupée) */}
                  {isOccupied && (
                    <button
                      onClick={handleLiberer}
                      disabled={libererMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-red-500 text-red-600 font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                      Libérer la cage
                    </button>
                  )}

                  {/* VOIR HISTORIQUE COMPLET */}
                  <button 
                       onClick={handleVoirHistorique}
                       className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                       >
                        <FileText className="w-5 h-5" />
                          Voir historique complet
                    </button>
                </div>
              </div>

            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  )
}