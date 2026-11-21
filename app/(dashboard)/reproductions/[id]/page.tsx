'use client'

// ─────────────────────────────────────────────────────────────────────────────
// app/(dashboard)/reproductions/[id]/page.tsx — Fiche d'un cycle d'élevage,
// design ultra-moderne réaliste. Le héros de la colonne gauche : l'ANNEAU DE
// CYCLE (J+x/18 en incubation, J+x/30 en sevrage, dégradé signature teal,
// ton ambre quand l'éclosion est imminente) posé au-dessus de la scène de nid
// à états. Droite : cartes de dates, ligne de temps à piste en dégradé,
// jeunes de la couvée avec leurs VRAIES photos.
// Les anciens boutons décoratifs deviennent RÉELS :
//   • « Noter l'éclosion » → useUpdateReproduction (date + nombre éclos)
//   • « Terminer le cycle » → useUpdateReproduction (date de sevrage)
//   • « Baguer un jeune »  → useAjouterJeunes (endpoint ajouterJeunes)
// Lecture seule pour le reste ; navigation vers les fiches des parents/jeunes.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useReproduction, useUpdateReproduction, useAjouterJeunes } from '@/hooks/use-reproductions'
import { useCouple } from '@/hooks/use-couples'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  Baby,
  Bird,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Egg,
  FileText,
  Hourglass,
  Plus,
  Stethoscope,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { AnneauCycle, OeufPuce, OeufsPonte } from '@/components/reproductions/scenes-oeufs'
import {
  CHIP_PHASE,
  dateEclosionPrevue,
  dateSevragePrevue,
  formatDateCourte,
  formatDateLong,
  INCUBATION_JOURS,
  periodeDe,
  SEVRAGE_JOURS,
} from '@/lib/cycles'
import { getPigeonImage } from '@/lib/pigeon-images'
import { getPhaseCycle } from '@/lib/cycles'
import type { PigeonMini } from '@/types'

const aujourdhui = () => new Date().toISOString().split('T')[0]

