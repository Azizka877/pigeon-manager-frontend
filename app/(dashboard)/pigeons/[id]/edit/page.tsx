'use client'


import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePigeon, useUpdatePigeon, usePigeons } from '@/hooks/use-pigeons'
import { usePigeonEvents, useCreatePigeonEvent } from '@/hooks/use-pigeon-events'
import { PigeonCard } from '@/components/pigeons/pigeonsCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Bird,
  Calendar,
  Dna,
  Heart,
  Lightbulb,
  Palette,
  Plus,
  Save,
  Stethoscope,
  Syringe,
  Tag,
  Trophy,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Pigeon, PigeonEvent } from '@/types'

type OptionSexe = 'M' | 'F' | 'inconnu'

/** Union des types d'événement — source unique : l'interface PigeonEvent */
type TypeEvenement = PigeonEvent['type']

/** Races proposées même quand le registre est encore vide */
const RACES_DE_BASE = ['Voyageur Belge', 'Voyageur Anglais', 'Boulant Français']

/** Les 4 statuts officiels du backend (labels FR) */
const STATUTS = [
  { value: 'actif', label: 'Actif' },
  { value: 'vendu', label: 'Vendu' },
  { value: 'mort', label: 'Décédé' },
  { value: 'perdu', label: 'Perdu' },
] as const

/** Icône + couleur par type d'événement — clés typées par l'union de PigeonEvent */
const TYPE_EVENT: Record<
  TypeEvenement,
  { label: string; icone: React.ComponentType<{ className?: string }>; cls: string }
> = {
  medical: { label: 'Médical', icone: Stethoscope, cls: 'bg-rose-50 text-rose-600' },
  vaccination: { label: 'Vaccination', icone: Syringe, cls: 'bg-emerald-50 text-emerald-600' },
  reproduction: { label: 'Reproduction', icone: Heart, cls: 'bg-violet-50 text-violet-600' },
  concours: { label: 'Concours', icone: Trophy, cls: 'bg-amber-50 text-amber-600' },
  autre: { label: 'Autre', icone: Tag, cls: 'bg-slate-100 text-slate-500' },
}

