'use client'

// ─────────────────────────────────────────────────────────────────────────────
// app/(dashboard)/profile/page.tsx — PROFIL & PARAMÈTRES, design
// ultra-moderne réaliste cohérent avec les registres : HERO D'IDENTITÉ en
// dégradé signature (initiales, @username, e-mail, ancienneté, filigrane de
// pigeon en vol), onglets en pilules segmentées, bannière PHOTO RÉALISTE du
// colombier (public/colombier-banniere.jpg — la scène SVG dessinée faisait
// « icône » à côté des vraies photos de pigeons, elle est remplacée par un
// vrai loft au toit teal avec légendes pilotées par les données réelles :
// nom du colombier, ville/pays, GPS), jauge de force de mot de passe
// RÉELLEMENT calculée,
// factures avec statuts traduits et € formatés, notifications PERSISTÉES en
// localStorage (l'ancienne version les perdait au rechargement).
// Corrige au passage : le faux plan « Master Breeder » inventé quand l'API de
// facturation n'existe pas (état vide honnête à la place), le bouton Maps
// inerte (ouvre désormais Google Maps), le pays limité à 5 choix (option
// « Autre » en saisie libre), le type User aligné sur le sérialiseur réel.
// Logique métier inchangée : les mêmes 8 hooks de use-auth.ts, mêmes
// validations (8 caractères, confirmation), même confirmation de suppression
// par saisie du nom d'utilisateur.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  useAuth,
  useUpdateProfile,
  useChangePassword,
  useDeleteAccount,
  useColombierConfig,
  useUpdateColombier,
  useBillingPlan,
  useBillingInvoices,
} from '@/hooks/use-auth'
import {
  Building2,
  Check,
  Crosshair,
  CreditCard,
  ExternalLink,
  Eye,
  EyeOff,
  FileDown,
  FileText,
  Lock,
  MapPin,
  Save,
  ShieldAlert,
  ShieldCheck,
  User,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDateLong, joursEntre } from '@/lib/cycles'
import type { Invoice } from '@/types'

type Onglet = 'profil' | 'colombier' | 'securite' | 'facturation'

const ONGLETS: Array<{ key: Onglet; label: string; icone: React.ComponentType<{ className?: string }> }> = [
  { key: 'profil', label: 'Profil', icone: User },
  { key: 'colombier', label: 'Colombier', icone: Building2 },
  { key: 'securite', label: 'Sécurité', icone: Lock },
  { key: 'facturation', label: 'Facturation', icone: CreditCard },
]

const PAYS_FIXES: Array<{ valeur: string; label: string }> = [
  { valeur: 'Netherlands', label: 'Pays-Bas' },
  { valeur: 'Belgium', label: 'Belgique' },
  { valeur: 'France', label: 'France' },
  { valeur: 'Germany', label: 'Allemagne' },
  { valeur: 'Senegal', label: 'Sénégal' },
]
const AUTRE_PAYS = '__autre__'

const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

