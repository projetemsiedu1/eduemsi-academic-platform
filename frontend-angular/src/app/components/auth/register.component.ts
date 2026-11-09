import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, RegisterPayload } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div class="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-200">
        
        <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-xl text-white shadow-md shadow-emerald-600/30">
              E
            </div>
            <div>
              <h2 class="text-xl font-black text-slate-900 tracking-tight">Inscription EMSI UNIVORA</h2>
              <p class="text-xs text-slate-500">Créez votre compte académique institutionnel</p>
            </div>
          </div>
          <a routerLink="/login" class="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline">
            Déjà inscrit ? Se connecter
          </a>
        </div>

        <!-- Alerte erreur -->
        <div *ngIf="errorMessage()" class="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <svg class="w-4 h-4 shrink-0 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <span>{{ errorMessage() }}</span>
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Nom *</label>
              <input 
                type="text" 
                [(ngModel)]="nom" 
                name="nom" 
                required 
                placeholder="Ex : Alami" 
                class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Prénom *</label>
              <input 
                type="text" 
                [(ngModel)]="prenom" 
                name="prenom" 
                required 
                placeholder="Ex : Amine" 
                class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Identifiant Unique (Username) *</label>
              <input 
                type="text" 
                [(ngModel)]="username" 
                name="username" 
                required 
                placeholder="Ex : amine.alami" 
                class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Email Institutionnel ou Personnel *</label>
              <input 
                type="email" 
                [(ngModel)]="email" 
                name="email" 
                required 
                placeholder="nom.prenom@emsi.ma" 
                class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Rôle / Profil Pédagogique *</label>
              <select 
                [(ngModel)]="role" 
                name="role" 
                class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 shadow-xs bg-white"
              >
                <option value="ROLE_ETUDIANT">🎒 Étudiant</option>
                <option value="ROLE_PROFESSEUR_PERMANENT">👨‍🏫 Professeur Permanent (Quota 18h)</option>
                <option value="ROLE_PROFESSEUR_VACATAIRE">⚡ Professeur Vacataire (Priorité P1)</option>
                <option value="ROLE_RESPONSABLE_PLANNING">📅 Responsable Planning</option>
                <option value="ROLE_RESPONSABLE_PFE">📜 Responsable PFE & Jurys</option>
                <option value="ROLE_RESPONSABLE_SCOLARITE">📋 Responsable Scolarité</option>
                <option value="ROLE_RESPONSABLE_FILIERE">🎓 Responsable Filière</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Campus de Rattachement Fixe *</label>
              <select 
                [(ngModel)]="campusId" 
                name="campusId" 
                class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 shadow-xs bg-white"
              >
                <option [ngValue]="1">Campus Targa (Marrakech)</option>
                <option [ngValue]="2">Campus Centre Guéliz (Marrakech)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Mot de passe (min 6 car.) *</label>
              <input 
                type="password" 
                [(ngModel)]="password" 
                name="password" 
                required 
                placeholder="••••••••" 
                class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Confirmation du mot de passe *</label>
              <input 
                type="password" 
                [(ngModel)]="confirmPassword" 
                name="confirmPassword" 
                required 
                placeholder="••••••••" 
                class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
            </div>
          </div>

          <div class="pt-4">
            <button 
              type="submit" 
              [disabled]="isLoading()"
              class="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span *ngIf="isLoading()" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ isLoading() ? 'Création du compte...' : 'Créer mon compte EMSI Univora' }}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  `
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  nom = '';
  prenom = '';
  username = '';
  email = '';
  role = 'ROLE_ETUDIANT';
  campusId = 1;
  password = '';
  confirmPassword = '';

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit() {
    if (!this.nom || !this.prenom || !this.username || !this.email || !this.password) {
      this.errorMessage.set('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Les mots de passe ne correspondent pas.');
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage.set('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const payload: RegisterPayload = {
      nom: this.nom,
      prenom: this.prenom,
      username: this.username,
      email: this.email,
      role: this.role,
      campusId: this.campusId,
      password: this.password
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const destination = this.authService.getWorkspaceRouteForRole(res.role);
        this.router.navigate([destination]);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || "Erreur lors de l'enregistrement.");
      }
    });
  }
}
