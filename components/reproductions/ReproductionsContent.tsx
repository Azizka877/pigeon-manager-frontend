'use client'

// ─────────────────────────────────────────────────────────────────────────────
// components/reproductions/ReproductionsContent.tsx — Registre des cycles
// d'élevage, design ultra-moderne réaliste cohérent avec le registre des
// couples : chaque ligne porte une MINI-SCÈNE DE NID dont l'état raconte le
// cycle (porcelaine lisse = incubation, fissures dorées = éclosion imminente,
// poussin au duvet = éclos, tons éteints = archivé). Filtres segmentés par
// phase avec compteurs, bannière photo quand on vient d'une carte couple
// (?couple=…), tableau desktop + cartes mobile.
// Logique métier inchangée : useReproductions (filtrage par couple conservé),
// navigation vers /reproductions/{id} et /reproductions/new.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useReproductions } from '@/hooks/use-reproductions'
import { useCouples } from '@/hooks/use-couples'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Baby,
  CalendarDays,
  ChevronRight,
  Egg,
  Heart,
  Plus,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { OeufsPonte, OeufPuce } from '@/components/reproductions/scenes-oeufs'
import {
  CHIP_PHASE,
  formatDateCourte,
  formatDateLong,
  getPhaseCycle,
  PULSE_PHASE,
  type InfoPhase,
  type PhaseCycle,
} from '@/lib/cycles'
import { getPigeonImage } from '@/lib/pigeon-images'
import type { Couple, Reproduction } from '@/types'

type FiltrePhase = 'tous' | PhaseCycle

const FILTRES: Array<{ valeur: FiltrePhase; label: string }> = [
  { valeur: 'tous', label: 'Tous' },
  { valeur: 'incubation', label: 'Incubation' },
  { valeur: 'imminente', label: 'Éclosion proche' },
  { valeur: 'sevrage', label: 'Sevrage' },
  { valeur: 'termine', label: 'Terminés' },
]

