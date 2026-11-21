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
  ChevronRight,
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getPigeonImage } from '@/lib/pigeon-images'
import { HistoriqueItem } from '@/types'
import { useRouter } from 'next/navigation'

// Carte pigeon réutilisable (seul / mâle / femelle)
function LignePigeon({
  imageSrc,
  libelle,
  libelleClasse,
  matricule,
  race,
  age,
}: {
  imageSrc: string
  libelle: string
  libelleClasse: string
  matricule: string
  race: string
  age?: number
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-outline-variant/60 bg-surface-container-low p-3 shadow-sm">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-surface-container-high">
        <img src={imageSrc} alt={matricule} className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-semibold', libelleClasse)}>{libelle}</p>
        <p className="text-sm text-on-surface-variant">
          Matricule : <span className="font-medium text-on-surface">{matricule}</span>
        </p>
        <p className="text-sm text-on-surface-variant">Race : {race}</p>
        {age !== undefined && (
          <p className="text-sm text-on-surface-variant">
            Âge : {age} {age > 1 ? 'ans' : 'an'}
          </p>
        )}
      </div>
    </div>
  )
}

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
    return couples.results?.filter((c) => c.statut === 'actif' && !couplesEnCage.has(c.id)) ?? []
  }, [couples, allCages])

  const handleVoirHistorique = () => {
    if (selectedCage) {
      router.push(`/cages/${selectedCage}/historique`)
      handleClose()
    }
  }

  // ─── HISTORIQUE : occupation actuelle + API ───────────────────────
  const historique = useMemo(() => {
    const items: HistoriqueItem[] = []

    if (cage?.occupation_actuelle?.date_debut) {
      items.push({
        id: 'current',
        type_action: 'occupation',
        description:
          cage.occupation_actuelle.type === 'couple' ? 'Couple affecté' : 'Pigeon affecté',
        date_action: cage.occupation_actuelle.date_debut,
        date_formatee: new Date(cage.occupation_actuelle.date_debut).toLocaleDateString('fr-FR'),
        utilisateur_nom: '',
        metadata: {},
      })
    }

    if (historiqueAPI) {
      items.push(...historiqueAPI)
    }

    return items.sort(
      (a, b) => new Date(b.date_action).getTime() - new Date(a.date_action).getTime()
    )
  }, [cage, historiqueAPI])

  const handleLiberer = async () => {
    if (!selectedCage) return
    try {
      await libererMutation.mutateAsync(selectedCage)
      toast.success('Cage libérée avec succès')
      handleClose()
    } catch (err: any) {
      toast.error(`Erreur libération: ${err.response?.data?.detail || err.message || 'Inconnue'}`)
    }
  }

  const handleAffecterPigeon = async () => {
    if (!selectedCage || !selectedPigeon) return

    try {
      await occuperMutation.mutateAsync({
        cage_id: selectedCage,
        pigeon_id: selectedPigeon,
        type_occupation: 'seul' as const,
      })

      toast.success('Pigeon affecté avec succès')
      setShowAffecterPigeon(false)
      setSelectedPigeon('')
      handleClose()
    } catch (err: any) {
      toast.error(`Erreur affectation: ${JSON.stringify(err.response?.data) || err.message || 'Inconnue'}`)
    }
  }

  const handleAffecterCouple = async () => {
    if (!selectedCage || !selectedCouple) return

    try {
      await occuperMutation.mutateAsync({
        cage_id: selectedCage,
        couple_id: selectedCouple,
        type_occupation: 'couple' as const,
      })

      toast.success('Couple affecté avec succès')
      setShowAffecterCouple(false)
      setSelectedCouple('')
      handleClose()
    } catch (err: any) {
      toast.error(`Erreur affectation: ${JSON.stringify(err.response?.data) || err.message || 'Inconnue'}`)
    }
  }

  const isOccupied = !!cage?.occupation_actuelle
  const isCouple = cage?.occupation_actuelle?.type === 'couple'

  const styleStatut = !isOccupied
    ? 'bg-emerald-100 text-emerald-700'
    : isCouple
      ? 'bg-amber-100 text-amber-700'
      : 'bg-sky-100 text-sky-700'
  const dotStatut = !isOccupied ? 'bg-emerald-500' : isCouple ? 'bg-amber-500' : 'bg-sky-500'

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col overflow-hidden bg-surface p-0 sm:max-w-[420px]"
      >
        {/* ─── HEADER ─────────────────────────────────────────────── */}
        <SheetHeader className="relative px-6 pb-4 pt-6">
          <SheetTitle className="text-center text-2xl font-bold text-on-surface">
            Cage {cage?.numero}
          </SheetTitle>

          <div className="mt-2 flex justify-center">
            <div
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium',
                styleStatut,
              )}
            >
              <span className={cn('h-2 w-2 rounded-full', dotStatut)} />
              {!isOccupied && 'Libre'}
              {isOccupied && !isCouple && 'Occupée par un pigeon'}
              {isCouple && 'Occupée par un couple'}
            </div>
          </div>

          {isOccupied && !isCouple && cage.occupation_actuelle?.pigeon && (
            <div className="mt-1.5 text-center">
              <p className="text-sm font-medium text-on-surface">
                {cage.occupation_actuelle.pigeon.matricule}
              </p>
            </div>
          )}

          {isCouple && cage.occupation_actuelle?.couple && (
            <div className="mt-1.5 text-center">
              <p className="text-sm font-medium text-on-surface">
                {cage.occupation_actuelle.couple.male_details?.matricule ||
                  cage.occupation_actuelle.couple.male}{' '}
                +{' '}
                {cage.occupation_actuelle.couple.femelle_details?.matricule ||
                  cage.occupation_actuelle.couple.femelle}
              </p>
            </div>
          )}
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#00685f]" />
          </div>
        ) : (
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-6 py-4">
              {/* ═══ SECTION: PIGEONS ═════════════════════════════════ */}
              {isOccupied && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
                    Pigeons
                  </h3>

                  {!isCouple && cage.occupation_actuelle?.pigeon && (
                    <LignePigeon
                      imageSrc={getPigeonImage(
                        cage.occupation_actuelle.pigeon.id,
                        cage.occupation_actuelle.pigeon.sexe
                      )}
                      libelle={cage.occupation_actuelle.pigeon.sexe === 'M' ? 'Mâle' : 'Femelle'}
                      libelleClasse={
                        cage.occupation_actuelle.pigeon.sexe === 'M' ? 'text-blue-600' : 'text-pink-500'
                      }
                      matricule={cage.occupation_actuelle.pigeon.matricule}
                      race={cage.occupation_actuelle.pigeon.race}
                      age={cage.occupation_actuelle.pigeon.age}
                    />
                  )}

                  {isCouple && cage.occupation_actuelle?.couple && (
                    <div className="space-y-3">
                      <LignePigeon
                        imageSrc={getPigeonImage(
                          cage.occupation_actuelle.couple.male_details?.id ||
                            cage.occupation_actuelle.couple.male,
                          'M'
                        )}
                        libelle="Mâle"
                        libelleClasse="text-blue-600"
                        matricule={
                          cage.occupation_actuelle.couple.male_details?.matricule ||
                          cage.occupation_actuelle.couple.male
                        }
                        race={cage.occupation_actuelle.couple.male_details?.race || 'Voyageur'}
                        age={cage.occupation_actuelle.couple.male_details?.age ?? 2}
                      />
                      <LignePigeon
                        imageSrc={getPigeonImage(
                          cage.occupation_actuelle.couple.femelle_details?.id ||
                            cage.occupation_actuelle.couple.femelle,
                          'F'
                        )}
                        libelle="Femelle"
                        libelleClasse="text-pink-500"
                        matricule={
                          cage.occupation_actuelle.couple.femelle_details?.matricule ||
                          cage.occupation_actuelle.couple.femelle
                        }
                        race={cage.occupation_actuelle.couple.femelle_details?.race || 'Voyageur'}
                        age={cage.occupation_actuelle.couple.femelle_details?.age ?? 1}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ═══ SECTION: HISTORIQUE ══════════════════════════════ */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
                  Historique
                </h3>
                <div className="space-y-2">
                  {historique.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      {item.type_action === 'occupation' ? (
                        <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      ) : (
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-outline-variant" />
                      )}
                      <span className="text-on-surface-variant">
                        <span className="font-medium text-on-surface">{item.date_formatee}</span> :{' '}
                        {item.description}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleVoirHistorique}
                  className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Voir tout l'historique
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* ═══ SECTION: ACTIONS ═════════════════════════════════ */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant">
                  Actions
                </h3>

                <div className="space-y-2.5">
                  {!isOccupied && (
                    <>
                      <Dialog open={showAffecterPigeon} onOpenChange={setShowAffecterPigeon}>
                        <DialogTrigger asChild>
                          <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary px-4 py-3 font-medium text-primary transition-colors hover:bg-primary-container/30">
                            <UserPlus className="h-5 w-5" />
                            Affecter un pigeon
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Affecter un pigeon à la cage {cage?.numero}
                            </DialogTitle>
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
                            <div className="flex justify-end gap-2">
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

                      <Dialog open={showAffecterCouple} onOpenChange={setShowAffecterCouple}>
                        <DialogTrigger asChild>
                          <button className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-amber-500 px-4 py-3 font-medium text-amber-600 transition-colors hover:bg-amber-50">
                            <Users className="h-5 w-5" />
                            Affecter un couple
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Affecter un couple à la cage {cage?.numero}
                            </DialogTitle>
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
                                    {c.male_details?.matricule || c.male} +{' '}
                                    {c.femelle_details?.matricule || c.femelle}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex justify-end gap-2">
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

                  {isOccupied && (
                    <button
                      onClick={handleLiberer}
                      disabled={libererMutation.isPending}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-destructive/60 px-4 py-3 font-medium text-destructive transition-colors hover:bg-error-container/50 disabled:opacity-50"
                    >
                      <Trash2 className="h-5 w-5" />
                      Libérer la cage
                    </button>
                  )}

                  <button
                    onClick={handleVoirHistorique}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-outline-variant px-4 py-3 font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
                  >
                    <FileText className="h-5 w-5" />
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