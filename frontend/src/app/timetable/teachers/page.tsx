"use client";
import { useState } from "react";
import { useTimetable } from "@/context/TimetableContext";
import { TimetableHeader } from "@/components/timetable/TimetableHeader";
import { ScheduleGrid } from "@/components/timetable/ScheduleGrid";
export default function TeachersPage() {
  const { enseignants, seances } = useTimetable();
  const [selected, setSelected] = useState("");
  const active = enseignants.find((e) => e.id === selected) ?? enseignants[0];
  const sessions = seances.filter((s) => s.enseignantId === active?.id),
    hours = sessions.reduce((sum, s) => sum + s.spanSeances * 1.5, 0);
  return (
    <>
      <TimetableHeader
        title="Planning des enseignants"
        subtitle="Consultez les affectations et la charge hebdomadaire de chaque enseignant."
      />
      <main className="planning-content">
        <section className="planning-panel planning-group-toolbar">
          <div className="planning-field">
            <label htmlFor="planning-teacher">Enseignant</label>
            <select
              id="planning-teacher"
              value={active?.id ?? ""}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="" disabled>
                Choisir un enseignant
              </option>
              {enseignants.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.prenom} {e.nom}
                </option>
              ))}
            </select>
          </div>
          {active && (
            <div>
              <p>
                {active.typeContrat === "VACATAIRE" ? "Vacataire" : "Permanent"}{" "}
                · {active.specialite || "Spécialité non renseignée"}
              </p>
              <p
                className={
                  hours > active.heuresContractuellesSemaine
                    ? "planning-form-error"
                    : ""
                }
              >
                {hours} h planifiées / {active.heuresContractuellesSemaine} h
                contractuelles
              </p>
            </div>
          )}
        </section>
        {active ? (
          <ScheduleGrid
            seances={sessions}
            viewMode="enseignant"
            activeEntityTitle={`${active.prenom} ${active.nom}`}
            activeEntitySubtitle={active.specialite}
          />
        ) : (
          <p className="planning-empty">
            Aucun enseignant disponible. Ajoutez un enseignant dans les
            ressources académiques.
          </p>
        )}
      </main>
    </>
  );
}
