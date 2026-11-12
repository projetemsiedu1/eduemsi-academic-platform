export type JourSemaine =
  | "LUNDI"
  | "MARDI"
  | "MERCREDI"
  | "JEUDI"
  | "VENDREDI"
  | "SAMEDI";

export type CreneauCode =
  | "S1_08H30"
  | "S2_10H15"
  | "S3_12H00"
  | "S4_13H45"
  | "S5_15H30"
  | "S6_17H15";

export interface CreneauHoraire {
  code: CreneauCode;
  numero: number;
  heureDebut: string;
  heureFin: string;
  libelleCourt: string;
  libelleComplet: string;
}

export const CRENEAUX_OFFICIELS_EMSI: CreneauHoraire[] = [
  {
    code: "S1_08H30",
    numero: 1,
    heureDebut: "08:30",
    heureFin: "10:00",
    libelleCourt: "S1 (08h30 - 10h00)",
    libelleComplet: "Séance 1 (08h30 à 10h00)",
  },
  {
    code: "S2_10H15",
    numero: 2,
    heureDebut: "10:15",
    heureFin: "11:45",
    libelleCourt: "S2 (10h15 - 11h45)",
    libelleComplet: "Séance 2 (10h15 à 11h45)",
  },
  {
    code: "S3_12H00",
    numero: 3,
    heureDebut: "12:00",
    heureFin: "13:30",
    libelleCourt: "S3 (12h00 - 13h30)",
    libelleComplet: "Séance 3 (12h00 à 13h30)",
  },
  {
    code: "S4_13H45",
    numero: 4,
    heureDebut: "13:45",
    heureFin: "15:15",
    libelleCourt: "S4 (13h45 - 15h15)",
    libelleComplet: "Séance 4 (13h45 à 15h15)",
  },
  {
    code: "S5_15H30",
    numero: 5,
    heureDebut: "15:30",
    heureFin: "17:00",
    libelleCourt: "S5 (15h30 - 17h00)",
    libelleComplet: "Séance 5 (15h30 à 17h00)",
  },
  {
    code: "S6_17H15",
    numero: 6,
    heureDebut: "17:15",
    heureFin: "18:45",
    libelleCourt: "S6 (17h15 - 18h45)",
    libelleComplet: "Séance 6 (17h15 à 18h45)",
  },
];

export const JOURS_SEMAINE: { code: JourSemaine; label: string }[] = [
  { code: "LUNDI", label: "Lundi" },
  { code: "MARDI", label: "Mardi" },
  { code: "MERCREDI", label: "Mercredi" },
  { code: "JEUDI", label: "Jeudi" },
  { code: "VENDREDI", label: "Vendredi" },
  { code: "SAMEDI", label: "Samedi" },
];

export type TypeSalle = "STANDARD" | "LI_PC" | "LR_RESEAUX" | "AMPHI";

export type TypeContrat = "PERMANENT" | "VACATAIRE";

export type TypeElement = "COURS" | "TD" | "TP";

export interface Campus {
  id: string;
  nom: string;
  code: string;
  adresse: string;
  ville: string;
  etages: string[];
  description?: string;
}

export interface Salle {
  id: string;
  codeSalle: string;
  campusId: string;
  etage: string;
  typeSalle: TypeSalle;
  capacite: number;
  nombrePcOperationnels: number;
  specsEquipements: string;
  estDisponible: boolean;
}

export interface DisponibiliteJour {
  jour: JourSemaine;
  creneaux: CreneauCode[];
}

export interface Enseignant {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  specialite: string;
  typeContrat: TypeContrat;
  heuresContractuellesSemaine: number;
  disponibilites: DisponibiliteJour[];
  estActif: boolean;
  competencesModulesIds: string[];
}

export interface Filiere {
  id: string;
  codeFiliere: string;
  intitule: string;
  cycle: string;
  description: string;
}

export interface OptionFiliere {
  id: string;
  codeOption: string;
  intitule: string;
  filiereId: string;
}

export interface Groupe {
  id: string;
  codeGroupe: string;
  filiereId: string;
  optionId?: string;
  anneeEtude: number;
  effectif: number;
  delegueNom: string;
  campusFixeId: string;
  laboratoiresRequis: string;
}

export interface Module {
  id: string;
  codeModule: string;
  intitule: string;
  filiereId: string;
  semestre: string;
  volumeHoraireTotal: number;
}

export interface ElementModule {
  id: string;
  moduleId: string;
  codeElement: string;
  intitule: string;
  volumeHoraire: number;
  typeElement: TypeElement;
  necessitePc: boolean;
  typeSalleRequis?: TypeSalle;
}

export interface BesoinPedagogique {
  id: string;
  elementModuleId: string;
  groupeId: string;
  enseignantId?: string;
  nbSeancesHebdo: number;
  typeSalleRequis: TypeSalle;
}

export interface Seance {
  id: string;
  groupeId: string;
  salleId: string;
  enseignantId: string;
  elementModuleId: string;
  jourSemaine: JourSemaine;
  numeroCreneau: CreneauCode;
  spanSeances: number;
  statutAffectation:
    | "OPTIMAL_CPSAT"
    | "MANUEL"
    | "RESERVE"
    | "CPSAT_OPTIMAL"
    | "CPSAT_FEASIBLE"
    | "PROPOSITION";
  verrouillee?: boolean;
}

export type ConflictSeverity = "CRITIQUE" | "MAJEURE" | "MINEURE";

export type ConflictType =
  | "INVALID_REFERENCE"
  | "TEACHER_DOUBLE_BOOKING"
  | "GROUP_DOUBLE_BOOKING"
  | "ROOM_DOUBLE_BOOKING"
  | "CAPACITY_OVERFLOW"
  | "TP_PC_MISMATCH"
  | "CAMPUS_HOP_SAME_DAY"
  | "TEACHER_UNAVAILABLE";

export interface SchedulingConflict {
  id: string;
  type: ConflictType;
  severite: ConflictSeverity;
  titre: string;
  description: string;
  seanceId1: string;
  seanceId2?: string;
  jour: JourSemaine;
  creneau: CreneauCode;
}

export interface TimetableStats {
  nbCampus: number;
  nbSalles: number;
  nbSallesTP: number;
  nbEnseignants: number;
  nbVacataires: number;
  nbPermanents: number;
  nbModules: number;
  nbGroupes: number;
  nbSeancesTotal: number;
  tauxOccupationSallesPct: number;
}
