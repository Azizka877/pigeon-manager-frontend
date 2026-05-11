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
import { Egg, ArrowLeft, Save, X } from 'lucide-react'
import Link from 'next/link'

export default function NouvelleReproductionPage() {
  const router = useRouter()
  const creerReproduction = useCreateReproduction()
  const { data: couples } = useCouples()

  const [coupleId, setCoupleId] = useState('')
  const [datePonte, setDatePonte] = useState('')
  const [nombreOeufs, setNombreOeufs] = useState(2)
  const [notes, setNotes] = useState('')

  const coupleSelectionne = couples?.find(c => c.id === coupleId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!coupleId || !datePonte) {
      toast.error('Veuillez sélectionner un couple et une date de ponte')
      return
    }

    try {
      await creerReproduction.mutateAsync({
        couple: coupleId,
        date_ponte: datePonte,
        nombre_oeufs: nombreOeufs,
        notes: notes || undefined,
      })
      toast.success('Reproduction enregistrée avec succès')
      router.push('/reproductions')
    } catch {
      toast.error('Erreur lors de l\'enregistrement')
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
          Enregistrez une nouvelle ponte pour suivre le cycle d'élevage.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          {/* Sélection du couple */}
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

          {/* Détails de la ponte */}
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

          {/* Actions */}
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
              {creerReproduction.isPending ? 'Enregistrement...' : 'Enregistrer la ponte'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}