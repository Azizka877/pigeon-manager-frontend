'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCreatePigeon, usePigeons } from '@/hooks/use-pigeons'
import { PigeonCard } from '@/components/pigeons/pigeonsCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, Bird, Lightbulb, Palette, Save, X, Dna } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Pigeon } from '@/types'

type OptionSexe = 'M' | 'F' | 'inconnu'

/** Races proposées même quand le registre est encore vide */
const RACES_DE_BASE = ['Voyageur Belge', 'Voyageur Anglais', 'Boulant Français']

export default function NouveauPigeonPage() {
  const router = useRouter()
  const creerPigeon = useCreatePigeon()
  const { data: pigeonsExistants } = usePigeons()

  const [donnees, setDonnees] = useState({
    matricule: '',
    sexe: 'inconnu' as OptionSexe,
    race: '',
    couleur: '',
    poids: '',
    pere: '',
    mere: '',
    date_naissance: '',
  })

  // Races dynamiques du registre, fusionnées avec la base (jamais vide)
  const racesDisponibles = useMemo(() => {
    const set = new Set<string>(RACES_DE_BASE)
    pigeonsExistants?.forEach((p) => {
      if (p.race) set.add(p.race)
    })
    return Array.from(set).sort()
  }, [pigeonsExistants])

  const malesDisponibles = pigeonsExistants?.filter((p) => p.sexe === 'M' && p.statut === 'actif') || []
  const femellesDisponibles = pigeonsExistants?.filter((p) => p.sexe === 'F' && p.statut === 'actif') || []

  // ── Aperçu en direct : la carte pigeon se remplit pendant la saisie ────────
  // NB : Pigeon exige date_naissance / pere / mere (type `X | null`, champ
  // toujours présent dans la réponse Django) → on les passe explicitement.
  const pigeonApercu: Pigeon = {
    id: 'apercu',
    matricule: donnees.matricule.trim() || 'MATRICULE',
    sexe: donnees.sexe === 'F' ? 'F' : 'M',
    race: donnees.race || 'Race à choisir',
    couleur: donnees.couleur || null,
    poids: donnees.poids ? parseFloat(donnees.poids) : null,
    statut: 'actif',
    date_naissance: donnees.date_naissance || null,
    age: null,
    pere: donnees.pere || null,
    mere: donnees.mere || null,
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!donnees.matricule) {
      toast.error('Le matricule est obligatoire')
      return
    }

    try {
      await creerPigeon.mutateAsync({
        matricule: donnees.matricule,
        sexe: donnees.sexe === 'inconnu' ? 'M' : donnees.sexe,
        race: donnees.race || 'Inconnue',
        couleur: donnees.couleur || undefined,
        poids: donnees.poids ? parseFloat(donnees.poids) : undefined,
        pere: donnees.pere || undefined,
        mere: donnees.mere || undefined,
        date_naissance: donnees.date_naissance || new Date().toISOString().split('T')[0],
        statut: 'actif',
      })

      toast.success('Pigeon enregistré avec succès')
      router.push('/pigeons')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Erreur lors de l'enregistrement")
    }
  }

  return (
    <div className="max-w-6xl">
      {/* ── En-tête ── */}
      <div className="mb-6">
        <Link href="/pigeons">
          <Button variant="ghost" className="mb-3 gap-2 text-on-surface-variant">
            <ArrowLeft className="h-4 w-4" />
            Retour aux pigeons
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00685f] to-[#01352f] text-white shadow-md shadow-teal-900/25">
            <Bird className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-on-surface sm:text-3xl">Nouveau Pigeon</h1>
            <p className="mt-0.5 text-sm text-on-surface-variant">
              Saisissez les détails du nouvel oiseau pour l'enregistrer dans le registre.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          {/* ══ Colonne gauche : les sections du formulaire ══ */}
          <Card className="space-y-7 rounded-3xl border-outline-variant p-6">
            {/* ── Identification ── */}
            <section>
              <SectionHeader icone={<Bird className="h-4 w-4" />} titre="Identification" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="matricule">
                    Numéro de matricule <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="matricule"
                    placeholder="ex. SN-2024-009"
                    value={donnees.matricule}
                    onChange={(e) => setDonnees({ ...donnees, matricule: e.target.value })}
                    className="rounded-xl border-outline-variant bg-surface-container"
                    required
                  />
                </div>

                <div>
                  <Label>
                    Sexe <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-2 grid grid-cols-3 gap-2.5">
                    <OptionSexe
                      selectionne={donnees.sexe === 'M'}
                      onClick={() => setDonnees({ ...donnees, sexe: 'M' })}
                      icone="♂"
                      label="Mâle"
                    />
                    <OptionSexe
                      selectionne={donnees.sexe === 'F'}
                      onClick={() => setDonnees({ ...donnees, sexe: 'F' })}
                      icone="♀"
                      label="Femelle"
                    />
                    <OptionSexe
                      selectionne={donnees.sexe === 'inconnu'}
                      onClick={() => setDonnees({ ...donnees, sexe: 'inconnu' })}
                      icone="?"
                      label="Inconnu"
                    />
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-outline-variant" />

            {/* ── Morphologie & Race ── */}
            <section>
              <SectionHeader icone={<Palette className="h-4 w-4" />} titre="Morphologie & Race" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="race">Race</Label>
                  <select
                    id="race"
                    className="h-10 w-full rounded-xl border border-outline-variant bg-surface-container px-3 text-sm"
                    value={donnees.race}
                    onChange={(e) => setDonnees({ ...donnees, race: e.target.value })}
                    required
                  >
                    <option value="">Sélectionner une race</option>
                    {racesDisponibles.map((race) => (
                      <option key={race} value={race}>
                        {race}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="couleur">Couleur du plumage</Label>
                  <Input
                    id="couleur"
                    placeholder="ex. Bleu barré"
                    value={donnees.couleur}
                    onChange={(e) => setDonnees({ ...donnees, couleur: e.target.value })}
                    className="rounded-xl border-outline-variant bg-surface-container"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="poids">Poids (grammes)</Label>
                  <Input
                    id="poids"
                    type="number"
                    placeholder="ex. 450"
                    value={donnees.poids}
                    onChange={(e) => setDonnees({ ...donnees, poids: e.target.value })}
                    className="rounded-xl border-outline-variant bg-surface-container"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_naissance">Date de naissance</Label>
                  <Input
                    id="date_naissance"
                    type="date"
                    value={donnees.date_naissance}
                    onChange={(e) => setDonnees({ ...donnees, date_naissance: e.target.value })}
                    className="rounded-xl border-outline-variant bg-surface-container"
                  />
                </div>
              </div>
            </section>

            <hr className="border-outline-variant" />

            {/* ── Origines ── */}
            <section>
              <SectionHeader icone={<Dna className="h-4 w-4" />} titre="Origines (Parents)" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>♂ Père</Label>
                  <select
                    className="h-10 w-full rounded-xl border border-outline-variant bg-surface-container px-3 text-sm"
                    value={donnees.pere}
                    onChange={(e) => setDonnees({ ...donnees, pere: e.target.value })}
                  >
                    <option value="">Sélectionner le père</option>
                    {malesDisponibles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.matricule} ({p.race})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>♀ Mère</Label>
                  <select
                    className="h-10 w-full rounded-xl border border-outline-variant bg-surface-container px-3 text-sm"
                    value={donnees.mere}
                    onChange={(e) => setDonnees({ ...donnees, mere: e.target.value })}
                  >
                    <option value="">Sélectionner la mère</option>
                    {femellesDisponibles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.matricule} ({p.race})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="mt-3 text-sm italic text-on-surface-variant">
                Note : les parents doivent être enregistrés dans le système pour apparaître ici.
              </p>
            </section>

            {/* ── Actions ── */}
            <div className="flex justify-end gap-3 pt-2">
              <Link href="/pigeons">
                <Button type="button" variant="outline" className="rounded-xl border-outline-variant">
                  <X className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
              </Link>
              <Button
                type="submit"
                className="rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-lg shadow-teal-900/25"
                disabled={creerPigeon.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {creerPigeon.isPending ? 'Enregistrement…' : 'Enregistrer le pigeon'}
              </Button>
            </div>
          </Card>

          {/* ══ Colonne droite : aperçu en direct + astuce ══ */}
          <div className="space-y-4 lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest">
              <p className="px-4 pt-3.5 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
                Aperçu en direct
              </p>
              <PigeonCard pigeon={pigeonApercu} hideActions />
            </div>
            <div className="flex gap-3 rounded-2xl border border-[#d5eae5] bg-[#eef7f5] p-4">
              <Lightbulb className="h-4 w-4 shrink-0 text-[#00685f]" />
              <p className="text-[12.5px] leading-relaxed text-[#1d5a52]">
                Astuce — gardez un format constant (<b>SN-2024-021</b>) : le registre reste
                triable et vos bagues officielles restent lisibles.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

// ── En-tête de section (icône en pastille teal + titre) ─────────────────────
function SectionHeader({ icone, titre }: { icone: React.ReactNode; titre: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#e6f2f0] text-[#00685f]">
        {icone}
      </span>
      <h2 className="text-[15px] font-bold text-on-surface">{titre}</h2>
    </div>
  )
}

// ── Segment de choix du sexe ─────────────────────────────────────────────────
function OptionSexe({
  selectionne,
  onClick,
  icone,
  label,
}: {
  selectionne: boolean
  onClick: () => void
  icone: string
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-0.5 rounded-xl border-2 py-2.5 transition-all',
        selectionne
          ? 'border-[#00685f] bg-[#f0f8f6] text-[#00685f] shadow-sm shadow-teal-900/10'
          : 'border-outline-variant text-on-surface-variant hover:border-slate-300',
      )}
    >
      <span className="text-[17px] font-bold leading-none">{icone}</span>
      <span className="text-[13px] font-semibold">{label}</span>
    </button>
  )
}