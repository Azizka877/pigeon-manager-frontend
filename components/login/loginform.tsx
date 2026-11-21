'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { AlertCircle, Feather, Egg, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { setTokenCookie } from '@/lib/auth-cookie'

/* ═══════════════════════════════════════════════════════════
   Décor animé : pigeon photoréaliste qui bat des ailes
   (2 poses alternées) + cages avec vrais pigeons posés
   ═══════════════════════════════════════════════════════════ */

const VOL_A = '/pigeon-vol-a.png'        // ailes vers le haut
const VOL_B = '/pigeon-vol-b.png'        // ailes vers le bas
const VOL_RATIO = 1.225                  // 686 / 560
const PERCHE_SRC = '/pigeon-perche.png'  // pigeon posé dans les cages
const PERCHE_RATIO = 0.989               // 554 / 560
const LOGO_SRC = '/pigeon-logo.jpg'      // portrait dédié du logo (carré, fond teal)

/* ═══════════════════════════════════════════════════════════
   Médaillon logo photoréaliste — utilisé à gauche (hero)
   ET à droite (formulaire) pour un rendu identique partout
   ═══════════════════════════════════════════════════════════ */

function BadgeLogo({ taille = 64, sombre = false }: { taille?: number; sombre?: boolean }) {
  const [src, setSrc] = useState(LOGO_SRC)

  return (
    <div className="relative flex-shrink-0" style={{ width: taille, height: taille }}>
      {/* halo lumineux derrière le médaillon */}
      <div
        className={`absolute -inset-2 rounded-2xl opacity-60 blur-md ${
          sombre
            ? 'bg-gradient-to-br from-emerald-300/60 via-white/25 to-transparent'
            : 'bg-gradient-to-br from-[#00685f] via-emerald-300/70 to-[#01352f]'
        }`}
      />

      {/* médaillon photo */}
      <div
        className={`relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#00685f] to-[#01352f] shadow-lg ring-2 ring-white ${
          sombre ? 'shadow-black/40' : 'shadow-[#00685f]/40'
        }`}
      >
        <img
          src={src}
          alt="PigeonManager"
          draggable={false}
          onError={() => setSrc(PERCHE_SRC)}
          className="h-full w-full object-cover"
        />
        {/* voile teal en bas + reflet vitré en haut */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#01352f]/40 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
      </div>

      {/* pastille plume */}
      <span
        className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center rounded-full bg-white shadow-md ring-1 ring-[#00685f]/30"
        style={{ width: Math.round(taille * 0.36), height: Math.round(taille * 0.36) }}
      >
        <Feather className="text-[#00685f]" style={{ width: taille * 0.18, height: taille * 0.18 }} />
      </span>
    </div>
  )
}

/* Pigeon photoréaliste en vol : les 2 poses alternent (battement d'ailes) */
function PigeonVolant({
  taille = 80,
  haut = '20%',
  duree = 16,
  delai = 0,
  inverse = false,
  opacite = 1,
  flou = 0,
  battement = 0.44,
  phase = 0,
}: {
  taille?: number
  haut?: string
  duree?: number
  delai?: number
  inverse?: boolean
  opacite?: number
  flou?: number
  battement?: number
  phase?: number
}) {
  const hauteur = Math.round(taille * VOL_RATIO)
  return (
    <div
      className={`absolute left-0 ${inverse ? 'pm-vol-inverse' : 'pm-vol'}`}
      style={
        {
          top: haut,
          '--duree': `${duree}s`,
          '--delai': `${delai}s`,
          '--battement': `${battement}s`,
          '--phase': `${phase}s`,
        } as React.CSSProperties
      }
    >
      <div style={{ transform: inverse ? 'scaleX(-1)' : undefined, opacity: opacite }}>
        <div
          className="pm-hochet relative"
          style={{
            width: taille,
            height: hauteur,
            filter: `blur(${flou}px) drop-shadow(0 6px 10px rgba(0, 0, 0, 0.3))`,
          }}
        >
          <Image
            src={VOL_A}
            alt=""
            aria-hidden="true"
            width={taille}
            height={hauteur}
            loading="eager"
            draggable={false}
            className="pm-cadre-a absolute inset-0"
            style={{ objectFit: 'contain' }}
          />
          <Image
            src={VOL_B}
            alt=""
            aria-hidden="true"
            width={taille}
            height={hauteur}
            loading="eager"
            draggable={false}
            className="pm-cadre-b absolute inset-0"
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>
    </div>
  )
}

/* Cage suspendue (le vrai pigeon posé est ajouté par-dessus le perchoir) */
function CageSVG({ largeur }: { largeur: number }) {
  return (
    <svg
      width={largeur}
      height={Math.round((largeur * 170) / 120)}
      viewBox="0 0 120 170"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      {/* chaîne de suspension */}
      <line x1="60" y1="0" x2="60" y2="13" strokeWidth="2" />
      <ellipse cx="60" cy="17" rx="2.8" ry="3.6" />
      <ellipse cx="60" cy="25" rx="2.8" ry="3.6" />
      <circle cx="60" cy="33" r="4" />

      {/* barres du dôme */}
      <path d="M60 37 C34 47 22 76 22 112" />
      <path d="M60 37 C44 49 36 76 36 112" />
      <path d="M60 37 L60 112" />
      <path d="M60 37 C76 49 84 76 84 112" />
      <path d="M60 37 C86 47 98 76 98 112" />

      {/* anneaux horizontaux */}
      <ellipse cx="60" cy="68" rx="23" ry="5.5" opacity="0.8" />
      <ellipse cx="60" cy="90" rx="30" ry="6.5" opacity="0.8" />

      {/* perchoir */}
      <line x1="34" y1="80" x2="86" y2="80" strokeWidth="2" />

      {/* base */}
      <ellipse cx="60" cy="112" rx="38" ry="7" />
      <ellipse cx="60" cy="119" rx="38" ry="7" />
      <line x1="22" y1="112" x2="22" y2="119" />
      <line x1="98" y1="112" x2="98" y2="119" />
      <ellipse cx="60" cy="128" rx="26" ry="5" opacity="0.5" />
    </svg>
  )
}

function CageSuspendue({
  largeur = 150,
  duree = 5,
  delai = 0,
  className = '',
  regardDroite = false,
}: {
  largeur?: number
  duree?: number
  delai?: number
  className?: string
  regardDroite?: boolean
}) {
  const hauteur = Math.round((largeur * 170) / 120)
  const perchoirY = (hauteur * 80) / 170          // ligne du perchoir dans le SVG
  const pLargeur = Math.round(largeur * 0.3)      // pigeon ≈ 30 % de la cage
  const pHauteur = Math.round(pLargeur * PERCHE_RATIO)

  return (
    <div
      className={`pm-cage absolute top-0 ${className}`}
      style={{ '--duree': `${duree}s`, '--delai': `${delai}s` } as React.CSSProperties}
    >
      <CageSVG largeur={largeur} />
      {/* pigeon photoréaliste posé sur le perchoir */}
      <Image
        src={PERCHE_SRC}
        alt=""
        aria-hidden="true"
        width={pLargeur}
        height={pHauteur}
        loading="eager"
        draggable={false}
        className="absolute"
        style={{
          left: largeur * 0.5 - pLargeur * 0.42,
          top: perchoirY - pHauteur + 3,
          objectFit: 'contain',
          transform: regardDroite ? 'scaleX(-1)' : undefined,
          filter: 'drop-shadow(0 3px 4px rgba(0, 0, 0, 0.35))',
        }}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Formulaire de connexion
   ═══════════════════════════════════════════════════════════ */

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)
  const login = useAuthStore((s) => s.login)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const redirect = searchParams.get('redirect') || '/'

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const token = localStorage.getItem('access_token')
      if (token) setTokenCookie(token) // arme le cookie AVANT de naviguer
      router.replace(redirect)
    }
  }, [isAuthenticated, isLoading, router, redirect])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(username, password)
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        err?.message ||
        'Erreur de connexion'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#f0f4f3]">
      {/* ═══ Panneau visuel (desktop) : colombier animé ═══ */}
      <div className="hidden lg:flex relative w-[55%] overflow-hidden bg-gradient-to-br from-[#00685f] via-[#005651] to-[#01352f] text-white">
        {/* lueurs douces */}
        <div className="pm-lueur absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div
          className="pm-lueur absolute -bottom-32 -right-16 w-[28rem] h-[28rem] rounded-full bg-emerald-300/10 blur-3xl"
          style={{ animationDelay: '-3s' }}
        />

        {/* cages suspendues avec pigeons posés */}
        <CageSuspendue largeur={150} duree={5.5} className="left-[2%] text-white/50" regardDroite />
        <CageSuspendue largeur={112} duree={6.5} delai={-2} className="left-[30%] text-white/35" regardDroite />
        <CageSuspendue largeur={170} duree={5} delai={-3.5} className="right-[4%] text-white/60" />

        {/* pigeons photoréalistes en vol (battements désynchronisés) */}
        <PigeonVolant taille={100} haut="14%" duree={15} delai={-3} battement={0.46} />
        <PigeonVolant taille={62} haut="30%" duree={19} delai={-9} opacite={0.8} flou={1.2} battement={0.52} phase={-0.2} />
        <PigeonVolant taille={82} haut="50%" duree={17} delai={-13} inverse flou={0.4} battement={0.4} phase={-0.1} />
        <PigeonVolant taille={46} haut="69%" duree={22} delai={-5} opacite={0.6} flou={2} battement={0.55} phase={-0.3} />
        <PigeonVolant taille={76} haut="38%" duree={14} delai={-7} flou={0.2} battement={0.44} phase={-0.15} />

        {/* message de marque */}
        <div className="relative z-10 m-auto max-w-md px-10 text-center">
          <div className="pm-apparition mb-6 flex justify-center">
            <BadgeLogo taille={72} sombre />
          </div>
          <h1
            className="pm-apparition text-3xl font-semibold tracking-tight"
            style={{ animationDelay: '.1s' }}
          >
            PigeonManager
          </h1>
          <p className="pm-apparition mt-3 text-sm leading-relaxed text-white/70" style={{ animationDelay: '.2s' }}>
            Pigeons, cages, couples, reproductions et ventes —
            tout votre colombier réuni dans un seul endroit.
          </p>

          <div className="pm-apparition mt-10 space-y-4 text-left" style={{ animationDelay: '.35s' }}>
            {[
              { icon: Feather, texte: 'Pedigrees et généalogie complète de vos pigeons' },
              { icon: Egg, texte: 'Suivi des pontes et éclosions avec alertes automatiques' },
              { icon: BarChart3, texte: 'Population, cages et ventes en un coup d’œil' },
            ].map(({ icon: Icon, texte }) => (
              <div key={texte} className="flex items-center gap-3">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/10">
                  <Icon className="h-4 w-4 text-emerald-100" />
                </span>
                <p className="text-sm text-white/80">{texte}</p>
              </div>
            ))}
          </div>

          <p className="pm-apparition mt-12 text-xs text-white/40" style={{ animationDelay: '.5s' }}>
            Conçu pour les colombophiles passionnés.
          </p>
        </div>
      </div>

      {/* ═══ Panneau formulaire ═══ */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="pm-apparition w-full max-w-[420px] overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-sm">
          <div className="h-1 bg-gradient-to-r from-[#00685f] via-emerald-400 to-[#00685f]" />

          <div className="p-8 md:p-10">
            {/* marque (visible aussi sur mobile) — centrée au-dessus du formulaire */}
            <div className="pm-apparition mb-4 flex justify-center">
              <BadgeLogo taille={64} />
            </div>

            {/* erreur */}
            {error && (
              <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* formulaire */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Nom d'utilisateur
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-[#00685f] focus:outline-none focus:ring-2 focus:ring-[#00685f]/20"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mot de passe
                  </label>
                  <Link
                    href="/contact-admin?reason=password"
                    className="text-sm font-medium text-[#00685f] transition-colors hover:text-[#00554d]"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-[#00685f] focus:outline-none focus:ring-2 focus:ring-[#00685f]/20"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#00685f] py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#00554d] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Connexion...
                  </span>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            {/* pied de carte */}
            <div className="mt-6 border-t border-gray-100 pt-5 text-center">
              <p className="text-sm text-gray-500">Accès réservé aux administrateurs</p>
              <Link
                href="/contact-admin?reason=account"
                className="mt-1 inline-block text-xs text-gray-400 transition-colors hover:text-[#00685f]"
              >
                Demander un accès →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}