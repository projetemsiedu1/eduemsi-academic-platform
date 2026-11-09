import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
  template: `
    <!-- Vue Plein Écran pour Login / Register -->
    <div *ngIf="isAuthPage()" class="min-h-screen bg-slate-900">
      <router-outlet></router-outlet>
    </div>

    <!-- Vue Espace de Travail pour Utilisateur Connecté -->
    <div *ngIf="!isAuthPage()" class="h-screen flex overflow-hidden font-sans text-slate-800 bg-[#F4F6F9]">
      <!-- Barre Latérale Navigation Rôle-Dédiée -->
      <app-sidebar></app-sidebar>

      <!-- Zone Principale -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <app-header></app-header>
        
        <main class="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AppComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isAuthPage(): boolean {
    const url = this.router.url;
    return url === '/login' || url === '/register' || !this.authService.isAuthenticated();
  }
}