export default function ReproductionDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { data: repro, isLoading } = useReproduction(id)
  const { data: couple } = useCouple(repro?.couple || '')

  // ── Dialogues réels ──
  const modifierCycle = useUpdateReproduction()
  const baguer = useAjouterJeunes()

  const [showEclosion, setShowEclosion] = useState(false)
  const [dateEclosion, setDateEclosion] = useState('')
  const [nombreEclos, setNombreEclos] = useState(2)

  const [showTerminer, setShowTerminer] = useState(false)

  const [showBaguer, setShowBaguer] = useState(false)
  const [jeuneMatricule, setJeuneMatricule] = useState('')
  const [jeuneSexe, setJeuneSexe] = useState<'M' | 'F'>('M')
  const [jeuneCouleur, setJeuneCouleur] = useState('')

  // ── Noter l'éclosion (date + comptage réel) ──
  const handleEclosion = async () => {
    if (!repro) return
    if (!dateEclosion) {
      toast.error('Veuillez saisir la date d’éclosion')
      return
    }
    try {
      await modifierCycle.mutateAsync({
        id: repro.id,
        data: { date_eclosion: dateEclosion, nombre_eclos: nombreEclos },
      })
      toast.success('Éclosion notée — le nid passe en phase sevrage dès que les jeunes sont comptés')
      setShowEclosion(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Erreur lors de la mise à jour')
    }
  }

  // ── Terminer le cycle (noter le sevrage du jour) ──
  const handleTerminer = async () => {
    if (!repro) return
    try {
      await modifierCycle.mutateAsync({
        id: repro.id,
        data: { date_sevrage: aujourdhui() },
      })
      toast.success('Cycle terminé — les jeunes sont sevrés')
      setShowTerminer(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Erreur lors de la mise à jour')
    }
  }

  // ── Baguer un jeune de la couvée ──
  const handleBaguer = async () => {
    if (!repro) return
    if (!jeuneMatricule.trim()) {
      toast.error('Le matricule de la bague est requis')
      return
    }
    try {
      const resultat = await baguer.mutateAsync({
        id: repro.id,
        jeunes: [
          {
            matricule: jeuneMatricule.trim(),
            sexe: jeuneSexe,
            couleur: jeuneCouleur.trim() || undefined,
          },
        ],
      })
      toast.success(resultat?.message || `Jeune ${jeuneMatricule.trim()} bagué`)
      setJeuneMatricule('')
      setJeuneSexe('M')
      setJeuneCouleur('')
      setShowBaguer(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Erreur lors du baguage')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#00685f]" />
      </div>
    )
  }

  if (!repro) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Egg className="h-10 w-10 text-on-surface-variant/40" />
        <p className="text-on-surface-variant">Reproduction non trouvée</p>
        <Link href="/reproductions">
          <Button variant="outline" className="rounded-xl border-outline-variant">
            Retour au registre
          </Button>
        </Link>
      </div>
    )
  }

  // ── Phase et anneau ──
  const phase = getPhaseCycle(repro)
  const tonAnneau = phase.phase === 'imminente' ? 'ambre' : phase.phase === 'termine' ? 'gris' : 'teal'
  const joursDepuisEclosion = phase.joursDepuisEclosion

  // ── Parents : détail imbriqué d'abord, fiche couple en secours ──
  const maleParent: PigeonMini | null = repro.couple_details?.male ?? couple?.male_details ?? null
  const femelleParent: PigeonMini | null =
    repro.couple_details?.femelle ?? couple?.femelle_details ?? null

  // ── Ligne de temps ──
  const etapes = [
    {
      label: 'PONTE',
      date: formatDateCourte(repro.date_ponte),
      icone: Egg,
      completed: true,
      active: false,
    },
    {
      label: 'INCUBATION',
      date: `J ${Math.min(phase.joursDepuisPonte, INCUBATION_JOURS)}/${INCUBATION_JOURS}`,
      icone: Hourglass,
      completed: phase.phase !== 'incubation',
      active: phase.phase === 'incubation',
    },
    {
      label: 'ÉCLOSION',
      date: repro.date_eclosion
        ? formatDateCourte(repro.date_eclosion)
        : formatDateCourte(dateEclosionPrevue(repro.date_ponte)),
      icone: Bird,
      completed: !!repro.date_eclosion || phase.phase === 'termine',
      active: phase.phase === 'imminente',
    },
    {
      label: 'SEVRAGE',
      date: repro.date_eclosion ? formatDateCourte(dateSevragePrevue(repro.date_eclosion)) : '--/--',
      icone: Baby,
      completed: !!repro.date_sevrage || phase.phase === 'termine',
      active: phase.phase === 'sevrage',
    },
    {
      label: 'TERMINÉ',
      date: repro.date_sevrage ? formatDateCourte(repro.date_sevrage) : '--/--',
      icone: CheckCircle2,
      completed: phase.phase === 'termine',
      active: false,
    },
  ]
  const dernierIndexComplète = etapes.reduce((dernier, e, i) => (e.completed ? i : dernier), 0)
  const indexActif = etapes.findIndex((e) => e.active)
  // Le segment dégradé avance jusqu'au dernier nœud franchi + la progression
  // de la phase en cours (incubation/sevrage animent le trait en continu)
  const progressionTimeline =
    ((dernierIndexComplète + (indexActif >= 0 ? Math.min(Math.max(phase.progress, 0), 1) : 0)) /
      (etapes.length - 1)) *
    100

  const jeunes = repro.jeunes_details || []

  return (
    <div className="max-w-6xl space-y-6">
      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/reproductions">
            <Button variant="ghost" size="icon" className="mt-0.5">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-extrabold text-on-surface">Cycle d&apos;élevage</h1>
              <Badge className={cn('gap-1.5 rounded-full font-semibold', CHIP_PHASE[phase.phase])}>
                {phase.label}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-on-surface-variant">
              {periodeDe(repro.date_ponte)} {new Date(repro.date_ponte).getFullYear()} ·{' '}
              <code className="font-mono text-[12px]">#{repro.id.slice(0, 8)}</code>
              {maleParent && femelleParent && (
                <>
                  {' '}— {maleParent.matricule} + {femelleParent.matricule}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {!repro.date_eclosion && (
            <Button
              variant="outline"
              className="gap-2 rounded-xl border-outline-variant"
              onClick={() => {
                setDateEclosion(aujourdhui())
                setNombreEclos(repro.nombre_oeufs)
                setShowEclosion(true)
              }}
            >
              <Bird className="h-4 w-4" />
              Noter l&apos;éclosion
            </Button>
          )}
          {phase.phase !== 'termine' && (
            <Button
              className="gap-2 rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-lg shadow-teal-900/25"
              onClick={() => setShowTerminer(true)}
            >
              <CheckCircle2 className="h-4 w-4" />
              Terminer le cycle
            </Button>
          )}
        </div>
      </div>

      {/* ── Grille principal ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ══ Colonne gauche : le nid vivant + les parents ══ */}
        <div className="space-y-6 lg:col-span-4">
          <Card className="overflow-hidden rounded-3xl border-outline-variant">
            <CardContent className="p-5">
              <h3 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Le nid en direct
              </h3>

              {/* Anneau de progression de la phase */}
              <div className="flex justify-center">
                <AnneauCycle progress={phase.progress} ton={tonAnneau} taille={168}>
                  {phase.phase === 'imminente' ? (
                    <>
                      <Egg className="h-6 w-6 text-[#b45309]" />
                      <p className="mt-1 text-[13px] font-extrabold leading-tight text-[#9a3412]">
                        sur le point
                      </p>
                      <p className="text-[11px] font-semibold text-[#b45309]">d&apos;éclore</p>
                    </>
                  ) : phase.phase === 'termine' ? (
                    <>
                      <CheckCircle2 className="h-6 w-6 text-gray-400" />
                      <p className="mt-1 text-[13px] font-extrabold text-gray-500">Cycle terminé</p>
                    </>
                  ) : phase.phase === 'sevrage' ? (
                    <>
                      <p className="text-2xl font-extrabold leading-none text-on-surface">
                        J {joursDepuisEclosion ?? 0}
                      </p>
                      <p className="mt-1 text-[11px] font-semibold text-on-surface-variant">
                        sur {SEVRAGE_JOURS} — sevrage
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-extrabold leading-none text-on-surface">
                        J {phase.joursDepuisPonte}
                      </p>
                      <p className="mt-1 text-[11px] font-semibold text-on-surface-variant">
                        sur {INCUBATION_JOURS} — incubation
                      </p>
                    </>
                  )}
                </AnneauCycle>
              </div>
              <p className="mt-1 text-center text-[12px] text-on-surface-variant">{phase.description}</p>

              {/* Scène de nid à états */}
              <OeufsPonte
                phase={phase.phase}
                nombreOeufs={repro.nombre_oeufs}
                nombreEclos={repro.nombre_eclos}
                className="mx-auto mt-3 h-24 w-48"
              />

              {/* Comptages du nid */}
              <div className="mt-4 grid grid-cols-3 divide-x divide-outline-variant rounded-2xl bg-surface-container py-3 text-center">
                <div>
                  <OeufPuce className="mx-auto h-4 w-3" />
                  <p className="mt-1 text-[15px] font-extrabold text-on-surface">{repro.nombre_oeufs}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">Œufs</p>
                </div>
                <div>
                  <Bird className="mx-auto h-4 w-4 text-[#00685f]" />
                  <p className="mt-1 text-[15px] font-extrabold text-on-surface">
                    {repro.nombre_eclos ?? '--'}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">Éclos</p>
                </div>
                <div>
                  <Baby className="mx-auto h-4 w-4 text-[#00685f]" />
                  <p className="mt-1 text-[15px] font-extrabold text-on-surface">{repro.nombre_jeunes}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">Jeunes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Couple reproducteur ── */}
          <Card className="rounded-3xl border-outline-variant">
            <CardContent className="p-5">
              <h3 className="mb-4 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Couple reproducteur
              </h3>

              {maleParent && (
                <Link
                  href={`/pigeons/${maleParent.id}`}
                  className="mb-3 flex items-center gap-3 rounded-2xl bg-surface-container p-3 transition-colors hover:bg-surface-container-high"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getPigeonImage(maleParent.id, 'M')}
                    alt={`Mâle ${maleParent.matricule}`}
                    className="h-12 w-12 rounded-xl object-cover ring-2 ring-blue-100"
                    style={{ filter: 'drop-shadow(0 4px 6px rgba(10,40,35,0.15))' }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600">♂ Mâle</p>
                    <code className="font-mono text-[13px] font-bold text-on-surface">{maleParent.matricule}</code>
                    <p className="truncate text-[11.5px] text-on-surface-variant">
                      {[maleParent.race || 'Race inconnue', maleParent.couleur].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-on-surface-variant" />
                </Link>
              )}

              {femelleParent && (
                <Link
                  href={`/pigeons/${femelleParent.id}`}
                  className="flex items-center gap-3 rounded-2xl bg-surface-container p-3 transition-colors hover:bg-surface-container-high"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getPigeonImage(femelleParent.id, 'F')}
                    alt={`Femelle ${femelleParent.matricule}`}
                    className="h-12 w-12 rounded-xl object-cover ring-2 ring-pink-100"
                    style={{ filter: 'drop-shadow(0 4px 6px rgba(10,40,35,0.15))' }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-pink-600">♀ Femelle</p>
                    <code className="font-mono text-[13px] font-bold text-on-surface">{femelleParent.matricule}</code>
                    <p className="truncate text-[11.5px] text-on-surface-variant">
                      {[femelleParent.race || 'Race inconnue', femelleParent.couleur].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-on-surface-variant" />
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ══ Colonne droite : dates, timeline, jeunes ══ */}
        <div className="space-y-6 lg:col-span-8">
          {/* Cartes de dates */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="rounded-3xl border-outline-variant">
              <CardContent className="p-4">
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-on-surface-variant">Ponte</p>
                <p className="mt-1.5 text-[17px] font-extrabold text-on-surface">
                  {formatDateLong(repro.date_ponte)}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[11.5px] text-on-surface-variant">
                  <Hourglass className="h-3 w-3" />
                  il y a {phase.joursDepuisPonte} jour{phase.joursDepuisPonte > 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-outline-variant">
              <CardContent className="p-4">
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-on-surface-variant">
                  Éclosion prévue
                </p>
                <p className="mt-1.5 text-[17px] font-extrabold text-on-surface">
                  {formatDateLong(dateEclosionPrevue(repro.date_ponte))}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[11.5px] text-on-surface-variant">
                  <Calendar className="h-3 w-3" />
                  J+{INCUBATION_JOURS} après la ponte
                </p>
              </CardContent>
            </Card>

            <Card
              className={cn(
                'rounded-3xl border-outline-variant',
                repro.date_eclosion && 'border-l-4 border-l-[#00685f]',
              )}
            >
              <CardContent className="p-4">
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-on-surface-variant">
                  Éclosion réelle
                </p>
                <p className="mt-1.5 text-[17px] font-extrabold text-on-surface">
                  {repro.date_eclosion ? formatDateLong(repro.date_eclosion) : '--/--/----'}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[11.5px] text-on-surface-variant">
                  <CheckCircle2 className={cn('h-3 w-3', repro.date_eclosion && 'text-[#00685f]')} />
                  {repro.date_eclosion ? 'Confirmée' : 'En attente de notation'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ── Ligne de temps du cycle ── */}
          <Card className="rounded-3xl border-outline-variant">
            <CardContent className="p-5">
              <h3 className="mb-6 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Ligne de temps du cycle
              </h3>
              <div className="relative">
                {/* Piste de base + segment en dégradé sur les étapes franchies */}
                <div className="absolute left-0 right-0 top-6 h-1 rounded-full bg-[#e7eeec]" aria-hidden="true" />
                <div
                  className="absolute left-0 top-6 h-1 rounded-full bg-gradient-to-r from-[#00685f] to-[#014d44] transition-all duration-700"
                  style={{ width: `${Math.min(progressionTimeline, 100)}%` }}
                  aria-hidden="true"
                />

                <div className="flex items-start justify-between">
                  {etapes.map((etape) => {
                    const Icone = etape.icone
                    return (
                      <div key={etape.label} className="relative flex w-1/5 flex-col items-center gap-2">
                        <span
                          className={cn(
                            'relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl transition-all sm:h-12 sm:w-12',
                            etape.completed
                              ? 'bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-md shadow-teal-900/20'
                              : etape.active
                                ? 'bg-white text-[#00685f] ring-2 ring-[#00685f]'
                                : 'bg-surface-container text-gray-400',
                          )}
                        >
                          {etape.active && (
                            <span className="absolute inset-0 -m-1.5 animate-pulse rounded-2xl bg-[#00685f]/10" aria-hidden="true" />
                          )}
                          <Icone className="h-5 w-5" />
                        </span>
                        <div className="text-center">
                          <p
                            className={cn(
                              'text-[10px] font-bold uppercase tracking-wide',
                              etape.completed || etape.active ? 'text-on-surface' : 'text-gray-400',
                            )}
                          >
                            {etape.label}
                          </p>
                          <p className="mt-0.5 text-[10.5px] text-on-surface-variant">{etape.date}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Jeunes de la couvée ── */}
          <Card className="rounded-3xl border-outline-variant">
            <CardContent className="p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-[15px] font-extrabold text-on-surface">
                  <Baby className="h-5 w-5 text-[#00685f]" />
                  Jeunes de la couvée ({repro.nombre_jeunes})
                </h3>
                <Button
                  variant="ghost"
                  className="gap-1.5 text-[#00685f] hover:bg-[#f5faf8] hover:text-[#00554d]"
                  onClick={() => setShowBaguer(true)}
                >
                  <Plus className="h-4 w-4" />
                  Baguer un jeune
                </Button>
              </div>

              {jeunes.length > 0 ? (
                <div className="space-y-3">
                  {jeunes.map((jeune) => (
                    <Link
                      key={jeune.id}
                      href={`/pigeons/${jeune.id}`}
                      className="flex items-center gap-4 rounded-2xl border border-outline-variant p-3 transition-colors hover:bg-[#f5faf8]"
                    >
                      {/* Vraie photo du pigeonneau bagué */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getPigeonImage(jeune.id, jeune.sexe ?? 'M')}
                        alt={`Jeune ${jeune.matricule}`}
                        className="h-14 w-14 rounded-xl object-cover"
                        style={{ filter: 'drop-shadow(0 4px 6px rgba(10,40,35,0.15))' }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-surface-container px-2 py-0.5 font-mono text-[13px] font-bold text-on-surface">
                            {jeune.matricule}
                          </code>
                          <span
                            className={cn(
                              'text-[15px] font-bold',
                              jeune.sexe === 'M' ? 'text-blue-600' : jeune.sexe === 'F' ? 'text-pink-600' : 'text-gray-400',
                            )}
                          >
                            {jeune.sexe === 'M' ? '♂' : jeune.sexe === 'F' ? '♀' : '?'}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[12.5px] text-on-surface-variant">
                          {jeune.sexe === 'M' ? 'Mâle' : jeune.sexe === 'F' ? 'Femelle' : 'Sexe indéterminé'}
                          {jeune.race ? ` · ${jeune.race}` : ''}
                          {jeune.couleur ? ` · ${jeune.couleur}` : ''}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-on-surface-variant">
                          <CheckCircle2 className="h-3 w-3 text-[#00685f]" />
                          Né le{' '}
                          {repro.date_eclosion
                            ? formatDateLong(repro.date_eclosion)
                            : formatDateLong(repro.date_ponte)}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-on-surface-variant" />
                    </Link>
                  ))}
                </div>
              ) : repro.nombre_jeunes > 0 ? (
                <div className="rounded-2xl bg-surface-container p-5 text-center">
                  <p className="text-xl font-extrabold text-on-surface">{repro.nombre_jeunes}</p>
                  <p className="text-[12.5px] text-on-surface-variant">
                    jeune{repro.nombre_jeunes > 1 ? 's' : ''} comptabilisé{repro.nombre_jeunes > 1 ? 's' : ''}
                  </p>
                  <p className="mx-auto mt-1.5 max-w-xs text-[11.5px] leading-relaxed text-on-surface-variant">
                    Les fiches apparaîtront ici dès le baguage — utilisez « Baguer un jeune ».
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <OeufsPonte phase={phase.phase} nombreOeufs={repro.nombre_oeufs} className="h-20 w-40 opacity-80" />
                  <p className="mt-3 text-sm text-on-surface-variant">Aucun jeune bagué pour l&apos;instant</p>
                  <Button
                    variant="outline"
                    className="mt-3 gap-2 rounded-xl border-outline-variant"
                    onClick={() => setShowBaguer(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Baguer le premier jeune
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Notes ── */}
          {repro.notes && (
            <Card className="rounded-3xl border-outline-variant">
              <CardContent className="p-5">
                <h3 className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  <FileText className="h-3.5 w-3.5" />
                  Notes du cycle
                </h3>
                <p className="whitespace-pre-line text-[13px] leading-relaxed text-on-surface">{repro.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Actions de pied de page ── */}
      <div className="flex flex-wrap items-center gap-3 border-t border-outline-variant pt-4">
        {!repro.date_eclosion && (
          <Button
            variant="outline"
            className="gap-2 rounded-xl border-outline-variant"
            onClick={() => {
              setDateEclosion(aujourdhui())
              setNombreEclos(repro.nombre_oeufs)
              setShowEclosion(true)
            }}
          >
            <Egg className="h-4 w-4" />
            Noter l&apos;éclosion
          </Button>
        )}
        <Button variant="outline" className="gap-2 rounded-xl border-outline-variant">
          <Stethoscope className="h-4 w-4" />
          Ajouter soin / vaccin
        </Button>
        <Button variant="outline" className="gap-2 rounded-xl border-outline-variant">
          <FileText className="h-4 w-4" />
          Ajouter une note
        </Button>
      </div>

      {/* ═══════════ Dialogue : noter l'éclosion ═══════════ */}
      <Dialog open={showEclosion} onOpenChange={setShowEclosion}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-on-surface">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff4e5] text-[#b45309]">
                <Bird className="h-5 w-5" />
              </span>
              Noter l&apos;éclosion
            </DialogTitle>
            <DialogDescription className="text-on-surface-variant">
              Consignez la date réelle d&apos;éclosion et le nombre de poussins sortis de la coquille.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 rounded-2xl bg-surface-container p-4">
            <div className="space-y-2">
              <Label htmlFor="date_eclosion_reelle" className="text-[13px]">
                Date d&apos;éclosion <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date_eclosion_reelle"
                type="date"
                value={dateEclosion}
                onChange={(e) => setDateEclosion(e.target.value)}
                className="rounded-xl border-outline-variant bg-white text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px]">Poussins éclos</Label>
              <div className="flex h-10 items-center justify-between rounded-xl border border-outline-variant bg-white px-2">
                <button
                  type="button"
                  onClick={() => setNombreEclos((v) => Math.max(0, v - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
                  aria-label="Retirer un poussin"
                >
                  −
                </button>
                <span className="flex items-center gap-2">
                  <Bird className="h-4 w-4 text-[#00685f]" />
                  <span className="text-[15px] font-extrabold text-on-surface">
                    {nombreEclos} / {repro.nombre_oeufs}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setNombreEclos((v) => Math.min(repro.nombre_oeufs, v + 1))}
                  disabled={nombreEclos >= repro.nombre_oeufs}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#00685f] transition-colors hover:bg-[#eef7f5] disabled:opacity-30"
                  aria-label="Ajouter un poussin"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-1">
            <Button variant="outline" className="rounded-xl border-outline-variant" onClick={() => setShowEclosion(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleEclosion}
              disabled={modifierCycle.isPending}
              className="gap-2 rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white"
            >
              {modifierCycle.isPending ? 'Enregistrement…' : 'Confirmer l’éclosion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════ Dialogue : terminer le cycle ═══════════ */}
      <Dialog open={showTerminer} onOpenChange={setShowTerminer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-on-surface">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef7f5] text-[#00685f]">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              Terminer le cycle ?
            </DialogTitle>
            <DialogDescription className="text-on-surface-variant">
              Le sevrage des pigeonneaux sera noté à la date du jour.
            </DialogDescription>
          </DialogHeader>

          <ul className="space-y-2 rounded-2xl bg-surface-container p-4 text-[13px] text-on-surface-variant">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#00685f]" />
              La date de sevrage sera fixée à aujourd&apos;hui
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#00685f]" />
              Le cycle sera archivé comme « terminé » dans le registre
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#00685f]" />
              Les jeunes bagués restent consultables dans leurs fiches pigeon
            </li>
          </ul>

          <DialogFooter className="gap-2 pt-1">
            <Button variant="outline" className="rounded-xl border-outline-variant" onClick={() => setShowTerminer(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleTerminer}
              disabled={modifierCycle.isPending}
              className="gap-2 rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white"
            >
              {modifierCycle.isPending ? 'Enregistrement…' : 'Confirmer la fin du cycle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════ Dialogue : baguer un jeune ═══════════ */}
      <Dialog open={showBaguer} onOpenChange={setShowBaguer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-on-surface">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef7f5] text-[#00685f]">
                <Plus className="h-5 w-5" />
              </span>
              Baguer un jeune de la couvée
            </DialogTitle>
            <DialogDescription className="text-on-surface-variant">
              Le pigeonneau sera créé dans le registre et rattaché à ce cycle.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 rounded-2xl bg-surface-container p-4">
            <div className="space-y-2">
              <Label htmlFor="jeune_matricule" className="text-[13px]">
                Matricule de la bague <span className="text-red-500">*</span>
              </Label>
              <Input
                id="jeune_matricule"
                value={jeuneMatricule}
                onChange={(e) => setJeuneMatricule(e.target.value)}
                placeholder="Ex : BE-2026-042"
                className="rounded-xl border-outline-variant bg-white text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="jeune_sexe" className="text-[13px]">
                  Sexe
                </Label>
                <select
                  id="jeune_sexe"
                  value={jeuneSexe}
                  onChange={(e) => setJeuneSexe(e.target.value === 'F' ? 'F' : 'M')}
                  className="h-10 w-full rounded-xl border border-outline-variant bg-white px-3 text-sm"
                >
                  <option value="M">Mâle</option>
                  <option value="F">Femelle</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jeune_couleur" className="text-[13px]">
                  Couleur / Motif
                </Label>
                <Input
                  id="jeune_couleur"
                  value={jeuneCouleur}
                  onChange={(e) => setJeuneCouleur(e.target.value)}
                  placeholder="Ex : Bleu barré"
                  className="rounded-xl border-outline-variant bg-white text-sm"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-1">
            <Button variant="outline" className="rounded-xl border-outline-variant" onClick={() => setShowBaguer(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleBaguer}
              disabled={baguer.isPending}
              className="gap-2 rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white"
            >
              {baguer.isPending ? 'Baguage…' : 'Baguer ce jeune'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}