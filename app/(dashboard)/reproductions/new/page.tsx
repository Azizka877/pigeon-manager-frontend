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
import { ArrowLeft, Save, X, Baby, Plus, Trash2 } from 'lucide-react'
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

  const coupleSelectionne = couples?.results?.find(c => c.id === coupleId)

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

  const couplesActifs = couples?.results?.filter(c => c.statut === 'actif') || []

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nouvelle reproduction</h1>
          <p className="text-gray-500 mt-1">
            Enregistrez une nouvelle ponte et les pigeonneaux nés.
          </p>
        </div>
        <Link href="/reproductions">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour aux reproductions
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* ═══════════════════════════════════════════
              SECTION 1 : COUPLE
          ═══════════════════════════════════════════ */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#00685f] text-xl">♀♂</span>
              <h2 className="text-lg font-semibold">Couple</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="couple" className="text-sm text-gray-600">
                  Sélectionner un couple actif
                </Label>
                <select
                  id="couple"
                  className="w-full h-10 px-3 mt-1 rounded-md border border-gray-200 bg-white text-sm"
                  value={coupleId}
                  onChange={e => setCoupleId(e.target.value)}
                  required
                >
                  <option value="">Couple #24 - Blue Bar x Checkered</option>
                  {couplesActifs.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.male_details?.matricule || 'Inconnu'} + {c.femelle_details?.matricule || 'Inconnue'}
                    </option>
                  ))}
                </select>
              </div>

              {coupleSelectionne && (
                <div className="flex items-center gap-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      ♂
                    </div>
                    <div>
                      <p className="font-medium text-sm">{coupleSelectionne.male_details?.matricule}</p>
                      <p className="text-xs text-gray-500">Mâle {coupleSelectionne.male_details?.race}</p>
                    </div>
                  </div>
                  <span className="text-gray-400">+</span>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                      ♀
                    </div>
                    <div>
                      <p className="font-medium text-sm">{coupleSelectionne.femelle_details?.matricule}</p>
                      <p className="text-xs text-gray-500">Femelle {coupleSelectionne.femelle_details?.race}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* ═══════════════════════════════════════════
              SECTION 2 : DÉTAILS DE LA PONTE
          ═══════════════════════════════════════════ */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#00685f] text-xl">🗓</span>
              <h2 className="text-lg font-semibold">Détails de la ponte</h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_ponte" className="text-sm">
                  Date de ponte <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date_ponte"
                  type="date"
                  placeholder="mm/dd/yyyy"
                  value={datePonte}
                  onChange={e => setDatePonte(e.target.value)}
                  required
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_eclosion" className="text-sm">
                  Date d'éclosion
                </Label>
                <Input
                  id="date_eclosion"
                  type="date"
                  placeholder="mm/dd/yyyy"
                  value={dateEclosion}
                  onChange={e => setDateEclosion(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre_oeufs" className="text-sm">
                  Nombre d'œufs
                </Label>
                <Input
                  id="nombre_oeufs"
                  type="number"
                  min={1}
                  max={4}
                  value={nombreOeufs}
                  onChange={e => setNombreOeufs(parseInt(e.target.value) || 2)}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="notes" className="text-sm">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Informations complémentaires sur la santé des parents ou les conditions météo..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="text-sm resize-none"
              />
            </div>
          </Card>

          {/* ═══════════════════════════════════════════
              SECTION 3 : PIGEONNEAUX NÉS
          ═══════════════════════════════════════════ */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[#00685f] text-xl">👶</span>
                <h2 className="text-lg font-semibold">Pigeonneaux nés</h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={addJeune}
                className="text-[#00685f] hover:text-[#00554d] hover:bg-[#f5faf8]"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter un pigeonneau
              </Button>
            </div>

            <div className="space-y-3">
              {jeunes.map((jeune: JeuneFormData, index: number) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="col-span-4">
                    <Label className="text-xs text-gray-500 mb-1 block">Matricule</Label>
                    <Input
                      value={jeune.matricule}
                      onChange={e => updateJeune(index, 'matricule', e.target.value)}
                      placeholder="Ex: BE-2024-..."
                      className="text-sm h-9"
                    />
                  </div>
                  <div className="col-span-3">
                    <Label className="text-xs text-gray-500 mb-1 block">Sexe</Label>
                    <select
                      value={jeune.sexe}
                      onChange={e => updateJeune(index, 'sexe', e.target.value as 'M' | 'F')}
                      className="w-full h-9 px-2 rounded-md border border-gray-200 bg-white text-sm"
                    >
                      <option value="M">Indéterminé</option>
                      <option value="M">Mâle</option>
                      <option value="F">Femelle</option>
                    </select>
                  </div>
                  <div className="col-span-4">
                    <Label className="text-xs text-gray-500 mb-1 block">Couleur / Motif</Label>
                    <Input
                      value={jeune.couleur}
                      onChange={e => updateJeune(index, 'couleur', e.target.value)}
                      placeholder="Ex: Bleu Barré"
                      className="text-sm h-9"
                    />
                  </div>
                  <div className="col-span-1">
                    {jeunes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeJeune(index)}
                        className="h-9 w-9 p-0 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* ═══════════════════════════════════════════
              SECTION 4 : ACTIONS
          ═══════════════════════════════════════════ */}
          <Card className="p-4 bg-gray-50 border-0">
            <div className="flex justify-end gap-3">
              <Link href="/reproductions">
                <Button type="button" variant="outline" className="bg-white">
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
        </div>
      </form>
    </div>
  )
}