import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BackendHealthService } from '../../core/services/backend-health.service';
import { UserRole } from '../../core/models/models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="h-16 px-6 py-3 flex items-center justify-between bg-[#F4F6F9] border-b border-slate-200/60 shrink-0">
      <div class="flex items-center gap-3">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-lg font-black text-slate-900 tracking-tight">
              Dashboard • {{ auth.currentUser().prenom }} {{ auth.currentUser().nom }}
            </h1>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
              {{ auth.currentUser().campusDefaut }}
            </span>
          </div>
          <p class="text-[11px] text-slate-400 font-medium">
            EMSI Univora • 1 Groupe = 1 Campus Fixe • Vacataires Priorité 1 (P1)
          </p>
        </div>
      </div>

      <!-- Actions Droite : Statut Live, Switcher Rôles, Mon Compte -->
      <div class="flex items-center gap-2.5">
        <!-- Badge Statut Backend Spring Boot & MySQL Laragon -->
        <div
          [class]="health.isBackendOnline()
            ? 'flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 shadow-sm'
            : 'flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-700 shadow-sm'"
          [title]="health.statusMessage()">
          <span
            [class]="health.isBackendOnline()
              ? 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse'
              : 'w-2 h-2 rounded-full bg-amber-500'"></span>
          <span class="hidden md:inline">{{ health.statusMessage() }}</span>
        </div>

        <!-- Pills Switcher de Rôles Rapide -->
        <div class="hidden xl:flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-sm">
          <button
            *ngFor="let role of roles"
            (click)="auth.switchRole(role.key)"
            [class]="auth.currentUser().role === role.key
              ? 'px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-brand-600 text-white shadow-sm'
              : 'px-2.5 py-1 rounded-xl text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50'">
            {{ role.label }}
          </button>
        </div>

        <!-- Bouton Mon Compte -->
        <a
          routerLink="/account"
          class="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 flex items-center justify-center shadow-sm"
          title="Mon Compte & Sécurité">
          <i class="fa-solid fa-shield-halved text-xs"></i>
        </a>

        <!-- Bouton Déconnexion Officiel -->
        <button
          (click)="auth.logout()"
          class="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          title="Se déconnecter de la session JWT">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  `
})
export class HeaderComponent {
  readonly roles: { key: UserRole; label: string }[] = [
    { key: 'SUPER_ADMIN', label: 'Admin' },
    { key: 'CHEF_FILIERE', label: 'Filière' },
    { key: 'RESP_PLANNING', label: 'Planning' },
    { key: 'RESP_PFE', label: 'PFE' },
    { key: 'RESP_SCOLARITE', label: 'Scolarité' },
    { key: 'ENSEIGNANT_PERMANENT', label: 'Permanent' },
    { key: 'ENSEIGNANT_VACATAIRE', label: 'Vacataire' },
    { key: 'ETUDIANT', label: 'Étudiant' }
  ];

  constructor(
    public auth: AuthService,
    public health: BackendHealthService
  ) {}
}
