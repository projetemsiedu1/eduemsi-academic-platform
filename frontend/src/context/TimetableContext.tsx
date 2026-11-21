"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type {
  Campus,
  Salle,
  Enseignant,
  Filiere,
  OptionFiliere,
  Groupe,
  Module,
  ElementModule,
  Seance,
} from "@/types/timetable";
import {
  INITIAL_CAMPUSES,
  INITIAL_SALLES,
  INITIAL_ENSEIGNANTS,
  INITIAL_FILIERES,
  INITIAL_OPTIONS,
  INITIAL_GROUPES,
  INITIAL_MODULES,
  INITIAL_ELEMENTS,
  INITIAL_SEANCES,
  computeTimetableStats,
} from "@/data/timetable-mock";
import { checkTimetableConflicts } from "@/lib/timetable-checker";
import { ApiClient, ApiError } from "@/lib/api-client";
import type { SolverCalendar } from "@/types/solver";

export interface TimetableData {
  campuses: Campus[];
  salles: Salle[];
  enseignants: Enseignant[];
  filieres: Filiere[];
  options: OptionFiliere[];
  groupes: Groupe[];
  modules: Module[];
  elements: ElementModule[];
  seances: Seance[];
}
const EMPTY: TimetableData = {
  campuses: [],
  salles: [],
  enseignants: [],
  filieres: [],
  options: [],
  groupes: [],
  modules: [],
  elements: [],
  seances: [],
};
const DEMO: TimetableData = {
  campuses: INITIAL_CAMPUSES,
  salles: INITIAL_SALLES,
  enseignants: INITIAL_ENSEIGNANTS,
  filieres: INITIAL_FILIERES,
  options: INITIAL_OPTIONS,
  groupes: INITIAL_GROUPES,
  modules: INITIAL_MODULES,
  elements: INITIAL_ELEMENTS,
  seances: INITIAL_SEANCES,
};
export interface ModuleInput {
  code: string;
  intitule: string;
  filiereId: string;
  semestre: string;
  volumeHoraire: number;
  typeSalleRequis: string;
}

type ContextValue = TimetableData & {
  calendar: SolverCalendar | null;
  calendarError: string;
  stats: ReturnType<typeof computeTimetableStats>;
  verificationReport: ReturnType<typeof checkTimetableConflicts>;
  mode: "live" | "demo";
  loading: boolean;
  busy: boolean;
  error: string;
  notice: string;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  reload: () => Promise<void>;
  switchMode: (mode: "live" | "demo") => void;
  clearFeedback: () => void;
  addOrUpdateSalle: (item: Salle) => Promise<boolean>;
  deleteSalle: (id: string) => Promise<boolean>;
  addOrUpdateEnseignant: (item: Enseignant) => Promise<boolean>;
  deleteEnseignant: (id: string) => Promise<boolean>;
  addOrUpdateGroupe: (item: Groupe) => Promise<boolean>;
  deleteGroupe: (id: string) => Promise<boolean>;
  addOrUpdateSeance: (item: Seance) => Promise<boolean>;
  deleteSeance: (id: string) => Promise<boolean>;
  createModule: (input: ModuleInput) => Promise<boolean>;
  injectTestConflictScenario: () => void;
  resetToInitialData: () => void;
  isCustomScenario: boolean;
};
const TimetableContext = createContext<ContextValue | null>(null);

function workspaceError(reason: unknown): string {
  if (reason instanceof ApiError && reason.status === 404)
    return "Le service de planning est absent du backend démarré. Relancez le backend à jour depuis le dossier backend-spring, puis réessayez.";
  if (reason instanceof ApiError && reason.status === 403)
    return "Votre compte ne dispose pas des droits de planification.";
  return reason instanceof Error
    ? reason.message
    : "Impossible de charger le planning.";
}

