'use client'

// ============================================================
// Hook genetique — style React Query, aligne sur les pages et
// sur le backend reel :
//   POST /api/genetique/simulation/  {male_id, femelle_id} (UUID)
//   GET  /api/pigeons/{id}/coi/
//   GET  /api/pigeons/{id}/pedigree/ (PDF + QR)
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import type { Pigeon, ResultatSimulation } from '@/types'

const RAW_API =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://127.0.0.1:8000'
const API_URL = RAW_API.replace(/\/+$/, '').replace(/\/api$/, '')

export type PigeonId = string | number

// ---------------------- Types ----------------------

export interface PigeonResume {
  id?: PigeonId
  matricule?: string
  nom?: string
  bague?: string
  sexe?: string
  race?: string
  coi?: number
}

export interface AncetreCommun {
  id: PigeonId
  matricule: string
  nom: string
  bague: string
  sexe: string
  race: string
  contribution: number
  contribution_pourcent: string
  gen_male: number
  gen_femelle: number
  coi_ancetre: number
}

export interface FichePigeon {
  id: PigeonId
  matricule: string
  sexe: string
  race: string
  coi?: number
}

export interface NiveauConsanguinite {
  coi: number
  coi_pourcent: string
  niveau_label: string
  couleur: string
}

export interface CoiResult {
  coefficient: number
  pourcentage: number
  interpretation: string
  ancetres_communs: AncetreCommun[]
  coi: number
  coi_pourcent: string
  niveau_label: string
  couleur: string
  parents_connus: boolean
}

export type ResultatCoi = CoiResult
export type CoiData = CoiResult

export interface SimulationCoupleResult {
  pere?: PigeonResume | null
  mere?: PigeonResume | null
  coefficient?: number
  pourcentage?: number
  interpretation?: string
  male?: FichePigeon | null
  femelle?: FichePigeon | null
  descendant?: NiveauConsanguinite | null
  profondeur_analyse?: number
  ancetres_communs: AncetreCommun[]
}

export type SimulationData = SimulationCoupleResult

// ---------------------- Types bruts du backend ----------------------

interface ReponseAncetre {
  id: string
  matricule: string
  sexe: string
  race: string
  contribution: number
  contribution_pourcent: string
  gen_male: number
  gen_femelle: number
  coi_ancetre: number
}

interface ReponseCoiPigeon {
  id?: string
  matricule?: string
  coi: number
  coi_pourcent: string
  niveau_label: string
  couleur: string
  parents_connus: boolean
}

// ---------------------- Helpers auth ----------------------

function extraireToken(valeur: string): string | null {
  if (valeur.startsWith('eyJ')) return valeur
  try {
    const obj: unknown = JSON.parse(valeur)
    if (typeof obj === 'string') return extraireToken(obj)
    if (obj && typeof obj === 'object') {
      const record = obj as Record<string, unknown>
      const cles = ['access', 'accessToken', 'access_token', 'token']
      for (const cle of cles) {
        const t = record[cle]
        if (typeof t === 'string' && t.startsWith('eyJ')) return t
      }
    }
  } catch {
    // valeur non JSON : ignoree
  }
  return null
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  const cles = ['access_token', 'accessToken', 'token', 'access']
  for (const cle of cles) {
    const brut =
      window.localStorage.getItem(cle) ?? window.sessionStorage.getItem(cle)
    if (brut) {
      const t = extraireToken(brut)
      if (t) return t
    }
  }
  return null
}

function authHeaders(): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

// ---------------------- Liste complete des pigeons ----------------------

async function chargerTousLesPigeons(): Promise<Pigeon[]> {
  const tous: Pigeon[] = []
  let url: string | null = `${API_URL}/api/pigeons/?page_size=200`
  while (url) {
    const res = await fetch(url, { headers: authHeaders() })
    if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`)
    const json: unknown = await res.json()
    if (Array.isArray(json)) {
      tous.push(...(json as Pigeon[]))
      break
    }
    const page = json as { results?: Pigeon[]; next?: string | null }
    tous.push(...(page.results ?? []))
    url = page.next
      ? page.next.startsWith('http')
        ? page.next
        : `${API_URL}${page.next}`
      : null
  }
  return tous
}

export function useQueryPigeonsTous() {
  return {
    queryKey: ['pigeons', 'tous'] as const,
    queryFn: chargerTousLesPigeons,
  }
}

// ---------------------- Mutation : simulation de couple ----------------------

export function useSimulationCouple() {
  return useMutation<
    ResultatSimulation,
    Error,
    { maleId: PigeonId; femelleId: PigeonId }
  >({
    mutationFn: async ({ maleId, femelleId }) => {
      const res = await fetch(`${API_URL}/api/genetique/simulation/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          male_id: String(maleId),
          femelle_id: String(femelleId),
        }),
      })
      if (!res.ok) {
        let detail = `Erreur HTTP ${res.status}`
        try {
          const body = (await res.json()) as { detail?: string }
          if (body && body.detail) detail = body.detail
        } catch {
          // corps non JSON
        }
        const erreur = new Error(detail) as Error & {
          response?: { data: { detail: string } }
        }
        erreur.response = { data: { detail } }
        throw erreur
      }
      const brut = (await res.json()) as ResultatSimulation
      // Le backend renvoie les COI des parents en fraction (0.125) :
      // converti en pourcentage pour l'affichage de la page.
      return {
        ...brut,
        male: brut.male
          ? { ...brut.male, coi: (brut.male.coi ?? 0) * 100 }
          : brut.male,
        femelle: brut.femelle
          ? { ...brut.femelle, coi: (brut.femelle.coi ?? 0) * 100 }
          : brut.femelle,
      }
    },
  })
}

