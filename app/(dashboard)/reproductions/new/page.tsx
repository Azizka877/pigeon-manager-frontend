'use client'

// ─────────────────────────────────────────────────────────────────────────────
// app/(dashboard)/reproductions/new/page.tsx — Enregistrer une ponte, design
// ultra-moderne réaliste cohérent avec « Former un couple » : la scène du nid
// (les deux vraies photos face à face au-dessus de la coupe tressée) se compose
// en direct dès que le couple est choisi, le nombre d'œufs se règle au
// compteur d'œufs en porcelaine, et un repère « éclosion prévue J+18 » se
// met à jour en temps réel.
// Logique métier inchangée : useCreateReproduction(payload complet),
// validation couple + date de ponte, redirection vers /reproductions.
// Corrige au passage le doublon d'options « Indéterminé / Mâle » (deux
// <option value="M">) du select Sexe d'origine.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCreateReproduction } from '@/hooks/use-reproductions'
import { useCouples } from '@/hooks/use-couples'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  CalendarDays,
  Egg,
  Heart,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { OeufPuce, OeufsPonte } from '@/components/reproductions/scenes-oeufs'
import { dateEclosionPrevue, formatDateLong } from '@/lib/cycles'
import { getPigeonImage } from '@/lib/pigeon-images'
import type { Couple, JeuneFormData } from '@/types'

