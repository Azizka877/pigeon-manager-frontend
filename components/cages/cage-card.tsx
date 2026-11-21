'use client'

import { useMemo } from 'react'
import { useCageStore } from '@/stores/cage-store'
import { construireSceneCage, type StatutCage } from '@/lib/cage-art'
import { photoPigeonSeul, photosPigeonCouple, photoPigeonToit } from '@/lib/pigeon-cage-images'
import type { Cage } from '@/types'

export type { Cage }


export interface CageOccupationPigeon {
  id: string
  matricule?: string | null
  sexe?: 'M' | 'F' | null
  race?: string | null
  age?: string | number | null
}

// ── Sémantique des statuts (inchangée : vert / rouge / orange) ──────────────
const STATUS_CONFIG = {
  libre: {
    label: 'Libre',
    dot: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    hint: 'Disponible pour une nouvelle occupation',
  },
  seul: {
    label: 'Occupée',
    dot: 'bg-rose-500',
    chip: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    hint: '1 pigeon installé',
  },
  couple: {
    label: 'Couple',
    dot: 'bg-orange-500',
    chip: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
    hint: '2 pigeons installés',
  },
} as const

export function statutDeCage(cage: Cage): StatutCage {
  const occ = cage.occupation_actuelle
  if (!occ) return 'libre'
  return occ.type === 'couple' ? 'couple' : 'seul'
}

/** Config d'affichage d'une cage — export conservé pour les autres composants */
export function getStatusConfig(cage: Cage) {
  return STATUS_CONFIG[statutDeCage(cage)]
}

// ── Lecture des informations de la cage ─────────────────────────────────────
function matriculesDeCage(cage: Cage): string[] {
  const occ = cage.occupation_actuelle
  if (!occ) return []
  if (occ.type === 'seul') {
    const m = occ.pigeon?.matricule
    return m ? [m] : []
  }
  const c = occ.couple
  if (!c) return []
  return [c.male_details?.matricule ?? c.male, c.femelle_details?.matricule ?? c.femelle]
    .filter((v): v is string => Boolean(v))
}

function formatDateCourte(valeur?: string | null): string | null {
  if (!valeur) return null
  const d = new Date(valeur)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// ── La carte ─────────────────────────────────────────────────────────────────
export function CageCard({ cage, isSelected = false }: { cage: Cage; isSelected?: boolean }) {
  const setSelectedCage = useCageStore((s) => s.setSelectedCage)
  const statut = statutDeCage(cage)
  const config = STATUS_CONFIG[statut]

  // Scène SVG reconstruite uniquement si la cage ou son état change.
  // Les pigeons sont en VRAIES PHOTOS : chaque pigeon reçoit l'image de la
  // banque correspondant à son id (stable d'un rendu à l'autre), femelles sur
  // la banque fauve, mâles sur les gris — repli vectoriel si pas de photo.
  const scene = useMemo(() => {
    const occ = cage.occupation_actuelle
    const couple = occ?.type === 'couple' ? occ.couple : undefined
    const { male, femelle } = couple
      ? photosPigeonCouple(
          couple.male_details?.id ?? couple.male,
          couple.femelle_details?.id ?? couple.femelle,
        )
      : { male: null, femelle: null }

    return construireSceneCage({
      uid: cage.id,
      numero: cage.numero ?? cage.nom ?? '',
      statut,
      sexeSeul: occ?.pigeon?.sexe === 'F' ? 'F' : 'M',
      photoSeul: photoPigeonSeul(occ?.pigeon?.id, occ?.pigeon?.sexe),
      photoMale: male,
      photoFemelle: femelle,
      photoToit: photoPigeonToit(cage.id),
    })
  }, [cage.id, cage.numero, cage.nom, cage.occupation_actuelle, statut])

  const numeroAffiche = cage.numero ?? cage.nom ?? '?'
  const mats = matriculesDeCage(cage)
  const depuis = formatDateCourte(cage.occupation_actuelle?.date_debut ?? null)

  return (
    <button
      type="button"
      onClick={() => setSelectedCage(cage.id)}
      aria-pressed={isSelected}
      aria-label={`Cage ${numeroAffiche} — ${config.label}`}
      className={`cage-card group relative w-full overflow-hidden rounded-2xl border bg-surface-container-lowest p-2.5 pb-3 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-900/10 ${
        isSelected
          ? 'border-[#00685f]/30 ring-2 ring-[#00685f] ring-offset-2 ring-offset-transparent shadow-lg shadow-teal-900/15'
          : 'border-outline-variant'
      }`}
    >
      {/* Badge de statut (sémantique métier : vert / rouge / orange) */}
      <span
        className={`absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${config.chip}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>

      {/* Scène réaliste : toit, porte à l'avant, pigeons, nichoir, tiroir… */}
      <svg
        viewBox="-4 -18 228 206"
        role="img"
        aria-hidden="true"
        className="block w-full"
        dangerouslySetInnerHTML={{ __html: scene }}
      />

      {/* Pied de carte : numéro + occupants */}
      <div className="px-1.5 pt-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-bold text-on-surface">
            Cage&nbsp;{numeroAffiche}
          </span>
          {depuis && (
            <span className="shrink-0 text-[11px] font-medium text-on-surface-variant">
              depuis le {depuis}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-[11px] text-on-surface-variant">
          {mats.length > 0 ? mats.join('  ·  ') : config.hint}
        </p>
      </div>
    </button>
  )
}

export default CageCard