import {
  CRENEAUX_OFFICIELS_EMSI,
  JOURS_SEMAINE,
  type Seance,
  type Salle,
  type Groupe,
  type Enseignant,
  type ElementModule,
  type Campus,
  type SchedulingConflict,
} from "@/types/timetable";
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
  resumeParRegle: { regle: string; conforme: boolean; nbViolations: number }[];
}
export function checkTimetableConflicts(
  ctx: ValidationContext,
): VerificationReport {
  const conflicts: SchedulingConflict[] = [];
  const rules = [
    "Références et plages horaires valides",
    "Pas de chevauchement pour un enseignant",
    "Pas de chevauchement pour un groupe",
    "Pas de chevauchement dans une salle",
    "Capacité de salle suffisante",
    "Équipements requis et postes opérationnels",
    "Respect du campus fixe du groupe",
    "Disponibilités renseignées et ressources actives",
  ];
  const counts = rules.map(() => 0);
  const rooms = new Map(ctx.salles.map((x) => [x.id, x])),
    groups = new Map(ctx.groupes.map((x) => [x.id, x])),
    teachers = new Map(ctx.enseignants.map((x) => [x.id, x])),
    elements = new Map(ctx.elements.map((x) => [x.id, x]));
  const start = (session: Seance) =>
    CRENEAUX_OFFICIELS_EMSI.findIndex((c) => c.code === session.numeroCreneau);
  function add(
    rule: number,
    type: SchedulingConflict["type"],
    session: Seance,
    title: string,
    description: string,
    other?: Seance,
  ) {
    counts[rule]++;
    conflicts.push({
      id: `${rule}-${session.id}-${other?.id ?? counts[rule]}`,
      type,
      severite: "CRITIQUE",
      titre: title,
      description,
      seanceId1: session.id,
      seanceId2: other?.id,
      jour: session.jourSemaine,
      creneau: session.numeroCreneau,
    });
  }
  ctx.seances.forEach((session, index) => {
    const room = rooms.get(session.salleId),
      group = groups.get(session.groupeId),
      teacher = teachers.get(session.enseignantId),
      element = elements.get(session.elementModuleId),
      offset = start(session);
    if (
      !room ||
      !group ||
      !teacher ||
      !element ||
      offset < 0 ||
      !Number.isInteger(session.spanSeances) ||
      session.spanSeances < 1 ||
      offset + session.spanSeances > 6 ||
      !JOURS_SEMAINE.some((day) => day.code === session.jourSemaine) ||
      !ctx.campuses.some((c) => c.id === room.campusId)
    ) {
      add(
        0,
        "INVALID_REFERENCE",
        session,
        "Référence ou plage invalide",
        "Une ressource est absente, ou la séance dépasse les créneaux autorisés.",
      );
      return;
    }
    if (room.capacite < group.effectif)
      add(
        4,
        "CAPACITY_OVERFLOW",
        session,
        "Capacité insuffisante",
        `${room.codeSalle} : ${room.capacite} places pour ${group.effectif} étudiants.`,
      );
    const type =
      element.typeSalleRequis ?? (element.necessitePc ? "LI_PC" : "STANDARD");
    if (
      (type === "LI_PC" &&
        (room.typeSalle !== "LI_PC" ||
          room.nombrePcOperationnels < group.effectif)) ||
      (type === "LR_RESEAUX" && room.typeSalle !== "LR_RESEAUX") ||
      (type === "AMPHI" && room.typeSalle !== "AMPHI")
    )
      add(
        5,
        "TP_PC_MISMATCH",
        session,
        "Équipement incompatible",
        `${element.intitule} requiert ${type}${type === "LI_PC" ? " avec un poste opérationnel par étudiant" : ""}.`,
      );
    if (room.campusId !== group.campusFixeId)
      add(
        6,
        "CAMPUS_HOP_SAME_DAY",
        session,
        "Campus fixe non respecté",
        `${group.codeGroupe} est affecté à une salle hors de son campus fixe.`,
      );
    const availability = teacher.disponibilites.find(
      (d) => d.jour === session.jourSemaine,
    );
    const covered = CRENEAUX_OFFICIELS_EMSI.slice(
      offset,
      offset + session.spanSeances,
    );
    if (
      !teacher.estActif ||
      !room.estDisponible ||
      (teacher.disponibilites.length > 0 &&
        covered.some((slot) => !availability?.creneaux.includes(slot.code)))
    )
      add(
        7,
        "TEACHER_UNAVAILABLE",
        session,
        "Ressource indisponible",
        `Vérifiez la disponibilité de ${teacher.prenom} ${teacher.nom} et de ${room.codeSalle} sur toute la plage.`,
      );
    for (const other of ctx.seances.slice(index + 1)) {
      const otherStart = start(other);
      if (
        session.jourSemaine !== other.jourSemaine ||
        otherStart < 0 ||
        offset >= otherStart + other.spanSeances ||
        otherStart >= offset + session.spanSeances
      )
        continue;
      if (session.enseignantId === other.enseignantId)
        add(
          1,
          "TEACHER_DOUBLE_BOOKING",
          session,
          "Chevauchement enseignant",
          `${teacher.prenom} ${teacher.nom} a plusieurs séances sur la même plage.`,
          other,
        );
      if (session.groupeId === other.groupeId)
        add(
          2,
          "GROUP_DOUBLE_BOOKING",
          session,
          "Chevauchement groupe",
          `${group.codeGroupe} a plusieurs séances sur la même plage.`,
          other,
        );
      if (session.salleId === other.salleId)
        add(
          3,
          "ROOM_DOUBLE_BOOKING",
          session,
          "Chevauchement salle",
          `${room.codeSalle} est réservée plusieurs fois sur la même plage.`,
          other,
        );
    }
  });
  return {
    timestamp: ctx.timestamp ?? "Vérification des données affichées",
    totalSeancesVerifiees: ctx.seances.length,
    totalReglesEvaluees: rules.length,
    conflits: conflicts,
    estConforme: conflicts.length === 0,
    resumeParRegle: rules.map((regle, index) => ({
      regle,
      conforme: counts[index] === 0,
      nbViolations: counts[index],
    })),
  };
}
