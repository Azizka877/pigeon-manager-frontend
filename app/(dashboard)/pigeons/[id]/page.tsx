'use client'

// app/(dashboard)/pigeons/[id]/page.tsx — Fiche détaillée d'un pigeon.
// Identité PigeonManager : héros sur dégradé signature avec la VRAIE photo du
// pigeon (banque lib/pigeon-cage-images.ts — stable par id, la même que dans
// les cages), généalogie et historique harmonisés, bouton direct vers le
// pedigree. Tolérant aux valeurs nulles du backend (age, date_naissance…).

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { usePigeon } from '@/hooks/use-pigeons'
import { usePigeonEvents, useCreatePigeonEvent } from '@/hooks/use-pigeon-events'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Pencil,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Plus,
  Calendar,
  Feather,
  Palette,
  Hash,
  Network,
  User,
  Bird,
  Sparkles,
  Stethoscope,
  Syringe,
  Heart,
  Trophy,
  Circle,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { PigeonPhoto } from '@/components/pigeons/pigeon-photo'

type TypeEvenement = 'medical' | 'vaccination' | 'reproduction' | 'concours' | 'autre'

const NOUVEL_EVENEMENT: { type: TypeEvenement; date: string; description: string } = {
  type: 'medical',
  date: '',
  description: '',
}

// ── Aides tolérantes aux valeurs nulles ──────────────────────────────────────
// Le backend renvoie null quand la donnée est inconnue (cf. types/index.ts :
// age: number | null). Ces aides acceptent null/undefined sans planter.

function formatDateFr(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR')
}

function formatNaissance(date?: string | null, age?: number | null): string {
  const base = formatDateFr(date)
  if (base === '—') return 'Non renseignée'
  const suffixe = age != null && age >= 1 ? ` (${age} an${age > 1 ? 's' : ''})` : ''
  return `${base}${suffixe}`
}

/** pere / mere peuvent être un matricule (string), un id (number) ou null. */
function matriculeParent(valeur?: string | number | null): string | null {
  if (valeur == null) return null
  const texte = String(valeur).trim()
  return texte === '' ? null : texte
}

