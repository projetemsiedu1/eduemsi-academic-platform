import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 select-none">
      
      <!-- Logo Officiel EMSI Univora -->
      <div class="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-black text-sm shadow-md">
          <i class="fa-solid fa-graduation-cap text-lg"></i>
        </div>
        <div>
          <span class="font-extrabold text-sm tracking-tight text-slate-900 block leading-tight">EMSI UNIVORA</span>
          <span class="text-[10px] font-bold text-emerald-700 tracking-wider uppercase block">Campus ERP 2026</span>
        </div>
      </div>

      <!-- Profil Utilisateur Connecté -->
      <div class="p-4 border-b border-slate-100 bg-slate-50/50">
        <div class="flex items-center gap-3">
          <div [class]="'w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm ' + auth.currentUser().avatarClass">
            {{ getInitials(auth.currentUser().prenom, auth.currentUser().nom) }}
          </div>
          <div class="overflow-hidden">
            <span class="font-bold text-xs text-slate-900 block truncate">
              {{ auth.currentUser().prenom }} {{ auth.currentUser().nom }}
            </span>
            <span class="text-[10px] text-slate-500 font-medium block truncate">
              {{ auth.currentUser().roleLabel }}
            </span>
          </div>
        </div>
      </div>

      <!-- Navigation Menus Principaux -->
      <nav class="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-semibold">
        
        <!-- Général -->
        <div class="space-y-1">
          <span class="text-[9px] uppercase font-extrabold text-slate-400 px-3 tracking-wider block">Général</span>
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-brand-50 text-brand-600 font-bold"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all">
            <i class="fa-solid fa-table-cells-large w-4 text-center"></i>
            <span>Dashboard Acadex</span>
          </a>
        </div>

        <!-- Modules IA & Optimisation -->
        <div class="space-y-1">
          <span class="text-[9px] uppercase font-extrabold text-slate-400 px-3 tracking-wider block">Intelligence Artificielle</span>
          <a
            routerLink="/planning"
            routerLinkActive="bg-brand-50 text-brand-600 font-bold"
            class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all">
            <div class="flex items-center gap-3">
              <i class="fa-solid fa-wand-magic-sparkles w-4 text-center text-emerald-600"></i>
              <span>Planning CP-SAT</span>
            </div>
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">OR-Tools</span>
          </a>

          <a
            routerLink="/pfe"
            routerLinkActive="bg-brand-50 text-brand-600 font-bold"
            class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all">
            <div class="flex items-center gap-3">
              <i class="fa-solid fa-award w-4 text-center text-purple-600"></i>
              <span>Jurys PFE à 4 IA</span>
            </div>
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono">OpenRouter</span>
          </a>
        </div>

        <!-- Pédagogie & Campus -->
        <div class="space-y-1">
          <span class="text-[9px] uppercase font-extrabold text-slate-400 px-3 tracking-wider block">Pédagogie & Salles</span>
          <a
            routerLink="/salles"
            routerLinkActive="bg-brand-50 text-brand-600 font-bold"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all">
            <i class="fa-solid fa-building-columns w-4 text-center text-indigo-600"></i>
            <span>Salles & Parcs PC</span>
          </a>

          <a
            routerLink="/groupes"
            routerLinkActive="bg-brand-50 text-brand-600 font-bold"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all">
            <i class="fa-solid fa-users-rectangle w-4 text-center text-teal-600"></i>
            <span>Filières & Groupes</span>
          </a>
        </div>

        <!-- Scolarité & Absences -->
        <div class="space-y-1">
          <span class="text-[9px] uppercase font-extrabold text-slate-400 px-3 tracking-wider block">Scolarité</span>
          <a
            routerLink="/scolarite"
            routerLinkActive="bg-brand-50 text-brand-600 font-bold"
            class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all">
            <div class="flex items-center gap-3">
              <i class="fa-solid fa-clipboard-user w-4 text-center text-rose-600"></i>
              <span>Assiduité & Absences</span>
            </div>
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-mono">20% max</span>
          </a>
        </div>

        <!-- Compte & Sécurité -->
        <div class="space-y-1">
          <span class="text-[9px] uppercase font-extrabold text-slate-400 px-3 tracking-wider block">Gouvernance</span>
          <a
            routerLink="/account"
            routerLinkActive="bg-brand-50 text-brand-600 font-bold"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all">
            <i class="fa-solid fa-key w-4 text-center text-amber-600"></i>
            <span>Mon Compte & Mot de passe</span>
          </a>
        </div>

      </nav>

      <!-- Pied de page Sidebar -->
      <div class="p-4 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
        <span>© 2026 EMSI • Groupe Honoris</span>
      </div>

    </aside>
  `
})
export class SidebarComponent {
  constructor(public auth: AuthService) {}

  getInitials(prenom: string, nom: string): string {
    return ((prenom[0] || '') + (nom[0] || '')).toUpperCase();
  }
}
