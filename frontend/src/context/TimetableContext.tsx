'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Campus,
  Salle,
  Enseignant,
  Filiere,
  OptionFiliere,
  Groupe,
  Module,
  ElementModule,
  Seance,
  TimetableStats,
} from '@/types/timetable';
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
  loadStoredResource,
  saveStoredResource,
  clearStoredResources,
} from '@/data/timetable-mock';
import { checkTimetableConflicts, VerificationReport } from '@/lib/timetable-checker';

interface TimetableContextType {
  campuses: Campus[];
  salles: Salle[];
  enseignants: Enseignant[];
  filieres: Filiere[];
  options: OptionFiliere[];
  groupes: Groupe[];
  modules: Module[];
  elements: ElementModule[];
  seances: Seance[];
  stats: TimetableStats;
  verificationReport: VerificationReport;
  isCustomScenario: boolean;

  // Actions CRUD locales
  addOrUpdateSalle: (salle: Salle) => void;
  deleteSalle: (id: string) => void;
  addOrUpdateEnseignant: (ens: Enseignant) => void;
  deleteEnseignant: (id: string) => void;
  addOrUpdateGroupe: (grp: Groupe) => void;
  deleteGroupe: (id: string) => void;
  addOrUpdateSeance: (seance: Seance) => void;
  deleteSeance: (id: string) => void;

  // Démonstration
  injectTestConflictScenario: () => void;
  resetToInitialData: () => void;
}

const TimetableContext = createContext<TimetableContextType | undefined>(undefined);

