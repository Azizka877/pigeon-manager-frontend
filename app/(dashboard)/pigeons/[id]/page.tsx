// app/(dashboard)/pigeons/[id]/page.tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import { usePigeon } from '@/hooks/use-pigeons'
import { usePigeonEvents, useCreatePigeonEvent } from '@/hooks/use-pigeon-events'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Pencil, 
  FileText, 
  LogOut, 
  MapPin, 
  ChevronRight,
  ArrowLeft,
  Plus,
  Calendar
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

export default function PigeonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const pigeonId = params.id as string
  
  const { data: pigeon, isLoading } = usePigeon(pigeonId)
  const { data: events, isLoading: eventsLoading } = usePigeonEvents(pigeonId)
  const createEvent = useCreatePigeonEvent()

  const [showEventDialog, setShowEventDialog] = useState(false)
  const [newEvent, setNewEvent] = useState({
    type: 'medical' as 'medical' | 'vaccination' | 'reproduction' | 'concours' | 'autre',
    date: '',
    description: '',
  })

  const handleAddEvent = async () => {
    try {
      await createEvent.mutateAsync({
        pigeonId,
        data: newEvent,
      })
      toast.success('Événement ajouté')
      setShowEventDialog(false)
      setNewEvent({ type: 'medical', date: '', description: '' })
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Erreur')
    }
  }

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
        <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-[#00685f] to-[#00554d] flex items-center justify-center shrink-0">
          <span className="text-4xl text-white font-bold">
            {pigeon.matricule.slice(-3)}
          </span>
        </div>

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

        <div className="flex gap-2">
          <Link href={`/pigeons/${pigeon.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Pencil className="w-4 h-4" />
              Modifier
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
        <CarteStat label="Sexe" value={pigeon.sexe === 'M' ? '♂ Mâle' : '♀ Femelle'} />
        <CarteStat label="Race" value={pigeon.race} />
        <CarteStat label="Couleur" value={pigeon.couleur || 'Non spécifiée'} />
        <CarteStat 
          label="Né le" 
          value={`${new Date(pigeon.date_naissance).toLocaleDateString('fr-FR')}${pigeon.age ? ` (${pigeon.age} an${pigeon.age > 1 ? 's' : ''})` : ''}`} 
        />
      </div>

      {/* Généalogie & Historique */}
      <div className="grid grid-cols-2 gap-6">
        {/* Généalogie */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Généalogie</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <CarteParent 
              type="PÈRE"
              nom={pigeon.pere ? `Père de ${pigeon.matricule}` : 'Inconnu'}
              matricule={pigeon.pere || 'Non enregistré'}
            />
            <CarteParent 
              type="MÈRE"
              nom={pigeon.mere ? `Mère de ${pigeon.matricule}` : 'Inconnue'}
              matricule={pigeon.mere || 'Non enregistrée'}
            />
          </div>
        </Card>

        {/* Historique avec Tabs fonctionnels */}
        <Card className="p-6">
          <Tabs defaultValue="evenements" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="evenements">Événements</TabsTrigger>
              <TabsTrigger value="medical">Médical</TabsTrigger>
            </TabsList>
            
            <TabsContent value="evenements" className="mt-4 space-y-4">
              {/* Bouton ajouter */}
              <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full text-[#00685f] border-[#00685f] hover:bg-[#f5faf8]">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un événement
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nouvel événement</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white"
                        value={newEvent.type}
                        onChange={e => setNewEvent({...newEvent, type: e.target.value as any})}
                      >
                        <option value="medical">Médical</option>
                        <option value="vaccination">Vaccination</option>
                        <option value="reproduction">Reproduction</option>
                        <option value="concours">Concours</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newEvent.date}
                        onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        placeholder="Description..."
                        value={newEvent.description}
                        onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleAddEvent} disabled={createEvent.isPending}>
                        {createEvent.isPending ? 'Ajout...' : 'Ajouter'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Liste des événements */}
              {eventsLoading ? (
                <div className="text-center py-4">Chargement...</div>
              ) : events?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucun événement enregistré</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Événement de création */}
                  <EvenementItem 
                    titre="Enregistré dans le système"
                    date={new Date(pigeon.created_at).toLocaleDateString('fr-FR')}
                    type="creation"
                  />
                  {/* Événements dynamiques */}
                  {events?.map((event) => (
                    <EvenementItem 
                      key={event.id}
                      titre={event.description}
                      date={new Date(event.date).toLocaleDateString('fr-FR')}
                      type={event.type}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="medical" className="mt-4">
              {events?.filter(e => e.type === 'medical').length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucun dossier médical</p>
              ) : (
                <div className="space-y-3">
                  {events?.filter(e => e.type === 'medical').map((event) => (
                    <EvenementItem 
                      key={event.id}
                      titre={event.description}
                      date={new Date(event.date).toLocaleDateString('fr-FR')}
                      type="medical"
                    />
                  ))}
                </div>
              )}
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

function CarteParent({ type, nom, matricule }: { type: string; nom: string; matricule: string }) {
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

function EvenementItem({ titre, date, type }: { titre: string; date: string; type: string }) {
  const colorMap: Record<string, string> = {
    creation: 'bg-green-500',
    medical: 'bg-blue-500',
    vaccination: 'bg-purple-500',
    reproduction: 'bg-pink-500',
    concours: 'bg-yellow-500',
    autre: 'bg-gray-500',
  }

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={cn('w-2 h-2 rounded-full', colorMap[type] || 'bg-gray-300')} />
        <div className="w-px flex-1 bg-gray-200 my-1" />
      </div>
      <div className="pb-4">
        <p className="font-medium text-gray-900">{titre}</p>
        <p className="text-sm text-gray-500">{date}</p>
      </div>
    </div>
  )
}