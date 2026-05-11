'use client'

import { useParams, useRouter } from 'next/navigation'
import { usePigeon } from '@/hooks/use-pigeons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Pencil, 
  FileText, 
  LogOut, 
  MapPin, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function PigeonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: pigeon, isLoading } = usePigeon(params.id as string)

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
    <div className="space-y-6">
      {/* Bouton retour */}
      <Link href="/pigeons">
        <Button variant="ghost" className="gap-2 text-gray-500">
          <ArrowLeft className="w-4 h-4" />
          Retour aux pigeons
        </Button>
      </Link>

      {/* En-tête */}
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-[#00685f] to-[#00554d] flex items-center justify-center shrink-0">
          <span className="text-4xl text-white font-bold">
            {pigeon.matricule.slice(-3)}
          </span>
        </div>

        {/* Infos */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {pigeon.matricule}
            </h1>
            <Badge className="bg-[#d1fae5] text-[#065f46] hover:bg-[#d1fae5]">
              {pigeon.statut_display?.toUpperCase() || 'ACTIF'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-gray-500">
            <MapPin className="w-4 h-4" />
            <span>{pigeon.race}</span>
            {pigeon.couleur && <span>• {pigeon.couleur}</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link href={`/pigeons/${pigeon.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Pencil className="w-4 h-4" />
              Modifier
            </Button>
          </Link>
          <Link href={`/pigeons/${pigeon.id}/pedigree`}>
  <Button variant="outline" className="gap-2">
    <FileText className="w-4 h-4" />
    Pedigree
  </Button>
</Link>
          <Button variant="destructive" className="gap-2 bg-[#ba1a1a] hover:bg-[#991b1b]">
            <LogOut className="w-4 h-4" />
            Enregistrer une sortie
          </Button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-4 gap-4">
        <CarteStat 
          label="Sexe" 
          value={pigeon.sexe === 'M' ? '♂ Mâle' : '♀ Femelle'} 
        />
        <CarteStat 
          label="Race" 
          value={pigeon.race} 
        />
        <CarteStat 
          label="Couleur" 
          value={pigeon.couleur || 'Non spécifiée'} 
        />
        <CarteStat 
          label="Né le" 
          value={`${new Date(pigeon.date_naissance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}${pigeon.age ? ` (${pigeon.age} an${pigeon.age > 1 ? 's' : ''})` : ''}`} 
        />
      </div>

      {/* Généalogie & Historique */}
      <div className="grid grid-cols-2 gap-6">
        {/* Généalogie */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Généalogie</h2>
          
          {/* Parents */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <CarteParent 
              type="PÈRE"
              nom={pigeon.pere ? `Père de ${pigeon.matricule}` : 'Inconnu'}
              matricule={typeof pigeon.pere === 'string' ? pigeon.pere : 'Non enregistré'}
            />
            <CarteParent 
              type="MÈRE"
              nom={pigeon.mere ? `Mère de ${pigeon.matricule}` : 'Inconnue'}
              matricule={typeof pigeon.mere === 'string' ? pigeon.mere : 'Non enregistrée'}
            />
          </div>

          {/* Descendance */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-700">Descendance connue</h3>
              <button className="text-[#00685f] text-sm font-medium hover:underline">
                Voir tout
              </button>
            </div>
            <p className="text-sm text-gray-500 text-center py-4">
              Aucune descendance enregistrée
            </p>
          </div>
        </Card>

        {/* Historique */}
        <Card className="p-6">
          <Tabs defaultValue="evenements">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="evenements" className="flex-1">Événements</TabsTrigger>
              <TabsTrigger value="medical" className="flex-1">Médical</TabsTrigger>
            </TabsList>
            
            <TabsContent value="evenements" className="space-y-4">
              <EvenementChronologie 
                titre="Enregistré dans le système"
                date={new Date(pigeon.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                estPremier
                estDernier
              />
              
              <Button variant="outline" className="w-full text-[#00685f] border-[#00685f] hover:bg-[#f5faf8]">
                Ajouter un événement
              </Button>
            </TabsContent>
            
            <TabsContent value="medical">
              <p className="text-gray-500 text-center py-8">Aucun dossier médical</p>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}

function CarteStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-medium text-gray-900">{value}</p>
    </Card>
  )
}

function CarteParent({ type, nom, matricule }: { 
  type: string; 
  nom: string; 
  matricule: string 
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[#00685f] transition-colors cursor-pointer">
      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
        <span className="text-lg text-gray-400">?</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase">{type}</p>
        <p className="font-medium text-gray-900 truncate">{nom}</p>
        <p className="text-xs text-gray-500 font-mono">{matricule}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </div>
  )
}

function EvenementChronologie({ titre, date, detail, estPremier, estDernier }: { 
  titre: string; 
  date: string; 
  detail?: string;
  estPremier?: boolean;
  estDernier?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={cn(
          'w-2 h-2 rounded-full',
          estPremier ? 'bg-[#00685f]' : 'bg-gray-300'
        )} />
        {!estDernier && <div className="w-px flex-1 bg-gray-200 my-1" />}
      </div>
      <div className="pb-4">
        <p className="font-medium text-gray-900">{titre}</p>
        <p className="text-sm text-gray-500">
          {date} {detail && `• ${detail}`}
        </p>
      </div>
    </div>
  )
}