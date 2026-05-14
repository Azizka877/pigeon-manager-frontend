'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Package } from 'lucide-react'
import { useCages } from '@/hooks/use-cages'
import { usePigeons } from '@/hooks/use-pigeons'
import { Button } from '@/components/ui/button'

export function AlertsPanel() {
  const { data: cages } = useCages()
  const { data: pigeons } = usePigeons()

  // Calcul des pigeons actuellement en cage
  const pigeonsEnCage = new Set<string>()
  cages?.forEach(c => {
    if (c.occupation_actuelle?.type === 'seul' && c.occupation_actuelle.pigeon) {
      pigeonsEnCage.add(c.occupation_actuelle.pigeon.id)
    }
    if (c.occupation_actuelle?.type === 'couple' && c.occupation_actuelle.couple) {
      if (c.occupation_actuelle.couple.male) pigeonsEnCage.add(c.occupation_actuelle.couple.male)
      if (c.occupation_actuelle.couple.femelle) pigeonsEnCage.add(c.occupation_actuelle.couple.femelle)
    }
  })

  // Pigeons actifs mais pas en cage
  const pigeonsSansCage = pigeons?.filter(p => 
    p.statut === 'actif' && !pigeonsEnCage.has(p.id)
  ).length || 0

  const cagesPleines = cages?.filter(c => c.occupation_actuelle).length || 0
  const tauxOccupation = cages?.length ? Math.round((cagesPleines / cages.length) * 100) : 0

  const alerts = [
    ...(pigeonsSansCage > 0 ? [{
      type: 'warning' as const,
      icon: Package,
      title: `${pigeonsSansCage} pigeon${pigeonsSansCage > 1 ? 's' : ''} sans cage`,
      description: 'Affectez-les rapidement pour leur bien-être.',
      action: 'Affecter',
      href: '/cages'
    }] : []),
    ...(tauxOccupation > 90 ? [{
      type: 'danger' as const,
      icon: AlertTriangle,
      title: 'Cages presque pleines',
      description: `Taux d'occupation à ${tauxOccupation}%. Pensez à ajouter des cages.`,
      action: 'Ajouter',
      href: '/cages/new'
    }] : []),
  ]

  if (alerts.length === 0) {
    return (
      <Card className="border-outline-variant/50 bg-emerald-50/50">
        <CardContent className="p-6">
          <p className="text-sm text-emerald-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Tout va bien ! Aucune alerte.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-error/20 bg-error-container/20">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-destructive flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Alertes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, i) => (
          <div key={i} className="bg-white rounded-lg p-4 border border-error/10">
            <div className="flex items-start gap-3">
              <alert.icon className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-destructive">{alert.title}</h4>
                <p className="text-sm text-destructive/80 mt-1">{alert.description}</p>
                <Button size="sm" variant="destructive" className="mt-3" asChild>
                  <a href={alert.href}>{alert.action}</a>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}