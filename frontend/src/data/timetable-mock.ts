import { CRENEAUX_OFFICIELS_EMSI } from "@/types/timetable";
import {
  Campus,
  Salle,
  Enseignant,
  Filiere,
  OptionFiliere,
  Groupe,
  Module,
  ElementModule,
  Seance,
  TimetableStats,
} from "@/types/timetable";

export const INITIAL_CAMPUSES: Campus[] = [
  {
    id: "camp-centre",
    nom: "Campus Centre (Guéliz)",
    code: "CENTRE",
    adresse: "Avenue Abdelkrim El Khattabi, Guéliz",
    ville: "Marrakech",
    etages: ["RDC", "1er Étage", "2ème Étage", "3ème Étage"],
    description:
      "Campus historique EMSI Marrakech, pôle d’ingénierie et laboratoires informatiques.",
  },
  {
    id: "camp-targa",
    nom: "Campus Targa",
    code: "TARGA",
    adresse: "Route de Targa, Quartier Targa",
    ville: "Marrakech",
    etages: ["RDC", "1er Étage", "2ème Étage"],
    description:
      "Nouveau campus moderne doté d’amphithéâtres haute capacité et d’espaces d’innovation.",
  },
];

export const INITIAL_SALLES: Salle[] = [
  {
    id: "sal-101",
    codeSalle: "Salle 101",
    campusId: "camp-centre",
    etage: "1er Étage",
    typeSalle: "STANDARD",
    capacite: 36,
    nombrePcOperationnels: 0,
    specsEquipements:
      "Vidéoprojecteur HD, Tableau blanc interactif, Climatisation",
    estDisponible: true,
  },
  {
    id: "sal-102",
    codeSalle: "Salle 102",
    campusId: "camp-centre",
    etage: "1er Étage",
    typeSalle: "STANDARD",
    capacite: 36,
    nombrePcOperationnels: 0,
    specsEquipements:
      "Vidéoprojecteur Laser, Sonorisation stéréo, Climatisation",
    estDisponible: true,
  },
  {
    id: "sal-tp02",
    codeSalle: "Lab TP-02",
    campusId: "camp-centre",
    etage: "2ème Étage",
    typeSalle: "LI_PC",
    capacite: 32,
    nombrePcOperationnels: 32,
    specsEquipements:
      "32 PC Dell Precision i7 32GB RAM, GPU NVIDIA RTX 4060, Switch Gigabit dédié",
    estDisponible: true,
  },
  {
    id: "sal-tp03",
    codeSalle: "Lab TP-03",
    campusId: "camp-centre",
    etage: "2ème Étage",
    typeSalle: "LI_PC",
    capacite: 34,
    nombrePcOperationnels: 34,
    specsEquipements:
      "34 PC HP Z2 G9 i7 32GB, Double écran, Environnement Docker/Kubernetes",
    estDisponible: true,
  },
  {
    id: "sal-targa-b11",
    codeSalle: "Salle B11",
    campusId: "camp-targa",
    etage: "RDC",
    typeSalle: "STANDARD",
    capacite: 38,
    nombrePcOperationnels: 0,
    specsEquipements: 'Écran interactif 86", Caméra de visioconférence 4K',
    estDisponible: true,
  },
  {
    id: "sal-targa-b12",
    codeSalle: "Lab TP Targa B12",
    campusId: "camp-targa",
    etage: "1er Étage",
    typeSalle: "LI_PC",
    capacite: 32,
    nombrePcOperationnels: 32,
    specsEquipements:
      "32 Postes HP Z2 Workstation i9 64GB, Environnement Big Data & IA",
    estDisponible: true,
  },
  {
    id: "sal-targa-amphi1",
    codeSalle: "Amphi Targa 1",
    campusId: "camp-targa",
    etage: "RDC",
    typeSalle: "AMPHI",
    capacite: 130,
    nombrePcOperationnels: 0,
    specsEquipements:
      "Double vidéoprojection synchronisée, Régie audio, Micros cravate sans fil",
    estDisponible: true,
  },
];

