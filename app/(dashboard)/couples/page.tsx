'use client'

// ─────────────────────────────────────────────────────────────────────────────
// app/(dashboard)/couples/page.tsx — Couples d'élevage, design ultra-moderne
// réaliste, cohérent avec le registre des pigeons (identité teal #00685f,
// tokens Material). Chaque carte est une MINI-SCÈNE DE VOLIÈRE : les vraies
// photos des deux pigeons posés face à face sur une ombre douce, cœur flottant
// entre eux, et le décompte des pontes matérialisé par un nid SVG
// ultra-réaliste (1 oeuf = 1 ponte, components/couples/nid-oeufs.tsx).
// Logique métier INCHANGÉE : recherche par matricule, filtres par statut,
// ponte express (useQuickCreateReproduction + compteur PATCH),
// séparation (useSeparateCouple → libère automatiquement la cage).
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useCouples, useSeparateCouple, useUpdateCouple } from '@/hooks/use-couples'
import { useQuickCreateReproduction } from '@/hooks/use-reproductions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CalendarDays,
  Check,
  ChevronRight,
  Egg,
  Heart,
  Plus,
  Scissors,
  Search,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { getPigeonImage } from '@/lib/pigeon-images'
import { NidOeufs } from '@/components/couples/nid-oeufs'
import type { Couple, CoupleMember } from '@/types'

type FiltreStatut = 'tous' | 'actif' | 'rompu'

const FILTRES: Array<{ valeur: FiltreStatut; label: string }> = [
  { valeur: 'tous', label: 'Tous' },
  { valeur: 'actif', label: 'Actifs' },
  { valeur: 'rompu', label: 'Séparés' },
]

export default function CouplesPage() {
  const { data: couplesData, isLoading } = useCouples()
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState<FiltreStatut>('tous')

  const couples = couplesData?.results || []

  const couplesFiltres = useMemo(() => {
    const q = recherche.trim().toLowerCase()
    return couples.filter((couple) => {
      const male = couple.male_details?.matricule.toLowerCase() || ''
      const femelle = couple.femelle_details?.matricule.toLowerCase() || ''
      const correspondRecherche = !q || male.includes(q) || femelle.includes(q)
      const correspondStatut = filtreStatut === 'tous' || couple.statut === filtreStatut
      return correspondRecherche && correspondStatut
    })
  }, [couples, recherche, filtreStatut])

  const compteurs = useMemo(
    () => ({
      tous: couples.length,
      actif: couples.filter((c) => c.statut === 'actif').length,
      rompu: couples.filter((c) => c.statut === 'rompu').length,
    }),
    [couples],
  )

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#00685f]" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl space-y-6">
      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00685f] to-[#01352f] text-white shadow-md shadow-teal-900/25">
            <Heart className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-on-surface sm:text-3xl">Couples d&apos;élevage</h1>
            <p className="mt-0.5 text-sm text-on-surface-variant">
              Suivez vos unions, notez les pontes en un clic et conservez l&apos;historique complet.
            </p>
          </div>
        </div>
        <Link href="/couples/new">
          <Button className="gap-2 rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-lg shadow-teal-900/25">
            <Plus className="h-4 w-4" />
            Former un couple
          </Button>
        </Link>
      </div>

      {/* ── Recherche + filtres segmentés ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <Input
            placeholder="Rechercher par matricule…"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="rounded-xl border-outline-variant bg-surface-container pl-10"
          />
        </div>
        <div className="flex items-center gap-1 rounded-2xl border border-outline-variant bg-surface-container p-1">
          {FILTRES.map((f) => (
            <button
              key={f.valeur}
              type="button"
              onClick={() => setFiltreStatut(f.valeur)}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[13px] font-semibold transition-all',
                filtreStatut === f.valeur
                  ? 'bg-[#00685f] text-white shadow-sm shadow-teal-900/20'
                  : 'text-on-surface-variant hover:text-on-surface',
              )}
            >
              {f.label}
              <span
                className={cn(
                  'rounded-full px-1.5 py-px text-[10.5px] font-bold',
                  filtreStatut === f.valeur
                    ? 'bg-white/25 text-white'
                    : 'bg-surface-container-high text-on-surface-variant',
                )}
              >
                {compteurs[f.valeur]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Grille des couples ── */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {couplesFiltres.map((couple) => (
          <CarteCouple key={couple.id} couple={couple} />
        ))}
      </div>

      {/* ── État vide ── */}
      {couplesFiltres.length === 0 && <EtatVide filtreActif={recherche.trim() !== '' || filtreStatut !== 'tous'} />}
    </div>
  )
}