export const useSimulerCouplage = useSimulationCouple

// ---------------- Hook : COI d'un couple (auto) ----------------

function mapperAncetre(a: ReponseAncetre): AncetreCommun {
  return {
    id: a.id,
    matricule: a.matricule,
    nom: a.matricule,
    bague: a.matricule,
    sexe: a.sexe,
    race: a.race,
    contribution: a.contribution,
    contribution_pourcent: a.contribution_pourcent,
    gen_male: a.gen_male,
    gen_femelle: a.gen_femelle,
    coi_ancetre: a.coi_ancetre,
  }
}

function mapperCoiPigeon(r: ReponseCoiPigeon): CoiResult {
  const texte = r.niveau_label || 'Non calculable'
  return {
    coefficient: r.coi,
    pourcentage: r.coi * 100,
    interpretation: texte,
    ancetres_communs: [],
    coi: r.coi,
    coi_pourcent: r.coi_pourcent,
    niveau_label: texte,
    couleur: r.couleur,
    parents_connus: r.parents_connus,
  }
}

export function useCoi(pereId: PigeonId | null, mereId: PigeonId | null) {
  const [data, setData] = useState<CoiResult | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const actif =
    pereId !== null && mereId !== null && pereId !== '' && mereId !== ''

  const refetch = useCallback(async (): Promise<CoiResult | null> => {
    if (pereId === null || mereId === null) return null
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/genetique/simulation/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          male_id: String(pereId),
          femelle_id: String(mereId),
        }),
      })
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`)
      const json = (await res.json()) as SimulationCoupleResult
      const desc = json.descendant
      if (!desc) throw new Error('Reponse simulation incomplete')
      const resultat: CoiResult = {
        coefficient: desc.coi,
        pourcentage: desc.coi * 100,
        interpretation: desc.niveau_label,
        ancetres_communs: json.ancetres_communs ?? [],
        coi: desc.coi,
        coi_pourcent: desc.coi_pourcent,
        niveau_label: desc.niveau_label,
        couleur: desc.couleur,
        parents_connus: true,
      }
      setData(resultat)
      return resultat
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
      setData(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [pereId, mereId])

  useEffect(() => {
    if (!actif) {
      setData(null)
      setError(null)
      return
    }
    void refetch()
  }, [actif, refetch])

  return { data, isLoading, error, isError: error !== null, refetch }
}

export const useCOI = useCoi
export const useCalculCoi = useCoi

// ---------------- Hook : COI d'un pigeon precis ----------------

export function useCoiPigeon(pigeonId: PigeonId | null) {
  const [data, setData] = useState<CoiResult | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async (): Promise<CoiResult | null> => {
    if (pigeonId === null || pigeonId === '') return null
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/pigeons/${pigeonId}/coi/`, {
        method: 'GET',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`)
      const json = (await res.json()) as ReponseCoiPigeon
      const resultat = mapperCoiPigeon(json)
      setData(resultat)
      return resultat
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
      setData(null)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [pigeonId])

  useEffect(() => {
    if (pigeonId === null || pigeonId === '') {
      setData(null)
      setError(null)
      return
    }
    void refetch()
  }, [pigeonId, refetch])

  return { data, isLoading, error, isError: error !== null, refetch }
}

// ---------------- Pedigree PDF ----------------

export async function telechargerPedigreePdf(
  pigeonId: PigeonId,
  bague?: string
): Promise<boolean> {
  const res = await fetch(`${API_URL}/api/pigeons/${pigeonId}/pedigree/`, {
    method: 'GET',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const lien = document.createElement('a')
  lien.href = url
  lien.download = `pedigree-${bague || String(pigeonId)}.pdf`
  document.body.appendChild(lien)
  lien.click()
  lien.remove()
  URL.revokeObjectURL(url)
  return true
}

export function usePedigreePdf() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const telecharger = useCallback(
    async (pigeonId: PigeonId, bague?: string): Promise<boolean> => {
      setIsLoading(true)
      setError(null)
      try {
        await telechargerPedigreePdf(pigeonId, bague)
        return true
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Erreur inconnue')
        return false
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { telecharger, isLoading, error, isError: error !== null }
}

export const useTelechargerPedigree = usePedigreePdf