export const INITIAL_ENSEIGNANTS: Enseignant[] = [
  {
    id: "ens-benassou",
    matricule: "ENS-MRK-014",
    nom: "Benassou",
    prenom: "Karim",
    email: "k.benassou@emsi.ma",
    telephone: "+212 6 61 24 58 90",
    specialite: "Génie Logiciel & Architecture Spring Cloud",
    typeContrat: "PERMANENT",
    heuresContractuellesSemaine: 18,
    estActif: true,
    competencesModulesIds: ["mod-iir-501", "mod-iir-301"],
    disponibilites: [
      {
        jour: "LUNDI",
        creneaux: ["S1_08H30", "S2_10H15", "S3_12H00", "S4_13H45"],
      },
      {
        jour: "MARDI",
        creneaux: ["S1_08H30", "S2_10H15", "S3_12H00", "S4_13H45"],
      },
      { jour: "MERCREDI", creneaux: ["S1_08H30", "S2_10H15"] },
      { jour: "JEUDI", creneaux: ["S1_08H30", "S2_10H15", "S3_12H00"] },
      { jour: "VENDREDI", creneaux: ["S1_08H30", "S2_10H15"] },
    ],
  },
  {
    id: "ens-zgandri",
    matricule: "ENS-MRK-029",
    nom: "Zgandri",
    prenom: "Nadia",
    email: "n.zgandri@emsi.ma",
    telephone: "+212 6 62 10 33 44",
    specialite: "Technologies Web Modernes (React/Next.js & Cloud)",
    typeContrat: "PERMANENT",
    heuresContractuellesSemaine: 18,
    estActif: true,
    competencesModulesIds: ["mod-iir-502", "mod-iir-301"],
    disponibilites: [
      {
        jour: "LUNDI",
        creneaux: ["S1_08H30", "S2_10H15", "S4_13H45", "S5_15H30"],
      },
      {
        jour: "MARDI",
        creneaux: ["S1_08H30", "S2_10H15", "S3_12H00", "S4_13H45"],
      },
      { jour: "MERCREDI", creneaux: ["S1_08H30", "S2_10H15", "S3_12H00"] },
      { jour: "JEUDI", creneaux: ["S1_08H30", "S2_10H15"] },
    ],
  },
  {
    id: "ens-mamoun",
    matricule: "ENS-MRK-038",
    nom: "Mamoun",
    prenom: "Youssef",
    email: "y.mamoun@emsi.ma",
    telephone: "+212 6 63 99 12 77",
    specialite: "Réseaux Informatiques & Cybersécurité Opérationnelle",
    typeContrat: "PERMANENT",
    heuresContractuellesSemaine: 18,
    estActif: true,
    competencesModulesIds: ["mod-iir-504"],
    disponibilites: [
      { jour: "LUNDI", creneaux: ["S3_12H00", "S4_13H45", "S5_15H30"] },
      {
        jour: "MERCREDI",
        creneaux: ["S1_08H30", "S2_10H15", "S3_12H00", "S4_13H45"],
      },
      { jour: "JEUDI", creneaux: ["S1_08H30", "S2_10H15", "S4_13H45"] },
      { jour: "VENDREDI", creneaux: ["S1_08H30", "S2_10H15", "S3_12H00"] },
    ],
  },
  {
    id: "ens-alami",
    matricule: "VAC-MRK-007",
    nom: "Alami",
    prenom: "Omar",
    email: "o.alami@consultant-emsi.ma",
    telephone: "+212 6 70 88 55 12",
    specialite: "Big Data Architectures, Apache Spark & MongoDB",
    typeContrat: "VACATAIRE",
    heuresContractuellesSemaine: 8,
    estActif: true,
    competencesModulesIds: ["mod-iir-503"],
    disponibilites: [
      {
        jour: "MERCREDI",
        creneaux: ["S1_08H30", "S2_10H15", "S3_12H00", "S4_13H45"],
      },
      {
        jour: "VENDREDI",
        creneaux: ["S1_08H30", "S2_10H15", "S3_12H00", "S4_13H45"],
      },
    ],
  },
  {
    id: "ens-bensouda",
    matricule: "VAC-MRK-019",
    nom: "Bensouda",
    prenom: "Leila",
    email: "l.bensouda@ai-emsi.ma",
    telephone: "+212 6 71 44 22 99",
    specialite: "Intelligence Artificielle & Traitement du Langage Naturel",
    typeContrat: "VACATAIRE",
    heuresContractuellesSemaine: 8,
    estActif: true,
    competencesModulesIds: ["mod-iir-505"],
    disponibilites: [
      {
        jour: "JEUDI",
        creneaux: ["S1_08H30", "S2_10H15", "S3_12H00", "S4_13H45"],
      },
      { jour: "SAMEDI", creneaux: ["S1_08H30", "S2_10H15", "S3_12H00"] },
    ],
  },
];

