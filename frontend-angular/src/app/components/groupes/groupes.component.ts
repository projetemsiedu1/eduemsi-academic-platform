import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupeService } from '../../core/services/groupe.service';
import { Groupe } from '../../core/models/models';

@Component({
  selector: 'app-groupes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-black text-slate-900 tracking-tight">Filières & Groupes d'Étudiants</h2>
          <p class="text-xs text-slate-500 font-medium">
            Règle Absolue EMSI : Chaque groupe est assigné à un campus fixe (zéro navette inter-campus).
          </p>
        </div>

        <button (click)="openModal = true" class="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all">
          <i class="fa-solid fa-plus"></i>
          <span>Nouveau Groupe</span>
        </button>
      </div>

      <!-- Filtre Campus -->
      <div class="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <span class="text-xs font-bold text-slate-500">Filtrer par Campus Fixe :</span>
        <button
          (click)="filtrerCampus(0)"
          [class]="selectedCampus === 0 ? 'px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs' : 'px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs'">
          Tous ({{ groupes.length }})
        </button>
        <button
          (click)="filtrerCampus(1)"
          [class]="selectedCampus === 1 ? 'px-3 py-1.5 rounded-xl bg-emerald-700 text-white font-bold text-xs' : 'px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs'">
          Campus Targa
        </button>
        <button
          (click)="filtrerCampus(2)"
          [class]="selectedCampus === 2 ? 'px-3 py-1.5 rounded-xl bg-blue-700 text-white font-bold text-xs' : 'px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs'">
          Campus Centre Guéliz
        </button>
      </div>

      <!-- Tableau des Groupes -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
              <th class="p-3.5">Code Groupe</th>
              <th class="p-3.5">Filière</th>
              <th class="p-3.5">Campus Fixe Sanctuarisé</th>
              <th class="p-3.5">Option & Spécialité</th>
              <th class="p-3.5 text-center">Effectif Réel</th>
              <th class="p-3.5">Délégué de Groupe</th>
              <th class="p-3.5">Labos Requis</th>
              <th class="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let g of groupesAffiches" class="hover:bg-slate-50/80 transition-all">
              <td class="p-3.5 font-bold text-slate-900 font-mono">{{ g.codeGroupe }}</td>
              <td class="p-3.5 font-semibold text-slate-700">{{ g.filiereCode }}</td>
              <td class="p-3.5">
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 w-fit">
                  <i class="fa-solid fa-location-dot text-emerald-600"></i>
                  {{ g.campusFixeNom || 'Campus Targa' }}
                </span>
              </td>
              <td class="p-3.5 text-slate-600">{{ g.optionSpecialite }}</td>
              <td class="p-3.5 text-center">
                <span class="font-extrabold text-slate-900 font-mono text-sm bg-slate-100 px-2 py-0.5 rounded">
                  {{ g.effectif }}
                </span>
              </td>
              <td class="p-3.5 font-medium text-slate-700">{{ g.delegueNom || 'Non renseigné' }}</td>
              <td class="p-3.5">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700">
                  {{ g.laboratoiresRequis }}
                </span>
              </td>
              <td class="p-3.5 text-right">
                <button (click)="modifierEffectif(g)" class="px-2.5 py-1 text-xs font-bold text-brand-600 hover:bg-brand-50 rounded-lg">
                  Ajuster Effectif
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modale Nouveau Groupe -->
      <div *ngIf="openModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="font-bold text-sm text-slate-900">Créer un nouveau groupe d'étudiants</h3>
            <button (click)="openModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <div class="space-y-3 text-xs font-semibold">
            <div>
              <label class="block text-slate-500 mb-1">Code du groupe (ex: 2DSI G4, GL G3)</label>
              <input type="text" [(ngModel)]="newGroupe.codeGroupe" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-mono">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-500 mb-1">Filière</label>
                <select [(ngModel)]="newGroupe.filiereId" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold">
                  <option [ngValue]="1">5A-IIR</option>
                  <option [ngValue]="2">4A-IIR</option>
                  <option [ngValue]="3">5A-GI</option>
                  <option [ngValue]="4">5A-IFA</option>
                </select>
              </div>

              <div>
                <label class="block text-slate-500 mb-1">Campus Fixe Assigné</label>
                <select [(ngModel)]="newGroupe.campusFixeId" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold">
                  <option [ngValue]="1">Campus Targa</option>
                  <option [ngValue]="2">Campus Centre Guéliz</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-500 mb-1">Effectif réel</label>
                <input type="number" [(ngModel)]="newGroupe.effectif" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold">
              </div>

              <div>
                <label class="block text-slate-500 mb-1">Nom du délégué</label>
                <input type="text" [(ngModel)]="newGroupe.delegueNom" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none">
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button (click)="openModal = false" class="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs">Annuler</button>
            <button (click)="ajouterGroupe()" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs">Créer le groupe</button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class GroupesComponent implements OnInit {
  groupes: Groupe[] = [];
  groupesAffiches: Groupe[] = [];
  selectedCampus = 0;
  openModal = false;

  newGroupe: Groupe = {
    filiereId: 1,
    campusFixeId: 1,
    codeGroupe: '',
    anneeEtude: 5,
    optionSpecialite: 'Développement Digital & SI',
    effectif: 32,
    delegueNom: '',
    laboratoiresRequis: 'LI_PC,LR_RESEAUX'
  };

  constructor(private groupeService: GroupeService) {}

  ngOnInit() {
    this.chargerGroupes();
  }

  chargerGroupes() {
    this.groupeService.getGroupes(0, 50).subscribe(res => {
      this.groupes = res.content;
      this.filtrerCampus(this.selectedCampus);
    });
  }

  filtrerCampus(campusId: number) {
    this.selectedCampus = campusId;
    if (campusId === 0) {
      this.groupesAffiches = [...this.groupes];
    } else {
      this.groupesAffiches = this.groupes.filter(g => g.campusFixeId === campusId);
    }
  }

  modifierEffectif(g: Groupe) {
    const val = prompt(`Nouvel effectif pour ${g.codeGroupe} (actuel : ${g.effectif}) :`, g.effectif.toString());
    if (val && !isNaN(Number(val))) {
      const num = parseInt(val, 10);
      if (g.id) {
        this.groupeService.updateEffectif(g.id, num).subscribe(() => this.chargerGroupes());
      }
    }
  }

  ajouterGroupe() {
    if (!this.newGroupe.codeGroupe) return;
    this.groupeService.createGroupe(this.newGroupe).subscribe(() => {
      this.openModal = false;
      this.chargerGroupes();
      this.newGroupe.codeGroupe = '';
    });
  }
}
