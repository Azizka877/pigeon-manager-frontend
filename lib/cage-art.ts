// ─────────────────────────────────────────────────────────────────────────────
// lib/cage-art.ts — Générateur de scènes SVG réalistes pour la volière.
// Chaque cage est dessinée en vectoriel : toit à double pente, façade
// grillagée, PORTE visible à l'avant (gonds + loquet + plaque rivetée),
// perchoir en bois, nichoir pour les couples, tiroir de propreté, pigeons
// détaillés posés sur le perchoir. Fonctions pures (aucune dépendance React),
// le résultat est injecté dans un <svg> via dangerouslySetInnerHTML.
// ─────────────────────────────────────────────────────────────────────────────

export type StatutCage = 'libre' | 'seul' | 'couple'

export type TypePigeon = 'photo' | 'dessin'

/** Une photo réelle de pigeon (asset détouré dans public/), avec son orientation naturelle */
export interface PhotoPigeon {
  /** URL de l'image (ex. '/pigeon-perche.png') */
  href: string
  /** Sens du regard SUR LA PHOTO — sert à n'appliquer le miroir que si nécessaire */
  face: 'gauche' | 'droite'
  /** Ratio largeur/hauteur de l'image source (optionnel, défaut 1) */
  ratio?: number
}

export interface CageSceneOptions {
  /** Identifiant unique de la cage — sert à faire varier la couleur et éviter les collisions d'ids SVG */
  uid: string
  /** Numéro affiché sur la plaque rivetée de la porte */
  numero?: string | number
  /** État d'occupation : détermine pigeons, porte, nichoir */
  statut: StatutCage
  /** Sexe du pigeon seul (coloration du dessin de repli) */
  sexeSeul?: 'M' | 'F'
  /** Forcer le pigeon perché sur le faîte du toit (sinon déduit du hash) */
  pigeonSurToit?: boolean
  /** Vraie photo du pigeon seul — si absente, repli sur le dessin vectoriel */
  photoSeul?: PhotoPigeon | null
  /** Vraie photo du mâle du couple (repli : photoFemelle en miroir, sinon dessin) */
  photoMale?: PhotoPigeon | null
  /** Vraie photo de la femelle du couple (repli : photoMale en miroir, sinon dessin) */
  photoFemelle?: PhotoPigeon | null
  /** Vraie photo d'un pigeon en vol, atterrissant sur le faîte */
  photoToit?: PhotoPigeon | null
  /** 'photo' (défaut) : vraies photos quand fournies — 'dessin' : force les pigeons vectoriels */
  typePigeon?: TypePigeon
}

// ── Palette réaliste des cages (métal peint & bois) ─────────────────────────
export const PALETTE_CAGES = [
  { nom: 'craie',      base: '#e8e3d7', toit: '#cfc7b4' },
  { nom: 'anthracite', base: '#4b535e', toit: '#333a44' },
  { nom: 'sauge',      base: '#8ba78f', toit: '#6e8c73' },
  { nom: 'terracotta', base: '#c97d5c', toit: '#a95f42' },
  { nom: 'ardoise',    base: '#6d8aa8', toit: '#54708c' },
  { nom: 'miel',       base: '#c19a6b', toit: '#a37e52' },
  { nom: 'bordeaux',   base: '#96566b', toit: '#7d4457' },
  { nom: 'sable',      base: '#d8c39a', toit: '#bda677' },
] as const

// ── Utilitaires couleur ──────────────────────────────────────────────────────
type RGB = [number, number, number]

function hexVersRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function rgbVersHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

function mixer(hex: string, cible: RGB, t: number): string {
  const [r, g, b] = hexVersRgb(hex)
  return rgbVersHex(
    r + (cible[0] - r) * t,
    g + (cible[1] - g) * t,
    b + (cible[2] - b) * t,
  )
}

const BLANC: RGB = [255, 255, 255]
const NOIR: RGB = [20, 18, 14]

