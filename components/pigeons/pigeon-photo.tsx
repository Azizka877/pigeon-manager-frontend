'use client'

// components/pigeons/pigeon-photo.tsx — Avatar photo d'un pigeon.
// Utilise la banque de VRAIES PHOTOS détourées (lib/pigeon-cage-images.ts,
// celle des cages) : le même pigeon garde toujours la même photo, partout
// (volière, fiche détail, pedigree). Sans photo disponible, repli élégant :
// initiales du matricule sur le dégradé signature.

import { Bird } from 'lucide-react'
import { cn } from '@/lib/utils'
import { photoPigeonSeul } from '@/lib/pigeon-cage-images'

interface PigeonPhotoProps {
  /** Id du pigeon (clé stable du choix de photo) */
  pigeonId?: string | null
  /** Matricule : sert au repli (initiales) et au texte alternatif */
  matricule?: string | null
  /** 'M' | 'F' — choisit la banque (gris mâles / fauve femelles) */
  sexe?: string | null
  /** Taille + forme du cadre (h-32 w-32 rounded-2xl, h-16 w-16 rounded-full…) */
  className?: string
  /** Taille du repli : initiales (text-4xl) ou icône oiseau (h-6 w-6) */
  fallbackClassName?: string
  /** 'gradient' = dégradé signature (sur fond clair) • 'verre' = verre dépoli (sur le dégradé) */
  variante?: 'gradient' | 'verre'
}

export function PigeonPhoto({
  pigeonId,
  matricule,
  sexe,
  className,
  fallbackClassName,
  variante = 'gradient',
}: PigeonPhotoProps) {
  const photo = photoPigeonSeul(
    pigeonId ?? undefined,
    sexe === 'F' ? 'F' : sexe === 'M' ? 'M' : undefined,
  )
  const initiales = (matricule ?? '?').slice(-3).toUpperCase()

  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden',
        variante === 'verre'
          ? 'bg-white/10 ring-2 ring-inset ring-white/25'
          : 'bg-gradient-to-br from-[#00685f] via-[#005651] to-[#01352f]',
        className,
      )}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.href}
          alt={`Photo du pigeon ${matricule ?? ''}`}
          draggable={false}
          className="h-full w-full object-contain p-1"
        />
      ) : matricule ? (
        <span
          className={cn(
            'select-none font-bold tracking-wide text-white',
            fallbackClassName ?? 'text-2xl',
          )}
        >
          {initiales}
        </span>
      ) : (
        <Bird className={cn('text-white/70', fallbackClassName ?? 'h-6 w-6')} />
      )}
    </div>
  )
}