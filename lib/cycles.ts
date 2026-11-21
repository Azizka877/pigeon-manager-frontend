// lib/cycles.ts — calculs partagés du cycle d'élevage d'une reproduction :
// ponte → incubation (18 j) → éclosion → sevrage (30 j) → terminé.
// Utilisé par la liste des reproductions ET la fiche détail pour que les
// phases, leurs libellés et leurs couleurs restent strictement identiques.

import type { Reproduction } from '@/types'

export type PhaseCycle = 'incubation' | 'imminente' | 'sevrage' | 'termine'

export interface InfoPhase {
  phase: PhaseCycle
  label: string
  description: string
  /** Progression de la phase en cours, de 0 (début) à 1 (fin) */
  progress: number
  joursDepuisPonte: number
  joursDepuisEclosion: number | null
}

export const INCUBATION_JOURS = 18
export const SEVRAGE_JOURS = 30

const JOUR_MS = 1000 * 60 * 60 * 24

export function joursEntre(de: string | Date, vers: string | Date = new Date()): number {
  return Math.floor((new Date(vers).getTime() - new Date(de).getTime()) / JOUR_MS)
}

/** Date de ponte + 18 jours → éclosion théorique (ISO yyyy-mm-dd) */
export function dateEclosionPrevue(datePonte: string): string {
  const d = new Date(datePonte)
  d.setDate(d.getDate() + INCUBATION_JOURS)
  return d.toISOString().split('T')[0]
}

/** Date d'éclosion + 30 jours → fin de sevrage théorique (ISO yyyy-mm-dd) */
export function dateSevragePrevue(dateEclosion: string): string {
  const d = new Date(dateEclosion)
  d.setDate(d.getDate() + SEVRAGE_JOURS)
  return d.toISOString().split('T')[0]
}

/** Phase actuelle d'un cycle, calculée comme côté fiche détail */
export function getPhaseCycle(repro: Reproduction): InfoPhase {
  const joursDepuisPonte = Math.max(joursEntre(repro.date_ponte), 0)

  // Pas encore d'éclosion notée : le nid est sous incubation
  if (!repro.date_eclosion) {
    if (joursDepuisPonte < 15) {
      return {
        phase: 'incubation',
        label: 'Incubation',
        description: `Jour ${joursDepuisPonte} sur ${INCUBATION_JOURS}`,
        progress: Math.min(joursDepuisPonte / INCUBATION_JOURS, 1),
        joursDepuisPonte,
        joursDepuisEclosion: null,
      }
    }
    return {
      phase: 'imminente',
      label: 'Éclosion imminente',
      description:
        joursDepuisPonte >= INCUBATION_JOURS
          ? 'Sur le point d’éclore'
          : `${INCUBATION_JOURS - joursDepuisPonte} j restants`,
      progress: Math.min(joursDepuisPonte / INCUBATION_JOURS, 1),
      joursDepuisPonte,
      joursDepuisEclosion: null,
    }
  }

  // Éclosion notée : sevrage tant que les jeunes sont au nid, sinon archivé
  const joursDepuisEclosion = Math.max(joursEntre(repro.date_eclosion), 0)
  if (repro.nombre_jeunes > 0 && joursDepuisEclosion < SEVRAGE_JOURS) {
    return {
      phase: 'sevrage',
      label: 'Sevrage',
      description: `Jour ${joursDepuisEclosion} sur ${SEVRAGE_JOURS}`,
      progress: Math.min(joursDepuisEclosion / SEVRAGE_JOURS, 1),
      joursDepuisPonte,
      joursDepuisEclosion,
    }
  }

  return {
    phase: 'termine',
    label: 'Terminé',
    description: 'Cycle complété',
    progress: 1,
    joursDepuisPonte,
    joursDepuisEclosion,
  }
}

/** Classes du badge de phase — même palette liste + détail */
export const CHIP_PHASE: Record<PhaseCycle, string> = {
  incubation: 'bg-[#e8f6f3] text-[#00685f] ring-1 ring-[#bfe3dc]',
  imminente: 'bg-[#fff4e5] text-[#b45309] ring-1 ring-[#fde3bd]',
  sevrage: 'bg-[#00685f] text-white',
  termine: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
}

/** Petit point pulsant collé au badge pour les phases « vivantes » */
export const PULSE_PHASE: Record<PhaseCycle, string | null> = {
  incubation: 'bg-[#00685f]',
  imminente: 'bg-[#d97706]',
  sevrage: 'bg-white/70',
  termine: null,
}

export function formatDateLong(d: string | null | undefined): string {
  if (!d) return '--'
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatDateCourte(d: string | null | undefined): string {
  if (!d) return '--/--'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
}

/** Saison d'une date : Printemps / Été / Automne / Hiver */
export function periodeDe(d: string): string {
  const mois = new Date(d).getMonth() + 1
  if (mois >= 3 && mois <= 5) return 'Printemps'
  if (mois >= 6 && mois <= 8) return 'Été'
  if (mois >= 9 && mois <= 11) return 'Automne'
  return 'Hiver'
}