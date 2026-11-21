// components/dashboard/recent-activity.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRecentActivity } from '@/hooks/useRecentActivity'
import { Clock, Home, Bird, Heart, Egg, ShoppingCart, AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

// Mapping type → icône + couleurs Material 3
const ACTIVITY_CONFIG: Record<
  string,
  { icon: React.ElementType; iconBg: string; iconColor: string; label: string }
> = {
  cage: { icon: Home, iconBg: 'bg-primary-container/30', iconColor: 'text-primary', label: 'Cage' },
  pigeon: { icon: Bird, iconBg: 'bg-blue-100', iconColor: 'text-blue-600', label: 'Pigeon' },
  couple: { icon: Heart, iconBg: 'bg-pink-100', iconColor: 'text-pink-600', label: 'Couple' },
  reproduction: { icon: Egg, iconBg: 'bg-amber-100', iconColor: 'text-amber-600', label: 'Repro' },
  sortie: { icon: ShoppingCart, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', label: 'Sortie' },
}

function getActivityConfig(type: string) {
  return (
    ACTIVITY_CONFIG[type] ?? {
      icon: AlertCircle,
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      label: 'Activité',
    }
  )
}

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    if (dateStr.length === 10) {
      date.setHours(0, 0, 0, 0)
    }
    return formatDistanceToNow(date, { addSuffix: true, locale: fr })
  } catch {
    return dateStr
  }
}

export function RecentActivity() {
  const { data, isLoading, error } = useRecentActivity({ limit: 5 })

  const activities = data?.results ?? []

  return (
    <Card className="rounded-2xl border-outline-variant/60">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg font-semibold text-on-surface">Activité récente</CardTitle>
          <p className="mt-0.5 text-xs text-on-surface-variant">Les derniers événements du colombier</p>
        </div>
        <Link
          href="/historique"
          className="group inline-flex items-center gap-1 text-sm font-medium text-primary transition-all hover:gap-1.5"
        >
          Voir tout
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-6 py-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3.5">
                <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-surface-container-high" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3.5 w-2/3 animate-pulse rounded bg-surface-container-high" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-surface-container-high" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            Erreur de chargement
          </div>
        )}

        {!isLoading && !error && activities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="rounded-2xl bg-primary-container/40 p-3">
              <Bird className="h-6 w-6 text-primary" />
            </div>
            <p className="mt-3 text-sm font-medium text-on-surface">Aucune activité pour le moment</p>
            <p className="mt-0.5 text-xs text-on-surface-variant">
              Les événements de votre volière apparaîtront ici.
            </p>
          </div>
        )}

        {!isLoading && !error && activities.length > 0 && (
          <ol>
            {activities.map((activity, index) => {
              const config = getActivityConfig(activity.type)
              return (
                <ActivityItem
                  key={activity.id}
                  icon={config.icon}
                  iconBg={config.iconBg}
                  iconColor={config.iconColor}
                  title={activity.titre}
                  description={activity.description}
                  badge={activity.badge ?? config.label}
                  time={formatRelativeTime(activity.date)}
                  estDernier={index === activities.length - 1}
                />
              )
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}

function ActivityItem({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  badge,
  time,
  estDernier,
}: {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  title: string
  description: string
  badge?: string
  time: string
  estDernier?: boolean
}) {
  return (
    <li className="relative flex items-start gap-3.5 pb-6 last:pb-0">
      {!estDernier && (
        <span className="absolute bottom-1 left-[17px] top-11 w-px bg-outline-variant/50" />
      )}
      <div className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className="min-w-0 flex-1 pt-1">
        <p className="text-sm font-medium text-on-surface">
          {title}
          {badge && (
            <span className="ml-1.5 inline-flex items-center rounded-md bg-surface-container-high px-1.5 py-0.5 font-mono text-[11px] text-on-surface-variant">
              {badge}
            </span>
          )}
        </p>
        <p className="mt-0.5 truncate text-sm text-on-surface-variant">{description}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-on-surface-variant/70">
          <Clock className="h-3 w-3" />
          {time}
        </p>
      </div>
    </li>
  )
}