export const INITIAL_FILIERES: Filiere[] = [
  {
    id: "fil-iir",
    codeFiliere: "IIR",
    intitule: "Ingénierie Informatique et Réseaux",
    cycle: "Cycle Ingénieur (5 ans)",
    description:
      "Formation d’ingénieurs en développement logiciel, systèmes d’information, cloud et réseaux.",
  },
  {
    id: "fil-ia-sd",
    codeFiliere: "IA-SD",
    intitule: "Intelligence Artificielle et Sciences des Données",
    cycle: "Cycle Ingénieur (5 ans)",
    description:
      "Spécialisation avancée en modélisation mathématique, apprentissage profond et MLOps.",
  },
];

export const INITIAL_OPTIONS: OptionFiliere[] = [
  {
    id: "opt-2dsi",
    codeOption: "2DSI",
    intitule: "Développement Digital et Systèmes d’Information",
    filiereId: "fil-iir",
  },
  {
    id: "opt-scir",
    codeOption: "SCIR",
    intitule: "Systèmes Communicants, IoT et Réseaux",
    filiereId: "fil-iir",
  },
];

export const INITIAL_GROUPES: Groupe[] = [
  {
    id: "grp-5iir-2dsi-g1",
    codeGroupe: "5IIR 2DSI G1",
    filiereId: "fil-iir",
    optionId: "opt-2dsi",
    anneeEtude: 5,
    effectif: 30,
    delegueNom: "Amine El Fassi",
    campusFixeId: "camp-centre",
    laboratoiresRequis: "LI_PC",
  },
  {
    id: "grp-5iir-2dsi-g2",
    codeGroupe: "5IIR 2DSI G2",
    filiereId: "fil-iir",
    optionId: "opt-2dsi",
    anneeEtude: 5,
    effectif: 28,
    delegueNom: "Sara Mansouri",
    campusFixeId: "camp-centre",
    laboratoiresRequis: "LI_PC",
  },
  {
    id: "grp-3iir-g1",
    codeGroupe: "3IIR G1",
    filiereId: "fil-iir",
    anneeEtude: 3,
    effectif: 32,
    delegueNom: "Mehdi Chraibi",
    campusFixeId: "camp-targa",
    laboratoiresRequis: "LI_PC",
  },
];

export const INITIAL_MODULES: Module[] = [
  {
    id: "mod-iir-501",
    codeModule: "IIR501",
    intitule: "Architecture Entreprise Java Spring Boot",
    filiereId: "fil-iir",
    semestre: "S1",
    volumeHoraireTotal: 45,
  },
  {
    id: "mod-iir-502",
    codeModule: "IIR502",
    intitule: "Développement Web Moderne (React, Next.js)",
    filiereId: "fil-iir",
    semestre: "S1",
    volumeHoraireTotal: 45,
  },
  {
    id: "mod-iir-503",
    codeModule: "IIR503",
    intitule: "Big Data & Écosystème NoSQL (MongoDB)",
    filiereId: "fil-iir",
    semestre: "S1",
    volumeHoraireTotal: 45,
  },
  {
    id: "mod-iir-504",
    codeModule: "IIR504",
    intitule: "Sécurité des Réseaux & Systèmes",
    filiereId: "fil-iir",
    semestre: "S1",
    volumeHoraireTotal: 45,
  },
  {
    id: "mod-iir-505",
    codeModule: "IIR505",
    intitule: "IA & Traitement du Langage Naturel",
    filiereId: "fil-iir",
    semestre: "S1",
    volumeHoraireTotal: 45,
  },
  {
    id: "mod-iir-301",
    codeModule: "IIR301",
    intitule: "Algorithmique Avancée & POO en C++/Java",
    filiereId: "fil-iir",
    semestre: "S1",
    volumeHoraireTotal: 60,
  },
];

