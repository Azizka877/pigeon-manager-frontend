// components/dashboard/recent-activity.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRecentActivity } from '@/hooks/useRecentActivity'
import { Clock, Home, Bird, Heart, Egg, ShoppingCart, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

// Mapping type → icône + couleurs Material 3
const ACTIVITY_CONFIG: Record<
  string,
  {
    icon: React.ElementType
    iconBg: string
    iconColor: string
    label: string
  }
> = {
  cage: {
    icon: Home,
    iconBg: 'bg-primary-container/30',
    iconColor: 'text-primary',
    label: 'Cage',
  },
  pigeon: {
    icon: Bird,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    label: 'Pigeon',
  },
  couple: {
    icon: Heart,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    label: 'Couple',
  },
  reproduction: {
    icon: Egg,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    label: 'Repro',
  },
  sortie: {
    icon: ShoppingCart,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    label: 'Sortie',
  },
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
    // Gère les dates sans heure (ex: "2026-05-17")
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
    <Card className="border-outline-variant/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Activités récentes</CardTitle>
        <Link href="/historique" className="text-sm text-primary hover:underline">
          Voir tout
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="text-sm text-on-surface-variant py-4 text-center">
            Chargement...
          </div>
        )}

        {error && (
          <div className="text-sm text-red-500 py-4 text-center">
            Erreur de chargement
          </div>
        )}

        {!isLoading && !error && activities.length === 0 && (
          <div className="text-sm text-on-surface-variant py-4 text-center">
            Aucune activité récente
          </div>
        )}

        {activities.map((activity) => {
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
            />
          )
        })}
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
}: {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  title: string
  description: string
  badge?: string
  time: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`p-2 rounded-full ${iconBg} flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-on-surface">
          {title}
          {badge && (
            <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded bg-surface-container-high text-xs font-mono text-on-surface-variant">
              {badge}
            </span>
          )}
        </p>
        <p className="text-sm text-on-surface-variant truncate">{description}</p>
        <p className="text-xs text-on-surface-variant/70 mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {time}
        </p>
      </div>
    </div>
  )
}