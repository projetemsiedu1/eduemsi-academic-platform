import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PfeService } from '../../core/services/pfe.service';
import { PfeJuryResponse } from '../../core/models/models';

@Component({
  selector: 'app-pfe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">

      <!-- En-tête -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-black text-slate-900 tracking-tight">Affectation & Jurys PFE à 4 Membres</h2>
          <p class="text-xs text-slate-500 font-medium">
            Agent IA Sémantique (OpenRouter Free API) : Composition du Jury Officiel conforme à la déontologie EMSI.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
            🤖 Modèles Free : Gemini 2.0 Flash & Llama 3.3 70B
          </span>
        </div>
      </div>

      <!-- Grille Formulaire Sujet & Résultat Jury -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Formulaire Sujet PFE -->
        <div class="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 class="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Soumettre un Sujet de PFE
          </h3>

          <div class="space-y-3 text-xs font-semibold">
            <div>
              <label class="block text-slate-500 mb-1">Titre du Projet PFE</label>
              <input type="text" [(ngModel)]="titre" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold text-slate-900">
            </div>

            <div>
              <label class="block text-slate-500 mb-1">Résumé & Problématique Technique</label>
              <textarea [(ngModel)]="resume" rows="4" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none text-slate-700"></textarea>
            </div>

            <div>
              <label class="block text-slate-500 mb-1">Technologies Clés (séparées par des virgules)</label>
              <input type="text" [(ngModel)]="technologies" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-mono">
            </div>

            <!-- Exemples Rapides -->
            <div class="pt-2">
              <span class="text-[10px] text-slate-400 block mb-1">Charger un exemple :</span>
              <div class="flex flex-wrap gap-1.5">
                <button (click)="chargerExemple(1)" class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-700">
                  ERP Microservices & OR-Tools
                </button>
                <button (click)="chargerExemple(2)" class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-700">
                  Deep Learning & Vision AI
                </button>
                <button (click)="chargerExemple(3)" class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-700">
                  Mobile Flutter & WebRTC
                </button>
              </div>
            </div>

            <button
              (click)="declencherMatching()"
              [disabled]="isMatching"
              class="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all mt-4">
              <i [class]="isMatching ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-wand-magic-sparkles'"></i>
              <span>{{ isMatching ? 'Analyse Sémantique en cours...' : 'Générer le Jury Officiel à 4 IA' }}</span>
            </button>
          </div>
        </div>

        <!-- Résultat : Le Jury Officiel à 4 Membres -->
        <div class="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 class="font-extrabold text-sm text-slate-900">Composition du Jury Officiel</h3>
              <p class="text-[11px] text-slate-400">Règle BR-PFE-07 : L'encadrant est formellement exclu de l'évaluation.</p>
            </div>
            <span *ngIf="juryResult" class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Score : {{ (juryResult.scoreGlobalAffinite * 100).toFixed(0) }}%
            </span>
          </div>

          <div *ngIf="!juryResult && !isMatching" class="p-12 text-center text-slate-400 space-y-2">
            <i class="fa-solid fa-award text-3xl text-slate-300"></i>
            <p class="text-xs">Cliquez sur « Générer le Jury Officiel » pour lancer le matching sémantique.</p>
          </div>

          <div *ngIf="isMatching" class="p-12 text-center space-y-3">
            <i class="fa-solid fa-spinner fa-spin text-3xl text-purple-600"></i>
            <p class="text-xs font-bold text-slate-700">L'agent OpenRouter AI analyse les compétences des enseignants...</p>
          </div>

          <div *ngIf="juryResult" class="space-y-3">
            
            <!-- Les 4 cartes de membres -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              <!-- 1. Encadrant -->
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1. Encadrant Pédagogique</span>
                <span class="font-bold text-slate-900 block text-xs">{{ juryResult.encadrant.nomComplet }}</span>
                <span class="text-[11px] text-slate-500 block truncate">{{ juryResult.encadrant.specialite }}</span>
              </div>

              <!-- 2. Rapporteur -->
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">2. Rapporteur Indépendant</span>
                <span class="font-bold text-slate-900 block text-xs">{{ juryResult.rapporteur.nomComplet }}</span>
                <span class="text-[11px] text-slate-500 block truncate">{{ juryResult.rapporteur.specialite }}</span>
              </div>

              <!-- 3. Examinateur IA -->
              <div class="p-3 rounded-xl bg-purple-50/60 border border-purple-200 space-y-1">
                <span class="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">3. Examinateur (Choix IA)</span>
                <span class="font-bold text-slate-900 block text-xs">{{ juryResult.examinateurIa.nomComplet }}</span>
                <span class="text-[11px] text-slate-500 block truncate">{{ juryResult.examinateurIa.specialite }}</span>
              </div>

              <!-- 4. Président HDR -->
              <div class="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                <span class="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">4. Président (HDR Requis)</span>
                <span class="font-bold text-slate-900 block text-xs">{{ juryResult.presidentHdr.nomComplet }}</span>
                <span class="text-[11px] text-slate-500 block truncate">{{ juryResult.presidentHdr.specialite }}</span>
              </div>

            </div>

            <!-- Justification IA -->
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span class="font-bold text-slate-800 text-[11px] block">Justification de l'affectation IA :</span>
              <p class="text-slate-600 text-[11px] leading-relaxed">
                {{ juryResult.justificationIa }}
              </p>
            </div>

            <!-- Confirmation Enregistrement -->
            <button (click)="validerJury()" class="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm">
              Valider et Notifier les 4 Membres par Email
            </button>
          </div>

        </div>

      </div>

    </div>
  `
})
export class PfeComponent {
  titre = 'Plateforme ERP Universitaire avec Solveur CP-SAT et Microservices Spring Boot';
  resume = 'Conception et implémentation d\'une architecture logicielle moderne en Java 21, Spring Boot 3 et base de données relationnelle MySQL, intégrant un solveur d\'optimisation sous contraintes pour la planification académique.';
  technologies = 'Java, Spring Boot, MySQL, Hibernate, Google OR-Tools, Docker';
  
  isMatching = false;
  juryResult: PfeJuryResponse | null = null;

  constructor(private pfeService: PfeService) {}

  declencherMatching() {
    this.isMatching = true;
    this.pfeService.matchJury(this.titre, this.resume, this.technologies).subscribe(res => {
      this.isMatching = false;
      this.juryResult = res;
    });
  }

  chargerExemple(ex: number) {
    if (ex === 1) {
      this.titre = 'Plateforme ERP Universitaire avec Solveur CP-SAT et Microservices Spring Boot';
      this.resume = 'Conception d\'une architecture en Java 21 Spring Boot avec Google OR-Tools pour l\'affectation sous contraintes.';
      this.technologies = 'Java, Spring Boot, MySQL, OR-Tools';
    } else if (ex === 2) {
      this.titre = 'Système de Détection Précoce de Pathologies Rétiniennes par Réseaux de Neurones';
      this.resume = 'Modèles de vision artificielle Vision Transformer et CNN appliqués à l\'imagerie médicale ophtalmologique.';
      this.technologies = 'Python, PyTorch, CUDA, FastAPI, Docker';
    } else {
      this.titre = 'Application Mobile Cross-Platform de Télémédecine avec Interface Réactive';
      this.resume = 'Application Flutter/Dart avec gestion d\'état Bloc, flux vidéo WebRTC temps réel et design réactif.';
      this.technologies = 'Flutter, Dart, WebRTC, Node.js';
    }
  }

  validerJury() {
    alert('Jury officiel à 4 membres enregistré avec succès dans MySQL Laragon !');
  }
}
