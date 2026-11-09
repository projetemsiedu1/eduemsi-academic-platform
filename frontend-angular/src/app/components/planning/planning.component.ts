import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanningService } from '../../core/services/planning.service';
import { SeancePlannifiee } from '../../core/models/models';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">

      <!-- En-tête -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-black text-slate-900 tracking-tight">Solveur d'Emplois du Temps & Planning</h2>
          <p class="text-xs text-slate-500 font-medium">
            Moteur sous contraintes Google OR-Tools CP-SAT : Sanctuarisation Vacataires P1, Campus Unique et Typage Salles.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Déclencher Solveur IA -->
          <button
            (click)="lancerSolveur()"
            [disabled]="isSolving"
            class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all">
            <i [class]="isSolving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-wand-magic-sparkles'"></i>
            <span>{{ isSolving ? 'Optimisation CP-SAT...' : 'Générer Planning CP-SAT' }}</span>
          </button>

          <!-- Bouton Imprimer A4 -->
          <button (click)="imprimerA4()" class="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-brand-600 font-bold text-xs flex items-center gap-2 shadow-sm">
            <i class="fa-solid fa-print text-emerald-600"></i>
            <span>Imprimer A4 Paysage</span>
          </button>
        </div>
      </div>

      <!-- Bandeau Rapport Solveur -->
      <div *ngIf="solveurRapport" class="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span class="font-extrabold text-emerald-900">{{ solveurRapport.solveur }} • {{ solveurRapport.seancesAffectees }} séances allouées</span>
          </div>
          <p class="text-emerald-700 font-medium">
            Vacataires P1 sanctuarisés • Aucun étudiant n'a changé de campus dans la même journée • Équipements LI/LR conformes.
          </p>
        </div>
        <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-emerald-800 border border-emerald-200 shrink-0">
          Statut : 100% Contraintes Dures Validées
        </span>
      </div>

      <!-- Filtres d'affichage EDT -->
      <div class="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <span class="text-xs font-bold text-slate-500">Groupe Affiché :</span>
        <select [(ngModel)]="selectedGroupe" (change)="filtrerEdt()" class="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none font-mono">
          <option value="2DSI G3">2DSI G3 (Campus Targa)</option>
          <option value="2DSI G1">2DSI G1 (Campus Targa)</option>
          <option value="GL G2">GL G2 (Campus Targa)</option>
          <option value="5A-GI G1">5A-GI G1 (Campus Centre Guéliz)</option>
        </select>
      </div>

      <!-- Grille Hebdomadaire Emploi du Temps -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-4 space-y-4">
        
        <div class="grid grid-cols-1 md:grid-cols-6 gap-3 text-xs">
          
          <!-- Colonne Jour -->
          <div *ngFor="let jour of jours" class="space-y-2">
            <div class="p-2.5 rounded-xl bg-slate-100 font-extrabold text-slate-800 text-center uppercase tracking-wider text-[11px]">
              {{ jour }}
            </div>

            <!-- Séances du jour -->
            <div class="space-y-2">
              <div
                *ngFor="let s of getSeancesDuJour(jour)"
                class="p-3 rounded-xl border border-slate-200/80 space-y-1.5 transition-all hover:shadow-md"
                [class]="getCardClass(s.typeContratEnseignant)">
                
                <div class="flex items-center justify-between text-[10px] font-bold">
                  <span class="font-mono text-slate-500">{{ s.creneau }}</span>
                  <span [class]="s.typeContratEnseignant === 'VACATAIRE' ? 'px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono' : 'px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono'">
                    {{ s.typeContratEnseignant === 'VACATAIRE' ? 'P1 Vacataire' : 'Permanent' }}
                  </span>
                </div>

                <div class="font-bold text-slate-900 leading-snug">
                  {{ s.matiere }}
                </div>

                <div class="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                  <span class="font-medium truncate">{{ s.enseignantNom }}</span>
                  <span class="font-mono font-extrabold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                    {{ s.salleCode }}
                  </span>
                </div>
              </div>

              <div *ngIf="getSeancesDuJour(jour).length === 0" class="p-4 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-[11px]">
                Pas de cours programmé
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  `
})
export class PlanningComponent implements OnInit {
  jours = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
  selectedGroupe = '2DSI G3';
  seances: SeancePlannifiee[] = [];
  seancesFiltrees: SeancePlannifiee[] = [];
  isSolving = false;
  solveurRapport: any = null;

  constructor(private planningService: PlanningService) {}

  ngOnInit() {
    this.chargerPlanning();
  }

  chargerPlanning() {
    this.planningService.getEdtGroupe(this.selectedGroupe).subscribe(res => {
      this.seances = res;
      this.filtrerEdt();
    });
  }

  filtrerEdt() {
    this.seancesFiltrees = this.seances.filter(s => s.groupeCode === this.selectedGroupe);
  }

  getSeancesDuJour(jour: string): SeancePlannifiee[] {
    return this.seancesFiltrees.filter(s => s.jour === jour);
  }

  lancerSolveur() {
    this.isSolving = true;
    this.planningService.genererPlanning(1, true).subscribe(res => {
      this.isSolving = false;
      this.solveurRapport = res;
      this.seances = res.seances;
      this.filtrerEdt();
    });
  }

  imprimerA4() {
    window.open('emploi_du_temps_officiel_emsi.html', '_blank');
  }

  getCardClass(type: string): string {
    return type === 'VACATAIRE'
      ? 'bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border-emerald-200/80'
      : 'bg-white';
  }
}
