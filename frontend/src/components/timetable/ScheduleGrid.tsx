"use client";

import React from "react";
import {
  JOURS_SEMAINE,
  CRENEAUX_OFFICIELS_EMSI,
  Seance,
} from "@/types/timetable";
import { useTimetable } from "@/context/TimetableContext";
import { MapPin, Laptop, Lock, User, Users, Coffee, Clock } from "lucide-react";

interface ScheduleGridProps {
  seances: Seance[];
  viewMode: "groupe" | "enseignant";
  activeEntityTitle: string;
  activeEntitySubtitle?: string;
  campusName?: string;
  onSeanceClick?: (seance: Seance) => void;
}

export function ScheduleGrid({
  seances,
  viewMode,
  activeEntityTitle,
  activeEntitySubtitle,
  campusName,
  onSeanceClick,
}: ScheduleGridProps) {
  const { salles, enseignants, groupes, elements, modules } = useTimetable();

  const salleMap = new Map(salles.map((s) => [s.id, s]));
  const enseignantMap = new Map(enseignants.map((e) => [e.id, e]));
  const groupeMap = new Map(groupes.map((g) => [g.id, g]));
  const elementMap = new Map(elements.map((el) => [el.id, el]));
  const moduleMap = new Map(modules.map((m) => [m.id, m]));

  // Indexation rapide des séances : key = `${jour}__${creneau}`
  const seancesMatrix = new Map<string, Seance[]>();
  seances.forEach((s) => {
    const offset = CRENEAUX_OFFICIELS_EMSI.findIndex(
      (c) => c.code === s.numeroCreneau,
    );
    if (offset < 0) return;
    for (const slot of CRENEAUX_OFFICIELS_EMSI.slice(
      offset,
      offset + s.spanSeances,
    )) {
      const key = `${s.jourSemaine}__${slot.code}`;
      seancesMatrix.set(key, [...(seancesMatrix.get(key) ?? []), s]);
    }
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200  overflow-hidden">
      {/* EN-TÊTE DU PLANNING */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-bold   text-emsi-primary px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              {viewMode === "groupe"
                ? "Emploi du Temps Étudiant"
                : "Planning Enseignant"}
            </span>
            {campusName && (
              <span className="text-xs font-bold text-slate-600 px-2 py-0.5 rounded-full bg-slate-200/60 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                {campusName}
              </span>
            )}
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mt-1">
            {activeEntityTitle}
          </h2>
          {activeEntitySubtitle && (
            <p className="text-xs text-slate-500 mt-0.5">
              {activeEntitySubtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>TP PC Lab</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-semibold">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>Cours (CM)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-semibold">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>Vacataire</span>
          </div>
        </div>
      </div>

      {/* GRILLE DES 6 JOURS X CRENEAUX EMSI */}
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Grille hebdomadaire, défilement horizontal disponible">
        <div className="min-w-[980px]">
          {/* LIGNE DES JOURS */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100/80 text-xs font-bold text-slate-700 text-center">
            <div className="p-3 border-r border-slate-200 text-slate-500   flex items-center justify-center gap-1 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>Créneaux</span>
            </div>
            {JOURS_SEMAINE.map((jour) => (
              <div
                key={jour.code}
                className="p-3 border-r border-slate-200 last:border-r-0"
              >
                <span className="block font-semibold text-slate-800">
                  {jour.label}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  8h30 - 18h45
                </span>
              </div>
            ))}
          </div>

          {/* LIGNES DES CRÉNEAUX */}
          {CRENEAUX_OFFICIELS_EMSI.map((creneau) => {
            const showMorningBreakAfter = creneau.code === "S1_08H30";
            const showLunchBreakAfter = creneau.code === "S3_12H00";
            const showAfternoonBreakAfter = creneau.code === "S4_13H45";

            return (
              <React.Fragment key={creneau.code}>
                <div className="grid grid-cols-7 border-b border-slate-100 last:border-b-0">
                  {/* CELLULE HORAIRE */}
                  <div className="p-3 border-r border-slate-200 bg-slate-50 flex flex-col justify-center items-center text-center">
                    <span className="text-xs font-semibold text-slate-800 tabular-nums">
                      {creneau.heureDebut}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      à
                    </span>
                    <span className="text-xs font-semibold text-slate-800 tabular-nums">
                      {creneau.heureFin}
                    </span>
                    <span className="text-xs font-semibold text-emsi-primary bg-emerald-50 px-1.5 py-0.5 rounded mt-1 border border-emerald-100">
                      S{creneau.numero}
                    </span>
                  </div>

                  {/* CELLULES PAR JOUR */}
                  {JOURS_SEMAINE.map((jour) => {
                    const key = `${jour.code}__${creneau.code}`;
                    const seancesCellule = seancesMatrix.get(key) || [];

                    return (
                      <div
                        key={key}
                        className="p-2 border-r border-slate-200 last:border-r-0 min-h-[96px] bg-white flex flex-col justify-center transition-colors hover:bg-slate-50/50"
                      >
                        {seancesCellule.length === 0 ? (
                          <div className="h-full rounded-xl border border-dashed border-slate-200/80 flex items-center justify-center p-2 text-center">
                            <span className="text-xs text-slate-300 font-semibold">
                              Créneau libre
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {seancesCellule.map((seance) => {
                              const elem = elementMap.get(
                                seance.elementModuleId,
                              );
                              const mod = elem
                                ? moduleMap.get(elem.moduleId)
                                : undefined;
                              const sal = salleMap.get(seance.salleId);
                              const ens = enseignantMap.get(
                                seance.enseignantId,
                              );
                              const grp = groupeMap.get(seance.groupeId);

                              const isTpPc =
                                elem?.necessitePc || sal?.typeSalle === "LI_PC";
                              const isVacataire =
                                ens?.typeContrat === "VACATAIRE";

                              // Thèmes visuels élégants
                              let badgeClass =
                                "bg-slate-50 border-slate-200 text-slate-900";
                              let tagClass = "bg-slate-200/70 text-slate-800";

                              if (isTpPc) {
                                badgeClass =
                                  "bg-emerald-50 border-emerald-300 text-emerald-950";
                                tagClass = "bg-emerald-200/80 text-emerald-900";
                              } else if (isVacataire) {
                                badgeClass =
                                  "bg-slate-50 border-slate-200 text-slate-950";
                                tagClass = "bg-slate-200/80 text-slate-900";
                              }

                              return (
                                <div
                                  key={seance.id}
                                  onClick={() =>
                                    onSeanceClick && onSeanceClick(seance)
                                  }
                                  className={`p-2.5 rounded-xl border  transition-all duration-150 hover:scale-[1.02] cursor-pointer ${badgeClass}`}
                                >
                                  {/* EN-TETE SEANCE */}
                                  <div className="flex items-start justify-between gap-1 mb-1">
                                    <span className="text-xs font-semibold   block truncate">
                                      {mod?.codeModule || "MODULE"}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {seance.verrouillee && (
                                        <span title="Séance verrouillée">
                                          <Lock className="w-2.5 h-2.5 text-slate-600" />
                                        </span>
                                      )}
                                      <span
                                        className={`text-xs font-semibold px-1.5 py-0.2 rounded ${tagClass}`}
                                      >
                                        {elem?.typeElement || "SEANCE"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* INTITULE */}
                                  <p className="text-xs font-semibold leading-snug line-clamp-2 text-slate-900 mb-1.5">
                                    {elem?.intitule || mod?.intitule}
                                  </p>

                                  {/* DETAILS LIEU & INTERVENANT */}
                                  <div className="space-y-0.5 text-xs">
                                    {viewMode === "groupe" ? (
                                      <div className="flex items-center gap-1 text-slate-700 font-semibold truncate">
                                        <User className="w-3 h-3 text-slate-500 shrink-0" />
                                        <span>
                                          Pr. {ens ? ens.nom : "Enseignant"}
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1 text-slate-700 font-semibold truncate">
                                        <Users className="w-3 h-3 text-slate-500 shrink-0" />
                                        <span>
                                          {grp?.codeGroupe || "Groupe"}
                                        </span>
                                      </div>
                                    )}

                                    <div className="flex items-center justify-between text-slate-600 font-medium">
                                      <span className="flex items-center gap-1 truncate font-bold text-emsi-primary">
                                        <MapPin className="w-3 h-3 shrink-0" />
                                        {sal?.codeSalle || "Salle"}
                                      </span>
                                      {isTpPc && (
                                        <span className="flex items-center gap-0.5 text-xs font-bold text-emerald-700">
                                          <Laptop className="w-2.5 h-2.5" />
                                          PC
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* PAUSE OFFICIELLE EMSI DU MATIN (10h00 - 10h15) */}
                {showMorningBreakAfter && (
                  <div className="bg-slate-50/80 border-b border-slate-200/80 py-1 px-4 text-center text-xs font-bold text-slate-900 flex items-center justify-center gap-2">
                    <Coffee className="w-3.5 h-3.5 text-slate-700" />
                    <span>
                      Pause Réglementaire EMSI • 10h00 à 10h15 (15 min)
                    </span>
                  </div>
                )}

                {/* PAUSE DEJEUNER */}
                {showLunchBreakAfter && (
                  <div className="bg-slate-100 border-b border-slate-200 py-1.5 px-4 text-center text-xs font-bold text-slate-700 flex items-center justify-center gap-2">
                    <span>Interruption entre créneaux : 13h30 à 13h45</span>
                  </div>
                )}

                {/* PAUSE OFFICIELLE EMSI DE L'APRES-MIDI */}
                {showAfternoonBreakAfter && (
                  <div className="bg-slate-50/80 border-b border-slate-200/80 py-1 px-4 text-center text-xs font-bold text-slate-900 flex items-center justify-center gap-2">
                    <Coffee className="w-3.5 h-3.5 text-slate-700" />
                    <span>
                      Pause Réglementaire EMSI • 15h15 à 15h30 (15 min)
                    </span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