export const INITIAL_ELEMENTS: ElementModule[] = [
  {
    id: "elem-501-cm",
    moduleId: "mod-iir-501",
    codeElement: "IIR501-CM",
    intitule: "Cours Architecture & Microservices Spring Boot",
    volumeHoraire: 22,
    typeElement: "COURS",
    necessitePc: false,
  },
  {
    id: "elem-501-tp",
    moduleId: "mod-iir-501",
    codeElement: "IIR501-TP",
    intitule: "TP Spring Cloud, JPA & REST API",
    volumeHoraire: 23,
    typeElement: "TP",
    necessitePc: true,
  },
  {
    id: "elem-502-tp",
    moduleId: "mod-iir-502",
    codeElement: "IIR502-TP",
    intitule: "TP React 19, Next.js App Router & Tailwind CSS",
    volumeHoraire: 45,
    typeElement: "TP",
    necessitePc: true,
  },
  {
    id: "elem-503-tp",
    moduleId: "mod-iir-503",
    codeElement: "IIR503-TP",
    intitule: "TP Clusters MongoDB, Sharding & NoSQL Queries",
    volumeHoraire: 45,
    typeElement: "TP",
    necessitePc: true,
  },
  {
    id: "elem-504-cm",
    moduleId: "mod-iir-504",
    codeElement: "IIR504-CM",
    intitule: "Cours & TD Sécurité Réseaux & Protocoles",
    volumeHoraire: 45,
    typeElement: "TD",
    necessitePc: false,
  },
  {
    id: "elem-505-cm",
    moduleId: "mod-iir-505",
    codeElement: "IIR505-CM",
    intitule: "Cours & Ateliers IA Générative & RAG",
    volumeHoraire: 45,
    typeElement: "COURS",
    necessitePc: false,
  },
  {
    id: "elem-301-cm",
    moduleId: "mod-iir-301",
    codeElement: "IIR301-CM",
    intitule: "Cours Algorithmique & Structures Arborescentes",
    volumeHoraire: 30,
    typeElement: "COURS",
    necessitePc: false,
  },
  {
    id: "elem-301-tp",
    moduleId: "mod-iir-301",
    codeElement: "IIR301-TP",
    intitule: "TP Algorithmique appliquée & C++",
    volumeHoraire: 30,
    typeElement: "TP",
    necessitePc: true,
  },
];

/**
 * SEANCES PLANIFIEES (Jeu de données certifié et sans conflits initiaux)
 * - Groupe 1 : 5IIR 2DSI G1 (Campus Centre)
 * - Groupe 2 : 5IIR 2DSI G2 (Campus Centre)
 * - Groupe 3 : 3IIR G1 (Campus Targa)
 */
