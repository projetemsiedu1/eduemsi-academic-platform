"use client";
import { useState, type FormEvent } from "react";
import { ApiClient, ApiError } from "@/lib/api-client";
import { useTimetable } from "@/context/TimetableContext";
import { Modal } from "@/components/ui/modal";

export function ResetPlanningButton({ onReset }: { onReset: () => void }) {
  const ctx = useTimetable();
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [ids, setIds] = useState<string[]>([]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || confirmation !== "VIDER" || ctx.mode !== "live") return;
    setBusy(true);
    setError("");
    try {
      const result = await ApiClient.post<{
        deletedSessions: number;
        backupFile: string | null;
      }>("/planning/reset", {
        expectedSessionIds: ids.map(Number),
        confirmation,
      });
      await ctx.reload();
      onReset();
      setOpen(false);
      setConfirmation("");
      setNotice(
        `${result.deletedSessions} séances supprimées. Ressources, qualifications et besoins conservés.${result.backupFile ? ` Sauvegarde serveur : ${result.backupFile}` : ""}`,
      );
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 404
          ? "Le serveur ne dispose pas encore de cette fonctionnalité. Redémarrez le backend à jour puis actualisez. Aucune séance n’a été supprimée."
          : e instanceof Error
            ? e.message
            : "La remise à zéro a échoué.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="planning-reset">
      <button
        disabled={
          busy ||
          ctx.busy ||
          ctx.loading ||
          ctx.mode !== "live" ||
          !ctx.seances.length
        }
        onClick={() => {
          setIds(ctx.seances.map((s) => s.id));
          setConfirmation("");
          setError("");
          setOpen(true);
        }}
      >
        Vider le planning
      </button>
      {notice && (
        <p role="status" className="planning-hint">
          {notice}
        </p>
      )}
      <Modal
        open={open}
        onClose={() => {
          if (!busy) setOpen(false);
        }}
        busy={busy}
        title="Vider les séances enregistrées ?"
      >
        <form onSubmit={submit} className="planning-resource-form">
          <fieldset disabled={busy}>
            <p>
              Cette opération supprime les {ids.length} séances affichées, pour
              tous les groupes. Une sauvegarde serveur est créée avant
              suppression. Les filières, groupes, enseignants, salles,
              qualifications et besoins restent disponibles.
            </p>
            <p>
              Si une séance contient des absences ou si le planning a changé,
              toute la suppression est refusée. Les propositions en attente
              seront rejetées.
            </p>
            <div className="planning-field">
              <label htmlFor="planning-reset-confirmation">
                Saisissez VIDER pour confirmer
              </label>
              <input
                id="planning-reset-confirmation"
                autoComplete="off"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                required
              />
            </div>
            {error && (
              <p role="alert" className="planning-form-error">
                {error}
              </p>
            )}
            <div className="planning-form-actions">
              <button type="button" onClick={() => setOpen(false)}>
                Annuler
              </button>
              <button
                type="submit"
                disabled={confirmation !== "VIDER"}
                className="planning-primary"
              >
                {busy ? "Sauvegarde et suppression…" : "Vider ces séances"}
              </button>
            </div>
          </fieldset>
        </form>
      </Modal>
    </div>
  );
}
