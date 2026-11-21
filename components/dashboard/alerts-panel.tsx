// components/dashboard/alerts-panel.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Package, CheckCircle2 } from 'lucide-react'
import { useCages } from '@/hooks/use-cages'
import { usePigeons } from '@/hooks/use-pigeons'
import Link from 'next/link'

const STYLE_ALERTE = {
  warning: {
    carte: 'border-amber-200/70 bg-amber-50/70',
    icone: 'bg-amber-100 text-amber-600',
    titre: 'text-amber-800',
    texte: 'text-amber-700/80',
    bouton: 'bg-amber-500 text-white hover:bg-amber-600',
  },
  danger: {
    carte: 'border-red-200/70 bg-red-50/70',
    icone: 'bg-red-100 text-red-600',
    titre: 'text-red-800',
    texte: 'text-red-700/80',
    bouton: 'bg-destructive text-white hover:bg-destructive/90',
  },
} as const

export function AlertsPanel() {
  const { data: cages } = useCages()
  const { data: pigeons } = usePigeons()

  // Calcul des pigeons actuellement en cage
  const pigeonsEnCage = new Set<string>()
  cages?.forEach((c) => {
    if (c.occupation_actuelle?.type === 'seul' && c.occupation_actuelle.pigeon) {
      pigeonsEnCage.add(c.occupation_actuelle.pigeon.id)
    }
    if (c.occupation_actuelle?.type === 'couple' && c.occupation_actuelle.couple) {
      if (c.occupation_actuelle.couple.male) pigeonsEnCage.add(c.occupation_actuelle.couple.male)
      if (c.occupation_actuelle.couple.femelle) pigeonsEnCage.add(c.occupation_actuelle.couple.femelle)
    }
  })

  // Pigeons actifs mais pas en cage
  const pigeonsSansCage =
    pigeons?.filter((p) => p.statut === 'actif' && !pigeonsEnCage.has(p.id)).length || 0

  const cagesPleines = cages?.filter((c) => c.occupation_actuelle).length || 0
  const tauxOccupation = cages?.length ? Math.round((cagesPleines / cages.length) * 100) : 0

  const alertes = [
    ...(pigeonsSansCage > 0
      ? [{
          niveau: 'warning' as const,
          icon: Package,
          title: `${pigeonsSansCage} pigeon${pigeonsSansCage > 1 ? 's' : ''} sans cage`,
          description: 'Affectez-les rapidement pour leur bien-être.',
          action: 'Affecter',
          href: '/cages',
        }]
      : []),
    ...(tauxOccupation > 90
      ? [{
          niveau: 'danger' as const,
          icon: AlertTriangle,
          title: 'Cages presque pleines',
          description: `Taux d'occupation à ${tauxOccupation}%. Pensez à ajouter des cages.`,
          action: 'Ajouter',
          href: '/cages/new',
        }]
      : []),
  ]

  if (alertes.length === 0) {
    return (
      <Card className="rounded-2xl border-emerald-200/60 bg-emerald-50/60">
        <CardContent className="flex items-center gap-3 p-5">
          <div className="rounded-full bg-emerald-100 p-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-800">Tout va bien dans le colombier</p>
            <p className="text-xs text-emerald-700/80">Aucune alerte, vos pigeons sont bien logés.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border-outline-variant/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-on-surface">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-destructive" />
          </span>
          Alertes
          <span className="ml-auto inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-destructive/10 px-2 text-xs font-semibold text-destructive">
            {alertes.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alertes.map((alerte, i) => {
          const style = STYLE_ALERTE[alerte.niveau]
          const Icon = alerte.icon
          return (
            <div key={i} className={`rounded-xl border p-4 ${style.carte}`}>
              <div className="flex items-start gap-3">
                <div className={`shrink-0 rounded-lg p-2 ${style.icone}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className={`text-sm font-semibold ${style.titre}`}>{alerte.title}</h4>
                  <p className={`mt-0.5 text-xs leading-relaxed ${style.texte}`}>{alerte.description}</p>
                  <Link
                    href={alerte.href}
                    className={`mt-3 inline-flex h-8 items-center rounded-md px-3 text-xs font-medium transition-colors ${style.bouton}`}
                  >
                    {alerte.action}
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}