"use client";

import { useState } from "react";
import { ApiClient } from "@/lib/api-client";
import { Modal } from "@/components/ui/modal";
import type { AutoPlanificationRequest, ExamenDto, SessionExamen } from "@/types/exams";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (examens: ExamenDto[]) => void;
}

export function AutoPlanificationModal({ open, onClose, onSuccess }: Props) {
  const [dateDebut, setDateDebut] = useState("2026-06-15");
  const [nombreJours, setNombreJours] = useState(5);
  const [maxModulesParJour, setMaxModulesParJour] = useState(1);
  const [session, setSession] = useState<SessionExamen>("NORMALE");
  const [unSurDeux, setUnSurDeux] = useState(true);
  const [inclureSamedi, setInclureSamedi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload: AutoPlanificationRequest = {
      dateDebut,
      nombreJours: Number(nombreJours),
      maxModulesParJour: Number(maxModulesParJour),
      session,
      unSurDeux,
      inclureSamedi,
    };

    try {
      const scheduled = await ApiClient.post<ExamenDto[]>("/examens/auto-planifier", payload);
      onSuccess(scheduled || []);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'auto-planification des examens.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Planification Automatique des Examens (Solveur de Session)"
      busy={loading}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Le solveur ordonnance automatiquement l&apos;ensemble des épreuves en respectant la durée de session,
          le décalage entre examens, la capacité des salles et l&apos;absence totale de collision.
        </p>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Date de début de session
            </label>
            <input
              type="date"
              required
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Durée de session (en jours)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              required
              value={nombreJours}
              onChange={(e) => setNombreJours(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Max modules / jour par groupe
            </label>
            <select
              value={maxModulesParJour}
              onChange={(e) => setMaxModulesParJour(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
            >
              <option value={1}>1 module par jour (Recommandé - Évite la surcharge)</option>
              <option value={2}>2 modules par jour max</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Type de session
            </label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value as SessionExamen)}
              className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
            >
              <option value="NORMALE">Session Normale</option>
              <option value="RATTRAPAGE">Session de Rattrapage</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={unSurDeux}
              onChange={(e) => setUnSurDeux(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="font-medium">
              Distribution automatique des tables 1 place sur 2 (Anti-triche & non-voisinage)
            </span>
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={inclureSamedi}
              onChange={(e) => setInclureSamedi(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Programmer également des épreuves le samedi</span>
          </label>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-800 dark:text-zinc-200 font-medium text-xs rounded-lg transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Planification CP-SAT en cours…
              </>
            ) : (
              "Lancer l'auto-planification"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
