'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useSoins, useRappels, useStatsSante, useDeleteSoin, useUpdateRappel, useDeleteRappel } from '@/hooks/use-sante'
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
import { formatDateLong, joursEntre } from '@/lib/cycles'
import { getPigeonImage } from '@/lib/pigeon-images'
import { DialogSoin, TYPES_SOIN } from '@/components/sante/dialog-soin'
import { DialogRappel, TYPES_RAPPEL } from '@/components/sante/dialog-rappel'
import type { Soin, Rappel, TypeSoin, TypeRappel } from '@/types/sante'
import {
  Stethoscope,
  Syringe,
  BellRing,
  Plus,
  Pencil,
  Trash2,
  Check,
  AlarmClock,
  CalendarClock,
  CheckCircle2,
  Feather,
} from 'lucide-react'

// ── Badges colorés par type ─────────────────────────────────────────────────

const CHIP_SOIN: Record<TypeSoin, string> = {
  vaccin: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  traitement: 'bg-[#eef7f5] text-[#00685f] ring-1 ring-[#bfe3dc]',
  vermifuge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  vitamines: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  controle: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  autre: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
}

const CHIP_RAPPEL: Record<TypeRappel, string> = {
  soin: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  reproduction: 'bg-[#fff4e5] text-[#b45309] ring-1 ring-[#fde3bd]',
  entretien: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  autre: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
}

function libelleSoin(t: TypeSoin): string {
  return TYPES_SOIN.find((x) => x.valeur === t)?.label ?? t
}

function libelleRappel(t: TypeRappel): string {
  return TYPES_RAPPEL.find((x) => x.valeur === t)?.label ?? t
}

/** Onglet actif de la page */
type Onglet = 'soins' | 'rappels'

/** Objet en attente de confirmation de suppression */
type ASupprimer = { type: 'soin' | 'rappel'; soin?: Soin; rappel?: Rappel }

