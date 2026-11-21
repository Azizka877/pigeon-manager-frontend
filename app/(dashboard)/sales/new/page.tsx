'use client'

// ─────────────────────────────────────────────────────────────────────────────
// app/(dashboard)/sales/new/page.tsx — Enregistrer une sortie, design
// ultra-moderne réaliste cohérent avec « Enregistrer une ponte » : le type de
// départ se choisit sur trois grandes cartes illustrées (envol vers un nouveau
// colombier, trajectoire qui s'effrite, plume et bague), le pigeon sélectionné
// apparaît en VRAIE PHOTO avec son visage de pigeon, et les champs s'adaptent
// au destin choisi (prix + acheteur pour une vente, cause pour une perte).
// Corrige au passage l'ancienne version : l'icône LogOut répétée sur toutes
// les sections, sexe_display manquant dans le select et l'aperçu pigeon gris.
// Logique métier inchangée : useCreateSortie (avec libération automatique de
// la cage), validation pigeon + date, prix en string 2 décimales (DecimalField
// Django), redirection vers /sales.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCreateSortie } from '@/hooks/use-sales'
import { usePigeons } from '@/hooks/use-pigeons'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  Banknote,
  Bird,
  ClipboardList,
  Feather,
  PlaneTakeoff,
  Save,
  ShieldCheck,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { SceneSortie } from '@/components/sales/scenes-sorties'
import { getPigeonImage } from '@/lib/pigeon-images'
import type { CreateSortiePayload, Pigeon, TypeSortie } from '@/types'

const TYPES: Array<{
  valeur: TypeSortie
  label: string
  description: string
  selection: string
  icone: React.ReactNode
}> = [
  {
    valeur: 'vente',
    label: 'Vente',
    description: 'Le pigeon rejoint un nouveau colombier',
    selection: 'border-[#00685f] bg-[#f5faf8] ring-2 ring-[#00685f]/15',
    icone: <Banknote className="h-4 w-4" />,
  },
  {
    valeur: 'perte',
    label: 'Perte',
    description: "N'est pas rentré d'un vol ou d'un entraînement",
    selection: 'border-[#b45309] bg-[#fff4e5] ring-2 ring-[#b45309]/15',
    icone: <PlaneTakeoff className="h-4 w-4" />,
  },
  {
    valeur: 'deces',
    label: 'Décès',
    description: 'Disparition à inscrire au registre',
    selection: 'border-gray-500 bg-gray-50 ring-2 ring-gray-400/15',
    icone: <Feather className="h-4 w-4" />,
  },
]

