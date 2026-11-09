export type TypeSalle = 'STANDARD' | 'LI_PC' | 'LR_RESEAUX' | 'AMPHI';
export type TypeContrat = 'PERMANENT' | 'VACATAIRE';
export type StatutPfe = 'SOUMIS' | 'EN_ATTENTE_JURY' | 'JURY_AFFECTE' | 'SOUTENU';
export type StatutAbsence = 'PRESENT' | 'ABSENT_NON_JUSTIFIE' | 'ABSENT_JUSTIFIE' | 'RETARD';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'CHEF_FILIERE'
  | 'RESP_PLANNING'
  | 'RESP_PFE'
  | 'RESP_SCOLARITE'
  | 'ENSEIGNANT_PERMANENT'
  | 'ENSEIGNANT_VACATAIRE'
  | 'ETUDIANT';

export interface CurrentUser {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  campusDefaut: string;
  avatarClass: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface Campus {
  id: number;
  nom: string;
  adresse: string;
  ville: string;
}

export interface Salle {
  id?: number;
  campusId: number;
  campusNom?: string;
  codeSalle: string;
  typeSalle: TypeSalle;
  capacite: number;
  nombrePcOperationnels: number;
  specsEquipements?: string;
  horairesOuverture?: string;
  estDisponible: boolean;
}

export interface Filiere {
  id: number;
  code: string;
  libelle: string;
}

export interface Groupe {
  id?: number;
  filiereId: number;
  filiereCode?: string;
  filiereLibelle?: string;
  campusFixeId: number;
  campusFixeNom?: string;
  codeGroupe: string;
  anneeEtude: number;
  optionSpecialite?: string;
  effectif: number;
  delegueNom?: string;
  laboratoiresRequis: string;
}

export interface Enseignant {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  specialite: string;
  typeContrat: TypeContrat;
  heuresContractuellesSemaine: number;
  disponibilitesFixesJson?: string;
  estActif: boolean;
}

export interface Etudiant {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  groupeId: number;
  groupeCode?: string;
  totalHeuresModuleSemestre: number;
  cumulHeuresAbsence: number;
  estRadieExamen: boolean;
}

export interface MembreJury {
  id: number;
  matricule: string;
  nomComplet: string;
  email: string;
  specialite: string;
  roleJury: string;
  scoreAffinite?: number;
}

export interface PfeJuryResponse {
  pfeId?: number;
  titre: string;
  encadrant: MembreJury;
  rapporteur: MembreJury;
  examinateurIa: MembreJury;
  presidentHdr: MembreJury;
  scoreGlobalAffinite: number;
  justificationIa: string;
  modeExecution: 'OPENROUTER_FREE_AI' | 'OR_TOOLS_LOCAL_FALLBACK';
}

export interface SeancePlannifiee {
  id?: number;
  jour: string;
  creneau: string;
  groupeCode: string;
  salleCode: string;
  campusNom: string;
  enseignantNom: string;
  typeContratEnseignant: TypeContrat;
  matiere: string;
  typeSalleRequis: TypeSalle;
}
