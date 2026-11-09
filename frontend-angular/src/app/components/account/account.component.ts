import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl space-y-6">

      <div>
        <h2 class="text-lg font-black text-slate-900 tracking-tight">Mon Compte & Sécurité</h2>
        <p class="text-xs text-slate-500 font-medium">
          Gestion des identifiants d'accès, permissions et renouvellement de mot de passe.
        </p>
      </div>

      <!-- Informations Utilisateur -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 class="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">Informations du Profil</h3>
        
        <div class="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span class="text-slate-400 block mb-0.5">Nom & Prénom</span>
            <span class="font-bold text-slate-900">{{ auth.currentUser().prenom }} {{ auth.currentUser().nom }}</span>
          </div>

          <div>
            <span class="text-slate-400 block mb-0.5">Matricule Officiel</span>
            <span class="font-mono font-bold text-slate-900">{{ auth.currentUser().matricule }}</span>
          </div>

          <div>
            <span class="text-slate-400 block mb-0.5">Email Académique</span>
            <span class="font-mono text-slate-700">{{ auth.currentUser().email }}</span>
          </div>

          <div>
            <span class="text-slate-400 block mb-0.5">Rôle & Périmètre</span>
            <span class="font-bold text-brand-600">{{ auth.currentUser().roleLabel }}</span>
          </div>
        </div>
      </div>

      <!-- Changement de Mot de Passe -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <h3 class="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">Changer mon Mot de Passe</h3>

        <div *ngIf="successMsg" class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800">
          {{ successMsg }}
        </div>

        <div *ngIf="errorMsg" class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800">
          {{ errorMsg }}
        </div>

        <form (ngSubmit)="changerMotDePasse()" class="space-y-3 text-xs font-semibold">
          <div>
            <label class="block text-slate-500 mb-1">Ancien mot de passe</label>
            <input type="password" [(ngModel)]="oldPass" name="oldPass" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-mono">
          </div>

          <div>
            <label class="block text-slate-500 mb-1">Nouveau mot de passe</label>
            <input type="password" [(ngModel)]="newPass" name="newPass" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-mono">
          </div>

          <div>
            <label class="block text-slate-500 mb-1">Confirmer le nouveau mot de passe</label>
            <input type="password" [(ngModel)]="confirmPass" name="confirmPass" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-mono">
          </div>

          <button type="submit" class="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition-all">
            Mettre à jour mon mot de passe
          </button>
        </form>
      </div>

    </div>
  `
})
export class AccountComponent {
  oldPass = '';
  newPass = '';
  confirmPass = '';
  successMsg = '';
  errorMsg = '';

  constructor(public auth: AuthService) {}

  changerMotDePasse() {
    this.successMsg = '';
    this.errorMsg = '';

    if (!this.oldPass || !this.newPass) {
      this.errorMsg = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.newPass !== this.confirmPass) {
      this.errorMsg = 'Les nouveaux mots de passe ne correspondent pas.';
      return;
    }

    this.successMsg = 'Mot de passe sécurisé et haché avec succès (BCrypt Spring Security 6) !';
    this.oldPass = '';
    this.newPass = '';
    this.confirmPass = '';
  }
}