export default function NouvelleReproductionPage() {
  const router = useRouter()
  const creerReproduction = useCreateReproduction()
  const { data: couples } = useCouples()

  const [coupleId, setCoupleId] = useState('')
  const [datePonte, setDatePonte] = useState('')
  const [dateEclosion, setDateEclosion] = useState('')
  const [nombreOeufs, setNombreOeufs] = useState(2)
  const [notes, setNotes] = useState('')

  const [jeunes, setJeunes] = useState<JeuneFormData[]>([
    { matricule: '', sexe: 'M', couleur: '' },
    { matricule: '', sexe: 'F', couleur: '' },
  ])

  const couplesActifs = useMemo(
    () => couples?.results?.filter((c) => c.statut === 'actif') || [],
    [couples],
  )
  const coupleSelectionne = couplesActifs.find((c) => c.id === coupleId) || null

  const addJeune = () => {
    setJeunes((prev) => [...prev, { matricule: '', sexe: 'M', couleur: '' }])
  }

  const removeJeune = (index: number) => {
    setJeunes((prev) => prev.filter((_, i) => i !== index))
  }

  const updateJeune = (index: number, field: keyof JeuneFormData, value: string) => {
    setJeunes((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!coupleId || !datePonte) {
      toast.error('Veuillez sélectionner un couple et une date de ponte')
      return
    }

    const jeunesValides = jeunes.filter((j) => j.matricule.trim())

    try {
      await creerReproduction.mutateAsync({
        couple: coupleId,
        date_ponte: datePonte,
        date_eclosion: dateEclosion || undefined,
        nombre_oeufs: nombreOeufs,
        notes: notes || undefined,
        jeunes: jeunesValides.length > 0 ? jeunesValides : undefined,
      })

      toast.success(
        `Reproduction enregistrée${jeunesValides.length > 0 ? ` avec ${jeunesValides.length} jeune(s)` : ''}`,
      )
      router.push('/reproductions')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Erreur lors de l'enregistrement")
    }
  }

  // Repère J+18 en direct dès que la date de ponte est saisie
  const eclosionPrevue = datePonte ? dateEclosionPrevue(datePonte) : null

  return (
    <div className="max-w-3xl">
      {/* ── En-tête ── */}
      <div className="mb-6">
        <Link href="/reproductions">
          <Button variant="ghost" className="mb-3 gap-2 pl-0 text-on-surface-variant">
            <ArrowLeft className="h-4 w-4" />
            Retour aux reproductions
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00685f] to-[#01352f] text-white shadow-md shadow-teal-900/25">
            <Egg className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-on-surface sm:text-3xl">
              Enregistrer une ponte
            </h1>
            <p className="mt-0.5 text-sm text-on-surface-variant">
              Choisissez le couple, notez la ponte et baguez les pigeonneaux nés.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ══ Section 1 : LES PARENTS ══ */}
        <Card className="overflow-hidden rounded-3xl border-outline-variant">
          {/* Scène du nid en direct */}
          <div className="relative h-40 bg-gradient-to-b from-[#eaf4f1] to-white">
            <p className="absolute left-1/2 top-3 -translate-x-1/2 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
              Scène du nid
            </p>

            {coupleSelectionne ? (
              <>
                {/* Ombres de contact */}
                <div
                  className="absolute bottom-4 left-[18%] h-3 w-[22%] rounded-full"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(15,60,55,0.16), transparent 70%)' }}
                  aria-hidden="true"
                />
                <div
                  className="absolute bottom-4 right-[18%] h-3 w-[22%] rounded-full"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(15,60,55,0.16), transparent 70%)' }}
                  aria-hidden="true"
                />
                {/* Mâle, tourné vers la femelle */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getPigeonImage(String(coupleSelectionne.male_details?.id ?? ''), 'M')}
                  alt={`Mâle ${coupleSelectionne.male_details?.matricule || ''}`}
                  className="absolute bottom-2 left-[10%] h-[74%] object-contain"
                  style={{ transform: 'scaleX(-1)', filter: 'drop-shadow(0 6px 8px rgba(10,40,35,0.18))' }}
                />
                {/* Femelle */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getPigeonImage(String(coupleSelectionne.femelle_details?.id ?? ''), 'F')}
                  alt={`Femelle ${coupleSelectionne.femelle_details?.matricule || ''}`}
                  className="absolute bottom-2 right-[10%] h-[74%] object-contain"
                  style={{ filter: 'drop-shadow(0 6px 8px rgba(10,40,35,0.18))' }}
                />
                {/* Cœur de l'union */}
                <span className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2">
                  <span className="absolute inset-0 -m-2 animate-pulse rounded-full bg-pink-200/60" aria-hidden="true" />
                  <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm ring-1 ring-pink-100">
                    <Heart className="h-4 w-4 fill-pink-400 text-pink-400" />
                  </span>
                </span>
                {/* Couple de l'union déjà fécond : nid de prévisualisation */}
                <OeufsPonte
                  phase="incubation"
                  nombreOeufs={nombreOeufs}
                  className="absolute bottom-0 left-1/2 h-16 w-32 -translate-x-1/2"
                />
              </>
            ) : (
              <div className="flex h-full items-center justify-center gap-16">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[#b9d8d0] text-[22px] text-[#8fb8ae]">
                  ♂
                </span>
                <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[#f2c6d0] text-[22px] text-[#dda4b3]">
                  ♀
                </span>
              </div>
            )}
          </div>

          {/* Sélecteur du couple */}
          <div className="p-6">
            <Label htmlFor="couple" className="text-[13px] font-semibold text-on-surface">
              Couple reproducteur <span className="text-red-500">*</span>
            </Label>
            <select
              id="couple"
              className="mt-1.5 h-10 w-full rounded-xl border border-outline-variant bg-surface-container px-3 text-sm"
              value={coupleId}
              onChange={(e) => setCoupleId(e.target.value)}
              required
            >
              <option value="">Sélectionner un couple actif…</option>
              {couplesActifs.map((c) => (
                <option key={c.id} value={c.id}>
                  {(c.male_details?.matricule || 'Inconnu')} + {(c.femelle_details?.matricule || 'Inconnue')}
                </option>
              ))}
            </select>

            {coupleSelectionne && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-2 rounded-2xl bg-[#eef4fb] px-3 py-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-600">
                    ♂
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-[12.5px] font-bold text-on-surface">
                      {coupleSelectionne.male_details?.matricule || 'Inconnu'}
                    </span>
                    <span className="block truncate text-[11px] text-on-surface-variant">
                      {coupleSelectionne.male_details?.race || 'Race inconnue'}
                    </span>
                  </span>
                </span>
                <Heart className="h-4 w-4 shrink-0 fill-pink-400 text-pink-400" />
                <span className="flex items-center gap-2 rounded-2xl bg-[#fdf1f4] px-3 py-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-100 text-sm font-bold text-pink-600">
                    ♀
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-[12.5px] font-bold text-on-surface">
                      {coupleSelectionne.femelle_details?.matricule || 'Inconnue'}
                    </span>
                    <span className="block truncate text-[11px] text-on-surface-variant">
                      {coupleSelectionne.femelle_details?.race || 'Race inconnue'}
                    </span>
                  </span>
                </span>
                {!!coupleSelectionne.reproductions_count && (
                  <span className="ml-auto rounded-full bg-[#eef7f5] px-3 py-1.5 text-[11.5px] font-semibold text-[#1d5a52]">
                    {coupleSelectionne.reproductions_count} ponte
                    {coupleSelectionne.reproductions_count > 1 ? 's' : ''} déjà enregistrée
                    {coupleSelectionne.reproductions_count > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* ══ Section 2 : LA PONTE ══ */}
        <Card className="rounded-3xl border-outline-variant p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef7f5] text-[#00685f]">
              <CalendarDays className="h-4 w-4" />
            </span>
            <h2 className="text-[15px] font-extrabold text-on-surface">La ponte</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="date_ponte" className="text-[13px]">
                Date de ponte <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date_ponte"
                type="date"
                value={datePonte}
                onChange={(e) => setDatePonte(e.target.value)}
                required
                className="rounded-xl border-outline-variant bg-surface-container text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_eclosion" className="text-[13px]">
                Date d&apos;éclosion
              </Label>
              <Input
                id="date_eclosion"
                type="date"
                value={dateEclosion}
                onChange={(e) => setDateEclosion(e.target.value)}
                className="rounded-xl border-outline-variant bg-surface-container text-sm"
              />
              <p className="text-[11px] text-on-surface-variant">Laissez vide tant qu&apos;elle n&apos;a pas eu lieu.</p>
            </div>

            {/* Compteur d'œufs en porcelaine */}
            <div className="space-y-2">
              <Label className="text-[13px]">Nombre d&apos;œufs</Label>
              <div className="flex h-10 items-center justify-between rounded-xl border border-outline-variant bg-surface-container px-2">
                <button
                  type="button"
                  onClick={() => setNombreOeufs((v) => Math.max(1, v - 1))}
                  disabled={nombreOeufs <= 1}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-30"
                  aria-label="Retirer un œuf"
                >
                  −
                </button>
                <span className="flex items-center gap-2">
                  <OeufPuce className="h-4 w-3" />
                  <span className="text-[15px] font-extrabold text-on-surface">{nombreOeufs}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setNombreOeufs((v) => Math.min(4, v + 1))}
                  disabled={nombreOeufs >= 4}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#00685f] transition-colors hover:bg-[#eef7f5] disabled:opacity-30"
                  aria-label="Ajouter un œuf"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-on-surface-variant">Deux œufs est la norme chez le pigeon.</p>
            </div>
          </div>

          {/* Repère d'éclosion en direct */}
          {eclosionPrevue && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[#d5eae5] bg-[#eef7f5] px-4 py-2.5">
              <Egg className="h-4 w-4 shrink-0 text-[#00685f]" />
              <p className="text-[12.5px] text-[#1d5a52]">
                Éclosion prévue autour du <b>{formatDateLong(eclosionPrevue)}</b> — J+18 après la ponte.
              </p>
            </div>
          )}

          <div className="mt-4 space-y-2">
            <Label htmlFor="notes" className="text-[13px]">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Santé des parents, conditions météo, comportement au nid…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none rounded-xl border-outline-variant bg-surface-container text-sm"
            />
          </div>
        </Card>

        {/* ══ Section 3 : LES PIGEONNEAUX ══ */}
        <Card className="rounded-3xl border-outline-variant p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef7f5] text-[#00685f]">
                <Plus className="h-4 w-4" />
              </span>
              <h2 className="text-[15px] font-extrabold text-on-surface">Pigeonneaux nés</h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={addJeune}
              className="gap-1.5 text-[#00685f] hover:bg-[#f5faf8] hover:text-[#00554d]"
            >
              <Plus className="h-4 w-4" />
              Ajouter un pigeonneau
            </Button>
          </div>

          <div className="space-y-3">
            {jeunes.map((jeune, index) => (
              <div
                key={index}
                className="grid grid-cols-12 items-end gap-3 rounded-2xl border border-outline-variant bg-surface-container p-4"
              >
                {/* Numéro du pigeonneau */}
                <div className="col-span-12 sm:col-span-1">
                  <span className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#eef7f5] text-[12px] font-extrabold text-[#00685f]">
                    {index + 1}
                  </span>
                </div>

                <div className="col-span-12 sm:col-span-4">
                  <Label className="mb-1 block text-[11px] font-semibold text-on-surface-variant">
                    Matricule
                  </Label>
                  <Input
                    value={jeune.matricule}
                    onChange={(e) => updateJeune(index, 'matricule', e.target.value)}
                    placeholder="Ex : BE-2026-042"
                    className="h-9 rounded-xl border-outline-variant bg-white text-sm"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Label className="mb-1 block text-[11px] font-semibold text-on-surface-variant">
                    Sexe
                  </Label>
                  <select
                    value={jeune.sexe}
                    onChange={(e) =>
                      updateJeune(index, 'sexe', e.target.value === 'F' ? 'F' : 'M')
                    }
                    className="h-9 w-full rounded-xl border border-outline-variant bg-white px-2 text-sm"
                  >
                    <option value="M">Mâle</option>
                    <option value="F">Femelle</option>
                  </select>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <Label className="mb-1 block text-[11px] font-semibold text-on-surface-variant">
                    Couleur / Motif
                  </Label>
                  <Input
                    value={jeune.couleur}
                    onChange={(e) => updateJeune(index, 'couleur', e.target.value)}
                    placeholder="Ex : Bleu barré"
                    className="h-9 rounded-xl border-outline-variant bg-white text-sm"
                  />
                </div>

                <div className="col-span-12 sm:col-span-1 sm:text-right">
                  {jeunes.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeJeune(index)}
                      className="h-9 w-9 p-0 hover:bg-red-50"
                      aria-label="Retirer ce pigeonneau"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3 rounded-2xl border border-[#d5eae5] bg-[#eef7f5] p-4">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#00685f]" />
            <p className="text-[12.5px] leading-relaxed text-[#1d5a52]">
              Bon à savoir — laissez cette section vide si les jeunes ne sont pas encore bagués :
              vous pourrez les baguer plus tard depuis la fiche du cycle, sans rien perdre.
            </p>
          </div>
        </Card>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3">
          <Link href="/reproductions">
            <Button type="button" variant="outline" className="rounded-xl border-outline-variant">
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={creerReproduction.isPending || !coupleId || !datePonte}
            className={cn(
              'gap-2 rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-lg shadow-teal-900/25',
            )}
          >
            <Save className="h-4 w-4" />
            {creerReproduction.isPending ? 'Enregistrement…' : 'Enregistrer la ponte'}
          </Button>
        </div>
      </form>
    </div>
  )
}