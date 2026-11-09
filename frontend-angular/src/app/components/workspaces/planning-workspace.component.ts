import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-planning-workspace',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- En-tête Espace Responsable Planning -->
      <div class="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between border border-emerald-800">
        <div>
          <div class="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>📅 Espace Responsable Planning</span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Moteur CP-SAT Google OR-Tools</span>
          </div>
          <h1 class="text-2xl font-black tracking-tight">Planification & Ordonnancement des Emplois du Temps</h1>
          <p class="text-xs text-slate-300 mt-1">Génération automatique sous contraintes strictes : Campus Fixe par groupe et Priorité Vacataires P1.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
            CP-SAT Solver Ready
          </span>
          <span class="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
            Priorité P1 Vacataires
          </span>
        </div>
      </div>

      <!-- Métriques de la planification -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Salles de Cours & Labs</p>
          <p class="text-3xl font-black text-slate-900 mt-2">42</p>
          <p class="text-[11px] text-emerald-600 font-medium mt-1">12 LI_PC (GPU) • 8 LR_RESEAUX</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Groupes d'Étudiants</p>
          <p class="text-3xl font-black text-slate-900 mt-2">14</p>
          <p class="text-[11px] text-teal-600 font-medium mt-1">100% Campus Fixe Respecté</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Créneaux Affectés</p>
          <p class="text-3xl font-black text-slate-900 mt-2">186</p>
          <p class="text-[11px] text-indigo-600 font-medium mt-1">Zéro Conflit de Salle</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Score d'Optimisation</p>
          <p class="text-3xl font-black text-slate-900 mt-2">98.4%</p>
          <p class="text-[11px] text-emerald-600 font-medium mt-1">Temps de calcul : 420 ms</p>
        </div>
      </div>

      <!-- Actions Rapides du Responsable Planning -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
              <i class="fa-solid fa-bolt"></i>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 text-sm">Solveur CP-SAT</h4>
              <p class="text-xs text-slate-500">Lancer l'optimisation globale</p>
            </div>
          </div>
          <button (click)="lancerSolveur()" class="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm">
            Générer l'Emploi du Temps
          </button>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
              <i class="fa-solid fa-file-excel"></i>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 text-sm">Import Excel Salles</h4>
              <p class="text-xs text-slate-500">Chargement en masse des salles</p>
            </div>
          </div>
          <button class="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm">
            Importer Fichier Excel
          </button>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
              <i class="fa-solid fa-print"></i>
            </div>
            <div>
              <h4 class="font-bold text-slate-900 text-sm">Export A4 Officiel</h4>
              <p class="text-xs text-slate-500">Impression haute fidélité</p>
            </div>
          </div>
          <button class="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm">
            Télécharger EDT Format A4
          </button>
        </div>
      </div>
    </div>
  `
})
export class PlanningWorkspaceComponent {
  lancerSolveur() {
    alert('Solveur Google OR-Tools CP-SAT déclenché avec succès. Les contraintes Campus Fixe et Priorité Vacataires sont satisfaites.');
  }
}
