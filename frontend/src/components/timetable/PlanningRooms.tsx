"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Printer,
  Building2,
  Monitor,
  Users,
  MapPin,
  Clock,
  Layers,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Flame,
  CalendarCheck,
  RotateCcw,
} from "lucide-react";
import { useTimetable } from "@/context/TimetableContext";
import { TimetableHeader } from "@/components/timetable/TimetableHeader";
import { ScheduleGrid } from "@/components/timetable/ScheduleGrid";
import {
  Salle,
  TypeSalle,
  JOURS_SEMAINE,
  CRENEAUX_OFFICIELS_EMSI,
} from "@/types/timetable";

const TYPE_SALLE_LABELS: Record<TypeSalle, string> = {
  STANDARD: "Salle de cours standard",
  LI_PC: "Labo TP Informatique",
  LR_RESEAUX: "Labo Réseaux & Télécoms",
  AMPHI: "Amphithéâtre",
};

export function PlanningRooms() {
  const { salles, campuses, seances, mode, calendar } = useTimetable();

  // Filters state
  const [selectedCampusId, setSelectedCampusId] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedSalleId, setSelectedSalleId] = useState<string>("");

  // Filtered rooms based on campus and type
  const filteredSalles = useMemo(() => {
    return salles.filter((s) => {
      const matchCampus =
        selectedCampusId === "ALL" || s.campusId === selectedCampusId;
      const matchType =
        selectedType === "ALL" || s.typeSalle === selectedType;
      return matchCampus && matchType;
    });
  }, [salles, selectedCampusId, selectedType]);

  // Active room selection
  const activeSalle = useMemo(() => {
    if (!filteredSalles.length) return null;
    return (
      filteredSalles.find((s) => s.id === selectedSalleId) ?? filteredSalles[0]
    );
  }, [filteredSalles, selectedSalleId]);

  // Campus of the active room
  const activeCampus = useMemo(() => {
    if (!activeSalle) return undefined;
    return campuses.find((c) => c.id === activeSalle.campusId);
  }, [activeSalle, campuses]);

  // Sessions assigned to the active room
  const roomSessions = useMemo(() => {
    if (!activeSalle) return [];
    return seances.filter((s) => s.salleId === activeSalle.id);
  }, [activeSalle, seances]);

  // Calculated statistics
  const stats = useMemo(() => {
    if (!activeSalle) {
      return {
        totalHours: 0,
        occupiedSlots: 0,
        totalSlots: 36,
        occupancyRate: 0,
        peakDay: null as string | null,
        quietDay: null as string | null,
      };
    }

    const totalHours = roomSessions.reduce(
      (sum, s) => sum + s.spanSeances * 1.5,
      0
    );
    const occupiedSlots = roomSessions.reduce(
      (sum, s) => sum + s.spanSeances,
      0
    );

    const numDays = calendar?.days.length ?? JOURS_SEMAINE.length;
    const numSlotsPerDay =
      calendar?.slots.length ?? CRENEAUX_OFFICIELS_EMSI.length;
    const totalSlots = numDays * numSlotsPerDay;
    const occupancyRate =
      totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

    // Day distribution
    const dayCounts: Record<string, number> = {};
    JOURS_SEMAINE.forEach((j) => {
      dayCounts[j.code] = 0;
    });
    roomSessions.forEach((s) => {
      dayCounts[s.jourSemaine] = (dayCounts[s.jourSemaine] || 0) + s.spanSeances;
    });

    let maxDay = "";
    let maxCount = -1;
    let minDay = "";
    let minCount = 999;

    JOURS_SEMAINE.forEach((j) => {
      const count = dayCounts[j.code];
      if (count > maxCount) {
        maxCount = count;
        maxDay = j.label;
      }
      if (count < minCount) {
        minCount = count;
        minDay = j.label;
      }
    });

    return {
      totalHours,
      occupiedSlots,
      totalSlots,
      occupancyRate,
      peakDay: maxCount > 0 ? `${maxDay} (${maxCount} créneaux)` : null,
      quietDay: minCount === 0 ? `${minDay} (libre)` : `${minDay} (${minCount} créneau)`,
    };
  }, [activeSalle, roomSessions, calendar]);

  const resetFilters = () => {
    setSelectedCampusId("ALL");
    setSelectedType("ALL");
    if (salles.length > 0) {
      setSelectedSalleId(salles[0].id);
    }
  };

  return (
    <>
      <TimetableHeader
        title="Occupation des salles"
        subtitle="Suivi des créneaux d’occupation, capacités et affectations des salles par campus."
      />

      <main className="planning-content">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <Link
            className="planning-text-link"
            href="/timetable/resources?section=salles"
          >
            Créer ou modifier une salle dans le référentiel
          </Link>
          <button
            className="planning-primary inline-flex items-center gap-2 self-start sm:self-auto"
            disabled={!activeSalle}
            onClick={() => window.print()}
          >
            <Printer size={16} />
            <span>Imprimer / PDF</span>
          </button>
        </div>

        {/* FILTERS TOOLBAR */}
        <section className="planning-panel planning-group-toolbar mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {/* Campus Filter */}
            <div className="planning-field">
              <label htmlFor="filter-campus">Campus</label>
              <select
                id="filter-campus"
                value={selectedCampusId}
                onChange={(e) => {
                  setSelectedCampusId(e.target.value);
                  setSelectedSalleId("");
                }}
              >
                <option value="ALL">Tous les campus ({campuses.length})</option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="planning-field">
              <label htmlFor="filter-type">Type de salle</label>
              <select
                id="filter-type"
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setSelectedSalleId("");
                }}
              >
                <option value="ALL">Tous les types</option>
                <option value="STANDARD">Salle standard (Cours / TD)</option>
                <option value="LI_PC">Labo TP Informatique (LI_PC)</option>
                <option value="LR_RESEAUX">Labo Réseaux & Télécoms</option>
                <option value="AMPHI">Amphithéâtre</option>
              </select>
            </div>

            {/* Room Selector */}
            <div className="planning-field">
              <label htmlFor="select-salle">Salle à consulter</label>
              <select
                id="select-salle"
                value={activeSalle?.id ?? ""}
                onChange={(e) => setSelectedSalleId(e.target.value)}
                disabled={filteredSalles.length === 0}
              >
                {filteredSalles.length === 0 ? (
                  <option value="" disabled>
                    Aucune salle correspondante
                  </option>
                ) : (
                  filteredSalles.map((s) => {
                    const c = campuses.find((cmp) => cmp.id === s.campusId);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.codeSalle} — {c?.nom ?? "Campus"} ({s.capacite} pl.)
                      </option>
                    );
                  })
                )}
              </select>
            </div>
          </div>
        </section>

        {activeSalle ? (
          <>
            {/* SALLE DETAILS & KEY METRICS CARD */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                {/* Identity & Badges */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xl font-bold text-slate-900 tracking-tight">
                      {activeSalle.codeSalle}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        activeSalle.typeSalle === "LI_PC"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : activeSalle.typeSalle === "LR_RESEAUX"
                          ? "bg-sky-50 text-sky-800 border-sky-300"
                          : activeSalle.typeSalle === "AMPHI"
                          ? "bg-amber-50 text-amber-800 border-amber-300"
                          : "bg-slate-100 text-slate-800 border-slate-300"
                      }`}
                    >
                      {TYPE_SALLE_LABELS[activeSalle.typeSalle] ||
                        activeSalle.typeSalle}
                    </span>
                    {activeCampus && (
                      <span className="text-xs font-semibold text-slate-600 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {activeCampus.nom} · Étage {activeSalle.etage}
                      </span>
                    )}
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        activeSalle.estDisponible
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {activeSalle.estDisponible ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Opérationnelle
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Indisponible
                        </>
                      )}
                    </span>
                  </div>

                  {/* Equipment specs */}
                  {activeSalle.specsEquipements && (
                    <p className="text-xs text-slate-600 flex items-center gap-1.5 pt-1">
                      <span className="font-semibold text-slate-700">
                        Équipements :
                      </span>
                      <span>{activeSalle.specsEquipements}</span>
                    </p>
                  )}
                </div>

                {/* Key Metrics Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                  {/* Capacity */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-xs text-slate-500 font-medium block">
                      Capacité
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <strong className="text-lg font-bold text-slate-900">
                        {activeSalle.capacite}
                      </strong>
                      <span className="text-xs text-slate-500">places</span>
                    </div>
                  </div>

                  {/* PCs */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-xs text-slate-500 font-medium block">
                      Postes PC
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <strong className="text-lg font-bold text-slate-900">
                        {activeSalle.nombrePcOperationnels}
                      </strong>
                      <span className="text-xs text-slate-500">postes</span>
                    </div>
                  </div>

                  {/* Planned Hours */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-xs text-slate-500 font-medium block">
                      Charge
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <strong className="text-lg font-bold text-emerald-700">
                        {stats.totalHours}
                      </strong>
                      <span className="text-xs text-slate-500">h / sem.</span>
                    </div>
                  </div>

                  {/* Occupancy Rate */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="text-xs text-slate-500 font-medium block">
                      Occupation
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <strong
                        className={`text-lg font-bold ${
                          stats.occupancyRate > 75
                            ? "text-amber-600"
                            : stats.occupancyRate > 35
                            ? "text-emerald-700"
                            : "text-slate-800"
                        }`}
                      >
                        {stats.occupancyRate}%
                      </strong>
                      <span className="text-xs text-slate-500">
                        ({stats.occupiedSlots}/{stats.totalSlots})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Occupancy Progress Bar */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-medium">
                  <span>Taux d’utilisation de la salle sur la semaine</span>
                  <span>
                    {stats.occupiedSlots} créneaux réservés sur {stats.totalSlots}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      stats.occupancyRate > 80
                        ? "bg-rose-500"
                        : stats.occupancyRate > 60
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(stats.occupancyRate, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                  <span>
                    {stats.peakDay ? (
                      <span className="inline-flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        Pic d’affluence : <strong>{stats.peakDay}</strong>
                      </span>
                    ) : (
                      "Aucune séance programmée"
                    )}
                  </span>
                  <span>
                    {stats.quietDay && (
                      <span className="inline-flex items-center gap-1">
                        <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Créneau le plus libre : <strong>{stats.quietDay}</strong>
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </section>

            {/* SCHEDULE GRID */}
            <div className="planning-printable">
              <p className="planning-print-source">
                {mode === "demo"
                  ? "Démonstration — ne pas diffuser comme planning officiel"
                  : "Planning d’occupation des salles EMSI Univora"}
              </p>
              <ScheduleGrid
                seances={roomSessions}
                viewMode="salle"
                activeEntityTitle={`Planning d’occupation : ${activeSalle.codeSalle}`}
                activeEntitySubtitle={`${
                  TYPE_SALLE_LABELS[activeSalle.typeSalle] ||
                  activeSalle.typeSalle
                } · Capacité ${activeSalle.capacite} places · ${
                  activeSalle.nombrePcOperationnels
                } PC`}
                campusName={activeCampus?.nom}
              />
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Aucune salle trouvée
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
              Aucune salle ne correspond aux filtres sélectionnés (Campus :{" "}
              {selectedCampusId === "ALL"
                ? "Tous"
                : campuses.find((c) => c.id === selectedCampusId)?.nom}
              , Type : {selectedType}).
            </p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <RotateCcw size={14} />
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </main>
    </>
  );
}