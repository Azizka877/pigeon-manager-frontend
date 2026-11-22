'use client'

import { useEffect, useState } from 'react'
import { usePigeons } from '@/hooks/use-pigeons'
import { useCreateRappel, useUpdateRappel } from '@/hooks/use-sante'
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
import { BellRing } from 'lucide-react'
import type { Rappel, TypeRappel } from '@/types/sante'

export const TYPES_RAPPEL: Array<{ valeur: TypeRappel; label: string }> = [
  { valeur: 'soin', label: 'Soin / Vétérinaire' },
  { valeur: 'reproduction', label: 'Reproduction' },
  { valeur: 'entretien', label: 'Entretien / Nettoyage' },
  { valeur: 'autre', label: 'Autre' },
]

export function DialogRappel({
  ouvert,
  onFermer,
  rappel,
  /** Préremplit la date (ex. clic sur un jour du calendrier) */
  datePrevue,
}: {
  ouvert: boolean
  onFermer: () => void
  /** Rappel en cours d'édition — absent pour une création */
  rappel?: Rappel | null
  datePrevue?: string
}) {
  const estEdition = !!rappel
  const { data: pigeons } = usePigeons()
  const creer = useCreateRappel()
  const modifier = useUpdateRappel()

  const [titre, setTitre] = useState('')
  const [typeRappel, setTypeRappel] = useState<TypeRappel>('soin')
  const [dateRappel, setDateRappel] = useState('')
  const [pigeonId, setPigeonId] = useState('aucun')
  const [notes, setNotes] = useState('')

  // Réinitialise le formulaire à chaque ouverture
  useEffect(() => {
    if (ouvert) {
      setTitre(rappel?.titre ?? '')
      setTypeRappel(rappel?.type_rappel ?? 'soin')
      setDateRappel(rappel?.date_rappel ?? datePrevue ?? '')
      setPigeonId(rappel?.pigeon ? String(rappel.pigeon) : 'aucun')
      setNotes(rappel?.notes ?? '')
    }
  }, [ouvert, rappel, datePrevue])

  const enregistrer = () => {
    if (!titre.trim() || !dateRappel) {
      toast.error('Le titre et la date sont obligatoires')
      return
    }
    const payload: Partial<Rappel> = {
      titre: titre.trim(),
      type_rappel: typeRappel,
      date_rappel: dateRappel,
      pigeon: pigeonId === 'aucun' ? null : pigeonId,
      notes: notes.trim(),
    }
    if (estEdition && rappel) {
      modifier.mutate(
        { id: rappel.id, data: payload },
        {
          onSuccess: () => {
            toast.success('Rappel mis à jour')
            onFermer()
          },
          onError: () => toast.error('Erreur lors de la mise à jour du rappel'),
        },
      )
    } else {
      creer.mutate(payload, {
        onSuccess: () => {
          toast.success('Rappel ajouté à votre agenda')
          onFermer()
        },
        onError: () => toast.error("Erreur lors de l'ajout du rappel"),
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
              <BellRing className="h-4 w-4" />
            </span>
            {estEdition ? 'Modifier le rappel' : 'Nouveau rappel'}
          </DialogTitle>
          <DialogDescription>
            {estEdition
              ? 'Ajustez ce rappel pour ne rien laisser passer.'
              : 'Rendez-vous veto, mirage à contrôler, nettoyage : posez-le dans votre agenda.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Titre */}
          <div className="space-y-1.5">
            <Label htmlFor="rappel-titre">Titre</Label>
            <Input
              id="rappel-titre"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Rappel vaccin Paramyxo, contrôle nichoir…"
            />
          </div>

          {/* Type + date */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Type de rappel</Label>
              <Select value={typeRappel} onValueChange={(v) => setTypeRappel(v as TypeRappel)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_RAPPEL.map((t) => (
                    <SelectItem key={t.valeur} value={t.valeur}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rappel-date">Date</Label>
              <Input
                id="rappel-date"
                type="date"
                value={dateRappel}
                onChange={(e) => setDateRappel(e.target.value)}
              />
            </div>
          </div>

          {/* Pigeon (optionnel) */}
          <div className="space-y-1.5">
            <Label htmlFor="rappel-pigeon">Pigeon concerné (optionnel)</Label>
            <Select value={pigeonId} onValueChange={setPigeonId}>
              <SelectTrigger id="rappel-pigeon" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="aucun">Aucun — rappel général</SelectItem>
                {(pigeons ?? []).map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.matricule}
                    {p.race ? ` — ${p.race}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="rappel-notes">Notes</Label>
            <Textarea
              id="rappel-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Détails, produit à prévoir, contact…"
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
            {estEdition ? 'Enregistrer' : 'Ajouter à la grille'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
