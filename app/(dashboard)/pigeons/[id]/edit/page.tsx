'use client'

import { useParams, useRouter } from 'next/navigation'
import { usePigeon, useUpdatePigeon } from '@/hooks/use-pigeons'
import { usePigeons } from '@/hooks/use-pigeons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Bird, Save, X, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type OptionSexe = 'M' | 'F' | 'inconnu'

export default function ModifierPigeonPage() {
  const params = useParams()
  const router = useRouter()
  const { data: pigeon, isLoading } = usePigeon(params.id as string)
  const modifierPigeon = useUpdatePigeon()
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
    statut: 'actif' as string,
  })

  useEffect(() => {
    if (pigeon) {
      setDonnees({
        matricule: pigeon.matricule,
        sexe: pigeon.sexe,
        race: pigeon.race,
        couleur: pigeon.couleur || '',
        poids: pigeon.poids?.toString() || '',
        pere: typeof pigeon.pere === 'string' ? pigeon.pere : '',
        mere: typeof pigeon.mere === 'string' ? pigeon.mere : '',
        date_naissance: pigeon.date_naissance,
        statut: pigeon.statut,
      })
    }
  }, [pigeon])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await modifierPigeon.mutateAsync({
        id: params.id as string,
        data: {
          matricule: donnees.matricule,
          sexe: donnees.sexe === 'inconnu' ? 'M' : donnees.sexe,
          race: donnees.race,
          couleur: donnees.couleur || undefined,
          poids: donnees.poids ? parseFloat(donnees.poids) : undefined,
          pere: donnees.pere || undefined,
          mere: donnees.mere || undefined,
          date_naissance: donnees.date_naissance,
          statut: donnees.statut as 'actif' | 'vendu' | 'mort' | 'perdu',
        },
      })

      toast.success('Pigeon modifié avec succès')
      router.push(`/pigeons/${params.id}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Erreur lors de la modification')
    }
  }

  const malesDisponibles = pigeonsExistants?.filter(p => p.sexe === 'M' && p.statut === 'actif' && p.id !== params.id) || []
  const femellesDisponibles = pigeonsExistants?.filter(p => p.sexe === 'F' && p.statut === 'actif' && p.id !== params.id) || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00685f]" />
      </div>
    )
  }

  if (!pigeon) {
    return <div className="p-6">Pigeon non trouvé</div>
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Link href={`/pigeons/${params.id}`}>
          <Button variant="ghost" className="gap-2 text-gray-500 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Retour au pigeon
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Modifier le Pigeon</h1>
        <p className="text-gray-500 mt-1">
          Modifier les détails de {pigeon.matricule}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-8">
          {/* Identification */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-[#00685f]">
              <Bird className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Identification</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="matricule">
                  Numéro de matricule <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="matricule"
                  value={donnees.matricule}
                  onChange={e => setDonnees({ ...donnees, matricule: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Sexe <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
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

          <hr className="border-gray-200" />

          {/* Morphologie & Race */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-[#00685f]">
              <Bird className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Morphologie & Race</h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="race">Race</Label>
                <select
                  id="race"
                  className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white"
                  value={donnees.race}
                  onChange={e => setDonnees({ ...donnees, race: e.target.value })}
                  required
                >
                  <option value="">Sélectionner une race</option>
                  <option value="Voyageur Belge">Voyageur Belge</option>
                  <option value="Voyageur Anglais">Voyageur Anglais</option>
                  <option value="Boulant Français">Boulant Français</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="couleur">Couleur du plumage</Label>
                <Input
                  id="couleur"
                  placeholder="ex. Bleu barré"
                  value={donnees.couleur}
                  onChange={e => setDonnees({ ...donnees, couleur: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="poids">Poids (grammes)</Label>
                <Input
                  id="poids"
                  type="number"
                  placeholder="ex. 450"
                  value={donnees.poids}
                  onChange={e => setDonnees({ ...donnees, poids: e.target.value })}
                />
              </div>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Statut */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-[#00685f]">
              <Bird className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Statut</h2>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statut">Statut actuel</Label>
              <select
                id="statut"
                className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white"
                value={donnees.statut}
                onChange={e => setDonnees({ ...donnees, statut: e.target.value })}
              >
                <option value="actif">Actif</option>
                <option value="vendu">Vendu</option>
                <option value="mort">Décédé</option>
                <option value="perdu">Perdu</option>
              </select>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Origines (Parents) */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-[#00685f]">
              <Bird className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Origines (Parents)</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>♂ Père</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white"
                  value={donnees.pere}
                  onChange={e => setDonnees({ ...donnees, pere: e.target.value })}
                >
                  <option value="">Sélectionner le père</option>
                  {malesDisponibles.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.matricule} {p.race}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>♀ Mère</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white"
                  value={donnees.mere}
                  onChange={e => setDonnees({ ...donnees, mere: e.target.value })}
                >
                  <option value="">Sélectionner la mère</option>
                  {femellesDisponibles.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.matricule} {p.race}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-sm text-gray-500 italic mt-3">
              Note : Les parents doivent être enregistrés dans le système pour apparaître ici.
            </p>
          </section>

          {/* Date de naissance */}
          <div className="space-y-2">
            <Label htmlFor="date_naissance">Date de naissance</Label>
            <Input
              id="date_naissance"
              type="date"
              value={donnees.date_naissance}
              onChange={e => setDonnees({ ...donnees, date_naissance: e.target.value })}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Link href={`/pigeons/${params.id}`}>
              <Button type="button" variant="outline">
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-[#00685f] hover:bg-[#00554d] text-white"
              disabled={modifierPigeon.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {modifierPigeon.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}

function OptionSexe({ selectionne, onClick, icone, label }: { 
  selectionne: boolean; 
  onClick: () => void; 
  icone: string; 
  label: string 
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
        selectionne 
          ? 'border-[#00685f] bg-[#f5faf8] text-[#00685f]' 
          : 'border-gray-200 hover:border-gray-300'
      )}
    >
      <span className="text-lg">{icone}</span>
      <span className="font-medium">{label}</span>
    </button>
  )
}