export default function SantePage() {
  const { data: soinsData, isLoading: soinsEnChargement } = useSoins()
  const { data: rappelsData, isLoading: rappelsEnChargement } = useRappels()
  const { data: stats } = useStatsSante()
  const supprimerSoin = useDeleteSoin()
  const supprimerRappel = useDeleteRappel()
  const basculerRappel = useUpdateRappel()

  const [onglet, setOnglet] = useState<Onglet>('soins')
  const [dialogSoinOuvert, setDialogSoinOuvert] = useState(false)
  const [soinEnEdition, setSoinEnEdition] = useState<Soin | null>(null)
  const [dialogRappelOuvert, setDialogRappelOuvert] = useState(false)
  const [rappelEnEdition, setRappelEnEdition] = useState<Rappel | null>(null)
  const [aSupprimer, setASupprimer] = useState<ASupprimer | null>(null)

  const soins = useMemo(() => soinsData ?? [], [soinsData])
  const rappels = useMemo(() => rappelsData ?? [], [rappelsData])

  // Soins : les plus récents d'abord
  const soinsTries = useMemo(
    () => [...soins].sort((a, b) => new Date(b.date_soin).getTime() - new Date(a.date_soin).getTime()),
    [soins],
  )

  // Rappels : en retard d'abord, puis à venir, puis faits à la fin
  const rappelsTries = useMemo(() => {
    const aujourdhui = new Date().toISOString().slice(0, 10)
    const poids = (r: Rappel) => (r.fait ? 2 : r.date_rappel < aujourdhui ? 0 : 1)
    return [...rappels].sort((a, b) => poids(a) - poids(b) || a.date_rappel.localeCompare(b.date_rappel))
  }, [rappels])

  const nbRetard = stats?.rappels_en_retard ?? rappelsTries.filter((r) => !r.fait && estEnRetard(r.date_rappel)).length

  const confirmerSuppression = () => {
    if (!aSupprimer) return
    if (aSupprimer.type === 'soin' && aSupprimer.soin) {
      supprimerSoin.mutate(aSupprimer.soin.id, {
        onSuccess: () => {
          toast.success('Soin retiré du dossier médical')
          setASupprimer(null)
        },
        onError: () => toast.error('Erreur lors de la suppression'),
      })
    } else if (aSupprimer.rappel) {
      supprimerRappel.mutate(aSupprimer.rappel.id, {
        onSuccess: () => {
          toast.success('Rappel supprimé')
          setASupprimer(null)
        },
        onError: () => toast.error('Erreur lors de la suppression'),
      })
    }
  }

  const cocherRappel = (r: Rappel) => {
    basculerRappel.mutate(
      { id: r.id, data: { fait: !r.fait } },
      {
        onSuccess: () => {
          if (!r.fait) toast.success(`« ${r.titre} » — bien joué, c'est fait`)
        },
        onError: () => toast.error('Erreur lors de la mise à jour'),
      },
    )
  }

  const chargement = soinsEnChargement || rappelsEnChargement

  if (chargement) {
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
            <Stethoscope className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-on-surface sm:text-3xl">Santé du colombier</h1>
            <p className="mt-0.5 text-sm text-on-surface-variant">
              Vaccins, traitements et rappels — un dossier médical solide fait des champions.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setRappelEnEdition(null)
              setDialogRappelOuvert(true)
            }}
            className="gap-2 rounded-xl border-outline-variant bg-surface"
          >
            <BellRing className="h-4 w-4 text-[#00685f]" />
            <span className="hidden sm:inline">Nouveau rappel</span>
            <span className="sm:hidden">Rappel</span>
          </Button>
          <Button
            onClick={() => {
              setSoinEnEdition(null)
              setDialogSoinOuvert(true)
            }}
            className="gap-2 rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-lg shadow-teal-900/25"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nouveau soin</span>
            <span className="sm:hidden">Soin</span>
          </Button>
        </div>
      </div>

      {/* ── Statistiques ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CarteSante
          icon={AlarmClock}
          label="Rappels en retard"
          valeur={nbRetard}
          sousTitre={nbRetard > 0 ? 'à traiter dès que possible' : 'aucun retard, colombier nickel'}
          tuile={nbRetard > 0 ? 'bg-red-100' : 'bg-emerald-100'}
          icone={nbRetard > 0 ? 'text-red-600' : 'text-emerald-600'}
        />
        <CarteSante
          icon={CalendarClock}
          label="Rappels à venir"
          valeur={stats?.rappels_7_jours ?? 0}
          sousTitre="dans les 7 prochains jours"
          tuile="bg-amber-100"
          icone="text-amber-600"
        />
        <CarteSante
          icon={Syringe}
          label="Soins du mois"
          valeur={stats?.soins_30_jours ?? soinsTries.filter((s) => estCeMois(s.date_soin)).length}
          sousTitre="vaccins et traitements sur 30 jours"
          tuile="bg-[#e0f2ef]"
          icone="text-[#00685f]"
        />
      </div>

      {/* ── Onglets segmentés ── */}
      <div className="flex items-center gap-1 self-start rounded-2xl border border-outline-variant bg-surface-container p-1">
        <button
          type="button"
          onClick={() => setOnglet('soins')}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all',
            onglet === 'soins'
              ? 'bg-gradient-to-r from-[#00685f] to-[#005651] text-white shadow-md shadow-primary/25'
              : 'text-on-surface-variant hover:text-on-surface',
          )}
        >
          <Syringe className="h-4 w-4" />
          Soins
          <span
            className={cn(
              'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
              onglet === 'soins' ? 'bg-white/20 text-white' : 'bg-surface-container-high text-on-surface-variant',
            )}
          >
            {soinsTries.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setOnglet('rappels')}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all',
            onglet === 'rappels'
              ? 'bg-gradient-to-r from-[#00685f] to-[#005651] text-white shadow-md shadow-primary/25'
              : 'text-on-surface-variant hover:text-on-surface',
          )}
        >
          <BellRing className="h-4 w-4" />
          Rappels
          {nbRetard > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-100 px-1.5 text-[10px] font-bold text-red-600">
              {nbRetard}
            </span>
          )}
        </button>
      </div>

      {/* ── Contenu de l'onglet ── */}
      {onglet === 'soins' ? (
        soinsTries.length === 0 ? (
          <EtatVideSoins onAjouter={() => setDialogSoinOuvert(true)} />
        ) : (
          <div className="space-y-3">
            {soinsTries.map((s) => (
              <CarteSoin
                key={s.id}
                soin={s}
                onModifier={() => {
                  setSoinEnEdition(s)
                  setDialogSoinOuvert(true)
                }}
                onSupprimer={() => setASupprimer({ type: 'soin', soin: s })}
              />
            ))}
          </div>
        )
      ) : rappelsTries.length === 0 ? (
        <EtatVideRappels onAjouter={() => setDialogRappelOuvert(true)} />
      ) : (
        <div className="space-y-3">
          {rappelsTries.map((r) => (
            <CarteRappel
              key={r.id}
              rappel={r}
              onCocher={() => cocherRappel(r)}
              onModifier={() => {
                setRappelEnEdition(r)
                setDialogRappelOuvert(true)
              }}
              onSupprimer={() => setASupprimer({ type: 'rappel', rappel: r })}
            />
          ))}
        </div>
      )}

      {/* ── Dialogs ── */}
      <DialogSoin
        ouvert={dialogSoinOuvert}
        onFermer={() => setDialogSoinOuvert(false)}
        soin={soinEnEdition}
      />
      <DialogRappel
        ouvert={dialogRappelOuvert}
        onFermer={() => setDialogRappelOuvert(false)}
        rappel={rappelEnEdition}
      />

      {/* Confirmation de suppression */}
      <Dialog open={!!aSupprimer} onOpenChange={(v) => !v && setASupprimer(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              {aSupprimer?.soin
                ? `Supprimer définitivement le soin « ${aSupprimer.soin.produit} » du dossier médical ?`
                : aSupprimer?.rappel
                  ? `Supprimer définitivement le rappel « ${aSupprimer.rappel.titre} » ?`
                  : ''}
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

// ── Utilitaires ─────────────────────────────────────────────────────────────

function aujourdhuiIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function estEnRetard(date: string): boolean {
  return date < aujourdhuiIso()
}

function estCeMois(date: string): boolean {
  const d = new Date(date)
  const m = new Date()
  return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear()
}

// ── Carte statistique ───────────────────────────────────────────────────────

function CarteSante({
  icon: Icon,
  label,
  valeur,
  sousTitre,
  tuile,
  icone,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  valeur: number
  sousTitre: string
  tuile: string
  icone: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-outline-variant bg-surface-container-low p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/10">
      <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', tuile)}>
        <Icon className={cn('h-5 w-5', icone)} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">{label}</p>
        <p className="text-2xl font-extrabold text-on-surface">{valeur}</p>
        <p className="truncate text-[11px] text-on-surface-variant">{sousTitre}</p>
      </div>
    </div>
  )
}

// ── Carte soin ──────────────────────────────────────────────────────────────

function CarteSoin({
  soin,
  onModifier,
  onSupprimer,
}: {
  soin: Soin
  onModifier: () => void
  onSupprimer: () => void
}) {
  const pigeon = soin.pigeon_detail
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-outline-variant/60 bg-surface p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/10">
      <Image
        src={getPigeonImage(String(pigeon?.id ?? soin.pigeon), pigeon?.sexe ?? 'M')}
        alt={pigeon?.matricule ?? 'Pigeon'}
        width={52}
        height={52}
        className="h-[52px] w-[52px] shrink-0 rounded-xl object-cover ring-1 ring-outline-variant/40"
        draggable={false}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold', CHIP_SOIN[soin.type_soin])}>
            {libelleSoin(soin.type_soin)}
          </span>
          <p className="truncate text-sm font-bold text-on-surface">{soin.produit}</p>
          {soin.dose && <p className="truncate text-xs text-on-surface-variant">· {soin.dose}</p>}
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-on-surface-variant">
          <span className="font-medium text-on-surface">
            {pigeon?.matricule ?? 'Pigeon'}
            {pigeon?.race ? ` · ${pigeon.race}` : ''}
          </span>
          <span>{formatDateLong(soin.date_soin)}</span>
          {soin.date_rappel && (
            <span className="inline-flex items-center gap-1 text-amber-600">
              <BellRing className="h-3 w-3" />
              rappel le {formatDateLong(soin.date_rappel)}
            </span>
          )}
        </p>
        {soin.notes && <p className="mt-1 line-clamp-1 text-xs text-on-surface-variant/80">{soin.notes}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={onModifier}
          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-[#00685f]"
          title="Modifier"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={onSupprimer}
          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-red-50 hover:text-red-600"
          title="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ── Carte rappel ────────────────────────────────────────────────────────────

function CarteRappel({
  rappel,
  onCocher,
  onModifier,
  onSupprimer,
}: {
  rappel: Rappel
  onCocher: () => void
  onModifier: () => void
  onSupprimer: () => void
}) {
  const retard = !rappel.fait && estEnRetard(rappel.date_rappel)
  const j = joursEntre(rappel.date_rappel)
  const bandeau =
    retard
      ? 'border-red-200/70 bg-red-50/60'
      : !rappel.fait && j <= 3
        ? 'border-amber-200/70 bg-amber-50/50'
        : 'border-outline-variant/60 bg-surface'

  return (
    <div
      className={cn(
        'group flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/10',
        bandeau,
        rappel.fait && 'opacity-60',
      )}
    >
      {/* Case à cocher */}
      <button
        onClick={onCocher}
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all',
          rappel.fait
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-outline-variant bg-surface hover:border-emerald-500',
        )}
        title={rappel.fait ? 'Marquer comme non fait' : 'Marquer comme fait'}
      >
        {rappel.fait && <Check className="h-4 w-4" />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold', CHIP_RAPPEL[rappel.type_rappel])}>
            {libelleRappel(rappel.type_rappel)}
          </span>
          <p className={cn('truncate text-sm font-bold text-on-surface', rappel.fait && 'line-through')}>
            {rappel.titre}
          </p>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-on-surface-variant">
          <span>{formatDateLong(rappel.date_rappel)}</span>
          {retard && <span className="font-semibold text-red-600">en retard de {Math.abs(j)} jour{Math.abs(j) > 1 ? 's' : ''}</span>}
          {!rappel.fait && !retard && j === 0 && (
            <span className="font-semibold text-amber-600">aujourd'hui</span>
          )}
          {rappel.pigeon_detail?.matricule && (
            <span className="font-medium text-on-surface">{rappel.pigeon_detail.matricule}</span>
          )}
        </p>
        {rappel.notes && <p className="mt-1 line-clamp-1 text-xs text-on-surface-variant/80">{rappel.notes}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={onModifier}
          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-[#00685f]"
          title="Modifier"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={onSupprimer}
          className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-red-50 hover:text-red-600"
          title="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ── États vides ─────────────────────────────────────────────────────────────

function EtatVideSoins({ onAjouter }: { onAjouter: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-[#b9d8d0] bg-[#f5faf8]">
        <Syringe className="h-8 w-8 text-[#8fb8ae]" />
      </span>
      <h3 className="mt-4 text-lg font-extrabold text-on-surface">Aucun soin au dossier</h3>
      <p className="mt-1 max-w-md text-sm leading-relaxed text-on-surface-variant">
        Vaccins, vermifuges, vitamines : notez chaque intervention et laissez les rappels automatiques
        veiller sur vos pigeons.
      </p>
      <Button
        onClick={onAjouter}
        className="mt-5 gap-2 rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-lg shadow-teal-900/25"
      >
        <Plus className="h-4 w-4" />
        Enregistrer un premier soin
      </Button>
    </div>
  )
}

function EtatVideRappels({ onAjouter }: { onAjouter: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-[#b9d8d0] bg-[#f5faf8]">
        <CheckCircle2 className="h-8 w-8 text-[#8fb8ae]" />
      </span>
      <h3 className="mt-4 text-lg font-extrabold text-on-surface">Aucun rappel en attente</h3>
      <p className="mt-1 max-w-md text-sm leading-relaxed text-on-surface-variant">
        Tout est à jour. Posez ici vos prochains rendez-vous : mirages à contrôler, nichoirs à
        changer, visites du vétérinaire…
      </p>
      <Button
        onClick={onAjouter}
        className="mt-5 gap-2 rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-lg shadow-teal-900/25"
      >
        <Plus className="h-4 w-4" />
        Créer un rappel
      </Button>
    </div>
  )
}
