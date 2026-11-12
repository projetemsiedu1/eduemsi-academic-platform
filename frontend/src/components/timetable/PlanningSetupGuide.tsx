"use client";
import Link from "next/link";
import { useTimetable } from "@/context/TimetableContext";

export function PlanningSetupGuide() {
  const ctx = useTimetable();
  const steps = [
    {
      label: "Filières",
      count: ctx.filieres.length,
      href: "/timetable/resources?section=filieres",
      hint: "Créer et nommer les formations.",
    },
    {
      label: "Groupes",
      count: ctx.groupes.length,
      href: "/timetable/resources?section=groupes",
      hint: "Choisir la filière, l’année, l’effectif et le campus.",
    },
    {
      label: "Modules",
      count: ctx.modules.length,
      href: "/timetable/resources?section=modules",
      hint: "Définir les enseignements et leur type de salle.",
    },
    {
      label: "Enseignants",
      count: ctx.enseignants.length,
      href: "/timetable/resources?section=enseignants",
      hint: "Renseigner le contrat et les disponibilités.",
    },
    {
      label: "Salles",
      count: ctx.salles.length,
      href: "/timetable/resources?section=salles",
      hint: "Vérifier le campus, la capacité et les équipements.",
    },
  ];
  return (
    <section className="planning-panel" aria-labelledby="planning-setup-title">
      <h2 id="planning-setup-title">Préparer le planning, étape par étape</h2>
      <p>
        Gérez chaque catégorie, puis définissez les qualifications et les
        séances hebdomadaires à générer.
      </p>
      <ol className="planning-setup-steps">
        {steps.map((step) => (
          <li key={step.label}>
            <Link href={step.href}>
              <strong>
                {step.label}
                <span>{step.count}</span>
              </strong>
              <span>{step.hint}</span>
              <span className="planning-text-link">
                {step.count ? "Consulter et compléter" : "Commencer"}
              </span>
            </Link>
          </li>
        ))}
        <li>
          <Link href="/timetable/constraints">
            <strong>Planification</strong>
            <span>
              Associer enseignants et modules, saisir les besoins puis générer
              et vérifier la proposition.
            </span>
            <span className="planning-text-link">Ouvrir la planification</span>
          </Link>
        </li>
      </ol>
    </section>
  );
}
