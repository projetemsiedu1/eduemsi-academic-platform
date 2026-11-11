'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  MapPin,
  Printer,
  ChevronDown,
  School,
} from 'lucide-react';
import { useTimetable } from '@/context/TimetableContext';
import { TimetableHeader } from '@/components/timetable/TimetableHeader';
import { ScheduleGrid } from '@/components/timetable/ScheduleGrid';
import { CRENEAUX_OFFICIELS_EMSI, JOURS_SEMAINE } from '@/types/timetable';

export default function GroupSchedulePage() {
  const { groupes, filieres, options, campuses, seances, salles, enseignants, elements, modules } =
    useTimetable();

  // Sélecteur en cascade
  const [selectedGroupeId, setSelectedGroupeId] = useState<string>(groupes[0]?.id || '');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Groupe actif
  const activeGroupe = useMemo(() => {
    return groupes.find((g) => g.id === selectedGroupeId) || groupes[0];
  }, [groupes, selectedGroupeId]);

  const activeFiliere = useMemo(() => {
    return filieres.find((f) => f.id === activeGroupe?.filiereId);
  }, [filieres, activeGroupe]);

  const activeOption = useMemo(() => {
    return options.find((o) => o.id === activeGroupe?.optionId);
  }, [options, activeGroupe]);

  const activeCampus = useMemo(() => {
    return campuses.find((c) => c.id === activeGroupe?.campusFixeId);
  }, [campuses, activeGroupe]);

  // Séances du groupe sélectionné
  const groupeSeances = useMemo(() => {
    if (!activeGroupe) return [];
    return seances.filter((s) => s.groupeId === activeGroupe.id);
  }, [seances, activeGroupe]);

  // Calcul du volume hebdomadaire
  const totalHeuresHebdo = useMemo(() => {
    return groupeSeances.length * 1.5;
  }, [groupeSeances]);

  // Mapping pour le gabarit officiel d'impression
  const salleMap = new Map(salles.map((s) => [s.id, s]));
  const enseignantMap = new Map(enseignants.map((e) => [e.id, e]));
  const elementMap = new Map(elements.map((el) => [el.id, el]));
  const moduleMap = new Map(modules.map((m) => [m.id, m]));

  const seancesMatrix = useMemo(() => {
    const map = new Map<string, typeof seances[0]>();
    groupeSeances.forEach((s) => {
      map.set(`${s.jourSemaine}__${s.numeroCreneau}`, s);
    });
    return map;
  }, [groupeSeances]);

  return (
    <div className="flex flex-col min-h-screen">
      <TimetableHeader
        title="Emploi du Temps par Groupe"
        subtitle="Consultation hebdomadaire dynamique des cours, TD et TP pour chaque promotion"
      />

      <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* BARRE DE SELECTION INTERACTIVE EN CASCADE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emsi-primary flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Sélectionnez la Promotion &amp; le Groupe
                </h3>
                <p className="text-xs text-slate-500">
                  Le planning ci-dessous s’actualise instantanément en fonction du groupe choisi
                </p>
              </div>
            </div>

            {/* SÉLECTEUR INTERACTIF */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600 shrink-0">Groupe Actif :</label>
                <div className="relative">
                  <select
                    value={selectedGroupeId}
                    onChange={(e) => setSelectedGroupeId(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 rounded-xl border-2 border-emsi-primary/40 focus:border-emsi-primary focus:outline-none text-xs font-extrabold text-slate-900 bg-emerald-50/50 cursor-pointer shadow-xs"
                  >
                    {groupes.map((grp) => {
                      const campus = campuses.find((c) => c.id === grp.campusFixeId);
                      return (
                        <option key={grp.id} value={grp.id}>
                          {grp.codeGroupe} ({campus?.code || 'Campus'}) — {grp.effectif} étudiants
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* BOUTON EXPORT / IMPRESSION OFFICIELLE */}
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Gabarit Officiel A4</span>
              </button>
            </div>
          </div>

          {/* FICHE D'IDENTITÉ DU GROUPE ACTIF */}
          {activeGroupe && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block">CAMPUS ASSIGNÉ</span>
                <span className="font-extrabold text-slate-900 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emsi-primary" />
                  {activeCampus?.nom}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block">FORMATION / OPTION</span>
                <span className="font-extrabold text-slate-900">
                  {activeFiliere?.codeFiliere} {activeGroupe.anneeEtude}e Année{' '}
                  {activeOption ? `• ${activeOption.codeOption}` : ''}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block">EFFECTIF ÉTUDIANTS</span>
                <span className="font-extrabold text-slate-900">
                  {activeGroupe.effectif} inscrits (Délégué : {activeGroupe.delegueNom})
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block">CHARGE HEBDOMADAIRE</span>
                <span className="font-extrabold text-emsi-primary">
                  {groupeSeances.length} séances ({totalHeuresHebdo} heures / sem.)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* AFFICHAGE DE LA GRILLE HEBDOMADAIRE */}
        <ScheduleGrid
          seances={groupeSeances}
          viewMode="groupe"
          activeEntityTitle={`Emploi du Temps : Promotion ${activeGroupe?.codeGroupe || ''}`}
          activeEntitySubtitle={`${activeFiliere?.intitule} • Semestre 1 • Année Universitaire 2026-2027`}
          campusName={activeCampus?.nom}
        />
      </main>

      {/* MODAL GABARIT IMPRESSION OFFICIELLE EMSI FORMAT A4 PAYSAGE */}
      {isPrintModalOpen && activeGroupe && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-5xl w-full p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95">
            {/* ACTION BAR */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-emsi-primary" />
                <h3 className="font-black text-slate-900 text-base">
                  Gabarit d&apos;Impression Conforme EMSI (Format Officiel A4)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emsi-primary hover:bg-emsi-dark text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer / PDF</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Fermer
                </button>
              </div>
            </div>

            {/* FEUILLE IMPRIMABLE CONFORME AU FORMAT PHYSIQUE DE L'EMSI */}
            <div className="border border-slate-300 p-6 bg-white rounded-xl text-slate-900 font-sans shadow-xs">
              {/* EN-TÊTE OFFICIEL */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emsi-primary flex items-center justify-center text-white font-black text-lg">
                    E
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-emerald-900 leading-tight">
                      ÉCOLE MAROCAINE DES SCIENCES DE L&apos;INGÉNIEUR
                    </h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      Membre de HONORIS UNITED UNIVERSITIES • Campus {activeCampus?.code}
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <h2 className="text-xl font-black text-slate-900 tracking-wider uppercase">
                    EMPLOI DU TEMPS
                  </h2>
                  <p className="text-[11px] font-bold text-slate-600">Semestre 1 • 2026-2027</p>
                </div>

                <div className="text-right text-[11px]">
                  <p className="font-black text-slate-900">Groupe : {activeGroupe.codeGroupe}</p>
                  <p className="text-slate-500">Effectif : {activeGroupe.effectif} étudiants</p>
                </div>
              </div>

              {/* TABLEAU CONDENSÉ A4 */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-900 text-[10px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-900 font-black text-center">
                      <th className="border border-slate-900 p-1.5 w-16">JOURS</th>
                      {CRENEAUX_OFFICIELS_EMSI.map((c) => (
                        <th key={c.code} className="border border-slate-900 p-1.5">
                          <span className="block font-black text-slate-900">S{c.numero}</span>
                          <span className="text-[9px] font-mono text-slate-600">
                            {c.heureDebut} à {c.heureFin}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {JOURS_SEMAINE.map((jour) => (
                      <tr key={jour.code} className="border-b border-slate-900">
                        <td className="border border-slate-900 p-2 font-black text-center bg-slate-50">
                          {jour.label}
                        </td>
                        {CRENEAUX_OFFICIELS_EMSI.map((creneau) => {
                          const s = seancesMatrix.get(`${jour.code}__${creneau.code}`);
                          const elem = s ? elementMap.get(s.elementModuleId) : null;
                          const mod = elem ? moduleMap.get(elem.moduleId) : null;
                          const sal = s ? salleMap.get(s.salleId) : null;
                          const ens = s ? enseignantMap.get(s.enseignantId) : null;

                          return (
                            <td
                              key={creneau.code}
                              className="border border-slate-900 p-1.5 text-center h-14 align-middle"
                            >
                              {s ? (
                                <div className="space-y-0.5">
                                  <span className="font-black text-slate-900 block leading-tight">
                                    {mod?.codeModule} ({elem?.typeElement})
                                  </span>
                                  <span className="text-[9px] font-bold text-blue-700 block truncate">
                                    Pr. {ens?.nom}
                                  </span>
                                  <span className="text-[9px] font-mono font-black text-emerald-800 bg-emerald-50 px-1 rounded block">
                                    {sal?.codeSalle}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-300 text-[9px] italic">---</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PIED DE PAGE AUTHENTIQUE */}
              <div className="mt-4 pt-3 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200">
                <p>Document généré par la Plateforme EMSI Univora • Moteur d’Optimisation CP-SAT</p>
                <div className="font-bold text-slate-700 uppercase">
                  Service de Planification &amp; de la Scolarité
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
