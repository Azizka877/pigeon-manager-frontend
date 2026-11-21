'use client'

// ─────────────────────────────────────────────────────────────────────────────
// components/couples/nid-oeufs.tsx — Nid d'élevage ULTRA-RÉALISTE (SVG pur,
// aucune image externe). Coupelle tressée : branchages superposés en dégradés
// bruns, cavité intérieure ombrée, oeufs en porcelaine (dégradé radial blanc
// ivoire, reflet de lumière, micro-rotation naturelle). 1 oeuf affiché =
// 1 ponte enregistrée (max 5 visibles — au-delà, le compteur de la carte
// prend le relais). Réutilisé dans les cartes couple et l'état vide.
// ─────────────────────────────────────────────────────────────────────────────

import { useId } from 'react'

/** Positions calées dans la coupelle : [cx, cy, rotation°] pour 0 à 5 oeufs */
const POSITIONS: Record<number, Array<[number, number, number]>> = {
  0: [],
  1: [[60, 33, 0]],
  2: [[50, 33, -6], [70, 32, 5]],
  3: [[45, 33, -8], [60, 29, 0], [75, 33, 7]],
  4: [[43, 33, -10], [54, 29, -4], [67, 29, 4], [78, 32, 9]],
  5: [[41, 33, -12], [51, 29, -6], [60, 34, 0], [69, 29, 5], [79, 33, 11]],
}

export function NidOeufs({ nombre, className }: { nombre: number; className?: string }) {
  // useId contient des « : » — interdits dans les références url(#…) SVG
  const uid = useId().replace(/:/g, '')
  const oeufs = Math.min(Math.max(nombre, 0), 5)

  return (
    <svg
      viewBox="0 0 120 64"
      className={className}
      role="img"
      aria-label={nombre === 0 ? 'Nid vide' : `Nid avec ${nombre} ponte${nombre > 1 ? 's' : ''}`}
    >
      <defs>
        {/* Branchage extérieur : brun chaud → brun profond */}
        <linearGradient id={`nid-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b18a5f" />
          <stop offset="55%" stopColor="#8a6440" />
          <stop offset="100%" stopColor="#5d422b" />
        </linearGradient>
        {/* Cavité intérieure : ombre douce au fond du nid */}
        <radialGradient id={`cavite-${uid}`} cx="50%" cy="30%" r="85%">
          <stop offset="0%" stopColor="#6b4c2e" />
          <stop offset="100%" stopColor="#3a2a18" />
        </radialGradient>
        {/* Coquille : porcelaine ivoire avec point de lumière */}
        <radialGradient id={`oeuf-${uid}`} cx="36%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#fffefb" />
          <stop offset="55%" stopColor="#f6f2e8" />
          <stop offset="100%" stopColor="#d9d1bf" />
        </radialGradient>
      </defs>

      {/* Ombre de contact au sol */}
      <ellipse cx="60" cy="57.5" rx="40" ry="4" fill="#2e2012" opacity="0.14" />

      {/* Coupelle extérieure du nid */}
      <ellipse cx="60" cy="44" rx="42" ry="15" fill={`url(#nid-${uid})`} />
      {/* Liseré de branchages secs sur la lèvre */}
      <ellipse cx="60" cy="44" rx="42" ry="15" fill="none" stroke="#a98662" strokeWidth="1.4" opacity="0.65" />

      {/* Cavité intérieure */}
      <ellipse cx="60" cy="40" rx="34" ry="10.5" fill={`url(#cavite-${uid})`} />

      {/* Oeufs — posés sur la cavité, pointes vers le haut */}
      {POSITIONS[oeufs].map(([cx, cy, rot], i) => (
        <g key={i}>
          {/* Micro-ombre sous l'oeuf */}
          <ellipse cx={cx} cy={cy + 9.5} rx="9" ry="3" fill="#2e2012" opacity="0.22" />
          {/* Coquille */}
          <ellipse
            cx={cx}
            cy={cy}
            rx="9"
            ry="11.5"
            fill={`url(#oeuf-${uid})`}
            transform={`rotate(${rot} ${cx} ${cy})`}
          />
          {/* Reflet de lumière */}
          <ellipse cx={cx - 3} cy={cy - 4.5} rx="2.6" ry="3.4" fill="#ffffff" opacity="0.82" />
        </g>
      ))}

      {/* Branchages AVANT (par-dessus les oeufs : effet nid fermé) */}
      <path d="M14 44 Q 60 57 106 44" stroke="#7c5a3b" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M20 48 Q 60 60 100 48" stroke="#936f4a" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M28 51 Q 60 61 92 51" stroke="#5d422b" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M32 54 Q 60 63 88 54" stroke="#6e4f33" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.9" />

      {/* Brindilles croisées : texture tressée (lèvre + corps du nid) */}
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

export default NidOeufs