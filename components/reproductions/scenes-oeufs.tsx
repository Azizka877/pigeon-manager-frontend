'use client'

// ─────────────────────────────────────────────────────────────────────────────
// components/reproductions/scenes-oeufs.tsx — Le NID VIVANT des cycles
// d'élevage (SVG pur, aucune image externe), décliné en trois scènes :
//
//   OeufsPonte  — coupelle tressée contenant la couvée. L'état du cycle se
//                 lit sur les oeufs eux-mêmes : porcelaine lisse pendant
//                 l'incubation, fissures dorées quand l'éclosion est
//                 imminente, coquille ouverte avec poussin au duvet jaune
//                 une fois éclos, tons éteints pour un cycle archivé.
//   AnneauCycle — anneau de progression (J+x/18 incubation, J+x/30 sevrage)
//                 en dégradé signature teal, glow doux, transition animée.
//   OeufPuce    — oeuf miniaturisé pour les cellules de tableau (œufs / éclos).
//
// Réutilise le même langage visuel que components/couples/nid-oeufs.tsx
// (porcelaine ivoire, branchages bruns, ombre de contact au sol).
// ─────────────────────────────────────────────────────────────────────────────

import { useId } from 'react'
import type { ReactNode } from 'react'
import type { PhaseCycle } from '@/lib/cycles'
import { cn } from '@/lib/utils'

/** Positions calées dans la coupelle : [cx, cy, rotation°] pour 1 à 4 oeufs */
const POSITIONS: Record<number, Array<[number, number, number]>> = {
  1: [[60, 33, 0]],
  2: [[50, 33, -6], [70, 32, 5]],
  3: [[46, 33, -8], [60, 30, 0], [74, 33, 7]],
  4: [[44, 33, -10], [54, 30, -4], [66, 30, 4], [76, 33, 9]],
}

/** État visuel du nid, dérivé de la phase du cycle */
export type EtatNid = 'incubation' | 'imminente' | 'eclos' | 'termine'

export function etatNidDe(phase: PhaseCycle): EtatNid {
  if (phase === 'incubation') return 'incubation'
  if (phase === 'imminente') return 'imminente'
  if (phase === 'sevrage') return 'eclos'
  return 'termine'
}

// ─── Oeuf en porcelaine (coquille + reflet), avec fissures optionnelles ──────
function Coquille({
  uid,
  cx,
  cy,
  rot,
  fende,
  eteint,
}: {
  uid: string
  cx: number
  cy: number
  rot: number
  fende?: boolean
  eteint?: boolean
}) {
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      {/* Micro-ombre sous l'oeuf */}
      <ellipse cx={cx} cy={cy + 9.5} rx="9" ry="3" fill="#2e2012" opacity="0.2" />
      {/* Coquille : porcelaine ivoire (tons éteints si cycle archivé) */}
      <ellipse cx={cx} cy={cy} rx="9" ry="11.5" fill={eteint ? `url(#coq-gris-${uid})` : `url(#coq-${uid})`} />
      {/* Reflet de lumière */}
      <ellipse cx={cx - 3} cy={cy - 4.5} rx="2.6" ry="3.4" fill="#ffffff" opacity={eteint ? 0.4 : 0.82} />
      {/* Fissures dorées : l'éclosion est imminente */}
      {fende && (
        <g stroke="#c9922f" strokeWidth="1.1" fill="none" strokeLinecap="round" opacity="0.9">
          <path d={`M ${cx - 4} ${cy - 5} l 3 3 l -2.4 2.6 l 3.4 3`} />
          <path d={`M ${cx + 1} ${cy - 8.5} l 1.4 2.8`} />
          <path d={`M ${cx - 6.5} ${cy + 2} l 2.4 1.2`} />
        </g>
      )}
    </g>
  )
}

