"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/modal";
import { useTimetable } from "@/context/TimetableContext";
import { ApiClient, ApiError } from "@/lib/api-client";
import type { CreateExamenRequest, ExamenDto } from "@/types/exams";

export function ExamenModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (examen: ExamenDto) => void;
}) {
  const { modules, groupes, salles, enseignants } = useTimetable();

  const [moduleId, setModuleId] = useState("");
  const [groupeId, setGroupeId] = useState("");
  const [salleId, setSalleId] = useState("");
  const [survPrincId, setSurvPrincId] = useState("");
  const [survSecId, setSurvSecId] = useState("");
  const [dateExamen, setDateExamen] = useState("2026-12-15");
  const [heureDebut, setHeureDebut] = useState("09:00");
  const [dureeMinutes, setDureeMinutes] = useState(120);
  const [session, setSession] = useState<"NORMALE" | "RATTRAPAGE">("NORMALE");
  const [consignes, setConsignes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const selectedGroupe = groupes.find((g) => g.id === groupeId);
  const selectedSalle = salles.find((s) => s.id === salleId);
  const capacityWarning =
    selectedGroupe &&
    selectedSalle &&
    selectedSalle.capacite < selectedGroupe.effectif;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    if (!moduleId || !groupeId || !salleId || !survPrincId || !dateExamen || !heureDebut) {
      setError("Veuillez renseigner tous les champs obligatoires.");
      return;
    }

    if (survSecId && survSecId === survPrincId) {
      setError("Le surveillant secondaire doit être distinct du surveillant principal.");
      return;
    }

    if (capacityWarning) {
      setError(
        `Capacité insuffisante : salle de ${selectedSalle?.capacite} places pour un groupe de ${selectedGroupe?.effectif} étudiants.`
      );
      return;
    }

    setError("");
    setBusy(true);

    try {
      const payload: CreateExamenRequest = {
        moduleId: Number(moduleId),
        groupeId: Number(groupeId),
        salleId: Number(salleId),
        surveillantPrincipalId: Number(survPrincId),
        surveillantSecondaireId: survSecId ? Number(survSecId) : null,
        dateExamen,
        heureDebut: heureDebut.length === 5 ? `${heureDebut}:00` : heureDebut,
        dureeMinutes: Number(dureeMinutes),
        session,
        consignes: consignes.trim() || undefined,
      };

      const created = await ApiClient.post<ExamenDto>("/examens", payload);
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur lors de la planification de l'examen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Planifier une épreuve d'examen"
      busy={busy}
    >
      <form onSubmit={handleSubmit} className="planning-resource-form" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "1.5rem" }}>
        {error && (
          <div style={{ padding: "0.75rem", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "0.375rem", fontSize: "0.875rem" }} role="alert">
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="planning-field">
            <label htmlFor="exam-module">Module d'examen *</label>
            <select
              id="exam-module"
              value={moduleId}
              onChange={(e) => setModuleId(e.target.value)}
              required
            >
              <option value="">Sélectionnez un module</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.codeModule} — {m.intitule}
                </option>
              ))}
            </select>
          </div>

          <div className="planning-field">
            <label htmlFor="exam-groupe">Groupe d'étudiants *</label>
            <select
              id="exam-groupe"
              value={groupeId}
              onChange={(e) => setGroupeId(e.target.value)}
              required
            >
              <option value="">Sélectionnez un groupe</option>
              {groupes.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.codeGroupe} ({g.effectif} étudiants)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="planning-field">
            <label htmlFor="exam-salle">Salle d'examen *</label>
            <select
              id="exam-salle"
              value={salleId}
              onChange={(e) => setSalleId(e.target.value)}
              required
            >
              <option value="">Sélectionnez une salle</option>
              {salles.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.codeSalle} ({s.typeSalle}, {s.capacite} places)
                </option>
              ))}
            </select>
            {capacityWarning && (
              <span style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                Attention : capacité ({selectedSalle?.capacite}) inférieure à l'effectif ({selectedGroupe?.effectif}) !
              </span>
            )}
          </div>

          <div className="planning-field">
            <label htmlFor="exam-session">Session d'examen *</label>
            <select
              id="exam-session"
              value={session}
              onChange={(e) => setSession(e.target.value as "NORMALE" | "RATTRAPAGE")}
            >
              <option value="NORMALE">Session Normale (Épreuve Principale)</option>
              <option value="RATTRAPAGE">Session de Rattrapage</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="planning-field">
            <label htmlFor="exam-surv-princ">Surveillant Principal *</label>
            <select
              id="exam-surv-princ"
              value={survPrincId}
              onChange={(e) => setSurvPrincId(e.target.value)}
              required
            >
              <option value="">Sélectionnez l'enseignant</option>
              {enseignants.map((ens) => (
                <option key={ens.id} value={ens.id}>
                  {ens.nom} {ens.prenom} ({ens.typeContrat})
                </option>
              ))}
            </select>
          </div>

          <div className="planning-field">
            <label htmlFor="exam-surv-sec">Surveillant Secondaire (Optionnel)</label>
            <select
              id="exam-surv-sec"
              value={survSecId}
              onChange={(e) => setSurvSecId(e.target.value)}
            >
              <option value="">Aucun surveillant secondaire</option>
              {enseignants
                .filter((ens) => ens.id !== survPrincId)
                .map((ens) => (
                  <option key={ens.id} value={ens.id}>
                    {ens.nom} {ens.prenom} ({ens.typeContrat})
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
          <div className="planning-field">
            <label htmlFor="exam-date">Date de l'épreuve *</label>
            <input
              id="exam-date"
              type="date"
              value={dateExamen}
              onChange={(e) => setDateExamen(e.target.value)}
              required
            />
          </div>

          <div className="planning-field">
            <label htmlFor="exam-heure">Heure de début *</label>
            <input
              id="exam-heure"
              type="time"
              value={heureDebut}
              onChange={(e) => setHeureDebut(e.target.value)}
              required
            />
          </div>

          <div className="planning-field">
            <label htmlFor="exam-duree">Durée de l'épreuve *</label>
            <select
              id="exam-duree"
              value={dureeMinutes}
              onChange={(e) => setDureeMinutes(Number(e.target.value))}
            >
              <option value={60}>1h00 (60 min)</option>
              <option value={90}>1h30 (90 min)</option>
              <option value={120}>2h00 (120 min)</option>
              <option value={180}>3h00 (180 min)</option>
            </select>
          </div>
        </div>

        <div className="planning-field">
          <label htmlFor="exam-consignes">Consignes d'examen & Matériel autorisé</label>
          <textarea
            id="exam-consignes"
            rows={2}
            value={consignes}
            onChange={(e) => setConsignes(e.target.value)}
            placeholder="Ex: Calculatrice non programmable autorisée, carte d'étudiant obligatoire..."
          />
        </div>

        <div className="planning-form-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.75rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
          <button type="button" onClick={onClose} disabled={busy}>
            Annuler
          </button>
          <button type="submit" className="planning-primary" disabled={busy}>
            {busy ? "Enregistrement..." : "Confirmer la planification"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
