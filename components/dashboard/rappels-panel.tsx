// components/dashboard/rappels-panel.tsx
'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStatsSante } from '@/hooks/use-sante'
import { cn } from '@/lib/utils'
import { formatDateLong, formatDateCourte } from '@/lib/cycles'
import { BellRing, CalendarDays, Check } from 'lucide-react'

/** Panneau « À ne pas oublier » : prochains rappels + retards, depuis /api/sante/stats/ */
export function RappelsPanel() {
  const { data: stats, isLoading } = useStatsSante()

  // API santé pas encore déployée → panneau invisible, aucun bruit
  if (isLoading) {
    return (
      <Card className="rounded-2xl border-outline-variant/60">
        <CardHeader className="pb-3">
          <div className="h-6 w-40 animate-pulse rounded-lg bg-surface-container-high" />
        </CardHeader>
        <CardContent className="space-y-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-surface-container-low" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  const prochains = stats.prochains ?? []
  const aujourdhui = stats.aujourdhui
  const total = stats.rappels_en_retard + stats.rappels_7_jours

  return (
    <Card className="rounded-2xl border-outline-variant/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-on-surface">
          <span className="rounded-lg bg-amber-100 p-2">
            <BellRing className="h-4 w-4 text-amber-600" />
          </span>
          À ne pas oublier
          <span
            className={cn(
              'ml-auto inline-flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-semibold',
              stats.rappels_en_retard > 0
                ? 'bg-red-100 text-red-600'
                : 'bg-surface-container-high text-on-surface-variant',
            )}
          >
            {total}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {prochains.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50/70 p-4">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-emerald-800">Colombier à jour</p>
              <p className="text-xs text-emerald-700/80">Aucun rappel en attente cette semaine.</p>
            </div>
          </div>
        ) : (
          prochains.map((r) => {
            const retard = r.date_rappel < aujourdhui
            const aujourdhuiMeme = r.date_rappel === aujourdhui
            return (
              <div
                key={r.id}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-3',
                  retard
                    ? 'border-red-200/70 bg-red-50/70'
                    : aujourdhuiMeme
                      ? 'border-amber-200/70 bg-amber-50/60'
                      : 'border-outline-variant/60 bg-surface-container-low/60',
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-on-surface">{r.titre}</p>
                  <p className="mt-0.5 truncate text-xs text-on-surface-variant">
                    {r.pigeon_detail?.matricule ? `${r.pigeon_detail.matricule} · ` : ''}
                    {formatDateLong(r.date_rappel)}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-md px-2 py-1 text-[10px] font-bold',
                    retard
                      ? 'bg-red-100 text-red-600'
                      : aujourdhuiMeme
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-[#eef7f5] text-[#00685f]',
                  )}
                >
                  {retard ? 'En retard' : aujourdhuiMeme ? "Aujourd'hui" : formatDateCourte(r.date_rappel)}
                </span>
              </div>
            )
          })
        )}

        <Link
          href="/agenda"
          className="mt-1 flex items-center justify-center gap-1.5 rounded-xl border border-outline-variant/60 py-2 text-xs font-medium text-[#00685f] transition-colors hover:bg-[#eef7f5]"
        >
          <CalendarDays className="h-3.5 w-3.5" />
          Voir l'agenda complet
        </Link>
      </CardContent>
    </Card>
  )
}
