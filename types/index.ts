export type StatutPigeon = 'actif' | 'vendu' | 'mort' | 'perdu'

export interface CageOccupationPigeon {
  id: string
  matricule?: string | null
  sexe?: 'M' | 'F' | null
  race?: string | null
  age?: number | null
}


export interface Pigeon {
  id: string
  matricule: string
  sexe: 'M' | 'F'
  sexe_display?: string          // calculé par l'API — absent des formulaires
  race: string | null
  couleur: string | null
  poids: number | null
  statut: string
  statut_display?: string
  date_naissance: string | null
  age: number | null
  pere: string | number | null
  mere: string | number | null
  created_at?: string
  updated_at?: string
}

export interface PigeonEvent {
  id: string
  pigeon: string
  type: 'medical' | 'vaccination' | 'reproduction' | 'concours' | 'autre'
  date: string
  description: string
  created_at: string
}

export interface CoupleMember {
  id: string
  matricule: string
  sexe?: 'M' | 'F' | null
  race?: string | null
  couleur?: string | null
  age?: number | null
}

export interface Couple {
  id: string
  male: string                    
  male_details: Pigeon | null     
  femelle: string                 
  femelle_details: Pigeon | null  
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
  numero: number | string
  nom: string | null
  capacite?: number | null
  statut?: string | null
  date_creation?: string | null
  occupation_actuelle?:
    | {
        type: 'seul' | 'couple'
        pigeon?: CageOccupationPigeon
        couple?: {
          id: string
          male: string | null
          femelle: string | null
          male_details?: CageOccupationPigeon
          femelle_details?: CageOccupationPigeon
        }
        date_debut?: string | null
      }
    | null
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
  
  is_active?: boolean
  date_joined?: string
  last_login?: string | null
}

export interface ReproductionCoupleDetails {
  id: string
  male?: PigeonMini | null
  femelle?: PigeonMini | null
}
export interface Reproduction {
  id: string
  couple: string
  couple_details?: ReproductionCoupleDetails | null
  date_ponte: string
  date_eclosion: string | null
  date_sevrage: string | null
  nombre_oeufs: number
  /** Null tant que l'éclosion n'a pas été notée */
  nombre_eclos: number | null
  nombre_jeunes: number
  notes: string | null
  /** Pigeonneaux bagués de la couvée (détails imbriqués) */
  jeunes_details?: PigeonMini[]
  created_at?: string
}

export interface TokenResponse {
  access: string
  refresh: string
}

export type TypeSortie = 'vente' | 'perte' | 'deces'

export interface Sortie {
  id: string
  /** ID du pigeon sorti (le matricule se retrouve via le registre des pigeons) */
  pigeon: string
  type_sortie: TypeSortie
  date_sortie: string
  /** L'API renvoie un Decimal sérialisé ("320.00") ou null hors vente */
  prix: string | null
  acheteur: string | null
  cause: string | null
  circonstances: string | null
  notes: string | null
  created_at?: string
}

/** Payload de création — prix en string à 2 décimales (DecimalField Django) */
export interface CreateSortiePayload {
  pigeon: string
  type_sortie: TypeSortie
  date_sortie: string
  prix?: string | null
  acheteur?: string | null
  cause?: string | null
  circonstances?: string | null
  notes?: string | null
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
  sexe?: 'M' | 'F' | null
  race?: string | null
  sexe_display?: string
  couleur?: string | null
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
export interface JeuneData {
  matricule: string
  sexe: 'M' | 'F'
  couleur?: string
  race?: string
}

export interface CreateReproductionPayload {
  couple: string
  date_ponte: string
  date_eclosion?: string
  nombre_oeufs?: number
  notes?: string
  jeunes?: Array<{
    matricule: string
    sexe: 'M' | 'F'
    couleur: string
  }>
}