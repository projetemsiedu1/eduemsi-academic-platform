"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import { ApiClient, ApiError } from "@/lib/api-client";
import type { EvaluationPfeDto, PfeProjectDto } from "@/types/pfe";

function mentionPreview(total: number): string {
  if (total < 10) return "Ajourné";
  if (total < 12) return "Passable";
  if (total < 14) return "Assez Bien";
  if (total < 16) return "Bien";
  if (total < 18) return "Très Bien";
  return "Très Bien avec félicitations du jury";
}

export function EvaluationPfeModal({
  open,
  projet,
  onClose,
  onSaved,
}: {
  open: boolean;
  projet: PfeProjectDto | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [noteTechnique, setNoteTechnique] = useState("4.5");
  const [noteRapport, setNoteRapport] = useState("4.0");
  const [noteDemo, setNoteDemo] = useState("4.0");
  const [noteReponses, setNoteReponses] = useState("3.5");
  const [commentaire, setCommentaire] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !projet) return;
    setError("");
    let cancelled = false;
    async function loadExisting() {
      if (!projet) return;
      try {
        const list = await ApiClient.get<EvaluationPfeDto[]>(`/pfe/${projet.id}/evaluations`);
        if (cancelled) return;
        const mine = list.find((e) => e.roleJury === projet.monRoleJury);
        if (mine) {
          setNoteTechnique(String(mine.noteTechnique));
          setNoteRapport(String(mine.noteRapport));
          setNoteDemo(String(mine.noteDemo));
          setNoteReponses(String(mine.noteReponses));
          setCommentaire(mine.commentaire || "");
        } else {
          setNoteTechnique("4.5");
          setNoteRapport("4.0");
          setNoteDemo("4.0");
          setNoteReponses("3.5");
          setCommentaire("");
        }
      } catch {
        // Keep defaults
      }
    }
    void loadExisting();
    return () => {
      cancelled = true;
    };
  }, [open, projet]);

  const total =
    (parseFloat(noteTechnique) || 0) +
    (parseFloat(noteRapport) || 0) +
    (parseFloat(noteDemo) || 0) +
    (parseFloat(noteReponses) || 0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!projet || busy) return;
    setBusy(true);
    setError("");
    try {
      await ApiClient.put<EvaluationPfeDto>(`/pfe/${projet.id}/evaluations/me`, {
        noteTechnique: Number(noteTechnique),
        noteRapport: Number(noteRapport),
        noteDemo: Number(noteDemo),
        noteReponses: Number(noteReponses),
        commentaire: commentaire.trim() || undefined,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de l'enregistrement des notes.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={projet ? `Grille Officielle EMSI · ${projet.titre}` : "Grille d'évaluation"}
      busy={busy}
      maxWidth="620px"
    >
      <form onSubmit={handleSubmit} className="planning-resource-form" style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1.5rem" }}>
        {projet && (
          <div style={{ padding: "0.75rem 1rem", backgroundColor: "#f8fafc", border: "1px solid var(--border)", borderRadius: "0.5rem", fontSize: "0.85rem" }}>
            <div><strong>Équipe :</strong> {projet.binomeEtudiants}</div>
            <div><strong>Votre rôle :</strong> <span style={{ color: "#059669", fontWeight: 700 }}>{projet.monRoleJury || "Membre du jury"}</span></div>
          </div>
        )}

        {error && (
          <div style={{ padding: "0.75rem", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "0.375rem", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="planning-field">
            <label htmlFor="eval-tech">1. Qualité Technique & Réalisation (/6) *</label>
            <input
              id="eval-tech"
              type="number"
              min="0"
              max="6"
              step="0.25"
              required
              value={noteTechnique}
              onChange={(e) => setNoteTechnique(e.target.value)}
            />
          </div>

          <div className="planning-field">
            <label htmlFor="eval-rapport">2. Rapport & Méthodologie (/5) *</label>
            <input
              id="eval-rapport"
              type="number"
              min="0"
              max="5"
              step="0.25"
              required
              value={noteRapport}
              onChange={(e) => setNoteRapport(e.target.value)}
            />
          </div>

          <div className="planning-field">
            <label htmlFor="eval-demo">3. Présentation Orale & Démo (/5) *</label>
            <input
              id="eval-demo"
              type="number"
              min="0"
              max="5"
              step="0.25"
              required
              value={noteDemo}
              onChange={(e) => setNoteDemo(e.target.value)}
            />
          </div>

          <div className="planning-field">
            <label htmlFor="eval-rep">4. Réponses aux Questions (/4) *</label>
            <input
              id="eval-rep"
              type="number"
              min="0"
              max="4"
              step="0.25"
              required
              value={noteReponses}
              onChange={(e) => setNoteReponses(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.9rem 1rem", borderRadius: "0.5rem", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "#065f46", display: "block" }}>Total saisi</span>
            <strong style={{ fontSize: "1.35rem", color: "#047857" }}>{total.toFixed(2)} / 20</strong>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.75rem", color: "#065f46", display: "block" }}>Mention estimée</span>
            <strong style={{ fontSize: "0.95rem", color: total >= 10 ? "#047857" : "#b91c1c" }}>
              {mentionPreview(total)}
            </strong>
          </div>
        </div>

        <div className="planning-field">
          <label htmlFor="eval-comm">Appréciation / Observations du jury</label>
          <textarea
            id="eval-comm"
            rows={2}
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Points forts, maîtrise technique, recommandations..."
          />
        </div>

        <div
          className="planning-form-actions"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
            paddingTop: "1rem",
            borderTop: "1px solid var(--border)",
          }}
        >
          <button type="button" onClick={onClose} disabled={busy}>
            Annuler
          </button>
          <button type="submit" className="planning-primary" disabled={busy}>
            {busy ? "Enregistrement..." : "Enregistrer ma notation"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
