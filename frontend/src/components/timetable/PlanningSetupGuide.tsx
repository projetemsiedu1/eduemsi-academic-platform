"use client";
import Link from "next/link";
import { Layers, Sliders, Cpu, CheckCircle2, Calendar } from "lucide-react";
import { useTimetable } from "@/context/TimetableContext";

export function PlanningSetupGuide() {
  const ctx = useTimetable();

  const workflowSteps = [
    {
      step: 1,
      title: "Ressources Référentielles",
      desc: `${ctx.salles.length} salles, ${ctx.enseignants.length} enseignants, ${ctx.groupes.length} groupes`,
      href: "/timetable/resources",
      icon: Layers,
    },
    {
      step: 2,
      title: "Exigences & Contraintes",
      desc: "Définir les besoins hebdomadaires et les qualifications",
      href: "/timetable/constraints",
      icon: Sliders,
    },
    {
      step: 3,
      title: "Résolution CP-SAT",
      desc: "Moteur mathématique Google OR-Tools sans conflit",
      href: "/timetable/constraints#solver-section",
      icon: Cpu,
    },
    {
      step: 4,
      title: "Validation de Proposition",
      desc: "Prévisualiser et valider la proposition générée",
      href: "/timetable/constraints#solver-section",
      icon: CheckCircle2,
    },
    {
      step: 5,
      title: "Grille d'Emploi du Temps",
      desc: "Consulter, ajuster et imprimer les plannings",
      href: "/timetable/groups",
      icon: Calendar,
    },
  ];

  return (
    <section className="planning-panel" aria-labelledby="planning-setup-title" style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <h2 id="planning-setup-title" style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>
          Parcours de Planification Académique
        </h2>
        <span style={{ fontSize: "0.85rem", color: "var(--emsi-green-dark, #059669)", fontWeight: 600 }}>
          Workflow Responsable Planning (5 étapes)
        </span>
      </div>
      <p style={{ color: "#64748b", fontSize: "0.95rem", margin: "0 0 1.25rem 0" }}>
        Suivez ce cycle complet pour configurer vos formations, générer les emplois du temps avec le solveur CP-SAT et publier les grilles officielles.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem"
      }}>
        {workflowSteps.map((s) => {
          const IconComponent = s.icon;
          return (
            <Link
              key={s.step}
              href={s.href}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "1rem",
                borderRadius: "0.75rem",
                border: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
                textDecoration: "none",
                color: "inherit",
                transition: "all 0.2s ease",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "1.75rem",
                  height: "1.75rem",
                  borderRadius: "9999px",
                  backgroundColor: "#059669",
                  color: "#ffffff",
                  fontSize: "0.8rem",
                  fontWeight: 700
                }}>
                  {s.step}
                </span>
                <IconComponent size={20} color="#059669" />
              </div>
              <strong style={{ fontSize: "0.95rem", marginBottom: "0.25rem", color: "#1e293b" }}>
                {s.title}
              </strong>
              <span style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: 1.4 }}>
                {s.desc}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