// ─── Poussin au duvet jaune sortant de la coquille ───────────────────────────
function Poussin({ uid, cx, cy }: { uid: string; cx: number; cy: number }) {
  return (
    <g>
      {/* Ombre de contact sous la coquille */}
      <ellipse cx={cx} cy={cy + 9.5} rx="9.5" ry="3" fill="#2e2012" opacity="0.2" />
      {/* Demi-coquille arrière, derrière le poussin */}
      <path
        d={`M ${cx - 8.6} ${cy - 0.6} Q ${cx} ${cy - 5.4} ${cx + 8.6} ${cy - 0.6}`}
        fill="#efe9dc"
      />
      {/* Corps et tête au duvet */}
      <ellipse cx={cx} cy={cy - 0.6} rx="6.4" ry="5.8" fill={`url(#duvet-${uid})`} />
      <circle cx={cx} cy={cy - 6.2} r="4.5" fill={`url(#duvet-${uid})`} />
      {/* Aile esquissée */}
      <path
        d={`M ${cx - 4.4} ${cy - 0.8} Q ${cx - 1.6} ${cy + 1.4} ${cx + 2.4} ${cy - 0.4}`}
        stroke="#e8b93c"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        opacity="0.75"
      />
      {/* Yeux fermés, sereins */}
      <g stroke="#9a6b1f" strokeWidth="0.9" fill="none" strokeLinecap="round">
        <path d={`M ${cx - 3.1} ${cy - 6.9} q 0.9 0.9 1.8 0`} />
        <path d={`M ${cx + 1.3} ${cy - 6.9} q 0.9 0.9 1.8 0`} />
      </g>
      {/* Bec */}
      <path
        d={`M ${cx - 1.6} ${cy - 4.7} L ${cx + 1.6} ${cy - 4.7} L ${cx} ${cy - 2.9} Z`}
        fill="#f2a13c"
      />
      {/* Touffe de duvet sur la tête */}
      <g stroke="#fbd45c" strokeWidth="1.1" strokeLinecap="round">
        <path d={`M ${cx - 1.4} ${cy - 10.4} l -1 -1.6`} />
        <path d={`M ${cx} ${cy - 10.7} l 0 -1.9`} />
        <path d={`M ${cx + 1.4} ${cy - 10.4} l 1 -1.6`} />
      </g>
      {/* Demi-coquille avant, par-dessus le poussin */}
      <path
        d={`M ${cx - 9.2} ${cy + 1}
            A 9 11.5 0 0 0 ${cx + 9.2} ${cy + 1}
            L ${cx + 6.8} ${cy - 0.4}
            L ${cx + 4.4} ${cy + 1.9}
            L ${cx + 1.6} ${cy - 0.7}
            L ${cx - 1.4} ${cy + 1.9}
            L ${cx - 4.4} ${cy - 0.5}
            L ${cx - 6.8} ${cy + 1.7} Z`}
        fill={`url(#coq-${uid})`}
      />
      {/* Liseré lumineux du bord brisé */}
      <path
        d={`M ${cx - 6.8} ${cy + 1.7} L ${cx - 4.4} ${cy - 0.5} L ${cx - 1.4} ${cy + 1.9} L ${cx + 1.6} ${cy - 0.7} L ${cx + 4.4} ${cy + 1.9} L ${cx + 6.8} ${cy - 0.4}`}
        fill="none"
        stroke="#d9d1bf"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </g>
  )
}

