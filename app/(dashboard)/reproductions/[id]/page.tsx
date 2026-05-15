// app/reproductions/[id]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useReproduction } from '@/hooks/use-reproductions'
import { useCouple } from '@/hooks/use-couples'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ArrowLeft, 
  Pencil, 
  CheckCircle2, 
  Egg, 
  Calendar, 
  Clock,
  Users,
  Eye,
  Trash2,
  Plus,
  Stethoscope,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function ReproductionDetailPage() {
  const params = useParams()
  const id = params.id as string
  
  const { data: repro, isLoading } = useReproduction(id)
  const { data: couple } = useCouple(repro?.couple || '')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00685f]" />
      </div>
    )
  }

  if (!repro) return <div>Reproduction non trouvée</div>

  const joursDepuisPonte = Math.floor(
    (new Date().getTime() - new Date(repro.date_ponte).getTime()) / (1000 * 60 * 60 * 24)
  )
  
  const dateEclosionPrevue = new Date(repro.date_ponte)
  dateEclosionPrevue.setDate(dateEclosionPrevue.getDate() + 18)

  const getStatutInfo = () => {
    if (!repro.date_eclosion) {
      if (joursDepuisPonte < 15) return { label: 'INCUBATION', classe: 'bg-[#d1fae5] text-[#065f46]' }
      return { label: 'ÉCLOSION IMMINENTE', classe: 'bg-[#ffedd5] text-[#9a3412]' }
    }
    if (repro.nombre_jeunes > 0) {
      const joursDepuisEclosion = Math.floor(
        (new Date().getTime() - new Date(repro.date_eclosion).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (joursDepuisEclosion < 30) return { label: 'SEVRAGE', classe: 'bg-[#00685f] text-white' }
    }
    return { label: 'TERMINÉ', classe: 'bg-gray-200 text-gray-700' }
  }

  const statut = getStatutInfo()

  const timeline = [
    { label: 'PONTE', date: '12/05', active: true, completed: true },
    { label: 'INCUBATION', date: `J ${joursDepuisPonte}/18`, active: joursDepuisPonte < 18, completed: joursDepuisPonte >= 18 },
    { label: 'ÉCLOSION', date: repro.date_eclosion ? new Date(repro.date_eclosion).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : '30/05', active: !!repro.date_eclosion, completed: !!repro.date_eclosion },
    { label: 'SEVRAGE', date: '15/06 - Actuel', active: statut.label === 'SEVRAGE', completed: false },
    { label: 'TERMINÉ', date: '30/06', active: statut.label === 'TERMINÉ', completed: statut.label === 'TERMINÉ' },
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/reproductions">
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Détails de la Reproduction #{repro.id.slice(0, 12).toUpperCase()}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Période printemps-été 2025 • Volière A
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Pencil className="w-4 h-4" />
            Modifier les dates
          </Button>
          <Button className="bg-[#00685f] hover:bg-[#00554d] gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Terminer reproduction
          </Button>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Colonne gauche */}
        <div className="col-span-4 space-y-6">
          
          {/* Couple reproducteur */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Couple reproducteur
              </h3>
              
              {/* Mâle */}
              <Link href={`/pigeons/${couple?.male}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3 hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                  {/* Placeholder image */}
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600" />
                </div>
                <div className="flex-1">
                  <code className="text-sm font-mono bg-white px-2 py-0.5 rounded border">
                    {couple?.male_details?.matricule || 'BE-2023-100456'}
                  </code>
                  <p className="text-sm text-gray-700 mt-1">Mâle - Bleu Barré</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
              </Link>

              {/* Femelle */}
              <Link href={`/pigeons/${couple?.femelle}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-pink-400 to-pink-600" />
                </div>
                <div className="flex-1">
                  <code className="text-sm font-mono bg-white px-2 py-0.5 rounded border">
                    {couple?.femelle_details?.matricule || 'BE-2022-990832'}
                  </code>
                  <p className="text-sm text-gray-700 mt-1">Femelle - Écaillée</p>
                </div>
                <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
              </Link>
            </CardContent>
          </Card>

          {/* État actuel */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                État actuel
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Statut</span>
                <Badge className={cn(statut.classe, 'font-semibold text-xs')}>
                  {statut.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-gray-600">Œufs éclos</span>
                <span className="text-xl font-bold text-[#00685f]">
                  {repro.nombre_jeunes || 0} / {repro.nombre_oeufs || 2}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite */}
        <div className="col-span-8 space-y-6">
          
          {/* Cartes info */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Ponte</p>
                <p className="text-xl font-bold text-gray-900">
                  {new Date(repro.date_ponte).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Il y a {joursDepuisPonte} jours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Éclosion prévue</p>
                <p className="text-xl font-bold text-gray-900">
                  {dateEclosionPrevue.toLocaleDateString('fr-FR')}
                </p>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Estimé à J+18
                </p>
              </CardContent>
            </Card>

            <Card className={cn(repro.date_eclosion && 'border-l-4 border-l-[#00685f]')}>
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Éclosion réelle</p>
                <p className="text-xl font-bold text-gray-900">
                  {repro.date_eclosion 
                    ? new Date(repro.date_eclosion).toLocaleDateString('fr-FR')
                    : '--/--/----'
                  }
                </p>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {repro.date_eclosion ? 'Confirmé par l\'éleveur' : 'Non confirmé'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-6">
                Ligne de temps
              </h3>
              <div className="flex items-center justify-between relative">
                {/* Ligne de connexion */}
                <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
                
                {timeline.map((step, index) => (
                  <div key={step.label} className="flex flex-col items-center gap-2">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                      step.completed ? 'bg-[#00685f] text-white' : 
                      step.active ? 'bg-[#d1fae5] text-[#00685f]' : 
                      'bg-gray-100 text-gray-400'
                    )}>
                      {step.label === 'PONTE' && <Egg className="w-5 h-5" />}
                      {step.label === 'INCUBATION' && <Clock className="w-5 h-5" />}
                      {step.label === 'ÉCLOSION' && <CheckCircle2 className="w-5 h-5" />}
                      {step.label === 'SEVRAGE' && <Users className="w-5 h-5" />}
                      {step.label === 'TERMINÉ' && <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <div className="text-center">
                      <p className={cn(
                        'text-xs font-semibold uppercase',
                        step.completed || step.active ? 'text-gray-900' : 'text-gray-400'
                      )}>
                        {step.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Jeunes de la couvée */}
          {/* Jeunes de la couvée */}
<Card>
  <CardContent className="p-5">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Users className="w-5 h-5 text-[#00685f]" />
        Jeunes de la couvée ({repro.nombre_jeunes})
      </h3>
      <Button variant="ghost" className="text-[#00685f] gap-1">
        <Plus className="w-4 h-4" />
        Ajouter un jeune
      </Button>
    </div>

    {repro.jeunes_details && repro.jeunes_details.length > 0 ? (
      <div className="space-y-3">
        {repro.jeunes_details.map((jeune) => (
          <div key={jeune.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-14 h-14 bg-gray-200 rounded-lg overflow-hidden">
              <div className={cn(
                'w-full h-full',
                jeune.sexe === 'M' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 
                jeune.sexe === 'F' ? 'bg-gradient-to-br from-pink-400 to-pink-600' :
                'bg-gradient-to-br from-gray-400 to-gray-600'
              )} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">
                  {jeune.matricule}
                </code>
                <span className="text-lg">
                  {jeune.sexe === 'M' ? '♂' : jeune.sexe === 'F' ? '♀' : '?'}
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-1">
                {jeune.sexe === 'M' ? 'Mâle' : jeune.sexe === 'F' ? 'Femelle' : 'Sexe indéterminé'}
                {jeune.race ? ` - ${jeune.race}` : ''}
                {jeune.couleur ? ` - ${jeune.couleur}` : ''}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  En volière
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Né le {new Date(repro.date_eclosion || repro.date_ponte).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    ) : repro.nombre_jeunes > 0 ? (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-lg font-semibold text-gray-900">{repro.nombre_jeunes}</p>
        <p className="text-sm text-gray-500">jeune(s) comptabilisé(s)</p>
        <p className="text-xs text-gray-400 mt-2">
          Détails non disponibles
        </p>
      </div>
    ) : (
      <div className="text-center py-8 text-gray-500">
        <Egg className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>Aucun jeune enregistré</p>
        <Button variant="outline" className="mt-3 gap-2">
          <Plus className="w-4 h-4" />
          Ajouter le premier jeune
        </Button>
      </div>
    )}
  </CardContent>
</Card>
        </div>
      </div>

      {/* Actions footer */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <Button variant="outline" className="gap-2">
          <Egg className="w-4 h-4" />
          Noter l'éclosion
        </Button>
        <Button variant="outline" className="gap-2">
          <Stethoscope className="w-4 h-4" />
          Ajouter soin/vaccin
        </Button>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Ajouter une note
        </Button>
      </div>
    </div>
  )
}