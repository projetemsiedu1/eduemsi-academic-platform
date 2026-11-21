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
