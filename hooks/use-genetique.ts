'use client'

// hooks/use-genetique.ts — Génétique : simulation de couple (COI) et
// téléchargement du pedigree PDF officiel (avec QR de partage).

import { useMutation } from '@tanstack/react-query'
import apiClient, { genetiqueApi } from '@/lib/api/client'
import type { Pigeon, ResultatSimulation, PaginatedResponse } from '@/types'

/** Résultat d'une simulation de couple (COI du descendant prévu). */
export function useSimulationCouple() {
  return useMutation({
    mutationFn: async ({
      maleId,
      femelleId,
    }: {
      maleId: string
      femelleId: string
    }) => {
      const { data } = await genetiqueApi.simuler(maleId, femelleId)
      return data as ResultatSimulation
    },
  })
}

/**
 * Liste complète des pigeons, toutes pages confondues (l'API pagine à
 * 20). Suivant les liens `next` renvoyés par DRF ; s'arrête à 20 pages
 * par sécurité.
 */
export function useQueryPigeonsTous() {
  return {
    queryKey: ['pigeons', 'tous'],
    queryFn: async (): Promise<Pigeon[]> => {
      const resultats: Pigeon[] = []
      let url: string | null = '/pigeons/'
      let pages = 0
      while (url && pages < 20) {
        const { data }: { data: PaginatedResponse<Pigeon> } = await apiClient.get(url)
        if (Array.isArray(data)) {
          resultats.push(...(data as Pigeon[]))
          break
        }
        resultats.push(...((data.results ?? []) as Pigeon[]))
        url = data.next ?? null
        pages += 1
      }
      return resultats
    },
  }
}

/**
 * Télécharge le pedigree PDF officiel du pigeon (généré par le backend,
 * avec QR de partage public) et déclenche l'enregistrement côté navigateur.
 */
export async function telechargerPedigreePdf(
  pigeonId: string,
  matricule?: string | null,
): Promise<void> {
  const response = await genetiqueApi.pedigreePdf(pigeonId)
  const blob = new Blob([response.data as BlobPart], { type: 'application/pdf' })
  const url = window.URL.createObjectURL(blob)
  const lien = document.createElement('a')
  lien.href = url
  lien.download = `pedigree-${matricule || pigeonId}.pdf`
  document.body.appendChild(lien)
  lien.click()
  lien.remove()
  window.URL.revokeObjectURL(url)
}
