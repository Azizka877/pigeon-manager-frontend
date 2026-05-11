'use client'

import { useCage } from '@/hooks/use-cages'
import { useOccuperCage, useLibererCage } from '@/hooks/use-cages'
import { usePigeons } from '@/hooks/use-pigeons'
import { useCouples } from '@/hooks/use-couples'
import { useCageStore } from '@/stores/cage-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Bird, Heart, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { toast } from 'sonner'

export function CageDetailPanel({ cageId }: { cageId: string }) {
  const { data: cage } = useCage(cageId)
  const { data: pigeons } = usePigeons()
  const { data: couples } = useCouples()
  const setSelectedCage = useCageStore((state) => state.setSelectedCage)
  const liberer = useLibererCage()
  const occuper = useOccuperCage()

  const [selectedPigeon, setSelectedPigeon] = useState('')
  const [selectedCouple, setSelectedCouple] = useState('')

  if (!cage) return null

  const isOccupied = !!cage.occupation_actuelle
  const isCouple = cage.occupation_actuelle?.type === 'couple'

  const handleLiberer = async () => {
    try {
      await liberer.mutateAsync(cageId)
      toast.success('Cage libérée')
      setSelectedCage(null)
    } catch {
      toast.error('Erreur lors de la libération')
    }
  }

  const handleOccuperPigeon = async () => {
    if (!selectedPigeon) return
    try {
      await occuper.mutateAsync({ cageId, pigeonId: selectedPigeon, type: 'seul' })
      toast.success('Pigeon affecté')
      setSelectedPigeon('')
    } catch {
      toast.error("Erreur lors de l'affectation")
    }
  }

  const handleOccuperCouple = async () => {
    if (!selectedCouple) return
    try {
      await occuper.mutateAsync({ cageId, coupleId: selectedCouple, type: 'couple' })
      toast.success('Couple affecté')
      setSelectedCouple('')
    } catch {
      toast.error("Erreur lors de l'affectation")
    }
  }

  const pigeonsDisponibles = pigeons?.filter(
    (p) => p.statut === 'actif' && !p.deleted_at
  ) || []

  const couplesDisponibles = couples?.filter(
    (c) => c.statut === 'actif' && !c.date_rupture
  ) || []

  return (
    <Card className="w-[380px] shrink-0 animate-in slide-in-from-right duration-300 h-fit sticky top-24">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Cage {cage.numero}</h2>
            <p className="text-sm text-on-surface-variant">{cage.nom}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedCage(null)}
            className="shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Status */}
        <Badge className={cn(
          'text-sm px-3 py-1',
          isCouple ? 'bg-[#ffedd5] text-[#9a3412] hover:bg-[#ffedd5]' :
          isOccupied ? 'bg-[#fee2e2] text-[#991b1b] hover:bg-[#fee2e2]' :
          'bg-[#d1fae5] text-[#065f46] hover:bg-[#d1fae5]'
        )}>
          {isCouple ? 'Occupée par un couple' :
           isOccupied ? 'Occupée par 1 pigeon' : 'Libre'}
        </Badge>

        {/* Occupant - CORRIGÉ */}
        {isOccupied && cage.occupation_actuelle && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Occupant
            </h3>
            {isCouple && cage.occupation_actuelle.couple ? (
              <div className="space-y-2">
                <PigeonInfo pigeon={cage.occupation_actuelle.couple.male} label="Mâle" />
                <PigeonInfo pigeon={cage.occupation_actuelle.couple.femelle} label="Femelle" />
              </div>
            ) : cage.occupation_actuelle.pigeon ? (
              <PigeonInfo pigeon={cage.occupation_actuelle.pigeon} />
            ) : null}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-4 border-t border-outline-variant">
          {!isOccupied ? (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Bird className="w-4 h-4" />
                    Affecter un pigeon
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Affecter un pigeon</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Select value={selectedPigeon} onValueChange={setSelectedPigeon}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un pigeon..." />
                      </SelectTrigger>
                      <SelectContent>
                        {pigeonsDisponibles.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.matricule} ({p.sexe === 'M' ? '♂' : '♀'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleOccuperPigeon}
                      disabled={!selectedPigeon || occuper.isPending}
                      className="w-full"
                    >
                      {occuper.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Confirmer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Heart className="w-4 h-4" />
                    Affecter un couple
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Affecter un couple</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Select value={selectedCouple} onValueChange={setSelectedCouple}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un couple..." />
                      </SelectTrigger>
                      <SelectContent>
                        {couplesDisponibles.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.male.matricule} + {c.femelle.matricule}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleOccuperCouple}
                      disabled={!selectedCouple || occuper.isPending}
                      className="w-full"
                    >
                      {occuper.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Confirmer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-destructive hover:bg-error-container hover:text-destructive"
              onClick={handleLiberer}
              disabled={liberer.isPending}
            >
              {liberer.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Libérer la cage
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

function PigeonInfo({ pigeon, label }: { pigeon?: any; label?: string }) {
  if (!pigeon) return null

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low">
      <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
        <Bird className="w-5 h-5 text-primary" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-on-surface truncate">
            {pigeon.matricule}
          </span>
          {label && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-container text-primary font-medium">
              {label}
            </span>
          )}
        </div>
        <p className="text-xs text-on-surface-variant">{pigeon.race}</p>
        <p className="text-xs text-on-surface-variant">
          {pigeon.sexe === 'M' ? '♂ Mâle' : '♀ Femelle'}
        </p>
      </div>
    </div>
  )
}