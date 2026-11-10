'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  Briefcase,
  DoorOpen,
  Laptop,
  BookOpen,
  Building,
  CalendarDays,
  Sliders,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { useTimetable } from '@/context/TimetableContext';
import { TimetableHeader } from '@/components/timetable/TimetableHeader';
import { StatsCard } from '@/components/timetable/StatsCard';

export default function TimetableDashboardPage() {
  const { stats, verificationReport, campuses, salles, groupes } =
    useTimetable();

  const sallesCentre = salles.filter((s) => s.campusId === 'camp-centre').length;
  const sallesTarga = salles.filter((s) => s.campusId === 'camp-targa').length;

  return (
    <div className="flex flex-col min-h-screen">
      <TimetableHeader
        title="Tableau de Bord — Emplois du Temps"
        subtitle="Supervision globale des ressources académiques et statut d'optimisation CP-SAT"
      />

      <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* BANNIÈRE DE STATUT SOLVEUR & CONFLITS */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            verificationReport.estConforme
              ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white border-emerald-500/30 shadow-lg shadow-emerald-950/20'
              : 'bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 text-white border-rose-500/40 shadow-lg shadow-rose-950/20'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    verificationReport.estConforme
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-400/30 animate-pulse'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {verificationReport.estConforme
                    ? 'Solveur CP-SAT : Solution Optimale Validée'
                    : 'Alerte : Conflit de Contraintes Détecté'}
                </span>
                <span className="text-xs text-slate-300">
                  • {stats.nbSeancesTotal} séances planifiées
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white">
                {verificationReport.estConforme
                  ? 'Toutes les contraintes d’or de l’EMSI sont strictement satisfaites'
                  : `${verificationReport.conflits.length} anomalie(s) identifiée(s) par le vérificateur de contraintes`}
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {verificationReport.estConforme
                  ? 'Priorité absolue vacataires, unicité de campus journalier, quotas 18h, pauses 15 min et affectation des salles TP respectées.'
                  : 'Des séances enfreignent les contraintes obligatoires. Consultez la page Contraintes & Solveur pour le diagnostic détaillé.'}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/timetable/constraints"
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  verificationReport.estConforme
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-900/40'
                    : 'bg-rose-500 hover:bg-rose-400 text-white shadow-md shadow-rose-900/40'
                }`}
              >
                <span>Consulter le Solveur</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* 7 KPIS OBLIGATOIRES CALCULÉS DYNAMIQUEMENT */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Indicateurs Clés des Ressources (Calculés Dynamiquement)
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">
              Source : Jeu de données centralisé
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Groupes */}
            <StatsCard
              title="Groupes Étudiants"
              value={stats.nbGroupes}
              subtitle="Promotions 3IIR & 5IIR (Options 2DSI)"
              icon={Users}
              variant="emerald"
              badge="Actifs"
              href="/timetable/groups"
            />

            {/* 2. Enseignants */}
            <StatsCard
              title="Corps Enseignant"
              value={stats.nbEnseignants}
              subtitle={`${stats.nbPermanents} permanents (18h) • ${stats.nbVacataires} vacataires`}
              icon={GraduationCap}
              variant="blue"
              badge={`${stats.nbPermanents} Perm.`}
              href="/timetable/teachers"
            />

            {/* 3. Vacataires */}
            <StatsCard
              title="Enseignants Vacataires"
              value={stats.nbVacataires}
              subtitle="Priorité 1 absolue dans le solveur CP-SAT"
              icon={Briefcase}
              variant="purple"
              badge="Priorité 1"
              href="/timetable/teachers"
            />

            {/* 4. Salles */}
            <StatsCard
              title="Salles d'Enseignement"
              value={stats.nbSalles}
              subtitle={`${sallesCentre} Campus Centre • ${sallesTarga} Campus Targa`}
              icon={DoorOpen}
              variant="slate"
              badge={`${stats.tauxOccupationSallesPct}% occup.`}
              href="/timetable/resources"
            />

            {/* 5. Salles TP */}
            <StatsCard
              title="Laboratoires TP PC"
              value={stats.nbSallesTP}
              subtitle="Salles équipées de PC haute performance"
              icon={Laptop}
              variant="emerald"
              badge="PC Dell/HP"
              href="/timetable/resources"
            />

            {/* 6. Modules */}
            <StatsCard
              title="Modules Pédagogiques"
              value={stats.nbModules}
              subtitle="Architecture Web, Spring, Big Data, IA, Réseaux"
              icon={BookOpen}
              variant="blue"
              badge="Semestre 1"
              href="/timetable/resources"
            />

            {/* 7. Campus */}
            <StatsCard
              title="Campus EMSI"
              value={stats.nbCampus}
              subtitle="Campus Centre (Guéliz) & Campus Targa"
              icon={Building}
              variant="amber"
              badge="Marrakech"
              href="/timetable/resources"
            />

            {/* 8. Séances Hebdomadaires */}
            <StatsCard
              title="Séances Planifiées"
              value={stats.nbSeancesTotal}
              subtitle="Créneaux de 1h30 du Lundi au Samedi"
              icon={CalendarDays}
              variant="emerald"
              badge="S1 à S6"
              href="/timetable/groups"
            />
          </div>
        </div>

        {/* ACCÈS RAPIDES AUX AUTRES MODULES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* CARTE ACCES GESTION RESSOURCES */}
          <Link
            href="/timetable/resources"
            className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-emsi-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emsi-primary flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-emsi-primary transition-colors">
                Gestion des Ressources
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Consultez, filtrez et modifiez les campus, salles, enseignants, filières et groupes
                avec le formulaire interactif.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emsi-primary">
              <span>Gérer les ressources</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* CARTE ACCES PLANNINGS GROUPES & PROFS */}
          <Link
            href="/timetable/groups"
            className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500/40 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                Emplois du Temps (Groupes &amp; Enseignants)
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Visualisez la grille hebdomadaire de 6 jours (S1 à S6) avec filtres dynamiques et
                gabarit d’impression officiel EMSI.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
              <span>Voir les emplois du temps</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* CARTE ACCES CONTRAINTES & SOLVEUR */}
          <Link
            href="/timetable/constraints"
            className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-500/40 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                <Sliders className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-amber-700 transition-colors">
                Contraintes &amp; Moteur CP-SAT
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Consultez les 7 contraintes d’or EMSI, les préférences souples et lancez le
                détecteur de conflits temps réel.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
              <span>Explorer le solveur</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* DETAILS ET REGLES METIERS EMSI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* SYNTHESE DES CAMPUS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emsi-primary" />
                <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  Répartition Géographique des Campus
                </h4>
              </div>
              <span className="text-[10px] font-bold text-slate-400">Marrakech</span>
            </div>

            <div className="space-y-3 text-xs">
              {campuses.map((campus) => {
                const campusSalles = salles.filter((s) => s.campusId === campus.id);
                const campusGroupes = groupes.filter((g) => g.campusFixeId === campus.id);
                const campusTp = campusSalles.filter((s) => s.typeSalle === 'LI_PC').length;

                return (
                  <div
                    key={campus.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900">{campus.nom}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white rounded border border-slate-200 text-slate-600 font-bold">
                            {campus.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{campus.adresse}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {campusGroupes.length} groupe(s) assigné(s)
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-200/60 text-center text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">SALLES</span>
                        <span className="font-black text-slate-800">{campusSalles.length}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">LABS TP PC</span>
                        <span className="font-black text-emerald-600">{campusTp}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">ÉTAGES</span>
                        <span className="font-black text-slate-800">{campus.etages.length}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RÈGLES DE PLANIFICATION CLÉS */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                    Contraintes d’Or EMSI Appliquées
                  </h4>
                </div>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  7 Règles Actives
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {verificationReport.resumeParRegle.map((item, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                      item.conforme
                        ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950 font-medium'
                        : 'bg-rose-50 border-rose-300 text-rose-950 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          item.conforme ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'
                        }`}
                      />
                      <span className="text-xs">{item.regle}</span>
                    </div>
                    {item.conforme ? (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        CONFORME
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                        {item.nbViolations} violation(s)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Créneaux réglementaires : 08h30 à 18h45</span>
              <span className="font-bold text-emsi-primary">Pauses 15 min incluses</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
