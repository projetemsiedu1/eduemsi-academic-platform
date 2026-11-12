import type { CreneauCode, JourSemaine } from "./timetable";

export interface SolverCalendar {
  days: JourSemaine[];
  slots: {
    code: CreneauCode;
    heureDebut: string;
    heureFin: string;
    minutes: number;
  }[];
  lunchStart: string;
  lunchEnd: string;
  slotMinutes: number;
  label: string;
}
export interface TeachingRequirement {
  id: number;
  groupeId: number;
  elementId: number;
  enseignantId: number;
  weeklySessions: number;
}
export interface TeacherQualification {
  id: number;
  enseignantId: number;
  moduleId: number;
}
export interface SolverConfiguration {
  requirements: TeachingRequirement[];
  qualifications: TeacherQualification[];
}
export interface SolverAssignment {
  requirementId: string;
  groupId: string;
  elementId: string;
  teacherId: string;
  roomId: string;
  day: JourSemaine;
  slot: CreneauCode;
}
export interface SolverResult {
  status:
    | "OPTIMAL"
    | "FEASIBLE"
    | "INFEASIBLE"
    | "UNKNOWN"
    | "MODEL_INVALID"
    | "INPUT_INVALID"
    | "NATIVE_UNAVAILABLE"
    | "VALIDATION_FAILED";
  wallTimeSeconds: number;
  requestedSessions: number;
  assignedSessions: number;
  objectiveValue: number | null;
  bestObjectiveBound: number | null;
  assignments: SolverAssignment[];
  diagnostics: string[];
  validated: boolean;
  proposalId: string | null;
  proposalState: "PENDING" | "ACCEPTED" | "REJECTED" | null;
}
