'use client'


import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePigeons } from '@/hooks/use-pigeons'
import { PigeonCard } from '@/components/pigeons/pigeonsCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Bird, ChevronLeft, ChevronRight, Plus, Search, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Pigeon } from '@/types'

type FiltreStatut = 'tous' | Pigeon['statut']

const FILTRES: Array<{ valeur: FiltreStatut; label: string }> = [
  { valeur: 'tous', label: 'TOUS' },
  { valeur: 'actif', label: 'ACTIF' },
  { valeur: 'vendu', label: 'VENDU' },
  { valeur: 'perdu', label: 'PERDU' },
  { valeur: 'mort', label: 'DÉCÉDÉ' },
]

const ELEMENTS_PAR_PAGE = 10

export default function PigeonsPage() {
  const { data: pigeons, isLoading } = usePigeons()
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState<FiltreStatut>('tous')
  const [pageActuelle, setPageActuelle] = useState(1)

  // ── Statistiques de l'effectif (pour le hero) ──────────────────────────────
  const stats = useMemo(() => {
    const liste = pigeons ?? []
    return {
      total: liste.length,
      actifs: liste.filter((p) => p.statut === 'actif').length,
      males: liste.filter((p) => p.sexe === 'M').length,
      femelles: liste.filter((p) => p.sexe === 'F').length,
    }
  }, [pigeons])

  // ── Compteurs des filtres ──────────────────────────────────────────────────
  const compteurFiltre = (valeur: FiltreStatut): number => {
    if (valeur === 'tous') return pigeons?.length ?? 0
    return pigeons?.filter((p) => p.statut === valeur).length ?? 0
  }

  // ── Recherche élargie : matricule, race, couleur ───────────────────────────
  const pigeonsFiltres = useMemo(() => {
    const terme = recherche.trim().toLowerCase()
    return (pigeons ?? []).filter((pigeon) => {
      const correspondStatut = filtreStatut === 'tous' || pigeon.statut === filtreStatut
      if (!correspondStatut) return false
      if (!terme) return true
      const cible = [pigeon.matricule, pigeon.race, pigeon.couleur]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return cible.includes(terme)
    })
  }, [pigeons, recherche, filtreStatut])

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalElements = pigeonsFiltres.length
  const totalPages = Math.ceil(totalElements / ELEMENTS_PAR_PAGE)
  const indexDebut = (pageActuelle - 1) * ELEMENTS_PAR_PAGE
  const pigeonsPagines = pigeonsFiltres.slice(indexDebut, indexDebut + ELEMENTS_PAR_PAGE)

  const changerFiltre = (valeur: FiltreStatut) => {
    setFiltreStatut(valeur)
    setPageActuelle(1)
  }

  // ── Chargement : squelettes de cartes ──────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-44 animate-pulse rounded-3xl bg-surface-container" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-outline-variant">
              <div className="h-36 animate-pulse bg-surface-container" />
              <div className="space-y-2.5 p-3.5">
                <div className="h-4 w-3/4 animate-pulse rounded bg-surface-container" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-surface-container" />
                <div className="h-7 w-full animate-pulse rounded bg-surface-container" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ══ Hero dégradé signature ══ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#00685f] via-[#005651] to-[#01352f] p-6 sm:p-7">
        {/* Pigeon en vol en filigrane */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/pigeon-vol-a.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-8 -right-4 h-56 select-none opacity-[0.12]"
          style={{ transform: 'rotate(-6deg)' }}
        />
        <div className="relative">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#d7ece8] ring-1 ring-white/15">
                <Bird className="h-3.5 w-3.5" />
                Registre du colombier
              </span>
              <h1 className="mt-2.5 text-2xl font-extrabold text-white sm:text-3xl">Pigeons</h1>
              <p className="mt-1 text-[13.5px] text-[#b9d8d3]">
                Gérez votre registre complet de colombier.
              </p>
            </div>
            <Link href="/pigeons/new">
              <Button className="w-full gap-2 rounded-xl bg-white text-[13px] font-semibold text-[#00685f] shadow-lg shadow-black/25 hover:bg-[#f2f8f7] hover:text-[#00554d] sm:w-auto">
                <Plus className="h-4 w-4" />
                Ajouter un pigeon
              </Button>
            </Link>
          </div>

          {/* Statistiques en verre dépoli */}
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { icone: <Bird className="h-4 w-4" />, valeur: stats.total, label: 'Effectif total' },
              { icone: <Sparkles className="h-4 w-4" />, valeur: stats.actifs, label: 'Actifs' },
              { icone: <span className="text-[15px] font-bold">♂</span>, valeur: stats.males, label: 'Mâles' },
              { icone: <span className="text-[15px] font-bold">♀</span>, valeur: stats.femelles, label: 'Femelles' },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 px-3.5 py-2.5 backdrop-blur-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                  {s.icone}
                </span>
                <div>
                  <p className="text-lg font-bold leading-none text-white">{s.valeur}</p>
                  <p className="mt-1 text-[11px] text-[#b9d8d3]">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Recherche & filtres à compteurs ══ */}
      <section className="flex flex-col gap-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-3.5 lg:flex-row lg:items-center">
        <div className="relative w-full shrink-0 lg:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <Input
            placeholder="Rechercher un matricule, race, couleur…"
            value={recherche}
            onChange={(e) => {
              setRecherche(e.target.value)
              setPageActuelle(1)
            }}
            className="w-full rounded-xl border-outline-variant bg-surface-container pl-10 text-[13.5px]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTRES.map(({ valeur, label }) => {
            const actif = filtreStatut === valeur
            return (
              <button
                key={valeur}
                onClick={() => changerFiltre(valeur)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all',
                  actif
                    ? 'bg-[#00685f] text-white shadow-md shadow-teal-900/25'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                )}
              >
                {label}
                <span
                  className={cn(
                    'rounded-full px-1.5 py-px text-[10.5px] font-bold',
                    actif ? 'bg-white/20 text-white' : 'bg-black/5 text-on-surface-variant',
                  )}
                >
                  {compteurFiltre(valeur)}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ══ Grille de cartes ══ */}
      {pigeonsPagines.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pigeonsPagines.map((pigeon) => (
            <PigeonCard key={pigeon.id} pigeon={pigeon} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container">
            <Search className="h-6 w-6 text-on-surface-variant" />
          </div>
          <p className="font-semibold text-on-surface">Aucun pigeon trouvé</p>
          <p className="mt-1 text-sm text-on-surface-variant">
            {recherche || filtreStatut !== 'tous'
              ? 'Essayez un autre terme ou réinitialisez les filtres.'
              : 'Votre registre est vide — ajoutez votre premier pigeon.'}
          </p>
          {!recherche && filtreStatut === 'tous' && (
            <Link href="/pigeons/new" className="mt-5 inline-block">
              <Button className="gap-2 rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-lg shadow-teal-900/25">
                <Plus className="h-4 w-4" />
                Ajouter un pigeon
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* ══ Pagination ══ */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-outline-variant bg-surface-container-lowest p-3.5">
          <p className="text-[13px] text-on-surface-variant">
            {indexDebut + 1}–{Math.min(indexDebut + ELEMENTS_PAR_PAGE, totalElements)} sur{' '}
            {totalElements} pigeons
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-outline-variant"
              onClick={() => setPageActuelle((p) => Math.max(1, p - 1))}
              disabled={pageActuelle === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2.5 text-[13px] font-semibold text-on-surface">
              {pageActuelle} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-outline-variant"
              onClick={() => setPageActuelle((p) => Math.min(totalPages, p + 1))}
              disabled={pageActuelle === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}