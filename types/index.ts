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

export interface PigeonEvent {
  id: string
  pigeon: string
  type: 'medical' | 'vaccination' | 'reproduction' | 'concours' | 'autre'
  date: string
  description: string
  created_at: string
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


export interface ColombierConfig {
  id: number
  nom: string
  pays: string
  ville: string
  gps: string | null
  proprietaire: number
  created_at: string
  updated_at: string
}

export interface Plan {
  id: number
  nom: string
  description: string
  prix_mensuel: number
  actif: boolean
  date_debut: string
  date_fin: string | null
}

export interface Invoice {
  id: number
  numero: string
  date: string
  montant: number
  statut: 'payee' | 'en_attente' | 'annulee'
  pdf_url: string | null
}


// types/index.ts
// types/index.ts
export interface HistoriqueItem {
  id: string
  type_action: 'occupation' | 'liberation' | 'nettoyage' | 'creation' | 'modification'
  description: string
  date_action: string
  date_formatee: string
  utilisateur_nom: string
  metadata: Record<string, any>
}

export interface ActivityItem {
  id: string
  type: 'cage' | 'pigeon' | 'couple' | 'reproduction' | 'sortie'
  type_action: string
  titre: string
  description: string
  date: string
  badge?: string
  utilisateur?: string | null
  metadata?: {
    couple_id?: string | null
    pigeon_id?: string | null
    type_occupation?: string
    matricule?: string
    sexe?: string
    male?: string
    femelle?: string
    [key: string]: unknown
  }
}

export interface RecentActivityResponse {
  count: number
  results: ActivityItem[]
}
// ═══════════════════════════════════════════════════════════
// TYPES POUR LES RÉPONSES API SPÉCIFIQUES
// ═══════════════════════════════════════════════════════════

export interface CagesApiResponse extends PaginatedResponse<Cage> {}
export interface PigeonsApiResponse extends PaginatedResponse<Pigeon> {}
export interface CouplesApiResponse extends PaginatedResponse<Couple> {}
export interface ReproductionsApiResponse extends PaginatedResponse<Reproduction> {}
export interface SortiesApiResponse extends PaginatedResponse<Sortie> {}
// Réponse API pour les cages
export interface CagesApiResponse extends PaginatedResponse<Cage> {}






export interface PigeonMini {
  id: string
  matricule: string
  sexe: string
  sexe_display: string
  race: string
  couleur?: string
  generation: number
}

export interface ArbreNode {
  id: string
  matricule: string
  sexe: string
  generation: number
  date_naissance?: string
  pere?: ArbreNode | null
  mere?: ArbreNode | null
}

export interface ArbreResponse {
  pigeon: {
    id: string
    matricule: string
    sexe: string
    generation: number
  }
  arbre: ArbreNode
  profondeur: number
}

export interface ParentsResponse {
  pere: PigeonMini | null
  mere: PigeonMini | null
}

export interface FreresSoeursResponse {
  count: number
  results: PigeonMini[]
}

export interface DescendantsResponse {
  count: number
  results: Array<{
    niveau: number
    relation: string
    pigeon: PigeonMini
  }>
}

export interface JeuneFormData {
  matricule: string
  sexe: 'M' | 'F'
  couleur: string
}

export interface CreateReproductionPayload {
  couple: string
  date_ponte: string
  date_eclosion?: string
  nombre_oeufs?: number
  notes?: string
  // Le backend accepte ce champ pour créer les jeunes
  jeunes?: Array<{
    matricule: string
    sexe: 'M' | 'F'
    couleur: string
  }>
}