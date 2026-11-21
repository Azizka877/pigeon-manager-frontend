'use client'

// ─────────────────────────────────────────────────────────────────────────────
// components/profile/scenes-colombier.tsx — LA SCÈNE DU COLOMBIER (SVG pur),
// bannière réaliste de l'onglet « Colombier » du profil : le loft au toit
// teal signature (porche, hublots, lames de bois), la girouette au fanion,
// un pigeon perché sur la perche du fond et un autre qui picore devant.
// Même langage visuel que les scènes d'élevage et des départs (ombres de
// contact, palette ardoise des pigeons, bois chaud).
// ─────────────────────────────────────────────────────────────────────────────

import { useId } from 'react'

/** Pigeon DEBOUT (profil), tourné vers la gauche : corps, tête, queue, pattes */
function PigeonPerche({
  uid,
  x,
  y,
  scale = 1,
  opacity = 1,
}: {
  uid: string
  x: number
  y: number
  scale?: number
  opacity?: number
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      {/* Queue inclinée vers l'arrière */}
      <path d="M 4.5 -1.8 L 10.5 1.2 L 4.8 2.4 Z" fill="#55636f" />
      {/* Corps */}
      <ellipse cx="0" cy="0" rx="6" ry="4" fill={`url(#pcol-${uid})`} />
      {/* Poitrail clair */}
      <ellipse cx="-2.4" cy="1" rx="3.4" ry="1.8" fill="#c3ccd4" opacity="0.5" />
      {/* Aile pliée */}
      <ellipse cx="1" cy="-0.4" rx="4.4" ry="2.2" fill="#5c6b78" opacity="0.75" transform="rotate(-10 1 -0.4)" />
      {/* Tête */}
      <circle cx="-6.4" cy="-2.8" r="2.7" fill={`url(#pcol-${uid})`} />
      {/* Cou (raccord) */}
      <path d="M -4.6 -3.4 Q -5.6 -1.4 -3.4 -0.6 L -1.4 0.4 L -3.6 1.6 L -5 0.6 Z" fill={`url(#pcol-${uid})`} />
      {/* Bec */}
      <path d="M -8.9 -3.3 L -11.2 -2.7 L -8.9 -2 Z" fill="#e8b93c" />
      {/* Œil */}
      <circle cx="-7" cy="-3.4" r="0.52" fill="#1f2937" />
      {/* Pattes */}
      <g stroke="#c96a4a" strokeWidth="1.1" strokeLinecap="round">
        <path d="M -1.6 3.6 L -1.6 6.6" />
        <path d="M 1.4 3.6 L 1.4 6.6" />
        <path d="M -1.6 6.6 l -1.3 0.4 M -1.6 6.6 l 1 0.6" />
        <path d="M 1.4 6.6 l -1.3 0.4 M 1.4 6.6 l 1 0.6" />
      </g>
    </g>
  )
}

