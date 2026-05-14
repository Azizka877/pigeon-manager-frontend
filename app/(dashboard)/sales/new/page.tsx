'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateSortie } from '@/hooks/use-sales'
import { usePigeons } from '@/hooks/use-pigeons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { LogOut, ArrowLeft, Save, X, DollarSign, Plane, Skull } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type TypeSortie = 'vente' | 'perte' | 'deces'

export default function NouvelleSortiePage() {
  const router = useRouter()
  const creerSortie = useCreateSortie()
  const { data: pigeons } = usePigeons()

  const [typeSortie, setTypeSortie] = useState<TypeSortie>('vente')
  const [pigeonId, setPigeonId] = useState('')
  const [dateSortie, setDateSortie] = useState('')
  const [prix, setPrix] = useState('')        // ← string au lieu de number
  const [acheteur, setAcheteur] = useState('')
  const [cause, setCause] = useState('')
  const [circonstances, setCirconstances] = useState('')
  const [notes, setNotes] = useState('')

  const pigeonSelectionne = pigeons?.find(p => p.id === pigeonId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!pigeonId || !dateSortie) {
      toast.error('Veuillez sélectionner un pigeon et une date de sortie')
      return
    }

    try {
      await creerSortie.mutateAsync({
        pigeon: pigeonId,
        type_sortie: typeSortie,
        date_sortie: dateSortie,
        // 🔧 CONVERSION : prix en string avec 2 décimales
        prix: typeSortie === 'vente' && prix ? parseFloat(prix).toFixed(2) : null,
        acheteur: typeSortie === 'vente' ? (acheteur || null) : null,
        cause: cause || null,
        circonstances: circonstances || null,
        notes: notes || null,
      })

      toast.success('Sortie enregistrée avec succès')
      router.push('/sales')
    } catch {
      toast.error('Erreur lors de l\'enregistrement')
    }
  }

  const pigeonsActifs = pigeons?.filter(p => p.statut === 'actif') || []

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/sales">
          <Button variant="ghost" className="gap-2 text-gray-500 mb-4 pl-0">
            <ArrowLeft className="w-4 h-4" />
            Retour aux sorties
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Enregistrer une sortie</h1>
        <p className="text-gray-500 mt-1">
          Enregistrez une vente, une perte ou un décès de pigeon.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          {/* Type de sortie */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-[#00685f]">
              <LogOut className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Type de sortie</h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <TypeSortieOption
                selectionne={typeSortie === 'vente'}
                onClick={() => setTypeSortie('vente')}
                icone={<DollarSign className="w-5 h-5" />}
                label="Vente"
                couleur="text-[#00685f] border-[#00685f] bg-[#f5faf8]"
              />
              <TypeSortieOption
                selectionne={typeSortie === 'perte'}
                onClick={() => setTypeSortie('perte')}
                icone={<Plane className="w-5 h-5" />}
                label="Perte"
                couleur="text-[#c2410c] border-[#c2410c] bg-[#fff7ed]"
              />
              <TypeSortieOption
                selectionne={typeSortie === 'deces'}
                onClick={() => setTypeSortie('deces')}
                icone={<Skull className="w-5 h-5" />}
                label="Décès"
                couleur="text-gray-600 border-gray-400 bg-gray-50"
              />
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Pigeon */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-[#00685f]">
              <LogOut className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Pigeon</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pigeon">
                Sélectionner un pigeon <span className="text-red-500">*</span>
              </Label>
              <select
                id="pigeon"
                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white"
                value={pigeonId}
                onChange={e => setPigeonId(e.target.value)}
                required
              >
                <option value="">Choisir un pigeon...</option>
                {pigeonsActifs.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.matricule} — {p.race} ({p.sexe_display})
                  </option>
                ))}
              </select>
            </div>

            {pigeonSelectionne && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{pigeonSelectionne.matricule}</p>
                <p className="text-sm text-gray-500">{pigeonSelectionne.race} • {pigeonSelectionne.sexe_display}</p>
              </div>
            )}
          </section>

          <hr className="border-gray-200" />

          {/* Détails */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-[#00685f]">
              <LogOut className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Détails</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_sortie">
                  Date de sortie <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date_sortie"
                  type="date"
                  value={dateSortie}
                  onChange={e => setDateSortie(e.target.value)}
                  required
                />
              </div>

              {typeSortie === 'vente' && (
                <div className="space-y-2">
                  <Label htmlFor="prix">Prix (€)</Label>
                  <Input
                    id="prix"
                    type="number"
                    step="0.01"
                    placeholder="ex. 320.00"
                    value={prix}
                    onChange={e => setPrix(e.target.value)}     // ← string
                  />
                </div>
              )}
            </div>

            {typeSortie === 'vente' && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="acheteur">Acheteur</Label>
                <Input
                  id="acheteur"
                  placeholder="ex. Pierre Martin - Colombophile Belge"
                  value={acheteur}
                  onChange={e => setAcheteur(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2 mt-4">
              <Label htmlFor="cause">Cause / Raison</Label>
              <Input
                id="cause"
                placeholder={typeSortie === 'perte' ? "ex. Attaque par un rapace" : "ex. Maladie"}
                value={cause}
                onChange={e => setCause(e.target.value)}
              />
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="circonstances">Circonstances</Label>
              <Textarea
                id="circonstances"
                placeholder="Décrivez les circonstances..."
                value={circonstances}
                onChange={e => setCirconstances(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Notes additionnelles..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Link href="/sales">
              <Button type="button" variant="outline">
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-[#00685f] hover:bg-[#00554d] text-white"
              disabled={creerSortie.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {creerSortie.isPending ? 'Enregistrement...' : 'Enregistrer la sortie'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}

function TypeSortieOption({ 
  selectionne, 
  onClick, 
  icone, 
  label, 
  couleur 
}: { 
  selectionne: boolean
  onClick: () => void
  icone: React.ReactNode
  label: string
  couleur: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
        selectionne ? couleur : 'border-gray-200 hover:border-gray-300'
      )}
    >
      {icone}
      <span className="font-medium">{label}</span>
    </button>
  )
}