// ─── Identité d'un pigeon du couple (sous-bloc matricule + plumage) ──────────
function Identite({ membre, sexe }: { membre: CoupleMember; sexe: 'M' | 'F' }) {
  const estMale = sexe === 'M'
  return (
    <div className="rounded-2xl bg-surface-container px-3 py-2.5 text-center">
      <p
        className={cn(
          'text-[10px] font-bold uppercase tracking-wide',
          estMale ? 'text-blue-600' : 'text-pink-600',
        )}
      >
        {estMale ? '♂ Mâle' : '♀ Femelle'}
      </p>
      <code className="mt-0.5 block font-mono text-[13px] font-bold text-on-surface">
        {membre.matricule}
      </code>
      {(membre.couleur || membre.race) && (
        <p className="mt-0.5 truncate text-[11px] text-on-surface-variant">
          {membre.couleur || membre.race}
        </p>
      )}
    </div>
  )
}

// ─── Carte couple : la scène d'union ─────────────────────────────────────────
function CarteCouple({ couple }: { couple: Couple }) {
  const [confirmPonte, setConfirmPonte] = useState(false)
  const [showSeparation, setShowSeparation] = useState(false)
  const ponteExpress = useQuickCreateReproduction()
  const modifierCouple = useUpdateCouple()
  const separer = useSeparateCouple()

  const estActif = couple.statut === 'actif'
  const male = couple.male_details
  const femelle = couple.femelle_details
  const pontes = couple.reproductions_count || 0

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

  // 🥚 Ponte express : crée la reproduction du jour + incrémente le compteur
  const handleQuickPonte = async () => {
    const aujourdhui = new Date().toISOString().split('T')[0]

    try {
      await ponteExpress.mutateAsync({
        couple: couple.id,
        date_ponte: aujourdhui,
        nombre_oeufs: 2,
      })

      await modifierCouple.mutateAsync({
        id: couple.id,
        data: { reproductions_count: pontes + 1 },
      })

      toast.success(
        `Ponte du ${aujourdhui} enregistrée pour ${male?.matricule} + ${femelle?.matricule}`,
      )
      setConfirmPonte(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Erreur lors de l'enregistrement")
    }
  }

  // ✂️ Séparation : rompt l'union et libère la cage
  const handleSeparer = async () => {
    try {
      await separer.mutateAsync({ id: couple.id })
      toast.success(`Couple ${male?.matricule} + ${femelle?.matricule} séparé`)
      setShowSeparation(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Erreur lors de la séparation')
    }
  }

  if (!male || !femelle) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-3xl border border-outline-variant bg-surface-container-lowest text-center">
        <Heart className="h-6 w-6 text-on-surface-variant/40" />
        <p className="text-sm text-on-surface-variant">Données incomplètes</p>
      </div>
    )
  }

  return (
    <>
      <div className="group overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-900/10">
        {/* ══ Scène photo : les deux pigeons face à face ══ */}
        <div
          className={cn(
            'relative h-44 bg-gradient-to-b from-[#eaf4f1] to-white',
            !estActif && 'opacity-75 saturate-50',
          )}
        >
          {/* Ombres de contact au sol (une par pigeon) */}
          <div
            className="absolute bottom-3 left-[10%] h-3 w-[32%] rounded-full"
            style={{ background: 'radial-gradient(ellipse at center, rgba(15,60,55,0.16), transparent 70%)' }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-3 right-[10%] h-3 w-[32%] rounded-full"
            style={{ background: 'radial-gradient(ellipse at center, rgba(15,60,55,0.16), transparent 70%)' }}
            aria-hidden="true"
          />

          {/* Mâle — retourné pour faire face à la femelle */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getPigeonImage(String(male.id), 'M')}
            alt={`Mâle ${male.matricule}`}
            loading="lazy"
            className="absolute bottom-1.5 left-[6%] h-[72%] object-contain transition-transform duration-300 group-hover:scale-[1.04]"
            style={{
              transform: 'scaleX(-1)',
              filter: 'drop-shadow(0 6px 8px rgba(10,40,35,0.18))',
            }}
          />
          {/* Femelle */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getPigeonImage(String(femelle.id), 'F')}
            alt={`Femelle ${femelle.matricule}`}
            loading="lazy"
            className="absolute bottom-1.5 right-[6%] h-[72%] object-contain transition-transform duration-300 group-hover:scale-[1.04]"
            style={{ filter: 'drop-shadow(0 6px 8px rgba(10,40,35,0.18))' }}
          />

          {/* Cœur de l'union — halo pulsant tant que le couple est actif */}
          <span className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2">
            {estActif && (
              <span className="absolute inset-0 -m-2 animate-pulse rounded-full bg-pink-200/60" aria-hidden="true" />
            )}
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm ring-1 ring-pink-100">
              <Heart className={cn('h-4 w-4', estActif ? 'fill-pink-400 text-pink-400' : 'text-gray-300')} />
            </span>
          </span>

          {/* Badge de statut */}
          <span className="absolute left-3 top-3">
            {estActif ? (
              <Badge className="bg-[#00685f] text-white hover:bg-[#00685f]">ACTIF</Badge>
            ) : (
              <Badge className="bg-gray-200 text-gray-600 hover:bg-gray-200">SÉPARÉ</Badge>
            )}
          </span>

          {/* Actions rapides */}
          <div className="absolute right-3 top-3 flex items-center gap-1.5">
            {estActif &&
              (confirmPonte ? (
                <div className="flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 shadow-md ring-1 ring-[#cfe5df]">
                  <span className="pr-0.5 text-[11px] font-semibold text-[#00685f]">Ponte aujourd&apos;hui ?</span>
                  <button
                    onClick={handleQuickPonte}
                    disabled={ponteExpress.isPending}
                    className="rounded-full p-1 text-[#00685f] transition-colors hover:bg-[#00685f] hover:text-white"
                    title="Confirmer la ponte"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmPonte(false)}
                    className="rounded-full p-1 text-red-500 transition-colors hover:bg-red-50"
                    title="Annuler"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmPonte(true)}
                  title="Noter une ponte aujourd'hui"
                  className="rounded-full bg-white/85 p-1.5 text-[#00685f] shadow-sm ring-1 ring-[#d5eae5] backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
                >
                  <Egg className="h-4 w-4" />
                </button>
              ))}

            {estActif && (
              <button
                onClick={() => setShowSeparation(true)}
                title="Séparer le couple"
                className="rounded-full bg-white/85 p-1.5 text-red-500 shadow-sm ring-1 ring-red-100 backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
              >
                <Scissors className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* ══ Identités des deux conjoints ══ */}
        <div className="grid grid-cols-2 gap-2 px-4 pt-3.5">
          <Identite membre={male} sexe="M" />
          <Identite membre={femelle} sexe="F" />
        </div>

        {/* ══ Pied : dates + nid de pontes ══ */}
        <div className="mt-3.5 flex items-center justify-between border-t border-outline-variant px-4 py-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
              {estActif ? 'Formé le' : 'Union du'}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-on-surface">
              <CalendarDays className="h-3.5 w-3.5 text-[#00685f]" />
              {formatDate(couple.date_formation)}
            </p>
            {couple.date_rupture && (
              <p className="mt-0.5 text-[11px] text-on-surface-variant">
                séparé le {formatDate(couple.date_rupture)}
              </p>
            )}
          </div>

          <Link
            href={`/reproductions?couple=${couple.id}`}
            className="flex items-center gap-2.5 rounded-2xl bg-[#eef7f5] px-3 py-2 transition-colors hover:bg-[#dcefe9]"
          >
            <NidOeufs nombre={pontes} className="h-8 w-14" />
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#1d5a52]">Pontes</p>
              <p className="text-[15px] font-extrabold leading-none text-[#00685f]">{pontes}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-[#00685f]" />
          </Link>
        </div>
      </div>

      {/* ── Dialogue de confirmation de séparation ── */}
      <Dialog open={showSeparation} onOpenChange={setShowSeparation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-on-surface">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <Scissors className="h-5 w-5" />
              </span>
              Séparer le couple ?
            </DialogTitle>
            <DialogDescription className="text-on-surface-variant">
              Vous êtes sur le point de séparer <strong>{male.matricule}</strong> et{' '}
              <strong>{femelle.matricule}</strong>.
            </DialogDescription>
          </DialogHeader>

          <ul className="space-y-2 rounded-2xl bg-surface-container p-4 text-[13px] text-on-surface-variant">
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00685f]" />
              Le couple passera au statut « séparé »
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00685f]" />
              La cage occupée par ce couple sera automatiquement libérée
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00685f]" />
              L&apos;historique des pontes et des reproductions est conservé
            </li>
          </ul>

          <DialogFooter className="gap-2 pt-1">
            <Button
              variant="outline"
              className="rounded-xl border-outline-variant"
              onClick={() => setShowSeparation(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleSeparer}
              disabled={separer.isPending}
              className="gap-2 rounded-xl"
            >
              {separer.isPending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
              ) : (
                <Scissors className="h-4 w-4" />
              )}
              {separer.isPending ? 'Séparation…' : 'Confirmer la séparation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─── État vide : nid désert + invitation ─────────────────────────────────────
function EtatVide({ filtreActif }: { filtreActif: boolean }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-outline-variant bg-surface-container-lowest px-6 py-14 text-center">
      <NidOeufs nombre={0} className="h-24 w-44" />
      <h3 className="mt-4 text-lg font-extrabold text-on-surface">Aucun couple à afficher</h3>
      <p className="mt-1 max-w-md text-sm leading-relaxed text-on-surface-variant">
        {filtreActif
          ? 'Aucun couple ne correspond à votre recherche. Essayez un autre matricule ou réinitialisez les filtres.'
          : "Formez votre premier couple d'élevage : vous pourrez alors noter chaque ponte en un clic et suivre l'éclosion jusqu'au baguage."}
      </p>
      <Link href="/couples/new">
        <Button className="mt-5 gap-2 rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-lg shadow-teal-900/25">
          <Heart className="h-4 w-4" />
          Former un couple
        </Button>
      </Link>
    </div>
  )
}