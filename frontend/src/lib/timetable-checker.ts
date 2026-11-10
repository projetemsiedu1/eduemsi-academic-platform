import {
  Seance,
  Salle,
  Groupe,
  Enseignant,
  ElementModule,
  Campus,
  SchedulingConflict,
  JourSemaine,
} from '@/types/timetable';

export interface ValidationContext {
  seances: Seance[];
  salles: Salle[];
  groupes: Groupe[];
  enseignants: Enseignant[];
  elements: ElementModule[];
  campuses: Campus[];
  timestamp?: string;
}

export interface VerificationReport {
  timestamp: string;
  totalSeancesVerifiees: number;
  totalReglesEvaluees: number;
  conflits: SchedulingConflict[];
  estConforme: boolean;
  resumeParRegle: {
    regle: string;
    conforme: boolean;
    nbViolations: number;
  }[];
}

/**
 * Moteur formel de détection des conflits d'emploi du temps EMSI Univora.
 * Vérifie rigoureusement les 7 contraintes d'or de planification.
 */
export function checkTimetableConflicts(ctx: ValidationContext): VerificationReport {
  const { seances, salles, groupes, enseignants, elements, campuses } = ctx;
  const conflits: SchedulingConflict[] = [];

  const salleMap = new Map(salles.map((s) => [s.id, s]));
  const groupeMap = new Map(groupes.map((g) => [g.id, g]));
  const enseignantMap = new Map(enseignants.map((e) => [e.id, e]));
  const elementMap = new Map(elements.map((el) => [el.id, el]));
  const campusMap = new Map(campuses.map((c) => [c.id, c]));

  let regle1Violations = 0; // Enseignant double-booking
  let regle2Violations = 0; // Groupe double-booking
  let regle3Violations = 0; // Salle double-booking
  let regle4Violations = 0; // Capacité insuffisante
  let regle5Violations = 0; // TP PC dans salle standard
  let regle6Violations = 0; // Campus multiple dans la même journée
  let regle7Violations = 0; // Disponibilité enseignant non respectée

  // Comparaisons par paires de séances
  for (let i = 0; i < seances.length; i++) {
    const s1 = seances[i];
    const grp1 = groupeMap.get(s1.groupeId);
    const sal1 = salleMap.get(s1.salleId);
    const ens1 = enseignantMap.get(s1.enseignantId);
    const elem1 = elementMap.get(s1.elementModuleId);

    // --- Règle 4 : Capacité de la salle ---
    if (grp1 && sal1 && sal1.capacite < grp1.effectif) {
      regle4Violations++;
      conflits.push({
        id: `conf-cap-${s1.id}`,
        type: 'CAPACITY_OVERFLOW',
        severite: 'CRITIQUE',
        titre: 'Capacité de salle insuffisante',
        description: `La ${sal1.codeSalle} a une capacité de ${sal1.capacite} places, insuffisante pour le groupe ${grp1.codeGroupe} (${grp1.effectif} étudiants).`,
        seanceId1: s1.id,
        jour: s1.jourSemaine,
        creneau: s1.numeroCreneau,
      });
    }

    // --- Règle 5 : TP PC requiert laboratoire informatique ---
    if (elem1 && elem1.necessitePc && sal1 && sal1.typeSalle !== 'LI_PC') {
      regle5Violations++;
      conflits.push({
        id: `conf-tp-${s1.id}`,
        type: 'TP_PC_MISMATCH',
        severite: 'CRITIQUE',
        titre: 'Laboratoire PC requis pour TP',
        description: `L'élément ${elem1.intitule} exige une salle équipée d'ordinateurs, mais est affecté à ${sal1.codeSalle} (${sal1.typeSalle}).`,
        seanceId1: s1.id,
        jour: s1.jourSemaine,
        creneau: s1.numeroCreneau,
      });
    }

    // --- Règle 7 : Disponibilités déclarées de l'enseignant ---
    if (ens1 && ens1.disponibilites && ens1.disponibilites.length > 0) {
      const dispoJour = ens1.disponibilites.find((d) => d.jour === s1.jourSemaine);
      const estDisponible = dispoJour && dispoJour.creneaux.includes(s1.numeroCreneau);
      if (!estDisponible) {
        regle7Violations++;
        conflits.push({
          id: `conf-dispo-${s1.id}`,
          type: 'TEACHER_UNAVAILABLE',
          severite: ens1.typeContrat === 'VACATAIRE' ? 'CRITIQUE' : 'MAJEURE',
          titre: `Indisponibilité enseignant (${ens1.typeContrat === 'VACATAIRE' ? 'Vacataire' : 'Permanent'})`,
          description: `Pr. ${ens1.nom} n'est pas disponible le ${s1.jourSemaine} sur le créneau ${s1.numeroCreneau}.`,
          seanceId1: s1.id,
          jour: s1.jourSemaine,
          creneau: s1.numeroCreneau,
        });
      }
    }

    // Conflits entre séances simultanées (même jour et même créneau)
    for (let j = i + 1; j < seances.length; j++) {
      const s2 = seances[j];
      if (s1.jourSemaine === s2.jourSemaine && s1.numeroCreneau === s2.numeroCreneau) {
        // --- Règle 1 : Enseignant double-booking ---
        if (s1.enseignantId === s2.enseignantId) {
          regle1Violations++;
          const ens = enseignantMap.get(s1.enseignantId);
          conflits.push({
            id: `conf-ens-${s1.id}-${s2.id}`,
            type: 'TEACHER_DOUBLE_BOOKING',
            severite: 'CRITIQUE',
            titre: 'Collision horaire enseignant',
            description: `Pr. ${ens ? ens.nom : s1.enseignantId} a deux séances simultanées le ${s1.jourSemaine} à ${s1.numeroCreneau}.`,
            seanceId1: s1.id,
            seanceId2: s2.id,
            jour: s1.jourSemaine,
            creneau: s1.numeroCreneau,
          });
        }

        // --- Règle 2 : Groupe double-booking ---
        if (s1.groupeId === s2.groupeId) {
          regle2Violations++;
          const grp = groupeMap.get(s1.groupeId);
          conflits.push({
            id: `conf-grp-${s1.id}-${s2.id}`,
            type: 'GROUP_DOUBLE_BOOKING',
            severite: 'CRITIQUE',
            titre: 'Collision horaire groupe d’étudiants',
            description: `Le groupe ${grp ? grp.codeGroupe : s1.groupeId} a deux séances programmées simultanément le ${s1.jourSemaine} à ${s1.numeroCreneau}.`,
            seanceId1: s1.id,
            seanceId2: s2.id,
            jour: s1.jourSemaine,
            creneau: s1.numeroCreneau,
          });
        }

        // --- Règle 3 : Salle double-booking ---
        if (s1.salleId === s2.salleId) {
          regle3Violations++;
          const sal = salleMap.get(s1.salleId);
          conflits.push({
            id: `conf-sal-${s1.id}-${s2.id}`,
            type: 'ROOM_DOUBLE_BOOKING',
            severite: 'CRITIQUE',
            titre: 'Occupation simultanée de salle',
            description: `La ${sal ? sal.codeSalle : s1.salleId} est attribuée à deux groupes différents le ${s1.jourSemaine} à ${s1.numeroCreneau}.`,
            seanceId1: s1.id,
            seanceId2: s2.id,
            jour: s1.jourSemaine,
            creneau: s1.numeroCreneau,
          });
        }
      }
    }
  }

  // --- Règle 6 : Cohérence Campus unique par jour pour un groupe ---
  const seancesParGroupeEtJour = new Map<string, Seance[]>();
  seances.forEach((s) => {
    const key = `${s.groupeId}__${s.jourSemaine}`;
    const list = seancesParGroupeEtJour.get(key) || [];
    list.push(s);
    seancesParGroupeEtJour.set(key, list);
  });

  seancesParGroupeEtJour.forEach((seancesDuJour, key) => {
    const campusUtilises = new Set<string>();
    seancesDuJour.forEach((s) => {
      const sal = salleMap.get(s.salleId);
      if (sal) campusUtilises.add(sal.campusId);
    });

    if (campusUtilises.size > 1) {
      regle6Violations++;
      const [groupeId, jour] = key.split('__');
      const grp = groupeMap.get(groupeId);
      const nomsCampus = Array.from(campusUtilises)
        .map((cId) => campusMap.get(cId)?.nom || cId)
        .join(' et ');

      conflits.push({
        id: `conf-camp-${key}`,
        type: 'CAMPUS_HOP_SAME_DAY',
        severite: 'CRITIQUE',
        titre: 'Changement de campus interdit dans la même journée',
        description: `Le groupe ${grp?.codeGroupe || groupeId} a des séances réparties sur ${nomsCampus} le ${jour}, ce qui est formellement interdit par le règlement EMSI.`,
        seanceId1: seancesDuJour[0].id,
        seanceId2: seancesDuJour[seancesDuJour.length - 1].id,
        jour: jour as JourSemaine,
        creneau: seancesDuJour[0].numeroCreneau,
      });
    }
  });

  const resumeParRegle = [
    { regle: "Pas de séance double pour un enseignant", conforme: regle1Violations === 0, nbViolations: regle1Violations },
    { regle: "Pas de séance simultanée pour un groupe", conforme: regle2Violations === 0, nbViolations: regle2Violations },
    { regle: "Pas d'occupation concurrente d'une salle", conforme: regle3Violations === 0, nbViolations: regle3Violations },
    { regle: "Capacité de salle suffisante pour l'effectif", conforme: regle4Violations === 0, nbViolations: regle4Violations },
    { regle: "Laboratoire informatique équipé pour les TP", conforme: regle5Violations === 0, nbViolations: regle5Violations },
    { regle: "Unicité du campus par groupe sur la journée", conforme: regle6Violations === 0, nbViolations: regle6Violations },
    { regle: "Respect strict des disponibilités enseignants", conforme: regle7Violations === 0, nbViolations: regle7Violations },
  ];

  return {
    timestamp: ctx.timestamp || 'En continu (Temps réel)',
    totalSeancesVerifiees: seances.length,
    totalReglesEvaluees: 7,
    conflits,
    estConforme: conflits.length === 0,
    resumeParRegle,
  };
}
