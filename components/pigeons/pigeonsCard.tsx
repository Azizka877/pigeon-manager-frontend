'use client'

import Link from 'next/link'
import { Calendar, Eye, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getPigeonImage } from '@/lib/pigeon-images'
import type { Pigeon } from '@/types'

export type { Pigeon }

// ── Badge de statut (sémantique conservée) ───────────────────────────────────
export function getBadgeStatut(statut: string) {
  switch (statut) {
    case 'actif':
      return <Badge className="bg-[#00685f] text-white hover:bg-[#00685f]">ACTIF</Badge>
    case 'vendu':
      return <Badge className="bg-[#fee2e2] text-[#991b1b] hover:bg-[#fee2e2]">VENDU</Badge>
    case 'mort':
      return <Badge className="bg-gray-200 text-gray-700 hover:bg-gray-200">DÉCÉDÉ</Badge>
    case 'perdu':
      return <Badge className="bg-[#ffedd5] text-[#9a3412] hover:bg-[#ffedd5]">PERDU</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-600">INCONNU</Badge>
  }
}

// ── Petits helpers null-friendly ─────────────────────────────────────────────
function ageTexte(pigeon: Pigeon): string {
  if (pigeon.age === null || pigeon.age === undefined) return 'Âge inconnu'
  return `${pigeon.age} an${pigeon.age > 1 ? 's' : ''}`
}

/** « Bleu barré · 452 g » — n'affiche que ce qui existe */
function detailsTexte(pigeon: Pigeon): string {
  const parts: string[] = []
  if (pigeon.couleur) parts.push(pigeon.couleur)
  if (pigeon.poids !== null && pigeon.poids !== undefined) parts.push(`${pigeon.poids} g`)
  return parts.length > 0 ? parts.join(' · ') : 'Détails à compléter'
}

// ── La carte ─────────────────────────────────────────────────────────────────
export function PigeonCard({ pigeon, hideActions = false }: { pigeon: Pigeon; hideActions?: boolean }) {
  const estFemelle = pigeon.sexe === 'F'

  return (
    <div className="group overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-900/10">
      {/* Photo réelle posée sur une ombre douce */}
      <div className="relative h-36 bg-gradient-to-b from-[#eaf4f1] to-white">
        {/* Ombre de contact au sol */}
        <div
          className="absolute inset-x-6 bottom-2 h-3 rounded-full"
          style={{ background: 'radial-gradient(ellipse at center, rgba(15,60,55,0.14), transparent 70%)' }}
          aria-hidden="true"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getPigeonImage(pigeon.id, pigeon.sexe)}
          alt={`Pigeon ${pigeon.matricule}`}
          loading="lazy"
          className="absolute bottom-1.5 left-1/2 h-[86%] -translate-x-1/2 object-contain transition-transform duration-300 group-hover:scale-[1.06]"
          style={{ filter: 'drop-shadow(0 6px 8px rgba(10,40,35,0.18))' }}
        />
        {/* Badge statut */}
        <span className="absolute right-2.5 top-2.5">{getBadgeStatut(pigeon.statut)}</span>
        {/* Matricule en overlay */}
        <code className="absolute bottom-2.5 left-2.5 rounded-md border border-slate-200/80 bg-white/85 px-2 py-0.5 font-mono text-[11.5px] text-slate-700 backdrop-blur-sm">
          {pigeon.matricule}
        </code>
      </div>

      {/* Corps */}
      <div className="space-y-2.5 p-3.5 pt-3">
        <div>
          <p className="text-[14.5px] font-bold leading-tight text-on-surface">
            {pigeon.race || 'Race non renseignée'}
          </p>
          <p className="mt-0.5 text-xs text-on-surface-variant">{detailsTexte(pigeon)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[11px] font-semibold ${
              estFemelle
                ? 'bg-pink-50 text-pink-700 ring-1 ring-pink-100'
                : 'bg-[#e6f2f0] text-[#00564d] ring-1 ring-teal-100'
            }`}
          >
            {estFemelle ? '♀ Femelle' : '♂ Mâle'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2 py-[3px] text-[11px] font-semibold text-on-surface-variant">
            <Calendar className="h-3 w-3" />
            {ageTexte(pigeon)}
          </span>
        </div>

        {!hideActions && (
          <div className="flex gap-2 border-t border-slate-100 pt-2">
            <Link href={`/pigeons/${pigeon.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full gap-1.5 rounded-xl border-outline-variant text-[12.5px] font-semibold text-[#00564d] hover:bg-[#eef7f5] hover:text-[#00685f]">
                <Eye className="h-3.5 w-3.5" />
                Détails
              </Button>
            </Link>
            <Link href={`/pigeons/${pigeon.id}/edit`} className="flex-1">
              <Button variant="ghost" size="sm" className="w-full gap-1.5 rounded-xl bg-surface-container text-[12.5px] font-semibold text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface">
                <Pencil className="h-3.5 w-3.5" />
                Modifier
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default PigeonCard