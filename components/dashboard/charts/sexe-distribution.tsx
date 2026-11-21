'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePigeons } from '@/hooks/use-pigeons'
import { Mars, Venus, HelpCircle } from 'lucide-react'

export function SexeDistribution() {
  const { data: pigeons, isLoading } = usePigeons()

  const stats = {
    male: pigeons?.filter((p) => p.sexe === 'M').length || 0,
    femelle: pigeons?.filter((p) => p.sexe === 'F').length || 0,
    inconnu: pigeons?.filter((p) => p.sexe !== 'M' && p.sexe !== 'F').length || 0,
  }

  const total = stats.male + stats.femelle + stats.inconnu

  return (
    <Card className="rounded-2xl border-outline-variant/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-on-surface">Répartition par sexe</CardTitle>
        <p className="mt-0.5 text-xs text-on-surface-variant">
          {isLoading ? 'Chargement…' : `${total} pigeon${total > 1 ? 's' : ''} au total`}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          [0, 1].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3.5 w-1/2 animate-pulse rounded bg-surface-container-high" />
              <div className="h-2 w-full animate-pulse rounded-full bg-surface-container-high" />
            </div>
          ))
        ) : (
          <>
            <DistributionBar icon={Mars} label="Mâles" count={stats.male} total={total} color="bg-blue-500" />
            <DistributionBar icon={Venus} label="Femelles" count={stats.femelle} total={total} color="bg-pink-500" />
            {stats.inconnu > 0 && (
              <DistributionBar
                icon={HelpCircle}
                label="Non renseigné"
                count={stats.inconnu}
                total={total}
                color="bg-slate-400"
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function DistributionBar({
  icon: Icon,
  label,
  count,
  total,
  color,
}: {
  icon: React.ElementType
  label: string
  count: number
  total: number
  color: string
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-on-surface-variant" />
          <span className="text-on-surface">{label}</span>
        </div>
        <span className="font-medium text-on-surface">
          {count} ({percentage}%)
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}