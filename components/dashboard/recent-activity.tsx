'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCageHistory } from '@/hooks/use-cage-history'
import { Clock, Egg, Syringe, Plane } from 'lucide-react'
import Link from 'next/link'

export function RecentActivity() {
  // On va utiliser l'historique des cages comme activité récente
  // Tu peux adapter selon tes vraies données
  const { data: activities } = useCageHistory('recent') // ou un endpoint dédié

  return (
    <Card className="border-outline-variant/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Activités récentes</CardTitle>
        <Link href="/historique" className="text-sm text-primary hover:underline">
          Voir tout
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mock data - remplace par tes vraies données */}
        <ActivityItem 
          icon={Egg} 
          iconBg="bg-primary-container/30"
          iconColor="text-primary"
          title="Œuf pondu dans la cage"
          badge="A-12"
          time="Il y a 2 heures"
        />
        <ActivityItem 
          icon={Syringe} 
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          title="Vaccination complétée pour"
          badge="FR-23-4412"
          suffix="et 12 autres"
          time="Il y a 5 heures"
        />
        <ActivityItem 
          icon={Plane} 
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          title="Vol d'entraînement enregistré pour"
          badge="BE-22-901"
          suffix="(45km)"
          time="Hier"
        />
      </CardContent>
    </Card>
  )
}

function ActivityItem({ 
  icon: Icon, 
  iconBg, 
  iconColor, 
  title, 
  badge, 
  suffix, 
  time 
}: {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  title: string
  badge?: string
  suffix?: string
  time: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-full ${iconBg} flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-on-surface">
          {title}{' '}
          {badge && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-container-high text-xs font-mono text-on-surface-variant">
              {badge}
            </span>
          )}{' '}
          {suffix && <span className="text-on-surface-variant">{suffix}</span>}
        </p>
        <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {time}
        </p>
      </div>
    </div>
  )
}