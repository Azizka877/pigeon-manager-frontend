'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCages } from '@/hooks/use-cages'

export function OccupationGauge() {
  const { data: cages, isLoading } = useCages()

  const total = cages?.length || 0
  const occupees = cages?.filter((c) => c.occupation_actuelle).length || 0
  const libres = total - occupees
  const taux = total > 0 ? Math.round((occupees / total) * 100) : 0

  // Couleur selon le taux
  const color = taux > 90 ? 'text-destructive' : taux > 70 ? 'text-orange-500' : 'text-emerald-600'
  const bgColor = taux > 90 ? 'bg-destructive' : taux > 70 ? 'bg-orange-500' : 'bg-emerald-500'

  return (
    <Card className="rounded-2xl border-outline-variant/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-on-surface">Taux d'occupation</CardTitle>
        <p className="mt-0.5 text-xs text-on-surface-variant">Capacité de votre volière</p>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        {isLoading ? (
          <div className="h-32 w-32 animate-pulse rounded-full bg-surface-container-high" />
        ) : (
          <>
            <div className="relative h-32 w-32">
              {/* Cercle de fond */}
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-surface-container-high"
                />
                {/* Cercle de progression */}
                <circle
                  cx="50" cy="50" r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - taux / 100)}`}
                  className={color}
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              {/* Texte au centre */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${color}`}>{taux}%</span>
                <span className="text-xs text-on-surface-variant">{occupees}/{total}</span>
              </div>
            </div>

            {/* Légende */}
            <div className="mt-4 flex items-center gap-5">
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${bgColor}`} />
                <p className="text-sm text-on-surface-variant">
                  <span className="font-medium text-on-surface">{occupees}</span> occupée{occupees > 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-sm text-on-surface-variant">
                  <span className="font-medium text-emerald-600">{libres}</span> libre{libres > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}