import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse, Salle } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class SalleService {
  private readonly baseUrl = `${environment.apiUrl}/salles`;

  private readonly mockSalles: Salle[] = [
    { id: 1, campusId: 1, campusNom: 'Campus Targa', codeSalle: 'LI 8', typeSalle: 'LI_PC', capacite: 38, nombrePcOperationnels: 36, specsEquipements: '36 PC Dell i7 32GB RAM + GPU RTX 4080 (JEE Microservices)', estDisponible: true },
    { id: 2, campusId: 1, campusNom: 'Campus Targa', codeSalle: 'LI 3', typeSalle: 'LI_PC', capacite: 36, nombrePcOperationnels: 34, specsEquipements: '34 PC Dell i7 32GB RAM + CUDA GPU (Deep Learning)', estDisponible: true },
    { id: 3, campusId: 1, campusNom: 'Campus Targa', codeSalle: 'LI 4', typeSalle: 'LI_PC', capacite: 38, nombrePcOperationnels: 35, specsEquipements: '35 PC HP 16GB RAM SSD 1To (Optimisation Bases de données)', estDisponible: true },
    { id: 4, campusId: 1, campusNom: 'Campus Targa', codeSalle: 'LR Targa', typeSalle: 'LR_RESEAUX', capacite: 36, nombrePcOperationnels: 32, specsEquipements: '32 PC + Baies Cisco Switch 2960 & Routeurs 2901', estDisponible: true },
    { id: 5, campusId: 1, campusNom: 'Campus Targa', codeSalle: 'Salle R', typeSalle: 'STANDARD', capacite: 42, nombrePcOperationnels: 0, specsEquipements: 'Salle de cours interactif + Vidéoprojecteur 4K', estDisponible: true },
    { id: 6, campusId: 1, campusNom: 'Campus Targa', codeSalle: 'Salle S', typeSalle: 'STANDARD', capacite: 40, nombrePcOperationnels: 0, specsEquipements: 'Salle de cours standard (Gouvernance des SI)', estDisponible: true },
    { id: 11, campusId: 2, campusNom: 'Campus Centre Gueliz', codeSalle: 'LR Centre', typeSalle: 'LR_RESEAUX', capacite: 35, nombrePcOperationnels: 30, specsEquipements: '30 PC + Baies Cisco Réseaux Campus Centre', estDisponible: true },
    { id: 12, campusId: 2, campusNom: 'Campus Centre Gueliz', codeSalle: 'LI 2 Centre', typeSalle: 'LI_PC', capacite: 35, nombrePcOperationnels: 32, specsEquipements: '32 PC Stations CAO (Génie Industriel)', estDisponible: true }
  ];

  constructor(private http: HttpClient) {}

  getSalles(page = 0, size = 15): Observable<PageResponse<Salle>> {
    return this.http.get<PageResponse<Salle>>(`${this.baseUrl}?page=${page}&size=${size}`).pipe(
      catchError(() => of({
        content: this.mockSalles,
        pageNumber: 0,
        pageSize: size,
        totalElements: this.mockSalles.length,
        totalPages: 1,
        first: true,
        last: true
      }))
    );
  }

  getSallesByCampus(campusId: number, page = 0, size = 15): Observable<PageResponse<Salle>> {
    return this.http.get<PageResponse<Salle>>(`${this.baseUrl}/campus/${campusId}?page=${page}&size=${size}`).pipe(
      catchError(() => {
        const filtered = this.mockSalles.filter(s => s.campusId === campusId);
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

  createSalle(salle: Salle): Observable<Salle> {
    return this.http.post<Salle>(this.baseUrl, salle).pipe(
      catchError(() => {
        const newSalle = { ...salle, id: Date.now() };
        this.mockSalles.push(newSalle);
        return of(newSalle);
      })
    );
  }

  importerExcel(file: File, campusId: number): Observable<Salle[]> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('campusId', campusId.toString());
    return this.http.post<Salle[]>(`${this.baseUrl}/import-excel`, formData).pipe(
      catchError(() => of(this.mockSalles.filter(s => s.campusId === campusId)))
    );
  }
}
