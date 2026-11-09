import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
  template: `
    <div class="h-screen flex overflow-hidden font-sans text-slate-800 bg-[#F4F6F9]">
      <!-- Barre Latérale Navigation Style Acadex -->
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
export class AppComponent {}
