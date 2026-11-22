"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  XCircle,
  Sparkles,
  FileText,
  Calendar,
  MapPin,
  Search,
} from "lucide-react";
import { TimetableHeader } from "@/components/timetable/TimetableHeader";
import { ApiClient, ApiError } from "@/lib/api-client";
import { Modal } from "@/components/ui/modal";
import { JuryPfeModal } from "./JuryPfeModal";
import type { PfeProjectDto, StatutPfe } from "@/types/pfe";

const STATUT_BADGES: Record<StatutPfe, { bg: string; fg: string; label: string }> = {
  SOUMIS: { bg: "#fef3c7", fg: "#92400e", label: "Soumis (En validation)" },
  EN_ATTENTE_JURY: { bg: "#dbeafe", fg: "#1e40af", label: "Validé · Attente Jury" },
  JURY_AFFECTE: { bg: "#ede9fe", fg: "#5b21b6", label: "Jury Affecté" },
  SOUTENU: { bg: "#d1fae5", fg: "#065f46", label: "Soutenu (Admis)" },
  AJOURNE: { bg: "#fee2e2", fg: "#991b1b", label: "Ajourné" },
  REJETE: { bg: "#f1f5f9", fg: "#475569", label: "Rejeté" },
};

export function PlanningPfe() {
  const [projets, setProjets] = useState<PfeProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatut, setFilterStatut] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const [juryModalProject, setJuryModalProject] = useState<PfeProjectDto | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PfeProjectDto | null>(null);
  const [rejectComment, setRejectComment] = useState("");

  async function loadProjets() {
    setLoading(true);
    setError("");
    try {
      const data = await ApiClient.get<PfeProjectDto[]>("/pfe");
      setProjets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger les projets PFE.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProjets();
  }, []);

  async function handleValider(p: PfeProjectDto, accepte: boolean, commentaire?: string) {
    setBusyId(p.id);
    setError("");
    try {
      const updated = await ApiClient.patch<PfeProjectDto>(`/pfe/${p.id}/valider-sujet`, {
        accepte,
        commentaire: commentaire || (accepte ? "Sujet conforme aux exigences de la filière." : "Sujet à retravailler."),
      });
      setProjets((prev) => prev.map((item) => (item.id === p.id ? updated : item)));
      setNotice(accepte ? `Sujet « ${p.titre} » validé avec succès.` : `Sujet « ${p.titre} » refusé.`);
      setTimeout(() => setNotice(""), 4500);
      setRejectTarget(null);
      setRejectComment("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la validation.");
    } finally {
      setBusyId(null);
    }
  }

  function handleJuryUpdated(updated: PfeProjectDto) {
    setProjets((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setNotice(`Jury affecté et convocations envoyées pour « ${updated.titre} ».`);
    setTimeout(() => setNotice(""), 5000);
  }

  const filtered = projets.filter((p) => {
    if (filterStatut !== "ALL" && p.statut !== filterStatut) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchTitre = p.titre?.toLowerCase().includes(q);
      const matchEtud = p.binomeEtudiants?.toLowerCase().includes(q);
      const matchFil = p.filiereCode?.toLowerCase().includes(q);
      if (!matchTitre && !matchEtud && !matchFil) return false;
    }
    return true;
  });

  const countByStatut = (st: StatutPfe) => projets.filter((p) => p.statut === st).length;

  return (
    <>
      <TimetableHeader
        title="PFE & Soutenances · Supervision, Jury IA & PV"
        subtitle="Validez les sujets de stage ou du catalogue, composez les jurys à 4 membres (BR-PFE-07) avec l'IA et suivez les procès-verbaux."
      />

      <main className="planning-content">
        {notice && (
          <div className="planning-feedback" style={{ margin: "0 0 1.25rem" }}>
            <span>{notice}</span>
          </div>
        )}
        {error && (
          <div className="planning-feedback error" style={{ margin: "0 0 1.25rem" }}>
            <span>{error}</span>
          </div>
        )}

        {/* STATS */}
        <div className="planning-indicators" style={{ marginBottom: "1.5rem" }}>
          <div className="planning-stat-card">
            <div className="planning-stat-header"><span>En attente validation</span><Award size={18} /></div>
            <p className="planning-stat-value" style={{ color: "#d97706" }}>{countByStatut("SOUMIS")}</p>
            <span className="planning-stat-hint">Sujets soumis par étudiants</span>
          </div>
          <div className="planning-stat-card">
            <div className="planning-stat-header"><span>Attente de Jury IA</span><Sparkles size={18} /></div>
            <p className="planning-stat-value" style={{ color: "#2563eb" }}>{countByStatut("EN_ATTENTE_JURY")}</p>
            <span className="planning-stat-hint">Prêts pour affectation jury</span>
          </div>
          <div className="planning-stat-card">
            <div className="planning-stat-header"><span>Soutenances planifiées</span><Calendar size={18} /></div>
            <p className="planning-stat-value" style={{ color: "#7c3aed" }}>{countByStatut("JURY_AFFECTE")}</p>
            <span className="planning-stat-hint">Convocations envoyées</span>
          </div>
          <div className="planning-stat-card">
            <div className="planning-stat-header"><span>Soutenances clôturées</span><CheckCircle2 size={18} /></div>
            <p className="planning-stat-value" style={{ color: "#059669" }}>
              {countByStatut("SOUTENU") + countByStatut("AJOURNE")}
            </p>
            <span className="planning-stat-hint">PV verrouillés officiellement</span>
          </div>
        </div>

        {/* BARRE DE FILTRE */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1.5rem" }}>
          <div style={{ position: "relative", flex: "1 1 260px", maxWidth: "400px" }}>
            <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            <input
              type="text"
              placeholder="Rechercher par titre, étudiant, filière..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", paddingLeft: "2.25rem", paddingRight: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", minHeight: "42px" }}
            />
          </div>

          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            style={{ minHeight: "42px", padding: "0 0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}
          >
            <option value="ALL">Tous les statuts ({projets.length})</option>
            <option value="SOUMIS">Soumis ({countByStatut("SOUMIS")})</option>
            <option value="EN_ATTENTE_JURY">Validé · Attente Jury ({countByStatut("EN_ATTENTE_JURY")})</option>
            <option value="JURY_AFFECTE">Jury Affecté ({countByStatut("JURY_AFFECTE")})</option>
            <option value="SOUTENU">Soutenu ({countByStatut("SOUTENU")})</option>
            <option value="AJOURNE">Ajourné ({countByStatut("AJOURNE")})</option>
            <option value="REJETE">Rejeté ({countByStatut("REJETE")})</option>
          </select>
        </div>

        {/* TABLEAU PFE */}
        <section className="planning-panel">
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
            Projets de Fin d&apos;Études & Soutenances ({filtered.length})
          </h2>

          {loading ? (
            <p style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>Chargement des projets PFE...</p>
          ) : filtered.length === 0 ? (
            <p style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>Aucun projet PFE correspondant.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--muted)" }}>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Projet & Technologies</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Étudiant(s) & Filière</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Encadrant / Jury</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Soutenance</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Statut / Note</th>
                    <th style={{ padding: "0.75rem 0.5rem", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const st = STATUT_BADGES[p.statut] || STATUT_BADGES.SOUMIS;
                    return (
                      <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "0.85rem 0.5rem", maxWidth: "280px" }}>
                          <div style={{ fontWeight: 700, color: "var(--foreground)" }}>{p.titre}</div>
                          {p.entrepriseAccueil && (
                            <div style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600 }}>
                              {p.origine === "CATALOGUE" ? "Catalogue EMSI" : `Stage : ${p.entrepriseAccueil}`}
                            </div>
                          )}
                          {p.technologiesCles && (
                            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.2rem" }}>
                              {p.technologiesCles}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: "0.85rem 0.5rem" }}>
                          <div style={{ fontWeight: 600 }}>{p.binomeEtudiants}</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{p.filiereCode || "Ingénierie"}</div>
                        </td>

                        <td style={{ padding: "0.85rem 0.5rem", fontSize: "0.8rem" }}>
                          {p.juryId ? (
                            <div>
                              <div><strong>Prés. :</strong> {p.presidentHdrNom}</div>
                              <div><strong>Rapp. :</strong> {p.rapporteurNom}</div>
                              <div style={{ color: "var(--muted)" }}><strong>Exam. :</strong> {p.examinateurIaNom}</div>
                              <div style={{ color: "var(--muted)" }}><strong>Enc. :</strong> {p.encadrantNom}</div>
                            </div>
                          ) : (
                            <span style={{ color: "var(--muted)" }}>
                              {p.encadrantSouhaiteNom ? `Souhaité : ${p.encadrantSouhaiteNom}` : "Non assigné"}
                            </span>
                          )}
                        </td>

                        <td style={{ padding: "0.85rem 0.5rem", fontSize: "0.8rem" }}>
                          {p.dateSoutenance ? (
                            <div>
                              <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                <Calendar size={13} />
                                {p.dateSoutenance.replace("T", " ").substring(0, 16)}
                              </div>
                              <div style={{ color: "var(--muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                <MapPin size={13} />
                                {p.salleSoutenanceCode || "Salle à définir"}
                              </div>
                              <div style={{ color: "var(--muted)", marginTop: "0.15rem" }}>
                                Évals : {p.nbEvaluations ?? 0}/4
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: "var(--muted)" }}>Non planifiée</span>
                          )}
                        </td>

                        <td style={{ padding: "0.85rem 0.5rem" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "0.25rem 0.6rem",
                              borderRadius: "9999px",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              backgroundColor: st.bg,
                              color: st.fg,
                            }}
                          >
                            {st.label}
                          </span>
                          {p.pvVerrouille && p.noteFinale !== null && (
                            <div style={{ marginTop: "0.35rem", fontSize: "0.8rem", fontWeight: 700, color: "#059669" }}>
                              {p.noteFinale.toFixed(2)}/20 · {p.mention}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: "0.85rem 0.5rem", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "0.4rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                            {p.statut === "SOUMIS" && (
                              <>
                                <button
                                  type="button"
                                  disabled={busyId === p.id}
                                  onClick={() => void handleValider(p, true)}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.3rem",
                                    padding: "0.4rem 0.7rem",
                                    borderRadius: "0.4rem",
                                    border: "none",
                                    backgroundColor: "#059669",
                                    color: "white",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    minHeight: "36px",
                                  }}
                                >
                                  <CheckCircle2 size={14} />
                                  Valider
                                </button>
                                <button
                                  type="button"
                                  disabled={busyId === p.id}
                                  onClick={() => {
                                    setRejectTarget(p);
                                    setRejectComment("");
                                  }}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.3rem",
                                    padding: "0.4rem 0.7rem",
                                    borderRadius: "0.4rem",
                                    border: "1px solid #fca5a5",
                                    backgroundColor: "#fee2e2",
                                    color: "#b91c1c",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    minHeight: "36px",
                                  }}
                                >
                                  <XCircle size={14} />
                                  Rejeter
                                </button>
                              </>
                            )}

                            {(p.statut === "EN_ATTENTE_JURY" || (p.statut === "JURY_AFFECTE" && !p.pvVerrouille)) && (
                              <button
                                type="button"
                                onClick={() => setJuryModalProject(p)}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.35rem",
                                  padding: "0.4rem 0.75rem",
                                  borderRadius: "0.4rem",
                                  border: "1px solid #10b981",
                                  backgroundColor: "#ecfdf5",
                                  color: "#065f46",
                                  fontSize: "0.78rem",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  minHeight: "36px",
                                }}
                              >
                                <Sparkles size={14} />
                                {p.statut === "JURY_AFFECTE" ? "Modifier Jury" : "Proposer le jury (IA)"}
                              </button>
                            )}

                            {p.pvVerrouille && (
                              <Link
                                href={`/timetable/pfe/pv/${p.id}`}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.35rem",
                                  padding: "0.4rem 0.75rem",
                                  borderRadius: "0.4rem",
                                  backgroundColor: "#0f172a",
                                  color: "white",
                                  fontSize: "0.78rem",
                                  fontWeight: 600,
                                  textDecoration: "none",
                                  minHeight: "36px",
                                }}
                              >
                                <FileText size={14} />
                                Voir le PV
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <JuryPfeModal
        open={Boolean(juryModalProject)}
        projet={juryModalProject}
        onClose={() => setJuryModalProject(null)}
        onSuccess={handleJuryUpdated}
      />

      <Modal
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title="Rejeter le sujet PFE"
        busy={Boolean(busyId)}
        maxWidth="520px"
      >
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            Motif de rejet pour <strong>{rejectTarget?.titre}</strong> :
          </p>
          <div className="planning-field">
            <label htmlFor="reject-reason">Commentaire à destination des étudiants *</label>
            <textarea
              id="reject-reason"
              rows={3}
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Ex: Problématique insuffisante, merci de préciser l'architecture..."
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
            <button type="button" onClick={() => setRejectTarget(null)} style={{ padding: "0.5rem 1rem", borderRadius: "0.4rem", border: "1px solid var(--border)", background: "var(--surface)" }}>
              Annuler
            </button>
            <button
              type="button"
              disabled={!rejectComment.trim() || Boolean(busyId)}
              onClick={() => rejectTarget && void handleValider(rejectTarget, false, rejectComment)}
              style={{ padding: "0.5rem 1rem", borderRadius: "0.4rem", border: "none", backgroundColor: "#dc2626", color: "white", fontWeight: 600, cursor: "pointer" }}
            >
              Confirmer le rejet
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
