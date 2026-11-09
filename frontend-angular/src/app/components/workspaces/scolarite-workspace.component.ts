import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-scolarite-workspace',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- En-tête Espace Responsable Scolarité -->
      <div class="bg-gradient-to-r from-rose-950 via-red-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between border border-rose-800">
        <div>
          <div class="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>📋 Espace Responsable Scolarité</span>
            <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            <span>Contrôle Assiduité & Seuil Éliminatoire 20%</span>
          </div>
          <h1 class="text-2xl font-black tracking-tight">Registre d'Émargement & Gestion des Absences</h1>
          <p class="text-xs text-slate-300 mt-1">Application rigoureuse de la règle des 20% (ou 18 heures maximum) d'absences éliminatoires aux examens.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold">
            Seuil Élimination : 20% / 18h
          </span>
          <span class="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
            Registre Temps Réel
          </span>
        </div>
      </div>

      <!-- Métriques de la scolarité -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Taux de Présence Global</p>
          <p class="text-3xl font-black text-slate-900 mt-2">93.4%</p>
          <p class="text-[11px] text-emerald-600 font-medium mt-1">+1.2% ce semestre</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Séances Émargées</p>
          <p class="text-3xl font-black text-slate-900 mt-2">1,240</p>
          <p class="text-[11px] text-teal-600 font-medium mt-1">100% Validées par Enseignants</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Étudiants à Risque (15%-20%)</p>
          <p class="text-3xl font-black text-amber-600 mt-2">14</p>
          <p class="text-[11px] text-amber-700 font-medium mt-1">Avertissement envoyé</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Éliminés d'Office (> 20%)</p>
          <p class="text-3xl font-black text-rose-600 mt-2">3</p>
          <p class="text-[11px] text-rose-700 font-medium mt-1">Absences > 18 heures</p>
        </div>
      </div>

      <!-- Alerte de la règle des 20% -->
      <div class="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-base">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <h4 class="font-bold text-rose-950 text-xs">Règlement des Examens EMSI : Seuil d'Absence 20% ou 18 heures</h4>
            <p class="text-[11px] text-rose-800">Tout étudiant totalisant plus de 18 heures d'absence non justifiée dans un module est automatiquement exclu des examens finaux de la session principale.</p>
          </div>
        </div>
        <button class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm">
          Éditer les PV d'Élimination
        </button>
      </div>
    </div>
  `
})
export class ScolariteWorkspaceComponent {}
