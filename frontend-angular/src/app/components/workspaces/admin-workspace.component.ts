import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-workspace',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- En-tête Espace Admin -->
      <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between border border-slate-700">
        <div>
          <div class="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>👑 Espace Super Administrateur</span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Gouvernance & Infrastructure</span>
          </div>
          <h1 class="text-2xl font-black tracking-tight">Supervision Globale du Système EMSI Univora</h1>
          <p class="text-xs text-slate-300 mt-1">Gestion des accès RBAC, campus, sécurité sans état JWT et base relationnelle MySQL 8.4.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
            MySQL 8.4 • Actif
          </span>
          <span class="px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-bold">
            JWT Stateless
          </span>
        </div>
      </div>

      <!-- Métriques d'infrastructure -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Campus Opérationnels</p>
          <p class="text-3xl font-black text-slate-900 mt-2">2</p>
          <p class="text-[11px] text-emerald-600 font-medium mt-1">Targa & Centre Guéliz</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Comptes Utilisateurs</p>
          <p class="text-3xl font-black text-slate-900 mt-2">9+</p>
          <p class="text-[11px] text-indigo-600 font-medium mt-1">8 Rôles RBAC Actifs</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Solveur CP-SAT</p>
          <p class="text-3xl font-black text-emerald-600 mt-2">9.8</p>
          <p class="text-[11px] text-slate-500 font-medium mt-1">Google OR-Tools Natif</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Moteur d'IA PFE</p>
          <p class="text-3xl font-black text-purple-600 mt-2">Gemini 2.0</p>
          <p class="text-[11px] text-slate-500 font-medium mt-1">Via OpenRouter (Gratuit)</p>
        </div>
      </div>

      <!-- Liste des comptes et privilèges -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-black text-slate-900">Référentiel des Comptes & Privilèges RBAC</h2>
            <p class="text-xs text-slate-500">Comptes institutionnels pré-enregistrés et synchronisés avec le backend</p>
          </div>
          <span class="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold">Sécurité JWT</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th class="py-3 px-4">Identifiant</th>
                <th class="py-3 px-4">Nom & Prénom</th>
                <th class="py-3 px-4">Email Académique</th>
                <th class="py-3 px-4">Rôle Système</th>
                <th class="py-3 px-4">Campus Assigné</th>
                <th class="py-3 px-4">Statut</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr class="hover:bg-slate-50/50">
                <td class="py-3 px-4 font-bold text-slate-900 font-mono">admin</td>
                <td class="py-3 px-4">Moussaoui Moad</td>
                <td class="py-3 px-4">moad.moussaoui&#64;emsi.ma</td>
                <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">SUPER_ADMIN</span></td>
                <td class="py-3 px-4">Tous campus</td>
                <td class="py-3 px-4 text-emerald-600 font-bold">Actif</td>
              </tr>
              <tr class="hover:bg-slate-50/50">
                <td class="py-3 px-4 font-bold text-slate-900 font-mono">resp_filiere</td>
                <td class="py-3 px-4">Berrada Nadia</td>
                <td class="py-3 px-4">nadia.berrada&#64;emsi.ma</td>
                <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">RESP_FILIERE</span></td>
                <td class="py-3 px-4">Campus Targa</td>
                <td class="py-3 px-4 text-emerald-600 font-bold">Actif</td>
              </tr>
              <tr class="hover:bg-slate-50/50">
                <td class="py-3 px-4 font-bold text-slate-900 font-mono">resp_planning</td>
                <td class="py-3 px-4">Tazi Mehdi</td>
                <td class="py-3 px-4">mehdi.tazi&#64;emsi.ma</td>
                <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">RESP_PLANNING</span></td>
                <td class="py-3 px-4">Campus Targa</td>
                <td class="py-3 px-4 text-emerald-600 font-bold">Actif</td>
              </tr>
              <tr class="hover:bg-slate-50/50">
                <td class="py-3 px-4 font-bold text-slate-900 font-mono">resp_pfe</td>
                <td class="py-3 px-4">Abod Brahim</td>
                <td class="py-3 px-4">brahim.abod&#64;emsi.ma</td>
                <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">RESP_PFE</span></td>
                <td class="py-3 px-4">Campus Targa</td>
                <td class="py-3 px-4 text-emerald-600 font-bold">Actif</td>
              </tr>
              <tr class="hover:bg-slate-50/50">
                <td class="py-3 px-4 font-bold text-slate-900 font-mono">resp_scolarite</td>
                <td class="py-3 px-4">Bennani Siham</td>
                <td class="py-3 px-4">siham.bennani&#64;emsi.ma</td>
                <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">RESP_SCOLARITE</span></td>
                <td class="py-3 px-4">Campus Guéliz</td>
                <td class="py-3 px-4 text-emerald-600 font-bold">Actif</td>
              </tr>
              <tr class="hover:bg-slate-50/50">
                <td class="py-3 px-4 font-bold text-slate-900 font-mono">prof_permanent</td>
                <td class="py-3 px-4">Alami Amine</td>
                <td class="py-3 px-4">amine.alami&#64;emsi.ma</td>
                <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">PROF_PERMANENT</span></td>
                <td class="py-3 px-4">Campus Targa</td>
                <td class="py-3 px-4 text-emerald-600 font-bold">Actif</td>
              </tr>
              <tr class="hover:bg-slate-50/50">
                <td class="py-3 px-4 font-bold text-slate-900 font-mono">prof_vacataire</td>
                <td class="py-3 px-4">Kadiri Yassine</td>
                <td class="py-3 px-4">yassine.kadiri&#64;emsi.ma</td>
                <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 font-bold">PROF_VACATAIRE</span></td>
                <td class="py-3 px-4">Campus Guéliz</td>
                <td class="py-3 px-4 text-emerald-600 font-bold">Actif</td>
              </tr>
              <tr class="hover:bg-slate-50/50">
                <td class="py-3 px-4 font-bold text-slate-900 font-mono">etudiant</td>
                <td class="py-3 px-4">Benjelloun Anas</td>
                <td class="py-3 px-4">anas.benjelloun&#64;emsi.ma</td>
                <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">ETUDIANT</span></td>
                <td class="py-3 px-4">Campus Targa</td>
                <td class="py-3 px-4 text-emerald-600 font-bold">Actif</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminWorkspaceComponent {}