export default function ReproductionsContent() {
  const searchParams = useSearchParams()
  const coupleFilter = searchParams.get('couple')

  const { data: reproductionsData, isLoading } = useReproductions(coupleFilter || undefined)
  const { data: couples } = useCouples()

  const [filtrePhase, setFiltrePhase] = useState<FiltrePhase>('tous')

  const reproductions = reproductionsData?.results || []

  // Tri : les pontes les plus récentes d'abord
  const reproductionsTriees = useMemo(
    () =>
      [...reproductions].sort(
        (a, b) => new Date(b.date_ponte).getTime() - new Date(a.date_ponte).getTime(),
      ),
    [reproductions],
  )

  const coupleFiltre = useMemo(
    () => couples?.results?.find((c) => c.id === coupleFilter) || null,
    [couples, coupleFilter],
  )

  const phasesParId = useMemo(() => {
    const map = new Map<string, InfoPhase>()
    reproductionsTriees.forEach((r) => map.set(r.id, getPhaseCycle(r)))
    return map
  }, [reproductionsTriees])

  const filtresActifs = useMemo(
    () =>
      filtrePhase === 'tous'
        ? reproductionsTriees
        : reproductionsTriees.filter((r) => phasesParId.get(r.id)?.phase === filtrePhase),
    [reproductionsTriees, phasesParId, filtrePhase],
  )

  const compteurs = useMemo(() => {
    const base: Record<FiltrePhase, number> = {
      tous: reproductionsTriees.length,
      incubation: 0,
      imminente: 0,
      sevrage: 0,
      termine: 0,
    }
    phasesParId.forEach((info) => {
      base[info.phase] += 1
    })
    return base
  }, [phasesParId, reproductionsTriees])

  /** « M + F » d'un cycle : détail imbriqué d'abord, registre des couples ensuite */
  const libelleCouple = (repro: Reproduction) => {
    const viaCouples = couples?.results?.find((c) => c.id === repro.couple)
    const male =
      repro.couple_details?.male?.matricule || viaCouples?.male_details?.matricule || 'Inconnu'
    const femelle =
      repro.couple_details?.femelle?.matricule || viaCouples?.femelle_details?.matricule || 'Inconnue'
    return `${male} + ${femelle}`
  }

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
            <Egg className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-on-surface sm:text-3xl">
              Registre des cycles d&apos;élevage
            </h1>
            <p className="mt-0.5 text-sm text-on-surface-variant">
              Pontes, incubations et sevrages — chaque nid raconte où en est la couvée.
            </p>
          </div>
        </div>
        <Link href="/reproductions/new">
          <Button className="gap-2 rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-lg shadow-teal-900/25">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouvelle reproduction</span>
            <span className="sm:hidden">Nouvelle</span>
          </Button>
        </Link>
      </div>

      {/* ── Bannière : pontes d'un seul couple (arrivée depuis /couples) ── */}
      {coupleFiltre && (
        <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-outline-variant bg-surface-container-lowest p-4">
          {/* Mini-scène d'union : les deux vraies photos face à face */}
          <div className="flex items-center">
            {coupleFiltre.male_details && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={getPigeonImage(String(coupleFiltre.male_details.id), 'M')}
                alt={`Mâle ${coupleFiltre.male_details.matricule}`}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-blue-100"
                style={{ transform: 'scaleX(-1)', filter: 'drop-shadow(0 4px 6px rgba(10,40,35,0.18))' }}
              />
            )}
            <span className="-mx-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/95 shadow-sm ring-1 ring-pink-100">
              <Heart className="h-3.5 w-3.5 fill-pink-400 text-pink-400" />
            </span>
            {coupleFiltre.femelle_details && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={getPigeonImage(String(coupleFiltre.femelle_details.id), 'F')}
                alt={`Femelle ${coupleFiltre.femelle_details.matricule}`}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-pink-100"
                style={{ filter: 'drop-shadow(0 4px 6px rgba(10,40,35,0.18))' }}
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
              Pontes du couple
            </p>
            <p className="font-mono text-[15px] font-bold text-on-surface">
              {coupleFiltre.male_details?.matricule || 'Inconnu'} + {coupleFiltre.femelle_details?.matricule || 'Inconnue'}
            </p>
          </div>
          <Link href="/reproductions">
            <Button variant="outline" className="gap-2 rounded-xl border-outline-variant text-sm">
              <X className="h-4 w-4" />
              Voir tous les cycles
            </Button>
          </Link>
        </div>
      )}

      {/* ── Filtres segmentés par phase ── */}
      <div className="flex items-center gap-1 self-start rounded-2xl border border-outline-variant bg-surface-container p-1">
        {FILTRES.map((f) => (
          <button
            key={f.valeur}
            type="button"
            onClick={() => setFiltrePhase(f.valeur)}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[13px] font-semibold transition-all',
              filtrePhase === f.valeur
                ? 'bg-[#00685f] text-white shadow-sm shadow-teal-900/20'
                : 'text-on-surface-variant hover:text-on-surface',
            )}
          >
            {f.label}
            <span
              className={cn(
                'rounded-full px-1.5 py-px text-[10.5px] font-bold',
                filtrePhase === f.valeur
                  ? 'bg-white/25 text-white'
                  : 'bg-surface-container-high text-on-surface-variant',
              )}
            >
              {compteurs[f.valeur]}
            </span>
          </button>
        ))}
      </div>

      {/* ══ Vue desktop : tableau des cycles ══ */}
      <div className="hidden overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest md:block">
        {filtresActifs.length === 0 ? (
          <EtatVide filtreActif={filtrePhase !== 'tous' || !!coupleFilter} />
        ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container">
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Couple
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Phase
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Ponte
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Œufs
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Jeunes
              </th>
              <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                Fiche
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {filtresActifs.map((repro) => {
              const info = phasesParId.get(repro.id) as InfoPhase
              const pulse = PULSE_PHASE[info.phase]
              return (
                <tr key={repro.id} className="group transition-colors hover:bg-[#f5faf8]">
                  {/* Couple : mini-scène de nid + matricules */}
                  <td className="px-6 py-4">
                    <Link href={`/reproductions/${repro.id}`} className="flex items-center gap-4">
                      <OeufsPonte
                        phase={info.phase}
                        nombreOeufs={repro.nombre_oeufs}
                        nombreEclos={repro.nombre_eclos}
                        className="h-12 w-24 shrink-0"
                      />
                      <span className="font-mono text-[13.5px] font-bold text-on-surface">
                        {libelleCouple(repro)}
                      </span>
                    </Link>
                  </td>
                  {/* Phase : badge + point pulsant pour les nids « vivants » */}
                  <td className="px-6 py-4">
                    <Badge className={cn('gap-1.5 whitespace-nowrap rounded-full font-semibold', CHIP_PHASE[info.phase])}>
                      {pulse && (
                        <span className={cn('h-1.5 w-1.5 animate-pulse rounded-full', pulse)} aria-hidden="true" />
                      )}
                      {info.label}
                    </Badge>
                  </td>
                  {/* Ponte */}
                  <td className="px-6 py-4">
                    <p className="flex items-center gap-1.5 text-[13px] font-semibold text-on-surface">
                      <CalendarDays className="h-3.5 w-3.5 text-[#00685f]" />
                      {formatDateLong(repro.date_ponte)}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-on-surface-variant">
                      il y a {info.joursDepuisPonte} jour{info.joursDepuisPonte > 1 ? 's' : ''}
                    </p>
                  </td>
                  {/* Œufs / éclos */}
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-[13px] font-semibold text-on-surface">
                      <OeufPuce className="h-4 w-3" />
                      {repro.nombre_oeufs}
                      {repro.nombre_eclos != null && (
                        <span className="text-[12px] font-medium text-on-surface-variant">
                          · {repro.nombre_eclos} éclo{repro.nombre_eclos > 1 ? 's' : ''}
                        </span>
                      )}
                    </span>
                  </td>
                  {/* Jeunes */}
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-[13px] font-semibold text-on-surface">
                      <Baby className="h-4 w-4 text-[#00685f]" />
                      {repro.nombre_jeunes > 0 ? repro.nombre_jeunes : '--'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/reproductions/${repro.id}`}>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors group-hover:bg-[#00685f] group-hover:text-white">
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        )}
      </div>

      {/* ══ Vue mobile : cartes empilées ══ */}
      <div className="space-y-3 md:hidden">
        {filtresActifs.map((repro) => {
          const info = phasesParId.get(repro.id) as InfoPhase
          const pulse = PULSE_PHASE[info.phase]
          return (
            <Link
              key={repro.id}
              href={`/reproductions/${repro.id}`}
              className="block rounded-3xl border border-outline-variant bg-surface-container-lowest p-4 transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <OeufsPonte
                  phase={info.phase}
                  nombreOeufs={repro.nombre_oeufs}
                  nombreEclos={repro.nombre_eclos}
                  className="h-11 w-24 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[13px] font-bold text-on-surface">
                    {libelleCouple(repro)}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[12px] text-on-surface-variant">
                    <CalendarDays className="h-3 w-3" />
                    {formatDateCourte(repro.date_ponte)}
                  </p>
                </div>
                <Badge className={cn('shrink-0 rounded-full font-semibold', CHIP_PHASE[info.phase])}>
                  {info.label}
                </Badge>
              </div>
              <div className="mt-3 flex items-center gap-4 border-t border-outline-variant pt-2.5 text-[12.5px] text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <OeufPuce className="h-3.5 w-2.5" />
                  {repro.nombre_oeufs} œuf{repro.nombre_oeufs > 1 ? 's' : ''}
                  {repro.nombre_eclos != null ? ` · ${repro.nombre_eclos} éclo${repro.nombre_eclos > 1 ? 's' : ''}` : ''}
                </span>
                <span className="flex items-center gap-1.5">
                  <Baby className="h-3.5 w-3.5" />
                  {repro.nombre_jeunes > 0 ? `${repro.nombre_jeunes} jeune${repro.nombre_jeunes > 1 ? 's' : ''}` : 'Aucun jeune'}
                </span>
                {pulse && (
                  <span className={cn('ml-auto h-2 w-2 animate-pulse rounded-full', pulse)} aria-hidden="true" />
                )}
              </div>
            </Link>
          )
        })}

        {filtresActifs.length === 0 && (
          <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest">
            <EtatVide filtreActif={filtrePhase !== 'tous' || !!coupleFilter} />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── État vide : nid désert + invitation ─────────────────────────────────────
function EtatVide({ filtreActif }: { filtreActif: boolean }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <OeufsPonte phase="incubation" nombreOeufs={1} className="h-24 w-44 opacity-70" />
      <h3 className="mt-4 text-lg font-extrabold text-on-surface">Aucun cycle à afficher</h3>
      <p className="mt-1 max-w-md text-sm leading-relaxed text-on-surface-variant">
        {filtreActif
          ? 'Aucune reproduction ne correspond au filtre actuel. Réinitialisez les filtres ou revenez à la vue complète.'
          : 'Notez votre première ponte : le nid suivra ensuite l’incubation, l’éclosion et le sevrage des pigeonneaux, jusqu’au baguage.'}
      </p>
      <Link href="/reproductions/new">
        <Button className="mt-5 gap-2 rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-lg shadow-teal-900/25">
          <Egg className="h-4 w-4" />
          Enregistrer une ponte
        </Button>
      </Link>
    </div>
  )
}