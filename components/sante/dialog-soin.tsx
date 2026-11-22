'use client'

import { useEffect, useState } from 'react'
import { usePigeons } from '@/hooks/use-pigeons'
import { useCreateSoin, useUpdateSoin } from '@/hooks/use-sante'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Syringe } from 'lucide-react'
import type { Soin, TypeSoin } from '@/types/sante'

export const TYPES_SOIN: Array<{ valeur: TypeSoin; label: string }> = [
  { valeur: 'vaccin', label: 'Vaccin' },
  { valeur: 'traitement', label: 'Traitement' },
  { valeur: 'vermifuge', label: 'Vermifuge' },
  { valeur: 'vitamines', label: 'Vitamines / Compléments' },
  { valeur: 'controle', label: 'Contrôle vétérinaire' },
  { valeur: 'autre', label: 'Autre' },
]

export function DialogSoin({
  ouvert,
  onFermer,
  soin,
}: {
  ouvert: boolean
  onFermer: () => void
  /** Soin en cours d'édition — absent pour une création */
  soin?: Soin | null
}) {
  const estEdition = !!soin
  const { data: pigeons } = usePigeons()
  const creer = useCreateSoin()
  const modifier = useUpdateSoin()

  const [pigeonId, setPigeonId] = useState('')
  const [typeSoin, setTypeSoin] = useState<TypeSoin>('traitement')
  const [produit, setProduit] = useState('')
  const [dose, setDose] = useState('')
  const [dateSoin, setDateSoin] = useState('')
  const [rappelJours, setRappelJours] = useState('')
  const [notes, setNotes] = useState('')

  // Réinitialise le formulaire à chaque ouverture
  useEffect(() => {
    if (ouvert) {
      setPigeonId(soin ? String(soin.pigeon) : '')
      setTypeSoin(soin?.type_soin ?? 'traitement')
      setProduit(soin?.produit ?? '')
      setDose(soin?.dose ?? '')
      setDateSoin(soin?.date_soin ?? '')
      setRappelJours(soin?.rappel_jours ? String(soin.rappel_jours) : '')
      setNotes(soin?.notes ?? '')
    }
  }, [ouvert, soin])

  const enregistrer = () => {
    if (!pigeonId || !produit.trim() || !dateSoin) {
      toast.error('Le pigeon, le produit et la date sont obligatoires')
      return
    }
    const payload: Partial<Soin> = {
      pigeon: pigeonId,
      type_soin: typeSoin,
      produit: produit.trim(),
      dose: dose.trim(),
      date_soin: dateSoin,
      rappel_jours: rappelJours ? Number(rappelJours) : null,
      notes: notes.trim(),
    }
    if (estEdition && soin) {
      modifier.mutate(
        { id: soin.id, data: payload },
        {
          onSuccess: () => {
            toast.success('Soin mis à jour')
            onFermer()
          },
          onError: () => toast.error('Erreur lors de la mise à jour du soin'),
        },
      )
    } else {
      creer.mutate(payload, {
        onSuccess: () => {
          toast.success('Soin enregistré dans le dossier médical')
          onFermer()
        },
        onError: () => toast.error("Erreur lors de l'enregistrement du soin"),
      })
    }
  }

  const enCours = creer.isPending || modifier.isPending

  return (
    <Dialog open={ouvert} onOpenChange={(v) => !v && onFermer()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-md shadow-teal-900/20">
              <Syringe className="h-4 w-4" />
            </span>
            {estEdition ? 'Modifier le soin' : 'Nouveau soin'}
          </DialogTitle>
          <DialogDescription>
            {estEdition
              ? 'Corrigez les informations de cette intervention de santé.'
              : 'Vaccin, traitement ou contrôle : tenez le dossier médical à jour.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Pigeon */}
          <div className="space-y-1.5">
            <Label htmlFor="soin-pigeon">Pigeon concerné</Label>
            <Select value={pigeonId} onValueChange={setPigeonId}>
              <SelectTrigger id="soin-pigeon" className="w-full">
                <SelectValue placeholder="Choisir un pigeon" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {(pigeons ?? []).map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.matricule}
                    {p.race ? ` — ${p.race}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type + produit */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Type de soin</Label>
              <Select value={typeSoin} onValueChange={(v) => setTypeSoin(v as TypeSoin)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_SOIN.map((t) => (
                    <SelectItem key={t.valeur} value={t.valeur}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="soin-produit">Produit / Vaccin</Label>
              <Input
                id="soin-produit"
                value={produit}
                onChange={(e) => setProduit(e.target.value)}
                placeholder="Paramyxo, Colimid…"
              />
            </div>
          </div>

          {/* Dose + date */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="soin-dose">Dose / Posologie</Label>
              <Input
                id="soin-dose"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="0,5 ml, 1 comprimé…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="soin-date">Date du soin</Label>
              <Input
                id="soin-date"
                type="date"
                value={dateSoin}
                onChange={(e) => setDateSoin(e.target.value)}
              />
            </div>
          </div>

          {/* Rappel automatique */}
          <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 p-3">
            <Label htmlFor="soin-rappel" className="text-amber-800">
              Rappel automatique
            </Label>
            <div className="mt-1.5 flex items-center gap-2">
              <Input
                id="soin-rappel"
                type="number"
                min={0}
                value={rappelJours}
                onChange={(e) => setRappelJours(e.target.value)}
                placeholder="ex. 21"
                className="w-28 bg-white"
              />
              <p className="text-xs text-amber-700/80">
                jours après le soin — laissez vide pour aucun rappel
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="soin-notes">Notes</Label>
            <Textarea
              id="soin-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observations, réaction du pigeon, à surveiller…"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onFermer} disabled={enCours}>
            Annuler
          </Button>
          <Button
            onClick={enregistrer}
            disabled={enCours}
            className="gap-2 rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-lg shadow-teal-900/25"
          >
            {enCours && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {estEdition ? 'Enregistrer' : 'Ajouter au dossier'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
