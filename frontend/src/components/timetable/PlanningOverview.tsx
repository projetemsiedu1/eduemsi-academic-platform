"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTimetable } from "@/context/TimetableContext";
import { TimetableHeader } from "@/components/timetable/TimetableHeader";
import { PlanningSetupGuide } from "./PlanningSetupGuide";
export function PlanningOverview() {
  const { stats, campuses, salles, groupes, verificationReport, mode } =
    useTimetable();
  const indicators = [
    ["Groupes", stats.nbGroupes, "/timetable/groups"],
    ["Enseignants", stats.nbEnseignants, "/timetable/teachers"],
    ["Salles", stats.nbSalles, "/timetable/resources"],
    ["Séances", stats.nbSeancesTotal, "/timetable/constraints"],
  ] as const;
  return (
    <>
      <TimetableHeader
        title="Vue d’ensemble du planning"
        subtitle="Préparer les ressources, organiser les séances et vérifier les affectations."
      />
      <main className="planning-content">
        <PlanningSetupGuide />
        <section
          className="planning-indicators"
          aria-label="Synthèse des ressources"
        >
          {indicators.map(([label, value, href]) => (
            <Link href={href} key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <ArrowRight size={16} />
            </Link>
          ))}
        </section>
        <div className="planning-overview-grid">
          <section className="planning-panel">
            <h2>Répartition par campus</h2>
            <p>
              Les salles et les groupes du référentiel{" "}
              {mode === "demo" ? "de démonstration" : "partagé"}.
            </p>
            {campuses.length ? (
              campuses.map((campus) => (
                <div key={campus.id} className="planning-campus-row">
                  <div>
                    <h3>{campus.nom}</h3>
                    <span>{campus.ville}</span>
                  </div>
                  <span>
                    {salles.filter((s) => s.campusId === campus.id).length}{" "}
                    salles
                  </span>
                  <span>
                    {groupes.filter((g) => g.campusFixeId === campus.id).length}{" "}
                    groupes
                  </span>
                </div>
              ))
            ) : (
              <p className="planning-empty">
                Aucun campus disponible dans le référentiel.
              </p>
            )}
          </section>
          <section className="planning-panel">
            <h2>Vérification des affectations</h2>
            <p>
              {verificationReport.totalSeancesVerifiees} séances contrôlées sur{" "}
              {verificationReport.totalReglesEvaluees} règles.
            </p>
            <strong className="planning-finding">
              {verificationReport.conflits.length
                ? `${verificationReport.conflits.length} anomalies à traiter`
                : stats.nbSeancesTotal
                  ? "Aucune anomalie détectée"
                  : "Aucune séance à vérifier"}
            </strong>
            <p>
              La détection de conflits ne certifie pas l’optimalité d’un emploi
              du temps.
            </p>
            <Link className="planning-text-link" href="/timetable/constraints">
              Organiser et vérifier les séances <ArrowRight size={16} />
            </Link>
          </section>
        </div>
        <section className="planning-panel">
          <h2>Préparer votre semaine</h2>
          <div className="planning-next-actions">
            <Link href="/timetable/resources">
              <h3>Ressources académiques</h3>
              <p>Salles, équipements, enseignants, groupes et modules.</p>
            </Link>
            <Link href="/timetable/groups">
              <h3>Emplois du temps des groupes</h3>
              <p>Consulter et imprimer la grille hebdomadaire.</p>
            </Link>
            <Link href="/timetable/teachers">
              <h3>Charge des enseignants</h3>
              <p>Consulter les affectations et les volumes planifiés.</p>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
