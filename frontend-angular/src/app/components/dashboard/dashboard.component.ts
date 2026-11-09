import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SalleService } from '../../core/services/salle.service';
import { GroupeService } from '../../core/services/groupe.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">

      <!-- RANGÉE 1 : 4 CARTES MÉTRIQUES AVEC BOUTON FLÈCHE (->) STYLE ACADEX -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div class="acadex-stat-card">
          <div>
            <span class="text-xs font-bold text-slate-400 block mb-1">Étudiants Inscrits</span>
            <div class="text-2xl font-black text-slate-900 tracking-tight">5,699</div>
          </div>
          <a routerLink="/scolarite" class="acadex-btn-circle" title="Voir assiduité">
            <i class="fa-solid fa-arrow-right text-xs"></i>
          </a>
        </div>

        <div class="acadex-stat-card">
          <div>
            <span class="text-xs font-bold text-slate-400 block mb-1">Enseignants (P1/Perm)</span>
            <div class="text-2xl font-black text-slate-900 tracking-tight">297</div>
          </div>
          <a routerLink="/planning" class="acadex-btn-circle" title="Voir planning">
            <i class="fa-solid fa-arrow-right text-xs"></i>
          </a>
        </div>

        <div class="acadex-stat-card">
          <div>
            <span class="text-xs font-bold text-slate-400 block mb-1">Salles & Labos PC</span>
            <div class="text-2xl font-black text-slate-900 tracking-tight">48</div>
          </div>
          <a routerLink="/salles" class="acadex-btn-circle" title="Gérer les salles">
            <i class="fa-solid fa-arrow-right text-xs"></i>
          </a>
        </div>

        <div class="acadex-stat-card">
          <div>
            <span class="text-xs font-bold text-slate-400 block mb-1">Projets PFE Actifs</span>
            <div class="text-2xl font-black text-slate-900 tracking-tight">368</div>
          </div>
          <a routerLink="/pfe" class="acadex-btn-circle" title="Matching jurys">
            <i class="fa-solid fa-arrow-right text-xs"></i>
          </a>
        </div>

      </div>

      <!-- BANNIÈRE DES CONTRAINTES MÉTIERS STRICTES SANCTUARISÉES -->
      <div class="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-950 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-full">
            Contraintes Académiques EMSI Satisfaites à 100%
          </span>
          <h3 class="font-extrabold text-sm text-white">Règles d'Affectation Validées par le Solveur CP-SAT :</h3>
          <p class="text-xs text-emerald-100/80">
            1. <strong>Un Groupe = Un Campus Fixe</strong> (Targa ou Guéliz) • 2. <strong>Vacataires Sanctuarisés P1</strong> puis Permanents (18h) • 3. <strong>Typage Salles LI_PC vs LR_RESEAUX</strong> • 4. <strong>Pause 15 min obligatoire</strong>.
          </p>
        </div>
        <a routerLink="/planning" class="px-3.5 py-2 rounded-xl bg-white text-slate-900 hover:bg-emerald-50 font-black text-xs shrink-0 transition-all shadow-sm">
          Consulter Solveur IA ➔
        </a>
      </div>

      <!-- RANGÉE 2 : LES 2 GRANDS GRAPHIQUES STYLE ACADEX -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Graphique 1 : Courbe Spline Dégradé (Academic Performance) -->
        <div class="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-extrabold text-sm text-slate-900">Academic Performance & Assiduité</h3>
              <p class="text-xs text-slate-400 font-medium">Taux de présence et validation des crédits ECTS</p>
            </div>
            <select class="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <option>Semestre 1 (2026)</option>
              <option>Année 2025-2026</option>
            </select>
          </div>

          <!-- SVG Spline Area Chart avec Dégradé Vert et Tooltip 91% (comme dans le screenshot) -->
          <div class="relative pt-2">
            <svg viewBox="0 0 500 180" class="w-full h-44 overflow-visible">
              <defs>
                <linearGradient id="acadexGreenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#10B981" stop-opacity="0.35"/>
                  <stop offset="100%" stop-color="#10B981" stop-opacity="0.0"/>
                </linearGradient>
              </defs>
              
              <line x1="20" y1="30" x2="480" y2="30" stroke="#F1F5F9" stroke-width="1.5" stroke-dasharray="4,4"/>
              <line x1="20" y1="80" x2="480" y2="80" stroke="#F1F5F9" stroke-width="1.5" stroke-dasharray="4,4"/>
              <line x1="20" y1="130" x2="480" y2="130" stroke="#F1F5F9" stroke-width="1.5" stroke-dasharray="4,4"/>

              <line x1="320" y1="40" x2="320" y2="160" stroke="#10B981" stroke-width="1.5" stroke-dasharray="3,3"/>

              <path d="M 30,140 Q 90,120 150,135 T 270,105 T 320,50 T 400,65 T 470,80 L 470,160 L 30,160 Z" fill="url(#acadexGreenGrad)"/>
              <path d="M 30,140 Q 90,120 150,135 T 270,105 T 320,50 T 400,65 T 470,80" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round"/>

              <circle cx="30" cy="140" r="3.5" fill="#FFFFFF" stroke="#10B981" stroke-width="2"/>
              <circle cx="150" cy="135" r="3.5" fill="#FFFFFF" stroke="#10B981" stroke-width="2"/>
              <circle cx="210" cy="122" r="3.5" fill="#FFFFFF" stroke="#10B981" stroke-width="2"/>
              <circle cx="270" cy="105" r="3.5" fill="#FFFFFF" stroke="#10B981" stroke-width="2"/>
              <circle cx="320" cy="50" r="4.5" fill="#10B981" stroke="#FFFFFF" stroke-width="2"/>
              <circle cx="400" cy="65" r="3.5" fill="#FFFFFF" stroke="#10B981" stroke-width="2"/>
              <circle cx="470" cy="80" r="3.5" fill="#FFFFFF" stroke="#10B981" stroke-width="2"/>
            </svg>

            <!-- Tooltip 91% Actuel -->
            <div class="absolute top-2 left-[62%] -translate-x-1/2 bg-slate-900 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-lg pointer-events-none">
              91%
            </div>

            <!-- Axe X des Mois -->
            <div class="flex justify-between text-[10px] font-semibold text-slate-400 mt-2 px-4">
              <span>Sept</span>
              <span>Oct</span>
              <span>Nov</span>
              <span class="text-slate-900 font-bold">Actuel</span>
              <span>Déc</span>
              <span>Janv</span>
            </div>
          </div>
        </div>

        <!-- Graphique 2 : Histogramme Groupé Quotas (Permanents vs Vacataires) -->
        <div class="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-extrabold text-sm text-slate-900">Quotas & Heures Enseignées</h3>
              <div class="flex items-center gap-3 mt-1">
                <span class="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                  <span class="w-2 h-2 rounded-full bg-brand-600"></span> Permanents (18h)
                </span>
                <span class="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Vacataires P1
                </span>
              </div>
            </div>
            <span class="text-xs text-slate-400 font-medium">Semestre 1</span>
          </div>

          <div class="h-44 flex items-end justify-between pt-4 px-2">
            <!-- Semaine 1 -->
            <div class="flex flex-col items-center gap-2">
              <div class="flex items-end gap-1.5 h-32">
                <div class="w-3.5 bg-brand-600 rounded-t-sm" style="height: 60%;"></div>
                <div class="w-3.5 bg-emerald-500 rounded-t-sm" style="height: 38%;"></div>
              </div>
              <span class="text-[10px] text-slate-400 font-bold">S1</span>
            </div>

            <!-- Semaine 2 -->
            <div class="flex flex-col items-center gap-2">
              <div class="flex items-end gap-1.5 h-32">
                <div class="w-3.5 bg-brand-600 rounded-t-sm" style="height: 80%;"></div>
                <div class="w-3.5 bg-emerald-500 rounded-t-sm" style="height: 52%;"></div>
              </div>
              <span class="text-[10px] text-slate-400 font-bold">S2</span>
            </div>

            <!-- Semaine 3 -->
            <div class="flex flex-col items-center gap-2">
              <div class="flex items-end gap-1.5 h-32">
                <div class="w-3.5 bg-brand-600 rounded-t-sm" style="height: 72%;"></div>
                <div class="w-3.5 bg-emerald-500 rounded-t-sm" style="height: 58%;"></div>
              </div>
              <span class="text-[10px] text-slate-400 font-bold">S3</span>
            </div>

            <!-- Semaine 4 -->
            <div class="flex flex-col items-center gap-2">
              <div class="flex items-end gap-1.5 h-32">
                <div class="w-3.5 bg-brand-600 rounded-t-sm" style="height: 88%;"></div>
                <div class="w-3.5 bg-emerald-500 rounded-t-sm" style="height: 65%;"></div>
              </div>
              <span class="text-[10px] text-slate-400 font-bold">S4</span>
            </div>

            <!-- Semaine 5 -->
            <div class="flex flex-col items-center gap-2">
              <div class="flex items-end gap-1.5 h-32">
                <div class="w-3.5 bg-brand-600 rounded-t-sm" style="height: 94%;"></div>
                <div class="w-3.5 bg-emerald-500 rounded-t-sm" style="height: 70%;"></div>
              </div>
              <span class="text-[10px] text-slate-400 font-bold">S5</span>
            </div>
          </div>
        </div>

      </div>

      <!-- RANGÉE 3 : RAPPEL DES RÈGLES ACADÉMIQUES DU PROJET -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
            <i class="fa-solid fa-school"></i>
          </div>
          <h4 class="font-bold text-sm text-slate-900">Règle Campus Unique</h4>
          <p class="text-xs text-slate-500">
            Chaque groupe (ex: 2DSI G3) étudie dans un seul et unique campus (Targa ou Guéliz). Zéro temps de trajet perdu.
          </p>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
            <i class="fa-solid fa-person-chalkboard"></i>
          </div>
          <h4 class="font-bold text-sm text-slate-900">Sanctuarisation Vacataires P1</h4>
          <p class="text-xs text-slate-500">
            Les créneaux des intervenants vacataires sont affectés en Passe 1 rigide avant les enseignants permanents (18h).
          </p>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
          <div class="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <h4 class="font-bold text-sm text-slate-900">Seuil des 20% d'Absences</h4>
          <p class="text-xs text-slate-500">
            Tout cumul dépassant 18 heures (sur module de 90h) entraîne l'exclusion automatique des examens de fin de semestre.
          </p>
        </div>

      </div>

    </div>
  `
})
export class DashboardComponent {}
