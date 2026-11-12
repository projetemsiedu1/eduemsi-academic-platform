"use client";
import { useState, type FormEvent } from "react";
import { ApiClient } from "@/lib/api-client";
import { useTimetable } from "@/context/TimetableContext";
import { Modal } from "@/components/ui/modal";
import type { Filiere } from "@/types/timetable";

export function FiliereModal({
  open,
  item,
  onClose,
  onSaved,
}: {
  open: boolean;
  item?: Filiere;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const ctx = useTimetable();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || ctx.mode !== "live") return;
    const fields = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    ctx.clearFeedback();
    const body = {
      code: String(fields.get("code")).trim(),
      libelle: String(fields.get("libelle")).trim(),
    };
    try {
      if (item) await ApiClient.put("/filieres/" + item.id, body);
      else await ApiClient.post("/filieres", body);
      await ctx.reload();
      onSaved?.();
      onClose();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "La filière n’a pas pu être enregistrée.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      open={open}
      onClose={() => {
        if (!busy) {
          setError("");
          onClose();
        }
      }}
      busy={busy}
      title={item ? "Modifier une filière" : "Créer une filière"}
    >
      <form
        key={`${item?.id ?? "new"}-${open}`}
        onSubmit={submit}
        className="planning-resource-form"
      >
        <fieldset disabled={busy}>
          <p className="planning-hint">
            Utilisez un code de formation (ex. IIR) et son intitulé. L’année et
            le campus se définissent ensuite pour chaque groupe.
          </p>
          <div className="planning-field">
            <label htmlFor="filiere-code">Code de la filière</label>
            <input
              id="filiere-code"
              name="code"
              maxLength={20}
              required
              autoComplete="off"
              defaultValue={item?.codeFiliere ?? ""}
            />
          </div>
          <div className="planning-field">
            <label htmlFor="filiere-libelle">Intitulé</label>
            <input
              id="filiere-libelle"
              name="libelle"
              maxLength={150}
              required
              autoComplete="off"
              defaultValue={item?.intitule ?? ""}
            />
          </div>
          {error && (
            <p role="alert" className="planning-form-error">
              {error}
            </p>
          )}
          <div className="planning-form-actions">
            <button
              type="button"
              onClick={() => {
                setError("");
                onClose();
              }}
            >
              Annuler
            </button>
            <button type="submit" className="planning-primary">
              {busy ? "Enregistrement…" : "Enregistrer la filière"}
            </button>
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
export function CreateFiliereButton() {
  const { mode, busy } = useTimetable();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button disabled={mode !== "live" || busy} onClick={() => setOpen(true)}>
        Créer une filière
      </button>
      <FiliereModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
