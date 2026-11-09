import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div class="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        <!-- Colonne Gauche : Identité Institutionnelle EMSI -->
        <div class="bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-950 p-8 text-white flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-2xl text-emerald-400 shadow-inner">
                E
              </div>
              <div>
                <h1 class="text-xl font-black tracking-tight leading-tight">EMSI UNIVORA</h1>
                <p class="text-xs text-emerald-300 font-medium">Plateforme Académique & Décisionnelle</p>
              </div>
            </div>

            <h2 class="text-2xl font-bold mb-3 tracking-tight">Portail Numérique Unifié</h2>
            <p class="text-sm text-slate-300 leading-relaxed mb-6">
              Système intégré de gestion académique : solveur CP-SAT d'emplois du temps, matching IA des jurys de PFE, assiduité et conformité des campus.
            </p>

            <div class="space-y-3 text-xs text-slate-300">
              <div class="flex items-center gap-2.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Authentification centralisée RBAC sans état (JWT)</span>
              </div>
              <div class="flex items-center gap-2.5">
                <span class="w-2 h-2 rounded-full bg-teal-400"></span>
                <span>Règle d'or : 1 groupe = 1 campus fixe</span>
              </div>
              <div class="flex items-center gap-2.5">
                <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Plafond 18h permanents vs priorité absolue vacataires</span>
              </div>
            </div>
          </div>

          <div class="pt-8 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
            <span>© 2026 Groupe EMSI Maroc</span>
            <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">v1.0.0 Live</span>
          </div>
        </div>

        <!-- Colonne Droite : Formulaire de Connexion -->
        <div class="p-8 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-2xl font-black text-slate-900 tracking-tight">Connexion</h3>
                <p class="text-xs text-slate-500">Accédez à votre espace de travail dédié</p>
              </div>
              <a routerLink="/register" class="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline">
                Créer un compte
              </a>
            </div>

            <!-- Message d'erreur -->
            <div *ngIf="errorMessage()" class="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <svg class="w-4 h-4 shrink-0 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>

            <form (ngSubmit)="onSubmit()" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Identifiant ou Email</label>
                <input 
                  type="text" 
                  [(ngModel)]="username" 
                  name="username" 
                  required 
                  placeholder="Ex : admin, resp_planning, etudiant..."
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-xs"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Mot de passe</label>
                <input 
                  type="password" 
                  [(ngModel)]="password" 
                  name="password" 
                  required 
                  placeholder="••••••••"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-xs"
                />
              </div>

              <button 
                type="submit" 
                [disabled]="isLoading()"
                class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span *ngIf="isLoading()" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{{ isLoading() ? 'Vérification...' : 'Se connecter' }}</span>
              </button>
            </form>
          </div>

          <!-- Accès Rapide par Acteur (Boutons Démo) -->
          <div class="mt-8 pt-6 border-t border-slate-100">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Accès Démo Instantané par Acteur :</p>
            <div class="grid grid-cols-2 gap-1.5 text-left">
              <button (click)="quickLogin('admin', 'Admin@2026!')" class="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-[11px] font-medium text-slate-700 text-left transition-all">
                👑 <strong class="font-bold">Super Admin</strong>
              </button>
              <button (click)="quickLogin('resp_filiere', 'Emsi@2026!')" class="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-[11px] font-medium text-slate-700 text-left transition-all">
                🎓 <strong class="font-bold">Resp. Filière</strong>
              </button>
              <button (click)="quickLogin('resp_planning', 'Emsi@2026!')" class="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-[11px] font-medium text-slate-700 text-left transition-all">
                📅 <strong class="font-bold">Resp. Planning</strong>
              </button>
              <button (click)="quickLogin('resp_pfe', 'Emsi@2026!')" class="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-[11px] font-medium text-slate-700 text-left transition-all">
                📜 <strong class="font-bold">Resp. PFE</strong>
              </button>
              <button (click)="quickLogin('resp_scolarite', 'Emsi@2026!')" class="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-[11px] font-medium text-slate-700 text-left transition-all">
                📋 <strong class="font-bold">Resp. Scolarité</strong>
              </button>
              <button (click)="quickLogin('prof_permanent', 'Emsi@2026!')" class="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-[11px] font-medium text-slate-700 text-left transition-all">
                👨‍🏫 <strong class="font-bold">Prof. Permanent</strong>
              </button>
              <button (click)="quickLogin('prof_vacataire', 'Emsi@2026!')" class="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-[11px] font-medium text-slate-700 text-left transition-all">
                ⚡ <strong class="font-bold">Prof. Vacataire (P1)</strong>
              </button>
              <button (click)="quickLogin('etudiant', 'Emsi@2026!')" class="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-[11px] font-medium text-slate-700 text-left transition-all">
                🎒 <strong class="font-bold">Étudiant</strong>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  `
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  username = '';
  password = '';
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage.set('Veuillez renseigner tous les champs.');
      return;
    }
    this.executeLogin(this.username, this.password);
  }

  quickLogin(u: string, p: string) {
    this.username = u;
    this.password = p;
    this.executeLogin(u, p);
  }

  private executeLogin(u: string, p: string) {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(u, p).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const destination = this.authService.getWorkspaceRouteForRole(res.role);
        this.router.navigate([destination]);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message || 'Identifiants incorrects ou serveur indisponible.'
        );
      }
    });
  }
}
