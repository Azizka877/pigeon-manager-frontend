// types/dashboard.ts — formes exactes des réponses de l'API dashboard

export interface ColombierInfo {
  nom: string;
  pays: string;
  ville: string;
}

export interface EffectifStats {
  total: number;
  males: number;
  femelles: number;
  jeunes_30j: number;
  par_statut: { actif: number; vendu: number; mort: number; perdu: number };
}

export interface CagesStats {
  total: number;
  libres: number;
  occupees: number;
  couples: number;
}

export interface CouplesStats {
  actifs: number;
}

export interface ReproductionStats {
  incubations_en_cours: number;
  eclosions_prevues_7j: number;
  jeunes_annee: number;
  taux_eclosion: number;
}

export interface FinancesStats {
  revenus_mois: number;
  revenus_annee: number;
  ventes_mois: number;
  prix_moyen: number;
}

export interface SerieMensuelle {
  mois: string;   // "2026-11"
  label: string;  // "Nov."
  total: number;
}

export interface AlerteEclosion {
  type: 'imminente' | 'retard' | 'sevrage';
  titre: string;
  message: string;
  date?: string;
  couple?: number;
}

export interface ActiviteItem {
  type: string;
  titre: string;
  description?: string;
  date: string;
}

export interface DashboardStats {
  colombier: ColombierInfo;
  effectif: EffectifStats;
  cages: CagesStats;
  couples: CouplesStats;
  reproduction: ReproductionStats;
  finances: FinancesStats;
  naissances_par_mois: SerieMensuelle[];
  revenus_par_mois: SerieMensuelle[];
  alertes: AlerteEclosion[];
}

export interface ActivitesResponse {
  count: number;
  results: ActiviteItem[];
}