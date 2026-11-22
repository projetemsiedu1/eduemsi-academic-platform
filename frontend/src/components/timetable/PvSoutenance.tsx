"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Printer, ArrowLeft, Lock, Award } from "lucide-react";
import { ApiClient, ApiError } from "@/lib/api-client";
import type { PvSoutenanceDto } from "@/types/pfe";

export function PvSoutenance({ pfeId }: { pfeId: string }) {
  const [pv, setPv] = useState<PvSoutenanceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadPv() {
      setLoading(true);
      setError("");
      try {
        const res = await ApiClient.get<PvSoutenanceDto>(`/pfe/${pfeId}/pv`);
        if (!cancelled) setPv(res);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Impossible de charger le procès-verbal.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadPv();
    return () => {
      cancelled = true;
    };
  }, [pfeId]);

  if (loading) {
    return <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>Chargement du Procès-Verbal...</div>;
  }

  if (error || !pv) {
    return (
      <div style={{ padding: "2rem" }}>
        <div className="planning-feedback error" style={{ margin: "0 0 1rem" }}>
          {error || "Procès-verbal introuvable."}
        </div>
        <Link href="/timetable/pfe" style={{ color: "var(--emsi-green-dark)", fontWeight: 600 }}>
          ← Retour aux PFE
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "1.5rem", maxWidth: "960px", margin: "0 auto" }}>
      <div
        className="no-print"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", gap: "1rem", flexWrap: "wrap" }}
      >
        <Link
          href="/timetable/pfe"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--emsi-green-dark)", fontWeight: 600, textDecoration: "none" }}
        >
          <ArrowLeft size={16} />
          Retour à la liste PFE
        </Link>
        <button
          type="button"
          className="planning-primary"
          onClick={() => window.print()}
        >
          <Printer size={16} />
          Imprimer / Télécharger PDF
        </button>
      </div>

      <article
        className="planning-printable"
        style={{
          backgroundColor: "#ffffff",
          color: "#0f172a",
          border: "1px solid #cbd5e1",
          borderRadius: "0.75rem",
          padding: "2rem 2.25rem",
          boxShadow: "0 4px 16px rgba(15, 23, 42, 0.06)",
        }}
      >
        {/* EN-TÊTE INSTITUTIONNEL */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "3px solid #047857",
            paddingBottom: "1rem",
            marginBottom: "1.5rem",
            gap: "1rem",
          }}
        >
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/univora-horizontal.png" alt="EMSI Univora" style={{ height: "48px", width: "auto" }} />
            <div style={{ fontSize: "0.8rem", color: "#475569", marginTop: "0.35rem" }}>
              École Marocaine des Sciences de l&apos;Ingénieur · Direction Académique
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#047857", textTransform: "uppercase" }}>
              Procès-Verbal de Soutenance PFE
            </div>
            <div style={{ fontSize: "0.82rem", color: "#475569", marginTop: "0.2rem" }}>
              Réf. PFE-{pv.projet.id} · Filière {pv.projet.filiereCode || "Ingénierie"}
            </div>
            <div style={{ fontSize: "0.78rem", color: pv.pvVerrouille ? "#059669" : "#d97706", fontWeight: 700, marginTop: "0.25rem" }}>
              {pv.pvVerrouille ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                  <Lock size={12} /> PV OFFICIEL VERROUILLÉ
                </span>
              ) : (
                "PV PROVISOIRE (NON VERROUILLÉ)"
              )}
            </div>
          </div>
        </header>

        {/* INFORMATIONS PROJET & CANDIDATS */}
        <section style={{ marginBottom: "1.5rem", display: "grid", gap: "0.5rem", fontSize: "0.9rem" }}>
          <div><strong>Intitulé du Projet :</strong> {pv.projet.titre}</div>
          <div>
            <strong>Candidat(s) :</strong>{" "}
            {pv.etudiants && pv.etudiants.length > 0 ? pv.etudiants.join(" · ") : pv.projet.binomeEtudiants}
          </div>
          {pv.projet.entrepriseAccueil && (
            <div><strong>Organisme d&apos;accueil :</strong> {pv.projet.entrepriseAccueil}</div>
          )}
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            <span>
              <strong>Date de soutenance :</strong>{" "}
              {pv.dateSoutenance ? pv.dateSoutenance.replace("T", " à ").substring(0, 18) : "—"}
            </span>
            <span><strong>Salle :</strong> {pv.salle || "—"} ({pv.campus || "EMSI"})</span>
          </div>
        </section>

        {/* COMPOSITION DU JURY */}
        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "0.98rem", fontWeight: 700, color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.35rem", marginBottom: "0.75rem" }}>
            1. Composition Officielle du Jury
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #cbd5e1", textAlign: "left" }}>
                <th style={{ padding: "0.5rem" }}>Rôle</th>
                <th style={{ padding: "0.5rem" }}>Membre du Jury</th>
                <th style={{ padding: "0.5rem" }}>Grade</th>
                <th style={{ padding: "0.5rem" }}>Spécialité</th>
              </tr>
            </thead>
            <tbody>
              {pv.jury.map((m, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "0.5rem", fontWeight: 700, color: "#047857" }}>{m.role}</td>
                  <td style={{ padding: "0.5rem", fontWeight: 600 }}>Pr. {m.nom} {m.prenom}</td>
                  <td style={{ padding: "0.5rem" }}>{m.grade || "Docteur"}</td>
                  <td style={{ padding: "0.5rem", color: "#475569" }}>{m.specialite || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* GRILLE D'ÉVALUATION DÉTAILLÉE */}
        <section style={{ marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "0.98rem", fontWeight: 700, color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.35rem", marginBottom: "0.75rem" }}>
            2. Détail des Évaluations Individuelles (Grille EMSI /20)
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #cbd5e1", textAlign: "left" }}>
                <th style={{ padding: "0.5rem" }}>Évaluateur (Rôle)</th>
                <th style={{ padding: "0.5rem", textAlign: "center" }}>Tech (/6)</th>
                <th style={{ padding: "0.5rem", textAlign: "center" }}>Rapport (/5)</th>
                <th style={{ padding: "0.5rem", textAlign: "center" }}>Démo (/5)</th>
                <th style={{ padding: "0.5rem", textAlign: "center" }}>Questions (/4)</th>
                <th style={{ padding: "0.5rem", textAlign: "center" }}>Total (/20)</th>
              </tr>
            </thead>
            <tbody>
              {pv.evaluations.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "1rem", textAlign: "center", color: "#64748b" }}>
                    Aucune grille saisie pour le moment.
                  </td>
                </tr>
              ) : (
                pv.evaluations.map((ev) => (
                  <tr key={ev.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "0.5rem" }}>
                      <strong>{ev.evaluateurNomComplet}</strong>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{ev.roleJury}</div>
                    </td>
                    <td style={{ padding: "0.5rem", textAlign: "center" }}>{ev.noteTechnique}</td>
                    <td style={{ padding: "0.5rem", textAlign: "center" }}>{ev.noteRapport}</td>
                    <td style={{ padding: "0.5rem", textAlign: "center" }}>{ev.noteDemo}</td>
                    <td style={{ padding: "0.5rem", textAlign: "center" }}>{ev.noteReponses}</td>
                    <td style={{ padding: "0.5rem", textAlign: "center", fontWeight: 700, color: "#047857" }}>
                      {ev.total}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        {/* DÉCISION FINALE */}
        <section
          style={{
            padding: "1.1rem 1.5rem",
            borderRadius: "0.6rem",
            backgroundColor: pv.noteFinale !== null && pv.noteFinale < 10 ? "#fef2f2" : "#ecfdf5",
            border: `2px solid ${pv.noteFinale !== null && pv.noteFinale < 10 ? "#dc2626" : "#059669"}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "#475569", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Award size={15} />
              Décision du Jury
            </div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", marginTop: "0.2rem" }}>
              Mention : {pv.mention || "En attente de délibération"}
            </div>
            {pv.dateVerrouillage && (
              <div style={{ fontSize: "0.75rem", color: "#475569", marginTop: "0.15rem" }}>
                Délibéré et verrouillé le {pv.dateVerrouillage.replace("T", " à ").substring(0, 18)}
              </div>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.75rem", color: "#475569", display: "block" }}>Note Finale Officielle</span>
            <strong style={{ fontSize: "1.75rem", color: pv.noteFinale !== null && pv.noteFinale < 10 ? "#dc2626" : "#047857" }}>
              {pv.noteFinale !== null ? `${pv.noteFinale.toFixed(2)} / 20` : "— / 20"}
            </strong>
          </div>
        </section>

        {/* SIGNATURES */}
        <footer style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", fontSize: "0.78rem", textAlign: "center" }}>
          {pv.jury.map((m, idx) => (
            <div key={idx} style={{ borderTop: "1px dashed #94a3b8", paddingTop: "0.5rem" }}>
              <div style={{ fontWeight: 700 }}>{m.role}</div>
              <div style={{ color: "#475569", marginTop: "0.15rem" }}>Pr. {m.nom} {m.prenom}</div>
              <div style={{ height: "42px", color: "#94a3b8", display: "grid", placeItems: "center", fontStyle: "italic" }}>
                Signature
              </div>
            </div>
          ))}
        </footer>
      </article>
    </div>
  );
}
