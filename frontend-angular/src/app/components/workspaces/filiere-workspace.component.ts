import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-filiere-workspace',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- En-tête Espace Responsable Filière -->
      <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between border border-blue-800">
        <div>
          <div class="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>🎓 Espace Responsable de Filière</span>
            <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span>Maquette Pédagogique & Syllabus</span>
          </div>
          <h1 class="text-2xl font-black tracking-tight">Pilotage Pédagogique des Filières d'Ingénierie</h1>
          <p class="text-xs text-slate-300 mt-1">Supervision des modules IIR, GC, GI, maquettes horaires et affectation des enseignants.</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-mono font-bold">
            IIR • Génie Informatique
          </span>
          <span class="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
            Semestre S10 En Cours
          </span>
        </div>
      </div>

      <!-- Métriques de la filière -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Filières Actives</p>
          <p class="text-3xl font-black text-slate-900 mt-2">4</p>
          <p class="text-[11px] text-blue-600 font-medium mt-1">IIR, GC, GI, IA</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Modules Enseignés</p>
          <p class="text-3xl font-black text-slate-900 mt-2">32</p>
          <p class="text-[11px] text-indigo-600 font-medium mt-1">100% Maquette Validée</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Corps Enseignant</p>
          <p class="text-3xl font-black text-slate-900 mt-2">28</p>
          <p class="text-[11px] text-emerald-600 font-medium mt-1">16 Permanents • 12 Vacataires</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Étudiants Inscrits</p>
          <p class="text-3xl font-black text-slate-900 mt-2">340</p>
          <p class="text-[11px] text-purple-600 font-medium mt-1">14 Groupes Pédagogiques</p>
        </div>
      </div>

      <!-- Grille des Maquettes de la Filière -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 class="font-extrabold text-base text-slate-900">Maquette des Modules & Volumes Horaires (5A-IIR)</h3>
            <p class="text-xs text-slate-500">Répartition des heures CM, TD, TP et enseignants responsables</p>
          </div>
          <span class="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700">Norme CNEAU / EMSI</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-slate-50 text-slate-600 uppercase font-mono text-[10px] border-y border-slate-200">
              <tr>
                <th class="py-3 px-4">Code</th>
                <th class="py-3 px-4">Intitulé du Module</th>
                <th class="py-3 px-4">Éléments de Module</th>
                <th class="py-3 px-4">CM / TD / TP</th>
                <th class="py-3 px-4">Volume Total</th>
                <th class="py-3 px-4">Enseignant Responsable</th>
                <th class="py-3 px-4">Type Salle</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr class="hover:bg-slate-50/60">
                <td class="py-3 px-4 font-mono font-bold text-blue-600">IIR501</td>
                <td class="py-3 px-4 font-bold text-slate-900">Architectures Cloud & Microservices</td>
                <td class="py-3 px-4">Docker, Kubernetes & Spring Cloud</td>
                <td class="py-3 px-4 font-mono">16h / 12h / 20h</td>
                <td class="py-3 px-4 font-bold">48h</td>
                <td class="py-3 px-4">Pr. Ait Ounejjar (Permanent)</td>
                <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-bold">LI_PC (GPU)</span></td>
              </tr>
              <tr class="hover:bg-slate-50/60">
                <td class="py-3 px-4 font-mono font-bold text-blue-600">IIR502</td>
                <td class="py-3 px-4 font-bold text-slate-900">Intelligence Artificielle Avancée & LLM</td>
                <td class="py-3 px-4">Deep Learning, RAG & OpenRouter</td>
                <td class="py-3 px-4 font-mono">18h / 10h / 20h</td>
                <td class="py-3 px-4 font-bold">48h</td>
                <td class="py-3 px-4">Dr. Karim Alami (Vacataire P1)</td>
                <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-bold">LI_PC (GPU)</span></td>
              </tr>
              <tr class="hover:bg-slate-50/60">
                <td class="py-3 px-4 font-mono font-bold text-blue-600">IIR503</td>
                <td class="py-3 px-4 font-bold text-slate-900">Sécurité des Systèmes & Infrastructures</td>
                <td class="py-3 px-4">Pentest, RBAC & Hardening Cisco</td>
                <td class="py-3 px-4 font-mono">14h / 14h / 16h</td>
                <td class="py-3 px-4 font-bold">44h</td>
                <td class="py-3 px-4">Pr. Noussair Benassou (Permanent)</td>
                <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-bold">LR_RESEAUX</span></td>
              </tr>
              <tr class="hover:bg-slate-50/60">
                <td class="py-3 px-4 font-mono font-bold text-blue-600">IIR504</td>
                <td class="py-3 px-4 font-bold text-slate-900">DevOps & Intégration Continue</td>
                <td class="py-3 px-4">GitLab CI, ArgoCD & Terraform</td>
                <td class="py-3 px-4 font-mono">12h / 12h / 16h</td>
                <td class="py-3 px-4 font-bold">40h</td>
                <td class="py-3 px-4">Mme Kenza Tazi (Permanent)</td>
                <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold">Standard</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class FiliereWorkspaceComponent {}
