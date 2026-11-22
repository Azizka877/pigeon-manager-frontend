// types/sante.ts

/** Pigeon réduit renvoyé par l'API santé (champ pigeon_detail) */
export interface PigeonCompactSante {
  id: string | number
  matricule?: string | null
  race?: string | null
  sexe?: 'M' | 'F' | null
}

export type TypeSoin =
  | 'vaccin'
  | 'traitement'
  | 'vermifuge'
  | 'vitamines'
  | 'controle'
  | 'autre'

export type TypeRappel = 'soin' | 'reproduction' | 'entretien' | 'autre'

/** Intervention de santé sur un pigeon (vaccin, traitement, vermifuge...) */
export interface Soin {
  id: number
  pigeon: string | number
  pigeon_detail: PigeonCompactSante | null
  type_soin: TypeSoin
  produit: string
  dose: string
  /** Date ISO (YYYY-MM-DD) */
  date_soin: string
  rappel_jours: number | null
  /** Calculé côté API : date_soin + rappel_jours (null si pas de rappel) */
  date_rappel: string | null
  notes: string
  created_at?: string
  updated_at?: string
}

/** Rappel manuel du colombier (rendez-vous veto, mirage, nettoyage...) */
export interface Rappel {
  id: number
  titre: string
  type_rappel: TypeRappel
  date_rappel: string
  fait: boolean
  pigeon: string | number | null
  pigeon_detail: PigeonCompactSante | null
  notes: string
  created_at?: string
  updated_at?: string
}

/** Événement du calendrier : rappel manuel, soin réalisé ou rappel automatique */
export interface EvenementAgenda {
  id: string
  db_id: number
  source: 'rappel' | 'soin' | 'rappel_soin'
  titre: string
  type: string
  date: string
  fait: boolean | null
  pigeon: PigeonCompactSante | null
  notes: string
}

export interface AgendaReponse {
  debut: string
  fin: string
  evenements: EvenementAgenda[]
}

/** Chiffres clés santé (dashboard + badges de navigation) */
export interface SanteStats {
  rappels_en_retard: number
  rappels_7_jours: number
  soins_30_jours: number
  aujourdhui: string
  prochains: Rappel[]
}
