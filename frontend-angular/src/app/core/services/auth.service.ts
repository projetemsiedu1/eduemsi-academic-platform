import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CurrentUser, UserRole } from '../models/models';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  username: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  campusId?: number;
  campusNom?: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  nom: string;
  prenom: string;
  role: string;
  campusId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly jwtToken = signal<string | null>(localStorage.getItem('emsi_jwt_token'));
  readonly isAuthenticated = computed(() => !!this.jwtToken());

  readonly currentUser = signal<CurrentUser>({
    id: 1,
    matricule: 'EMSI-ADM-01',
    nom: 'Moussaoui',
    prenom: 'Moad',
    email: 'moad.moussaoui@emsi.ma',
    role: 'SUPER_ADMIN',
    roleLabel: 'Super Administrateur',
    campusDefaut: 'Campus Targa & Guéliz',
    avatarClass: 'bg-emerald-700 text-white'
  });

  readonly isSuperAdmin = computed(() => this.currentUser().role === 'SUPER_ADMIN');

  constructor() {
    const savedUser = localStorage.getItem('emsi_current_user');
    if (savedUser) {
      try {
        this.currentUser.set(JSON.parse(savedUser));
      } catch (e) {
        console.error('Erreur de lecture du profil stocké :', e);
      }
    }
  }

  getWorkspaceRouteForRole(role: string): string {
    const normalized = role.replace('ROLE_', '');
    switch (normalized) {
      case 'SUPER_ADMIN':
        return '/espace-admin';
      case 'RESPONSABLE_FILIERE':
      case 'CHEF_FILIERE':
        return '/espace-filiere';
      case 'RESPONSABLE_PLANNING':
      case 'RESP_PLANNING':
        return '/espace-planning';
      case 'RESPONSABLE_PFE':
      case 'RESP_PFE':
        return '/espace-pfe';
      case 'RESPONSABLE_SCOLARITE':
      case 'RESP_SCOLARITE':
        return '/espace-scolarite';
      case 'PROFESSEUR_PERMANENT':
      case 'PROFESSEUR_VACATAIRE':
      case 'ENSEIGNANT_PERMANENT':
      case 'ENSEIGNANT_VACATAIRE':
        return '/espace-professeur';
      case 'ETUDIANT':
        return '/espace-etudiant';
      default:
        return '/espace-admin';
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { username, password }).pipe(
      tap((res) => {
        this.jwtToken.set(res.accessToken);
        localStorage.setItem('emsi_jwt_token', res.accessToken);

        const roleClean = (res.role.replace('ROLE_', '') as UserRole) || 'SUPER_ADMIN';
        const userObj: CurrentUser = {
          id: res.userId,
          matricule: 'EMSI-' + res.username.toUpperCase(),
          nom: res.nom,
          prenom: res.prenom,
          email: res.email,
          role: roleClean,
          roleLabel: res.role.replace('ROLE_', '').replace(/_/g, ' '),
          campusDefaut: res.campusNom || 'Campus Targa',
          avatarClass: 'bg-emerald-700 text-white'
        };

        this.currentUser.set(userObj);
        localStorage.setItem('emsi_current_user', JSON.stringify(userObj));
      })
    );
  }

  register(payload: RegisterPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/register`, payload).pipe(
      tap((res) => {
        this.jwtToken.set(res.accessToken);
        localStorage.setItem('emsi_jwt_token', res.accessToken);

        const roleClean = (res.role.replace('ROLE_', '') as UserRole) || 'ETUDIANT';
        const userObj: CurrentUser = {
          id: res.userId,
          matricule: 'EMSI-' + res.username.toUpperCase(),
          nom: res.nom,
          prenom: res.prenom,
          email: res.email,
          role: roleClean,
          roleLabel: res.role.replace('ROLE_', '').replace(/_/g, ' '),
          campusDefaut: res.campusNom || 'Campus Targa',
          avatarClass: 'bg-indigo-700 text-white'
        };

        this.currentUser.set(userObj);
        localStorage.setItem('emsi_current_user', JSON.stringify(userObj));
      })
    );
  }

  logout() {
    this.jwtToken.set(null);
    localStorage.removeItem('emsi_jwt_token');
    localStorage.removeItem('emsi_current_user');
    this.router.navigate(['/login']);
  }

  changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    return this.http.post(`${environment.apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword,
      confirmPassword
    });
  }
}