// ─── Scène du colombier : bannière de l'onglet « Colombier » ─────────────────
export function SceneColombier({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '')

  return (
    <svg
      viewBox="0 0 240 96"
      className={className}
      role="img"
      aria-label="Votre colombier — loft au toit teal avec pigeons perchés"
    >
      <defs>
        <linearGradient id={`bois-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b18a5f" />
          <stop offset="100%" stopColor="#7c5a3b" />
        </linearGradient>
        <linearGradient id={`toit-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0a9d8c" />
          <stop offset="100%" stopColor="#01352f" />
        </linearGradient>
        <radialGradient id={`pcol-${uid}`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#aeb9c2" />
          <stop offset="55%" stopColor="#77899a" />
          <stop offset="100%" stopColor="#4d5c69" />
        </radialGradient>
      </defs>

      {/* Ombre de contact au sol */}
      <ellipse cx="122" cy="88" rx="92" ry="4.5" fill="#2e2012" opacity="0.13" />

      {/* Fusées végétales */}
      <ellipse cx="34" cy="85" rx="15" ry="5.5" fill="#cfe0d3" />
      <ellipse cx="28" cy="83.5" rx="8" ry="3.6" fill="#bcd3bf" opacity="0.85" />
      <ellipse cx="208" cy="85" rx="12" ry="5" fill="#cfe0d3" />

      {/* ── Le loft ── */}
      <rect x="78" y="38" width="84" height="46" rx="1.5" fill={`url(#bois-${uid})`} />
      {/* Lames de bois */}
      <g stroke="#936f4a" strokeWidth="1" opacity="0.65">
        <path d="M 78 48 h 84" />
        <path d="M 78 58 h 84" />
        <path d="M 78 68 h 84" />
        <path d="M 78 78 h 84" />
      </g>
      {/* Toit teal signature + débord */}
      <path d="M 70 40 L 120 8 L 170 40 Z" fill={`url(#toit-${uid})`} />
      <path d="M 70 40 L 120 8 L 170 40" fill="none" stroke="#01352f" strokeWidth="1.4" strokeLinejoin="round" opacity="0.85" />
      <path d="M 68 40 h 104" stroke="#5d422b" strokeWidth="2.2" strokeLinecap="round" />
      {/* Fanion-girouette au faîte */}
      <path d="M 120 8 L 120 1" stroke="#5d422b" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M 120 1.5 L 134.5 4.5 L 120 8.5 Z" fill="#0a9d8c" />
      <path d="M 120 1.5 L 134.5 4.5 L 120 8.5" fill="none" stroke="#01352f" strokeWidth="0.9" opacity="0.7" />
      {/* Hublots */}
      <circle cx="96" cy="52" r="5" fill="#eef4f2" stroke="#5d422b" strokeWidth="1.3" />
      <circle cx="144" cy="52" r="5" fill="#eef4f2" stroke="#5d422b" strokeWidth="1.3" />
      {/* Porche ouvert */}
      <path d="M 105 84 v -13 a 15 15 0 0 1 30 0 v 13 z" fill="#2b2119" />
      <path d="M 108.6 84 v -12.4 a 11.4 11.4 0 0 1 22.8 0 v 12.4 z" fill="#171310" opacity="0.82" />
      {/* Un pigeon perché au sommet de l'arche du porche */}
      <PigeonPerche uid={uid} x={120} y={49.3} scale={0.72} />

      {/* ── Perche du fond ── */}
      <rect x="188" y="46" width="3" height="38" rx="1.2" fill="#7c5a3b" />
      <rect x="180" y="43.5" width="19" height="2.8" rx="1.4" fill="#8a6440" />
      <ellipse cx="189.5" cy="85.5" rx="6" ry="1.5" fill="#2e2012" opacity="0.16" />
      {/* Pigeon perché, tourné vers le loft */}
      <PigeonPerche uid={uid} x={190} y={37} scale={0.85} />

      {/* Pigeon qui picore devant le porche */}
      <g transform="translate(52 78) scale(0.8)">
        {/* Corps penché vers l'avant (picorage) */}
        <path d="M -6 -1.6 L 10.8 1.4 L -6 2.6 Z" fill="#55636f" />
        <ellipse cx="0" cy="0" rx="6.2" ry="3.6" fill={`url(#pcol-${uid})`} />
        <ellipse cx="-4.4" cy="-2.6" r="2.6" fill={`url(#pcol-${uid})`} />
        <path d="M -6.8 -3 L -8.9 -2.4 L -6.8 -1.8 Z" fill="#e8b93c" />
        <circle cx="-5.3" cy="-3" r="0.5" fill="#1f2937" />
        <g stroke="#c96a4a" strokeWidth="1" strokeLinecap="round">
          <path d="M -1.4 3.4 L -1.4 5.8" />
          <path d="M 1.6 3.4 L 1.6 5.8" />
        </g>
        {/* Petit caillou picoré */}
        <ellipse cx="-9.6" cy="6" rx="1.6" ry="1" fill="#c4bdaa" />
      </g>
    </svg>
  )
}