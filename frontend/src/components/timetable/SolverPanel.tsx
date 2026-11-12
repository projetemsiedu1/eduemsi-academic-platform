"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ApiClient } from "@/lib/api-client";
import { useTimetable } from "@/context/TimetableContext";
import { Modal } from "@/components/ui/modal";
import { ScheduleGrid } from "./ScheduleGrid";
import type {
  SolverConfiguration,
  SolverResult,
  TeachingRequirement,
} from "@/types/solver";
import type { Seance } from "@/types/timetable";

const root = "/planning/solver";
const statusLabels: Record<SolverResult["status"], string> = {
  OPTIMAL: "Optimalité prouvée pour le nombre de trous des groupes",
  FEASIBLE: "Planning réalisable, optimalité non prouvée",
  INFEASIBLE: "Aucun planning ne respecte toutes les contraintes",
  UNKNOWN: "Limite atteinte sans solution exploitable",
  MODEL_INVALID: "Modèle refusé par CP-SAT",
  INPUT_INVALID: "Données à compléter ou à corriger",
  NATIVE_UNAVAILABLE: "Moteur natif OR-Tools indisponible",
  VALIDATION_FAILED: "Résultat refusé par la vérification indépendante",
};

export function SolverPanel() {
  const ctx = useTimetable();
  const [configuration, setConfiguration] =
    useState<SolverConfiguration | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [working, setWorking] = useState<
    "save" | "solve" | "accept" | "reject" | null
  >(null);
  const [result, setResult] = useState<SolverResult | null>(null);
  const [editing, setEditing] = useState<TeachingRequirement | null>(null);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedElement, setSelectedElement] = useState("");
  const [previewGroup, setPreviewGroup] = useState("");
  const [removal, setRemoval] = useState<{
    kind: "requirements" | "qualifications";
    id: number;
  } | null>(null);
  const reportError = (reason: unknown) =>
    setError(
      reason instanceof Error ? reason.message : "L’opération a échoué.",
    );
  const load = useCallback(async () => {
    const config = await ApiClient.get<SolverConfiguration>(
      root + "/requirements",
    );
    setConfiguration(config);
  }, []);
  useEffect(() => {
    let active = true;
    if (ctx.mode === "live")
      ApiClient.get<SolverConfiguration>(root + "/requirements")
        .then((value) => {
          if (active) {
            setConfiguration(value);
            setError("");
          }
        })
        .catch((reason) => {
          if (active)
            setError(
              reason instanceof Error
                ? reason.message
                : "Besoins indisponibles.",
            );
        });
    return () => {
      active = false;
    };
  }, [ctx.mode]);

  async function qualify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (working) return;
    const form = event.currentTarget;
    const f = new FormData(form);
    setWorking("save");
    setError("");
    setNotice("");
    try {
      await ApiClient.post(root + "/qualifications", {
        enseignantId: Number(f.get("teacher")),
        moduleId: Number(f.get("module")),
      });
      await load();
      await ctx.reload();
      setResult(null);
      form.reset();
      setNotice("Qualification enregistrée.");
    } catch (reason) {
      reportError(reason);
    } finally {
      setWorking(null);
    }
  }
  async function saveNeed(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (working) return;
    const form = event.currentTarget;
    const f = new FormData(form);
    const body = {
      groupeId: Number(f.get("group")),
      elementId: Number(f.get("element")),
      enseignantId: Number(f.get("teacher")),
      weeklySessions: Number(f.get("sessions")),
    };
    setWorking("save");
    setError("");
    setNotice("");
    try {
      if (editing)
        await ApiClient.put(root + "/requirements/" + editing.id, body);
      else await ApiClient.post(root + "/requirements", body);
      setEditing(null);
      setSelectedGroup("");
      setSelectedElement("");
      form.reset();
      setResult(null);
      await load();
      setNotice(
        "Besoin hebdomadaire enregistré. Les séances existantes sont conservées.",
      );
    } catch (reason) {
      reportError(reason);
    } finally {
      setWorking(null);
    }
  }
  async function solve() {
    if (working || ctx.mode !== "live") return;
    setWorking("solve");
    setError("");
    setNotice("");
    setResult(null);
    try {
      const next = await ApiClient.request<SolverResult>(root + "/solve", {
        method: "POST",
        signal: AbortSignal.timeout(60000),
      });
      setResult(next);
      setPreviewGroup(next.assignments[0]?.groupId ?? "");
      if (next.validated && next.requestedSessions === 0)
        setNotice(
          "Les besoins sont déjà couverts par les séances enregistrées. Aucune séance à ajouter.",
        );
    } catch (reason) {
      reportError(reason);
    } finally {
      setWorking(null);
    }
  }
  async function decide(action: "accept" | "reject") {
    if (!result?.proposalId || working) return;
    setWorking(action);
    setError("");
    setNotice("");
    try {
      const next = await ApiClient.post<SolverResult>(
        root + "/proposals/" + result.proposalId + "/" + action,
      );
      setResult(next);
      if (action === "accept") {
        setNotice(
          "Planning validé et enregistré. Les pages groupes et enseignants lisent les mêmes séances.",
        );
        await ctx.reload();
      } else
        setNotice(
          "Proposition rejetée. Le planning enregistré n’a pas été modifié.",
        );
    } catch (reason) {
      reportError(reason);
    } finally {
      setWorking(null);
    }
  }
  async function remove() {
    if (!removal || working) return;
    setWorking("save");
    setError("");
    try {
      await ApiClient.delete(root + "/" + removal.kind + "/" + removal.id);
      setRemoval(null);
      setResult(null);
      await load();
    } catch (reason) {
      reportError(reason);
    } finally {
      setWorking(null);
    }
  }
  const teacherName = (id: string | number) => {
    const t = ctx.enseignants.find((t) => t.id === String(id));
    return t ? `${t.prenom} ${t.nom}` : `Enseignant ${id}`;
  };
  const elementName = (id: string | number) =>
    ctx.elements.find((e) => e.id === String(id))?.intitule ?? `Élément ${id}`;
  const groupName = (id: string | number) =>
    ctx.groupes.find((g) => g.id === String(id))?.codeGroupe ?? `Groupe ${id}`;
  const group = ctx.groupes.find((g) => g.id === selectedGroup);
  const selectedModule = ctx.elements.find(
    (e) => e.id === selectedElement,
  )?.moduleId;
  const qualifiedTeachers = ctx.enseignants.filter(
    (t) =>
      t.estActif &&
      configuration?.qualifications.some(
        (q) =>
          String(q.enseignantId) === t.id &&
          String(q.moduleId) === selectedModule,
      ),
  );
  const compatibleElements = ctx.elements.filter(
    (e) =>
      !group ||
      ctx.modules.find((m) => m.id === e.moduleId)?.filiereId ===
        group.filiereId,
  );
  const preview: Seance[] =
    result?.proposalState === "ACCEPTED"
      ? ctx.seances
      : [
          ...ctx.seances,
          ...(result?.assignments ?? []).map(
            (a, i): Seance => ({
              id: `proposal-${i}`,
              groupeId: a.groupId,
              elementModuleId: a.elementId,
              enseignantId: a.teacherId,
              salleId: a.roomId,
              jourSemaine: a.day,
              numeroCreneau: a.slot,
              spanSeances: 1,
              statutAffectation: "PROPOSITION",
            }),
          ),
        ];

  return (
    <section
      className="planning-panel solver-panel"
      aria-labelledby="solver-heading"
      aria-busy={Boolean(working)}
    >
      <h2 id="solver-heading">Préparer et générer le planning</h2>
      <p>
        Suivez les étapes : 1. définir les qualifications, 2. ajouter les
        besoins de chaque groupe, 3. générer et examiner la proposition. Les
        séances déjà enregistrées sont conservées.
      </p>
      {ctx.mode === "demo" ? (
        <p className="planning-hint">
          Le solveur utilise uniquement les données enregistrées du serveur.
          Revenez aux données réelles pour planifier.
        </p>
      ) : (
        <>
          {ctx.calendar && (
            <p className="planning-hint">
              {ctx.calendar.label}. Créneaux de {ctx.calendar.slotMinutes} min ;
              pause déjeuner {ctx.calendar.lunchStart}–{ctx.calendar.lunchEnd}.
            </p>
          )}
          {ctx.calendarError && (
            <p role="alert" className="planning-form-error">
              {ctx.calendarError}
            </p>
          )}
          {error && (
            <div role="alert" className="planning-form-error">
              {error}{" "}
              {!configuration && (
                <button onClick={() => void load().catch(reportError)}>
                  Réessayer
                </button>
              )}
            </div>
          )}
          {notice && (
            <p role="status" className="solver-notice">
              {notice}
            </p>
          )}
          <div className="planning-form-actions">
            <button
              className="planning-primary"
              disabled={
                Boolean(working) ||
                ctx.busy ||
                !ctx.calendar ||
                !configuration?.requirements.length
              }
              onClick={() => void solve()}
            >
              {working === "solve" ? (
                <>
                  <span className="spinner" aria-hidden="true" /> Calcul CP-SAT
                  en cours…
                </>
              ) : (
                "Planifier"
              )}
            </button>
          </div>
          <details
            className="solver-setup"
            open={!configuration?.qualifications.length}
          >
            <summary>
              1. Qualifications des enseignants (
              {configuration?.qualifications.length ?? 0})
            </summary>
            <p className="planning-hint">
              Une qualification confirme qu’un enseignant peut assurer un
              module. Elle n’est pas déduite automatiquement de sa spécialité.
            </p>
            <form onSubmit={qualify} className="planning-resource-form">
              <fieldset disabled={Boolean(working) || !configuration}>
                <div className="planning-form-grid">
                  <div className="planning-field">
                    <label htmlFor="qualification-teacher">Enseignant</label>
                    <select
                      id="qualification-teacher"
                      name="teacher"
                      required
                      defaultValue=""
                    >
                      <option value="">Choisir</option>
                      {ctx.enseignants
                        .filter((t) => t.estActif)
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {teacherName(t.id)}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="planning-field">
                    <label htmlFor="qualification-module">Module</label>
                    <select
                      id="qualification-module"
                      name="module"
                      required
                      defaultValue=""
                    >
                      <option value="">Choisir</option>
                      {ctx.modules.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.codeModule} — {m.intitule}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="planning-form-actions">
                  <button type="submit">Enregistrer la qualification</button>
                </div>
              </fieldset>
            </form>
            <ul className="solver-records">
              {configuration?.qualifications.map((q) => (
                <li key={q.id}>
                  <span>
                    {teacherName(q.enseignantId)} ·{" "}
                    {
                      ctx.modules.find((m) => m.id === String(q.moduleId))
                        ?.intitule
                    }
                  </span>
                  <button
                    disabled={Boolean(working)}
                    onClick={() =>
                      setRemoval({ kind: "qualifications", id: q.id })
                    }
                    aria-label={`Retirer la qualification de ${teacherName(q.enseignantId)}`}
                  >
                    Retirer
                  </button>
                </li>
              ))}
            </ul>
          </details>
          <details
            className="solver-setup"
            open={!configuration?.requirements.length || Boolean(editing)}
          >
            <summary>
              2. Besoins pédagogiques ({configuration?.requirements.length ?? 0}
              )
            </summary>
            <p className="planning-hint">
              Nombre total de séances de 90 minutes souhaitées chaque semaine,
              séances existantes comprises. Le volume semestriel ne suffit pas à
              déterminer ce nombre.
            </p>
            <form
              key={editing?.id ?? "new-need"}
              onSubmit={saveNeed}
              className="planning-resource-form"
            >
              <fieldset disabled={Boolean(working) || !configuration}>
                <div className="planning-form-grid">
                  <div className="planning-field">
                    <label htmlFor="need-group">Groupe / filière</label>
                    <select
                      id="need-group"
                      name="group"
                      required
                      value={selectedGroup}
                      onChange={(e) => {
                        setSelectedGroup(e.target.value);
                        setSelectedElement("");
                      }}
                    >
                      <option value="">Choisir</option>
                      {ctx.groupes.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.codeGroupe} —{" "}
                          {
                            ctx.filieres.find((f) => f.id === g.filiereId)
                              ?.intitule
                          }
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="planning-field">
                    <label htmlFor="need-element">Élément de module</label>
                    <select
                      key={selectedGroup}
                      id="need-element"
                      name="element"
                      required
                      value={selectedElement}
                      onChange={(e) => setSelectedElement(e.target.value)}
                      disabled={!selectedGroup}
                    >
                      <option value="">Choisir</option>
                      {compatibleElements.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.intitule} — {e.typeSalleRequis ?? "STANDARD"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="planning-field">
                    <label htmlFor="need-teacher">Enseignant préaffecté</label>
                    <select
                      id="need-teacher"
                      key={selectedElement}
                      name="teacher"
                      required
                      disabled={!selectedElement || !qualifiedTeachers.length}
                      defaultValue={editing?.enseignantId ?? ""}
                    >
                      <option value="">Choisir un enseignant qualifié</option>
                      {qualifiedTeachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {teacherName(t.id)}
                        </option>
                      ))}
                    </select>
                    {selectedElement && !qualifiedTeachers.length && (
                      <p className="planning-hint">
                        Aucun enseignant qualifié pour ce module. Enregistrez
                        d’abord une qualification à l’étape 1.
                      </p>
                    )}
                  </div>
                  <div className="planning-field">
                    <label htmlFor="need-count">Séances par semaine</label>
                    <input
                      id="need-count"
                      name="sessions"
                      type="number"
                      min={1}
                      max={
                        (ctx.calendar?.days.length ?? 6) *
                        (ctx.calendar?.slots.length ?? 5)
                      }
                      required
                      defaultValue={editing?.weeklySessions ?? 1}
                    />
                  </div>
                </div>
                <div className="planning-form-actions">
                  <button
                    type="submit"
                    disabled={
                      !selectedGroup ||
                      !selectedElement ||
                      !qualifiedTeachers.length
                    }
                  >
                    {editing ? "Modifier le besoin" : "Ajouter le besoin"}
                  </button>
                  {editing && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(null);
                        setSelectedGroup("");
                        setSelectedElement("");
                      }}
                    >
                      Annuler la modification
                    </button>
                  )}
                </div>
              </fieldset>
            </form>
            <ul className="solver-records">
              {configuration?.requirements.map((r) => (
                <li key={r.id}>
                  <span>
                    <strong>
                      {groupName(r.groupeId)} · {elementName(r.elementId)}
                    </strong>
                    <br />
                    {teacherName(r.enseignantId)} · {r.weeklySessions} séances /
                    semaine
                  </span>
                  <div>
                    <button
                      disabled={Boolean(working)}
                      onClick={() => {
                        setEditing(r);
                        setSelectedGroup(String(r.groupeId));
                        setSelectedElement(String(r.elementId));
                      }}
                    >
                      Modifier
                    </button>
                    <button
                      disabled={Boolean(working)}
                      onClick={() =>
                        setRemoval({ kind: "requirements", id: r.id })
                      }
                      aria-label={`Retirer le besoin ${groupName(r.groupeId)} ${elementName(r.elementId)}`}
                    >
                      Retirer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {configuration && !configuration.requirements.length && (
              <p className="planning-empty">
                Aucun besoin enregistré. Ajoutez les enseignements à planifier
                pour chaque groupe.
              </p>
            )}
          </details>
          {working === "solve" && (
            <p role="status">
              Recherche globale en cours. Le temps maximal est configuré sur le
              serveur. Aucun planning n’est remplacé pendant le calcul.
            </p>
          )}
          {result && (
            <div className="planning-proposal" aria-live="polite">
              <h3>{statusLabels[result.status]}</h3>
              <p>
                Statut CP-SAT : {result.status} · Calcul :{" "}
                {result.wallTimeSeconds.toFixed(2)} s ·{" "}
                {result.assignedSessions} / {result.requestedSessions} nouvelles
                séances affectées.
              </p>
              {result.objectiveValue !== null && (
                <p>
                  Trous des groupes : {result.objectiveValue} créneaux ·
                  Meilleure borne :{" "}
                  {result.bestObjectiveBound ?? "non disponible"}. La pause
                  déjeuner est exclue des créneaux.
                </p>
              )}
              {result.diagnostics.length > 0 && (
                <ul>
                  {result.diagnostics.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              )}
              {result.validated && result.assignments.length > 0 && (
                <>
                  <p>
                    {result.proposalState === "ACCEPTED"
                      ? "Proposition enregistrée."
                      : result.proposalState === "REJECTED"
                        ? "Proposition rejetée."
                        : "Proposition vérifiée, non enregistrée. Examinez-la puis acceptez ou rejetez. Elle expire après 30 minutes."}
                  </p>
                  <div className="planning-field">
                    <label htmlFor="solver-preview-group">
                      Consulter le planning proposé du groupe
                    </label>
                    <select
                      id="solver-preview-group"
                      value={previewGroup}
                      onChange={(e) => setPreviewGroup(e.target.value)}
                    >
                      {ctx.groupes.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.codeGroupe}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="solver-preview">
                    <ScheduleGrid
                      seances={preview.filter(
                        (s) => s.groupeId === previewGroup,
                      )}
                      viewMode="groupe"
                      activeEntityTitle={groupName(previewGroup)}
                      activeEntitySubtitle={
                        result.proposalState === "ACCEPTED"
                          ? "Planning enregistré"
                          : "Aperçu avec les séances existantes conservées"
                      }
                    />
                  </div>
                  {result.proposalState === "PENDING" && (
                    <div className="planning-form-actions">
                      <button
                        className="planning-primary"
                        disabled={Boolean(working)}
                        onClick={() => void decide("accept")}
                      >
                        {working === "accept"
                          ? "Enregistrement…"
                          : "Accepter et enregistrer"}
                      </button>
                      <button
                        disabled={Boolean(working)}
                        onClick={() => void decide("reject")}
                      >
                        Rejeter la proposition
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
      <Modal
        open={Boolean(removal)}
        onClose={() => {
          if (!working) setRemoval(null);
        }}
        title={
          removal?.kind === "requirements"
            ? "Retirer ce besoin ?"
            : "Retirer cette qualification ?"
        }
      >
        <p>
          Les séances déjà enregistrées ne seront pas supprimées. Une
          qualification utilisée par un besoin ne peut pas être retirée.
        </p>
        {error && (
          <p role="alert" className="planning-form-error">
            {error}
          </p>
        )}
        <div className="planning-form-actions">
          <button disabled={Boolean(working)} onClick={() => setRemoval(null)}>
            Annuler
          </button>
          <button disabled={Boolean(working)} onClick={() => void remove()}>
            Confirmer le retrait
          </button>
        </div>
      </Modal>
    </section>
  );
}
