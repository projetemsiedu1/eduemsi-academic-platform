"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTimetable } from "@/context/TimetableContext";
import { ApiClient } from "@/lib/api-client";
import { TimetableHeader } from "./TimetableHeader";
import { Modal } from "@/components/ui/modal";
import { ResourceModal, type ModalResourceType } from "./ResourceModal";
import { FiliereModal } from "./CreateFiliereButton";
import type { Salle, Enseignant, Groupe, Filiere } from "@/types/timetable";

const sections = [
  ["filieres", "Filières"],
  ["groupes", "Groupes"],
  ["modules", "Modules"],
  ["enseignants", "Enseignants"],
  ["salles", "Salles"],
  ["campus", "Campus"],
] as const;
type Section = (typeof sections)[number][0];
type Editable = Salle | Enseignant | Groupe;
interface Row {
  id: string;
  title: string;
  subtitle?: string;
  cells: ReactNode[];
  search: string;
  campus?: string;
  filiere?: string;
  year?: number;
  contract?: string;
  active?: boolean;
  available?: boolean;
  item?: Editable;
  branch?: Filiere;
}
const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .trim();

export function PlanningResources() {
  const ctx = useTimetable(),
    params = useSearchParams(),
    router = useRouter();
  const section: Section =
    sections.find(([key]) => key === params.get("section"))?.[0] ?? "filieres";
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [failure, setFailure] = useState("");
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState<{
    type: ModalResourceType;
    item?: Editable;
  } | null>(null);
  const [branch, setBranch] = useState<{ item?: Filiere } | null>(null);
  const [removal, setRemoval] = useState<{ section: Section; row: Row } | null>(
    null,
  );
  const campus = params.get("campus") ?? "ALL",
    filiere = params.get("filiere") ?? "ALL",
    year = params.get("annee") ?? "ALL",
    contract = params.get("contrat") ?? "ALL",
    state = params.get("etat") ?? "ALL";
  const branchName = (id: string) =>
    ctx.filieres.find((f) => f.id === id)?.codeFiliere ?? "Filière absente";
  const campusName = (id: string) =>
    ctx.campuses.find((c) => c.id === id)?.nom ?? "Campus absent";
  const counts = {
    filieres: ctx.filieres.length,
    groupes: ctx.groupes.length,
    modules: ctx.modules.length,
    enseignants: ctx.enseignants.length,
    salles: ctx.salles.length,
    campus: ctx.campuses.length,
  };
  const headings: Record<Section, string[]> = {
    filieres: ["Filière", "Groupes", "Modules", "Actions"],
    groupes: [
      "Groupe",
      "Filière / année",
      "Effectif",
      "Campus fixe",
      "Actions",
    ],
    modules: [
      "Module",
      "Filière / semestre",
      "Volume semestriel",
      "Éléments / salles requises",
    ],
    enseignants: [
      "Enseignant",
      "Contrat / charge maximale",
      "Disponibilités",
      "Modules qualifiés",
      "Actions",
    ],
    salles: ["Salle", "Campus", "Équipement", "Capacité", "État", "Actions"],
    campus: ["Campus", "Adresse", "Salles", "Groupes"],
  };
  const needsCampus = section === "salles" || section === "groupes";
  const needsBranch = section === "groupes" || section === "modules";
  const activeFilters = [
    Boolean(search),
    needsCampus && campus !== "ALL",
    needsBranch && filiere !== "ALL",
    section === "groupes" && year !== "ALL",
    section === "enseignants" && contract !== "ALL",
    (section === "salles" || section === "enseignants") && state !== "ALL",
  ].filter(Boolean).length;
  const missing = [
    needsCampus && !ctx.campuses.length ? "un campus" : "",
    needsBranch && !ctx.filieres.length ? "une filière" : "",
  ].filter(Boolean);
  const busy = pending || ctx.busy;
  const modeHint =
    ctx.mode === "demo" ? "Démonstration temporaire" : "Référentiel partagé";
  let rows: Row[];
  switch (section) {
    case "filieres":
      rows = ctx.filieres.map((f) => ({
        id: f.id,
        title: f.codeFiliere,
        subtitle: f.intitule,
        search: f.codeFiliere + " " + f.intitule,
        branch: f,
        cells: [
          <Link
            key="groups"
            href={`/timetable/resources?section=groupes&filiere=${f.id}`}
            onClick={() => setSearch("")}
          >
            {ctx.groupes.filter((g) => g.filiereId === f.id).length} groupes
          </Link>,
          <Link
            key="modules"
            href={`/timetable/resources?section=modules&filiere=${f.id}`}
            onClick={() => setSearch("")}
          >
            {ctx.modules.filter((m) => m.filiereId === f.id).length} modules
          </Link>,
        ],
      }));
      break;
    case "groupes":
      rows = ctx.groupes.map((g) => ({
        id: g.id,
        title: g.codeGroupe,
        subtitle: g.delegueNom ? `Délégué : ${g.delegueNom}` : undefined,
        search: `${g.codeGroupe} ${g.delegueNom} ${branchName(g.filiereId)}`,
        campus: g.campusFixeId,
        filiere: g.filiereId,
        year: g.anneeEtude,
        item: g,
        cells: [
          `${branchName(g.filiereId)} · ${g.anneeEtude}e année`,
          `${g.effectif} étudiants`,
          campusName(g.campusFixeId),
        ],
      }));
      break;
    case "modules":
      rows = ctx.modules.map((m) => ({
        id: m.id,
        title: m.codeModule,
        subtitle: m.intitule,
        search: `${m.codeModule} ${m.intitule} ${branchName(m.filiereId)}`,
        filiere: m.filiereId,
        cells: [
          `${branchName(m.filiereId)} · ${m.semestre}`,
          `${m.volumeHoraireTotal} h`,
          <ul key="elements" className="directory-elements">
            {ctx.elements
              .filter((e) => e.moduleId === m.id)
              .map((e) => (
                <li key={e.id}>
                  {e.intitule} · {e.typeSalleRequis ?? "STANDARD"}
                </li>
              ))}
          </ul>,
        ],
      }));
      break;
    case "enseignants":
      rows = ctx.enseignants.map((t) => {
        const n = t.disponibilites.reduce(
          (count, d) =>
            count +
            d.creneaux.filter(
              (code) =>
                !ctx.calendar ||
                (ctx.calendar.days.includes(d.jour) &&
                  ctx.calendar.slots.some((s) => s.code === code)),
            ).length,
          0,
        );
        const qualified = t.competencesModulesIds
          .map((id) => ctx.modules.find((m) => m.id === id)?.codeModule)
          .filter(Boolean);
        return {
          id: t.id,
          title: `${t.nom} ${t.prenom}`,
          subtitle: `${t.matricule} · ${t.email}`,
          search: `${t.nom} ${t.prenom} ${t.matricule} ${t.specialite} ${t.email}`,
          contract: t.typeContrat,
          active: t.estActif,
          item: t,
          cells: [
            `${t.typeContrat === "VACATAIRE" ? "Vacataire" : "Permanent"} · ${t.heuresContractuellesSemaine} h / semaine`,
            t.estActif
              ? n
                ? `${n} créneaux autorisés`
                : t.typeContrat === "VACATAIRE"
                  ? "À compléter avant planification"
                  : "Aucune restriction renseignée"
              : "Enseignant inactif",
            qualified.length ? (
              qualified.join(", ")
            ) : (
              <Link key="qualifications" href="/timetable/constraints">
                Définir les qualifications
              </Link>
            ),
          ],
        };
      });
      break;
    case "salles":
      rows = ctx.salles.map((r) => ({
        id: r.id,
        title: r.codeSalle,
        subtitle: r.specsEquipements || undefined,
        search: `${r.codeSalle} ${r.specsEquipements} ${campusName(r.campusId)}`,
        campus: r.campusId,
        available: r.estDisponible,
        item: r,
        cells: [
          campusName(r.campusId),
          r.typeSalle === "LI_PC"
            ? `Informatique · ${r.nombrePcOperationnels} postes`
            : r.typeSalle === "LR_RESEAUX"
              ? "Laboratoire réseaux"
              : r.typeSalle === "AMPHI"
                ? "Amphithéâtre"
                : "Salle standard",
          `${r.capacite} places`,
          r.estDisponible ? "Disponible" : "Indisponible",
        ],
      }));
      break;
    case "campus":
      rows = ctx.campuses.map((c) => ({
        id: c.id,
        title: c.nom,
        subtitle: c.ville,
        search: `${c.nom} ${c.ville} ${c.adresse}`,
        cells: [
          c.adresse || "Adresse non renseignée",
          String(ctx.salles.filter((r) => r.campusId === c.id).length),
          String(ctx.groupes.filter((g) => g.campusFixeId === c.id).length),
        ],
      }));
      break;
  }
  const filtered = rows
    .filter(
      (r) =>
        normalize(search)
          .split(/\s+/)
          .filter(Boolean)
          .every((word) => normalize(r.search).includes(word)) &&
        (campus === "ALL" || !needsCampus || r.campus === campus) &&
        (filiere === "ALL" || !needsBranch || r.filiere === filiere) &&
        (year === "ALL" || section !== "groupes" || String(r.year) === year) &&
        (contract === "ALL" ||
          section !== "enseignants" ||
          r.contract === contract) &&
        (state === "ALL" ||
          (section === "enseignants"
            ? r.active === (state === "active")
            : section === "salles"
              ? r.available === (state === "active")
              : true)),
    )
    .sort((a, b) =>
      `${a.filiere ?? ""} ${a.year ?? ""} ${a.title}`.localeCompare(
        `${b.filiere ?? ""} ${b.year ?? ""} ${b.title}`,
        "fr",
        { numeric: true },
      ),
    );
  function filter(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    next.set("section", section);
    if (value === "ALL") next.delete(key);
    else next.set(key, value);
    router.replace("/timetable/resources?" + next.toString(), {
      scroll: false,
    });
  }
  function create(type?: ModalResourceType) {
    ctx.clearFeedback();
    setFailure("");
    setNotice("");
    if (type) setForm({ type });
    else if (section === "filieres") setBranch({});
    else if (section !== "campus")
      setForm({
        type: (
          {
            salles: "salle",
            groupes: "groupe",
            modules: "module",
            enseignants: "enseignant",
          } as const
        )[section],
      });
  }
  const createLabel: Record<Section, string> = {
    filieres: "Créer une filière",
    groupes: "Créer un groupe",
    modules: "Créer un module",
    enseignants: "Ajouter un enseignant",
    salles: "Ajouter une salle",
    campus: "",
  };
  async function remove() {
    if (!removal || busy) return;
    setPending(true);
    setFailure("");
    ctx.clearFeedback();
    try {
      let ok = true;
      if (removal.section === "filieres") {
        await ApiClient.delete("/filieres/" + removal.row.id);
        await ctx.reload();
      } else if (removal.section === "salles")
        ok = await ctx.deleteSalle(removal.row.id);
      else if (removal.section === "enseignants")
        ok = await ctx.deleteEnseignant(removal.row.id);
      else if (removal.section === "groupes")
        ok = await ctx.deleteGroupe(removal.row.id);
      if (ok) {
        setRemoval(null);
        setNotice("La ressource a été supprimée.");
      }
    } catch (e) {
      setFailure(e instanceof Error ? e.message : "Suppression impossible.");
    } finally {
      setPending(false);
    }
  }
  function actions(row: Row) {
    const mutable = section === "filieres" || Boolean(row.item);
    if (!mutable) return null;
    return (
      <div className="directory-row-actions">
        <button
          disabled={busy || (ctx.mode === "demo" && section === "filieres")}
          onClick={() => {
            ctx.clearFeedback();
            setFailure("");
            if (row.branch) setBranch({ item: row.branch });
            else if (row.item)
              setForm({
                type: (
                  {
                    salles: "salle",
                    groupes: "groupe",
                    enseignants: "enseignant",
                  } as const
                )[section as "salles" | "groupes" | "enseignants"],
                item: row.item,
              });
          }}
          aria-label={`Modifier ${row.title}`}
        >
          Modifier
        </button>
        <button
          disabled={busy || (ctx.mode === "demo" && section === "filieres")}
          onClick={() => {
            ctx.clearFeedback();
            setFailure("");
            setRemoval({ section, row });
          }}
          aria-label={`Supprimer ${row.title}`}
        >
          Supprimer
        </button>
      </div>
    );
  }
  return (
    <>
      <TimetableHeader
        title="Ressources académiques"
        subtitle="Préparez les filières, groupes, modules, enseignants et salles avant de planifier."
      />
      <main className="planning-content">
        <nav
          className="directory-sections"
          aria-label="Catégories des ressources"
        >
          {sections.map(([key, label]) => (
            <Link
              key={key}
              href={`/timetable/resources?section=${key}`}
              aria-current={section === key ? "page" : undefined}
              onClick={() => {
                setSearch("");
                setNotice("");
                setFailure("");
              }}
            >
              {label}
              <span>{counts[key]}</span>
            </Link>
          ))}
        </nav>
        <section className="planning-panel directory-panel">
          <div className="directory-heading">
            <div>
              <h2>{sections.find(([key]) => key === section)?.[1]}</h2>
              <p>
                {modeHint} · {counts[section]}{" "}
                {counts[section] === 1 ? "ressource" : "ressources"}
              </p>
            </div>
            <div className="planning-form-actions">
              {section !== "groupes" && (
                <button
                  disabled={
                    busy || !ctx.filieres.length || !ctx.campuses.length
                  }
                  onClick={() => create("groupe")}
                >
                  Créer un groupe
                </button>
              )}
              {section !== "campus" && (
                <button
                  className="planning-primary"
                  disabled={
                    busy ||
                    Boolean(missing.length) ||
                    (section === "filieres" && ctx.mode === "demo")
                  }
                  onClick={() => create()}
                >
                  {createLabel[section]}
                </button>
              )}
            </div>
          </div>
          {missing.length > 0 && (
            <p className="directory-prerequisite">
              Pour créer cette ressource, enregistrez d’abord{" "}
              {missing.join(" et ")}.{" "}
              <Link href="/timetable/resources?section=filieres">
                Gérer les filières
              </Link>
            </p>
          )}
          {section === "filieres" && (
            <p className="planning-hint">
              La filière décrit la formation. L’année d’étude et le campus se
              renseignent séparément sur chaque groupe.
            </p>
          )}
          {section === "groupes" && (
            <p className="planning-hint">
              Chaque groupe est rattaché à une filière, une année d’étude et un
              campus fixe. Son effectif détermine les salles compatibles.
            </p>
          )}
          {section === "enseignants" && (
            <p className="planning-hint">
              Ouvrez « Modifier » pour renseigner les disponibilités. Les
              vacataires doivent avoir des créneaux autorisés avant le calcul.
            </p>
          )}
          {notice && (
            <p role="status" className="solver-notice">
              {notice}
            </p>
          )}
          {failure && (
            <p role="alert" className="planning-form-error">
              {failure}
            </p>
          )}
          <button
            className="directory-filter-toggle"
            aria-expanded={filtersOpen}
            aria-controls="directory-filters"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            {filtersOpen
              ? "Fermer les filtres"
              : `Rechercher et filtrer${activeFilters ? ` (${activeFilters})` : ""}`}
          </button>
          <div
            id="directory-filters"
            className="directory-filters"
            data-open={filtersOpen || undefined}
          >
            <div className="planning-field">
              <label htmlFor="directory-search">
                Rechercher dans cette catégorie
              </label>
              <input
                id="directory-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom, code ou intitulé…"
              />
            </div>
            {needsBranch && (
              <div className="planning-field">
                <label htmlFor="directory-filiere">Filière</label>
                <select
                  id="directory-filiere"
                  value={filiere}
                  onChange={(e) => filter("filiere", e.target.value)}
                >
                  <option value="ALL">Toutes les filières</option>
                  {ctx.filieres.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.codeFiliere} — {f.intitule}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {needsCampus && (
              <div className="planning-field">
                <label htmlFor="directory-campus">Campus</label>
                <select
                  id="directory-campus"
                  value={campus}
                  onChange={(e) => filter("campus", e.target.value)}
                >
                  <option value="ALL">Tous les campus</option>
                  {ctx.campuses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nom}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {section === "groupes" && (
              <div className="planning-field">
                <label htmlFor="directory-year">Année</label>
                <select
                  id="directory-year"
                  value={year}
                  onChange={(e) => filter("annee", e.target.value)}
                >
                  <option value="ALL">Toutes les années</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}e année
                    </option>
                  ))}
                </select>
              </div>
            )}
            {section === "enseignants" && (
              <div className="planning-field">
                <label htmlFor="directory-contract">Contrat</label>
                <select
                  id="directory-contract"
                  value={contract}
                  onChange={(e) => filter("contrat", e.target.value)}
                >
                  <option value="ALL">Tous les contrats</option>
                  <option value="PERMANENT">Permanent</option>
                  <option value="VACATAIRE">Vacataire</option>
                </select>
              </div>
            )}
            {(section === "enseignants" || section === "salles") && (
              <div className="planning-field">
                <label htmlFor="directory-state">État</label>
                <select
                  id="directory-state"
                  value={state}
                  onChange={(e) => filter("etat", e.target.value)}
                >
                  <option value="ALL">Tous les états</option>
                  <option value="active">
                    {section === "salles" ? "Disponible" : "Actif"}
                  </option>
                  <option value="inactive">
                    {section === "salles" ? "Indisponible" : "Inactif"}
                  </option>
                </select>
              </div>
            )}
            <button
              onClick={() => {
                setSearch("");
                router.replace(`/timetable/resources?section=${section}`, {
                  scroll: false,
                });
              }}
            >
              Effacer les filtres
            </button>
          </div>
          <p className="planning-hint" role="status">
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""} sur{" "}
            {rows.length}
          </p>
          {filtered.length ? (
            <>
              <div
                className="directory-table"
                role="region"
                aria-label={`Liste ${section}, défilement horizontal disponible`}
                tabIndex={0}
              >
                <table>
                  <caption className="sr-only">
                    {sections.find(([key]) => key === section)?.[1]}
                  </caption>
                  <thead>
                    <tr>
                      {headings[section].map((h) => (
                        <th key={h} scope="col">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr key={row.id}>
                        <th scope="row">
                          <strong>{row.title}</strong>
                          {row.subtitle && <span>{row.subtitle}</span>}
                        </th>
                        {row.cells.map((cell, i) => (
                          <td key={i}>{cell}</td>
                        ))}
                        {actions(row) && <td>{actions(row)}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="directory-mobile-list">
                {filtered.map((row) => (
                  <li key={row.id}>
                    <h3>{row.title}</h3>
                    {row.subtitle && <p>{row.subtitle}</p>}
                    <dl>
                      {row.cells.map((cell, i) => (
                        <div key={i}>
                          <dt>{headings[section][i + 1]}</dt>
                          <dd>{cell}</dd>
                        </div>
                      ))}
                    </dl>
                    {actions(row)}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="planning-empty">
              <p>
                {rows.length
                  ? "Aucun résultat pour ces filtres. Effacez-les pour retrouver toutes les ressources."
                  : section === "campus"
                    ? "Aucun campus disponible. Les campus du référentiel doivent être configurés avant la création de groupes et de salles."
                    : `Aucune ressource dans cette catégorie. Utilisez « ${createLabel[section]} » pour préparer le référentiel.`}
              </p>
            </div>
          )}
        </section>
        <p className="planning-hint">
          Les ressources sont prêtes ?{" "}
          <Link href="/timetable/constraints">
            Définir les qualifications et besoins, puis planifier
          </Link>
        </p>
      </main>
      <ResourceModal
        isOpen={Boolean(form)}
        resourceType={form?.type ?? "groupe"}
        itemToEdit={form?.item ?? null}
        initialFiliereId={filiere === "ALL" ? undefined : filiere}
        initialCampusId={campus === "ALL" ? undefined : campus}
        onClose={() => setForm(null)}
        onSaved={() => {
          setSearch("");
          setNotice("Ressource enregistrée. Le référentiel est à jour.");
          const target = {
            salle: "salles",
            groupe: "groupes",
            enseignant: "enseignants",
            module: "modules",
          }[form?.type ?? "groupe"];
          router.replace(`/timetable/resources?section=${target}`, {
            scroll: false,
          });
        }}
      />
      <FiliereModal
        open={Boolean(branch)}
        item={branch?.item}
        onClose={() => setBranch(null)}
        onSaved={() => {
          setSearch("");
          setNotice("Filière enregistrée.");
          router.replace("/timetable/resources?section=filieres", {
            scroll: false,
          });
        }}
      />
      <Modal
        open={Boolean(removal)}
        onClose={() => {
          if (!busy) setRemoval(null);
        }}
        busy={busy}
        title={`Supprimer ${removal?.row.title ?? "la ressource"} ?`}
      >
        <p>
          Une ressource utilisée par des groupes, modules, besoins ou séances
          doit d’abord être réaffectée. Aucune donnée liée ne sera supprimée
          implicitement.
        </p>
        {(failure || ctx.error) && (
          <p role="alert" className="planning-form-error">
            {failure || ctx.error}
          </p>
        )}
        <div className="planning-form-actions">
          <button disabled={busy} onClick={() => setRemoval(null)}>
            Annuler
          </button>
          <button disabled={busy} onClick={() => void remove()}>
            Confirmer la suppression
          </button>
        </div>
      </Modal>
    </>
  );
}
