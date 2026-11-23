'use client'

// app/(dashboard)/couples/simulation/page.tsx — Laboratoire génétique.
// Onglet 1 : simulation de couple — COI exact du descendant prévu
// (méthode tabulaire de Wright, calculée par le backend), détail des
// ancêtres communs et recommandation d'élevage.
// Onglet 2 : pedigree PDF officiel — document imprimable avec QR de
// partage public généré par le backend.

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useQueryPigeonsTous, useSimulationCouple, telechargerPedigreePdf } from '@/hooks/use-genetique'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Bird,
  ChevronRight,
  Dna,
  Download,
  FlaskConical,
  Info,
  Search,
  ScanLine,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Pigeon, ResultatSimulation } from '@/types'

function sexeIcone(sexe?: string | null): string {
  if (sexe === 'M') return '♂'
  if (sexe === 'F') return '♀'
  return '?'
}

// ── Sélecteur de pigeon (recherche + liste) ──────────────────────────────────

function SelecteurPigeon({
  titre,
  sousTitre,
  pigeons,
  valeur,
  onChange,
  accent,
}: {
  titre: string
  sousTitre: string
  pigeons: Pigeon[]
  valeur: Pigeon | null
  onChange: (pigeon: Pigeon | null) => void
  accent: 'teal' | 'amber'
}) {
  const [recherche, setRecherche] = useState('')

  const trouves = useMemo(() => {
    const q = recherche.trim().toLowerCase()
    const base = q
      ? pigeons.filter((p) =>
          [p.matricule, p.race, p.couleur].some((v) =>
            (v ?? '').toLowerCase().includes(q),
          ),
        )
      : pigeons
    return base.slice(0, 6)
  }, [pigeons, recherche])

  const bordure = accent === 'teal' ? 'border-[#00685f]' : 'border-[#b45309]'
  const fond = accent === 'teal' ? 'bg-[#f5faf8]' : 'bg-[#fdf8f3]'
  const encre = accent === 'teal' ? 'text-[#00685f]' : 'text-[#b45309]'

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <Label className="text-sm font-semibold text-gray-900">{titre}</Label>
        <span className="text-xs text-gray-400">{sousTitre}</span>
      </div>

      {valeur ? (
        <div
          className={cn(
            'flex items-center gap-3 rounded-xl border p-3.5',
            bordure,
            fond,
          )}
        >
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-lg font-bold',
              encre,
            )}
          >
            {sexeIcone(valeur.sexe)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-sm font-semibold text-gray-900">
              {valeur.matricule}
            </p>
            <p className="truncate text-xs text-gray-500">
              {[valeur.race, valeur.couleur].filter(Boolean).join(' • ') || '—'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 border-gray-200 text-gray-500 hover:text-gray-700"
            onClick={() => onChange(null)}
          >
            <X className="h-3.5 w-3.5" />
            Changer
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
            <Input
              placeholder="Rechercher (bague, race, couleur)…"
              className="pl-9"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>
          <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
            {trouves.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">
                Aucun pigeon trouvé.
              </p>
            ) : (
              trouves.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onChange(p)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white p-2.5 text-left transition-colors hover:border-[#00685f]/50 hover:bg-[#f5faf8]',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                      p.sexe === 'F'
                        ? 'bg-[#fdf8f3] text-[#b45309]'
                        : 'bg-[#f5faf8] text-[#00685f]',
                    )}
                  >
                    {sexeIcone(p.sexe)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-sm font-medium text-gray-900">
                      {p.matricule}
                    </span>
                    <span className="block truncate text-xs text-gray-400">
                      {[p.race, p.statut !== 'actif' ? p.statut : null]
                        .filter(Boolean)
                        .join(' • ') || '—'}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </Card>
  )
}

// ── Panneau de résultat de simulation ────────────────────────────────────────

function ResultatSimulationPanel({ simulation }: { simulation: ResultatSimulation }) {
  const d = simulation.descendant
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-0 p-0 shadow-lg shadow-[#01352f]/10">
        <div
          className="px-6 py-6 text-center"
          style={{ backgroundColor: `${d.couleur}14` }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Consanguinité prévue du descendant
          </p>
          <p className="mt-2 text-5xl font-bold" style={{ color: d.couleur }}>
            {d.coi_pourcent}&nbsp;%
          </p>
          <span
            className="mt-3 inline-block rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: d.couleur }}
          >
            Risque {d.niveau_label.toLowerCase()}
          </span>
          <p className="mx-auto mt-3 max-w-md text-sm text-gray-600">{d.message}</p>
        </div>
        <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-lg bg-[#f5faf8] px-2.5 py-1.5 font-medium text-[#00685f]">
              COI {simulation.male.matricule} : {simulation.male.coi ? `${simulation.male.coi.toFixed(2).replace('.', ',')} %` : '0 %'}
            </span>
            <span className="rounded-lg bg-[#fdf8f3] px-2.5 py-1.5 font-medium text-[#b45309]">
              COI {simulation.femelle.matricule} : {simulation.femelle.coi ? `${simulation.femelle.coi.toFixed(2).replace('.', ',')} %` : '0 %'}
            </span>
            <span className="rounded-lg bg-gray-50 px-2.5 py-1.5 font-medium text-gray-500">
              Analyse sur {simulation.profondeur_analyse} générations
            </span>
          </div>
          <Link href="/couples/new" className="shrink-0">
            <Button className="gap-2 bg-[#00685f] text-white hover:bg-[#005651] hover:text-white">
              <Dna className="h-4 w-4" />
              Créer ce couple
            </Button>
          </Link>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-1 text-sm font-bold text-gray-900">Ancêtres communs</h3>
        <p className="mb-4 text-xs text-gray-400">
          Les parts s’additionnent exactement au COI du descendant.
        </p>
        {simulation.ancetres_communs.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl bg-[#f5faf8] px-4 py-3 text-sm text-[#00685f]">
            <Info className="h-4 w-4 shrink-0" />
            Aucun ancêtre commun : ces deux pigeons ne partagent aucune
            lignée enregistrée.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-400">
                  <th className="px-3 py-2 font-semibold">Ancêtre</th>
                  <th className="px-3 py-2 font-semibold">Lignée mâle</th>
                  <th className="px-3 py-2 font-semibold">Lignée femelle</th>
                  <th className="px-3 py-2 text-right font-semibold">Part du COI</th>
                </tr>
              </thead>
              <tbody>
                {simulation.ancetres_communs.map((a) => (
                  <tr key={a.id} className="border-t border-gray-50">
                    <td className="px-3 py-2.5">
                      <span className="flex items-center gap-2">
                        <span
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold',
                            a.sexe === 'F'
                              ? 'bg-[#fdf8f3] text-[#b45309]'
                              : 'bg-[#f5faf8] text-[#00685f]',
                          )}
                        >
                          {sexeIcone(a.sexe)}
                        </span>
                        <span className="font-mono font-medium text-gray-900">
                          {a.matricule}
                        </span>
                        {a.coi_ancetre > 0.001 && (
                          <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                            lui-même F&nbsp;=&nbsp;{a.coi_ancetre.toFixed(1).replace('.', ',')}&nbsp;%
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-500">
                      {a.gen_male === 0 ? 'lui-même' : `génération ${a.gen_male}`}
                    </td>
                    <td className="px-3 py-2.5 text-gray-500">
                      {a.gen_femelle === 0 ? 'elle-même' : `génération ${a.gen_femelle}`}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-gray-900">
                      {a.contribution_pourcent}&nbsp;%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SimulationPage() {
  const { data: pigeons = [], isLoading } = useQuery(useQueryPigeonsTous())
  const simulation = useSimulationCouple()

  const [male, setMale] = useState<Pigeon | null>(null)
  const [femelle, setFemelle] = useState<Pigeon | null>(null)
  const [pigeonPedigree, setPigeonPedigree] = useState<Pigeon | null>(null)
  const [telechargement, setTelechargement] = useState(false)

  const males = useMemo(() => pigeons.filter((p) => p.sexe === 'M' && p.statut === 'actif'), [pigeons])
  const femelles = useMemo(() => pigeons.filter((p) => p.sexe === 'F' && p.statut === 'actif'), [pigeons])

  const lancerSimulation = () => {
    if (!male || !femelle) {
      toast.error('Choisissez un mâle et une femelle.')
      return
    }
    simulation.mutate({ maleId: male.id, femelleId: femelle.id })
  }

  const telecharger = async () => {
    if (!pigeonPedigree) {
      toast.error('Choisissez un pigeon.')
      return
    }
    setTelechargement(true)
    try {
      await telechargerPedigreePdf(pigeonPedigree.id, pigeonPedigree.matricule)
      toast.success('Pedigree PDF téléchargé')
    } catch {
      toast.error('Erreur lors de la génération du pedigree')
    } finally {
      setTelechargement(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/couples" className="mb-2 inline-block">
          <Button variant="ghost" className="gap-2 pl-0 text-gray-500">
            <ArrowLeft className="h-4 w-4" />
            Retour aux couples
          </Button>
        </Link>
        <h1 className="flex items-center gap-2.5 text-3xl font-bold text-gray-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00685f] to-[#005651] text-white shadow-md shadow-[#00685f]/25">
            <Dna className="h-5 w-5" />
          </span>
          Laboratoire génétique
        </h1>
        <p className="mt-1 text-gray-500">
          Simulez un croisement avant de former le couple, et publiez des
          pedigrees officiels avec QR de vérification.
        </p>
      </div>

      <Tabs defaultValue="simulation" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="simulation" className="gap-1.5">
            <FlaskConical className="h-4 w-4" />
            Simulation
          </TabsTrigger>
          <TabsTrigger value="pedigree" className="gap-1.5">
            <ScanLine className="h-4 w-4" />
            Pedigree PDF
          </TabsTrigger>
        </TabsList>

        {/* ── Onglet Simulation ── */}
        <TabsContent value="simulation" className="mt-5">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#00685f]" />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 lg:grid-cols-2">
                <SelecteurPigeon
                  titre="Le mâle"
                  sousTitre="pigeons actifs"
                  pigeons={males}
                  valeur={male}
                  onChange={setMale}
                  accent="teal"
                />
                <SelecteurPigeon
                  titre="La femelle"
                  sousTitre="pigeons actifs"
                  pigeons={femelles}
                  valeur={femelle}
                  onChange={setFemelle}
                  accent="amber"
                />
              </div>

              <Button
                onClick={lancerSimulation}
                disabled={simulation.isPending}
                className="h-12 w-full gap-2 bg-[#00685f] text-base text-white hover:bg-[#005651] hover:text-white"
              >
                <FlaskConical className="h-5 w-5" />
                {simulation.isPending ? 'Calcul en cours…' : 'Calculer la consanguinité prévue'}
              </Button>

              {simulation.isError && (
                <Card className="border-red-100 bg-red-50/60 p-4 text-sm text-red-700">
                  {(simulation.error as any)?.response?.data?.detail ||
                    'Erreur lors du calcul. Réessayez.'}
                </Card>
              )}

              {simulation.data && <ResultatSimulationPanel simulation={simulation.data} />}

              {!simulation.data && !simulation.isPending && (
                <div className="flex items-start gap-2 rounded-xl bg-[#f5faf8] px-4 py-3 text-sm text-[#00685f]/80">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  Le COI (coefficient de consanguinité de Wright) mesure la
                  part des gènes que le descendant prévu recevrait en double,
                  par ses deux parents. En dessous de 2&nbsp;% le croisement
                  est considéré comme sûr ; au-delà de 12,5&nbsp;% il relie
                  des parents très proches.
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* ── Onglet Pedigree PDF ── */}
        <TabsContent value="pedigree" className="mt-5">
          <div className="mx-auto max-w-xl space-y-5">
            <SelecteurPigeon
              titre="Pigeon du pedigree"
              sousTitre="tous les pigeons"
              pigeons={pigeons}
              valeur={pigeonPedigree}
              onChange={setPigeonPedigree}
              accent="teal"
            />

            <Button
              onClick={telecharger}
              disabled={telechargement || !pigeonPedigree}
              className="h-12 w-full gap-2 bg-[#00685f] text-base text-white hover:bg-[#005651] hover:text-white"
            >
              <Download className="h-5 w-5" />
              {telechargement ? 'Génération du PDF…' : 'Télécharger le pedigree PDF'}
            </Button>

            <Card className="p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
                <ScanLine className="h-4 w-4 text-[#00685f]" />
                Ce que contient le document
              </h3>
              <ul className="space-y-2.5 text-sm text-gray-600">
                <li className="flex gap-2.5">
                  <Bird className="mt-0.5 h-4 w-4 shrink-0 text-[#00685f]/50" />
                  Arbre généalogique sur 4 générations (mâles et femelles
                  différenciés, ascendants inconnus clairement marqués).
                </li>
                <li className="flex gap-2.5">
                  <Dna className="mt-0.5 h-4 w-4 shrink-0 text-[#00685f]/50" />
                  Badge de consanguinité du pigeon calculé sur 6 générations.
                </li>
                <li className="flex gap-2.5">
                  <ScanLine className="mt-0.5 h-4 w-4 shrink-0 text-[#00685f]/50" />
                  Un QR code de vérification : n’importe qui peut scanner le
                  document imprimé pour rouvrir le pedigree officiel, sans
                  compte ni mot de passe.
                </li>
              </ul>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
