import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-pfe-workspace',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- En-tête Espace Responsable PFE -->
      <div class="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between border border-purple-800">
        <div>
          <div class="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>🏆 Espace Responsable PFE & Stages</span>
            <span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            <span>Constitution Jurys à 4 Membres & IA OpenRouter</span>
          </div>
          <h1 class="text-2xl font-black tracking-tight">Gestion des Projets de Fin d'Études (5A)</h1>
          <p class="text-xs text-slate-300 mt-1">Validation des sujets industriels, matching intelligent par LLM et programmation des soutenances.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold">
            Jury 4 Membres Strict
          </span>
          <span class="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
            Matching IA Actif
          </span>
        </div>
      </div>

      <!-- Métriques PFE -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Sujets Déposés</p>
          <p class="text-3xl font-black text-slate-900 mt-2">128</p>
          <p class="text-[11px] text-purple-600 font-medium mt-1">100% Validés en Entreprise</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Jurys Constitués</p>
          <p class="text-3xl font-black text-slate-900 mt-2">114</p>
          <p class="text-[11px] text-emerald-600 font-medium mt-1">4 Membres par Jury (Norme)</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Soutenances Planifiées</p>
          <p class="text-3xl font-black text-slate-900 mt-2">48</p>
          <p class="text-[11px] text-blue-600 font-medium mt-1">Sessions Décembre & Juin</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Satisfaction IA Matching</p>
          <p class="text-3xl font-black text-slate-900 mt-2">97.8%</p>
          <p class="text-[11px] text-teal-600 font-medium mt-1">OpenRouter / Llama 3</p>
        </div>
      </div>

      <!-- Règle d'or du Jury à 4 membres -->
      <div class="bg-purple-50 p-4 rounded-2xl border border-purple-200 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
            <i class="fa-solid fa-users"></i>
          </div>
          <div>
            <h4 class="font-bold text-purple-950 text-xs">Composition Réglementaire du Jury de Soutenance EMSI</h4>
            <p class="text-[11px] text-purple-800">1. Président (HDR/Docteur) • 2. Encadrant Académique • 3. Tuteur Entreprise • 4. Examinateur / Rapporteur</p>
          </div>
        </div>
        <span class="text-[10px] font-mono font-bold px-2 py-1 bg-purple-200 text-purple-900 rounded">RÈGLE STRICTE 4 MEMBRES</span>
      </div>
    </div>
  `
})
export class PfeWorkspaceComponent {}
