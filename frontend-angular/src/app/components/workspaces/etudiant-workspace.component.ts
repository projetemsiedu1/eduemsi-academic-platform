import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-etudiant-workspace',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- En-tête Espace Étudiant -->
      <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between border border-blue-700">
        <div>
          <div class="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">
            <span>🎒 Portail Étudiant EMSI Univora</span>
            <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span>Classe : 5A-IIR-G1 (Génie Informatique & Réseaux)</span>
          </div>
          <h1 class="text-2xl font-black tracking-tight">Bonjour, {{ authService.currentUser().prenom }} {{ authService.currentUser().nom }}</h1>
          <p class="text-xs text-blue-200 mt-1">Consultez votre emploi du temps fixe, votre registre d'assiduité et l'avancement de votre PFE.</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-blue-300">Campus Fixe d'Étude</p>
          <p class="text-sm font-bold text-white">{{ authService.currentUser().campusDefaut }}</p>
        </div>
      </div>

      <!-- Assiduité & Baromètre d'Élimination (Règle 20% / 18h) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">État d'Assiduité</p>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Assidu (93%)</span>
          </div>
          <div class="flex items-baseline gap-2 mt-2">
            <span class="text-3xl font-black text-slate-900">4.5h</span>
            <span class="text-xs text-slate-500">/ 18h Seuil Critique (20%)</span>
          </div>
          <!-- Barre d'alerte -->
          <div class="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div class="bg-emerald-500 h-2 rounded-full" [style.width]="'25%'"></div>
          </div>
          <p class="text-[11px] text-emerald-700 font-medium mt-2">Situation régulière • Autorisé aux examens</p>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Séances de la Semaine</p>
          <p class="text-3xl font-black text-indigo-600 mt-2">12</p>
          <p class="text-[11px] text-slate-500 font-medium mt-1">100% sur Campus Targa</p>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Projet de Fin d'Études</p>
          <p class="text-3xl font-black text-purple-600 mt-2">Validé</p>
          <p class="text-[11px] text-purple-700 font-medium mt-1">Jury de 4 membres affecté par IA</p>
        </div>
      </div>

      <!-- Mon PFE et mon Jury de Soutenance -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <h2 class="text-lg font-black text-slate-900 mb-1">Mon Sujet PFE & Commission de Soutenance</h2>
        <p class="text-xs text-slate-500 mb-4">Composition du jury à 4 membres validée selon les directives académiques EMSI</p>

        <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800">
              Sujet de Thèse d'Ingénieur
            </span>
            <h3 class="text-base font-bold text-slate-900 mt-1.5">
              Plateforme Intelligente d'Ordonnancement Académique Multi-Campus basée sur Google OR-Tools et LLM
            </h3>
            <p class="text-xs text-slate-600 mt-1">
              Entreprise partenaire : TechNova Solutions • Encadrant entreprise : M. Reda Bennis
            </p>
          </div>

          <div class="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div class="p-3 bg-white rounded-xl border border-slate-200">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Président du Jury</p>
              <p class="font-bold text-slate-800 mt-0.5">Pr. M. Sassoui</p>
              <p class="text-[10px] text-slate-500">Docteur d'État - EMSI</p>
            </div>
            <div class="p-3 bg-white rounded-xl border border-slate-200">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Encadrant Pédagogique</p>
              <p class="font-bold text-slate-800 mt-0.5">Pr. Amine Alami</p>
              <p class="text-[10px] text-slate-500">Génie Logiciel & IA</p>
            </div>
            <div class="p-3 bg-white rounded-xl border border-slate-200">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Encadrant Industriel</p>
              <p class="font-bold text-slate-800 mt-0.5">M. Reda Bennis</p>
              <p class="text-[10px] text-slate-500">TechNova Solutions</p>
            </div>
            <div class="p-3 bg-white rounded-xl border border-slate-200">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Examinateur</p>
              <p class="font-bold text-slate-800 mt-0.5">Pr. Brahim Abod</p>
              <p class="text-[10px] text-slate-500">Resp. Filière IA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EtudiantWorkspaceComponent {
  readonly authService = inject(AuthService);
}
