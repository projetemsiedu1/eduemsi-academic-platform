"use client";
import { useState } from "react";
import Link from "next/link";
import { Printer } from "lucide-react";
import { useTimetable } from "@/context/TimetableContext";
import { TimetableHeader } from "@/components/timetable/TimetableHeader";
import { ScheduleGrid } from "@/components/timetable/ScheduleGrid";
export function PlanningGroups() {
  const { groupes, filieres, campuses, seances, mode } = useTimetable();
  const [selected, setSelected] = useState("");
  const active = groupes.find((g) => g.id === selected) ?? groupes[0];
  const sessions = seances.filter((s) => s.groupeId === active?.id);
  const filiere = filieres.find((f) => f.id === active?.filiereId),
    campus = campuses.find((c) => c.id === active?.campusFixeId);
  return (
    <>
      <TimetableHeader
        title="Planning des groupes"
        subtitle="La même grille hebdomadaire, consultable à l’écran et imprimable."
      />
      <main className="planning-content">
        <Link className="planning-text-link" href="/timetable/resources?section=groupes">Créer ou modifier un groupe dans le référentiel</Link>
        <section className="planning-panel planning-group-toolbar">
          <div className="planning-field">
            <label htmlFor="planning-group">Groupe</label>
            <select
              id="planning-group"
              value={active?.id ?? ""}
              onChange={(event) => setSelected(event.target.value)}
            >
              <option value="" disabled>
                Choisir un groupe
              </option>
              {groupes.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.codeGroupe}
                </option>
              ))}
            </select>
          </div>
          {active && (
            <p>
              {active.effectif} étudiants ·{" "}
              {sessions.reduce((sum, s) => sum + s.spanSeances * 1.5, 0)} h
              planifiées
            </p>
          )}
          <button
            className="planning-primary"
            disabled={!active}
            onClick={() => window.print()}
          >
            <Printer size={17} />
            Imprimer / PDF
          </button>
        </section>
        {active ? (
          <div className="planning-printable">
            <p className="planning-print-source">
              {mode === "demo"
                ? "Démonstration — ne pas diffuser comme planning officiel"
                : "Planning partagé EMSI Univora"}
            </p>
            <ScheduleGrid
              seances={sessions}
              viewMode="groupe"
              activeEntityTitle={active.codeGroupe}
              activeEntitySubtitle={
                filiere?.intitule ?? "Filière non renseignée"
              }
              campusName={campus?.nom}
            />
          </div>
        ) : (
          <p className="planning-empty">
            Aucun groupe disponible. Ajoutez un groupe dans les ressources
            académiques.
          </p>
        )}
      </main>
    </>
  );
}