// ─── Scène de nid à états ────────────────────────────────────────────────────
export function OeufsPonte({
  phase,
  nombreOeufs,
  nombreEclos,
  className,
}: {
  phase: PhaseCycle
  nombreOeufs: number
  /** Réel uniquement si l'éclosion a été notée */
  nombreEclos?: number | null
  className?: string
}) {
  const uid = useId().replace(/:/g, '')
  const etat = etatNidDe(phase)
  const slots = Math.min(Math.max(nombreOeufs, 1), 4)
  const positions = POSITIONS[slots]
  const nbPoussins =
    etat === 'eclos' || etat === 'termine'
      ? Math.min(Math.max(nombreEclos ?? nombreOeufs, 0), slots)
      : 0

  return (
    <svg
      viewBox="0 0 120 64"
      className={className}
      role="img"
      aria-label={`Nid de ${nombreOeufs} oeuf${nombreOeufs > 1 ? 's' : ''} — ${etat}`}
    >
      <defs>
        <linearGradient id={`nid-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b18a5f" />
          <stop offset="55%" stopColor="#8a6440" />
          <stop offset="100%" stopColor="#5d422b" />
        </linearGradient>
        <radialGradient id={`cavite-${uid}`} cx="50%" cy="30%" r="85%">
          <stop offset="0%" stopColor="#6b4c2e" />
          <stop offset="100%" stopColor="#3a2a18" />
        </radialGradient>
        <radialGradient id={`coq-${uid}`} cx="36%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#fffefb" />
          <stop offset="55%" stopColor="#f6f2e8" />
          <stop offset="100%" stopColor="#d9d1bf" />
        </radialGradient>
        <radialGradient id={`coq-gris-${uid}`} cx="36%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#f2efe8" />
          <stop offset="55%" stopColor="#e2ddd0" />
          <stop offset="100%" stopColor="#c4bdaa" />
        </radialGradient>
        <radialGradient id={`duvet-${uid}`} cx="38%" cy="30%" r="85%">
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="55%" stopColor="#fbdc7f" />
          <stop offset="100%" stopColor="#eec14a" />
        </radialGradient>
      </defs>

      {/* Ombre de contact au sol */}
      <ellipse cx="60" cy="57.5" rx="40" ry="4" fill="#2e2012" opacity="0.14" />

      {/* Coupelle extérieure du nid */}
      <ellipse cx="60" cy="44" rx="42" ry="15" fill={`url(#nid-${uid})`} />
      <ellipse cx="60" cy="44" rx="42" ry="15" fill="none" stroke="#a98662" strokeWidth="1.4" opacity="0.65" />

      {/* Cavité intérieure */}
      <ellipse cx="60" cy="40" rx="34" ry="10.5" fill={`url(#cavite-${uid})`} />

      {/* Couvée : oeufs en porcelaine ou poussins éclos */}
      {positions.map(([cx, cy, rot], i) =>
        i < nbPoussins ? (
          <Poussin key={i} uid={uid} cx={cx} cy={cy} />
        ) : (
          <Coquille
            key={i}
            uid={uid}
            cx={cx}
            cy={cy}
            rot={rot}
            fende={etat === 'imminente'}
            eteint={etat === 'termine'}
          />
        ),
      )}

      {/* Branchages AVANT (par-dessus la couvée : effet nid fermé) */}
      <path d="M14 44 Q 60 57 106 44" stroke="#7c5a3b" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M20 48 Q 60 60 100 48" stroke="#936f4a" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M28 51 Q 60 61 92 51" stroke="#5d422b" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M32 54 Q 60 63 88 54" stroke="#6e4f33" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.9" />

      {/* Brindilles croisées : texture tressée */}
      <path d="M38 47 l7 3.5" stroke="#a98662" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M66 48.5 l8 -2.5" stroke="#c9a97f" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M52 50 l6 2.5" stroke="#8a6440" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M82 47 l6 2" stroke="#936f4a" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M35 53 l6 2" stroke="#a98662" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
      <path d="M60 55 l7 1.5" stroke="#7c5a3b" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
      <path d="M79 53.5 l6 -1.5" stroke="#936f4a" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
      <path d="M45 56.5 l5 1.2" stroke="#c9a97f" strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
      <path d="M68 57.5 l5 -1" stroke="#8a6440" strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

// ─── Anneau de progression du cycle ──────────────────────────────────────────
const TONS: Record<'teal' | 'ambre' | 'gris', [string, string]> = {
  teal: ['#0a9d8c', '#01352f'],
  ambre: ['#f5a623', '#b45309'],
  gris: ['#9ca3af', '#6b7280'],
}

export function AnneauCycle({
  progress,
  ton = 'teal',
  taille = 150,
  children,
  className,
}: {
  /** 0 → début de phase, 1 → fin de phase */
  progress: number
  ton?: 'teal' | 'ambre' | 'gris'
  taille?: number
  /** Contenu centré : jour courant, libellé, icône… */
  children?: ReactNode
  className?: string
}) {
  const uid = useId().replace(/:/g, '')
  const p = Math.min(Math.max(progress, 0), 1)
  const rayon = 52
  const circonference = 2 * Math.PI * rayon
  const [couleurA, couleurB] = TONS[ton]

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: taille, height: taille }}
    >
      <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id={`anneau-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={couleurA} />
            <stop offset="100%" stopColor={couleurB} />
          </linearGradient>
        </defs>
        {/* Piste */}
        <circle cx="60" cy="60" r={rayon} fill="none" stroke="#e7eeec" strokeWidth="9" />
        {/* Progression animée */}
        <circle
          cx="60"
          cy="60"
          r={rayon}
          fill="none"
          stroke={`url(#anneau-${uid})`}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${circonference * p} ${circonference}`}
          transform="rotate(-90 60 60)"
          style={{
            transition: 'stroke-dasharray 700ms cubic-bezier(0.22, 1, 0.36, 1)',
            filter: 'drop-shadow(0 2px 5px rgba(1, 53, 47, 0.28))',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  )
}

// ─── Oeuf miniaturisé pour les cellules de tableau ───────────────────────────
export function OeufPuce({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 16" className={className} aria-hidden="true">
      <ellipse cx="6" cy="8" rx="5" ry="6.6" fill="#f3efe4" />
      <ellipse cx="6" cy="8" rx="5" ry="6.6" fill="none" stroke="#d8d0bd" strokeWidth="0.8" />
      <ellipse cx="4.4" cy="5.4" rx="1.5" ry="2" fill="#ffffff" opacity="0.85" />
    </svg>
  )
}