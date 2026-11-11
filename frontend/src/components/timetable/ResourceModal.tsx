"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { useTimetable } from "@/context/TimetableContext";
import { Modal } from "@/components/ui/modal";
import type {
  Salle,
  Enseignant,
  Groupe,
  TypeSalle,
  TypeContrat,
  DisponibiliteJour,
} from "@/types/timetable";
import { JOURS_SEMAINE, CRENEAUX_OFFICIELS_EMSI } from "@/types/timetable";
export type ModalResourceType = "salle" | "enseignant" | "groupe" | "module";
interface Props {
  isOpen: boolean;
  onClose: () => void;
  resourceType: ModalResourceType;
  itemToEdit?: Salle | Enseignant | Groupe | null;
}
export function ResourceModal(props: Props) {
  const { busy } = useTimetable();
  return (
    <Modal
      open={props.isOpen}
      onClose={props.onClose}
      busy={busy}
      title={
        props.itemToEdit ? "Modifier la ressource" : "Ajouter une ressource"
      }
    >
      <ResourceForm
        key={`${props.resourceType}-${props.itemToEdit?.id ?? "new"}-${props.isOpen}`}
        {...props}
      />
    </Modal>
  );
}
function Field({
  label,
  name,
  children,
}: {
  label: string;
  name: string;
  children: ReactNode;
}) {
  return (
    <div className="planning-field">
      <label htmlFor={"resource-" + name}>{label}</label>
      {children}
    </div>
  );
}
function ResourceForm({ resourceType, itemToEdit, onClose }: Props) {
  const ctx = useTimetable();
  const item = itemToEdit as Partial<Salle & Enseignant & Groupe> | null;
  const [selectedFiliere, setSelectedFiliere] = useState(item?.filiereId ?? "");
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState("");
  const [availability, setAvailability] = useState<DisponibiliteJour[]>(
    (itemToEdit as Enseignant)?.disponibilites ?? [],
  );
  function slots(
    jour: DisponibiliteJour["jour"],
    slot: DisponibiliteJour["creneaux"][number],
    checked: boolean,
  ) {
    setAvailability((previous) => {
      const current = previous.find((d) => d.jour === jour)?.creneaux ?? [];
      return [
        ...previous.filter((d) => d.jour !== jour),
        {
          jour,
          creneaux: checked
            ? [...current, slot]
            : current.filter((s) => s !== slot),
        },
      ].filter((d) => d.creneaux.length > 0);
    });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setFailure("");
    ctx.clearFeedback();
    const f = new FormData(event.currentTarget);
    const str = (key: string) => String(f.get(key) ?? "").trim();
    const num = (key: string) => Number(f.get(key));
    let success = false;
    try {
      if (resourceType === "salle")
        success = await ctx.addOrUpdateSalle({
          id: itemToEdit?.id ?? crypto.randomUUID(),
          codeSalle: str("code"),
          campusId: str("campus"),
          etage: (itemToEdit as Salle)?.etage ?? "",
          typeSalle: str("type") as TypeSalle,
          capacite: num("capacity"),
          nombrePcOperationnels: num("pcs"),
          specsEquipements: str("equipment"),
          estDisponible: f.get("available") === "on",
        });
      if (resourceType === "enseignant")
        success = await ctx.addOrUpdateEnseignant({
          id: itemToEdit?.id ?? crypto.randomUUID(),
          matricule: str("code"),
          nom: str("nom"),
          prenom: str("prenom"),
          email: str("email"),
          telephone: str("telephone"),
          specialite: str("specialite"),
          typeContrat: str("contrat") as TypeContrat,
          heuresContractuellesSemaine: num("hours"),
          disponibilites: availability,
          estActif: true,
          competencesModulesIds:
            (itemToEdit as Enseignant)?.competencesModulesIds ?? [],
        });
      if (resourceType === "groupe")
        success = await ctx.addOrUpdateGroupe({
          id: itemToEdit?.id ?? crypto.randomUUID(),
          codeGroupe: str("code"),
          filiereId: str("filiere"),
          optionId: str("option") || undefined,
          anneeEtude: num("year"),
          effectif: num("capacity"),
          delegueNom: str("delegue"),
          campusFixeId: str("campus"),
          laboratoiresRequis:
            f.getAll("group-type").map(String).join(",") || "STANDARD",
        });
      if (resourceType === "module")
        success = await ctx.createModule({
          code: str("code"),
          intitule: str("intitule"),
          filiereId: str("filiere"),
          semestre: str("semestre"),
          volumeHoraire: num("hours"),
          typeSalleRequis: str("type"),
        });
      if (success) onClose();
      else
        setFailure(
          "L’enregistrement a été refusé. Vérifiez les valeurs ou les ressources déjà utilisées.",
        );
    } catch {
      setFailure("Impossible d’enregistrer la ressource. Veuillez réessayer.");
    } finally {
      setPending(false);
    }
  }
  const input = (name: string, options: Record<string, unknown> = {}) => (
    <input id={"resource-" + name} name={name} {...options} />
  );
  const campus = (
    <Field name="campus" label="Campus">
      <select
        id="resource-campus"
        name="campus"
        required
        defaultValue={
          resourceType === "salle" ? item?.campusId : item?.campusFixeId
        }
      >
        <option value="">Choisir un campus</option>
        {ctx.campuses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nom}
          </option>
        ))}
      </select>
    </Field>
  );
  const filiere = (
    <Field name="filiere" label="Filière">
      <select
        id="resource-filiere"
        name="filiere"
        required
        value={selectedFiliere}
        onChange={(event) => setSelectedFiliere(event.target.value)}
      >
        <option value="">Choisir une filière</option>
        {ctx.filieres.map((f) => (
          <option key={f.id} value={f.id}>
            {f.intitule}
          </option>
        ))}
      </select>
    </Field>
  );
  const roomType = (
    <Field name="type" label="Type de salle requis">
      <select
        id="resource-type"
        name="type"
        defaultValue={
          resourceType === "salle"
            ? item?.typeSalle
            : (item?.laboratoiresRequis ?? "STANDARD")
        }
      >
        <option value="STANDARD">Salle standard</option>
        <option value="LI_PC">Laboratoire informatique</option>
        <option value="LR_RESEAUX">Laboratoire réseaux</option>
        <option value="AMPHI">Amphithéâtre</option>
      </select>
    </Field>
  );
  return (
    <form
      className="planning-resource-form"
      onSubmit={submit}
      aria-busy={pending}
    >
      <fieldset disabled={pending}>
        <Field
          name="code"
          label={resourceType === "enseignant" ? "Matricule" : "Code"}
        >
          {input("code", {
            required: true,
            maxLength: resourceType === "module" ? 40 : 50,
            defaultValue:
              item?.codeSalle ?? item?.matricule ?? item?.codeGroupe ?? "",
          })}
        </Field>
        {resourceType === "salle" && (
          <>
            {campus}
            {roomType}
            <div className="planning-form-row">
              <Field name="capacity" label="Capacité (places)">
                {input("capacity", {
                  type: "number",
                  min: 1,
                  max: 1000,
                  required: true,
                  defaultValue: item?.capacite ?? 30,
                })}
              </Field>
              <Field name="pcs" label="Postes opérationnels">
                {input("pcs", {
                  type: "number",
                  min: 0,
                  max: 1000,
                  required: true,
                  defaultValue: item?.nombrePcOperationnels ?? 0,
                })}
              </Field>
            </div>
            <Field name="equipment" label="Équipements">
              <textarea
                id="resource-equipment"
                name="equipment"
                maxLength={2000}
                rows={3}
                defaultValue={item?.specsEquipements ?? ""}
              />
            </Field>
            <label className="planning-checkbox">
              <input
                type="checkbox"
                name="available"
                defaultChecked={item?.estDisponible ?? true}
              />
              Salle disponible
            </label>
          </>
        )}
        {resourceType === "enseignant" && (
          <>
            <div className="planning-form-row">
              <Field name="nom" label="Nom">
                {input("nom", {
                  required: true,
                  maxLength: 100,
                  defaultValue: item?.nom ?? "",
                })}
              </Field>
              <Field name="prenom" label="Prénom">
                {input("prenom", {
                  required: true,
                  maxLength: 100,
                  defaultValue: item?.prenom ?? "",
                })}
              </Field>
            </div>
            <Field name="email" label="Adresse e-mail">
              {input("email", {
                type: "email",
                required: true,
                maxLength: 150,
                defaultValue: item?.email ?? "",
              })}
            </Field>
            <Field name="telephone" label="Téléphone">
              {input("telephone", {
                type: "tel",
                maxLength: 50,
                defaultValue: item?.telephone ?? "",
              })}
            </Field>
            <Field name="specialite" label="Spécialité">
              {input("specialite", {
                maxLength: 150,
                defaultValue: item?.specialite ?? "",
              })}
            </Field>
            <div className="planning-form-row">
              <Field name="contrat" label="Contrat">
                <select
                  id="resource-contrat"
                  name="contrat"
                  defaultValue={item?.typeContrat ?? "PERMANENT"}
                >
                  <option value="PERMANENT">Permanent</option>
                  <option value="VACATAIRE">Vacataire</option>
                </select>
              </Field>
              <Field name="hours" label="Heures contractuelles / semaine">
                {input("hours", {
                  type: "number",
                  min: 1,
                  max: 54,
                  required: true,
                  defaultValue: item?.heuresContractuellesSemaine ?? 18,
                })}
              </Field>
            </div>
            <details>
              <summary>Disponibilités de l’enseignant</summary>
              <p className="planning-hint">
                Sans sélection, les disponibilités ne sont pas renseignées.
              </p>
              {JOURS_SEMAINE.map((day) => (
                <fieldset key={day.code} className="planning-availability">
                  <legend>{day.label}</legend>
                  {CRENEAUX_OFFICIELS_EMSI.map((slot) => (
                    <label key={slot.code}>
                      <input
                        type="checkbox"
                        checked={availability.some(
                          (d) =>
                            d.jour === day.code &&
                            d.creneaux.includes(slot.code),
                        )}
                        onChange={(e) =>
                          slots(day.code, slot.code, e.target.checked)
                        }
                      />
                      {slot.heureDebut}
                    </label>
                  ))}
                </fieldset>
              ))}
            </details>
          </>
        )}
        {resourceType === "groupe" && (
          <>
            {filiere}
            {campus}
            <div className="planning-form-row">
              <Field name="year" label="Année d’étude">
                {input("year", {
                  type: "number",
                  min: 1,
                  max: 5,
                  required: true,
                  defaultValue: item?.anneeEtude ?? 1,
                })}
              </Field>
              <Field name="capacity" label="Effectif">
                {input("capacity", {
                  type: "number",
                  min: 1,
                  max: 1000,
                  required: true,
                  defaultValue: item?.effectif ?? 30,
                })}
              </Field>
            </div>
            <fieldset className="planning-group-requirements">
              <legend>Besoins en salles</legend>
              {(
                [
                  ["STANDARD", "Salle standard"],
                  ["LI_PC", "Laboratoire informatique"],
                  ["LR_RESEAUX", "Laboratoire réseaux"],
                  ["AMPHI", "Amphithéâtre"],
                ] as const
              ).map(([value, label]) => (
                <label key={value} className="planning-checkbox">
                  <input
                    type="checkbox"
                    name="group-type"
                    value={value}
                    defaultChecked={(item?.laboratoiresRequis ?? "STANDARD")
                      .split(",")
                      .includes(value)}
                  />
                  {label}
                </label>
              ))}
            </fieldset>
            <Field name="option" label="Option">
              <select
                id="resource-option"
                name="option"
                defaultValue={item?.optionId ?? ""}
              >
                <option value="">Sans option</option>
                {ctx.options
                  .filter((o) => o.filiereId === selectedFiliere)
                  .map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.intitule}
                    </option>
                  ))}
              </select>
            </Field>
            <Field name="delegue" label="Nom du délégué">
              {input("delegue", {
                maxLength: 150,
                defaultValue: item?.delegueNom ?? "",
              })}
            </Field>
          </>
        )}
        {resourceType === "module" && (
          <>
            <Field name="intitule" label="Intitulé du module">
              {input("intitule", { required: true, maxLength: 150 })}
            </Field>
            {filiere}
            <Field name="semestre" label="Semestre">
              <select id="resource-semestre" name="semestre">
                <option value="S1">Semestre 1</option>
                <option value="S2">Semestre 2</option>
              </select>
            </Field>
            <Field name="hours" label="Volume horaire">
              {input("hours", {
                type: "number",
                min: 1,
                max: 600,
                required: true,
                defaultValue: 45,
              })}
            </Field>
            {roomType}
            <p className="planning-hint">
              Un premier élément pédagogique sera créé avec le module.
            </p>
          </>
        )}
      </fieldset>
      {(failure || ctx.error) && (
        <p role="alert" className="planning-form-error">
          {ctx.error || failure}
        </p>
      )}
      <div className="planning-form-actions">
        <button type="button" onClick={onClose} disabled={pending}>
          Annuler
        </button>
        <button type="submit" className="planning-primary" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
