export type StatutPfe =
  | "SOUMIS"
  | "EN_ATTENTE_JURY"
  | "JURY_AFFECTE"
  | "SOUTENU"
  | "AJOURNE"
  | "REJETE";

export type OriginePfe = "STAGE_ENTREPRISE" | "CATALOGUE";

export interface PfeProjectDto {
  id: number;
  filiereId: number | null;
  filiereCode: string | null;
  filiereLibelle: string | null;
  titre: string;
  resume: string;
  technologiesCles: string | null;
  binomeEtudiants: string;
  statut: StatutPfe;
  origine: OriginePfe;
  entrepriseAccueil: string | null;
  sujetCatalogueId: number | null;
  etudiant1Id: number | null;
  etudiant1Nom: string | null;
  etudiant2Id: number | null;
  etudiant2Nom: string | null;
  encadrantSouhaiteId: number | null;
  encadrantSouhaiteNom: string | null;
  commentaireValidation: string | null;
  noteFinale: number | null;
  mention: string | null;
  pvVerrouille: boolean;
  dateVerrouillage: string | null;
  nbEvaluations: number;
  monRoleJury: string | null;
  maNoteSaisie: number | null;

  juryId: number | null;
  encadrantId: number | null;
  encadrantNom: string | null;
  rapporteurId: number | null;
  rapporteurNom: string | null;
  presidentHdrId: number | null;
  presidentHdrNom: string | null;
  examinateurIaId: number | null;
  examinateurIaNom: string | null;
  salleSoutenanceId: number | null;
  salleSoutenanceCode: string | null;
  dateSoutenance: string | null;
  scoreAffiniteIa: number | null;
  justificationIa: string | null;
}

export interface SujetCatalogueDto {
  id: number;
  enseignantId: number;
  enseignantNomComplet: string;
  enseignantGrade: string | null;
  filiereId: number;
  filiereCode: string;
  filiereLibelle: string;
  titre: string;
  description: string;
  technologies: string | null;
  placesMax: number;
  placesOccupees: number;
  estDisponible: boolean;
}

export interface CreateSujetCatalogueRequest {
  filiereId: number;
  titre: string;
  description: string;
  technologies?: string;
  placesMax?: number;
  estDisponible?: boolean;
}

export interface SoumettreSujetStageRequest {
  titre: string;
  resume: string;
  technologiesCles?: string;
  entrepriseAccueil: string;
  binomeEtudiantId?: number | null;
  encadrantSouhaiteId?: number | null;
}

export interface ChoisirSujetRequest {
  binomeEtudiantId?: number | null;
}

export interface ValiderSujetRequest {
  accepte: boolean;
  commentaire?: string;
}

export interface MembreJuryDto {
  id: string;
  nom: string;
  prenom?: string;
  role: string;
  grade?: string;
  specialite?: string;
  departement?: string;
  statut?: string;
  scoreAffinite?: number;
}

export interface JuryMembresDto {
  encadrant: MembreJuryDto;
  rapporteur: MembreJuryDto;
  examinateurIa: MembreJuryDto;
  presidentHdr: MembreJuryDto;
}

export interface MatchJuryResponse {
  sujet: string;
  resume: string;
  technologies: string;
  jury: JuryMembresDto;
  scoreMatching: number;
  justification: string;
  modeleUtilise: string;
  statut: string;
}

export interface PlanifierSoutenanceRequest {
  pfeProjetId?: number;
  encadrantId: number;
  rapporteurId: number;
  examinateurIaId: number;
  presidentHdrId: number;
  salleSoutenanceId?: number | null;
  dateSoutenance: string;
  scoreAffiniteIa?: number;
  justificationIa?: string;
}

export interface EvaluationPfeRequest {
  noteTechnique: number;
  noteRapport: number;
  noteDemo: number;
  noteReponses: number;
  commentaire?: string;
}

export interface EvaluationPfeDto {
  id: number;
  pfeProjetId: number;
  evaluateurId: number;
  evaluateurNomComplet: string;
  evaluateurGrade: string | null;
  roleJury: string;
  noteTechnique: number;
  noteRapport: number;
  noteDemo: number;
  noteReponses: number;
  total: number;
  commentaire: string | null;
}

export interface PvSoutenanceDto {
  projet: PfeProjectDto;
  etudiants: string[];
  jury: MembreJuryDto[];
  evaluations: EvaluationPfeDto[];
  noteFinale: number | null;
  mention: string | null;
  dateSoutenance: string | null;
  salle: string | null;
  campus: string | null;
  pvVerrouille: boolean;
  dateVerrouillage: string | null;
}
