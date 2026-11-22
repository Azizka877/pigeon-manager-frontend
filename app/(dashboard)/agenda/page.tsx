'use client'

import { useMemo, useState } from 'react'
import { useAgenda, useDeleteRappel, useUpdateRappel, useDeleteSoin } from '@/hooks/use-sante'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { formatDateLong } from '@/lib/cycles'
import { DialogRappel } from '@/components/sante/dialog-rappel'
import type { EvenementAgenda, Rappel } from '@/types/sante'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  BellRing,
  Syringe,
  Repeat,
  Pencil,
  CalendarX,
  Check,
} from 'lucide-react'

// ── Utilitaires de dates ────────────────────────────────────────────────────

/** Date → 'YYYY-MM-DD' en temps local (évite les décalages UTC de toISOString) */
function versIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const j = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${j}`
}

/** Lundi de la semaine contenant d */
function lundiDe(d: Date): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  r.setDate(r.getDate() - ((r.getDay() + 6) % 7))
  return r
}

function ajouterJours(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

const JOURS_SEMAINE = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.']

// ── Style des pastilles ─────────────────────────────────────────────────────

function stylePastille(e: EvenementAgenda, aujourdhui: string): string {
  if (e.fait) return 'bg-gray-100 text-gray-400 ring-1 ring-gray-200 line-through opacity-70'
  if (e.fait === false && e.date < aujourdhui) return 'bg-red-50 text-red-600 ring-1 ring-red-200'
  switch (e.source) {
    case 'rappel':
      return 'bg-[#eef7f5] text-[#00685f] ring-1 ring-[#bfe3dc]'
    case 'soin':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
    case 'rappel_soin':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
    default:
      return 'bg-gray-100 text-gray-600 ring-1 ring-gray-200'
  }
}

function iconeSource(e: EvenementAgenda) {
  if (e.source === 'soin') return Syringe
  if (e.source === 'rappel_soin') return Repeat
  return BellRing
}

function libelleSource(e: EvenementAgenda): string {
  if (e.source === 'soin') return 'Soin réalisé'
  if (e.source === 'rappel_soin') return 'Rappel automatique'
  return 'Rappel'
}

export default function AgendaPage() {
  const aujourdhui = versIso(new Date())
  const [mois, setMois] = useState(() => {
    const t = new Date()
    return new Date(t.getFullYear(), t.getMonth(), 1)
  })
  const [jourSelectionne, setJourSelectionne] = useState<string>(aujourdhui)
  const [dialogOuvert, setDialogOuvert] = useState(false)
  const [rappelEnEdition, setRappelEnEdition] = useState<Rappel | null>(null)
  const [aSupprimer, setASupprimer] = useState<EvenementAgenda | null>(null)

  // Grille de 6 semaines couvrant le mois affiché
  const grille = useMemo(() => lundiDe(new Date(mois.getFullYear(), mois.getMonth(), 1)), [mois])
  const debut = versIso(grille)
  const fin = versIso(ajouterJours(grille, 41))

  const { data: evenements, isLoading } = useAgenda(debut, fin)
  const supprimerRappel = useDeleteRappel()
  const supprimerSoin = useDeleteSoin()
  const basculerRappel = useUpdateRappel()

  const cellules = useMemo(
    () => Array.from({ length: 42 }, (_, i) => ajouterJours(grille, i)),
    [grille],
  )

  // Événements groupés par jour
  const parJour = useMemo(() => {
    const map = new Map<string, EvenementAgenda[]>()
    for (const e of evenements ?? []) {
      const liste = map.get(e.date) ?? []
      liste.push(e)
      map.set(e.date, liste)
    }
    return map
  }, [evenements])

  const evenementsDuJour = useMemo(
    () => (jourSelectionne ? (parJour.get(jourSelectionne) ?? []) : []),
    [parJour, jourSelectionne],
  )

  const labelMois = mois
    .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    .replace(/^./, (c) => c.toUpperCase())

  const naviguerMois = (delta: number) => {
    setMois(new Date(mois.getFullYear(), mois.getMonth() + delta, 1))
  }

  const revenirAujourdhui = () => {
    const t = new Date()
    setMois(new Date(t.getFullYear(), t.getMonth(), 1))
    setJourSelectionne(versIso(t))
  }

  const cocherRappel = (e: EvenementAgenda) => {
    basculerRappel.mutate(
      { id: e.db_id, data: { fait: !(e.fait === true) } },
      { onError: () => toast.error('Erreur lors de la mise à jour') },
    )
  }

  const confirmerSuppression = () => {
    if (!aSupprimer) return
    const onFinish = () => setASupprimer(null)
    if (aSupprimer.source === 'soin') {
      supprimerSoin.mutate(aSupprimer.db_id, {
        onSuccess: () => {
          toast.success('Soin retiré du calendrier')
          onFinish()
        },
        onError: () => toast.error('Erreur lors de la suppression'),
      })
    } else if (aSupprimer.source === 'rappel') {
      supprimerRappel.mutate(aSupprimer.db_id, {
        onSuccess: () => {
          toast.success('Rappel supprimé')
          onFinish()
        },
        onError: () => toast.error('Erreur lors de la suppression'),
      })
    }
  }

  return (
    <div className="max-w-6xl space-y-6">
      {/* ── En-tête ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00685f] to-[#01352f] text-white shadow-md shadow-teal-900/25">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-on-surface sm:text-3xl">Agenda du colombier</h1>
            <p className="mt-0.5 text-sm text-on-surface-variant">
              Rappels, soins et échéances — rien ne vous échappera.
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            setRappelEnEdition(null)
            setDialogOuvert(true)
          }}
          className="gap-2 rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-lg shadow-teal-900/25"
        >
          <Plus className="h-4 w-4" />
          Nouveau rappel
        </Button>
      </div>

      {/* ── Navigation du mois + légende ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            onClick={() => naviguerMois(-1)}
            className="rounded-xl border-outline-variant bg-surface"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[150px] text-center text-sm font-bold text-on-surface">{labelMois}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => naviguerMois(1)}
            className="rounded-xl border-outline-variant bg-surface"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={revenirAujourdhui}
            className="ml-1 rounded-xl border-outline-variant bg-surface text-xs"
          >
            Aujourd'hui
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#00685f]" /> Rappel
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Soin réalisé
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Rappel auto
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> En retard
          </span>
        </div>
      </div>

      {/* ── Grille du calendrier ── */}
      <div className="overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface">
        <div className="grid grid-cols-7 border-b border-outline-variant/60 bg-surface-container-low">
          {JOURS_SEMAINE.map((j) => (
            <div
              key={j}
              className="py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-on-surface-variant"
            >
              {j}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex h-72 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#00685f]" />
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {cellules.map((d) => {
              const iso = versIso(d)
              const horsMois = d.getMonth() !== mois.getMonth()
              const liste = parJour.get(iso) ?? []
              const visibles = liste.slice(0, 3)
              const autres = liste.length - visibles.length
              const estAujourdhui = iso === aujourdhui
              const estSelectionne = iso === jourSelectionne
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setJourSelectionne(iso)}
                  className={cn(
                    'relative min-h-[92px] border-b border-r border-outline-variant/40 p-1.5 text-left transition-colors',
                    horsMois && 'bg-surface-container-low/50',
                    !horsMois && 'bg-surface hover:bg-[#f0faf8]',
                    estSelectionne && 'bg-[#f0faf8] ring-2 ring-inset ring-[#00685f]',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-semibold',
                      estAujourdhui
                        ? 'bg-gradient-to-br from-[#00685f] to-[#005651] text-white shadow-sm'
                        : horsMois
                          ? 'text-on-surface-variant/40'
                          : 'text-on-surface',
                    )}
                  >
                    {d.getDate()}
                  </span>
                  <div className="mt-1 space-y-1">
                    {visibles.map((e) => (
                      <div
                        key={e.id}
                        className={cn(
                          'truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium leading-tight',
                          stylePastille(e, aujourdhui),
                        )}
                      >
                        {e.titre}
                      </div>
                    ))}
                    {autres > 0 && (
                      <p className="text-[10px] font-semibold text-[#00685f]">+ {autres} autres</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Détail du jour sélectionné ── */}
      {jourSelectionne && (
        <div className="rounded-2xl border border-outline-variant/60 bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/50 bg-surface-container-low px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white">
                <CalendarDays className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-bold text-on-surface">{formatDateLong(jourSelectionne)}</h3>
              <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-[10px] font-semibold text-on-surface-variant">
                {evenementsDuJour.length} événement{evenementsDuJour.length > 1 ? 's' : ''}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRappelEnEdition(null)
                setDialogOuvert(true)
              }}
              className="gap-1.5 rounded-lg border-outline-variant bg-surface text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter à ce jour
            </Button>
          </div>

          <div className="p-4">
            {evenementsDuJour.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-[#b9d8d0] bg-[#f5faf8]">
                  <CalendarX className="h-6 w-6 text-[#8fb8ae]" />
                </span>
                <p className="mt-3 text-sm font-semibold text-on-surface">Journée libre</p>
                <p className="mt-0.5 text-xs text-on-surface-variant">
                  Aucun événement prévu — profitez-en ou ajoutez un rappel.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {evenementsDuJour.map((e) => {
                  const Icone = iconeSource(e)
                  const estRappelAuto = e.source === 'rappel_soin'
                  const retard = e.fait === false && e.date < aujourdhui
                  return (
                    <div
                      key={e.id}
                      className={cn(
                        'group flex items-center gap-3 rounded-xl border p-3 transition-colors',
                        retard ? 'border-red-200/70 bg-red-50/60' : 'border-outline-variant/50 bg-surface-container-low/60',
                        e.fait && 'opacity-60',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                          e.source === 'soin'
                            ? 'bg-emerald-100 text-emerald-600'
                            : e.source === 'rappel_soin'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-[#e0f2ef] text-[#00685f]',
                        )}
                      >
                        <Icone className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={cn('truncate text-sm font-semibold text-on-surface', e.fait && 'line-through')}>
                          {e.titre}
                        </p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-on-surface-variant">
                          <span className="font-medium">{libelleSource(e)}</span>
                          {e.pigeon?.matricule && (
                            <span className="font-medium text-on-surface">· {e.pigeon.matricule}</span>
                          )}
                          {retard && <span className="font-semibold text-red-600">· en retard</span>}
                          {estRappelAuto && e.notes && <span className="truncate">· {e.notes}</span>}
                        </p>
                      </div>

                      {e.source === 'rappel' && (
                        <button
                          onClick={() => cocherRappel(e)}
                          className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                            e.fait
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-outline-variant bg-surface hover:border-emerald-500',
                          )}
                          title={e.fait ? 'Marquer comme non fait' : 'Marquer comme fait'}
                        >
                          {e.fait && <Check className="h-3.5 w-3.5" />}
                        </button>
                      )}

                      {e.source === 'rappel' && (
                        <button
                          onClick={() => {
                            // Récupère le rappel complet depuis les stats pour l'édition
                            const r: Rappel = {
                              id: e.db_id,
                              titre: e.titre,
                              type_rappel: (e.type as Rappel['type_rappel']) ?? 'autre',
                              date_rappel: e.date,
                              fait: e.fait === true,
                              pigeon: e.pigeon?.id ?? null,
                              pigeon_detail: e.pigeon,
                              notes: e.notes,
                            }
                            setRappelEnEdition(r)
                            setDialogOuvert(true)
                          }}
                          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-[#00685f] opacity-0 group-hover:opacity-100"
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}

                      {e.source !== 'rappel_soin' && (
                        <button
                          onClick={() => setASupprimer(e)}
                          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Dialogs ── */}
      <DialogRappel
        ouvert={dialogOuvert}
        onFermer={() => setDialogOuvert(false)}
        rappel={rappelEnEdition}
        datePrevue={jourSelectionne ?? undefined}
      />

      {/* Confirmation de suppression */}
      <Dialog open={!!aSupprimer} onOpenChange={(v) => !v && setASupprimer(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              {aSupprimer?.source === 'soin'
                ? `Supprimer le soin « ${aSupprimer.titre} » du dossier médical ?`
                : `Supprimer le rappel « ${aSupprimer?.titre} » ?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setASupprimer(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmerSuppression}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
