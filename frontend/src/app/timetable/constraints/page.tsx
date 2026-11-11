"use client";
import { useState, type FormEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { ApiClient } from "@/lib/api-client";
import { checkTimetableConflicts } from "@/lib/timetable-checker";
import { useTimetable } from "@/context/TimetableContext";
import { TimetableHeader } from "@/components/timetable/TimetableHeader";
import { Modal } from "@/components/ui/modal";
import {
  CRENEAUX_OFFICIELS_EMSI,
  JOURS_SEMAINE,
  type Seance,
} from "@/types/timetable";
interface SolverResult {
  solveur?: string;
  statutResolution?: string;
  totalSeancesPlanifiees?: number;
  planning?: Array<{
    id: string;
    jour: Seance["jourSemaine"];
    creneauId: string;
    salleAffectee: string;
  }>;
  logsResolution?: string[];
}
export default function ConstraintsPage() {
  const ctx = useTimetable();
  const [editing, setEditing] = useState<Seance | null>(null),
    [removal, setRemoval] = useState<Seance | null>(null);
  const [solving, setSolving] = useState(false),
    [proposal, setProposal] = useState<SolverResult | null>(null),
    [solverError, setSolverError] = useState("");
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
      setProposal(null);
    }
  }
  async function solve() {
    setSolving(true);
    setSolverError("");
    setProposal(null);
    try {
      if (!ctx.seances.length)
        throw new Error(
          "Ajoutez des séances avant de demander une proposition.",
        );
      if (ctx.seances.some((s) => s.spanSeances !== 1))
        throw new Error(
          "La proposition automatique est limitée aux séances d’un créneau. Les séances longues restent modifiables manuellement.",
        );
      const cours = ctx.seances.map((s) => {
        const group = ctx.groupes.find((g) => g.id === s.groupeId)!,
          teacher = ctx.enseignants.find((t) => t.id === s.enseignantId)!,
          element = ctx.elements.find((e) => e.id === s.elementModuleId)!;
        return {
          id: s.id,
          titreElement: element.intitule,
          typeSalleRequis:
            element.typeSalleRequis ??
            (element.necessitePc ? "LI_PC" : "STANDARD"),
          necessiteSallePc: element.necessitePc,
          nomGroupe: group.id,
          effectif: group.effectif,
          nomProf: teacher.id,
          statutEnseignant: teacher.typeContrat,
          campusDuJour: group.campusFixeId,
          ...(teacher.typeContrat === "VACATAIRE"
            ? { creneauRigide: `${s.jourSemaine}|${s.numeroCreneau}` }
            : {}),
        };
      });
      const salles = ctx.salles
        .filter((s) => s.estDisponible)
        .map((s) => ({
          code: s.codeSalle,
          type: s.typeSalle,
          capacite: s.capacite,
          nombrePc: s.nombrePcOperationnels,
          campus: s.campusId,
        }));
      const creneaux = JOURS_SEMAINE.flatMap((day) =>
        CRENEAUX_OFFICIELS_EMSI.map((slot) => ({
          id: `${day.code}|${slot.code}`,
          jour: day.code,
          libelle: slot.libelleComplet,
        })),
      );
      const result = await ApiClient.post<SolverResult>("/planning/solve", {
        cours,
        salles,
        creneaux,
      });
      if (!Array.isArray(result.planning))
        throw new Error("La réponse du solveur est invalide.");
      setProposal(result);
    } catch (reason) {
      setSolverError(
        reason instanceof Error
          ? reason.message
          : "Le solveur est indisponible.",
      );
    } finally {
      setSolving(false);
    }
  }
  const proposedSessions =
    proposal?.planning?.flatMap((item) => {
      const original = ctx.seances.find((s) => s.id === String(item.id)),
        room = ctx.salles.find((s) => s.codeSalle === item.salleAffectee);
      return original && room
        ? [
            {
              ...original,
              jourSemaine: item.jour,
              salleId: room.id,
              numeroCreneau: item.creneauId.split(
                "|",
              )[1] as Seance["numeroCreneau"],
            },
          ]
        : [];
    }) ?? [];
  const proposedReport = proposal
    ? checkTimetableConflicts({ ...ctx, seances: proposedSessions })
    : null;
  return (
    <>
      <TimetableHeader
        title="Séances et vérification"
        subtitle="Organisez les affectations et consultez les anomalies avant diffusion."
      />
      <main className="planning-content">
        <section className="planning-panel">
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
        <section className="planning-panel">
          <h2>Séances enregistrées</h2>
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
        <section className="planning-panel">
          <h2>Proposition automatique</h2>
          <p>
            Le solveur du serveur peut proposer une autre affectation pour les
            séances d’un créneau. Le résultat est un aperçu : il ne remplace pas
            les séances enregistrées.
          </p>
          <button
            className="planning-primary"
            disabled={solving || ctx.busy || !ctx.seances.length}
            onClick={() => void solve()}
          >
            {solving
              ? "Calcul en cours…"
              : "Demander une proposition au solveur"}
          </button>
          {solverError && (
            <p className="planning-form-error" role="alert">
              {solverError}
            </p>
          )}
          {proposal && (
            <div className="planning-proposal" role="status">
              <h3>
                {proposal.planning?.length} séances proposées ·{" "}
                {proposedReport?.conflits.length} anomalies détectées
              </h3>
              <p>
                {proposal.solveur} · Statut déclaré par le moteur :{" "}
                {proposal.statutResolution}
              </p>
              <p>
                Les disponibilités non renseignées ne peuvent pas être
                vérifiées. Cette proposition n’est pas enregistrée.
              </p>
              <ul>
                {proposal.planning?.map((item) => (
                  <li key={item.id}>
                    {
                      ctx.groupes.find(
                        (g) =>
                          g.id ===
                          ctx.seances.find((s) => s.id === String(item.id))
                            ?.groupeId,
                      )?.codeGroupe
                    }{" "}
                    — {item.jour} · {item.creneauId.split("|")[1]} ·{" "}
                    {item.salleAffectee}
                  </li>
                ))}
              </ul>
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
          {ctx.error && <p role="alert" className="planning-form-error">{ctx.error}</p>}
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