export const INITIAL_SEANCES: Seance[] = [
  // --- 5IIR 2DSI G1 (Campus Centre) ---
  {
    id: "sec-g1-lun-s1",
    groupeId: "grp-5iir-2dsi-g1",
    salleId: "sal-102",
    enseignantId: "ens-benassou",
    elementModuleId: "elem-501-cm",
    jourSemaine: "LUNDI",
    numeroCreneau: "S1_08H30",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
    verrouillee: true,
  },
  {
    id: "sec-g1-lun-s2",
    groupeId: "grp-5iir-2dsi-g1",
    salleId: "sal-tp02",
    enseignantId: "ens-benassou",
    elementModuleId: "elem-501-tp",
    jourSemaine: "LUNDI",
    numeroCreneau: "S2_10H15",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
  },
  {
    id: "sec-g1-mar-s1",
    groupeId: "grp-5iir-2dsi-g1",
    salleId: "sal-tp03",
    enseignantId: "ens-zgandri",
    elementModuleId: "elem-502-tp",
    jourSemaine: "MARDI",
    numeroCreneau: "S1_08H30",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
  },
  {
    id: "sec-g1-mar-s2",
    groupeId: "grp-5iir-2dsi-g1",
    salleId: "sal-tp03",
    enseignantId: "ens-zgandri",
    elementModuleId: "elem-502-tp",
    jourSemaine: "MARDI",
    numeroCreneau: "S2_10H15",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
  },
  {
    id: "sec-g1-mer-s1",
    groupeId: "grp-5iir-2dsi-g1",
    salleId: "sal-tp02",
    enseignantId: "ens-alami",
    elementModuleId: "elem-503-tp",
    jourSemaine: "MERCREDI",
    numeroCreneau: "S1_08H30",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
  },
  {
    id: "sec-g1-mer-s2",
    groupeId: "grp-5iir-2dsi-g1",
    salleId: "sal-tp02",
    enseignantId: "ens-alami",
    elementModuleId: "elem-503-tp",
    jourSemaine: "MERCREDI",
    numeroCreneau: "S2_10H15",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
  },
  {
    id: "sec-g1-jeu-s1",
    groupeId: "grp-5iir-2dsi-g1",
    salleId: "sal-101",
    enseignantId: "ens-bensouda",
    elementModuleId: "elem-505-cm",
    jourSemaine: "JEUDI",
    numeroCreneau: "S1_08H30",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
  },
  {
    id: "sec-g1-jeu-s2",
    groupeId: "grp-5iir-2dsi-g1",
    salleId: "sal-101",
    enseignantId: "ens-bensouda",
    elementModuleId: "elem-505-cm",
    jourSemaine: "JEUDI",
    numeroCreneau: "S2_10H15",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
  },
  {
    id: "sec-g1-ven-s1",
    groupeId: "grp-5iir-2dsi-g1",
    salleId: "sal-102",
    enseignantId: "ens-mamoun",
    elementModuleId: "elem-504-cm",
    jourSemaine: "VENDREDI",
    numeroCreneau: "S1_08H30",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
  },
  {
    id: "sec-g1-ven-s2",
    groupeId: "grp-5iir-2dsi-g1",
    salleId: "sal-102",
    enseignantId: "ens-mamoun",
    elementModuleId: "elem-504-cm",
    jourSemaine: "VENDREDI",
    numeroCreneau: "S2_10H15",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
  },

  // --- 5IIR 2DSI G2 (Campus Centre) ---
  {
    id: "sec-g2-lun-s3",
    groupeId: "grp-5iir-2dsi-g2",
    salleId: "sal-102",
    enseignantId: "ens-benassou",
    elementModuleId: "elem-501-cm",
    jourSemaine: "LUNDI",
    numeroCreneau: "S3_12H00",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
  },
  {
    id: "sec-g2-lun-s4",
    groupeId: "grp-5iir-2dsi-g2",
    salleId: "sal-tp02",
    enseignantId: "ens-benassou",
    elementModuleId: "elem-501-tp",
    jourSemaine: "LUNDI",
    numeroCreneau: "S4_13H45",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
  },
  {
    id: "sec-g2-mar-s3",
    groupeId: "grp-5iir-2dsi-g2",
    salleId: "sal-tp03",
    enseignantId: "ens-zgandri",
    elementModuleId: "elem-502-tp",
    jourSemaine: "MARDI",
    numeroCreneau: "S3_12H00",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
  },
  {
    id: "sec-g2-mar-s4",
    groupeId: "grp-5iir-2dsi-g2",
    salleId: "sal-tp03",
    enseignantId: "ens-zgandri",
    elementModuleId: "elem-502-tp",
    jourSemaine: "MARDI",
    numeroCreneau: "S4_13H45",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
  },
  {
    id: "sec-g2-mer-s3",
    groupeId: "grp-5iir-2dsi-g2",
    salleId: "sal-tp02",
    enseignantId: "ens-alami",
    elementModuleId: "elem-503-tp",
    jourSemaine: "MERCREDI",
    numeroCreneau: "S3_12H00",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
  },
  {
    id: "sec-g2-mer-s4",
    groupeId: "grp-5iir-2dsi-g2",
    salleId: "sal-tp02",
    enseignantId: "ens-alami",
    elementModuleId: "elem-503-tp",
    jourSemaine: "MERCREDI",
    numeroCreneau: "S4_13H45",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
  },
  {
    id: "sec-g2-jeu-s3",
    groupeId: "grp-5iir-2dsi-g2",
    salleId: "sal-101",
    enseignantId: "ens-bensouda",
    elementModuleId: "elem-505-cm",
    jourSemaine: "JEUDI",
    numeroCreneau: "S3_12H00",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
  },
  {
    id: "sec-g2-jeu-s4",
    groupeId: "grp-5iir-2dsi-g2",
    salleId: "sal-101",
    enseignantId: "ens-bensouda",
    elementModuleId: "elem-505-cm",
    jourSemaine: "JEUDI",
    numeroCreneau: "S4_13H45",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
  },

  // --- 3IIR G1 (Campus Targa) ---
  {
    id: "sec-g3-mer-s1",
    groupeId: "grp-3iir-g1",
    salleId: "sal-targa-b11",
    enseignantId: "ens-mamoun",
    elementModuleId: "elem-504-cm",
    jourSemaine: "MERCREDI",
    numeroCreneau: "S1_08H30",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
  },
  {
    id: "sec-g3-mer-s2",
    groupeId: "grp-3iir-g1",
    salleId: "sal-targa-b11",
    enseignantId: "ens-mamoun",
    elementModuleId: "elem-504-cm",
    jourSemaine: "MERCREDI",
    numeroCreneau: "S2_10H15",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
  },
  {
    id: "sec-g3-jeu-s1",
    groupeId: "grp-3iir-g1",
    salleId: "sal-targa-b11",
    enseignantId: "ens-benassou",
    elementModuleId: "elem-301-cm",
    jourSemaine: "JEUDI",
    numeroCreneau: "S1_08H30",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
  },
  {
    id: "sec-g3-jeu-s2",
    groupeId: "grp-3iir-g1",
    salleId: "sal-targa-b12",
    enseignantId: "ens-benassou",
    elementModuleId: "elem-301-tp",
    jourSemaine: "JEUDI",
    numeroCreneau: "S2_10H15",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
  },
  {
    id: "sec-g3-sam-s1",
    groupeId: "grp-3iir-g1",
    salleId: "sal-targa-b12",
    enseignantId: "ens-bensouda",
    elementModuleId: "elem-301-tp",
    jourSemaine: "SAMEDI",
    numeroCreneau: "S1_08H30",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
  },
  {
    id: "sec-g3-sam-s2",
    groupeId: "grp-3iir-g1",
    salleId: "sal-targa-b11",
    enseignantId: "ens-bensouda",
    elementModuleId: "elem-301-cm",
    jourSemaine: "SAMEDI",
    numeroCreneau: "S2_10H15",
    spanSeances: 1,
    statutAffectation: "OPTIMAL_CPSAT",
  },
];

