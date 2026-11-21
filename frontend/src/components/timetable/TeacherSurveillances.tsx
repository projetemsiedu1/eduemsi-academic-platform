"use client";

import { useEffect, useState } from "react";
import { ApiClient } from "@/lib/api-client";
import { Modal } from "@/components/ui/modal";
import type { ExamenDto, ExamenAffectationDto } from "@/types/exams";

export function TeacherSurveillances() {
  const [surveillances, setSurveillances] = useState<ExamenDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExamen, setSelectedExamen] = useState<ExamenDto | null>(null);
  const [places, setPlaces] = useState<ExamenAffectationDto[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    loadSurveillances();
  }, []);

  async function loadSurveillances() {
    setLoading(true);
    try {
      const data = await ApiClient.get<ExamenDto[]>("/examens/surveillances/me");
      setSurveillances(data || []);
    } catch {
      setSurveillances([]);
    } finally {
      setLoading(false);
    }
  }

  async function openControleSalle(examen: ExamenDto) {
    setSelectedExamen(examen);
    setLoadingPlaces(true);
    try {
      const data = await ApiClient.get<ExamenAffectationDto[]>(`/examens/${examen.id}/places`);
      setPlaces(data || []);
    } catch {
      setPlaces([]);
    } finally {
      setLoadingPlaces(false);
    }
  }

  async function updatePresence(affectationId: number, statut: string) {
    setUpdatingId(affectationId);
    try {
      await ApiClient.put(`/examens/affectations/${affectationId}/presence?statut=${encodeURIComponent(statut)}`, {});
      setPlaces((prev) =>
        prev.map((p) => (p.id === affectationId ? { ...p, statutPresence: statut } : p))
      );
    } catch (err) {
      alert("Erreur lors de la mise à jour de l'émargement : " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section
      style={{
        marginTop: "2rem",
        padding: "1.5rem",
        backgroundColor: "#ffffff",
        borderRadius: "1rem",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        textAlign: "left",
      }}
      aria-label="Surveillances d'examens"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <div>
          <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Mes Surveillances d&apos;Examens & Contrôle Anti-Triche
          </h3>
          <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0.25rem 0 0" }}>
            Contrôlez les présences, vérifiez le placement des tables et signalez les fraudes éventuelles.
          </p>
        </div>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            padding: "0.3rem 0.6rem",
            borderRadius: "9999px",
            backgroundColor: "#eff6ff",
            color: "#1d4ed8",
            border: "1px solid #bfdbfe",
          }}
        >
          {surveillances.length} épreuve(s) sous votre surveillance
        </span>
      </div>

      {loading ? (
        <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Chargement de vos surveillances...</p>
      ) : surveillances.length === 0 ? (
        <div style={{ padding: "1.5rem", backgroundColor: "#f8fafc", borderRadius: "0.5rem", textAlign: "center", color: "#64748b" }}>
          <p style={{ margin: 0, fontWeight: 500, fontSize: "0.875rem" }}>
            Aucune séance de surveillance d&apos;examen ne vous est assignée pour le moment.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
          {surveillances.map((ex) => (
            <div
              key={ex.id}
              style={{
                padding: "1.2rem",
                borderRadius: "0.75rem",
                border: "1px solid #cbd5e1",
                backgroundColor: "#f8fafc",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>
                    {ex.moduleCode} · Session {ex.session}
                  </span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      padding: "0.2rem 0.5rem",
                      borderRadius: "0.25rem",
                      backgroundColor: "#e2e8f0",
                      color: "#334155",
                    }}
                  >
                    Salle {ex.salleCode}
                  </span>
                </div>
                <h4 style={{ margin: "0.2rem 0", fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
                  {ex.moduleIntitule}
                </h4>
                <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0.25rem 0 0.75rem" }}>
                  Groupe : <strong>{ex.groupeCode}</strong> · Date : <strong>{ex.dateExamen}</strong> ({ex.heureDebut?.substring(0, 5)} - {ex.heureFin?.substring(0, 5)})
                </p>
              </div>

              <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", color: "#475569" }}>
                  Surveillant {ex.surveillantPrincipalNom ? `(Principal : ${ex.surveillantPrincipalNom})` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => openControleSalle(ex)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.45rem 0.85rem",
                    borderRadius: "0.375rem",
                    backgroundColor: "#059669",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    border: 0,
                    cursor: "pointer",
                  }}
                >
                  Feuille de contrôle & tables →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CONTRÔLE DE SALLE ET ÉMARGEMENT ANTI-TRICHE */}
      {selectedExamen && (
        <Modal
          open={Boolean(selectedExamen)}
          onClose={() => setSelectedExamen(null)}
          title={`Contrôle Anti-Triche & Plan de Table · ${selectedExamen.moduleCode}`}
        >
          <div style={{ padding: "1.5rem" }}>
            <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", backgroundColor: "#f0fdf4", borderRadius: "0.5rem", border: "1px solid #bbf7d0" }}>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#166534", fontWeight: 600 }}>
                Salle : {selectedExamen.salleCode} · Date : {selectedExamen.dateExamen} ({selectedExamen.heureDebut?.substring(0, 5)} - {selectedExamen.heureFin?.substring(0, 5)})
              </p>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#15803d" }}>
                Vérifiez la carte d&apos;étudiant et conformité de la table attribuée. Toute disposition non respectée constitue une tentative de fraude.
              </p>
            </div>

            {loadingPlaces ? (
              <p style={{ color: "#64748b", textAlign: "center", padding: "1rem" }}>Chargement des étudiants et tables...</p>
            ) : places.length === 0 ? (
              <p style={{ color: "#64748b", textAlign: "center", padding: "1rem" }}>
                Aucune place assignée pour le moment.
              </p>
            ) : (
              <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                  <thead style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 5 }}>
                    <tr>
                      <th style={{ padding: "0.5rem 0.75rem" }}>Table assignée</th>
                      <th style={{ padding: "0.5rem 0.75rem" }}>Étudiant</th>
                      <th style={{ padding: "0.5rem 0.75rem" }}>Matricule</th>
                      <th style={{ padding: "0.5rem 0.75rem" }}>Statut</th>
                      <th style={{ padding: "0.5rem 0.75rem", textAlign: "right" }}>Pointage Présence / Fraude</th>
                    </tr>
                  </thead>
                  <tbody>
                    {places.map((p) => {
                      const isRadie = p.estRadie;
                      return (
                        <tr
                          key={p.id}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            backgroundColor: p.statutPresence === "FRAUDE_SUSPECTEE" ? "#fef2f2" : undefined,
                          }}
                        >
                          <td style={{ padding: "0.5rem 0.75rem" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "0.2rem 0.5rem",
                                borderRadius: "0.25rem",
                                backgroundColor: isRadie ? "#fee2e2" : "#e0e7ff",
                                color: isRadie ? "#991b1b" : "#3730a3",
                                fontWeight: 700,
                                fontSize: "0.75rem",
                              }}
                            >
                              {isRadie ? "RADIÉ" : p.codePlace}
                            </span>
                          </td>
                          <td style={{ padding: "0.5rem 0.75rem", fontWeight: 600, color: "#1e293b" }}>
                            {p.etudiantPrenom} {p.etudiantNom}
                          </td>
                          <td style={{ padding: "0.5rem 0.75rem", color: "#64748b" }}>{p.etudiantMatricule}</td>
                          <td style={{ padding: "0.5rem 0.75rem" }}>
                            <span
                              style={{
                                padding: "0.2rem 0.45rem",
                                borderRadius: "9999px",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                backgroundColor:
                                  p.statutPresence === "PRESENT"
                                    ? "#dcfce7"
                                    : p.statutPresence === "ABSENT"
                                    ? "#fee2e2"
                                    : p.statutPresence === "FRAUDE_SUSPECTEE"
                                    ? "#fef08a"
                                    : "#f1f5f9",
                                color:
                                  p.statutPresence === "PRESENT"
                                    ? "#166534"
                                    : p.statutPresence === "ABSENT"
                                    ? "#991b1b"
                                    : p.statutPresence === "FRAUDE_SUSPECTEE"
                                    ? "#854d0e"
                                    : "#475569",
                              }}
                            >
                              {p.statutPresence}
                            </span>
                          </td>
                          <td style={{ padding: "0.5rem 0.75rem", textAlign: "right" }}>
                            <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                              <button
                                type="button"
                                disabled={updatingId === p.id}
                                onClick={() => updatePresence(p.id, "PRESENT")}
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  borderRadius: "0.25rem",
                                  backgroundColor: "#16a34a",
                                  color: "white",
                                  fontSize: "0.7rem",
                                  border: 0,
                                  cursor: "pointer",
                                  opacity: updatingId === p.id ? 0.6 : 1,
                                }}
                              >
                                Présent
                              </button>
                              <button
                                type="button"
                                disabled={updatingId === p.id}
                                onClick={() => updatePresence(p.id, "ABSENT")}
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  borderRadius: "0.25rem",
                                  backgroundColor: "#dc2626",
                                  color: "white",
                                  fontSize: "0.7rem",
                                  border: 0,
                                  cursor: "pointer",
                                  opacity: updatingId === p.id ? 0.6 : 1,
                                }}
                              >
                                Absent
                              </button>
                              <button
                                type="button"
                                disabled={updatingId === p.id}
                                onClick={() => updatePresence(p.id, "FRAUDE_SUSPECTEE")}
                                style={{
                                  padding: "0.25rem 0.5rem",
                                  borderRadius: "0.25rem",
                                  backgroundColor: "#ca8a04",
                                  color: "white",
                                  fontSize: "0.7rem",
                                  border: 0,
                                  cursor: "pointer",
                                  opacity: updatingId === p.id ? 0.6 : 1,
                                }}
                              >
                                Fraude !
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <button
                type="button"
                onClick={() => setSelectedExamen(null)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  backgroundColor: "#e2e8f0",
                  color: "#334155",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  border: 0,
                  cursor: "pointer",
                }}
              >
                Fermer la feuille d&apos;émargement
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
