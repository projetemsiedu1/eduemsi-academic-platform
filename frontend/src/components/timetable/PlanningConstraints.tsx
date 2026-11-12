"use client";
import { useState, type FormEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useTimetable } from "@/context/TimetableContext";
import { TimetableHeader } from "@/components/timetable/TimetableHeader";
import { Modal } from "@/components/ui/modal";
import { SolverPanel } from "@/components/timetable/SolverPanel";
import { ResetPlanningButton } from "./ResetPlanningButton";
import {
  CRENEAUX_OFFICIELS_EMSI,
  JOURS_SEMAINE,
  type Seance,
} from "@/types/timetable";
export function PlanningConstraints() {
  const ctx = useTimetable();
  const [resetVersion, setResetVersion] = useState(0);
  const [editing, setEditing] = useState<Seance | null>(null),
    [removal, setRemoval] = useState<Seance | null>(null);
  const formKey = editing?.id ?? "new";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget,
      f = new FormData(form);
    const value = (key: string) => String(f.get(key) ?? "");
    const ok = await ctx.addOrUpdateSeance({
      id: editing?.id ?? crypto.randomUUID(),
      groupeId: value("groupe"),
      salleId: value("salle"),
      enseignantId: value("enseignant"),
      elementModuleId: value("element"),
      jourSemaine: value("jour") as Seance["jourSemaine"],
      numeroCreneau: value("creneau") as Seance["numeroCreneau"],
      spanSeances: Number(value("span")),
      statutAffectation: "MANUEL",
    });
    if (ok) {
      setEditing(null);
      form.reset();
    }
  }
  return (
    <>
      <TimetableHeader
        title="Planification des emplois du temps"
        subtitle="Définissez les enseignements, générez une proposition et enregistrez-la après vérification."
      />
      <main className="planning-content">
        <SolverPanel key={resetVersion} />
        <details
          className="planning-panel planning-manual"
          open={Boolean(editing)}
        >
          <summary>Placement manuel (facultatif)</summary>
          <section>
            <h2>{editing ? "Modifier la séance" : "Ajouter une séance"}</h2>
            <form
              key={formKey}
              onSubmit={submit}
              className="planning-session-form"
            >
              <fieldset disabled={ctx.busy}>
                <div className="planning-form-grid">
                  {[
                    {
                      name: "groupe",
                      label: "Groupe",
                      items: ctx.groupes.map((g) => ({
                        id: g.id,
                        label: g.codeGroupe,
                      })),
                      value: editing?.groupeId,
                    },
                    {
                      name: "element",
                      label: "Élément de module",
                      items: ctx.elements.map((e) => ({
                        id: e.id,
                        label: e.intitule,
                      })),
                      value: editing?.elementModuleId,
                    },
                    {
                      name: "enseignant",
                      label: "Enseignant",
                      items: ctx.enseignants.map((t) => ({
                        id: t.id,
                        label: `${t.prenom} ${t.nom}`,
                      })),
                      value: editing?.enseignantId,
                    },
                    {
                      name: "salle",
                      label: "Salle",
                      items: ctx.salles.map((s) => ({
                        id: s.id,
                        label: s.codeSalle,
                      })),
                      value: editing?.salleId,
                    },
                  ].map((field) => (
                    <div className="planning-field" key={field.name}>
                      <label htmlFor={"session-" + field.name}>
                        {field.label}
                      </label>
                      <select
                        id={"session-" + field.name}
                        name={field.name}
                        required
                        defaultValue={field.value ?? ""}
                      >
                        <option value="">Choisir</option>
                        {field.items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                  <div className="planning-field">
                    <label htmlFor="session-jour">Jour</label>
                    <select
                      id="session-jour"
                      name="jour"
                      defaultValue={editing?.jourSemaine ?? "LUNDI"}
                    >
                      {JOURS_SEMAINE.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="planning-field">
                    <label htmlFor="session-creneau">Premier créneau</label>
                    <select
                      id="session-creneau"
                      name="creneau"
                      defaultValue={editing?.numeroCreneau ?? "S1_08H30"}
                    >
                      {CRENEAUX_OFFICIELS_EMSI.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.libelleCourt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="planning-field">
                    <label htmlFor="session-span">Nombre de créneaux</label>
                    <input
                      id="session-span"
                      name="span"
                      type="number"
                      min={1}
                      max={6}
                      required
                      defaultValue={editing?.spanSeances ?? 1}
                    />
                  </div>
                </div>
                <div className="planning-form-actions">
                  {editing && (
                    <button type="button" onClick={() => setEditing(null)}>
                      Annuler la modification
                    </button>
                  )}
                  <button className="planning-primary" type="submit">
                    {ctx.busy ? "Enregistrement…" : "Enregistrer la séance"}
                  </button>
                </div>
              </fieldset>
            </form>
          </section>
        </details>
        <section className="planning-panel">
          <div className="directory-heading">
            <h2>Séances enregistrées ({ctx.seances.length})</h2>
            <ResetPlanningButton
              onReset={() => {
                setEditing(null);
                setRemoval(null);
                setResetVersion((v) => v + 1);
              }}
            />
          </div>
          <div className="planning-session-list">
            {ctx.seances.length ? (
              ctx.seances.map((s) => (
                <div className="planning-session-row" key={s.id}>
                  <div>
                    <strong>
                      {ctx.groupes.find((g) => g.id === s.groupeId)?.codeGroupe}{" "}
                      ·{" "}
                      {
                        ctx.elements.find((e) => e.id === s.elementModuleId)
                          ?.intitule
                      }
                    </strong>
                    <p>
                      {s.jourSemaine} ·{" "}
                      {
                        CRENEAUX_OFFICIELS_EMSI.find(
                          (c) => c.code === s.numeroCreneau,
                        )?.heureDebut
                      }{" "}
                      · {s.spanSeances * 1.5} h ·{" "}
                      {
                        ctx.salles.find((room) => room.id === s.salleId)
                          ?.codeSalle
                      }
                    </p>
                  </div>
                  <button
                    aria-label="Modifier la séance"
                    disabled={ctx.busy}
                    onClick={() => {
                      ctx.clearFeedback();
                      setEditing(s);
                      document
                        .querySelector(".planning-session-form")
                        ?.scrollIntoView({ block: "center" });
                    }}
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    aria-label="Supprimer la séance"
                    disabled={ctx.busy}
                    onClick={() => setRemoval(s)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            ) : (
              <p className="planning-empty">
                Aucune séance enregistrée. Commencez par créer les ressources et
                les modules nécessaires.
              </p>
            )}
          </div>
        </section>
        <section className="planning-panel">
          <h2>Contrôles du planning</h2>
          <p>
            Les contrôles portent sur les ressources référencées, les
            chevauchements, les capacités, les équipements, le campus et les
            disponibilités renseignées.
          </p>
          <ul className="planning-rules">
            {ctx.verificationReport.resumeParRegle.map((rule) => (
              <li key={rule.regle}>
                <span>{rule.regle}</span>
                <strong>
                  {rule.nbViolations === 0
                    ? "Aucune anomalie détectée"
                    : `${rule.nbViolations} anomalies`}
                </strong>
              </li>
            ))}
          </ul>
          {ctx.verificationReport.conflits.map((c) => (
            <div key={c.id} className="planning-conflict">
              <h3>{c.titre}</h3>
              <p>{c.description}</p>
            </div>
          ))}
          {ctx.mode === "demo" && (
            <div className="planning-form-actions">
              <button onClick={ctx.injectTestConflictScenario}>
                Tester la détection d’un conflit
              </button>
              <button onClick={ctx.resetToInitialData}>
                Réinitialiser la démonstration
              </button>
            </div>
          )}
        </section>
      </main>
      <Modal
        open={Boolean(removal)}
        title="Supprimer la séance"
        onClose={() => setRemoval(null)}
        busy={ctx.busy}
      >
        <div className="planning-resource-form">
          <p>
            La séance sera supprimée du planning partagé. Une séance contenant
            des absences ne peut pas être supprimée.
          </p>
          {ctx.error && (
            <p role="alert" className="planning-form-error">
              {ctx.error}
            </p>
          )}
          <div className="planning-form-actions">
            <button onClick={() => setRemoval(null)} disabled={ctx.busy}>
              Annuler
            </button>
            <button
              className="planning-primary"
              disabled={ctx.busy}
              onClick={async () => {
                if (removal && (await ctx.deleteSeance(removal.id)))
                  setRemoval(null);
              }}
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
