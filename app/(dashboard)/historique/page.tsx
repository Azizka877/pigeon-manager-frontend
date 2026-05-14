// app/historique/page.tsx
import { Suspense } from 'react'
import { HistoriqueContent } from '@/components/activity/historique-content'
import { Skeleton } from '@/components/ui/skeleton'

export default function HistoriquePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface mb-2">
          Historique des activités
        </h1>
      </div>
      
      <Suspense
        fallback={
          <div className="space-y-4 mt-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        }
      >
        <HistoriqueContent />
      </Suspense>
    </div>
  )
}