export type SessionExamen = "NORMALE" | "RATTRAPAGE";

export interface ExamenDto {
  id: number;
  moduleId: number;
  codeModule: string;
  intituleModule: string;
  groupeId: number;
  codeGroupe: string;
  effectifGroupe: number;
  salleId: number;
  codeSalle: string;
  capaciteSalle: number;
  campusNom: string | null;
  surveillantPrincipalId: number;
  surveillantPrincipalNom: string;
  surveillantSecondaireId: number | null;
  surveillantSecondaireNom: string | null;
  dateExamen: string;
  heureDebut: string;
  heureFin: string;
  dureeMinutes: number;
  session: SessionExamen;
  consignes: string | null;
}

export interface CreateExamenRequest {
  moduleId: number;
  groupeId: number;
  salleId: number;
  surveillantPrincipalId: number;
  surveillantSecondaireId?: number | null;
  dateExamen: string;
  heureDebut: string;
  dureeMinutes: number;
  session: SessionExamen;
  consignes?: string;
}

export interface ExamenAffectation {
  id: number;
  examenId: number;
  etudiantId: number;
  etudiantNom: string;
  etudiantPrenom: string;
  etudiantMatricule: string;
  etudiantEmail: string;
  groupeCode: string;
  salleId: number;
  salleCode: string;
  numeroPlace: number;
  codePlace: string;
  statutPresence: "CONVOQUE" | "PRESENT" | "ABSENT" | "RADIE";
  notifie: boolean;
  estRadie: boolean;
}

export interface ConvocationEtudiant {
  affectationId: number;
  examenId: number;
  moduleCode: string;
  moduleNom: string;
  filiereNom: string;
  session: string;
  dateExamen: string;
  heureDebut: string;
  heureFin: string;
  dureeMinutes: number;
  salleCode: string;
  campusNom: string;
  numeroPlace: number;
  codePlace: string;
  surveillantPrincipalNom: string;
  consignes: string;
  statutPresence: string;
  notifie: boolean;
  estRadie: boolean;
}

export interface AutoPlanificationRequest {
  dateDebut: string;
  nombreJours: number;
  maxModulesParJour: number;
  session: SessionExamen;
  filiereIds?: number[];
  inclureSamedi?: boolean;
  unSurDeux?: boolean;
}
