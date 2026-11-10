'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  Users,
  GraduationCap,
  Sliders,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Building2,
  CalendarCheck,
} from 'lucide-react';
import { useTimetable } from '@/context/TimetableContext';

interface TimetableSidebarProps {
  onCloseMobile?: () => void;
}

export function TimetableSidebar({ onCloseMobile }: TimetableSidebarProps) {
  const pathname = usePathname();
  const { verificationReport } = useTimetable();

  const navLinks = [
    {
      href: '/timetable',
      label: 'Tableau de bord',
      description: 'KPIs & synthèse du module',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: '/timetable/resources',
      label: 'Ressources Académiques',
      description: 'Campus, salles, enseignants, groupes',
      icon: Layers,
    },
    {
      href: '/timetable/groups',
      label: 'Planning par Groupe',
      description: 'Grilles de cours hebdomadaires',
      icon: Users,
    },
    {
      href: '/timetable/teachers',
      label: 'Planning par Enseignant',
      description: 'Charge & créneaux des professeurs',
      icon: GraduationCap,
    },
    {
      href: '/timetable/constraints',
      label: 'Contraintes & Solveur',
      description: 'Règles d’or & vérificateur live',
      icon: Sliders,
      badge: verificationReport.estConforme ? '0 conflit' : `${verificationReport.conflits.length} conflits`,
      badgeColor: verificationReport.estConforme ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800',
    },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 shadow-sm">
      {/* BRANDING HEADER */}
      <div className="p-5 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emsi-primary to-emsi-dark flex items-center justify-center shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-lg tracking-wider">E</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-slate-900 text-lg leading-tight">
                EMSI <span className="text-emsi-primary">Univora</span>
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
              Optimisation Emplois du Temps
            </p>
          </div>
        </Link>
      </div>

      {/* NAVIGATION DU MODULE */}
      <div className="p-3">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Module Emplois du Temps
        </p>
        <nav className="space-y-1">
          {navLinks.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emsi-primary to-emerald-700 text-white shadow-sm shadow-emerald-900/15'
                    : 'text-slate-600 hover:bg-emerald-50/70 hover:text-emsi-primary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emsi-primary'}`} />
                  <div>
                    <span className="block leading-snug">{item.label}</span>
                  </div>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {!item.badge && (
                  <ChevronRight
                    className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                      isActive ? 'opacity-100 text-white/70' : 'text-slate-400'
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* LIENS COMPLEMENTAIRES PLATEFORME */}
      <div className="flex-1 p-3 border-t border-slate-100 overflow-y-auto">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Plateforme Académique
        </p>
        <div className="space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Portail Général Univora
          </Link>
          <div className="px-3 py-2 text-xs text-slate-400 flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Campus : Centre &amp; Targa</span>
          </div>
          <div className="px-3 py-2 text-xs text-slate-400 flex items-center gap-2">
            <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Semestre 1 • 2026-2027</span>
          </div>
        </div>
      </div>

      {/* FOOTER BADGE SOLVER */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="bg-gradient-to-br from-emerald-50 to-amber-50 rounded-xl p-3 border border-emerald-200/60 shadow-xs">
          <div className="flex items-center gap-2 text-emsi-primary font-bold text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Moteur OR-Tools CP-SAT</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Optimisation mathématique par contraintes dures et fonctions de coût EMSI.
          </p>
          <div className="mt-2 pt-2 border-t border-emerald-100 flex items-center justify-between text-[10px]">
            <span className="font-semibold text-slate-500">Statut local :</span>
            <span
              className={`font-bold px-1.5 py-0.5 rounded ${
                verificationReport.estConforme ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'
              }`}
            >
              {verificationReport.estConforme ? 'Certifié Optimal' : 'Conflit Détecté'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

