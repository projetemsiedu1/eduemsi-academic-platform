"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Calendar, Clock, AlertTriangle, Users, CheckCircle, Sparkles } from "lucide-react";
import { TimetableHeader } from "@/components/timetable/TimetableHeader";
import { ApiClient } from "@/lib/api-client";
import type { ExamenDto } from "@/types/exams";
import { ExamenModal } from "./ExamenModal";
import { ExamenDistributionModal } from "./ExamenDistributionModal";
import { AutoPlanificationModal } from "./AutoPlanificationModal";

export function PlanningExams() {
  const [examens, setExamens] = useState<ExamenDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [autoPlanifOpen, setAutoPlanifOpen] = useState(false);
  const [distributionExamen, setDistributionExamen] = useState<ExamenDto | null>(null);
  const [filterSession, setFilterSession] = useState<string>("ALL");
  const [filterSearch, setFilterSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function loadExamens() {
    setLoading(true);
    setError("");
    try {
      const data = await ApiClient.get<ExamenDto[]>("/examens");
      setExamens(data || []);
    } catch {
      setError("Impossible de charger le calendrier des examens.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExamens();
  }, []);

  async function handleDelete(id: number) {
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette épreuve d'examen ?")) return;
    setDeletingId(id);
    try {
      await ApiClient.delete(`/examens/${id}`);
      setExamens((prev) => prev.filter((e) => e.id !== id));
      setNotice("Épreuve d'examen supprimée avec succès.");
      setTimeout(() => setNotice(""), 4000);
    } catch {
      setError("Erreur lors de la suppression de l'épreuve.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleCreated(newExamen: ExamenDto) {
    setExamens((prev) => [...prev, newExamen]);
    setNotice("Nouvelle épreuve d'examen planifiée avec succès sans conflit.");
    setTimeout(() => setNotice(""), 4000);
  }

  function handleAutoPlanified(scheduled: ExamenDto[]) {
    void loadExamens();
    setNotice(`Auto-planification CP-SAT réussie : ${scheduled.length} épreuves générées sans collision.`);
    setTimeout(() => setNotice(""), 5000);
  }

  const filteredExamens = examens.filter((e) => {
    if (filterSession !== "ALL" && e.session !== filterSession) return false;
    if (filterSearch) {
      const q = filterSearch.toLowerCase();
      const matchModule = e.intituleModule?.toLowerCase().includes(q) || e.codeModule?.toLowerCase().includes(q);
      const matchGroupe = e.codeGroupe?.toLowerCase().includes(q);
      const matchSalle = e.codeSalle?.toLowerCase().includes(q);
      if (!matchModule && !matchGroupe && !matchSalle) return false;
    }
    return true;
  });

  const totalNormales = examens.filter((e) => e.session === "NORMALE").length;
  const totalRattrapages = examens.filter((e) => e.session === "RATTRAPAGE").length;

  return (
    <>
      <TimetableHeader
        title="Planification des Examens"
        subtitle="Organisation des sessions d'examens, répartition hétérogène des étudiants (anti-triche), salles et surveillants."
      />

      <main className="planning-content">
        {/* En-tête des indicateurs */}
        <section className="planning-indicators" aria-label="Indicateurs d'examen" style={{ marginBottom: "1.5rem" }}>
          <div style={{ padding: "1.25rem", borderRadius: "0.75rem", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.85rem", color: "#64748b", display: "block" }}>Épreuves programmées</span>
            <strong style={{ fontSize: "1.75rem", color: "#0f172a" }}>{examens.length}</strong>
          </div>
          <div style={{ padding: "1.25rem", borderRadius: "0.75rem", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}>
            <span style={{ fontSize: "0.85rem", color: "#1e40af", display: "block" }}>Session Normale</span>
            <strong style={{ fontSize: "1.75rem", color: "#1d4ed8" }}>{totalNormales}</strong>
          </div>
          <div style={{ padding: "1.25rem", borderRadius: "0.75rem", backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
            <span style={{ fontSize: "0.85rem", color: "#92400e", display: "block" }}>Session de Rattrapage</span>
            <strong style={{ fontSize: "1.75rem", color: "#b45309" }}>{totalRattrapages}</strong>
          </div>
        </section>

        {notice && (
          <div style={{ padding: "0.85rem 1rem", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", borderRadius: "0.5rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle size={18} />
            <span>{notice}</span>
          </div>
        )}

        {error && (
          <div style={{ padding: "0.85rem 1rem", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", borderRadius: "0.5rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Barre d'outils et filtres */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Rechercher par module, groupe ou salle..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              style={{ padding: "0.5rem 0.75rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1", fontSize: "0.875rem", minWidth: "260px" }}
            />
            <select
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
              style={{ padding: "0.5rem 0.75rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1", fontSize: "0.875rem" }}
            >
              <option value="ALL">Toutes les sessions</option>
              <option value="NORMALE">Session Normale</option>
              <option value="RATTRAPAGE">Session de Rattrapage</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              onClick={() => setAutoPlanifOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1rem",
                borderRadius: "0.5rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                backgroundColor: "#047857",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Sparkles size={16} />
              <span>Auto-planifier la session (Solveur)</span>
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="planning-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.1rem", borderRadius: "0.5rem", fontWeight: 600, fontSize: "0.875rem" }}
            >
              <Plus size={17} />
              <span>Planifier une épreuve</span>
            </button>
          </div>
        </div>

        {/* Table des examens */}
        <section className="planning-panel">
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "1rem" }}>
            Calendrier Officiel des Épreuves & Affectation des Tables ({filteredExamens.length})
          </h2>

          {loading ? (
            <p style={{ color: "#64748b", padding: "2rem", textAlign: "center" }}>Chargement des examens...</p>
          ) : filteredExamens.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
              <Calendar size={40} style={{ margin: "0 auto 1rem", opacity: 0.4 }} />
              <p style={{ fontWeight: 600, fontSize: "1rem" }}>Aucune épreuve d&apos;examen trouvée.</p>
              <p style={{ fontSize: "0.85rem" }}>Cliquez sur &quot;Auto-planifier la session&quot; ou &quot;Planifier une épreuve&quot; pour démarrer.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Date & Horaires</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Module & Épreuve</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Groupe</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Salle & Campus</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Surveillance</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Session</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>Actions & Tables</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExamens.map((exam) => (
                    <tr key={exam.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.85rem 0.5rem" }}>
                        <div style={{ fontWeight: 600, color: "#1e293b" }}>{exam.dateExamen}</div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <Clock size={13} />
                          {exam.heureDebut?.substring(0, 5)} - {exam.heureFin?.substring(0, 5)} ({exam.dureeMinutes} min)
                        </div>
                      </td>
                      <td style={{ padding: "0.85rem 0.5rem" }}>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>{exam.intituleModule}</div>
                        <div style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600 }}>{exam.codeModule}</div>
                        {exam.consignes && (
                          <div style={{ fontSize: "0.75rem", color: "#64748b", fontStyle: "italic", marginTop: "0.2rem" }}>
                            {exam.consignes}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "0.85rem 0.5rem" }}>
                        <div style={{ fontWeight: 600 }}>{exam.codeGroupe}</div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{exam.effectifGroupe} étudiants</div>
                      </td>
                      <td style={{ padding: "0.85rem 0.5rem" }}>
                        <div style={{ fontWeight: 600, color: "#1e293b" }}>{exam.codeSalle}</div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          {exam.campusNom ? `${exam.campusNom} · ` : ""}Capacité: {exam.capaciteSalle}
                        </div>
                      </td>
                      <td style={{ padding: "0.85rem 0.5rem" }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "#1e293b" }}>
                          1. {exam.surveillantPrincipalNom}
                        </div>
                        {exam.surveillantSecondaireNom && (
                          <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                            2. {exam.surveillantSecondaireNom}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "0.85rem 0.5rem" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            backgroundColor: exam.session === "NORMALE" ? "#dbeafe" : "#fef3c7",
                            color: exam.session === "NORMALE" ? "#1e40af" : "#92400e",
                          }}
                        >
                          {exam.session}
                        </span>
                      </td>
                      <td style={{ padding: "0.85rem 0.5rem", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                          <button
                            onClick={() => setDistributionExamen(exam)}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-800 transition flex items-center gap-1"
                            title="Visualiser et générer la répartition des tables"
                          >
                            <Users size={14} />
                            <span>Tables & Places</span>
                          </button>

                          <button
                            onClick={() => handleDelete(exam.id)}
                            disabled={deletingId === exam.id}
                            aria-label="Supprimer cette épreuve"
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              padding: "0.4rem",
                              borderRadius: "0.25rem",
                            }}
                            title="Supprimer l'épreuve"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <ExamenModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />

      <AutoPlanificationModal
        open={autoPlanifOpen}
        onClose={() => setAutoPlanifOpen(false)}
        onSuccess={handleAutoPlanified}
      />

      <ExamenDistributionModal
        open={Boolean(distributionExamen)}
        onClose={() => setDistributionExamen(null)}
        examen={distributionExamen}
      />
    </>
  );
}
