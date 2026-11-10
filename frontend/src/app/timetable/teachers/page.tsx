'use client';

import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  ChevronDown,
} from 'lucide-react';
import { useTimetable } from '@/context/TimetableContext';
import { TimetableHeader } from '@/components/timetable/TimetableHeader';
import { ScheduleGrid } from '@/components/timetable/ScheduleGrid';

export default function TeacherSchedulePage() {
  const { enseignants, seances, salles, campuses, groupes } = useTimetable();

  const [selectedEnseignantId, setSelectedEnseignantId] = useState<string>(
    enseignants[0]?.id || ''
  );

  const activeEnseignant = useMemo(() => {
    return (
      enseignants.find((e) => e.id === selectedEnseignantId) || enseignants[0]
    );
  }, [enseignants, selectedEnseignantId]);

  // SÉANCES REELLES PROVENANT DE LA MÊME SOURCE COMMUNE
  const enseignantSeances = useMemo(() => {
    if (!activeEnseignant) return [];
    return seances.filter((s) => s.enseignantId === activeEnseignant.id);
  }, [seances, activeEnseignant]);

  // Calcul des métriques hebdomadaires
  const heuresPlanifiees = useMemo(() => {
    return enseignantSeances.length * 1.5;
  }, [enseignantSeances]);

  const quotaContractuel = activeEnseignant?.heuresContractuellesSemaine || 18;

  // Groupes pris en charge
  const groupesPrisEnCharge = useMemo(() => {
    const grpIds = new Set(enseignantSeances.map((s) => s.groupeId));
    return Array.from(grpIds)
      .map((id) => groupes.find((g) => g.id === id)?.codeGroupe)
      .filter(Boolean);
  }, [enseignantSeances, groupes]);

  // Campus fréquentés
  const campusFrequentes = useMemo(() => {
    const cIds = new Set<string>();
    enseignantSeances.forEach((s) => {
      const sal = salles.find((room) => room.id === s.salleId);
      if (sal) cIds.add(sal.campusId);
    });
    return Array.from(cIds)
      .map((id) => campuses.find((c) => c.id === id)?.nom)
      .filter(Boolean);
  }, [enseignantSeances, salles, campuses]);

  return (
    <div className="flex flex-col min-h-screen">
      <TimetableHeader
        title="Planning par Enseignant"
        subtitle="Suivi individuel de charge, créneaux d'enseignement et affectations de salles"
      />

      <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* BARRE DE SELECTION INTERACTIVE DE L'ENSEIGNANT */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Sélectionnez un Enseignant
                </h3>
                <p className="text-xs text-slate-500">
                  Cette vue est rigoureusement synchronisée avec les emplois du temps des groupes
                </p>
              </div>
            </div>

            {/* SÉLECTEUR D'ENSEIGNANT */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600 shrink-0">Professeur :</label>
              <div className="relative">
                <select
                  value={selectedEnseignantId}
                  onChange={(e) => setSelectedEnseignantId(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 rounded-xl border-2 border-blue-500/40 focus:border-blue-600 focus:outline-none text-xs font-extrabold text-slate-900 bg-blue-50/50 cursor-pointer shadow-xs"
                >
                  {enseignants.map((ens) => (
                    <option key={ens.id} value={ens.id}>
                      Pr. {ens.prenom} {ens.nom} ({ens.typeContrat === 'VACATAIRE' ? 'Vacataire' : 'Permanent'})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* FICHE SYNTHÈSE CHARGE PROFESSEUR */}
          {activeEnseignant && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block">STATUT &amp; MATRICULE</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`font-black px-2 py-0.5 rounded text-[10px] ${
                      activeEnseignant.typeContrat === 'VACATAIRE'
                        ? 'bg-purple-100 text-purple-900'
                        : 'bg-blue-100 text-blue-900'
                    }`}
                  >
                    {activeEnseignant.typeContrat}
                  </span>
                  <span className="font-mono text-slate-500 font-bold">
                    {activeEnseignant.matricule}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block">CHARGE HEBDOMADAIRE</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {heuresPlanifiees}h{' '}
                  <span className="text-slate-400 text-xs font-normal">
                    / {quotaContractuel}h quota
                  </span>
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block">GROUPES ATTRIBUÉS</span>
                <span className="font-extrabold text-slate-900 truncate block">
                  {groupesPrisEnCharge.length > 0
                    ? groupesPrisEnCharge.join(', ')
                    : 'Aucun groupe assigné'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block">CAMPUS D&apos;INTERVENTION</span>
                <span className="font-extrabold text-slate-900 truncate block">
                  {campusFrequentes.length > 0 ? campusFrequentes.join(' & ') : 'En attente'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* AFFICHAGE DU PLANNING ENSEIGNANT */}
        <ScheduleGrid
          seances={enseignantSeances}
          viewMode="enseignant"
          activeEntityTitle={`Planning d'Enseignement : Pr. ${activeEnseignant?.prenom || ''} ${activeEnseignant?.nom || ''}`}
          activeEntitySubtitle={`${activeEnseignant?.specialite} • ${activeEnseignant?.typeContrat === 'VACATAIRE' ? 'Vacataire Industriel (Priorité 1)' : 'Permanent EMSI (18h)'}`}
        />
      </main>
    </div>
  );
}
