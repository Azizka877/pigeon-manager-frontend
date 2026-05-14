// components/activity/activity-feed.tsx
'use client'

import { ActivityItem } from '@/types'
import { Home, Bird, Heart, Egg, ShoppingCart, AlertCircle, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

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
    if (dateStr.length === 10) {
      date.setHours(0, 0, 0, 0)
    }
    return formatDistanceToNow(date, { addSuffix: true, locale: fr })
  } catch {
    return dateStr
  }
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  emptyMessage?: string
}

export function ActivityFeed({ activities, emptyMessage = 'Aucune activité' }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-on-surface-variant">
        <p>{emptyMessage}</p>
      </div>
    )
  }

  // Grouper par date relative
  const groups: Record<string, ActivityItem[]> = {}

  activities.forEach((activity) => {
    const date = new Date(activity.date)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    let groupKey: string
    if (diffDays === 0) groupKey = "Aujourd'hui"
    else if (diffDays === 1) groupKey = 'Hier'
    else if (diffDays < 7) groupKey = 'Cette semaine'
    else if (diffDays < 30) groupKey = 'Ce mois-ci'
    else groupKey = 'Plus ancien'

    if (!groups[groupKey]) groups[groupKey] = []
    groups[groupKey].push(activity)
  })

  const groupOrder = ["Aujourd'hui", 'Hier', 'Cette semaine', 'Ce mois-ci', 'Plus ancien']

  return (
    <div className="space-y-8 mt-6">
      {groupOrder.map(
        (groupKey) =>
          groups[groupKey] && (
            <div key={groupKey}>
              <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3 px-1">
                {groupKey}
              </h3>
              <div className="space-y-3">
                {groups[groupKey].map((activity) => {
                  const config = getActivityConfig(activity.type)
                  const Icon = config.icon

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
                    >
                      <div className={`p-2.5 rounded-full ${config.iconBg} flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${config.iconColor}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium text-on-surface">
                              {activity.titre}
                            </p>
                            <p className="text-sm text-on-surface-variant mt-0.5">
                              {activity.description}
                            </p>
                          </div>
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-surface-container-high text-xs font-medium text-on-surface-variant flex-shrink-0">
                            {activity.badge ?? config.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-xs text-on-surface-variant/70">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatRelativeTime(activity.date)}
                          </span>
                          {activity.utilisateur && (
                            <span>par {activity.utilisateur}</span>
                          )}
                        </div>

                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {Object.entries(activity.metadata)
                              .filter(([_, v]) => v !== null && v !== undefined)
                              .slice(0, 3)
                              .map(([key, value]) => (
                                <span
                                  key={key}
                                  className="px-1.5 py-0.5 rounded bg-surface-container-highest text-[10px] text-on-surface-variant font-mono"
                                >
                                  {key}: {String(value).slice(0, 20)}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
      )}
    </div>
  )
}