export default function ModifierPigeonPage() {
  const params = useParams()
  const router = useRouter()
  const pigeonId = params.id as string
  const { data: pigeon, isLoading } = usePigeon(pigeonId)
  const modifierPigeon = useUpdatePigeon()
  const { data: pigeonsExistants } = usePigeons()

  // ── Événements réels ──
  const { data: evenements, isLoading: evenementsEnCours } = usePigeonEvents(pigeonId)
  const creerEvenement = useCreatePigeonEvent()
  const [showEventDialog, setShowEventDialog] = useState(false)
  // Le champ `type` est typé par l'union — sinon useState l'élargit à `string`
  // et mutateAsync refuse la valeur (ts2322).
  const [newEvent, setNewEvent] = useState<{
    type: TypeEvenement
    date: string
    description: string
  }>({ type: 'medical', date: '', description: '' })

  const [donnees, setDonnees] = useState({
    matricule: '',
    sexe: 'inconnu' as OptionSexe,
    race: '',
    couleur: '',
    poids: '',
    pere: '',
    mere: '',
    date_naissance: '',
    statut: 'actif' as string,
  })

  // Races du registre fusionnées avec la base
  const racesDisponibles = useMemo(() => {
    const set = new Set<string>(RACES_DE_BASE)
    pigeonsExistants?.forEach((p) => {
      if (p.race) set.add(p.race)
    })
    return Array.from(set).sort()
  }, [pigeonsExistants])

  useEffect(() => {
    if (pigeon) {
      setDonnees({
        matricule: pigeon.matricule,
        sexe: pigeon.sexe,
        race: pigeon.race ?? '',
        couleur: pigeon.couleur ?? '',
        poids: pigeon.poids?.toString() ?? '',
        pere: pigeon.pere != null ? String(pigeon.pere) : '',
        mere: pigeon.mere != null ? String(pigeon.mere) : '',
        date_naissance: pigeon.date_naissance ?? '',
        statut: pigeon.statut,
      })
    }
  }, [pigeon])

  // Événements triés du plus récent au plus ancien
  const evenementsTries = useMemo(() => {
    return [...(evenements ?? [])].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  }, [evenements])

  // ── Aperçu en direct ──
  const pigeonApercu: Pigeon = {
    ...(pigeon ?? ({} as Pigeon)),
    id: pigeonId,
    matricule: donnees.matricule || pigeon?.matricule || 'MATRICULE',
    sexe: donnees.sexe === 'F' ? 'F' : 'M',
    race: donnees.race || null,
    couleur: donnees.couleur || null,
    poids: donnees.poids ? parseFloat(donnees.poids) : null,
    statut: (donnees.statut as Pigeon['statut']) ?? 'actif',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await modifierPigeon.mutateAsync({
        id: pigeonId,
        data: {
          matricule: donnees.matricule,
          sexe: donnees.sexe === 'inconnu' ? 'M' : donnees.sexe,
          race: donnees.race,
          couleur: donnees.couleur || undefined,
          poids: donnees.poids ? parseFloat(donnees.poids) : undefined,
          pere: donnees.pere || undefined,
          mere: donnees.mere || undefined,
          date_naissance: donnees.date_naissance,
          statut: donnees.statut as 'actif' | 'vendu' | 'mort' | 'perdu',
        },
      })
      toast.success('Pigeon modifié avec succès')
      router.push(`/pigeons/${pigeonId}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Erreur lors de la modification')
    }
  }

  const handleAddEvent = async () => {
    if (!newEvent.date) {
      toast.error('La date de l\u2019événement est obligatoire')
      return
    }
    try {
      await creerEvenement.mutateAsync({
        pigeonId,
        data: {
          type: newEvent.type,
          date: newEvent.date,
          description: newEvent.description || undefined,
        },
      })
      toast.success('Événement ajouté')
      setShowEventDialog(false)
      setNewEvent({ type: 'medical', date: '', description: '' })
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Erreur lors de l'ajout de l'événement")
    }
  }

  const malesDisponibles =
    pigeonsExistants?.filter((p) => p.sexe === 'M' && p.statut === 'actif' && p.id !== pigeonId) || []
  const femellesDisponibles =
    pigeonsExistants?.filter((p) => p.sexe === 'F' && p.statut === 'actif' && p.id !== pigeonId) || []

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#00685f]" />
      </div>
    )
  }

  if (!pigeon) {
    return <div className="p-6">Pigeon non trouvé</div>
  }

  return (
    <div className="max-w-6xl">
      {/* ── En-tête ── */}
      <div className="mb-6">
        <Link href={`/pigeons/${pigeonId}`}>
          <Button variant="ghost" className="mb-3 gap-2 text-on-surface-variant">
            <ArrowLeft className="h-4 w-4" />
            Retour au pigeon
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00685f] to-[#01352f] text-white shadow-md shadow-teal-900/25">
            <Bird className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-on-surface sm:text-3xl">Modifier le Pigeon</h1>
            <p className="mt-0.5 text-sm text-on-surface-variant">
              Mise à jour de la fiche de <code className="rounded bg-surface-container px-1.5 py-0.5 font-mono text-[12px]">{pigeon.matricule}</code>
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          {/* ══ Colonne gauche ══ */}
          <Card className="space-y-7 rounded-3xl border-outline-variant p-6">
            {/* ── Événements (réels) ── */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e6f2f0] text-[#00685f]">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <h2 className="text-[15px] font-bold text-on-surface">Événements</h2>
                </div>

                <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 rounded-xl border-outline-variant">
                      <Plus className="h-4 w-4" />
                      Ajouter un événement
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nouvel événement</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <div className="grid grid-cols-5 gap-2">
                          {(Object.keys(TYPE_EVENT) as TypeEvenement[]).map((valeur) => {
                            const cfg = TYPE_EVENT[valeur]
                            return (
                              <button
                                key={valeur}
                                type="button"
                                onClick={() => setNewEvent({ ...newEvent, type: valeur })}
                                className={cn(
                                  'flex flex-col items-center gap-1 rounded-xl border-2 py-2.5 text-[11px] font-semibold transition-all',
                                  newEvent.type === valeur
                                    ? 'border-[#00685f] bg-[#f0f8f6] text-[#00685f]'
                                    : 'border-outline-variant text-on-surface-variant hover:border-slate-300',
                                )}
                              >
                                <cfg.icone className="h-4 w-4" />
                                {cfg.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                          className="rounded-xl border-outline-variant bg-surface-container"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          placeholder="Description…"
                          value={newEvent.description}
                          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                          className="rounded-xl border-outline-variant bg-surface-container"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" className="rounded-xl border-outline-variant" onClick={() => setShowEventDialog(false)}>
                          Annuler
                        </Button>
                        <Button
                          type="button"
                          onClick={handleAddEvent}
                          disabled={creerEvenement.isPending}
                          className="rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white"
                        >
                          {creerEvenement.isPending ? 'Ajout…' : 'Ajouter'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Timeline des événements */}
              <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
                {evenementsEnCours ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-12 animate-pulse rounded-xl bg-surface-container" />
                    ))}
                  </div>
                ) : evenementsTries.length === 0 ? (
                  <p className="py-3 text-center text-sm text-on-surface-variant">
                    Aucun événement pour l'instant — suivi médical, concours, reproduction…
                  </p>
                ) : (
                  <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
                    {evenementsTries.map((evt: PigeonEvent) => {
                      const cfg = TYPE_EVENT[evt.type] ?? TYPE_EVENT.autre
                      return (
                        <div key={evt.id} className="flex items-start gap-3 rounded-xl px-2 py-2 hover:bg-surface-container">
                          <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl', cfg.cls)}>
                            <cfg.icone className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[13.5px] font-semibold text-on-surface">
                              {cfg.label}
                              <span className="ml-2 text-[11.5px] font-medium text-on-surface-variant">
                                {new Date(evt.date).toLocaleDateString('fr-FR')}
                              </span>
                            </p>
                            {evt.description && (
                              <p className="mt-0.5 text-[12.5px] text-on-surface-variant">{evt.description}</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </section>

            <hr className="border-outline-variant" />

            {/* ── Identification ── */}
            <section>
              <SectionHeader icone={<Bird className="h-4 w-4" />} titre="Identification" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="matricule">
                    Numéro de matricule <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="matricule"
                    value={donnees.matricule}
                    onChange={(e) => setDonnees({ ...donnees, matricule: e.target.value })}
                    className="rounded-xl border-outline-variant bg-surface-container"
                    required
                  />
                </div>

                <div>
                  <Label>
                    Sexe <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-2 grid grid-cols-3 gap-2.5">
                    <OptionSexe
                      selectionne={donnees.sexe === 'M'}
                      onClick={() => setDonnees({ ...donnees, sexe: 'M' })}
                      icone="♂"
                      label="Mâle"
                    />
                    <OptionSexe
                      selectionne={donnees.sexe === 'F'}
                      onClick={() => setDonnees({ ...donnees, sexe: 'F' })}
                      icone="♀"
                      label="Femelle"
                    />
                    <OptionSexe
                      selectionne={donnees.sexe === 'inconnu'}
                      onClick={() => setDonnees({ ...donnees, sexe: 'inconnu' })}
                      icone="?"
                      label="Inconnu"
                    />
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-outline-variant" />

            {/* ── Morphologie & Race ── */}
            <section>
              <SectionHeader icone={<Palette className="h-4 w-4" />} titre="Morphologie & Race" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="race">Race</Label>
                  <select
                    id="race"
                    className="h-10 w-full rounded-xl border border-outline-variant bg-surface-container px-3 text-sm"
                    value={donnees.race}
                    onChange={(e) => setDonnees({ ...donnees, race: e.target.value })}
                    required
                  >
                    <option value="">Sélectionner une race</option>
                    {racesDisponibles.map((race) => (
                      <option key={race} value={race}>
                        {race}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="couleur">Couleur du plumage</Label>
                  <Input
                    id="couleur"
                    placeholder="ex. Bleu barré"
                    value={donnees.couleur}
                    onChange={(e) => setDonnees({ ...donnees, couleur: e.target.value })}
                    className="rounded-xl border-outline-variant bg-surface-container"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="poids">Poids (grammes)</Label>
                  <Input
                    id="poids"
                    type="number"
                    placeholder="ex. 450"
                    value={donnees.poids}
                    onChange={(e) => setDonnees({ ...donnees, poids: e.target.value })}
                    className="rounded-xl border-outline-variant bg-surface-container"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_naissance">Date de naissance</Label>
                  <Input
                    id="date_naissance"
                    type="date"
                    value={donnees.date_naissance}
                    onChange={(e) => setDonnees({ ...donnees, date_naissance: e.target.value })}
                    className="rounded-xl border-outline-variant bg-surface-container"
                  />
                </div>
              </div>
            </section>

            <hr className="border-outline-variant" />

            {/* ── Statut ── */}
            <section>
              <SectionHeader icone={<Tag className="h-4 w-4" />} titre="Statut" />
              <div className="space-y-2">
                <Label htmlFor="statut">Statut actuel</Label>
                <select
                  id="statut"
                  className="h-10 w-full rounded-xl border border-outline-variant bg-surface-container px-3 text-sm"
                  value={donnees.statut}
                  onChange={(e) => setDonnees({ ...donnees, statut: e.target.value })}
                >
                  {STATUTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <hr className="border-outline-variant" />

            {/* ── Origines ── */}
            <section>
              <SectionHeader icone={<Dna className="h-4 w-4" />} titre="Origines (Parents)" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>♂ Père</Label>
                  <select
                    className="h-10 w-full rounded-xl border border-outline-variant bg-surface-container px-3 text-sm"
                    value={donnees.pere}
                    onChange={(e) => setDonnees({ ...donnees, pere: e.target.value })}
                  >
                    <option value="">Sélectionner le père</option>
                    {malesDisponibles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.matricule} ({p.race})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>♀ Mère</Label>
                  <select
                    className="h-10 w-full rounded-xl border border-outline-variant bg-surface-container px-3 text-sm"
                    value={donnees.mere}
                    onChange={(e) => setDonnees({ ...donnees, mere: e.target.value })}
                  >
                    <option value="">Sélectionner la mère</option>
                    {femellesDisponibles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.matricule} ({p.race})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* ── Actions ── */}
            <div className="flex justify-end gap-3 pt-2">
              <Link href={`/pigeons/${pigeonId}`}>
                <Button type="button" variant="outline" className="rounded-xl border-outline-variant">
                  <X className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
              </Link>
              <Button
                type="submit"
                className="rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-lg shadow-teal-900/25"
                disabled={modifierPigeon.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {modifierPigeon.isPending ? 'Enregistrement…' : 'Enregistrer'}
              </Button>
            </div>
          </Card>

          {/* ══ Colonne droite : aperçu + astuce ══ */}
          <div className="space-y-4 lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest">
              <p className="px-4 pt-3.5 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
                Aperçu en direct
              </p>
              <PigeonCard pigeon={pigeonApercu} hideActions />
            </div>
            <div className="flex gap-3 rounded-2xl border border-[#d5eae5] bg-[#eef7f5] p-4">
              <Lightbulb className="h-4 w-4 shrink-0 text-[#00685f]" />
              <p className="text-[12.5px] leading-relaxed text-[#1d5a52]">
                Passez le statut à <b>Décédé</b> ou <b>Vendu</b> plutôt que de supprimer la fiche :
                l'historique complet du pigeon est conservé.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

// ── En-tête de section ───────────────────────────────────────────────────────
function SectionHeader({ icone, titre }: { icone: React.ReactNode; titre: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e6f2f0] text-[#00685f]">
        {icone}
      </span>
      <h2 className="text-[15px] font-bold text-on-surface">{titre}</h2>
    </div>
  )
}

// ── Segment de choix du sexe ─────────────────────────────────────────────────
function OptionSexe({
  selectionne,
  onClick,
  icone,
  label,
}: {
  selectionne: boolean
  onClick: () => void
  icone: string
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-0.5 rounded-xl border-2 py-2.5 transition-all',
        selectionne
          ? 'border-[#00685f] bg-[#f0f8f6] text-[#00685f] shadow-sm shadow-teal-900/10'
          : 'border-outline-variant text-on-surface-variant hover:border-slate-300',
      )}
    >
      <span className="text-[17px] font-bold leading-none">{icone}</span>
      <span className="text-[13px] font-semibold">{label}</span>
    </button>
  )
}