export const eclaircir = (hex: string, t: number) => mixer(hex, BLANC, t)
export const assombrir = (hex: string, t: number) => mixer(hex, NOIR, t)

/** Hash FNV-1a — répartition chaotique des couleurs, stable pour une cage donnée */
function hashString(s: string): number {
  let h = 0x811c9dc5
  for (const c of s) {
    h ^= c.charCodeAt(0)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

export function couleurCage(id: string): (typeof PALETTE_CAGES)[number] {
  return PALETTE_CAGES[hashString(id) % PALETTE_CAGES.length]
}

// ── Teintes du pigeon ────────────────────────────────────────────────────────
interface Plumage {
  corpsHaut: string
  corpsBas: string
  ventre: string
  tete: string
  aile: string
  barre: string
  queue1: string
  queue2: string
  queue3: string
  bec: string
  cire: string
  patte: string
  irise: [string, string]
  iriseOp: number
}

const PLUMAGE_M: Plumage = {
  corpsHaut: '#aab7c5', corpsBas: '#75879a', ventre: '#c7d1db',
  tete: '#93a4b4', aile: '#8799aa', barre: '#303a47',
  queue1: '#5f7082', queue2: '#4c5d6f', queue3: '#3a4b5d',
  bec: '#3d434c', cire: '#eceae4', patte: '#c3493a',
  irise: ['#37c48f', '#7c5cbf'], iriseOp: 0.95,
}

const PLUMAGE_F: Plumage = {
  corpsHaut: '#dabf95', corpsBas: '#b18d5e', ventre: '#e9d6b1',
  tete: '#c9a374', aile: '#c39e6c', barre: '#8a7047',
  queue1: '#a08556', queue2: '#8b7146', queue3: '#76603a',
  bec: '#4d4538', cire: '#f0ece2', patte: '#c25645',
  irise: ['#57b98c', '#9a76c4'], iriseOp: 0.65,
}

// ── Le pigeon, dessiné finement ──────────────────────────────────────────────
// Repère local : pattes posées en (33, 52), face à droite. On place ensuite
// le groupe avec translate/scale ; dir = -1 → miroir (face à gauche).
function dessinerPigeon(uid: string, p: Plumage, suffix: string, delay: string, echelleOpIrise = 1): string {
  const i = (n: string) => `${uid}-${suffix}-${n}`
  return `
  <g class="pm-pigeon-groupe">
   <g class="pm-pigeon-corps" style="animation-delay:${delay}s">
    <!-- queue : 3 plumes en éventail -->
    <path d="M22,36 L4,51 L9,53 L25,41 Z" fill="${p.queue3}"/>
    <path d="M23,33 L6,45 L11,47 L26,37 Z" fill="${p.queue2}"/>
    <path d="M24,30 L9,39 L14,41 L27,33 Z" fill="${p.queue1}"/>
    <!-- corps -->
    <path d="M17,30 C15,19 23,11 33,11 C44,11 51,20 50,31 C49,42 42,48 33,48 C23,48 18,41 17,30 Z"
          fill="url(#${i('corps')})"/>
    <ellipse cx="35" cy="37" rx="11" ry="8.5" fill="${p.ventre}" opacity="0.85"/>
    <!-- cou -->
    <path d="M37,16 C39,12 43,8 47,7 L50.5,13 C45.5,14 41.5,17 39.5,20.5 Z" fill="${p.tete}"/>
    <!-- tête -->
    <circle cx="48" cy="9.5" r="7" fill="url(#${i('tete')})"/>
    <!-- plastron irisé du cou -->
    <path d="M39.5,18 C40.5,11.5 44,6.5 49.5,4.5 C46.5,10 45,13.5 44,19.5 Z"
          fill="url(#${i('irise')})" opacity="${(p.iriseOp * echelleOpIrise).toFixed(2)}"/>
    <ellipse cx="44" cy="12" rx="3" ry="2.5" fill="url(#${i('irise')})" opacity="${(p.iriseOp * 0.55 * echelleOpIrise).toFixed(2)}"/>
    <!-- aile repliée + barres -->
    <path d="M23,21 C28,15 39,15 45,21 C49,26 47,34 41,37 C34,40 25,36 23,29 Z" fill="${p.aile}"/>
    <path d="M25,30 C31,33.5 41,33.5 46,29.5" fill="none" stroke="${p.barre}" stroke-width="2.3" stroke-linecap="round"/>
    <path d="M24,35 C31,38.5 40,38.5 45,34.5" fill="none" stroke="${p.barre}" stroke-width="2.3" stroke-linecap="round"/>
    <path d="M28,20 C33,17.5 39,17.5 43,20" fill="none" stroke="${eclaircir(p.aile, 0.35)}" stroke-width="1" opacity="0.6"/>
    <!-- cire + bec -->
    <ellipse cx="53.5" cy="7.5" rx="2.7" ry="2.3" fill="${p.cire}"/>
    <path d="M55,6.5 L62.5,10 L54.5,11.5 Z" fill="${p.bec}"/>
    <path d="M54.5,11 L59.5,11.6" stroke="${assombrir(p.bec, 0.3)}" stroke-width="0.7" stroke-linecap="round"/>
    <!-- œil : cercle pâle + iris orange + pupille + reflet + paupière animée -->
    <circle cx="49" cy="8.5" r="3.3" fill="${assombrir(p.tete, 0.18)}" opacity="0.4"/>
    <circle cx="49" cy="8.5" r="2.4" fill="#e2823c"/>
    <circle cx="49" cy="8.5" r="1.1" fill="#17130f"/>
    <circle cx="48.4" cy="7.7" r="0.55" fill="#ffffff" opacity="0.9"/>
    <circle class="pm-pigeon-paupiere" cx="49" cy="8.5" r="3" fill="${p.tete}"
            style="animation-delay:${delay}s"/>
    <!-- pattes qui agrippent le perchoir -->
    <g stroke="${p.patte}" stroke-linecap="round" fill="none">
      <path d="M29,44 L28,51.5" stroke-width="1.9"/>
      <path d="M37,45 L38,51.5" stroke-width="1.9"/>
      <path d="M28,51.5 L24.5,53.5 M28,51.5 L28.5,54 M28,51.5 L31,53.5" stroke-width="1.3"/>
      <path d="M38,51.5 L34.5,53.5 M38,51.5 L38.5,54 M38,51.5 L41,53.5" stroke-width="1.3"/>
    </g>
    <!-- defs du plumage -->
    <defs>
      <radialGradient id="${i('corps')}" cx="38%" cy="26%" r="80%">
        <stop offset="0%" stop-color="${eclaircir(p.corpsHaut, 0.22)}"/>
        <stop offset="55%" stop-color="${p.corpsHaut}"/>
        <stop offset="100%" stop-color="${p.corpsBas}"/>
      </radialGradient>
      <radialGradient id="${i('tete')}" cx="35%" cy="30%" r="80%">
        <stop offset="0%" stop-color="${eclaircir(p.tete, 0.25)}"/>
        <stop offset="100%" stop-color="${assombrir(p.tete, 0.12)}"/>
      </radialGradient>
      <linearGradient id="${i('irise')}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${p.irise[0]}"/>
        <stop offset="100%" stop-color="${p.irise[1]}"/>
      </linearGradient>
    </defs>
   </g>
  </g>`
}

/** Place un pigeon : (x,y) = position des pattes, dir = 1 (face droite) / -1 (face gauche) */
function placerPigeon(uid: string, p: Plumage, x: number, y: number, s: number, dir: 1 | -1, suffix: string, delay: string): string {
  const t = `translate(${x},${y}) scale(${dir * s},${s}) translate(-33,-52)`
  return `<g transform="${t}">${dessinerPigeon(uid, p, suffix, delay, dir === -1 ? 0.9 : 1)}</g>`
}

// ── Pigeons en VRAIES PHOTOS (assets du projet, dans public/) ──────────────
/**
 * Place un pigeon photoréaliste sur le perchoir.
 * (x, yPatte) = point où les pattes touchent le perchoir ; h = hauteur rendue ;
 * le flip n'est appliqué que si la direction voulue ≠ direction native de la photo.
 * L'image est ancrée bas (les pattes de la photo touchent le bas du cadre).
 */
function placerPhotoPigeon(photo: PhotoPigeon, x: number, yPatte: number, h: number, dir: 1 | -1, avecOmbre = true): string {
  const ratio = photo.ratio ?? 1
  const w = h * ratio
  const naturelleDroite = photo.face !== 'gauche'
  const flip = naturelleDroite === (dir === 1) ? 1 : -1
  return `<g transform="translate(${x},${yPatte}) scale(${flip},1)">
    <g class="pm-pigeon-groupe">
      ${avecOmbre ? `<ellipse cx="0" cy="${-h * 0.42}" rx="${w * 0.42}" ry="${h * 0.34}" fill="#000" opacity="0.14"/>` : ''}
      <image class="pm-pigeon-corps" href="${photo.href}" x="${-w / 2}" y="${-h}"
             width="${w}" height="${h}" preserveAspectRatio="xMidYMax meet"/>
    </g>
  </g>`
}

/**
 * Pigeon en vol atterrissant sur le faîte du toit.
 * (x, yFaite) = point du faîte où les serres se posent ; le pigeon reste immobile
 * (pas de respiration) mais se penche avec la cage au survol.
 */
function placerPhotoVol(photo: PhotoPigeon, x: number, yFaite: number, h: number, dir: 1 | -1): string {
  const ratio = photo.ratio ?? 0.85
  const w = h * ratio
  const naturelleDroite = photo.face !== 'gauche'
  const flip = naturelleDroite === (dir === 1) ? 1 : -1
  return `<g transform="translate(${x},${yFaite}) scale(${flip},1)">
    <g class="pm-pigeon-groupe">
      <image href="${photo.href}" x="${-w / 2}" y="${-h}"
             width="${w}" height="${h}" preserveAspectRatio="xMidYMax meet"/>
    </g>
  </g>`
}

// ── La scène complète ────────────────────────────────────────────────────────
export function construireSceneCage(o: CageSceneOptions): string {
  const {
    uid,
    numero,
    statut,
    sexeSeul = 'M',
    pigeonSurToit: surToitForce,
    photoSeul,
    photoMale,
    photoFemelle,
    photoToit,
    typePigeon = 'photo',
  } = o
  const pal = couleurCage(uid)
  const h = hashString(uid)

  const cadre = pal.base
  const cadreClair = eclaircir(cadre, 0.3)
  const cadreFonce = assombrir(cadre, 0.28)
  const toitClair = eclaircir(pal.toit, 0.16)
  const toitFonce = assombrir(pal.toit, 0.22)
  const metal = '#aab1b9'
  const metalClair = '#d8dde2'
  const bois = '#a8794f'
  const boisClair = '#c99a68'
  const boisFonce = '#82593a'

  const i = (n: string) => `cg${uid}-${n}`
  const delay1 = `-${((h % 41) / 10).toFixed(1)}`
  const delay2 = `-${((h % 23) / 10 + 1.3).toFixed(1)}`

  const occupee = statut !== 'libre'
  const estCouple = statut === 'couple'
  const surToit = surToitForce ?? (estCouple && h % 3 === 0)

  // Matricules / sexes des pigeons de la scène
  const plumageSeul = sexeSeul === 'F' ? PLUMAGE_F : PLUMAGE_M

  // Barreaux de façade (hors emplacement de la porte x=90..170)
  const xsGauche = [38, 50, 62, 74, 86]
  const xsDroite = [172, 184]
  const barreauxFacade = [...xsGauche, ...xsDroite]
    .map((x) => `
      <line x1="${x}" y1="54" x2="${x}" y2="138" stroke="url(#${i('metalv')})" stroke-width="3" stroke-linecap="round"/>
      <line x1="${x - 0.8}" y1="56" x2="${x - 0.8}" y2="136" stroke="${metalClair}" stroke-width="0.8" opacity="0.55"/>`)
    .join('')

  // Barreaux internes de la porte
  const xsPorte = [100, 112, 124, 136, 148, 160]
  const barreauxPorte = xsPorte
    .map((x) => `<line x1="${x}" y1="62" x2="${x}" y2="134" stroke="url(#${i('metalv')})" stroke-width="2.2" stroke-linecap="round" opacity="0.95"/>`)
    .join('')

  // Pigeons du perchoir : vraies photos fournies par le composant (banque
  // lib/pigeon-cage-images.ts), repli sur le dessin vectoriel si absentes.
  let pigeons = ''
  let ombresPerchoir = ''
  if (statut === 'seul') {
    ombresPerchoir = `<ellipse cx="130" cy="141" rx="15" ry="3" fill="#000" opacity="0.14"/>`
    pigeons =
      typePigeon === 'photo' && photoSeul
        ? placerPhotoPigeon(photoSeul, 130, 118, 48, 1)
        : placerPigeon(uid, plumageSeul, 130, 114, 0.95, 1, 's1', delay1)
  } else if (estCouple) {
    ombresPerchoir = `<ellipse cx="104" cy="141" rx="13" ry="2.6" fill="#000" opacity="0.13"/><ellipse cx="148" cy="141" rx="14" ry="2.8" fill="#000" opacity="0.13"/>`
    const photoF = photoFemelle ?? photoMale
    const photoM = photoMale ?? photoFemelle
    if (typePigeon === 'photo' && (photoF || photoM)) {
      // Face-à-face : la femelle regarde à droite, le mâle à gauche.
      // Si une seule photo est fournie, elle sert pour les deux (en miroir).
      pigeons =
        (photoF
          ? placerPhotoPigeon(photoF, 104, 118, 44, 1)
          : placerPigeon(uid, PLUMAGE_F, 104, 114, 0.88, 1, 'f', delay2)) +
        (photoM
          ? placerPhotoPigeon(photoM, 148, 118, 46, -1)
          : placerPigeon(uid, PLUMAGE_M, 148, 114, 0.95, -1, 'm', delay1))
    } else {
      pigeons =
        placerPigeon(uid, PLUMAGE_F, 104, 114, 0.88, 1, 'f', delay2) +
        placerPigeon(uid, PLUMAGE_M, 148, 114, 0.95, -1, 'm', delay1)
    }
  }

  // Pigeon en vol atterrissant sur le faîte du toit
  const pigeonFaite = !surToit
    ? ''
    : typePigeon === 'photo' && photoToit
      ? placerPhotoVol(photoToit, 110, 12, 30, -1)
      : placerPigeon(uid, PLUMAGE_M, 110, 10.5, 0.42, -1, 'toit', delay2)

  // Le nichoir (couples) : caisse en bois avec trou rond, suspendue au fond gauche
  const nichoir = estCouple
    ? `
    <g>
      <rect x="42" y="70" width="32" height="28" rx="2" fill="${bois}"/>
      <rect x="42" y="70" width="32" height="8" rx="2" fill="${boisClair}"/>
      <line x1="42" y1="88" x2="74" y2="88" stroke="${boisFonce}" stroke-width="1" opacity="0.7"/>
      <circle cx="58" cy="85" r="6" fill="#241a12"/>
      <circle cx="58" cy="85" r="6" fill="none" stroke="${boisFonce}" stroke-width="1.6"/>
      <line x1="46" y1="70" x2="46" y2="67.5" stroke="${metal}" stroke-width="1.4"/>
      <line x1="70" y1="70" x2="70" y2="67.5" stroke="${metal}" stroke-width="1.4"/>
    </g>`
    : ''

  // Paille au sol
  const paille = `
    <rect x="35" y="124" width="150" height="15" fill="#c8a35c"/>
    <rect x="35" y="124" width="150" height="3.5" fill="#dab877"/>
    <g stroke="#a5844a" stroke-width="1" opacity="0.75" stroke-linecap="round">
      <path d="M44,133 L52,130"/><path d="M62,136 L70,132"/><path d="M84,134 L92,131"/>
      <path d="M104,136 L112,133"/><path d="M126,134 L134,131"/><path d="M146,136 L154,132"/>
      <path d="M166,134 L174,131"/><path d="M56,130 L63,128"/><path d="M118,131 L125,129"/>
    </g>`

  return `
  <defs>
    <linearGradient id="${i('metalv')}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${metalClair}"/>
      <stop offset="45%" stop-color="${metal}"/>
      <stop offset="100%" stop-color="#7c848d"/>
    </linearGradient>
    <linearGradient id="${i('cadre')}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${eclaircir(cadre, 0.18)}"/>
      <stop offset="100%" stop-color="${cadreFonce}"/>
    </linearGradient>
    <linearGradient id="${i('interieur')}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3f3227"/>
      <stop offset="70%" stop-color="#59452f"/>
      <stop offset="100%" stop-color="#6b543e"/>
    </linearGradient>
    <radialGradient id="${i('vignette')}" cx="50%" cy="42%" r="72%">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.34"/>
    </radialGradient>
    <radialGradient id="${i('ombre')}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="${i('laiton')}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e6c583"/>
      <stop offset="100%" stop-color="#c09a52"/>
    </linearGradient>
    <pattern id="${i('grillage')}" width="7" height="7" patternUnits="userSpaceOnUse">
      <path d="M0,3.5 H7 M3.5,0 V7" stroke="#e8e2d6" stroke-width="0.7" opacity="0.16"/>
    </pattern>
  </defs>

  <!-- ombre portée au sol -->
  <ellipse cx="110" cy="174" rx="80" ry="8" fill="url(#${i('ombre')})"/>

  <!-- toit double pente -->
  <polygon points="110,12 18,48 110,48" fill="${toitClair}"/>
  <polygon points="110,12 202,48 110,48" fill="${toitFonce}"/>
  <g stroke="${assombrir(pal.toit, 0.3)}" stroke-width="1.1" opacity="0.3">
    <path d="M92,20 58,48"/><path d="M76,27 40,48"/><path d="M60,34 26,48"/>
    <path d="M128,20 162,48"/><path d="M144,27 180,48"/><path d="M160,34 194,48"/>
  </g>
  <rect x="103" y="9" width="14" height="6" rx="2.5" fill="${toitFonce}"/>
  <rect x="104" y="9.8" width="12" height="2" rx="1" fill="${eclaircir(pal.toit, 0.3)}"/>

  <!-- fascia sous le toit -->
  <rect x="26" y="46" width="168" height="8" rx="2" fill="${eclaircir(cadre, 0.08)}"/>
  <line x1="26" y1="54" x2="194" y2="54" stroke="${cadreFonce}" stroke-width="1.4"/>

  <!-- corps de cage -->
  <rect x="26" y="54" width="168" height="98" rx="6" fill="url(#${i('cadre')})" stroke="${cadreFonce}" stroke-width="1.6"/>
  <rect x="35" y="58" width="150" height="88" rx="3" fill="url(#${i('interieur')})"/>
  <rect x="35" y="58" width="150" height="88" fill="url(#${i('grillage')})"/>
  ${paille}
  ${nichoir}

  <!-- perchoir en bois -->
  <line x1="60" y1="116.5" x2="36" y2="116.5" stroke="${boisFonce}" stroke-width="3"/>
  <line x1="160" y1="116.5" x2="184" y2="116.5" stroke="${boisFonce}" stroke-width="3"/>
  <rect x="56" y="114" width="108" height="5" rx="2.5" fill="${bois}"/>
  <rect x="56" y="114" width="108" height="1.8" rx="0.9" fill="${boisClair}"/>

  <!-- abreuvoir accroché au barreau droit -->
  <g>
    <line x1="178" y1="118" x2="178" y2="122" stroke="#7c848d" stroke-width="1.4"/>
    <path d="M171,122 L185,122 L183,131 L173,131 Z" fill="${metal}" stroke="#7c848d" stroke-width="1"/>
    <ellipse cx="178" cy="122" rx="6.5" ry="1.9" fill="#cfe3ea" opacity="0.9"/>
  </g>

  ${ombresPerchoir}
  ${pigeons}

  <!-- embrasure de la porte (profondeur) -->
  <rect x="90" y="60" width="80" height="76" rx="3" fill="#000" opacity="0.16"/>

  <!-- ══ PORTE visible à l'avant ══ -->
  <circle cx="88" cy="66" r="2.8" fill="url(#${i('metalv')})"/>
  <circle cx="88" cy="130" r="2.8" fill="url(#${i('metalv')})"/>
  <g class="pm-porte ${occupee ? 'pm-porte-ouverte' : ''}">
    <rect x="90" y="60" width="80" height="76" rx="3" fill="#000" opacity="0.1"/>
    <rect x="90" y="60" width="80" height="76" rx="3" fill="none" stroke="${cadreClair}" stroke-width="5"/>
    <rect x="90" y="60" width="80" height="76" rx="3" fill="none" stroke="${cadreFonce}" stroke-width="1.2"/>
    ${barreauxPorte}
    <!-- plaque rivetée avec le numéro (bas de porte, comme une plaque d'élevage) -->
    <g>
      <rect x="108" y="119" width="44" height="14" rx="3" fill="url(#${i('laiton')})" stroke="#9a7a3e" stroke-width="1"/>
      <circle cx="112" cy="126" r="1.4" fill="#8a6a32"/>
      <circle cx="148" cy="126" r="1.4" fill="#8a6a32"/>
      ${numero !== undefined && numero !== '' ? `<text x="130" y="130.5" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif" font-size="9.5" font-weight="700" fill="#4a3a20">${numero}</text>` : ''}
    </g>
    <!-- loquet -->
    <g>
      <rect x="164" y="92" width="7" height="15" rx="2.5" fill="url(#${i('metalv')})" stroke="#7c848d" stroke-width="0.8"/>
      <rect x="168" y="96" width="10" height="4.5" rx="2.2" fill="${metalClair}" stroke="#7c848d" stroke-width="0.8"/>
    </g>
  </g>

  <!-- barreaux de façade + barres traversantes -->
  ${barreauxFacade}
  <line x1="35" y1="62.5" x2="185" y2="62.5" stroke="url(#${i('metalv')})" stroke-width="2.4" opacity="0.8"/>
  <line x1="35" y1="140" x2="185" y2="140" stroke="url(#${i('metalv')})" stroke-width="2.4" opacity="0.8"/>

  <!-- reflet de lumière -->
  <polygon points="40,58 88,58 52,146 35,146" fill="#ffffff" opacity="0.06"/>

  <!-- vignette intérieure -->
  <rect x="35" y="58" width="150" height="88" rx="3" fill="url(#${i('vignette')})"/>

  <!-- tiroir de propreté + pieds -->
  <line x1="44" y1="152" x2="44" y2="163" stroke="#3d4148" stroke-width="2"/>
  <line x1="176" y1="152" x2="176" y2="163" stroke="#3d4148" stroke-width="2"/>
  <rect x="44" y="152" width="132" height="11" rx="2.5" fill="${assombrir(cadre, 0.12)}" stroke="${cadreFonce}" stroke-width="1"/>
  <rect x="99" y="155.5" width="22" height="4" rx="2" fill="${metal}" stroke="#7c848d" stroke-width="0.7"/>
  <rect x="52" y="163" width="11" height="8" rx="1.5" fill="#3d4148"/>
  <rect x="157" y="163" width="11" height="8" rx="1.5" fill="#3d4148"/>

  ${pigeonFaite}`
}