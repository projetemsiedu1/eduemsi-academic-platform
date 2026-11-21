"use client";

import { useEffect, useState, useCallback } from "react";
import { ApiClient } from "@/lib/api-client";
import { Modal } from "@/components/ui/modal";
import type { ExamenDto, ExamenAffectation } from "@/types/exams";

interface Props {
  open: boolean;
  onClose: () => void;
  examen: ExamenDto | null;
}

export function ExamenDistributionModal({ open, onClose, examen }: Props) {
  const [places, setPlaces] = useState<ExamenAffectation[]>([]);
  const [loading, setLoading] = useState(false);
  const [distributing, setDistributing] = useState(false);
  const [unSurDeux, setUnSurDeux] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPlaces = useCallback(async (examenId: number) => {
    setLoading(true);
    setError("");
    try {
      const data = await ApiClient.get<ExamenAffectation[]>(`/examens/${examenId}/places`);
      setPlaces(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement des places");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && examen) {
      void loadPlaces(examen.id);
      setSuccess("");
    } else {
      setPlaces([]);
    }
  }, [open, examen, loadPlaces]);

  const handleDistribuer = async () => {
    if (!examen) return;
    setDistributing(true);
    setError("");
    setSuccess("");
    try {
      const result = await ApiClient.post<ExamenAffectation[]>(
        `/examens/${examen.id}/distribuer-places?unSurDeux=${unSurDeux}`,
        {}
      );
      setPlaces(result || []);
      setSuccess(`Répartition réussie : ${result.length} étudiants affectés et notifiés.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la distribution des places.");
    } finally {
      setDistributing(false);
    }
  };

  if (!examen) return null;

  const convoquesCount = places.filter(p => p.statutPresence === "CONVOQUE").length;
  const radiesCount = places.filter(p => p.estRadie || p.statutPresence === "RADIE").length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Plan de Salle & Distribution des Tables — ${examen.codeModule || "Examen"}`}
      busy={distributing}
    >
      <div className="space-y-4 text-sm">
        {/* En-tête informatif de l'épreuve */}
        <div className="bg-slate-50 dark:bg-zinc-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 dark:text-zinc-400 block font-medium">Module</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-100">{examen.intituleModule}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-zinc-400 block font-medium">Groupe & Salle</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-100">
              {examen.codeGroupe} → Salle {examen.codeSalle} ({examen.capaciteSalle} places)
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-zinc-400 block font-medium">Horaire</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-100">
              {examen.dateExamen} ({examen.heureDebut} - {examen.heureFin})
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-zinc-400 block font-medium">Surveillant</span>
            <span className="font-semibold text-slate-800 dark:text-zinc-100">{examen.surveillantPrincipalNom}</span>
          </div>
        </div>

        {/* Contrôles et options de distribution */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="unSurDeux"
              checked={unSurDeux}
              onChange={(e) => setUnSurDeux(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="unSurDeux" className="text-xs font-medium text-emerald-900 dark:text-emerald-200">
              Espacement 1 place sur 2 (Anti-triche & non-voisinage)
            </label>
          </div>

          <button
            onClick={handleDistribuer}
            disabled={distributing}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
          >
            {distributing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Distribution en cours…
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Générer la répartition des tables
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg">
            {success}
          </div>
        )}

        {/* Statistiques d'affectation */}
        <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
          <div className="p-2.5 bg-slate-100 dark:bg-zinc-800 rounded-lg">
            <span className="text-slate-500 dark:text-zinc-400 block">Total Inscrits</span>
            <span className="font-bold text-slate-800 dark:text-zinc-100 text-base">{places.length}</span>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-100 dark:border-emerald-900">
            <span className="text-emerald-700 dark:text-emerald-300 block">Convoqués aux tables</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300 text-base">{convoquesCount}</span>
          </div>
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-100 dark:border-rose-900">
            <span className="text-rose-700 dark:text-rose-300 block">Radiés (&gt;20% absences)</span>
            <span className="font-bold text-rose-700 dark:text-rose-300 text-base">{radiesCount}</span>
          </div>
        </div>

        {/* Liste détaillée des places attribuées */}
        <div className="border border-slate-200 dark:border-zinc-700 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Chargement des affectations…</div>
          ) : places.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              Aucune place encore générée. Cliquez sur &quot;Générer la répartition des tables&quot;.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 uppercase sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Numéro Table</th>
                  <th className="py-2.5 px-3">Étudiant</th>
                  <th className="py-2.5 px-3">Matricule</th>
                  <th className="py-2.5 px-3">Groupe</th>
                  <th className="py-2.5 px-3">Statut</th>
                  <th className="py-2.5 px-3">Notification Espace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-zinc-700">
                {places.map((place) => (
                  <tr
                    key={place.id}
                    className={`hover:bg-slate-50 dark:hover:bg-zinc-800/40 ${
                      place.estRadie ? "bg-rose-50/50 dark:bg-rose-950/20" : ""
                    }`}
                  >
                    <td className="py-2 px-3 font-bold text-slate-900 dark:text-zinc-100">
                      {place.numeroPlace > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-semibold">
                          Table N° {place.numeroPlace}
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-medium">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-800 dark:text-zinc-200">
                      {place.etudiantPrenom} {place.etudiantNom}
                    </td>
                    <td className="py-2 px-3 text-slate-500 dark:text-zinc-400">{place.etudiantMatricule}</td>
                    <td className="py-2 px-3 text-slate-600 dark:text-zinc-300">{place.groupeCode}</td>
                    <td className="py-2 px-3">
                      {place.estRadie ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
                          Radié (&gt;20%)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                          Convoqué
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Actif dans l’espace étudiant
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-200 font-medium text-xs rounded-lg transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}