export default function NouvelleSortiePage() {
  const router = useRouter()
  const creerSortie = useCreateSortie()
  const { data: pigeonsData } = usePigeons()

  const [typeSortie, setTypeSortie] = useState<TypeSortie>('vente')
  const [pigeonId, setPigeonId] = useState('')
  const [dateSortie, setDateSortie] = useState('')
  const [prix, setPrix] = useState('') // string : conversion en "320.00" à l'envoi
  const [acheteur, setAcheteur] = useState('')
  const [cause, setCause] = useState('')
  const [circonstances, setCirconstances] = useState('')
  const [notes, setNotes] = useState('')

  const pigeonsActifs = useMemo(
    () => (pigeonsData ?? []).filter((p) => p.statut === 'actif'),
    [pigeonsData],
  )
  const pigeonSelectionne: Pigeon | undefined = pigeonsActifs.find((p) => p.id === pigeonId)

  /** Libellé de sexe robuste : l'API peut ne pas renvoyer sexe_display */
  const sexeDe = (p: Pigeon) => p.sexe_display ?? (p.sexe === 'M' ? 'Mâle' : 'Femelle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!pigeonId || !dateSortie) {
      toast.error('Veuillez sélectionner un pigeon et une date de sortie')
      return
    }

    try {
      const payload: CreateSortiePayload = {
        pigeon: pigeonId,
        type_sortie: typeSortie,
        date_sortie: dateSortie,
        // DecimalField Django : le prix part en string à 2 décimales
        prix: typeSortie === 'vente' && prix ? parseFloat(prix).toFixed(2) : null,
        acheteur: typeSortie === 'vente' ? acheteur || null : null,
        cause: cause || null,
        circonstances: circonstances || null,
        notes: notes || null,
      }
      await creerSortie.mutateAsync(payload)

      toast.success('Sortie enregistrée — le registre des départs est à jour')
      router.push('/sales')
    } catch (err: unknown) {
      const detail =
        typeof err === 'object' && err && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined
      toast.error(detail || "Erreur lors de l'enregistrement")
    }
  }

  const placeholderCause =
    typeSortie === 'perte'
      ? 'ex. Attaque par un rapace, Disparition sur concours…'
      : typeSortie === 'deces'
        ? 'ex. Maladie, Accident au colombier…'
        : 'ex. Élément de souche vendu au club…'

  return (
    <div className="max-w-3xl">
      {/* ── En-tête ── */}
      <div className="mb-6">
        <Link href="/sales">
          <Button variant="ghost" className="mb-3 gap-2 pl-0 text-on-surface-variant">
            <ArrowLeft className="h-4 w-4" />
            Retour aux sorties
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00685f] to-[#01352f] text-white shadow-md shadow-teal-900/25">
            <PlaneTakeoff className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-on-surface sm:text-3xl">
              Enregistrer une sortie
            </h1>
            <p className="mt-0.5 text-sm text-on-surface-variant">
              Vente, perte ou décès : inscrivez le destin du pigeon au registre.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ══ Section 1 : LE DESTIN ══ */}
        <Card className="rounded-3xl border-outline-variant p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef7f5] text-[#00685f]">
              <PlaneTakeoff className="h-4 w-4" />
            </span>
            <h2 className="text-[15px] font-extrabold text-on-surface">Le destin du pigeon</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {TYPES.map((t) => (
              <button
                key={t.valeur}
                type="button"
                onClick={() => setTypeSortie(t.valeur)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-2xl border-2 p-4 transition-all',
                  typeSortie === t.valeur
                    ? t.selection
                    : 'border-outline-variant bg-surface-container hover:border-[#b9d8d0]',
                )}
              >
                <SceneSortie type={t.valeur} className="h-14 w-28" />
                <span className="mt-1 flex items-center gap-1.5 text-[14px] font-extrabold text-on-surface">
                  <span
                    className={cn(
                      'text-[#00685f]',
                      t.valeur === 'perte' && 'text-[#b45309]',
                      t.valeur === 'deces' && 'text-gray-500',
                    )}
                  >
                    {t.icone}
                  </span>
                  {t.label}
                </span>
                <span className="text-center text-[11.5px] leading-snug text-on-surface-variant">
                  {t.description}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* ══ Section 2 : LE PIGEON ══ */}
        <Card className="overflow-hidden rounded-3xl border-outline-variant">
          {/* Aperçu photo en direct */}
          <div className="relative h-44 bg-gradient-to-b from-[#eaf4f1] to-white">
            <p className="absolute left-1/2 top-3 -translate-x-1/2 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
              Le pigeon qui s&apos;envole
            </p>

            {pigeonSelectionne ? (
              <div className="flex h-full items-center justify-center gap-6 px-6 pb-2">
                {/* Ombre de contact */}
                <div
                  className="absolute bottom-5 left-1/2 h-3 w-40 -translate-x-1/2 rounded-full"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(15,60,55,0.16), transparent 70%)' }}
                  aria-hidden="true"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getPigeonImage(pigeonSelectionne.id, pigeonSelectionne.sexe)}
                  alt={pigeonSelectionne.matricule}
                  className="h-[80%] object-contain"
                  style={{ filter: 'drop-shadow(0 6px 8px rgba(10,40,35,0.18))' }}
                />
                <div className="relative z-10">
                  <p className="font-mono text-[16px] font-extrabold text-on-surface">
                    {pigeonSelectionne.matricule}
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-on-surface-variant">
                    {pigeonSelectionne.race || 'Race non renseignée'} • {sexeDe(pigeonSelectionne)}
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-on-surface-variant">
                    {pigeonSelectionne.age != null
                      ? `${pigeonSelectionne.age} an${pigeonSelectionne.age > 1 ? 's' : ''}`
                      : 'Âge non renseigné'}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#eef7f5] px-2.5 py-1 text-[11px] font-bold text-[#00685f] ring-1 ring-[#bfe3dc]">
                    <Bird className="h-3 w-3" />
                    Pigeon actif au colombier
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-[#b9d8d0] bg-white/60">
                  <Bird className="h-8 w-8 text-[#8fb8ae]" />
                </span>
              </div>
            )}
          </div>

          {/* Sélecteur */}
          <div className="p-6">
            <Label htmlFor="pigeon" className="text-[13px] font-semibold text-on-surface">
              Pigeon concerné <span className="text-red-500">*</span>
            </Label>
            <select
              id="pigeon"
              className="mt-1.5 h-10 w-full rounded-xl border border-outline-variant bg-surface-container px-3 text-sm"
              value={pigeonId}
              onChange={(e) => setPigeonId(e.target.value)}
              required
            >
              <option value="">Choisir un pigeon actif…</option>
              {pigeonsActifs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.matricule} — {p.race || 'race ?'} ({sexeDe(p)})
                </option>
              ))}
            </select>
            {pigeonsActifs.length === 0 && (
              <p className="mt-2 text-[12px] text-on-surface-variant">
                Aucun pigeon actif disponible : les seuls pigeons encore au colombier peuvent sortir.
              </p>
            )}
          </div>
        </Card>

        {/* ══ Section 3 : LES DÉTAILS ══ */}
        <Card className="rounded-3xl border-outline-variant p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef7f5] text-[#00685f]">
              <ClipboardList className="h-4 w-4" />
            </span>
            <h2 className="text-[15px] font-extrabold text-on-surface">Détails du départ</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date_sortie" className="text-[13px]">
                Date de sortie <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date_sortie"
                type="date"
                value={dateSortie}
                onChange={(e) => setDateSortie(e.target.value)}
                required
                className="rounded-xl border-outline-variant bg-surface-container text-sm"
              />
            </div>

            {typeSortie === 'vente' && (
              <div className="space-y-2">
                <Label htmlFor="prix" className="text-[13px]">
                  Prix (€)
                </Label>
                <Input
                  id="prix"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="ex. 320.00"
                  value={prix}
                  onChange={(e) => setPrix(e.target.value)}
                  className="rounded-xl border-outline-variant bg-surface-container text-sm"
                />
              </div>
            )}
          </div>

          {typeSortie === 'vente' && (
            <div className="mt-4 space-y-2">
              <Label htmlFor="acheteur" className="text-[13px]">
                Acheteur
              </Label>
              <Input
                id="acheteur"
                placeholder="ex. Pierre Martin — Colombophile belge"
                value={acheteur}
                onChange={(e) => setAcheteur(e.target.value)}
                className="rounded-xl border-outline-variant bg-surface-container text-sm"
              />
            </div>
          )}

          <div className="mt-4 space-y-2">
            <Label htmlFor="cause" className="text-[13px]">
              Cause / Raison
            </Label>
            <Input
              id="cause"
              placeholder={placeholderCause}
              value={cause}
              onChange={(e) => setCause(e.target.value)}
              className="rounded-xl border-outline-variant bg-surface-container text-sm"
            />
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="circonstances" className="text-[13px]">
              Circonstances
            </Label>
            <Textarea
              id="circonstances"
              placeholder="Décrivez les circonstances du départ (vol, lieu, contexte…)"
              value={circonstances}
              onChange={(e) => setCirconstances(e.target.value)}
              rows={2}
              className="resize-none rounded-xl border-outline-variant bg-surface-container text-sm"
            />
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="notes" className="text-[13px]">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Notes additionnelles (documents, souvenir, contact de l'acheteur…)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="resize-none rounded-xl border-outline-variant bg-surface-container text-sm"
            />
          </div>

          {/* Encart contextuel : change avec le destin choisi */}
          {typeSortie === 'vente' && (
            <div className="mt-4 flex gap-3 rounded-2xl border border-[#d5eae5] bg-[#eef7f5] p-4">
              <Banknote className="h-4 w-4 shrink-0 text-[#00685f]" />
              <p className="text-[12.5px] leading-relaxed text-[#1d5a52]">
                Le prix et l&apos;acheteur alimentent le suivi des recettes du colombier — utile pour
                savoir quelles souches rapportent.
              </p>
            </div>
          )}
          {typeSortie === 'perte' && (
            <div className="mt-4 flex gap-3 rounded-2xl border border-[#fde3bd] bg-[#fff4e5] p-4">
              <PlaneTakeoff className="h-4 w-4 shrink-0 text-[#b45309]" />
              <p className="text-[12.5px] leading-relaxed text-[#8a4b0d]">
                Un pigeon perdu peut parfois retrouver son chemin — son statut restera « perdu »
                jusqu&apos;à son retour au colombier.
              </p>
            </div>
          )}
          {typeSortie === 'deces' && (
            <div className="mt-4 flex gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <Feather className="h-4 w-4 shrink-0 text-gray-500" />
              <p className="text-[12.5px] leading-relaxed text-gray-600">
                Le décès sera conservé au registre avec sa date et sa cause — la bague pourra être
                gardée en souvenir.
              </p>
            </div>
          )}

          {/* Encart permanent : la libération automatique des cages */}
          <div className="mt-3 flex gap-3 rounded-2xl border border-[#d5eae5] bg-white p-4">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#00685f]" />
            <p className="text-[12.5px] leading-relaxed text-[#1d5a52]">
              <b>Libération automatique des cages</b> — si le pigeon occupait une cage seul, ou si
              son partenaire de cage a déjà quitté le colombier, la cage sera libérée dès
              l&apos;enregistrement.
            </p>
          </div>
        </Card>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3">
          <Link href="/sales">
            <Button type="button" variant="outline" className="rounded-xl border-outline-variant">
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={creerSortie.isPending || !pigeonId || !dateSortie}
            className="gap-2 rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-lg shadow-teal-900/25"
          >
            <Save className="h-4 w-4" />
            {creerSortie.isPending ? 'Enregistrement…' : 'Enregistrer la sortie'}
          </Button>
        </div>
      </form>
    </div>
  )
}