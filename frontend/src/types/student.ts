export interface EtudiantProfil {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  groupeId?: number;
  codeGroupe?: string;
  nomFiliere?: string;
  nomCampus?: string;
  totalHeuresModuleSemestre: number;
  cumulHeuresAbsence: number;
  tauxAbsence: number;
  estRadieExamen: boolean;
}

export interface SeanceItem {
  id: number;
  groupeId: number;
  groupeNom: string;
  salleId: number;
  salleCode: string;
  campusNom: string;
  enseignantId: number;
  enseignantNom: string;
  elementModuleId: number;
  elementModuleCode: string;
  elementModuleIntitule: string;
  moduleNom: string;
  jourSemaine: string;
  numeroCreneau: string;
  horaireDebut: string;
  horaireFin: string;
  dureeMinutes: number;
  typeSalle: string;
}

export interface AbsenceItem {
  id: number;
  etudiantId: number;
  etudiantNom: string;
  etudiantPrenom: string;
  etudiantMatricule: string;
  groupeNom: string;
  seanceId?: number;
  moduleNom?: string;
  dateSeance: string;
  statut: string;
  heuresAbsence: number;
  motifJustification?: string;
  valideParScolarite?: boolean;
}

export interface ModuleSyntheseAbsence {
  moduleCode: string;
  moduleNom: string;
  totalHeures: number;
  heuresAbsence: number;
  pourcentage: number;
  seuilDepasse: boolean;
  absencesJustifiees: number;
  absencesNonJustifiees: number;
}

export interface BilanAbsence {
  etudiantId: number;
  matricule: string;
  nomComplet: string;
  groupeNom: string;
  filiereNom: string;
  campusNom: string;
  totalHeuresModuleSemestre: number;
  cumulHeuresAbsence: number;
  pourcentageAbsence: number;
  estRadieExamen: boolean;
  nombreSeancesAbsentes: number;
  nombreSeancesJustifiees: number;
  historiqueAbsences: AbsenceItem[];
  syntheseModules: ModuleSyntheseAbsence[];
}

export interface ScolariteNotification {
  id: number;
  titre: string;
  message: string;
  typeNotification: "SCOLARITE" | "CHANGEMENT_SALLE" | "EXAMEN" | "ALERTE_ASSIDUITE" | "URGENT";
  destinataireUsername?: string;
  destinataireRole?: string;
  lu: boolean;
  dateEnvoi: string;
  lienAction?: string;
}