export function TimetableProvider({ children }: { children: React.ReactNode }) {
  const [campuses, setCampuses] = useState<Campus[]>(INITIAL_CAMPUSES);
  const [salles, setSalles] = useState<Salle[]>(INITIAL_SALLES);
  const [enseignants, setEnseignants] = useState<Enseignant[]>(INITIAL_ENSEIGNANTS);
  const [filieres] = useState<Filiere[]>(INITIAL_FILIERES);
  const [options] = useState<OptionFiliere[]>(INITIAL_OPTIONS);
  const [groupes, setGroupes] = useState<Groupe[]>(INITIAL_GROUPES);
  const [modules, setModules] = useState<Module[]>(INITIAL_MODULES);
  const [elements, setElements] = useState<ElementModule[]>(INITIAL_ELEMENTS);
  const [seances, setSeances] = useState<Seance[]>(INITIAL_SEANCES);
  const [isCustomScenario, setIsCustomScenario] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Chargement depuis localStorage au montage client
  useEffect(() => {
    try {
      const storedCampuses = loadStoredResource<Campus[]>('campuses', INITIAL_CAMPUSES);
      const storedSalles = loadStoredResource<Salle[]>('salles', INITIAL_SALLES);
      const storedEnseignants = loadStoredResource<Enseignant[]>('enseignants', INITIAL_ENSEIGNANTS);
      const storedGroupes = loadStoredResource<Groupe[]>('groupes', INITIAL_GROUPES);
      const storedModules = loadStoredResource<Module[]>('modules', INITIAL_MODULES);
      const storedElements = loadStoredResource<ElementModule[]>('elements', INITIAL_ELEMENTS);
      const storedSeances = loadStoredResource<Seance[]>('seances', INITIAL_SEANCES);

      setCampuses(storedCampuses);
      setSalles(storedSalles);
      setEnseignants(storedEnseignants);
      setGroupes(storedGroupes);
      setModules(storedModules);
      setElements(storedElements);
      setSeances(storedSeances);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sauvegarde automatique lors des modifications après chargement initial
  useEffect(() => {
    if (!isLoaded) return;
    saveStoredResource('campuses', campuses);
    saveStoredResource('salles', salles);
    saveStoredResource('enseignants', enseignants);
    saveStoredResource('groupes', groupes);
    saveStoredResource('modules', modules);
    saveStoredResource('elements', elements);
    saveStoredResource('seances', seances);
  }, [campuses, salles, enseignants, groupes, modules, elements, seances, isLoaded]);

  // Recalcul des KPIs
  const stats = useMemo(
    () => computeTimetableStats(campuses, salles, enseignants, modules, groupes, seances),
    [campuses, salles, enseignants, modules, groupes, seances]
  );

  // Exécution temps réel du vérificateur de conflits
  const verificationReport = useMemo(
    () =>
      checkTimetableConflicts({
        seances,
        salles,
        groupes,
        enseignants,
        elements,
        campuses,
      }),
    [seances, salles, groupes, enseignants, elements, campuses]
  );

  const addOrUpdateSalle = useCallback((salle: Salle) => {
    setSalles((prev) => {
      const index = prev.findIndex((s) => s.id === salle.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = salle;
        return copy;
      }
      return [...prev, salle];
    });
  }, []);

  const deleteSalle = useCallback((id: string) => {
    setSalles((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addOrUpdateEnseignant = useCallback((ens: Enseignant) => {
    setEnseignants((prev) => {
      const index = prev.findIndex((e) => e.id === ens.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = ens;
        return copy;
      }
      return [...prev, ens];
    });
  }, []);

  const deleteEnseignant = useCallback((id: string) => {
    setEnseignants((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addOrUpdateGroupe = useCallback((grp: Groupe) => {
    setGroupes((prev) => {
      const index = prev.findIndex((g) => g.id === grp.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = grp;
        return copy;
      }
      return [...prev, grp];
    });
  }, []);

  const deleteGroupe = useCallback((id: string) => {
    setGroupes((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const addOrUpdateSeance = useCallback((seance: Seance) => {
    setSeances((prev) => {
      const index = prev.findIndex((s) => s.id === seance.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = seance;
        return copy;
      }
      return [...prev, seance];
    });
  }, []);

  const deleteSeance = useCallback((id: string) => {
    setSeances((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Démonstration : injecte intentionnellement deux conflits réels pour démontrer le détecteur
  const injectTestConflictScenario = useCallback(() => {
    setIsCustomScenario(true);
    // On duplique une séance pour créer :
    // 1. Double réservation de la Salle 102 le Lundi à 08h30
    // 2. Collision horaire de Pr. Benassou sur deux groupes simultanés
    const conflitSeance1: Seance = {
      id: 'conf-sim-01',
      groupeId: 'grp-5iir-2dsi-g2',
      salleId: 'sal-102', // même salle que 5IIR G1
      enseignantId: 'ens-benassou', // même prof
      elementModuleId: 'elem-501-cm',
      jourSemaine: 'LUNDI',
      numeroCreneau: 'S1_08H30',
      spanSeances: 1,
      statutAffectation: 'MANUEL',
    };

    setSeances((prev) => {
      const filtered = prev.filter((s) => s.id !== 'conf-sim-01');
      return [...filtered, conflitSeance1];
    });
  }, []);

  // Rétablir données initiales
  const resetToInitialData = useCallback(() => {
    clearStoredResources();
    setCampuses(INITIAL_CAMPUSES);
    setSalles(INITIAL_SALLES);
    setEnseignants(INITIAL_ENSEIGNANTS);
    setGroupes(INITIAL_GROUPES);
    setModules(INITIAL_MODULES);
    setElements(INITIAL_ELEMENTS);
    setSeances(INITIAL_SEANCES);
    setIsCustomScenario(false);
  }, []);

  return (
    <TimetableContext.Provider
      value={{
        campuses,
        salles,
        enseignants,
        filieres,
        options,
        groupes,
        modules,
        elements,
        seances,
        stats,
        verificationReport,
        isCustomScenario,
        addOrUpdateSalle,
        deleteSalle,
        addOrUpdateEnseignant,
        deleteEnseignant,
        addOrUpdateGroupe,
        deleteGroupe,
        addOrUpdateSeance,
        deleteSeance,
        injectTestConflictScenario,
        resetToInitialData,
      }}
    >
      {children}
    </TimetableContext.Provider>
  );
}

export function useTimetable() {
  const context = useContext(TimetableContext);
  if (!context) {
    throw new Error('useTimetable doit être utilisé à l’intérieur de TimetableProvider');
  }
  return context;
}
