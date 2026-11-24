'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useDeleteSortie, useSorties } from '@/hooks/use-sales'
import { usePigeons } from '@/hooks/use-pigeons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Bird,
  DollarSign,
  MoreVertical,
  PlaneTakeoff,
  Plus,
  Skull,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { SceneSortie } from '@/components/sales/scenes-sorties'
import { formatDateLong, joursEntre } from '@/lib/cycles'
import { getPigeonImage } from '@/lib/pigeon-images'
import type { Pigeon, Sortie, TypeSortie } from '@/types'

type FiltreType = 'tous' | TypeSortie

const FILTRES: Array<{ valeur: FiltreType; label: string }> = [
  { valeur: 'tous', label: 'Tous' },
  { valeur: 'vente', label: 'Ventes' },
  { valeur: 'perte', label: 'Pertes' },
  { valeur: 'deces', label: 'Décès' },
]

const CHIP_TYPE: Record<TypeSortie, string> = {
  vente: 'bg-[#eef7f5] text-[#00685f] ring-1 ring-[#bfe3dc]',
  perte: 'bg-[#fff4e5] text-[#b45309] ring-1 ring-[#fde3bd]',
  deces: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
}

const LIBELLE_TYPE: Record<TypeSortie, string> = {
  vente: 'Vente',
  perte: 'Perte',
  deces: 'Décès',
}

const ICONE_TYPE: Record<TypeSortie, React.ReactNode> = {
  vente: <DollarSign className="h-3 w-3" />,
  perte: <PlaneTakeoff className="h-3 w-3" />,
  deces: <Skull className="h-3 w-3" />,
}

const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

/** Date dans le mois en cours (même mois + même année) */
function estCeMois(date: string): boolean {
  const d = new Date(date)
  const m = new Date()
  return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear()
}

/** « aujourd'hui », « hier », « il y a N jours » */
function ilYa(date: string): string {
  const j = Math.max(joursEntre(date), 0)
  if (j === 0) return "aujourd'hui"
  if (j === 1) return 'hier'
  return `il y a ${j} jours`
}