/**
 * Calcul dynamique des statistiques du module sans aucune valeur en dur.
 */
export function computeTimetableStats(
  campuses: Campus[],
  salles: Salle[],
  enseignants: Enseignant[],
  modules: Module[],
  groupes: Groupe[],
  seances: Seance[],
): TimetableStats {
  const nbCampus = campuses.length;
  const nbSalles = salles.length;
  const nbSallesTP = salles.filter(
    (s) => s.typeSalle === "LI_PC" || s.typeSalle === "LR_RESEAUX",
  ).length;
  const nbEnseignants = enseignants.length;
  const nbVacataires = enseignants.filter(
    (e) => e.typeContrat === "VACATAIRE",
  ).length;
  const nbPermanents = enseignants.filter(
    (e) => e.typeContrat === "PERMANENT",
  ).length;
  const nbModules = modules.length;
  const nbGroupes = groupes.length;
  const nbSeancesTotal = seances.length;
  const occupied = new Set<string>();
  for (const session of seances) {
    const start = CRENEAUX_OFFICIELS_EMSI.findIndex(
      (slot) => slot.code === session.numeroCreneau,
    );
    if (start < 0 || !salles.some((room) => room.id === session.salleId))
      continue;
    for (const slot of CRENEAUX_OFFICIELS_EMSI.slice(
      start,
      start + session.spanSeances,
    ))
      occupied.add(
        session.salleId + "|" + session.jourSemaine + "|" + slot.code,
      );
  }

  // Taux d'occupation global des salles : (séances totales / (salles * 6 jours * 6 créneaux)) * 100
  const capaciteCreneauxSalles = nbSalles * 6 * 6;
  const tauxOccupationSallesPct =
    capaciteCreneauxSalles > 0
      ? Math.round((occupied.size / capaciteCreneauxSalles) * 1000) / 10
      : 0;

  return {
    nbCampus,
    nbSalles,
    nbSallesTP,
    nbEnseignants,
    nbVacataires,
    nbPermanents,
    nbModules,
    nbGroupes,
    nbSeancesTotal,
    tauxOccupationSallesPct,
  };
}

/**
 * Gestion du stockage local synchronisé pour la démonstration
 */
const STORAGE_KEY_PREFIX = "emsi_univora_timetable_";

export function loadStoredResource<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveStoredResource<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.warn("Erreur de sauvegarde locale :", err);
  }
}

export function clearStoredResources(): void {
  if (typeof window === "undefined") return;
  const keys = [
    "campuses",
    "salles",
    "enseignants",
    "groupes",
    "modules",
    "elements",
    "seances",
  ];
  keys.forEach((k) => localStorage.removeItem(STORAGE_KEY_PREFIX + k));
}
