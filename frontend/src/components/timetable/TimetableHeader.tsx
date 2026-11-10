'use client';

import React from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Menu,
  School,
  FlaskConical,
} from 'lucide-react';
import { useTimetable } from '@/context/TimetableContext';

interface TimetableHeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileMenu?: () => void;
}

export function TimetableHeader({ title, subtitle, onOpenMobileMenu }: TimetableHeaderProps) {
  const { verificationReport, injectTestConflictScenario, resetToInitialData, isCustomScenario } =
    useTimetable();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* TITRE ET CONTEXTE */}
        <div className="flex items-center gap-3">
          {onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <School className="w-3 h-3 text-emsi-primary" />
                EMSI Marrakech • S1 2026-2027
              </span>
            </div>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* ACTIONS DE DEMONSTRATION RAPIDES */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* BADGE DE STATUT DE CONFLITS */}
          <Link
            href="/timetable/constraints"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              verificationReport.estConforme
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                : 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 animate-pulse'
            }`}
          >
            {verificationReport.estConforme ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emsi-primary" />
                <span>0 Conflit Détecté</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>{verificationReport.conflits.length} Conflit(s) à Corriger</span>
              </>
            )}
          </Link>

          {/* BOUTON INJECTER CONFLIT TEST */}
          <button
            onClick={injectTestConflictScenario}
            title="Injecte une collision d'horaire pour tester le moteur de vérification"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              isCustomScenario
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
            <span>{isCustomScenario ? 'Conflit Injecté' : 'Tester un conflit'}</span>
          </button>

          {/* REINITIALISER DEMO */}
          <button
            onClick={resetToInitialData}
            title="Réinitialise toutes les ressources et séances aux valeurs d’origine"
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Réinitialiser</span>
          </button>
        </div>
      </div>
    </header>
  );
}

