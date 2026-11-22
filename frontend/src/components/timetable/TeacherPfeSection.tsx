"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Plus,
  Edit3,
  Trash2,
  Award,
  Lock,
  FileText,
  Calendar,
  MapPin,
  ClipboardCheck,
} from "lucide-react";
import { ApiClient, ApiError } from "@/lib/api-client";
import { Modal } from "@/components/ui/modal";
import { EvaluationPfeModal } from "./EvaluationPfeModal";
import type { PfeProjectDto, SujetCatalogueDto } from "@/types/pfe";

interface FiliereOption {
  id: number;
  code: string;
  libelle: string;
}

export function TeacherSujetsTab() {
  const [sujets, setSujets] = useState<SujetCatalogueDto[]>([]);
  const [filieres, setFilieres] = useState<FiliereOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SujetCatalogueDto | null>(null);
  const [filiereId, setFiliereId] = useState("");
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [placesMax, setPlacesMax] = useState("1");
  const [busy, setBusy] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [sujRes, filRes] = await Promise.allSettled([
        ApiClient.get<SujetCatalogueDto[]>("/pfe/sujets/mes-sujets"),
        ApiClient.get<FiliereOption[]>("/filieres/all"),
      ]);
      if (sujRes.status === "fulfilled" && Array.isArray(sujRes.value)) {
        setSujets(sujRes.value);
      }
      if (filRes.status === "fulfilled" && Array.isArray(filRes.value)) {
        setFilieres(filRes.value);
        if (filRes.value.length > 0 && !filiereId) {
          setFiliereId(String(filRes.value[0].id));
        }
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger vos sujets.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setTitre("");
    setDescription("");
    setTechnologies("");
    setPlacesMax("1");
    if (filieres.length > 0) setFiliereId(String(filieres[0].id));
    setError("");
    setModalOpen(true);
  }

  function openEdit(s: SujetCatalogueDto) {
    setEditing(s);
    setFiliereId(String(s.filiereId));
    setTitre(s.titre);
    setDescription(s.description);
    setTechnologies(s.technologies || "");
    setPlacesMax(String(s.placesMax));
    setError("");
    setModalOpen(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const payload = {
        filiereId: Number(filiereId),
        titre,
        description,
        technologies,
        placesMax: Number(placesMax) || 1,
        estDisponible: editing ? editing.estDisponible : true,
      };
      if (editing) {
        await ApiClient.put(`/pfe/sujets/${editing.id}`, payload);
        setNotice("Sujet mis à jour.");
      } else {
        await ApiClient.post("/pfe/sujets", payload);
        setNotice("Nouveau sujet PFE publié dans le catalogue !");
      }
      setModalOpen(false);
      await loadData();
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de l'enregistrement.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Supprimer ce sujet PFE du catalogue ?")) return;
    try {
      await ApiClient.delete(`/pfe/sujets/${id}`);
      setSujets((prev) => prev.filter((s) => s.id !== id));
      setNotice("Sujet supprimé.");
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de supprimer ce sujet.");
    }
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {notice && <div className="planning-feedback" style={{ margin: 0 }}>{notice}</div>}
      {error && <div className="planning-feedback error" style={{ margin: 0 }}>{error}</div>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Catalogue de mes sujets PFE proposés</h3>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
            Les sujets disponibles peuvent être sélectionnés directement par les étudiants de la filière.
          </p>
        </div>
        <button type="button" className="planning-primary" onClick={openCreate}>
          <Plus size={16} />
          Proposer un sujet PFE
        </button>
      </div>

      {loading ? (
        <p style={{ color: "var(--muted)", padding: "2rem", textAlign: "center" }}>Chargement de vos sujets...</p>
      ) : sujets.length === 0 ? (
        <div style={{ padding: "2.5rem", textAlign: "center", backgroundColor: "var(--surface)", borderRadius: "0.75rem", border: "1px solid var(--border)", color: "var(--muted)" }}>
          Vous n&apos;avez pas encore publié de sujet PFE dans le catalogue.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {sujets.map((s) => (
            <div key={s.id} style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 360px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "9999px", backgroundColor: "#dbeafe", color: "#1e40af" }}>
                    {s.filiereCode}
                  </span>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "9999px", backgroundColor: s.estDisponible ? "#d1fae5" : "#f1f5f9", color: s.estDisponible ? "#065f46" : "#475569" }}>
                    {s.estDisponible ? `Disponible (${s.placesOccupees ?? 0}/${s.placesMax})` : "Complet"}
                  </span>
                </div>
                <h4 style={{ margin: "0.45rem 0 0.25rem", fontSize: "1.02rem", fontWeight: 700 }}>{s.titre}</h4>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>{s.description}</p>
                {s.technologies && (
                  <p style={{ margin: "0.35rem 0 0", fontSize: "0.78rem", color: "#059669", fontWeight: 600 }}>
                    Technologies : {s.technologies}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => openEdit(s)}
                  style={{ padding: "0.4rem 0.65rem", borderRadius: "0.4rem", border: "1px solid var(--border)", backgroundColor: "var(--surface)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem" }}
                >
                  <Edit3 size={14} /> Modifier
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(s.id)}
                  style={{ padding: "0.4rem 0.65rem", borderRadius: "0.4rem", border: "1px solid #fca5a5", backgroundColor: "#fee2e2", color: "#b91c1c", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem" }}
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Modifier mon sujet PFE" : "Proposer un sujet PFE"}
        busy={busy}
        maxWidth="620px"
      >
        <form onSubmit={handleSave} className="planning-resource-form" style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
            <div className="planning-field">
              <label htmlFor="suj-fil">Filière cible *</label>
              <select id="suj-fil" value={filiereId} onChange={(e) => setFiliereId(e.target.value)} required>
                {filieres.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.code} — {f.libelle}
                  </option>
                ))}
              </select>
            </div>
            <div className="planning-field">
              <label htmlFor="suj-places">Places max *</label>
              <input id="suj-places" type="number" min="1" max="5" value={placesMax} onChange={(e) => setPlacesMax(e.target.value)} required />
            </div>
          </div>

          <div className="planning-field">
            <label htmlFor="suj-titre">Intitulé du sujet *</label>
            <input id="suj-titre" required value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Ex: Plateforme RAG & Analytics EMSI" />
          </div>

          <div className="planning-field">
            <label htmlFor="suj-tech">Technologies recommandées</label>
            <input id="suj-tech" value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="Ex: Java, Spring Boot, Python, Docker..." />
          </div>

          <div className="planning-field">
            <label htmlFor="suj-desc">Description & Livrables attendus *</label>
            <textarea id="suj-desc" rows={3} required value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="planning-form-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
            <button type="button" onClick={() => setModalOpen(false)} disabled={busy}>Annuler</button>
            <button type="submit" className="planning-primary" disabled={busy}>
              {busy ? "Enregistrement..." : editing ? "Mettre à jour" : "Publier le sujet"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export function TeacherJurysTab() {
  const [jurys, setJurys] = useState<PfeProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [evalTarget, setEvalTarget] = useState<PfeProjectDto | null>(null);
  const [lockingId, setLockingId] = useState<number | null>(null);

  async function loadJurys() {
    setLoading(true);
    setError("");
    try {
      const data = await ApiClient.get<PfeProjectDto[]>("/pfe/jurys/me");
      setJurys(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger vos jurys PFE.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadJurys();
  }, []);

  async function handleLockPv(p: PfeProjectDto) {
    if (!window.confirm(`Verrouiller officiellement le PV pour « ${p.titre} » ? Les notes deviendront définitives.`)) {
      return;
    }
    setLockingId(p.id);
    setError("");
    try {
      await ApiClient.post(`/pfe/${p.id}/pv/verrouiller`, {});
      setNotice(`PV verrouillé officiellement pour « ${p.titre} » !`);
      await loadJurys();
      setTimeout(() => setNotice(""), 5000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de verrouiller le PV.");
    } finally {
      setLockingId(null);
    }
  }

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {notice && <div className="planning-feedback" style={{ margin: 0 }}>{notice}</div>}
      {error && <div className="planning-feedback error" style={{ margin: 0 }}>{error}</div>}

      <div>
        <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Mes Jurys & Soutenances PFE</h3>
        <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "var(--muted)" }}>
          Saisissez votre grille d&apos;évaluation (/20). Lorsque les 4 membres ont voté, le Président HDR peut verrouiller le PV.
        </p>
      </div>

      {loading ? (
        <p style={{ color: "var(--muted)", padding: "2rem", textAlign: "center" }}>Chargement de vos soutenances...</p>
      ) : jurys.length === 0 ? (
        <div style={{ padding: "2.5rem", textAlign: "center", backgroundColor: "var(--surface)", borderRadius: "0.75rem", border: "1px solid var(--border)", color: "var(--muted)" }}>
          Aucune soutenance PFE assignée à votre jury pour le moment.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {jurys.map((p) => (
            <div key={p.id} style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "0.75rem", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 340px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.35rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: "9999px", backgroundColor: "#ede9fe", color: "#5b21b6" }}>
                    <Award size={12} style={{ display: "inline", marginRight: "0.25rem" }} />
                    {p.monRoleJury || "Membre du jury"}
                  </span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: "9999px", backgroundColor: "#f1f5f9", color: "#334155" }}>
                    Grilles saisies : {p.nbEvaluations ?? 0} / 4
                  </span>
                  {p.maNoteSaisie !== null && (
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: "9999px", backgroundColor: "#d1fae5", color: "#065f46" }}>
                      Ma note : {p.maNoteSaisie.toFixed(2)}/20
                    </span>
                  )}
                </div>

                <h4 style={{ margin: "0 0 0.25rem", fontSize: "1.05rem", fontWeight: 700 }}>{p.titre}</h4>
                <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                  Étudiant(s) : <strong style={{ color: "var(--foreground)" }}>{p.binomeEtudiants}</strong> · Filière {p.filiereCode}
                </div>
                <div style={{ display: "flex", gap: "1rem", marginTop: "0.4rem", fontSize: "0.82rem", color: "var(--muted)", flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                    <Calendar size={14} /> {p.dateSoutenance ? p.dateSoutenance.replace("T", " ").substring(0, 16) : "À confirmer"}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                    <MapPin size={14} /> {p.salleSoutenanceCode || "Salle à définir"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {!p.pvVerrouille ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setEvalTarget(p)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.5rem 0.9rem",
                        borderRadius: "0.45rem",
                        border: "none",
                        backgroundColor: "#059669",
                        color: "white",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <ClipboardCheck size={15} />
                      {p.maNoteSaisie !== null ? "Modifier ma note" : "Noter (/20)"}
                    </button>

                    {p.monRoleJury === "Président HDR" && (p.nbEvaluations ?? 0) >= 4 && (
                      <button
                        type="button"
                        disabled={lockingId === p.id}
                        onClick={() => void handleLockPv(p)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          padding: "0.5rem 0.9rem",
                          borderRadius: "0.45rem",
                          border: "none",
                          backgroundColor: "#0f172a",
                          color: "white",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <Lock size={15} />
                        {lockingId === p.id ? "Verrouillage..." : "Verrouiller le PV"}
                      </button>
                    )}
                  </>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontWeight: 700, color: "#059669", fontSize: "0.9rem" }}>
                      {p.noteFinale?.toFixed(2)}/20 · {p.mention}
                    </span>
                    <Link
                      href={`/timetable/pfe/pv/${p.id}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        padding: "0.5rem 0.9rem",
                        borderRadius: "0.45rem",
                        backgroundColor: "#0f172a",
                        color: "white",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      <FileText size={15} />
                      Voir le PV
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <EvaluationPfeModal
        open={Boolean(evalTarget)}
        projet={evalTarget}
        onClose={() => setEvalTarget(null)}
        onSaved={() => {
          setNotice("Votre évaluation a été enregistrée !");
          void loadJurys();
          setTimeout(() => setNotice(""), 4000);
        }}
      />
    </div>
  );
}
