import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalleService } from '../../core/services/salle.service';
import { Salle, TypeSalle } from '../../core/models/models';

@Component({
  selector: 'app-salles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">

      <!-- En-tête de page -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-black text-slate-900 tracking-tight">Parc des Salles & Laboratoires</h2>
          <p class="text-xs text-slate-500 font-medium">
            Gestion technique des salles informatiques (LI_PC), laboratoires réseaux (LR_RESEAUX) et salles de cours.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Bouton Import Excel -->
          <label class="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all">
            <i class="fa-solid fa-file-excel"></i>
            <span>Importer Excel (.xlsx)</span>
            <input type="file" (change)="onExcelSelected($event)" accept=".xlsx, .xls" class="hidden">
          </label>

          <!-- Bouton Nouvelle Salle -->
          <button (click)="openAddModal = true" class="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all">
            <i class="fa-solid fa-plus"></i>
            <span>Nouvelle Salle</span>
          </button>
        </div>
      </div>

      <!-- Filtres Campus & Type -->
      <div class="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-500">Campus :</span>
          <select [(ngModel)]="selectedCampus" (change)="filtrer()" class="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none">
            <option [ngValue]="0">Tous les campus</option>
            <option [ngValue]="1">Campus Targa</option>
            <option [ngValue]="2">Campus Centre Guéliz</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-slate-500">Type :</span>
          <select [(ngModel)]="selectedType" (change)="filtrer()" class="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none">
            <option value="ALL">Tous les types</option>
            <option value="LI_PC">Laboratoire PC (LI_PC)</option>
            <option value="LR_RESEAUX">Laboratoire Réseaux (LR_RESEAUX)</option>
            <option value="STANDARD">Salle Standard</option>
            <option value="AMPHI">Amphithéâtre</option>
          </select>
        </div>

        <span class="ml-auto text-xs font-semibold text-slate-400">
          {{ sallesAffichees.length }} salle(s) trouvée(s)
        </span>
      </div>

      <!-- Message Feedback Excel -->
      <div *ngIf="uploadSuccess" class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
        <i class="fa-solid fa-circle-check text-emerald-600"></i>
        <span>Fichier Excel téléversé et intégré avec succès dans MySQL Laragon !</span>
      </div>

      <!-- Tableau des Salles -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
              <th class="p-3.5">Code Salle</th>
              <th class="p-3.5">Campus</th>
              <th class="p-3.5">Type Technique</th>
              <th class="p-3.5 text-center">Capacité</th>
              <th class="p-3.5 text-center">PC Opérationnels</th>
              <th class="p-3.5">Spécifications Équipements</th>
              <th class="p-3.5 text-center">Disponibilité</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let s of sallesAffichees" class="hover:bg-slate-50/80 transition-all">
              <td class="p-3.5 font-mono font-bold text-slate-900">{{ s.codeSalle }}</td>
              <td class="p-3.5 font-semibold text-slate-600">{{ s.campusNom || 'Campus Targa' }}</td>
              <td class="p-3.5">
                <span [class]="getTypeBadgeClass(s.typeSalle)">
                  {{ s.typeSalle }}
                </span>
              </td>
              <td class="p-3.5 text-center font-bold text-slate-800">{{ s.capacite }} places</td>
              <td class="p-3.5 text-center">
                <span *ngIf="s.nombrePcOperationnels > 0" class="px-2 py-0.5 rounded font-mono font-bold bg-blue-50 text-blue-700">
                  {{ s.nombrePcOperationnels }} PC
                </span>
                <span *ngIf="s.nombrePcOperationnels === 0" class="text-slate-400">-</span>
              </td>
              <td class="p-3.5 text-slate-600 text-[11px] max-w-xs truncate" [title]="s.specsEquipements || ''">
                {{ s.specsEquipements || 'Standard projecteur 4K' }}
              </td>
              <td class="p-3.5 text-center">
                <span *ngIf="s.estDisponible" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Libre
                </span>
                <span *ngIf="!s.estDisponible" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                  Occupée
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modale Nouvelle Salle -->
      <div *ngIf="openAddModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="font-bold text-sm text-slate-900">Ajouter une nouvelle salle</h3>
            <button (click)="openAddModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <div class="space-y-3 text-xs font-semibold">
            <div>
              <label class="block text-slate-500 mb-1">Code de la salle (ex: LI 9, LR 2, Salle T)</label>
              <input type="text" [(ngModel)]="newSalle.codeSalle" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-mono">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-500 mb-1">Campus</label>
                <select [(ngModel)]="newSalle.campusId" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold">
                  <option [ngValue]="1">Campus Targa</option>
                  <option [ngValue]="2">Campus Centre Guéliz</option>
                </select>
              </div>

              <div>
                <label class="block text-slate-500 mb-1">Type technique</label>
                <select [(ngModel)]="newSalle.typeSalle" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold">
                  <option value="LI_PC">LI_PC</option>
                  <option value="LR_RESEAUX">LR_RESEAUX</option>
                  <option value="STANDARD">STANDARD</option>
                  <option value="AMPHI">AMPHI</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-500 mb-1">Capacité assise</label>
                <input type="number" [(ngModel)]="newSalle.capacite" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold">
              </div>

              <div>
                <label class="block text-slate-500 mb-1">PC opérationnels</label>
                <input type="number" [(ngModel)]="newSalle.nombrePcOperationnels" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none font-bold">
              </div>
            </div>

            <div>
              <label class="block text-slate-500 mb-1">Spécifications matérielles</label>
              <textarea [(ngModel)]="newSalle.specsEquipements" rows="2" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"></textarea>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button (click)="openAddModal = false" class="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs">Annuler</button>
            <button (click)="ajouterSalle()" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs">Enregistrer</button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class SallesComponent implements OnInit {
  salles: Salle[] = [];
  sallesAffichees: Salle[] = [];
  selectedCampus = 0;
  selectedType = 'ALL';
  openAddModal = false;
  uploadSuccess = false;

  newSalle: Salle = {
    campusId: 1,
    codeSalle: '',
    typeSalle: 'LI_PC',
    capacite: 36,
    nombrePcOperationnels: 34,
    specsEquipements: '',
    estDisponible: true
  };

  constructor(private salleService: SalleService) {}

  ngOnInit() {
    this.chargerSalles();
  }

  chargerSalles() {
    this.salleService.getSalles(0, 50).subscribe(res => {
      this.salles = res.content;
      this.filtrer();
    });
  }

  filtrer() {
    this.sallesAffichees = this.salles.filter(s => {
      const matchCampus = this.selectedCampus === 0 || s.campusId === this.selectedCampus;
      const matchType = this.selectedType === 'ALL' || s.typeSalle === this.selectedType;
      return matchCampus && matchType;
    });
  }

  onExcelSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.salleService.importerExcel(file, 1).subscribe(() => {
        this.uploadSuccess = true;
        this.chargerSalles();
        setTimeout(() => this.uploadSuccess = false, 4000);
      });
    }
  }

  ajouterSalle() {
    if (!this.newSalle.codeSalle) return;
    this.salleService.createSalle(this.newSalle).subscribe(() => {
      this.openAddModal = false;
      this.chargerSalles();
      this.newSalle.codeSalle = '';
    });
  }

  getTypeBadgeClass(type: TypeSalle): string {
    switch (type) {
      case 'LI_PC': return 'px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 font-mono';
      case 'LR_RESEAUX': return 'px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 font-mono';
      case 'AMPHI': return 'px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 font-mono';
      default: return 'px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 font-mono';
    }
  }
}