export default function PigeonDetailPage() {
  const params = useParams()
  const pigeonId = params.id as string

  const { data: pigeon, isLoading } = usePigeon(pigeonId)
  const { data: events, isLoading: eventsLoading } = usePigeonEvents(pigeonId)
  const createEvent = useCreatePigeonEvent()

  const [showEventDialog, setShowEventDialog] = useState(false)
  const [newEvent, setNewEvent] = useState(NOUVEL_EVENEMENT)

  const handleAddEvent = async () => {
    try {
      await createEvent.mutateAsync({ pigeonId, data: newEvent })
      toast.success('Événement ajouté')
      setShowEventDialog(false)
      setNewEvent(NOUVEL_EVENEMENT)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Erreur')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#00685f]" />
      </div>
    )
  }

  if (!pigeon) {
    return (
      <Card className="mx-auto max-w-md p-10 text-center">
        <Bird className="mx-auto mb-3 h-10 w-10 text-gray-300" />
        <p className="font-medium text-gray-900">Pigeon non trouvé</p>
        <p className="mt-1 text-sm text-gray-500">Ce pigeon n&apos;existe pas ou a été supprimé.</p>
        <Link href="/pigeons" className="mt-5 inline-block">
          <Button variant="outline">Retour aux pigeons</Button>
        </Link>
      </Card>
    )
  }

  const matricule = pigeon.matricule || '—'
  const pere = matriculeParent(pigeon.pere)
  const mere = matriculeParent(pigeon.mere)
  const libelleSexe =
    pigeon.sexe === 'M' ? '♂ Mâle' : pigeon.sexe === 'F' ? '♀ Femelle' : 'Non renseigné'

  // Timeline fusionnée : enregistrement système + événements dynamiques
  const items = [
    {
      key: 'creation',
      type: 'creation',
      titre: 'Enregistré dans le système',
      date: formatDateFr(pigeon.created_at),
    },
    ...(events ?? []).map((event) => ({
      key: event.id,
      type: event.type as string,
      titre: event.description,
      date: formatDateFr(event.date),
    })),
  ]
  const medicaux = (events ?? []).filter((e) => e.type === 'medical')

  return (
    <div className="space-y-6">
      {/* Bouton retour */}
      <div>
        <Link href="/pigeons">
          <Button variant="ghost" className="gap-2 text-gray-500">
            <ArrowLeft className="h-4 w-4" />
            Retour aux pigeons
          </Button>
        </Link>
      </div>

      {/* En-tête identité — dégradé signature */}
      <Card className="overflow-hidden border-0 shadow-lg shadow-[#01352f]/10">
        <div className="relative bg-gradient-to-br from-[#00685f] via-[#005651] to-[#01352f] px-6 py-7 sm:px-8">
          {/* décor lumineux */}
          <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-20 left-8 h-48 w-48 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <PigeonPhoto
                pigeonId={pigeon.id}
                matricule={matricule}
                sexe={pigeon.sexe}
                variante="verre"
                className="h-32 w-32 shrink-0 rounded-2xl shadow-xl"
                fallbackClassName="text-4xl"
              />

              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <h1 className="truncate text-3xl font-bold text-white">{matricule}</h1>
                  <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                    {pigeon.statut_display?.toUpperCase() || 'ACTIF'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-white/85">
                  <span className="flex items-center gap-1.5">
                    <Feather className="h-4 w-4 text-white/50" />
                    {pigeon.race || 'Race non renseignée'}
                  </span>
                  {pigeon.couleur && (
                    <span className="flex items-center gap-1.5">
                      <Palette className="h-4 w-4 text-white/50" />
                      {pigeon.couleur}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 font-mono text-xs text-white/55">
                    <Hash className="h-3.5 w-3.5" />
                    {matricule}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 xl:flex-col">
              <Link href={`/pigeons/${pigeon.id}/edit`} className="w-full sm:w-auto xl:w-full">
                <Button
                  variant="ghost"
                  className="w-full gap-2 border border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <Pencil className="h-4 w-4" />
                  Modifier
                </Button>
              </Link>
              <Link href={`/pigeons/${pigeon.id}/pedigree`} className="w-full sm:w-auto xl:w-full">
                <Button
                  variant="ghost"
                  className="w-full gap-2 bg-white text-[#00685f] shadow-sm hover:bg-white/90 hover:text-[#00685f]"
                >
                  <Network className="h-4 w-4" />
                  Pedigree
                </Button>
              </Link>
              <Link href="/sales/new" className="w-full sm:w-auto xl:w-full">
                <Button
                  variant="ghost"
                  className="w-full gap-2 bg-[#ba1a1a] text-white hover:bg-[#991b1b] hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Enregistrer une sortie
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <CarteStat icone={User} label="Sexe" value={libelleSexe} />
        <CarteStat icone={Feather} label="Race" value={pigeon.race || 'Non renseignée'} />
        <CarteStat icone={Palette} label="Couleur" value={pigeon.couleur || 'Non spécifiée'} />
        <CarteStat
          icone={Calendar}
          label="Né le"
          value={formatNaissance(pigeon.date_naissance, pigeon.age)}
        />
      </div>

      {/* Généalogie & Historique */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Généalogie */}
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Généalogie</h2>
            <Link
              href={`/pigeons/${pigeon.id}/pedigree`}
              className="flex items-center gap-1 text-sm font-medium text-[#00685f] hover:underline"
            >
              Voir le pedigree
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <CarteParent type="Père" matricule={pere} sujet={matricule} />
            <CarteParent type="Mère" matricule={mere} sujet={matricule} />
          </div>

          <p className="mt-5 flex items-center gap-2 rounded-lg bg-[#f5faf8] px-3 py-2.5 text-xs text-[#00685f]/80">
            <Network className="h-3.5 w-3.5 shrink-0" />
            Complétez les parents depuis «&nbsp;Modifier&nbsp;» pour tracer la lignée sur 3 générations.
          </p>
        </Card>

        {/* Historique */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-900">Historique</h2>
            <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 border-[#00685f]/30 text-[#00685f] hover:bg-[#f5faf8] hover:text-[#00685f]"
                >
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
                    <select
                      className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00685f]/25"
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as TypeEvenement })}
                    >
                      <option value="medical">Médical</option>
                      <option value="vaccination">Vaccination</option>
                      <option value="reproduction">Reproduction</option>
                      <option value="concours">Concours</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      placeholder="Description…"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                      Annuler
                    </Button>
                    <Button
                      onClick={handleAddEvent}
                      disabled={createEvent.isPending}
                      className="bg-[#00685f] text-white hover:bg-[#005651] hover:text-white"
                    >
                      {createEvent.isPending ? 'Ajout…' : 'Ajouter'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="evenements" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="evenements">Événements</TabsTrigger>
              <TabsTrigger value="medical">Médical</TabsTrigger>
            </TabsList>

            <TabsContent value="evenements" className="mt-5">
              {eventsLoading ? (
                <div className="py-6 text-center text-sm text-gray-500">Chargement…</div>
              ) : (
                <div>
                  {items.map((item, i) => (
                    <EvenementItem
                      key={item.key}
                      type={item.type}
                      titre={item.titre}
                      date={item.date}
                      dernier={i === items.length - 1}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="medical" className="mt-5">
              {medicaux.length === 0 ? (
                <div className="py-8 text-center">
                  <Stethoscope className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                  <p className="text-sm text-gray-500">Aucun dossier médical</p>
                </div>
              ) : (
                <div>
                  {medicaux.map((event, i) => (
                    <EvenementItem
                      key={event.id}
                      type="medical"
                      titre={event.description}
                      date={formatDateFr(event.date)}
                      dernier={i === medicaux.length - 1}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}

// ── Sous-composants ──────────────────────────────────────────────────────────

function CarteStat({ label, value, icone: Icone }: { label: string; value: string; icone: LucideIcon }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f5faf8] text-[#00685f]">
        <Icone className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>
        <p className="text-sm font-medium leading-snug text-gray-900 sm:text-base">{value}</p>
      </div>
    </Card>
  )
}

function CarteParent({ type, matricule, sujet }: { type: string; matricule: string | null; sujet: string }) {
  const connu = matricule != null
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border p-3.5 transition-colors',
        connu
          ? 'border-gray-200 bg-white hover:border-[#00685f] hover:bg-[#f5faf8]'
          : 'border-dashed border-gray-300 bg-gray-50/60',
      )}
    >
      <div
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
          connu ? 'bg-[#f5faf8] text-[#00685f]' : 'bg-gray-100 text-gray-300',
        )}
      >
        {connu ? <Bird className="h-5 w-5" /> : <span className="text-lg font-semibold">?</span>}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{type}</p>
        <p className={cn('truncate font-mono font-medium', connu ? 'text-sm text-gray-900' : 'text-xs text-gray-400')}>
          {matricule ?? 'Non enregistré'}
        </p>
        <p className="text-xs text-gray-400">{connu ? `Parent de ${sujet}` : 'Généalogie à compléter'}</p>
      </div>
      {connu && <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />}
    </div>
  )
}

const STYLE_EVENEMENT: Record<string, { point: string; icone: LucideIcon }> = {
  creation: { point: 'bg-[#00685f]', icone: Sparkles },
  medical: { point: 'bg-blue-500', icone: Stethoscope },
  vaccination: { point: 'bg-purple-500', icone: Syringe },
  reproduction: { point: 'bg-pink-500', icone: Heart },
  concours: { point: 'bg-amber-500', icone: Trophy },
  autre: { point: 'bg-gray-400', icone: Circle },
}

function EvenementItem({
  titre,
  date,
  type,
  dernier = false,
}: {
  titre: string
  date: string
  type: string
  dernier?: boolean
}) {
  const style = STYLE_EVENEMENT[type] ?? STYLE_EVENEMENT.autre
  const Icone = style.icone
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white', style.point)}>
          <Icone className="h-3.5 w-3.5" />
        </div>
        {!dernier && <div className="my-1 w-px flex-1 bg-gray-200" />}
      </div>
      <div className={cn('min-w-0 pt-1', dernier ? 'pb-1' : 'pb-4')}>
        <p className="font-medium text-gray-900">{titre}</p>
        <p className="text-sm text-gray-500">{date}</p>
      </div>
    </div>
  )
}