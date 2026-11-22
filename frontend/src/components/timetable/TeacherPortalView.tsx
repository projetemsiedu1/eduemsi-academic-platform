"use client";

import { useState } from "react";
import { TimetableHeader } from "@/components/timetable/TimetableHeader";
import { TeacherSurveillances } from "@/components/timetable/TeacherSurveillances";
import { TeacherJurysTab, TeacherSujetsTab } from "@/components/timetable/TeacherPfeSection";
import { GraduationCap, ShieldCheck, Clock, Users } from "lucide-react";

export function TeacherPortalView() {
  const [activeTab, setActiveTab] = useState<"SURVEILLANCES" | "COURS" | "SUJETS" | "JURYS">("SURVEILLANCES");

  return (
    <div className="planning-overview">
      <TimetableHeader
        title="Espace Enseignant · Planning, Surveillances & PFE"
        subtitle="Gérez vos séances de cours, surveillances d'examens, sujets PFE proposés et évaluations de jurys."
      />

      {/* STATS CARDS */}
      <div className="planning-stats-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="planning-stat-card">
          <div className="planning-stat-header">
            <span>Surveillances Assignées</span>
            <ShieldCheck size={20} className="text-emerald-600" />
          </div>
          <p className="planning-stat-value" style={{ color: "#059669" }}>6 Épreuves</p>
          <span className="planning-stat-hint">Session Normale 2026</span>
        </div>

        <div className="planning-stat-card">
          <div className="planning-stat-header">
            <span>Volume d&apos;Enseignement</span>
            <Clock size={20} className="text-emerald-600" />
          </div>
          <p className="planning-stat-value">18h / sem</p>
          <span className="planning-stat-hint">Contrat Permanent · Charge normale</span>
        </div>

        <div className="planning-stat-card">
          <div className="planning-stat-header">
            <span>Groupes Pris en Charge</span>
            <Users size={20} className="text-emerald-600" />
          </div>
          <p className="planning-stat-value">3 Groupes</p>
          <span className="planning-stat-hint">5IIR-G1, 5IIR-G2, 4IIR-G1</span>
        </div>

        <div className="planning-stat-card">
          <div className="planning-stat-header">
            <span>Statut de Qualification</span>
            <GraduationCap size={20} className="text-emerald-600" />
          </div>
          <p className="planning-stat-value" style={{ fontSize: "1.25rem", color: "#0f172a" }}>Docteur / Prof.</p>
          <span className="planning-stat-hint">Génie Logiciel & Systèmes d&apos;Info</span>
        </div>
      </div>

      {/* ONGLETS NAVIGATION */}
      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border)", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("SURVEILLANCES")}
          style={{
            padding: "0.75rem 1.25rem",
            fontWeight: 600,
            fontSize: "0.875rem",
            borderBottom: activeTab === "SURVEILLANCES" ? "2px solid #059669" : "2px solid transparent",
            color: activeTab === "SURVEILLANCES" ? "#059669" : "var(--muted)",
            background: "none",
            borderTop: 0,
            borderLeft: 0,
            borderRight: 0,
            cursor: "pointer",
          }}
        >
          Mes Surveillances d&apos;Examens & Contrôle Anti-Triche
        </button>
        <button
          onClick={() => setActiveTab("COURS")}
          style={{
            padding: "0.75rem 1.25rem",
            fontWeight: 600,
            fontSize: "0.875rem",
            borderBottom: activeTab === "COURS" ? "2px solid #059669" : "2px solid transparent",
            color: activeTab === "COURS" ? "#059669" : "var(--muted)",
            background: "none",
            borderTop: 0,
            borderLeft: 0,
            borderRight: 0,
            cursor: "pointer",
          }}
        >
          Planning des Cours Enseignés
        </button>
        <button
          onClick={() => setActiveTab("SUJETS")}
          style={{
            padding: "0.75rem 1.25rem",
            fontWeight: 600,
            fontSize: "0.875rem",
            borderBottom: activeTab === "SUJETS" ? "2px solid #059669" : "2px solid transparent",
            color: activeTab === "SUJETS" ? "#059669" : "var(--muted)",
            background: "none",
            borderTop: 0,
            borderLeft: 0,
            borderRight: 0,
            cursor: "pointer",
          }}
        >
          Mes Sujets PFE (Catalogue)
        </button>
        <button
          onClick={() => setActiveTab("JURYS")}
          style={{
            padding: "0.75rem 1.25rem",
            fontWeight: 600,
            fontSize: "0.875rem",
            borderBottom: activeTab === "JURYS" ? "2px solid #059669" : "2px solid transparent",
            color: activeTab === "JURYS" ? "#059669" : "var(--muted)",
            background: "none",
            borderTop: 0,
            borderLeft: 0,
            borderRight: 0,
            cursor: "pointer",
          }}
        >
          Mes Jurys & Soutenances PFE
        </button>
      </div>

      {activeTab === "SURVEILLANCES" && <TeacherSurveillances />}
      {activeTab === "SUJETS" && <TeacherSujetsTab />}
      {activeTab === "JURYS" && <TeacherJurysTab />}

      {activeTab === "COURS" && (
        <div style={{ backgroundColor: "var(--surface)", borderRadius: "0.75rem", border: "1px solid var(--border)", padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
            Planning Hebdomadaire d&apos;Enseignement (Dr. Amine Alami)
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table className="planning-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Jour</th>
                  <th>Horaires</th>
                  <th>Module</th>
                  <th>Groupe</th>
                  <th>Salle & Campus</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Lundi</strong></td>
                  <td>08:30 - 11:30</td>
                  <td>Architecture JEE & Spring Boot 3</td>
                  <td>5IIR-G1</td>
                  <td>LAB-102 (Les Orangers)</td>
                  <td><span className="badge badge-cours">COURS</span></td>
                </tr>
                <tr>
                  <td><strong>Mardi</strong></td>
                  <td>14:00 - 17:00</td>
                  <td>Architecture Microservices & Cloud</td>
                  <td>5IIR-G2</td>
                  <td>LAB-103 (Les Orangers)</td>
                  <td><span className="badge badge-tp">TP</span></td>
                </tr>
                <tr>
                  <td><strong>Mercredi</strong></td>
                  <td>08:30 - 11:30</td>
                  <td>Algorithmique Avancée & Optimisation</td>
                  <td>4IIR-G1</td>
                  <td>AMPHI-A (Les Orangers)</td>
                  <td><span className="badge badge-cours">COURS</span></td>
                </tr>
                <tr>
                  <td><strong>Jeudi</strong></td>
                  <td>08:30 - 11:30</td>
                  <td>Recherche Opérationnelle & Solveurs CP-SAT</td>
                  <td>5IIR-G1</td>
                  <td>SALLE-204 (Les Orangers)</td>
                  <td><span className="badge badge-cours">COURS</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
