'use client'

// ─────────────────────────────────────────────────────────────────────────────
// components/sales/scenes-sorties.tsx — LES TROIS DESTINS du registre des
// départs (SVG pur, aucune image externe), déclinés en scènes racontant
// chaque sortie comme le nid vivant raconte les cycles :
//
//   SceneVente   — le pigeon s'envole du colombier (toit teal, porte ouverte)
//                  vers un nouvel appareil, sur une trajectoire pointillée ;
//                  la pièce dorée au premier plan scelle la transaction.
//   ScenePerte   — le perchoir est vide : la trajectoire pointillée s'effrite
//                  dans les nuages et la silhouette, lointaine, s'estompe.
//   SceneMemoire — nature morte sobre : la plume au sol et la bague restée
//                  posée. L'anneau demeure, l'oiseau s'en va.
//
// Réutilise le langage visuel des scènes d'élevage (ombres de contact au sol,
// gradients doux, ligne d'horizon implicite) avec une palette « pigeon bleu »
// (ardoise bleu-gris) qui complète l'identité teal sans la concurrencer.
// ─────────────────────────────────────────────────────────────────────────────

import { useId } from 'react'
import type { TypeSortie } from '@/types'

// ─── Pigeon en vol (primitives), orienté vers la droite, tête légèrement haut─
function PigeonVol({
  uid,
  x,
  y,
  rot = 0,
  scale = 1,
  opacity = 1,
}: {
  uid: string
  x: number
  y: number
  rot?: number
  scale?: number
  opacity?: number
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`} opacity={opacity}>
      {/* Queue en éventail */}
      <path d="M -12 0.5 L -3.5 -2.8 L -3.5 3.2 Z" fill="#55636f" />
      {/* Corps en fuselage */}
      <ellipse cx="0" cy="0" rx="8" ry="4" fill={`url(#corps-${uid})`} />
      {/* Ventre plus clair */}
      <ellipse cx="1.5" cy="1.4" rx="5.2" ry="2.1" fill="#c3ccd4" opacity="0.55" />
      {/* Aile basse, derrière le corps */}
      <ellipse
        cx="-0.5"
        cy="3"
        rx="5.5"
        ry="2"
        fill="#5c6b78"
        opacity="0.5"
        transform="rotate(16 -0.5 3)"
      />
      {/* Aile haute (battement) */}
      <ellipse
        cx="-2"
        cy="-5.5"
        rx="7.6"
        ry="2.9"
        fill={`url(#aile-${uid})`}
        transform="rotate(-30 -2 -5.5)"
      />
      {/* Tête */}
      <circle cx="8.4" cy="-2.2" r="3.2" fill={`url(#corps-${uid})`} />
      {/* Cou : raccord tête / corps */}
      <path d="M 4.5 -3.4 Q 6.5 -4.6 8.4 -2.2 L 7.4 1.4 Q 5 2.4 3.6 1 Z" fill={`url(#corps-${uid})`} />
      {/* Bec */}
      <path d="M 11.3 -3.1 L 15.2 -1.9 L 11.3 -0.9 Z" fill="#e8b93c" />
      {/* Œil */}
      <circle cx="9.5" cy="-2.9" r="0.62" fill="#1f2937" />
      <circle cx="9.72" cy="-3.1" r="0.18" fill="#ffffff" opacity="0.9" />
    </g>
  )
}

// ─── Scène VENTE : envol vers un nouvel appareil + la recette ────────────────
export function SceneVente({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '')

  return (
    <svg viewBox="0 0 120 64" className={className} role="img" aria-label="Pigeon vendu — envol vers un nouveau colombier">
      <defs>
        <linearGradient id={`bois-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b18a5f" />
          <stop offset="100%" stopColor="#7c5a3b" />
        </linearGradient>
        <linearGradient id={`toit-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0a9d8c" />
          <stop offset="100%" stopColor="#01352f" />
        </linearGradient>
        <radialGradient id={`corps-${uid}`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#aeb9c2" />
          <stop offset="55%" stopColor="#77899a" />
          <stop offset="100%" stopColor="#4d5c69" />
        </radialGradient>
        <linearGradient id={`aile-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#95a3b0" />
          <stop offset="100%" stopColor="#5a6873" />
        </linearGradient>
        <radialGradient id={`or-${uid}`} cx="36%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#ffe9a8" />
          <stop offset="55%" stopColor="#f2c65a" />
          <stop offset="100%" stopColor="#c9922f" />
        </radialGradient>
      </defs>

      {/* Ombre de contact au sol */}
      <ellipse cx="60" cy="57.5" rx="40" ry="4" fill="#2e2012" opacity="0.14" />

      {/* Colombier d'origine */}
      <rect x="8" y="28" width="26" height="24" rx="1.5" fill={`url(#bois-${uid})`} />
      {/* Lames de bois */}
      <g stroke="#936f4a" strokeWidth="1" opacity="0.7">
        <path d="M 8 34 h 26" />
        <path d="M 8 40 h 26" />
        <path d="M 8 46 h 26" />
      </g>
      {/* Toit teal signature */}
      <path d="M 5 29 L 21 14 L 37 29 Z" fill={`url(#toit-${uid})`} />
      <path d="M 5 29 L 21 14 L 37 29" fill="none" stroke="#01352f" strokeWidth="1.2" strokeLinejoin="round" opacity="0.8" />
      {/* Hublot */}
      <circle cx="21" cy="35.5" r="2.6" fill="#eef4f2" stroke="#5d422b" strokeWidth="1.2" />
      {/* Porte ouverte : jour sombre */}
      <path d="M 15 52 v -9 a 6 6 0 0 1 12 0 v 9 z" fill="#2b2119" />
      <path d="M 17.4 52 v -8.6 a 3.6 3.6 0 0 1 7.2 0 v 8.6 z" fill="#171310" opacity="0.8" />

      {/* Trajectoire pointillée vers le nouvel appareil */}
      <path
        d="M 37 24 Q 56 6 76 15"
        fill="none"
        stroke="#3f6b64"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="1.5 4.2"
        opacity="0.75"
      />

      {/* Le pigeon en vol */}
      <PigeonVol uid={uid} x={82} y={17} rot={-9} scale={1.12} />

      {/* La pièce dorée : la recette */}
      <g>
        <ellipse cx="103.5" cy="55.5" rx="8" ry="2" fill="#2e2012" opacity="0.16" />
        <circle cx="103.5" cy="48.5" r="7.6" fill={`url(#or-${uid})`} stroke="#a8791f" strokeWidth="1.1" />
        <circle cx="103.5" cy="48.5" r="5.4" fill="none" stroke="#d9b054" strokeWidth="0.9" opacity="0.9" />
        <text
          x="103.5"
          y="51.6"
          textAnchor="middle"
          fontSize="7.5"
          fontWeight="800"
          fill="#8a611c"
          fontFamily="system-ui, sans-serif"
        >
          €
        </text>
        <ellipse cx="100.8" cy="45.2" rx="2" ry="1.1" fill="#fff6d8" opacity="0.85" />
      </g>
    </svg>
  )
}

// ─── Scène PERTE : perchoir vide, trajectoire qui s'effrite ──────────────────
export function ScenePerte({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '')

  return (
    <svg viewBox="0 0 120 64" className={className} role="img" aria-label="Pigeon perdu — trajectoire interrompue dans le ciel">
      <defs>
        <radialGradient id={`corps-${uid}`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#aeb9c2" />
          <stop offset="55%" stopColor="#77899a" />
          <stop offset="100%" stopColor="#4d5c69" />
        </radialGradient>
        <linearGradient id={`aile-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#95a3b0" />
          <stop offset="100%" stopColor="#5a6873" />
        </linearGradient>
      </defs>

      {/* Ombre de contact au sol */}
      <ellipse cx="60" cy="57.5" rx="40" ry="4" fill="#2e2012" opacity="0.14" />

      {/* Nuages, discrets */}
      <g fill="#e9eef1">
        <ellipse cx="46" cy="15" rx="11" ry="3.6" opacity="0.9" />
        <ellipse cx="57" cy="12" rx="8" ry="2.8" opacity="0.75" />
        <ellipse cx="72" cy="20" rx="9" ry="3" opacity="0.8" />
        <ellipse cx="88" cy="13" rx="7" ry="2.4" opacity="0.6" />
      </g>

      {/* Perchoir vide : le pigeon n'est pas rentré */}
      <rect x="13" y="29" width="2.6" height="23.5" rx="1" fill="#7c5a3b" />
      <rect x="6" y="26.5" width="17" height="2.8" rx="1.4" fill="#8a6440" />
      <ellipse cx="14.5" cy="54" rx="6.5" ry="1.6" fill="#2e2012" opacity="0.2" />
      {/* Petit brin de paille oublié sur la perche */}
      <path d="M 10 26 l 2.6 -1.6" stroke="#c9a97f" strokeWidth="1" strokeLinecap="round" />

      {/* Trajectoire : d'abord sûre, puis elle s'effrite */}
      <path
        d="M 23 24.5 Q 44 6 63 13"
        fill="none"
        stroke="#6b7280"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="1.5 4.2"
        opacity="0.55"
      />
      <path
        d="M 67 14 Q 80 16 92 24"
        fill="none"
        stroke="#6b7280"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="1.5 5"
        opacity="0.28"
      />

      {/* La silhouette, lointaine, qui s'estompe */}
      <PigeonVol uid={uid} x={98} y={26} rot={-7} scale={0.58} opacity={0.72} />
    </svg>
  )
}

// ─── Scène DÉCÈS : la plume et la bague, nature morte sobre ──────────────────
export function SceneMemoire({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '')

  return (
    <svg viewBox="0 0 120 64" className={className} role="img" aria-label="Décès — la plume et la bague restée au sol">
      <defs>
        <linearGradient id={`plume-${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#8fa0ad" />
          <stop offset="55%" stopColor="#b3c1cc" />
          <stop offset="100%" stopColor="#d5dde3" />
        </linearGradient>
        <linearGradient id={`anneau-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9fb8b2" />
          <stop offset="100%" stopColor="#4e6b64" />
        </linearGradient>
      </defs>

      {/* Motte de terre douce */}
      <ellipse cx="60" cy="52" rx="34" ry="6.5" fill="#dfe5df" />
      <ellipse cx="60" cy="51" rx="30" ry="5" fill="#d2dcd4" opacity="0.8" />
      {/* Herbes discrètes */}
      <g stroke="#9db5a0" strokeWidth="1.2" fill="none" strokeLinecap="round">
        <path d="M 32 51 q 1.5 -5 4 -6.5" />
        <path d="M 35 51.5 q 2.5 -3.5 5 -4" />
        <path d="M 86 50.5 q -1.5 -5 -3.5 -6.5" />
      </g>

      {/* Ombre de contact commune */}
      <ellipse cx="59" cy="53" rx="26" ry="3.4" fill="#2e2012" opacity="0.12" />

      {/* La plume, posée en biais */}
      <g transform="translate(47 34) rotate(-32)">
        {/* Vane (fanion de la plume) */}
        <path d="M 0 17 Q -7.2 6 0 -13 Q 7.2 6 0 17 Z" fill={`url(#plume-${uid})`} />
        {/* Barbes découpées : deux encoches sur le bord gauche */}
        <path d="M -4.9 3.2 l 2.2 -1.6 M -6 0.2 l 2.3 -1.4" stroke="#8fa0ad" strokeWidth="0.9" strokeLinecap="round" fill="none" />
        {/* Rachis */}
        <path d="M 0 17 L 0 -13" stroke="#e8edf1" strokeWidth="1.1" strokeLinecap="round" />
        {/* Duvet au bas du rachis */}
        <g stroke="#cfd8de" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.9">
          <path d="M 0 17.5 l -2.6 2.4" />
          <path d="M 0 17.5 l 0.4 3.2" />
          <path d="M 0 17.5 l 2.6 2.2" />
        </g>
        {/* Reflet */}
        <path d="M -1.8 8 Q -3.4 2 -1.6 -6" stroke="#ffffff" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.65" />
      </g>

      {/* La bague restée au sol */}
      <g>
        <ellipse cx="76.5" cy="47.5" rx="10" ry="4" fill="#2e2012" opacity="0.14" />
        {/* Anneau en perspective */}
        <ellipse cx="76.5" cy="45" rx="9" ry="3.8" fill="none" stroke={`url(#anneau-${uid})`} strokeWidth="3.4" />
        {/* Cara (arête du rouleau) */}
        <ellipse cx="76.5" cy="45" rx="9" ry="3.8" fill="none" stroke="#c8dbd6" strokeWidth="0.7" opacity="0.8" />
        {/* Marquage gravé : petites tires sur la face supérieure */}
        <g stroke="#33534c" strokeWidth="0.9" strokeLinecap="round" opacity="0.85">
          <path d="M 71 43.2 l 1 -0.35" />
          <path d="M 73.4 42.6 l 1 -0.3" />
          <path d="M 75.9 42.35 l 1 -0.15" />
          <path d="M 78.4 42.5 l 1 0.1" />
        </g>
        {/* Reflet */}
        <path d="M 69.5 45.6 Q 71 47.3 74 47.8" stroke="#ffffff" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7" />
      </g>
    </svg>
  )
}

// ─── Sélecteur de scène par type de sortie ───────────────────────────────────
export function SceneSortie({
  type,
  className,
}: {
  type: TypeSortie
  className?: string
}) {
  if (type === 'vente') return <SceneVente className={className} />
  if (type === 'perte') return <ScenePerte className={className} />
  return <SceneMemoire className={className} />
}