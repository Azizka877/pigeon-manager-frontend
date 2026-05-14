'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePigeons } from '@/hooks/use-pigeons'
import { Mars, Venus, HelpCircle } from 'lucide-react'

export function SexeDistribution() {
  const { data: pigeons } = usePigeons()

  const stats = {
    male: pigeons?.filter(p => p.sexe === 'M').length || 0,
    femelle: pigeons?.filter(p => p.sexe === 'F').length || 0,
  }

  const total = stats.male + stats.femelle 

  return (
    <Card className="border-outline-variant/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Répartition par sexe</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <DistributionBar 
            icon={Mars} 
            label="Mâles" 
            count={stats.male} 
            total={total} 
            color="bg-blue-500" 
          />
          <DistributionBar 
            icon={Venus} 
            label="Femelles" 
            count={stats.femelle} 
            total={total} 
            color="bg-pink-500" 
          />
          
        </div>
      </CardContent>
    </Card>
  )
}

function DistributionBar({ 
  icon: Icon, 
  label, 
  count, 
  total, 
  color 
}: {
  icon: React.ElementType
  label: string
  count: number
  total: number
  color: string
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-on-surface-variant" />
          <span className="text-on-surface">{label}</span>
        </div>
        <span className="font-medium text-on-surface">{count} ({percentage}%)</span>
      </div>
      <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}