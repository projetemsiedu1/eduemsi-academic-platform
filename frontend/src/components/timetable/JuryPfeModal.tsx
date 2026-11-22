"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import { ApiClient, ApiError } from "@/lib/api-client";
import { Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import type {
  MatchJuryResponse,
  PfeProjectDto,
  PlanifierSoutenanceRequest,
} from "@/types/pfe";

interface TeacherOption {
  id: number;
  nom: string;
  prenom: string;
  grade?: string;
  specialite?: string;
}

interface SalleOption {
  id: number;
  codeSalle: string;
  capacite: number;
  campusNom?: string;
}

export function JuryPfeModal({
  open,
  projet,
  onClose,
  onSuccess,
}: {
  open: boolean;
  projet: PfeProjectDto | null;
  onClose: () => void;
  onSuccess: (updated: PfeProjectDto) => void;
}) {
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [salles, setSalles] = useState<SalleOption[]>([]);
  const [aiMatch, setAiMatch] = useState<MatchJuryResponse | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const [encadrantId, setEncadrantId] = useState("");
  const [rapporteurId, setRapporteurId] = useState("");
  const [examinateurIaId, setExaminateurIaId] = useState("");
  const [presidentHdrId, setPresidentHdrId] = useState("");
  const [salleId, setSalleId] = useState("");
  const [dateSoutenance, setDateSoutenance] = useState("2027-06-20T09:00");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !projet) return;
    const currentProjet = projet;
    setError("");
    setAiMatch(null);

    let cancelled = false;
    async function initModal() {
      try {
        const [ensRes, salRes] = await Promise.all([
          ApiClient.get<{ content?: TeacherOption[] } | TeacherOption[]>("/enseignants?size=100"),
          ApiClient.get<{ content?: SalleOption[] } | SalleOption[]>("/salles?size=100"),
        ]);
        if (cancelled) return;
        const ensList = Array.isArray(ensRes) ? ensRes : ensRes.content ?? [];
        const salList = Array.isArray(salRes) ? salRes : salRes.content ?? [];
        setTeachers(ensList);
        setSalles(salList);

        if (currentProjet.salleSoutenanceId) {
          setSalleId(String(currentProjet.salleSoutenanceId));
        } else if (salList.length > 0) {
          setSalleId(String(salList[0].id));
        }
        if (currentProjet.dateSoutenance) {
          setDateSoutenance(currentProjet.dateSoutenance.substring(0, 16));
        } else {
          setDateSoutenance("2027-06-20T09:00");
        }

        if (currentProjet.juryId && currentProjet.encadrantId && currentProjet.rapporteurId && currentProjet.examinateurIaId && currentProjet.presidentHdrId) {
          setEncadrantId(String(currentProjet.encadrantId));
          setRapporteurId(String(currentProjet.rapporteurId));
          setExaminateurIaId(String(currentProjet.examinateurIaId));
          setPresidentHdrId(String(currentProjet.presidentHdrId));
        } else {
          await runAiSuggestion(currentProjet.id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Impossible de charger les données du jury.");
        }
      }
    }

    void initModal();
    return () => {
      cancelled = true;
    };
  }, [open, projet]);

  async function runAiSuggestion(pfeId: number) {
    setLoadingAi(true);
    setError("");
    try {
      const res = await ApiClient.post<MatchJuryResponse>(`/pfe/${pfeId}/proposer-jury`, {});
      setAiMatch(res);
      if (res.jury) {
        if (res.jury.encadrant?.id) setEncadrantId(String(res.jury.encadrant.id));
        if (res.jury.rapporteur?.id) setRapporteurId(String(res.jury.rapporteur.id));
        if (res.jury.examinateurIa?.id) setExaminateurIaId(String(res.jury.examinateurIa.id));
        if (res.jury.presidentHdr?.id) setPresidentHdrId(String(res.jury.presidentHdr.id));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la suggestion IA du jury.");
    } finally {
      setLoadingAi(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!projet || busy) return;

    const chosen = new Set([encadrantId, rapporteurId, examinateurIaId, presidentHdrId]);
    if (!encadrantId || !rapporteurId || !examinateurIaId || !presidentHdrId) {
      setError("Veuillez désigner les 4 membres du jury.");
      return;
    }
    if (chosen.size < 4) {
      setError("Règle BR-PFE-07 : Les 4 membres du jury doivent être 4 enseignants distincts.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const isoDate = dateSoutenance.length === 16 ? `${dateSoutenance}:00` : dateSoutenance;
      const payload: PlanifierSoutenanceRequest = {
        pfeProjetId: projet.id,
        encadrantId: Number(encadrantId),
        rapporteurId: Number(rapporteurId),
        examinateurIaId: Number(examinateurIaId),
        presidentHdrId: Number(presidentHdrId),
        salleSoutenanceId: salleId ? Number(salleId) : null,
        dateSoutenance: isoDate,
        scoreAffiniteIa: aiMatch?.scoreMatching ?? 94.5,
        justificationIa: aiMatch?.justification ?? "Jury validé par le responsable PFE selon la règle BR-PFE-07.",
      };
      const updated = await ApiClient.post<PfeProjectDto>(`/pfe/${projet.id}/jury`, payload);
      onSuccess(updated);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la validation du jury.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={projet ? `Affectation Jury IA · ${projet.titre}` : "Affectation Jury"}
      busy={busy}
      maxWidth="760px"
    >
      <form onSubmit={handleSubmit} className="planning-resource-form" style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem" }}>
        {projet && (
          <div style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", backgroundColor: "#f8fafc", border: "1px solid var(--border)", fontSize: "0.85rem" }}>
            <div><strong>Étudiant(s) :</strong> {projet.binomeEtudiants} · <strong>Filière :</strong> {projet.filiereCode}</div>
            {projet.encadrantSouhaiteNom && (
              <div style={{ marginTop: "0.25rem", color: "var(--muted)" }}>
                Encadrant initial : <strong>{projet.encadrantSouhaiteNom}</strong>
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#059669", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Sparkles size={16} />
            Composition suggérée selon l&apos;affinité IA et la règle BR-PFE-07
          </span>
          {projet && (
            <button
              type="button"
              disabled={loadingAi || busy}
              onClick={() => void runAiSuggestion(projet.id)}
              style={{
                padding: "0.4rem 0.75rem",
                borderRadius: "0.4rem",
                border: "1px solid #10b981",
                backgroundColor: "#ecfdf5",
                color: "#065f46",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {loadingAi ? "Analyse IA en cours..." : "Recalculer par IA"}
            </button>
          )}
        </div>

        {aiMatch && (
          <div style={{ padding: "0.75rem 1rem", borderRadius: "0.5rem", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", fontSize: "0.82rem", color: "#065f46" }}>
            <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem" }}>
              <CheckCircle2 size={15} />
              Score d&apos;affinité global : {aiMatch.scoreMatching?.toFixed(1)}% · Modèle : {aiMatch.modeleUtilise}
            </div>
            <div>{aiMatch.justification}</div>
          </div>
        )}

        {error && (
          <div style={{ padding: "0.75rem", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "0.375rem", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }} role="alert">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="planning-field">
            <label htmlFor="jury-president">Président du Jury (Docteur / HDR) *</label>
            <select id="jury-president" value={presidentHdrId} onChange={(e) => setPresidentHdrId(e.target.value)} required>
              <option value="">Sélectionner le président...</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  Pr. {t.nom} {t.prenom} ({t.grade || "Docteur"})
                </option>
              ))}
            </select>
          </div>

          <div className="planning-field">
            <label htmlFor="jury-rapporteur">Rapporteur *</label>
            <select id="jury-rapporteur" value={rapporteurId} onChange={(e) => setRapporteurId(e.target.value)} required>
              <option value="">Sélectionner le rapporteur...</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  Pr. {t.nom} {t.prenom} ({t.specialite || "Enseignant"})
                </option>
              ))}
            </select>
          </div>

          <div className="planning-field">
            <label htmlFor="jury-examinateur">Examinateur IA *</label>
            <select id="jury-examinateur" value={examinateurIaId} onChange={(e) => setExaminateurIaId(e.target.value)} required>
              <option value="">Sélectionner l&apos;examinateur...</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  Pr. {t.nom} {t.prenom} ({t.specialite || "Enseignant"})
                </option>
              ))}
            </select>
          </div>

          <div className="planning-field">
            <label htmlFor="jury-encadrant">Encadrant PFE *</label>
            <select id="jury-encadrant" value={encadrantId} onChange={(e) => setEncadrantId(e.target.value)} required>
              <option value="">Sélectionner l&apos;encadrant...</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  Pr. {t.nom} {t.prenom}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="planning-field">
            <label htmlFor="jury-salle">Salle de soutenance</label>
            <select id="jury-salle" value={salleId} onChange={(e) => setSalleId(e.target.value)}>
              <option value="">Salle à définir</option>
              {salles.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.codeSalle} ({s.capacite} places{s.campusNom ? ` · ${s.campusNom}` : ""})
                </option>
              ))}
            </select>
          </div>

          <div className="planning-field">
            <label htmlFor="jury-date">Date & Heure de soutenance *</label>
            <input
              id="jury-date"
              type="datetime-local"
              value={dateSoutenance}
              onChange={(e) => setDateSoutenance(e.target.value)}
              required
            />
          </div>
        </div>

        <div
          className="planning-form-actions"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
            marginTop: "0.75rem",
            paddingTop: "1rem",
            borderTop: "1px solid var(--border)",
            position: "sticky",
            bottom: "-1.5rem",
            backgroundColor: "var(--surface)",
            paddingBottom: "0.5rem",
          }}
        >
          <button type="button" onClick={onClose} disabled={busy}>
            Annuler
          </button>
          <button type="submit" className="planning-primary" disabled={busy || loadingAi}>
            {busy ? "Enregistrement..." : "Valider et convoquer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