export function TimetableProvider({ children }: { children: ReactNode }) {
  const [calendar, setCalendar] = useState<SolverCalendar | null>(null);
  const [calendarError, setCalendarError] = useState("");
  const [data, setData] = useState<TimetableData>(EMPTY);
  const [mode, setMode] = useState<"live" | "demo">("live");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCustomScenario, setIsCustomScenario] = useState(false);
  const mutation = useRef(false);
  const generation = useRef(0);

  useEffect(() => {
    let active = true;
    if (mode === "live") {
      ApiClient.get<SolverCalendar>("/planning/solver/calendar")
        .then((value) => {
          if (active) {
            setCalendar(value);
            setCalendarError("");
          }
        })
        .catch(() => {
          if (active) {
            setCalendar(null);
            setCalendarError(
              "Le calendrier du solveur est indisponible. Vérifiez que le backend est à jour.",
            );
          }
        });
    }
    return () => {
      active = false;
    };
  }, [mode]);

  const reload = useCallback(async () => {
    const ticket = ++generation.current;
    setLoading(true);
    setError("");
    try {
      const snapshot = await ApiClient.get<TimetableData>(
        "/planning/workspace",
      );
      if (
        !snapshot ||
        Object.keys(EMPTY).some(
          (key) => !Array.isArray(snapshot[key as keyof TimetableData]),
        )
      )
        throw new Error("Le format des données de planning est invalide.");
      if (ticket === generation.current) setData(snapshot);
    } catch (reason) {
      if (ticket === generation.current) setError(workspaceError(reason));
    } finally {
      if (ticket === generation.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    let active = true;
    const ticket = ++generation.current;
    ApiClient.get<TimetableData>("/planning/workspace")
      .then((snapshot) => {
        if (
          !snapshot ||
          Object.keys(EMPTY).some(
            (key) => !Array.isArray(snapshot[key as keyof TimetableData]),
          )
        )
          throw new Error("Le format des données de planning est invalide.");
        if (active && ticket === generation.current) setData(snapshot);
      })
      .catch((reason) => {
        if (active && ticket === generation.current)
          setError(workspaceError(reason));
      })
      .finally(() => {
        if (active && ticket === generation.current) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function switchMode(next: "live" | "demo") {
    if (mutation.current) return;
    generation.current++;
    setMode(next);
    setError("");
    setNotice("");
    setIsCustomScenario(false);
    if (next === "demo") {
      setData(structuredClone(DEMO));
      setLoading(false);
    } else {
      setData(EMPTY);
      void reload();
    }
  }

  async function mutate(
    resource: "salles" | "enseignants" | "groupes" | "seances",
    itemOrId: Salle | Enseignant | Groupe | Seance | string,
  ) {
    if (mutation.current) return false;
    let persisted = false;
    mutation.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const isDelete = typeof itemOrId === "string";
      const id = isDelete ? itemOrId : itemOrId.id;
      if (mode === "demo") {
        if (
          isDelete &&
          data.seances.some((s) =>
            resource === "salles"
              ? s.salleId === id
              : resource === "groupes"
                ? s.groupeId === id
                : resource === "enseignants"
                  ? s.enseignantId === id
                  : false,
          )
        )
          throw new Error(
            "Cette ressource est utilisée par des séances. Réaffectez-les avant suppression.",
          );
        setData((previous) => ({
          ...previous,
          [resource]: isDelete
            ? previous[resource].filter((x) => x.id !== id)
            : [...previous[resource].filter((x) => x.id !== id), itemOrId],
        }));
        setNotice(
          "Démonstration mise à jour. Aucune donnée envoyée au serveur.",
        );
        return true;
      }
      const path =
        resource === "seances" ? "/planning/seances" : "/" + resource;
      if (isDelete) await ApiClient.delete(path + "/" + id);
      else {
        let body: unknown = itemOrId;
        if (resource === "salles") {
          const s = itemOrId as Salle;
          body = { ...s, campusId: Number(s.campusId) };
        }
        if (resource === "enseignants") {
          const e = itemOrId as Enseignant;
          body = {
            ...e,
            disponibilitesFixesJson: JSON.stringify(e.disponibilites),
          };
        }
        if (resource === "groupes") {
          const g = itemOrId as Groupe;
          body = {
            ...g,
            filiereId: Number(g.filiereId),
            campusFixeId: Number(g.campusFixeId),
            optionSpecialite:
              data.options.find((o) => o.id === g.optionId)?.intitule ?? null,
          };
        }
        if (resource === "seances") {
          const s = itemOrId as Seance;
          body = {
            ...s,
            groupeId: Number(s.groupeId),
            salleId: Number(s.salleId),
            enseignantId: Number(s.enseignantId),
            elementModuleId: Number(s.elementModuleId),
          };
        }
        if (/^\d+$/.test(id)) await ApiClient.put(path + "/" + id, body);
        else await ApiClient.post(path, body);
      }
      persisted = true;
      const updated = await ApiClient.get<TimetableData>("/planning/workspace");
      setData(updated);
      setNotice("Modification enregistrée sur le serveur.");
      return true;
    } catch (reason) {
      if (persisted) {
        setError(
          "La modification est enregistrée, mais les données n’ont pas pu être rechargées. Cliquez sur Actualiser avant de continuer.",
        );
        return true;
      }
      setError(
        reason instanceof Error ? reason.message : "La modification a échoué.",
      );
      return false;
    } finally {
      mutation.current = false;
      setBusy(false);
    }
  }
  async function createModule(input: ModuleInput) {
    if (mutation.current) return false;
    mutation.current = true;
    setBusy(true);
    setError("");
    try {
      if (mode === "demo") {
        const id = crypto.randomUUID();
        setData((previous) => ({
          ...previous,
          modules: [
            ...previous.modules,
            {
              id,
              codeModule: input.code,
              intitule: input.intitule,
              filiereId: input.filiereId,
              semestre: input.semestre,
              volumeHoraireTotal: input.volumeHoraire,
            },
          ],
          elements: [
            ...previous.elements,
            {
              id: id + "-01",
              moduleId: id,
              codeElement: input.code + "-01",
              intitule: input.intitule,
              volumeHoraire: input.volumeHoraire,
              typeElement:
                input.typeSalleRequis === "STANDARD" ? "COURS" : "TP",
              necessitePc: input.typeSalleRequis === "LI_PC",
              typeSalleRequis: input.typeSalleRequis as Salle["typeSalle"],
            },
          ],
        }));
      } else {
        await ApiClient.post("/planning/modules", {
          ...input,
          filiereId: Number(input.filiereId),
        });
        setData(await ApiClient.get<TimetableData>("/planning/workspace"));
      }
      setNotice(
        mode === "demo"
          ? "Module ajouté à la démonstration."
          : "Module et élément pédagogique enregistrés.",
      );
      return true;
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Création impossible.",
      );
      return false;
    } finally {
      mutation.current = false;
      setBusy(false);
    }
  }
  function injectTestConflictScenario() {
    if (mode !== "demo" || !data.seances.length) return;
    setData((previous) => ({
      ...previous,
      seances: [
        ...previous.seances.filter((s) => s.id !== "conf-sim-01"),
        { ...previous.seances[0], id: "conf-sim-01" },
      ],
    }));
    setIsCustomScenario(true);
  }
  const stats = useMemo(
    () =>
      computeTimetableStats(
        data.campuses,
        data.salles,
        data.enseignants,
        data.modules,
        data.groupes,
        data.seances,
      ),
    [data],
  );
  const verificationReport = useMemo(
    () => checkTimetableConflicts(data),
    [data],
  );
  return (
    <TimetableContext.Provider
      value={{
        ...data,
        calendar: mode === "live" ? calendar : null,
        calendarError: mode === "live" ? calendarError : "",
        stats,
        verificationReport,
        mode,
        loading,
        busy,
        error,
        notice,
        mobileMenuOpen,
        setMobileMenuOpen,
        reload,
        switchMode,
        clearFeedback: () => {
          setError("");
          setNotice("");
        },
        addOrUpdateSalle: (item) => mutate("salles", item),
        deleteSalle: (id) => mutate("salles", id),
        addOrUpdateEnseignant: (item) => mutate("enseignants", item),
        deleteEnseignant: (id) => mutate("enseignants", id),
        addOrUpdateGroupe: (item) => mutate("groupes", item),
        deleteGroupe: (id) => mutate("groupes", id),
        addOrUpdateSeance: (item) => mutate("seances", item),
        deleteSeance: (id) => mutate("seances", id),
        createModule,
        injectTestConflictScenario,
        isCustomScenario,
        resetToInitialData: () => {
          if (mode === "demo") {
            setData(structuredClone(DEMO));
            setIsCustomScenario(false);
          }
        },
      }}
    >
      {children}
    </TimetableContext.Provider>
  );
}
export function useTimetable() {
  const context = useContext(TimetableContext);
  if (!context) throw new Error("TimetableProvider est requis.");
  return context;
}
