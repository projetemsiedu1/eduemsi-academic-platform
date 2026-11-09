import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Groupe, PageResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class GroupeService {
  private readonly baseUrl = `${environment.apiUrl}/groupes`;

  private readonly mockGroupes: Groupe[] = [
    { id: 1, filiereId: 1, filiereCode: '5A-IIR', filiereLibelle: 'Ingénierie Informatique et Réseaux', campusFixeId: 1, campusFixeNom: 'Campus Targa', codeGroupe: '2DSI G3', anneeEtude: 5, optionSpecialite: 'Développement Digital & SI', effectif: 32, delegueNom: 'Ilyass Ait Ouahman', laboratoiresRequis: 'LI_PC,LR_RESEAUX' },
    { id: 2, filiereId: 1, filiereCode: '5A-IIR', filiereLibelle: 'Ingénierie Informatique et Réseaux', campusFixeId: 1, campusFixeNom: 'Campus Targa', codeGroupe: '2DSI G1', anneeEtude: 5, optionSpecialite: 'Développement Digital & SI', effectif: 35, delegueNom: 'Amine Bella', laboratoiresRequis: 'LI_PC,LR_RESEAUX' },
    { id: 3, filiereId: 1, filiereCode: '5A-IIR', filiereLibelle: 'Ingénierie Informatique et Réseaux', campusFixeId: 1, campusFixeNom: 'Campus Targa', codeGroupe: 'GL G2', anneeEtude: 5, optionSpecialite: 'Génie Logiciel & Cloud', effectif: 34, delegueNom: 'Sara El Mansouri', laboratoiresRequis: 'LI_PC' },
    { id: 4, filiereId: 3, filiereCode: '5A-GI', filiereLibelle: 'Génie Industriel', campusFixeId: 2, campusFixeNom: 'Campus Centre Gueliz', codeGroupe: '5A-GI G1', anneeEtude: 5, optionSpecialite: 'Supply Chain 4.0', effectif: 27, delegueNom: 'Ikram Mellakh', laboratoiresRequis: 'LI_PC' }
  ];

  constructor(private http: HttpClient) {}

  getGroupes(page = 0, size = 15): Observable<PageResponse<Groupe>> {
    return this.http.get<PageResponse<Groupe>>(`${this.baseUrl}?page=${page}&size=${size}`).pipe(
      catchError(() => of({
        content: this.mockGroupes,
        pageNumber: 0,
        pageSize: size,
        totalElements: this.mockGroupes.length,
        totalPages: 1,
        first: true,
        last: true
      }))
    );
  }

  getGroupesByCampus(campusId: number, page = 0, size = 15): Observable<PageResponse<Groupe>> {
    return this.http.get<PageResponse<Groupe>>(`${this.baseUrl}/campus/${campusId}?page=${page}&size=${size}`).pipe(
      catchError(() => {
        const filtered = this.mockGroupes.filter(g => g.campusFixeId === campusId);
        return of({
          content: filtered,
          pageNumber: 0,
          pageSize: size,
          totalElements: filtered.length,
          totalPages: 1,
          first: true,
          last: true
        });
      })
    );
  }

  createGroupe(groupe: Groupe): Observable<Groupe> {
    return this.http.post<Groupe>(this.baseUrl, groupe).pipe(
      catchError(() => {
        const newG = { ...groupe, id: Date.now() };
        this.mockGroupes.push(newG);
        return of(newG);
      })
    );
  }

  updateEffectif(id: number, newEffectif: number): Observable<Groupe> {
    return this.http.patch<Groupe>(`${this.baseUrl}/${id}/effectif?newEffectif=${newEffectif}`, {}).pipe(
      catchError(() => {
        const g = this.mockGroupes.find(item => item.id === id);
        if (g) g.effectif = newEffectif;
        return of(g as Groupe);
      })
    );
  }
}
