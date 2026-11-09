import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendHealthService {
  readonly isBackendOnline = signal<boolean>(false);
  readonly statusMessage = signal<string>('Vérification du backend Spring Boot...');
  readonly lastChecked = signal<Date | null>(null);

  constructor(private http: HttpClient) {
    this.checkHealth();
  }

  checkHealth() {
    this.http.get<{ totalElements: number }>(`${environment.apiUrl}/salles?page=0&size=1`)
      .pipe(
        tap((res) => {
          this.isBackendOnline.set(true);
          this.statusMessage.set(`Spring Boot 8080 & MySQL Laragon Actifs (${res.totalElements} salles)`);
          this.lastChecked.set(new Date());
        }),
        catchError((err) => {
          this.isBackendOnline.set(false);
          this.statusMessage.set('Mode Autonome / Fallback Déterministe Actif');
          this.lastChecked.set(new Date());
          return of(null);
        })
      )
      .subscribe();
  }
}
