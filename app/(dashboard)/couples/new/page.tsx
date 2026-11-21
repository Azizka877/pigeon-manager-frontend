'use client'

// ─────────────────────────────────────────────────────────────────────────────
// app/(dashboard)/couples/new/page.tsx — Former un couple, design ultra-moderne
// réaliste, cohérent avec le formulaire « Nouveau pigeon ». Deux panneaux
// photo (♂ mâle / ♀ femelle) reliés par un cœur pulsant, sélection limitée aux
// pigeons ACTIFS, et APERÇU EN DIRECT : la scène d'union (les deux vraies
// photos face à face sur une ombre douce) se compose pendant la saisie, comme
// elle apparaîtra ensuite sur la carte du registre des couples.
// Logique métier inchangée : useCreateCouple({ male, femelle }), mêmes
// contrôles de validation et redirection vers /couples.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCreateCouple } from '@/hooks/use-couples'
import { usePigeons } from '@/hooks/use-pigeons'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Heart, Save, ShieldCheck, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { getPigeonImage } from '@/lib/pigeon-images'

export default function NouveauCouplePage() {
  const router = useRouter()
  const creerCouple = useCreateCouple()
  const { data: pigeons } = usePigeons()

  const [maleId, setMaleId] = useState('')
  const [femelleId, setFemelleId] = useState('')

  // Seuls les pigeons ACTIFS peuvent former une union
  const malesDisponibles = useMemo(
    () => pigeons?.filter((p) => p.sexe === 'M' && p.statut === 'actif') ?? [],
    [pigeons],
  )
  const femellesDisponibles = useMemo(
    () => pigeons?.filter((p) => p.sexe === 'F' && p.statut === 'actif') ?? [],
    [pigeons],
  )

  const maleChoisi = malesDisponibles.find((p) => p.id === maleId) || null
  const femelleChoisie = femellesDisponibles.find((p) => p.id === femelleId) || null
  const unionComplete = !!maleChoisi && !!femelleChoisie

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!maleId || !femelleId) {
      toast.error('Veuillez sélectionner un mâle et une femelle')
      return
    }

    try {
      await creerCouple.mutateAsync({ male: maleId, femelle: femelleId })
      toast.success('Couple formé avec succès')
      router.push('/couples')
    } catch {
      toast.error('Erreur lors de la formation du couple')
    }
  }

  const sousTitrePigeon = (race: string | null, age: number | null) =>
    [race || 'Race inconnue', age != null ? `${age} an${age > 1 ? 's' : ''}` : null]
      .filter(Boolean)
      .join(' · ')

  return (
    <div className="max-w-3xl">
      {/* ── En-tête ── */}
      <div className="mb-6">
        <Link href="/couples">
          <Button variant="ghost" className="mb-3 gap-2 pl-0 text-on-surface-variant">
            <ArrowLeft className="h-4 w-4" />
            Retour aux couples
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00685f] to-[#01352f] text-white shadow-md shadow-teal-900/25">
            <Heart className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-on-surface sm:text-3xl">Former un couple</h1>
            <p className="mt-0.5 text-sm text-on-surface-variant">
              Associez un mâle et une femelle actifs pour lancer une lignée d&apos;élevage.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ══ Carte d'union : aperçu photo + deux panneaux de sélection ══ */}
        <Card className="overflow-hidden rounded-3xl border-outline-variant">
          {/* ── Scène d'union en direct ── */}
          <div className="relative h-44 bg-gradient-to-b from-[#eaf4f1] to-white">
            {/* Ombres de contact */}
            <div
              className="absolute bottom-3 left-[16%] h-3 w-[26%] rounded-full"
              style={{ background: 'radial-gradient(ellipse at center, rgba(15,60,55,0.16), transparent 70%)' }}
              aria-hidden="true"
            />
            <div
              className="absolute bottom-3 right-[16%] h-3 w-[26%] rounded-full"
              style={{ background: 'radial-gradient(ellipse at center, rgba(15,60,55,0.16), transparent 70%)' }}
              aria-hidden="true"
            />

            {/* Mâle : vraie photo dès la sélection, silhouette en attente */}
            {maleChoisi ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={getPigeonImage(maleChoisi.id, 'M')}
                alt={`Mâle ${maleChoisi.matricule}`}
                className="absolute bottom-1.5 left-[10%] h-[72%] object-contain"
                style={{ transform: 'scaleX(-1)', filter: 'drop-shadow(0 6px 8px rgba(10,40,35,0.18))' }}
              />
            ) : (
              <span className="absolute bottom-4 left-[14%] flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[#b9d8d0] text-[22px] text-[#8fb8ae]">
                ♂
              </span>
            )}

            {/* Femelle */}
            {femelleChoisie ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={getPigeonImage(femelleChoisie.id, 'F')}
                alt={`Femelle ${femelleChoisie.matricule}`}
                className="absolute bottom-1.5 right-[10%] h-[72%] object-contain"
                style={{ filter: 'drop-shadow(0 6px 8px rgba(10,40,35,0.18))' }}
              />
            ) : (
              <span className="absolute bottom-4 right-[14%] flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[#f2c6d0] text-[22px] text-[#dda4b3]">
                ♀
              </span>
            )}

            {/* Cœur central : s'embrase quand l'union est complète */}
            <span className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2">
              {unionComplete && (
                <span className="absolute inset-0 -m-2.5 animate-pulse rounded-full bg-pink-200/60" aria-hidden="true" />
              )}
              <span
                className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-full shadow-sm ring-1',
                  unionComplete ? 'bg-white/90 ring-pink-100' : 'bg-white/60 ring-gray-200',
                )}
              >
                <Heart
                  className={cn('h-5 w-5', unionComplete ? 'fill-pink-400 text-pink-400' : 'text-gray-300')}
                />
              </span>
            </span>

            {/* Étiquette de la scène */}
            <p className="absolute left-1/2 top-3 -translate-x-1/2 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
              Aperçu de l&apos;union
            </p>
          </div>

          {/* ── Les deux sélecteurs ── */}
          <div className="grid sm:grid-cols-2 sm:gap-0">
            {/* Panneau Mâle */}
            <section className="p-6 sm:pr-14">
              <p className="mb-1 text-[13px] font-bold text-blue-600">♂ Mâle</p>
              <Label htmlFor="male" className="sr-only">
                Mâle
              </Label>
              <select
                id="male"
                className="h-10 w-full rounded-xl border border-outline-variant bg-surface-container px-3 text-sm"
                value={maleId}
                onChange={(e) => setMaleId(e.target.value)}
              >
                <option value="">Sélectionner un mâle…</option>
                {malesDisponibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.matricule} — {p.race || 'Race inconnue'}
                    {p.couleur ? ` (${p.couleur})` : ''}
                  </option>
                ))}
              </select>

              {maleChoisi ? (
                <div className="mt-3 flex items-center gap-3 rounded-2xl bg-[#eef4fb] p-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-lg font-bold text-blue-600">
                    ♂
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[13px] font-bold text-on-surface">
                      {maleChoisi.matricule}
                    </p>
                    <p className="truncate text-[12px] text-on-surface-variant">
                      {sousTitrePigeon(maleChoisi.race, maleChoisi.age)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-[12.5px] italic text-on-surface-variant">
                  Seuls les mâles au statut Actif sont proposés.
                </p>
              )}
            </section>

            {/* Séparateur vertical avec cœur pulsant (desktop) */}
            <div className="relative hidden sm:block">
              <div className="absolute left-0 top-6 h-[calc(100%-3rem)] border-l border-dashed border-outline-variant" />
              <span className="absolute left-0 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-pink-50 shadow-sm ring-1 ring-pink-100">
                <Heart
                  className={cn(
                    'h-5 w-5 transition-colors',
                    unionComplete ? 'animate-pulse fill-pink-400 text-pink-400' : 'text-gray-300',
                  )}
                />
              </span>
            </div>

            {/* Panneau Femelle */}
            <section className="border-t border-outline-variant p-6 sm:border-t-0 sm:pl-14">
              <p className="mb-1 text-[13px] font-bold text-pink-600">♀ Femelle</p>
              <Label htmlFor="femelle" className="sr-only">
                Femelle
              </Label>
              <select
                id="femelle"
                className="h-10 w-full rounded-xl border border-outline-variant bg-surface-container px-3 text-sm"
                value={femelleId}
                onChange={(e) => setFemelleId(e.target.value)}
              >
                <option value="">Sélectionner une femelle…</option>
                {femellesDisponibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.matricule} — {p.race || 'Race inconnue'}
                    {p.couleur ? ` (${p.couleur})` : ''}
                  </option>
                ))}
              </select>

              {femelleChoisie ? (
                <div className="mt-3 flex items-center gap-3 rounded-2xl bg-[#fdf1f4] p-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-lg font-bold text-pink-600">
                    ♀
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[13px] font-bold text-on-surface">
                      {femelleChoisie.matricule}
                    </p>
                    <p className="truncate text-[12px] text-on-surface-variant">
                      {sousTitrePigeon(femelleChoisie.race, femelleChoisie.age)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-[12.5px] italic text-on-surface-variant">
                  Seules les femelles au statut Actif sont proposées.
                </p>
              )}
            </section>
          </div>
        </Card>

        {/* ── Note de bon usage ── */}
        <div className="flex gap-3 rounded-2xl border border-[#d5eae5] bg-[#eef7f5] p-4">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[#00685f]" />
          <p className="text-[12.5px] leading-relaxed text-[#1d5a52]">
            Bon à savoir — la nouvelle union n&apos;occupe pas encore de cage : affectez-la dans le
            module <b>Cages</b>. Lors d&apos;une séparation, la cage du couple est libérée
            automatiquement et l&apos;historique des pontes reste consultable.
          </p>
        </div>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3">
          <Link href="/couples">
            <Button type="button" variant="outline" className="rounded-xl border-outline-variant">
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={creerCouple.isPending || !maleId || !femelleId}
            className="gap-2 rounded-xl bg-gradient-to-br from-[#00685f] to-[#014d44] text-white shadow-lg shadow-teal-900/25"
          >
            <Save className="h-4 w-4" />
            {creerCouple.isPending ? 'Formation…' : 'Former le couple'}
          </Button>
        </div>
      </form>
    </div>
  )
}