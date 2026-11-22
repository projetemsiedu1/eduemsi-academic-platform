"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Award,
  Briefcase,
  BookOpen,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  Users,
} from "lucide-react";
import { ApiClient, ApiError } from "@/lib/api-client";
import type { EtudiantProfil } from "@/types/student";
import type { PfeProjectDto, SujetCatalogueDto } from "@/types/pfe";

interface CamaradeOption {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
}

interface TeacherOption {
  id: number;
  nom: string;
  prenom: string;
  specialite?: string;
}

const STEPS = [
  { key: "SOUMIS", label: "Sujet soumis" },
  { key: "EN_ATTENTE_JURY", label: "Validé filière" },
  { key: "JURY_AFFECTE", label: "Jury affecté" },
  { key: "SOUTENU", label: "Soutenance & PV" },
];

function stepIndex(statut: string): number {
  if (statut === "SOUMIS") return 0;
  if (statut === "EN_ATTENTE_JURY") return 1;
  if (statut === "JURY_AFFECTE") return 2;
  if (statut === "SOUTENU" || statut === "AJOURNE") return 3;
  return 0;
}

export function StudentPfeTab({ profil }: { profil: EtudiantProfil | null }) {
  const [pfe, setPfe] = useState<PfeProjectDto | null>(null);
  const [sujets, setSujets] = useState<SujetCatalogueDto[]>([]);
  const [camarades, setCamarades] = useState<CamaradeOption[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Form stage
  const [titre, setTitre] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [resume, setResume] = useState("");
  const [binomeStageId, setBinomeStageId] = useState("");
  const [encadrantId, setEncadrantId] = useState("");

  // Catalogue binôme
  const [binomeCatalogueId, setBinomeCatalogueId] = useState("");

  async function loadPfeData() {
    setLoading(true);
    setError("");
    try {
      const [meRes, sujetsRes, ensRes] = await Promise.allSettled([
        ApiClient.get<PfeProjectDto>("/pfe/me"),
        ApiClient.get<SujetCatalogueDto[]>("/pfe/sujets"),
        ApiClient.get<{ content?: TeacherOption[] } | TeacherOption[]>("/enseignants?size=100"),
      ]);

      if (meRes.status === "fulfilled") {
        const val = meRes.value;
        setPfe(val && typeof val === "object" && "id" in val && val.id ? val : null);
      }
      if (sujetsRes.status === "fulfilled" && Array.isArray(sujetsRes.value)) {
        setSujets(sujetsRes.value);
      }
      if (ensRes.status === "fulfilled" && ensRes.value) {
        const list = Array.isArray(ensRes.value) ? ensRes.value : ensRes.value.content ?? [];
        setTeachers(list);
      }

      if (profil?.groupeId) {
        try {
          const grpRes = await ApiClient.get<{ content?: CamaradeOption[] } | CamaradeOption[]>(
            `/etudiants/groupe/${profil.groupeId}?size=50`
          );
          const list = Array.isArray(grpRes) ? grpRes : grpRes.content ?? [];
          setCamarades(list.filter((c) => c.id !== profil.id));
        } catch {
          setCamarades([]);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPfeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profil?.id, profil?.groupeId]);

  async function handleSoumettreStage(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const created = await ApiClient.post<PfeProjectDto>("/pfe/me", {
        titre,
        entrepriseAccueil: entreprise,
        technologiesCles: technologies,
        resume,
        binomeEtudiantId: binomeStageId ? Number(binomeStageId) : null,
        encadrantSouhaiteId: encadrantId ? Number(encadrantId) : null,
      });
      setPfe(created);
      setNotice("Votre sujet de stage PFE a été soumis pour validation !");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la soumission du sujet.");
    } finally {
      setBusy(false);
    }
  }

  async function handleChoisirCatalogue(sujetId: number) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const created = await ApiClient.post<PfeProjectDto>(`/pfe/sujets/${sujetId}/choisir`, {
        binomeEtudiantId: binomeCatalogueId ? Number(binomeCatalogueId) : null,
      });
      setPfe(created);
      setNotice("Sujet du catalogue sélectionné avec succès !");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de sélectionner ce sujet.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "2.5rem", textAlign: "center", color: "var(--muted)" }}>
        Chargement de votre espace PFE...
      </div>
    );
  }

  const showSelectionMode = !pfe || pfe.statut === "REJETE";

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {notice && (
        <div className="planning-feedback" style={{ margin: 0 }}>
          <span>{notice}</span>
        </div>
      )}
      {error && (
        <div className="planning-feedback error" style={{ margin: 0 }}>
          <span>{error}</span>
        </div>
      )}

      {pfe?.statut === "REJETE" && (
        <div
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "0.75rem",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            display: "flex",
            gap: "0.75rem",
            alignItems: "flex-start",
          }}
        >
          <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong>Votre proposition précédente (« {pfe.titre} ») a été refusée :</strong>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem" }}>
              {pfe.commentaireValidation || "Merci de soumettre un nouveau sujet ou de choisir un sujet dans le catalogue."}
            </p>
          </div>
        </div>
      )}

      {showSelectionMode ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))", gap: "1.5rem" }}>
          {/* PANEL 1 : PROPOSER SUJET DE STAGE */}
          <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
              <Briefcase size={20} style={{ color: "#059669" }} />
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>Proposer mon sujet de stage</h3>
            </div>
            <form onSubmit={handleSoumettreStage} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <div className="planning-field">
                <label htmlFor="pfe-titre">Titre du PFE *</label>
                <input
                  id="pfe-titre"
                  required
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  placeholder="Ex: Plateforme Cloud Kubernetes & Microservices"
                />
              </div>

              <div className="planning-field">
                <label htmlFor="pfe-ent">Entreprise d&apos;accueil *</label>
                <input
                  id="pfe-ent"
                  required
                  value={entreprise}
                  onChange={(e) => setEntreprise(e.target.value)}
                  placeholder="Ex: Capgemini, CGI, OCP Solutions..."
                />
              </div>

              <div className="planning-field">
                <label htmlFor="pfe-tech">Technologies clés</label>
                <input
                  id="pfe-tech"
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  placeholder="Ex: Java, Spring Boot, Next.js, Docker..."
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div className="planning-field">
                  <label htmlFor="pfe-binome">Binôme (même groupe)</label>
                  <select id="pfe-binome" value={binomeStageId} onChange={(e) => setBinomeStageId(e.target.value)}>
                    <option value="">Monôme (individuel)</option>
                    {camarades.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.prenom} {c.nom} ({c.matricule})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="planning-field">
                  <label htmlFor="pfe-enc">Encadrant souhaité</label>
                  <select id="pfe-enc" value={encadrantId} onChange={(e) => setEncadrantId(e.target.value)}>
                    <option value="">À désigner</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        Pr. {t.nom} {t.prenom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="planning-field">
                <label htmlFor="pfe-resume">Résumé & Problématique *</label>
                <textarea
                  id="pfe-resume"
                  required
                  rows={3}
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  placeholder="Décrivez les objectifs fonctionnels et techniques du stage..."
                />
              </div>

              <button type="submit" className="planning-primary" disabled={busy}>
                {busy ? "Soumission..." : "Soumettre mon sujet de stage"}
              </button>
            </form>
          </div>

          {/* PANEL 2 : CATALOGUE DES SUJETS ENSEIGNANTS */}
          <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.6rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <BookOpen size={20} style={{ color: "#2563eb" }} />
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>Catalogue des sujets EMSI ({sujets.length})</h3>
              </div>
            </div>

            <div className="planning-field" style={{ marginBottom: "1rem" }}>
              <label htmlFor="cat-binome">Choisir avec un binôme (optionnel)</label>
              <select id="cat-binome" value={binomeCatalogueId} onChange={(e) => setBinomeCatalogueId(e.target.value)}>
                <option value="">Travail en monôme</option>
                {camarades.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.prenom} {c.nom} ({c.matricule})
                  </option>
                ))}
              </select>
            </div>

            {sujets.length === 0 ? (
              <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                Aucun sujet disponible actuellement dans votre filière.
              </p>
            ) : (
              <div style={{ display: "grid", gap: "0.85rem", maxHeight: "480px", overflowY: "auto" }}>
                {sujets.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: "0.6rem",
                      padding: "1rem",
                      backgroundColor: "var(--background)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                      <strong style={{ fontSize: "0.95rem" }}>{s.titre}</strong>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.15rem 0.45rem", borderRadius: "9999px", backgroundColor: "#dbeafe", color: "#1e40af" }}>
                        {s.filiereCode}
                      </span>
                    </div>
                    <p style={{ margin: "0.35rem 0", fontSize: "0.82rem", color: "var(--muted)" }}>{s.description}</p>
                    <div style={{ fontSize: "0.78rem", color: "#059669", fontWeight: 600 }}>
                      Proposé par : {s.enseignantNomComplet}
                    </div>
                    {s.technologies && (
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.2rem" }}>
                        Stack : {s.technologies}
                      </div>
                    )}
                    <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                        Places : {s.placesOccupees ?? 0} / {s.placesMax}
                      </span>
                      <button
                        type="button"
                        disabled={busy || !s.estDisponible}
                        onClick={() => void handleChoisirCatalogue(s.id)}
                        style={{
                          padding: "0.4rem 0.85rem",
                          borderRadius: "0.4rem",
                          border: "none",
                          backgroundColor: "#059669",
                          color: "white",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Choisir ce sujet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* SUIVI DU PROJET PFE ACTIF */
        <div style={{ display: "grid", gap: "1.25rem" }}>
          {/* STEPPER D'AVANCEMENT */}
          <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "1.25rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
              {STEPS.map((st, idx) => {
                const cur = stepIndex(pfe.statut);
                const done = idx <= cur;
                return (
                  <div
                    key={st.key}
                    style={{
                      padding: "0.65rem 0.75rem",
                      borderRadius: "0.5rem",
                      border: `1px solid ${done ? "#10b981" : "var(--border)"}`,
                      backgroundColor: done ? "#ecfdf5" : "var(--background)",
                      color: done ? "#065f46" : "var(--muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.82rem",
                      fontWeight: done ? 700 : 500,
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>{idx + 1}. {st.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CARTE DÉTAILS DU PROJET */}
          <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: "9999px", backgroundColor: "#ecfdf5", color: "#065f46" }}>
                  {pfe.origine === "CATALOGUE" ? "Sujet Catalogue EMSI" : `Stage · ${pfe.entrepriseAccueil || "Entreprise"}`}
                </span>
                <h3 style={{ margin: "0.5rem 0 0.25rem", fontSize: "1.2rem", fontWeight: 700 }}>{pfe.titre}</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>
                  <Users size={14} style={{ display: "inline", marginRight: "0.3rem" }} />
                  Équipe : <strong style={{ color: "var(--foreground)" }}>{pfe.binomeEtudiants}</strong> · Filière : {pfe.filiereCode}
                </p>
              </div>
              {pfe.pvVerrouille && pfe.noteFinale !== null && (
                <div style={{ padding: "0.75rem 1.25rem", borderRadius: "0.6rem", backgroundColor: "#ecfdf5", border: "2px solid #059669", textAlign: "center" }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "#065f46" }}>Résultat Final</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#047857" }}>{pfe.noteFinale.toFixed(2)} / 20</div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#065f46" }}>{pfe.mention}</div>
                </div>
              )}
            </div>

            <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "var(--foreground)", lineHeight: 1.6 }}>{pfe.resume}</p>
            {pfe.technologiesCles && (
              <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                <strong>Technologies :</strong> {pfe.technologiesCles}
              </div>
            )}

            {pfe.pvVerrouille && (
              <div style={{ marginTop: "1rem" }}>
                <Link
                  href={`/timetable/pfe/pv/${pfe.id}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    padding: "0.55rem 1rem",
                    borderRadius: "0.5rem",
                    backgroundColor: "#0f172a",
                    color: "white",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <FileText size={16} />
                  Consulter & Imprimer le PV Officiel (PDF)
                </Link>
              </div>
            )}
          </div>

          {/* CARTE CONVOCATION SOUTENANCE & JURY IA */}
          {pfe.juryId && (
            <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
                <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Award size={18} style={{ color: "#059669" }} />
                  Convocation de Soutenance & Jury Officiel (4 Membres)
                </h4>
                {pfe.scoreAffiniteIa && (
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#059669", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Sparkles size={14} />
                    Affinité IA : {pfe.scoreAffiniteIa}%
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "1rem", fontSize: "0.9rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Calendar size={16} style={{ color: "#059669" }} />
                  <strong>Date :</strong> {pfe.dateSoutenance ? pfe.dateSoutenance.replace("T", " à ").substring(0, 18) : "À confirmer"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <MapPin size={16} style={{ color: "#059669" }} />
                  <strong>Salle :</strong> {pfe.salleSoutenanceCode || "À confirmer"}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
                {[
                  { role: "Président HDR", nom: pfe.presidentHdrNom },
                  { role: "Rapporteur", nom: pfe.rapporteurNom },
                  { role: "Examinateur IA", nom: pfe.examinateurIaNom },
                  { role: "Encadrant", nom: pfe.encadrantNom },
                ].map((m) => (
                  <div key={m.role} style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid var(--border)", backgroundColor: "var(--background)" }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>{m.role}</div>
                    <div style={{ fontWeight: 600, fontSize: "0.88rem", marginTop: "0.2rem" }}>{m.nom || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