const STATUT_FACTURE: Record<Invoice['statut'], { label: string; classe: string }> = {
  payee: { label: 'Payée', classe: 'bg-[#eef7f5] text-[#00685f] ring-1 ring-[#bfe3dc]' },
  en_attente: { label: 'En attente', classe: 'bg-[#fff4e5] text-[#b45309] ring-1 ring-[#fde3bd]' },
  annulee: { label: 'Annulée', classe: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200' },
}

/** « aujourd'hui », « hier », « il y a N jours » (dates de connexion) */
function ilYa(date: string): string {
  const j = Math.max(joursEntre(date), 0)
  if (j === 0) return "aujourd'hui"
  if (j === 1) return 'hier'
  return `il y a ${j} jours`
}

/** Initiales pour l'avatar : prénom + nom, sinon 2 lettres du username */
function initialesDe(user: { first_name: string; last_name: string; username: string }): string {
  const deux = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.trim()
  if (deux.length === 2) return deux.toUpperCase()
  return user.username.slice(0, 2).toUpperCase()
}

/** Force du mot de passe : longueur, casse mixte, chiffres, spéciaux (0→4) */
function forceMotDePasse(mdp: string): { niveau: number; label: string; classe: string } {
  let points = 0
  if (mdp.length >= 8) points++
  if (mdp.length >= 12) points++
  if (/[a-z]/.test(mdp) && /[A-Z]/.test(mdp)) points++
  if (/\d/.test(mdp)) points++
  if (/[^A-Za-z0-9]/.test(mdp)) points++
  const niveau = Math.min(points, 4)
  const meta = [
    { label: 'Trop court', classe: 'bg-gray-200' },
    { label: 'Faible', classe: 'bg-red-400' },
    { label: 'Correct', classe: 'bg-[#d97706]' },
    { label: 'Bon', classe: 'bg-[#0a9d8c]' },
    { label: 'Excellent', classe: 'bg-[#00685f]' },
  ] as const
  return { niveau, label: meta[niveau].label, classe: meta[niveau].classe }
}

interface PreferencesNotification {
  alertesReproduction: boolean
  resumeHebdo: boolean
}
const CLE_NOTIFICATIONS = 'pigeonmanager.notifications'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const updateProfile = useUpdateProfile()
  const changePassword = useChangePassword()
  const deleteAccount = useDeleteAccount()
  const { data: colombierConfig, isLoading: colombierLoading } = useColombierConfig()
  const updateColombier = useUpdateColombier()
  const { data: plan, isLoading: planLoading } = useBillingPlan()
  const { data: invoicesData } = useBillingInvoices()

  const [activeTab, setActiveTab] = useState<Onglet>('profil')

  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    nomColombier: '',
    pays: 'Netherlands',
    ville: '',
    gps: '',
  })

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [notifications, setNotifications] = useState<PreferencesNotification>({
    alertesReproduction: true,
    resumeHebdo: false,
  })
  const [prefsChargees, setPrefsChargees] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState('')

  // Synchroniser avec les données API
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        prenom: user.first_name || '',
        nom: user.last_name || '',
        email: user.email || '',
      }))
    }
  }, [user])

  useEffect(() => {
    if (colombierConfig) {
      setFormData((prev) => ({
        ...prev,
        nomColombier: colombierConfig.nom || '',
        pays: colombierConfig.pays || 'Netherlands',
        ville: colombierConfig.ville || '',
        gps: colombierConfig.gps || '',
      }))
    }
  }, [colombierConfig])

  // Notifications : hydratation depuis localStorage, puis persistance à chaque
  // changement — l'ancienne version les oubliait au moindre rechargement.
  useEffect(() => {
    try {
      const brut = window.localStorage.getItem(CLE_NOTIFICATIONS)
      if (brut) {
        const lu = JSON.parse(brut) as PreferencesNotification
        setNotifications({
          alertesReproduction: !!lu.alertesReproduction,
          resumeHebdo: !!lu.resumeHebdo,
        })
      }
    } catch {
      /* stockage indisponible : on garde les valeurs par défaut */
    }
    setPrefsChargees(true)
  }, [])

  useEffect(() => {
    if (!prefsChargees) return
    try {
      window.localStorage.setItem(CLE_NOTIFICATIONS, JSON.stringify(notifications))
    } catch {
      /* stockage indisponible : préférences volatiles */
    }
  }, [notifications, prefsChargees])

  const handleSavePersonal = () => {
    updateProfile.mutate({
      first_name: formData.prenom,
      last_name: formData.nom,
    }, {
      onSuccess: () => toast.success('Profil mis à jour'),
    })
  }

  const handleSaveLoft = () => {
    updateColombier.mutate({
      nom: formData.nomColombier,
      pays: formData.pays,
      ville: formData.ville,
      gps: formData.gps || null,
    }, {
      onSuccess: () => toast.success('Colombier mis à jour'),
    })
  }

  const handleChangePassword = () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    if (passwordData.new_password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }
    changePassword.mutate(
      {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      },
      {
        onSuccess: () => {
          setPasswordData({ old_password: '', new_password: '', confirm_password: '' })
          toast.success('Mot de passe changé avec succès')
        },
      },
    )
  }

  const handleDeleteAccount = () => {
    if (deleteConfirm !== user?.username) {
      toast.error("Veuillez taper votre nom d'utilisateur pour confirmer")
      return
    }
    deleteAccount.mutate(undefined, {
      onSuccess: () => {
        toast.success('Compte supprimé — toutes vos données ont été effacées')
        window.location.href = '/login'
      },
    })
  }

  /** Ouvre Google Maps sur les coordonnées saisies, sinon sur la ville/pays */
  const ouvrirDansMaps = () => {
    const requete = formData.gps.trim() || [formData.ville.trim(), formData.pays].filter(Boolean).join(', ')
    if (!requete) {
      toast.error("Renseignez d'abord une ville ou des coordonnées GPS")
      return
    }
    window.open(`https://www.google.com/maps?q=${encodeURIComponent(requete)}`, '_blank', 'noopener')
  }

  // Pays : les 5 valeurs fixes du sélecteur, sinon saisie libre (« Autre »)
  const paysPersonnalise = useMemo(
    () => formData.pays !== '' && !PAYS_FIXES.some((p) => p.valeur === formData.pays),
    [formData.pays],
  )

  const force = forceMotDePasse(passwordData.new_password)

  if (authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#00685f]" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[#b9d8d0] bg-[#f5faf8]">
          <User className="h-7 w-7 text-[#8fb8ae]" />
        </span>
        <p className="text-on-surface-variant">Session expirée. Veuillez vous reconnecter.</p>
        <Button
          onClick={() => router.push('/login')}
          className="rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-lg shadow-teal-900/25"
        >
          Se connecter
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── En-tête ── */}
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00685f] to-[#01352f] text-white shadow-md shadow-teal-900/25">
          <User className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-on-surface sm:text-3xl">Profil &amp; Paramètres</h1>
          <p className="mt-0.5 text-sm text-on-surface-variant">
            Votre identité, votre colombier et vos préférences — le poste de commandement de l&apos;appareil.
          </p>
        </div>
      </div>

      {/* ── Hero d'identité : dégradé signature + filigrane ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#00685f] via-[#005651] to-[#01352f] p-6 text-white shadow-lg shadow-teal-900/25">
        {/* Filigrane : trajectoire + pigeon en vol */}
        <svg
          viewBox="0 0 200 100"
          className="pointer-events-none absolute -right-2 top-0 h-full w-64 opacity-[0.16]"
          aria-hidden="true"
        >
          <path
            d="M 10 78 Q 80 30 160 22"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeDasharray="1.5 5"
            strokeLinecap="round"
          />
          <g transform="translate(170 20) scale(1.15)">
            <ellipse cx="0" cy="0" rx="8" ry="4" fill="#ffffff" />
            <ellipse cx="-2" cy="-5.5" rx="7.6" ry="2.9" fill="#ffffff" transform="rotate(-30 -2 -5.5)" />
            <circle cx="8.4" cy="-2.2" r="3.2" fill="#ffffff" />
            <path d="M -12 0.5 L -3.5 -2.8 L -3.5 3.2 Z" fill="#ffffff" />
            <path d="M 11.3 -3.1 L 15.2 -1.9 L 11.3 -0.9 Z" fill="#ffffff" />
          </g>
        </svg>

        <div className="relative flex flex-wrap items-center gap-5">
          {/* Avatar initiales */}
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-extrabold ring-2 ring-white/30">
            {initialesDe(user)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-extrabold">
                {user.first_name || user.last_name
                  ? `${user.first_name} ${user.last_name}`.trim()
                  : user.username}
              </h2>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 font-mono text-xs font-semibold ring-1 ring-white/25">
                @{user.username}
              </span>
              {user.is_staff && (
                <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-[#00685f]">
                  Administrateur
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-sm text-white/80">{user.email}</p>
            <p className="mt-1 text-xs text-white/65">
              {user.date_joined ? `Membre depuis le ${formatDateLong(user.date_joined)}` : 'Colombophile'}
              {user.last_login ? ` · Dernière connexion ${ilYa(user.last_login)}` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* ── Onglets en pilules segmentées ── */}
      <div className="flex max-w-full gap-1 self-start overflow-x-auto rounded-2xl border border-outline-variant bg-surface-container p-1">
        {ONGLETS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all',
              activeTab === t.key
                ? 'bg-[#00685f] text-white shadow-sm shadow-teal-900/20'
                : 'text-on-surface-variant hover:text-on-surface',
            )}
          >
            <t.icone className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Contenu : 2/3 onglet actif + 1/3 compte & préférences ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* ══ ONGLET PROFIL ══ */}
          {activeTab === 'profil' && (
            <Card className="rounded-3xl border-outline-variant p-6">
              <div className="mb-5 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef7f5] text-[#00685f]">
                  <User className="h-4 w-4" />
                </span>
                <h2 className="text-[15px] font-extrabold text-on-surface">Informations personnelles</h2>
              </div>

              <div className="mb-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="prenom" className="text-[13px]">
                    Prénom
                  </Label>
                  <Input
                    id="prenom"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    placeholder="Votre prénom"
                    className="rounded-xl border-outline-variant bg-surface-container text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom" className="text-[13px]">
                    Nom
                  </Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Votre nom"
                    className="rounded-xl border-outline-variant bg-surface-container text-sm"
                  />
                </div>
              </div>

              <div className="mb-4 space-y-2">
                <Label htmlFor="email" className="text-[13px]">
                  Adresse e-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="rounded-xl border-outline-variant bg-surface-container text-sm text-on-surface-variant"
                />
                <p className="text-[11.5px] text-on-surface-variant">
                  Contactez le support pour modifier votre adresse e-mail.
                </p>
              </div>

              <div className="mb-5 flex items-center gap-2 rounded-2xl border border-outline-variant bg-surface-container px-4 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef7f5] font-mono text-[13px] font-bold text-[#00685f]">
                  @
                </span>
                <span className="min-w-0">
                  <span className="block font-mono text-[13px] font-bold text-on-surface">{user.username}</span>
                  <span className="block text-[11px] text-on-surface-variant">
                    Identifiant de connexion — non modifiable
                  </span>
                </span>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSavePersonal}
                  disabled={updateProfile.isPending}
                  className="gap-2 rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-lg shadow-teal-900/25"
                >
                  {updateProfile.isPending ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Enregistrer les modifications
                </Button>
              </div>
            </Card>
          )}

          {/* ══ ONGLET COLOMBIER ══ */}
          {activeTab === 'colombier' && (
            <Card className="overflow-hidden rounded-3xl border-outline-variant">
              {/* Bannière : PHOTO du colombier (loft bois, toit teal, pigeons réels).
                  Le dégradé de fond sert de repli si l'image n'est pas servie. */}
              <div className="relative h-44 bg-gradient-to-b from-[#eaf4f1] to-white sm:h-52">
                <img
                  src="/colombier-banniere.jpg"
                  alt="Le colombier — loft en bois au toit teal, pigeons sur la planche d'envol"
                  className="absolute inset-0 h-full w-full object-cover object-[50%_55%]"
                />
                {/* Voile de lisibilité en haut + fondu vers la carte de configuration */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/95 to-transparent" />

                {/* Légende surimpressionnée, pilotée par les données réelles */}
                <div className="absolute left-4 top-3.5 z-10 sm:left-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/85 drop-shadow">
                    Votre appareil
                  </p>
                  <p className="mt-0.5 max-w-[70%] truncate text-lg font-extrabold text-white drop-shadow sm:text-xl">
                    {formData.nomColombier || 'Mon colombier'}
                  </p>
                </div>
                {(formData.ville || formData.pays || formData.gps) && (
                  <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-1.5 sm:left-6">
                    {(formData.ville || formData.pays) && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1 text-[11px] font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm">
                        <MapPin className="h-3 w-3" />
                        {[formData.ville, formData.pays].filter(Boolean).join(', ')}
                      </span>
                    )}
                    {formData.gps && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1 font-mono text-[11px] font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm">
                        <Crosshair className="h-3 w-3" />
                        {formData.gps}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="mb-5 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef7f5] text-[#00685f]">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <h2 className="text-[15px] font-extrabold text-on-surface">Configuration du colombier</h2>
                </div>

                {colombierLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="h-9 w-9 animate-spin rounded-full border-b-2 border-[#00685f]" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nomColombier" className="text-[13px]">
                          Nom du colombier
                        </Label>
                        <Input
                          id="nomColombier"
                          value={formData.nomColombier}
                          onChange={(e) => setFormData({ ...formData, nomColombier: e.target.value })}
                          className="rounded-xl border-outline-variant bg-surface-container text-sm"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="pays" className="text-[13px]">
                            Pays
                          </Label>
                          <select
                            id="pays"
                            className="h-10 w-full rounded-xl border border-outline-variant bg-surface-container px-3 text-sm"
                            value={paysPersonnalise ? AUTRE_PAYS : formData.pays}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                pays: e.target.value === AUTRE_PAYS ? '' : e.target.value,
                              })
                            }
                          >
                            {PAYS_FIXES.map((p) => (
                              <option key={p.valeur} value={p.valeur}>
                                {p.label}
                              </option>
                            ))}
                            <option value={AUTRE_PAYS}>Autre (saisie libre)…</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ville" className="text-[13px]">
                            Ville / Région
                          </Label>
                          <Input
                            id="ville"
                            value={formData.ville}
                            onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                            className="rounded-xl border-outline-variant bg-surface-container text-sm"
                          />
                        </div>
                      </div>

                      {paysPersonnalise && (
                        <div className="space-y-2">
                          <Label htmlFor="pays-libre" className="text-[13px]">
                            Nom du pays
                          </Label>
                          <Input
                            id="pays-libre"
                            value={formData.pays}
                            onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
                            placeholder="ex. Maroc, Luxembourg…"
                            className="rounded-xl border-outline-variant bg-surface-container text-sm"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="gps" className="text-[13px]">
                          Coordonnées GPS (optionnel)
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="gps"
                            placeholder="ex. 52.3676° N, 4.9041° E"
                            value={formData.gps}
                            onChange={(e) => setFormData({ ...formData, gps: e.target.value })}
                            className="flex-1 rounded-xl border-outline-variant bg-surface-container text-sm"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={ouvrirDansMaps}
                            className="shrink-0 gap-1.5 rounded-xl border-outline-variant text-[13px]"
                            title="Ouvrir la position dans Google Maps"
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-[#00685f]" />
                            Maps
                          </Button>
                        </div>
                        <p className="flex items-center gap-1 text-[11px] text-on-surface-variant">
                          <MapPin className="h-3 w-3" />
                          Utile pour situer l&apos;appareil sur une carte — le bouton ouvre la position dans Google Maps.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={handleSaveLoft}
                        disabled={updateColombier.isPending}
                        className="gap-2 rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-lg shadow-teal-900/25"
                      >
                        {updateColombier.isPending ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Mettre à jour le colombier
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          )}

          {/* ══ ONGLET SÉCURITÉ ══ */}
          {activeTab === 'securite' && (
            <div className="space-y-6">
              <Card className="rounded-3xl border-outline-variant p-6">
                <div className="mb-5 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef7f5] text-[#00685f]">
                    <Lock className="h-4 w-4" />
                  </span>
                  <h2 className="text-[15px] font-extrabold text-on-surface">Changer le mot de passe</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="old_password" className="text-[13px]">
                      Mot de passe actuel
                    </Label>
                    <div className="relative">
                      <Input
                        id="old_password"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.old_password}
                        onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                        placeholder="••••••••"
                        className="rounded-xl border-outline-variant bg-surface-container text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password" className="text-[13px]">
                      Nouveau mot de passe
                    </Label>
                    <div className="relative">
                      <Input
                        id="new_password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        placeholder="Minimum 8 caractères"
                        className="rounded-xl border-outline-variant bg-surface-container text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                        aria-label={showNewPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Jauge de force : longueur, casse mixte, chiffres, spéciaux */}
                    {passwordData.new_password.length > 0 && (
                      <div className="pt-1">
                        <div className="flex gap-1.5">
                          {[0, 1, 2, 3].map((i) => (
                            <span
                              key={i}
                              className={cn(
                                'h-1.5 flex-1 rounded-full transition-colors',
                                i < force.niveau ? force.classe : 'bg-gray-200',
                              )}
                            />
                          ))}
                        </div>
                        <p className="mt-1.5 text-[11.5px] font-semibold text-on-surface-variant">
                          Force : <span className="text-on-surface">{force.label}</span>
                          {force.niveau < 2 && ' — ajoutez majuscules, chiffres ou caractères spéciaux'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password" className="text-[13px]">
                      Confirmer le mot de passe
                    </Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      placeholder="••••••••"
                      className="rounded-xl border-outline-variant bg-surface-container text-sm"
                    />
                    {passwordData.confirm_password.length > 0 && (
                      <p
                        className={cn(
                          'text-[11.5px] font-semibold',
                          passwordData.confirm_password === passwordData.new_password
                            ? 'text-[#00685f]'
                            : 'text-red-600',
                        )}
                      >
                        {passwordData.confirm_password === passwordData.new_password
                          ? 'Les mots de passe correspondent'
                          : 'Les mots de passe ne correspondent pas encore'}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleChangePassword}
                      disabled={changePassword.isPending}
                      className="gap-2 rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-lg shadow-teal-900/25"
                    >
                      {changePassword.isPending ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                      Changer le mot de passe
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="rounded-3xl border border-red-200 bg-red-50/60 p-6">
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    <ShieldAlert className="h-4 w-4" />
                  </span>
                  <h2 className="text-[15px] font-extrabold text-red-700">Zone de danger</h2>
                </div>

                <p className="mb-4 text-[13px] leading-relaxed text-on-surface-variant">
                  Supprimez définitivement votre compte et toutes les données du colombier (pigeons,
                  cages, cycles, sorties). Cette action est irréversible.
                </p>

                <div className="mb-4 space-y-3">
                  <Label htmlFor="delete-confirm" className="text-[13px] font-semibold text-red-700">
                    Tapez <b className="font-mono">{user.username}</b> pour confirmer
                  </Label>
                  <Input
                    id="delete-confirm"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder={user.username}
                    className="rounded-xl border-red-300 bg-white text-sm focus:border-red-500 focus:ring-red-500/20"
                  />
                </div>

                <Button
                  variant="destructive"
                  className="w-full gap-2 rounded-xl bg-red-600 hover:bg-red-700"
                  onClick={handleDeleteAccount}
                  disabled={deleteAccount.isPending || deleteConfirm !== user.username}
                >
                  {deleteAccount.isPending ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <ShieldAlert className="h-4 w-4" />
                  )}
                  Supprimer le compte
                </Button>
              </Card>
            </div>
          )}

          {/* ══ ONGLET FACTURATION ══ */}
          {activeTab === 'facturation' && (
            <div className="space-y-6">
              <Card className="rounded-3xl border-outline-variant p-6">
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef7f5] text-[#00685f]">
                    <CreditCard className="h-4 w-4" />
                  </span>
                  <h2 className="text-[15px] font-extrabold text-on-surface">Plan actuel</h2>
                </div>

                {planLoading ? (
                  <div className="flex h-20 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#00685f]" />
                  </div>
                ) : plan ? (
                  <>
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <Badge className="rounded-full bg-[#eef7f5] font-semibold text-[#00685f] ring-1 ring-[#bfe3dc]">
                        {plan.actif ? 'ACTIF' : 'INACTIF'}
                      </Badge>
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant">
                        {plan.date_debut ? `Depuis le ${formatDateLong(plan.date_debut)}` : 'Abonnement'}
                      </span>
                      <span className="ml-auto text-xl font-extrabold text-[#00685f]">
                        {eur.format(plan.prix_mensuel)}
                        <span className="text-[12px] font-semibold text-on-surface-variant"> / mois</span>
                      </span>
                    </div>

                    <h3 className="mb-1.5 text-2xl font-extrabold text-on-surface">{plan.nom}</h3>
                    <p className="mb-4 text-[13px] text-on-surface-variant">{plan.description}</p>

                    <ul className="mb-6 space-y-3">
                      <li className="flex items-center gap-2 text-[13px] text-on-surface">
                        <Check className="h-4 w-4 shrink-0 text-[#00685f]" />
                        Oiseaux actifs illimités
                      </li>
                      <li className="flex items-center gap-2 text-[13px] text-on-surface">
                        <Check className="h-4 w-4 shrink-0 text-[#00685f]" />
                        Tableau de bord génétique
                      </li>
                      <li className="flex items-center gap-2 text-[13px] text-on-surface">
                        <Check className="h-4 w-4 shrink-0 text-[#00685f]" />
                        Export de données (PDF / CSV)
                      </li>
                    </ul>

                    <Button variant="outline" className="w-full gap-2 rounded-xl border-outline-variant">
                      <CreditCard className="h-4 w-4" />
                      Gérer la facturation
                    </Button>
                  </>
                ) : (
                  /* L'API de facturation n'est pas encore déployée : état honnête,
                     à la place du faux plan « Master Breeder » affiché avant */
                  <div className="flex flex-col items-center py-6 text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[#b9d8d0] bg-[#f5faf8]">
                      <CreditCard className="h-7 w-7 text-[#8fb8ae]" />
                    </span>
                    <h3 className="mt-3 text-[15px] font-extrabold text-on-surface">
                      Aucun abonnement connecté
                    </h3>
                    <p className="mt-1 max-w-sm text-[12.5px] leading-relaxed text-on-surface-variant">
                      L&apos;API de facturation n&apos;est pas encore disponible sur le serveur — votre
                      colombier fonctionne en accès complet. Ce panneau s&apos;activera dès le
                      déploiement de l&apos;endpoint.
                    </p>
                  </div>
                )}
              </Card>

              <Card className="rounded-3xl border-outline-variant p-6">
                <div className="mb-4 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef7f5] text-[#00685f]">
                    <FileText className="h-4 w-4" />
                  </span>
                  <h2 className="text-[15px] font-extrabold text-on-surface">Factures récentes</h2>
                </div>

                {(invoicesData?.results?.length ?? 0) === 0 ? (
                  <p className="py-4 text-center text-[13px] text-on-surface-variant">
                    Aucune facture pour le moment.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {invoicesData?.results?.slice(0, 5).map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between rounded-2xl border border-outline-variant bg-surface-container p-3"
                      >
                        <div>
                          <p className="font-mono text-[13px] font-bold text-on-surface">{invoice.numero}</p>
                          <p className="text-[11.5px] text-on-surface-variant">{formatDateLong(invoice.date)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {invoice.pdf_url && (
                            <a
                              href={invoice.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-[#eef7f5] hover:text-[#00685f]"
                              title="Télécharger le PDF"
                            >
                              <FileDown className="h-4 w-4" />
                            </a>
                          )}
                          <span className="text-[13.5px] font-bold text-on-surface">
                            {eur.format(invoice.montant)}
                          </span>
                          <Badge className={cn('rounded-full font-semibold', STATUT_FACTURE[invoice.statut].classe)}>
                            {STATUT_FACTURE[invoice.statut].label}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>

        {/* ── Colonne latérale : notifications + compte ── */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-outline-variant p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef7f5] text-[#00685f]">
                <Bell className="h-4 w-4" />
              </span>
              <h2 className="text-[15px] font-extrabold text-on-surface">Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="pr-4">
                  <p className="text-[13.5px] font-bold text-on-surface">Alertes de reproduction</p>
                  <p className="text-[12px] text-on-surface-variant">M&apos;avertir quand les œufs doivent éclore.</p>
                </div>
                <Bascule
                  actif={notifications.alertesReproduction}
                  onChange={() => setNotifications((prev) => ({ ...prev, alertesReproduction: !prev.alertesReproduction }))}
                  ariaLabel="Activer les alertes de reproduction"
                />
              </div>

              <hr className="border-outline-variant" />

              <div className="flex items-center justify-between">
                <div className="pr-4">
                  <p className="text-[13.5px] font-bold text-on-surface">Résumé hebdomadaire</p>
                  <p className="text-[12px] text-on-surface-variant">Rapport par e-mail des activités du colombier.</p>
                </div>
                <Bascule
                  actif={notifications.resumeHebdo}
                  onChange={() => setNotifications((prev) => ({ ...prev, resumeHebdo: !prev.resumeHebdo }))}
                  ariaLabel="Activer le résumé hebdomadaire"
                />
              </div>
            </div>

            <p className="mt-4 text-[11px] text-on-surface-variant">
              Préférences conservées sur cet appareil.
            </p>
          </Card>

          <Card className="rounded-3xl border-outline-variant p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eef7f5] text-[#00685f]">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <h2 className="text-[15px] font-extrabold text-on-surface">Compte</h2>
            </div>

            <dl className="space-y-3 text-[13px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-on-surface-variant">Identifiant</dt>
                <dd className="font-mono font-bold text-on-surface">@{user.username}</dd>
              </div>
              <hr className="border-outline-variant" />
              <div className="flex items-center justify-between gap-3">
                <dt className="text-on-surface-variant">Rôle</dt>
                <dd className={cn('font-semibold', user.is_staff ? 'text-[#00685f]' : 'text-on-surface')}>
                  {user.is_staff ? 'Administrateur' : 'Colombophile'}
                </dd>
              </div>
              <hr className="border-outline-variant" />
              <div className="flex items-center justify-between gap-3">
                <dt className="text-on-surface-variant">Membre depuis</dt>
                <dd className="font-semibold text-on-surface">
                  {user.date_joined ? formatDateLong(user.date_joined) : '--'}
                </dd>
              </div>
              <hr className="border-outline-variant" />
              <div className="flex items-center justify-between gap-3">
                <dt className="text-on-surface-variant">Dernière connexion</dt>
                <dd className="font-semibold text-on-surface">
                  {user.last_login ? ilYa(user.last_login) : '--'}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ─── Bascule (interrupteur) teal ─────────────────────────────────────────────
function Bascule({
  actif,
  onChange,
  ariaLabel,
}: {
  actif: boolean
  onChange: () => void
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-label={ariaLabel}
      aria-pressed={actif}
      className={cn(
        'relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors',
        actif ? 'bg-[#00685f]' : 'bg-gray-200',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
          actif ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}