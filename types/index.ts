// types/index.ts
export interface Pigeon {
  id: string
  matricule: string
  sexe: 'M' | 'F'
  sexe_display: string
  race: string
  date_naissance: string
  age: number
  couleur: string | null
  poids: number | null
  pere: string | null
  mere: string | null
  statut: 'actif' | 'vendu' | 'mort' | 'perdu'
  statut_display: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Couple {
  id: string
  male: string                    // ← ID du mâle (string)
  male_details: Pigeon | null     // ← Détails du mâle (objet Pigeon)
  femelle: string                 // ← ID de la femelle (string)
  femelle_details: Pigeon | null  // ← Détails de la femelle (objet Pigeon)
  date_formation: string
  date_rupture?: string | null
  statut: 'actif' | 'rompu'
  notes?: string | null
  reproductions_count?: number
}

export interface Occupation {
  type: 'seul' | 'couple'
  date_debut: string
  pigeon: Pigeon | null
  couple: Couple | null
}

export interface Cage {
  id: string
  numero: string
  nom: string | null
  superficie: string
  position_x: number
  position_y: number
  est_active: boolean
  statut_actuel: 'libre' | 'seul' | 'couple'
  occupation_actuelle: Occupation | null
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}


export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  is_active: boolean
  date_joined: string
  last_login: string | null
}

// Type pour les reproductions
export interface Reproduction {
  id: string
  couple: string                    // ← ID du couple (string)
  date_ponte: string
  date_eclosion: string | null
  nombre_oeufs: number
  nombre_jeunes: number
  notes: string | null
  created_at: string
  updated_at: string
  jeunes: string[]                  // ← Tableau d'IDs (pas d'objets Pigeon)

}
export interface TokenResponse {
  access: string
  refresh: string
}

export interface Sortie {
  id: string
  pigeon: string                    // ← ID du pigeon (string)
  type_sortie: 'vente' | 'deces' | 'perte'
  date_sortie: string
  prix: string | null              // ← API retourne string ("320.00") ou null
  acheteur: string | null
  cause: string | null
  circonstances: string | null
  notes: string | null
  created_at: string
}
// Réponse API pour les cages
export interface CagesApiResponse extends PaginatedResponse<Cage> {}