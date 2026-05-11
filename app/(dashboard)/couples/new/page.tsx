'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateCouple } from '@/hooks/use-couples'
import { usePigeons } from '@/hooks/use-pigeons'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Heart, ArrowLeft, Save, X } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function NouveauCouplePage() {
  const router = useRouter()
  const creerCouple = useCreateCouple()
  const { data: pigeons } = usePigeons()

  const [maleId, setMaleId] = useState('')
  const [femelleId, setFemelleId] = useState('')

  const malesDisponibles = pigeons?.filter(p => p.sexe === 'M' && p.statut === 'actif') || []
  const femellesDisponibles = pigeons?.filter(p => p.sexe === 'F' && p.statut === 'actif') || []

  const maleSelectionne = malesDisponibles.find(p => p.id === maleId)
  const femelleSelectionnee = femellesDisponibles.find(p => p.id === femelleId)

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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/couples">
          <Button variant="ghost" className="gap-2 text-gray-500 mb-4 pl-0">
            <ArrowLeft className="w-4 h-4" />
            Retour aux couples
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Former un couple</h1>
        <p className="text-gray-500 mt-1">
          Sélectionnez un mâle et une femelle pour former un nouveau couple d'élevage.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          {/* Sélection Mâle */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-blue-600">
              <span className="text-xl">♂</span>
              <h2 className="text-lg font-semibold">Mâle</h2>
            </div>
            
            <select
              className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white mb-3"
              value={maleId}
              onChange={e => setMaleId(e.target.value)}
            >
              <option value="">Sélectionner un mâle...</option>
              {malesDisponibles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.matricule} — {p.race} {p.couleur ? `(${p.couleur})` : ''}
                </option>
              ))}
            </select>

            {maleSelectionne && (
              <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  ♂
                </div>
                <div>
                  <p className="font-medium text-gray-900">{maleSelectionne.matricule}</p>
                  <p className="text-sm text-gray-500">{maleSelectionne.race}</p>
                </div>
              </div>
            )}
          </section>

          {/* Cœur */}
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-400" />
            </div>
          </div>

          {/* Sélection Femelle */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-pink-600">
              <span className="text-xl">♀</span>
              <h2 className="text-lg font-semibold">Femelle</h2>
            </div>
            
            <select
              className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white mb-3"
              value={femelleId}
              onChange={e => setFemelleId(e.target.value)}
            >
              <option value="">Sélectionner une femelle...</option>
              {femellesDisponibles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.matricule} — {p.race} {p.couleur ? `(${p.couleur})` : ''}
                </option>
              ))}
            </select>

            {femelleSelectionnee && (
              <div className="bg-pink-50 rounded-lg p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">
                  ♀
                </div>
                <div>
                  <p className="font-medium text-gray-900">{femelleSelectionnee.matricule}</p>
                  <p className="text-sm text-gray-500">{femelleSelectionnee.race}</p>
                </div>
              </div>
            )}
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Link href="/couples">
              <Button type="button" variant="outline">
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-[#00685f] hover:bg-[#00554d] text-white"
              disabled={creerCouple.isPending || !maleId || !femelleId}
            >
              <Save className="w-4 h-4 mr-2" />
              {creerCouple.isPending ? 'Formation...' : 'Former le couple'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}