import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface EtudiantAbsence {
  mat: string;
  nom: string;
  groupe: string;
  campus: string;
  cumulAbsencesHeures: number;
  totalHeuresModule: number;
  statut: 'EN_REGLE' | 'AVERTISSEMENT' | 'RADIE';
}

@Component({
  selector: 'app-scolarite',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">

      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-black text-slate-900 tracking-tight">Scolarité & Contrôle de l'Assiduité</h2>
          <p class="text-xs text-slate-500 font-medium">
            Règle Absolue EMSI des 20% : Tout cumul supérieur à 18h d'absence entraîne la radiation automatique de l'examen final.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
            Seuil Critique : 18.00h (20% de 90h)
          </span>
        </div>
      </div>

      <!-- Métriques d'assiduité -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span class="text-xs font-bold text-slate-400 block mb-1">Taux Global d'Assiduité</span>
          <span class="text-2xl font-black text-emerald-600">91.4%</span>
        </div>

        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span class="text-xs font-bold text-slate-400 block mb-1">Étudiants en Alerte (>12h)</span>
          <span class="text-2xl font-black text-amber-600">8</span>
        </div>

        <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span class="text-xs font-bold text-slate-400 block mb-1">Radiés d'Examen (>18h)</span>
          <span class="text-2xl font-black text-rose-600">2</span>
        </div>
      </div>

      <!-- Tableau des Absences par Étudiant -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
              <th class="p-3.5">Matricule</th>
              <th class="p-3.5">Nom & Prénom</th>
              <th class="p-3.5">Groupe</th>
              <th class="p-3.5">Campus</th>
              <th class="p-3.5 text-center">Cumul Absences</th>
              <th class="p-3.5">Taux d'Absence</th>
              <th class="p-3.5 text-center">Décision Réglementaire</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let e of etudiants" class="hover:bg-slate-50/80 transition-all">
              <td class="p-3.5 font-mono font-bold text-slate-500">{{ e.mat }}</td>
              <td class="p-3.5 font-bold text-slate-900">{{ e.nom }}</td>
              <td class="p-3.5 font-semibold text-slate-700">{{ e.groupe }}</td>
              <td class="p-3.5 text-slate-600">{{ e.campus }}</td>
              <td class="p-3.5 text-center font-mono font-black" [class]="e.cumulAbsencesHeures >= 18 ? 'text-rose-600' : 'text-slate-800'">
                {{ e.cumulAbsencesHeures.toFixed(1) }} h
              </td>
              <td class="p-3.5">
                <div class="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    [class]="getBarClass(e.cumulAbsencesHeures)"
                    [style.width.%]="(e.cumulAbsencesHeures / 18) * 100">
                  </div>
                </div>
              </td>
              <td class="p-3.5 text-center">
                <span *ngIf="e.cumulAbsencesHeures >= 18" class="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 uppercase tracking-wide">
                  Radié de l'Examen
                </span>
                <span *ngIf="e.cumulAbsencesHeures >= 12 && e.cumulAbsencesHeures < 18" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                  Avertissement
                </span>
                <span *ngIf="e.cumulAbsencesHeures < 12" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                  En Règle
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  `
})
export class ScolariteComponent {
  etudiants: EtudiantAbsence[] = [
    { mat: 'ETU-2026-01', nom: 'Ilyass Ait Ouahman', groupe: '2DSI G3', campus: 'Campus Targa', cumulAbsencesHeures: 3.0, totalHeuresModule: 90, statut: 'EN_REGLE' },
    { mat: 'ETU-2026-02', nom: 'Amine Bella', groupe: '2DSI G3', campus: 'Campus Targa', cumulAbsencesHeures: 4.5, totalHeuresModule: 90, statut: 'EN_REGLE' },
    { mat: 'ETU-2026-03', nom: 'Hamza Chraibi', groupe: '2DSI G3', campus: 'Campus Targa', cumulAbsencesHeures: 19.5, totalHeuresModule: 90, statut: 'RADIE' },
    { mat: 'ETU-2026-04', nom: 'Sara El Mansouri', groupe: 'GL G2', campus: 'Campus Targa', cumulAbsencesHeures: 6.0, totalHeuresModule: 90, statut: 'EN_REGLE' },
    { mat: 'ETU-2026-05', nom: 'Yassine Berrada', groupe: 'GL G2', campus: 'Campus Targa', cumulAbsencesHeures: 13.5, totalHeuresModule: 90, statut: 'AVERTISSEMENT' },
    { mat: 'ETU-2026-06', nom: 'Othmane Bennani', groupe: '5A-GI G1', campus: 'Campus Centre Guéliz', cumulAbsencesHeures: 21.0, totalHeuresModule: 90, statut: 'RADIE' }
  ];

  getBarClass(heures: number): string {
    if (heures >= 18) return 'bg-rose-600 h-2';
    if (heures >= 12) return 'bg-amber-500 h-2';
    return 'bg-emerald-500 h-2';
  }
}
