// app/reproductions/new/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateReproduction } from '@/hooks/use-reproductions'
import { useCouples } from '@/hooks/use-couples'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Egg, ArrowLeft, Save, X, Baby, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import type { JeuneFormData } from '@/types'

export default function NouvelleReproductionPage() {
  const router = useRouter()
  const creerReproduction = useCreateReproduction()
  const { data: couples } = useCouples()

  const [coupleId, setCoupleId] = useState('')
  const [datePonte, setDatePonte] = useState('')
  const [dateEclosion, setDateEclosion] = useState('')
  const [nombreOeufs, setNombreOeufs] = useState(2)
  const [notes, setNotes] = useState('')

  const [jeunes, setJeunes] = useState<JeuneFormData[]>([
    { matricule: '', sexe: 'M', couleur: '' },
    { matricule: '', sexe: 'F', couleur: '' },
  ])

  const coupleSelectionne = couples?.find(c => c.id === coupleId)

  const addJeune = () => {
    setJeunes((prev: JeuneFormData[]) => [
      ...prev,
      { matricule: '', sexe: 'M', couleur: '' }
    ])
  }

  const removeJeune = (index: number) => {
    setJeunes((prev: JeuneFormData[]) => prev.filter((_, i) => i !== index))
  }

  const updateJeune = (index: number, field: keyof JeuneFormData, value: string) => {
    setJeunes((prev: JeuneFormData[]) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!coupleId || !datePonte) {
      toast.error('Veuillez sélectionner un couple et une date de ponte')
      return
    }

    const jeunesValides = jeunes.filter((j: JeuneFormData) => j.matricule.trim())
    
    try {
      const payload = {
        couple: coupleId,
        date_ponte: datePonte,
        date_eclosion: dateEclosion || undefined,
        nombre_oeufs: nombreOeufs,
        notes: notes || undefined,
        jeunes: jeunesValides.length > 0 ? jeunesValides : undefined,
      }

      await creerReproduction.mutateAsync(payload)
      
      toast.success(`Reproduction enregistrée avec ${jeunesValides.length} jeune(s)`)
      router.push('/reproductions')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Erreur lors de l'enregistrement")
    }
  }

  const couplesActifs = couples?.filter(c => c.statut === 'actif') || []

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/reproductions">
          <Button variant="ghost" className="gap-2 text-gray-500 mb-4 pl-0">
            <ArrowLeft className="w-4 h-4" />
            Retour aux reproductions
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nouvelle reproduction</h1>
        <p className="text-gray-500 mt-1">
          Enregistrez une nouvelle ponte et les pigeonneaux nés.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          {/* ═══════════════════════════════════════════
              SECTION 1 : SÉLECTION DU COUPLE
          ═══════════════════════════════════════════ */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-[#00685f]">
              <Egg className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Couple</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="couple">
                Sélectionner un couple <span className="text-red-500">*</span>
              </Label>
              <select
                id="couple"
                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white"
                value={coupleId}
                onChange={e => setCoupleId(e.target.value)}
                required
              >
                <option value="">Choisir un couple actif...</option>
                {couplesActifs.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.male_details?.matricule || 'Inconnu'} + {c.femelle_details?.matricule || 'Inconnue'}
                  </option>
                ))}
              </select>
            </div>

            {coupleSelectionne && (
              <div className="mt-3 p-3 bg-[#f5faf8] rounded-lg flex items-center gap-3">
                <div className="text-blue-600 font-bold">♂ {coupleSelectionne.male_details?.matricule}</div>
                <span className="text-gray-400">+</span>
                <div className="text-pink-600 font-bold">♀ {coupleSelectionne.femelle_details?.matricule}</div>
              </div>
            )}
          </section>

          <hr className="border-gray-200" />

          {/* ═══════════════════════════════════════════
              SECTION 2 : DÉTAILS DE LA PONTE
          ═══════════════════════════════════════════ */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-[#00685f]">
              <Egg className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Détails de la ponte</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_ponte">
                  Date de ponte <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date_ponte"
                  type="date"
                  value={datePonte}
                  onChange={e => setDatePonte(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_eclosion">
                  Date d'éclosion <span className="text-gray-400">(optionnel)</span>
                </Label>
                <Input
                  id="date_eclosion"
                  type="date"
                  value={dateEclosion}
                  onChange={e => setDateEclosion(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre_oeufs">
                  Nombre d'œufs
                </Label>
                <Input
                  id="nombre_oeufs"
                  type="number"
                  min={1}
                  max={4}
                  value={nombreOeufs}
                  onChange={e => setNombreOeufs(parseInt(e.target.value) || 2)}
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Notes sur cette ponte..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* ═══════════════════════════════════════════
              SECTION 3 : PIGEONNEAUX NÉS
          ═══════════════════════════════════════════ */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-[#00685f]">
              <Baby className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Pigeonneaux nés</h2>
            </div>

            <div className="space-y-3">
              {jeunes.map((jeune: JeuneFormData, index: number) => (
                <div key={index} className="flex gap-3 items-end bg-gray-50 p-3 rounded-lg">
                  <div className="flex-1">
                    <Label className="text-xs">Matricule</Label>
                    <Input
                      value={jeune.matricule}
                      onChange={e => updateJeune(index, 'matricule', e.target.value)}
                      placeholder="P011"
                    />
                  </div>
                  <div className="w-24">
                    <Label className="text-xs">Sexe</Label>
                    <select
                      value={jeune.sexe}
                      onChange={e => updateJeune(index, 'sexe', e.target.value as 'M' | 'F')}
                      className="w-full h-10 px-2 rounded-md border border-gray-200 bg-white"
                    >
                      <option value="M">♂ Mâle</option>
                      <option value="F">♀ Femelle</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">Couleur</Label>
                    <Input
                      value={jeune.couleur}
                      onChange={e => updateJeune(index, 'couleur', e.target.value)}
                      placeholder="Bleu"
                    />
                  </div>
                  {jeunes.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeJeune(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addJeune}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un pigeonneau
              </Button>
            </div>
          </section>

          {/* ═══════════════════════════════════════════
              SECTION 4 : ACTIONS
          ═══════════════════════════════════════════ */}
          <div className="flex justify-end gap-3 pt-4">
            <Link href="/reproductions">
              <Button type="button" variant="outline">
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-[#00685f] hover:bg-[#00554d] text-white"
              disabled={creerReproduction.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {creerReproduction.isPending ? 'Enregistrement...' : 'Enregistrer la reproduction'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}