export default function SortiesPage() {
  const { data: sortiesData, isLoading } = useSorties()
  const { data: pigeonsData } = usePigeons()
  const supprimerSortie = useDeleteSortie()

  const [filtreType, setFiltreType] = useState<FiltreType>('tous')
  const [pageActuelle, setPageActuelle] = useState(1)
  const elementsParPage = 10
  const [menuOuvert, setMenuOuvert] = useState<string | null>(null)
  const [aSupprimer, setASupprimer] = useState<Sortie | null>(null)

  const sorties = useMemo(() => sortiesData ?? [], [sortiesData])

  // Tri : les départs les plus récents d'abord
  const sortiesTriees = useMemo(
    () =>
      [...sorties].sort(
        (a, b) => new Date(b.date_sortie).getTime() - new Date(a.date_sortie).getTime(),
      ),
    [sorties],
  )

  // ── Statistiques réelles (plus aucune tendance codée en dur) ──
  const stats = useMemo(() => {
    const ventes = sortiesTriees.filter((s) => s.type_sortie === 'vente')
    const pertes = sortiesTriees.filter((s) => s.type_sortie === 'perte')
    const deces = sortiesTriees.filter((s) => s.type_sortie === 'deces')
    const recettes = ventes.reduce((acc, s) => acc + (s.prix ? parseFloat(s.prix) : 0), 0)
    return {
      ventes: ventes.length,
      ventesMois: ventes.filter((s) => estCeMois(s.date_sortie)).length,
      pertes: pertes.length,
      pertesMois: pertes.filter((s) => estCeMois(s.date_sortie)).length,
      deces: deces.length,
      decesMois: deces.filter((s) => estCeMois(s.date_sortie)).length,
      recettes,
      ventesAvecPrix: ventes.filter((s) => s.prix).length,
    }
  }, [sortiesTriees])

  // ── Filtre segmenté ──
  const sortiesFiltrees = useMemo(
    () =>
      filtreType === 'tous' ? sortiesTriees : sortiesTriees.filter((s) => s.type_sortie === filtreType),
    [sortiesTriees, filtreType],
  )

  const compteurs = useMemo(
    () => ({
      tous: sortiesTriees.length,
      vente: stats.ventes,
      perte: stats.pertes,
      deces: stats.deces,
    }),
    [sortiesTriees.length, stats],
  )

  // ── Pagination locale ──
  const totalElements = sortiesFiltrees.length
  const totalPages = Math.max(Math.ceil(totalElements / elementsParPage), 1)
  const pageSure = Math.min(pageActuelle, totalPages)
  const indexDebut = (pageSure - 1) * elementsParPage
  const sortiesPagines = sortiesFiltrees.slice(indexDebut, indexDebut + elementsParPage)

  /** Registre des pigeons : photo, matricule et sexe pour chaque sortie */
  const pigeonDe = (sortie: Sortie): Pigeon | undefined =>
    (pigeonsData ?? []).find((p) => p.id === sortie.pigeon)

  const confirmerSuppression = () => {
    if (!aSupprimer) return
    supprimerSortie.mutate(aSupprimer.id, {
      onSuccess: () => {
        toast.success(`Sortie de « ${pigeonDe(aSupprimer)?.matricule ?? 'pigeon'} » retirée du registre`)
        setASupprimer(null)
        setMenuOuvert(null)
      },
      onError: () => toast.error('Erreur lors de la suppression'),
    })
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
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00685f] to-[#01352f] text-white shadow-md shadow-teal-900/25">
            <PlaneTakeoff className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-on-surface sm:text-3xl">
              Registre des départs
            </h1>
            <p className="mt-0.5 text-sm text-on-surface-variant">
              Ventes, pertes et décès — chaque départ raconte un destin.
            </p>
          </div>
        </div>
        <Link href="/sales/new">
          <Button className="gap-2 rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-lg shadow-teal-900/25">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Enregistrer une sortie</span>
            <span className="sm:hidden">Nouvelle</span>
          </Button>
        </Link>
      </div>

      {/* ── Statistiques réelles : les quatre destinées ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CarteStat scene={<SceneVenteThumb />} label="Ventes" valeur={stats.ventes} mois={stats.ventesMois} />
        <CarteStat
          recettes={stats.recettes}
          sousTitre={stats.ventesAvecPrix > 0 ? `${stats.ventesAvecPrix} vente${stats.ventesAvecPrix > 1 ? 's' : ''} avec prix` : 'Aucun prix enregistré'}
          label="Recettes"
        />
        <CarteStat scene={<ScenePerteThumb />} label="Pertes" valeur={stats.pertes} mois={stats.pertesMois} />
        <CarteStat scene={<SceneMemoireThumb />} label="Décès" valeur={stats.deces} mois={stats.decesMois} />
      </div>

      {/* ── Filtres segmentés par type ── */}
      <div className="flex flex-wrap items-center gap-1 self-start rounded-2xl border border-outline-variant bg-surface-container p-1">
        {FILTRES.map((f) => (
          <button
            key={f.valeur}
            type="button"
            onClick={() => {
              setFiltreType(f.valeur)
              setPageActuelle(1)
            }}
            className={cn(
              'flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-[13px] font-semibold transition-all',
              filtreType === f.valeur
                ? 'bg-[#00685f] text-white shadow-sm shadow-teal-900/20'
                : 'text-on-surface-variant hover:text-on-surface',
            )}
          >
            {f.label}
            <span
              className={cn(
                'rounded-full px-1.5 py-px text-[10.5px] font-bold',
                filtreType === f.valeur
                  ? 'bg-white/25 text-white'
                  : 'bg-surface-container-high text-on-surface-variant',
              )}
            >
              {compteurs[f.valeur]}
            </span>
          </button>
        ))}
      </div>

      {/* ══ Vue desktop : tableau des départs ══ */}
      <div className="hidden overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest lg:block">
        {sortiesFiltrees.length === 0 ? (
          <EtatVide filtreActif={filtreType !== 'tous'} />
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container">
                  <th className="px-4 py-4 xl:px-6 text-left text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Pigeon
                  </th>
                  <th className="px-4 py-4 xl:px-6 text-left text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Départ
                  </th>
                  <th className="px-4 py-4 xl:px-6 text-left text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Date
                  </th>
                  <th className="px-4 py-4 xl:px-6 text-left text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Détails
                  </th>
                  <th className="px-4 py-4 xl:px-6 text-right text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {sortiesPagines.map((sortie) => {
                  const pigeon = pigeonDe(sortie)
                  return (
                    <tr key={sortie.id} className="group transition-colors hover:bg-[#f5faf8]">
                      {/* Pigeon : vraie photo + matricule cliquable */}
                      <td className="px-4 py-4 xl:px-6">
                        <Link href={`/pigeons/${sortie.pigeon}`} className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getPigeonImage(sortie.pigeon, pigeon?.sexe ?? 'M')}
                            alt={pigeon?.matricule || 'Pigeon sorti'}
                            className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-[#d5eae5]"
                            style={{ filter: 'drop-shadow(0 3px 5px rgba(10,40,35,0.15))' }}
                          />
                          <span>
                            <span className="block whitespace-nowrap font-mono text-[13.5px] font-bold text-on-surface group-hover:text-[#00685f]">
                              {pigeon?.matricule ?? 'Inconnu'}
                            </span>
                            <span className="block text-[11.5px] text-on-surface-variant">
                              {pigeon?.race || 'Race non renseignée'}
                            </span>
                          </span>
                        </Link>
                      </td>
                      {/* Type : mini-scène + badge */}
                      <td className="px-4 py-4 xl:px-6">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                          <SceneSortie type={sortie.type_sortie} className="h-11 w-20 shrink-0" />
                          <Badge className={cn('gap-1.5 whitespace-nowrap rounded-full font-semibold', CHIP_TYPE[sortie.type_sortie])}>
                            {ICONE_TYPE[sortie.type_sortie]}
                            {LIBELLE_TYPE[sortie.type_sortie].toUpperCase()}
                          </Badge>
                        </div>
                      </td>
                      {/* Date */}
                      <td className="px-4 py-4 xl:px-6">
                        <p className="text-[13px] font-semibold text-on-surface">
                          {formatDateLong(sortie.date_sortie)}
                        </p>
                        <p className="mt-0.5 text-[11.5px] text-on-surface-variant">{ilYa(sortie.date_sortie)}</p>
                      </td>
                      {/* Détails */}
                      <td className="max-w-[240px] px-4 py-4 xl:px-6">
                        <p className="line-clamp-2 text-[12.5px] text-on-surface-variant">
                          {sortie.cause || sortie.circonstances || sortie.notes || 'Aucun détail'}
                        </p>
                        {sortie.prix && (
                          <p className="mt-1 flex items-center gap-1 text-[13px] font-bold text-[#00685f]">
                            <DollarSign className="h-3.5 w-3.5" />
                            {eur.format(parseFloat(sortie.prix))}
                          </p>
                        )}
                        {sortie.acheteur && (
                          <p className="mt-0.5 text-[11.5px] text-on-surface-variant">
                            Acheteur : {sortie.acheteur}
                          </p>
                        )}
                      </td>
                      {/* Actions : menu câblé (fiche pigeon + suppression) */}
                      <td className="relative px-4 py-4 xl:px-6 text-right">
                        <button
                          type="button"
                          onClick={() => setMenuOuvert(menuOuvert === sortie.id ? null : sortie.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
                          aria-label="Actions sur cette sortie"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {menuOuvert === sortie.id && (
                          <>
                            {/* Fond cliquable pour fermer le menu */}
                            <div className="fixed inset-0 z-30" onClick={() => setMenuOuvert(null)} aria-hidden="true" />
                            <div className="absolute right-4 top-14 z-40 w-56 overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest py-1.5 shadow-xl shadow-teal-900/10">
                              <Link
                                href={`/pigeons/${sortie.pigeon}`}
                                onClick={() => setMenuOuvert(null)}
                                className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium text-on-surface transition-colors hover:bg-[#f5faf8]"
                              >
                                <Bird className="h-4 w-4 text-[#00685f]" />
                                Voir la fiche du pigeon
                              </Link>
                              <button
                                type="button"
                                onClick={() => setASupprimer(sortie)}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                Supprimer la sortie
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-outline-variant px-4 py-4 xl:px-6">
                <p className="text-[12.5px] text-on-surface-variant">
                  Affichage de {indexDebut + 1} à {Math.min(indexDebut + elementsParPage, totalElements)} sur{' '}
                  {totalElements} sorties
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-outline-variant"
                    onClick={() => setPageActuelle((p) => Math.max(1, p - 1))}
                    disabled={pageSure === 1}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-outline-variant"
                    onClick={() => setPageActuelle((p) => Math.min(totalPages, p + 1))}
                    disabled={pageSure === totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ══ Vue mobile : cartes empilées ══ */}
      <div className="space-y-3 lg:hidden">
        {sortiesPagines.map((sortie) => {
          const pigeon = pigeonDe(sortie)
          return (
            <div
              key={sortie.id}
              className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-4"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getPigeonImage(sortie.pigeon, pigeon?.sexe ?? 'M')}
                  alt={pigeon?.matricule || 'Pigeon sorti'}
                  className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-[#d5eae5]"
                />
                <div className="min-w-[150px] flex-1">
                  <Link href={`/pigeons/${sortie.pigeon}`} className="block break-words font-mono text-[13px] font-bold text-on-surface">
                    {pigeon?.matricule ?? 'Inconnu'}
                  </Link>
                  <p className="mt-0.5 text-[11.5px] text-on-surface-variant">{formatDateLong(sortie.date_sortie)}</p>
                </div>
                <Badge className={cn('shrink-0 rounded-full font-semibold', CHIP_TYPE[sortie.type_sortie])}>
                  {ICONE_TYPE[sortie.type_sortie]}
                  {LIBELLE_TYPE[sortie.type_sortie]}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-outline-variant pt-3">
                <SceneSortie type={sortie.type_sortie} className="h-10 w-20 shrink-0" />
                <div className="min-w-0 flex-1">
                  {sortie.prix ? (
                    <p className="text-[13px] font-bold text-[#00685f]">{eur.format(parseFloat(sortie.prix))}</p>
                  ) : (
                    <p className="line-clamp-1 text-[12px] text-on-surface-variant">
                      {sortie.cause || sortie.circonstances || 'Aucun détail'}
                    </p>
                  )}
                  {sortie.acheteur && (
                    <p className="truncate text-[11px] text-on-surface-variant">Acheteur : {sortie.acheteur}</p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[11px] text-on-surface-variant">{ilYa(sortie.date_sortie)}</p>
                <button
                  type="button"
                  onClick={() => setASupprimer(sortie)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Supprimer
                </button>
              </div>
            </div>
          )
        })}

        {sortiesFiltrees.length === 0 && (
          <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest">
            <EtatVide filtreActif={filtreType !== 'tous'} />
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-outline-variant"
              onClick={() => setPageActuelle((p) => Math.max(1, p - 1))}
              disabled={pageSure === 1}
            >
              Précédent
            </Button>
            <p className="text-[12px] text-on-surface-variant">
              Page {pageSure} / {totalPages}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-outline-variant"
              onClick={() => setPageActuelle((p) => Math.min(totalPages, p + 1))}
              disabled={pageSure === totalPages}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>

      {/* ══ Confirmation de suppression ══ */}
      {aSupprimer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          onClick={() => setASupprimer(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <SceneSortie type={aSupprimer.type_sortie} className="mx-auto h-20 w-40 opacity-80" />
            <h3 className="mt-3 text-center text-lg font-extrabold text-on-surface">
              Supprimer cette sortie ?
            </h3>
            <p className="mt-1.5 text-center text-[13px] leading-relaxed text-on-surface-variant">
              Le départ de « <b>{pigeonDe(aSupprimer)?.matricule ?? 'pigeon inconnu'}</b> » (
              {LIBELLE_TYPE[aSupprimer.type_sortie].toLowerCase()} du {formatDateLong(aSupprimer.date_sortie)}) sera
              retiré du registre. Cette action est irréversible.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="outline" className="rounded-xl border-outline-variant" onClick={() => setASupprimer(null)}>
                Annuler
              </Button>
              <Button
                className="rounded-xl bg-red-600 text-white hover:bg-red-700"
                onClick={confirmerSuppression}
                disabled={supprimerSortie.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {supprimerSortie.isPending ? 'Suppression…' : 'Supprimer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Carte statistique : scène + compteur réel + repère du mois ──────────────
function CarteStat({
  scene,
  label,
  valeur,
  mois,
  recettes,
  sousTitre,
}: {
  scene?: React.ReactNode
  label: string
  valeur?: number
  /** Nombre de départs du même type dans le mois en cours */
  mois?: number
  /** Total des recettes (carte dédiée) */
  recettes?: number
  sousTitre?: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-outline-variant bg-surface-container-lowest p-4">
      {scene ?? (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f2c65a] to-[#c9922f] text-white shadow-md shadow-amber-900/15">
          <DollarSign className="h-5 w-5" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">{label}</p>
        {recettes !== undefined ? (
          <>
            <p className="mt-0.5 text-xl font-extrabold text-on-surface">{eur.format(recettes)}</p>
            <p className="mt-0.5 truncate text-[11px] text-on-surface-variant">{sousTitre}</p>
          </>
        ) : (
          <>
            <p className="mt-0.5 text-2xl font-extrabold text-on-surface">{valeur}</p>
            <p className="mt-0.5 text-[11px] text-on-surface-variant">
              {mois !== undefined ? `${mois} ce mois-ci` : sousTitre}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// ─── État vide : perchoir d'envol silencieux + invitation ────────────────────
function EtatVide({ filtreActif }: { filtreActif: boolean }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-[#b9d8d0] bg-[#f5faf8]">
        <PlaneTakeoff className="h-8 w-8 text-[#8fb8ae]" />
      </span>
      <h3 className="mt-4 text-lg font-extrabold text-on-surface">Aucune sortie à afficher</h3>
      <p className="mt-1 max-w-md text-sm leading-relaxed text-on-surface-variant">
        {filtreActif
          ? 'Aucune sortie ne correspond au filtre actuel. Réinitialisez les filtres ou revenez à la vue complète.'
          : 'Ventes, pertes ou décès : chaque départ mérite sa ligne au registre, avec sa photo, sa date et son histoire.'}
      </p>
      {!filtreActif && (
        <Link href="/sales/new">
          <Button className="mt-5 gap-2 rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-lg shadow-teal-900/25">
            <PlaneTakeoff className="h-4 w-4" />
            Enregistrer une sortie
          </Button>
        </Link>
      )}
    </div>
  )
}

// ─── Pouces de scènes pour les cartes stats ──────────────────────────────────
function SceneVenteThumb() {
  return <SceneSortie type="vente" className="h-12 w-24 shrink-0" />
}
function ScenePerteThumb() {
  return <SceneSortie type="perte" className="h-12 w-24 shrink-0" />
}
function SceneMemoireThumb() {
  return <SceneSortie type="deces" className="h-12 w-24 shrink-0" />
}