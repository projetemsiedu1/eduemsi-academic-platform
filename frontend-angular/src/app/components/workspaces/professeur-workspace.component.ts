import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-professeur-workspace',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <!-- En-tête Espace Professeur -->
      <div class="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between border border-teal-700">
        <div>
          <div class="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider mb-1">
            <span>👨‍🏫 Portail Pédagogique Enseignant</span>
            <span class="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
            <span>{{ isVacataire() ? 'Statut : Vacataire (Priorité P1)' : 'Statut : Permanent (Quota 18h)' }}</span>
          </div>
          <h1 class="text-2xl font-black tracking-tight">Bienvenue, {{ authService.currentUser().prenom }} {{ authService.currentUser().nom }}</h1>
          <p class="text-xs text-teal-100 mt-1">Consultez vos séances planifiées, saisissez les présences et suivez vos quotas d'enseignement.</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-teal-200">Campus Principal</p>
          <p class="text-sm font-bold text-white">{{ authService.currentUser().campusDefaut }}</p>
        </div>
      </div>

      <!-- Quotas & Volume Horaire -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Volume Horaire Effectué</p>
          <div class="flex items-baseline gap-2 mt-2">
            <span class="text-3xl font-black text-slate-900">14h</span>
            <span class="text-xs text-slate-500">/ {{ isVacataire() ? 'Paiement Horaire' : '18h Contractuelles' }}</span>
          </div>
          <!-- Barre de progression -->
          <div class="w-full bg-slate-100 rounded-full h-2.5 mt-3 overflow-hidden">
            <div class="bg-teal-600 h-2.5 rounded-full" [style.width]="'77%'"></div>
          </div>
          <p class="text-[11px] text-teal-700 font-bold mt-2">4h restantes cette semaine</p>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Séances Hebdomadaires</p>
          <p class="text-3xl font-black text-teal-600 mt-2">7</p>
          <p class="text-[11px] text-slate-500 font-medium mt-1">4 cours magistraux, 3 séances TP</p>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">PFE Encadrés</p>
          <p class="text-3xl font-black text-purple-600 mt-2">3</p>
          <p class="text-[11px] text-purple-700 font-medium mt-1">Étudiants de 5ème Année IIR & IA</p>
        </div>
      </div>

      <!-- Mon Emploi du Temps Hebdomadaire -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-black text-slate-900">Mon Planning Hebdomadaire</h2>
            <p class="text-xs text-slate-500">Garantie EMSI : aucun déplacement inter-campus au cours d'une même journée</p>
          </div>
          <span class="px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
            Semestre Automne 2026
          </span>
        </div>

        <div class="space-y-3">
          <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-teal-600 text-white flex flex-col items-center justify-center font-bold text-xs">
                <span>LUN</span>
                <span class="text-[10px] font-normal">08:30</span>
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900">Architecture Microservices & Spring Boot 3</h3>
                <p class="text-xs text-slate-500">Groupe : 5A-IIR-G1 • Salle : LI 8 (36 PC RTX 4080) • Campus Targa</p>
              </div>
            </div>
            <button class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs">
              Émarger la séance
            </button>
          </div>

          <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-indigo-600 text-white flex flex-col items-center justify-center font-bold text-xs">
                <span>MAR</span>
                <span class="text-[10px] font-normal">10:30</span>
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900">Deep Learning & Vision par Ordinateur</h3>
                <p class="text-xs text-slate-500">Groupe : 5A-IA-G1 • Salle : LI 3 (34 PC CUDA) • Campus Targa</p>
              </div>
            </div>
            <button class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs">
              Émarger la séance
            </button>
          </div>

          <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-purple-600 text-white flex flex-col items-center justify-center font-bold text-xs">
                <span>JEU</span>
                <span class="text-[10px] font-normal">14:00</span>
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900">Commission de Soutenance PFE (Jury Collégial)</h3>
                <p class="text-xs text-slate-500">Candidat : Anas Benjelloun • Salle : Amphi A • Campus Targa</p>
              </div>
            </div>
            <span class="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200">
              Membre Examinateur
            </span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfesseurWorkspaceComponent {
  readonly authService = inject(AuthService);

  isVacataire(): boolean {
    return this.authService.currentUser().role.includes('VACATAIRE');
  }
}
