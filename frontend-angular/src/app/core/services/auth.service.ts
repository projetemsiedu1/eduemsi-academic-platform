import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly defaultUsers: Record<UserRole, CurrentUser> = {
    SUPER_ADMIN: {
      id: 1,
      matricule: 'EMSI-ADM-01',
      nom: 'Moussaoui',
      prenom: 'Moad',
      email: 'moad.moussaoui@emsi.ma',
      role: 'SUPER_ADMIN',
      roleLabel: 'Super Administrateur',
      campusDefaut: 'Campus Targa & Guéliz',
      avatarClass: 'bg-emerald-700 text-white'
    },
    CHEF_FILIERE: {
      id: 2,
      matricule: 'EMSI-DIR-02',
      nom: 'Berrada',
      prenom: 'Pr. Nadia',
      email: 'nadia.berrada@emsi.ma',
      role: 'CHEF_FILIERE',
      roleLabel: 'Responsable Filière IIR & GI',
      campusDefaut: 'Campus Targa',
      avatarClass: 'bg-indigo-700 text-white'
    },
    RESP_PLANNING: {
      id: 3,
      matricule: 'EMSI-PLN-04',
      nom: 'Tazi',
      prenom: 'Pr. Mehdi',
      email: 'mehdi.tazi@emsi.ma',
      role: 'RESP_PLANNING',
      roleLabel: 'Responsable Planning & Salles',
      campusDefaut: 'Campus Targa',
      avatarClass: 'bg-blue-700 text-white'
    },
    RESP_PFE: {
      id: 4,
      matricule: 'EMSI-PFE-03',
      nom: 'Abod',
      prenom: 'Pr. Brahim',
      email: 'brahim.abod@emsi.ma',
      role: 'RESP_PFE',
      roleLabel: 'Responsable PFE & Jurys',
      campusDefaut: 'Campus Targa',
      avatarClass: 'bg-purple-700 text-white'
    },
    RESP_SCOLARITE: {
      id: 5,
      matricule: 'EMSI-SCO-05',
      nom: 'Bennani',
      prenom: 'Mme. Siham',
      email: 'siham.bennani@emsi.ma',
      role: 'RESP_SCOLARITE',
      roleLabel: 'Responsable Scolarité & Absences',
      campusDefaut: 'Campus Guéliz & Targa',
      avatarClass: 'bg-amber-700 text-white'
    },
    ENSEIGNANT_PERMANENT: {
      id: 6,
      matricule: 'ENS-PERM-02',
      nom: 'Alami',
      prenom: 'Pr. Amine',
      email: 'amine.alami@emsi.ma',
      role: 'ENSEIGNANT_PERMANENT',
      roleLabel: 'Professeur Permanent (Quota 18h)',
      campusDefaut: 'Campus Targa',
      avatarClass: 'bg-teal-700 text-white'
    },
    ENSEIGNANT_VACATAIRE: {
      id: 7,
      matricule: 'ENS-VAC-01',
      nom: 'Kadiri',
      prenom: 'Pr. Yassine',
      email: 'yassine.kadiri@emsi.ma',
      role: 'ENSEIGNANT_VACATAIRE',
      roleLabel: 'Professeur Vacataire (Priorité 1 P1)',
      campusDefaut: 'Campus Targa',
      avatarClass: 'bg-cyan-700 text-white'
    },
    ETUDIANT: {
      id: 8,
      matricule: 'ETU-2026-08',
      nom: 'Benjelloun',
      prenom: 'Anas',
      email: 'anas.benjelloun@emsi.ma',
      role: 'ETUDIANT',
      roleLabel: 'Étudiant 5ème Année (5A-IIR G1)',
      campusDefaut: 'Campus Targa',
      avatarClass: 'bg-slate-700 text-white'
    }
  };

  private readonly credentialsMap: Record<UserRole, { u: string; p: string }> = {
    SUPER_ADMIN: { u: 'admin', p: 'Admin@2026!' },
    CHEF_FILIERE: { u: 'resp_filiere', p: 'Emsi@2026!' },
    RESP_PLANNING: { u: 'resp_planning', p: 'Emsi@2026!' },
    RESP_PFE: { u: 'resp_pfe', p: 'Emsi@2026!' },
    RESP_SCOLARITE: { u: 'resp_scolarite', p: 'Emsi@2026!' },
    ENSEIGNANT_PERMANENT: { u: 'prof_permanent', p: 'Emsi@2026!' },
    ENSEIGNANT_VACATAIRE: { u: 'prof_vacataire', p: 'Emsi@2026!' },
    ETUDIANT: { u: 'etudiant', p: 'Emsi@2026!' }
  };

  readonly currentUser = signal<CurrentUser>(this.defaultUsers['SUPER_ADMIN']);
  readonly jwtToken = signal<string | null>(localStorage.getItem('emsi_jwt_token'));
  readonly isAuthenticated = computed(() => !!this.jwtToken());
  readonly isSuperAdmin = computed(() => this.currentUser().role === 'SUPER_ADMIN');
  readonly isPlanningResp = computed(() => this.currentUser().role === 'RESP_PLANNING' || this.isSuperAdmin());
  readonly isPfeResp = computed(() => this.currentUser().role === 'RESP_PFE' || this.isSuperAdmin());

  constructor() {
    // Tenter de restaurer la session ou se connecter par défaut
    this.autoLoginDefault();
  }

  private autoLoginDefault() {
    const creds = this.credentialsMap['SUPER_ADMIN'];
    this.login(creds.u, creds.p).subscribe({
      next: (res) => console.log('[AUTH] Connexion JWT automatique active :', res.username),
      error: () => console.warn('[AUTH] Serveur local non encore joignable ou initialisé.')
    });
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { username, password }).pipe(
      tap((res) => {
        this.jwtToken.set(res.accessToken);
        localStorage.setItem('emsi_jwt_token', res.accessToken);

        // Mettre à jour l'utilisateur courant
        const matched = Object.values(this.defaultUsers).find(
          (u) => u.email === res.email || u.nom.toLowerCase() === res.nom.toLowerCase()
        );
        if (matched) {
          this.currentUser.set(matched);
        } else {
          this.currentUser.set({
            id: res.userId,
            matricule: 'EMSI-USER-' + res.userId,
            nom: res.nom,
            prenom: res.prenom,
            email: res.email,
            role: (res.role.replace('ROLE_', '') as UserRole) || 'SUPER_ADMIN',
            roleLabel: res.role,
            campusDefaut: res.campusNom || 'Campus Targa',
            avatarClass: 'bg-emerald-700 text-white'
          });
        }
      })
    );
  }

  logout() {
    this.jwtToken.set(null);
    localStorage.removeItem('emsi_jwt_token');
  }

  switchRole(role: UserRole) {
    if (this.defaultUsers[role]) {
      this.currentUser.set(this.defaultUsers[role]);
      const creds = this.credentialsMap[role];
      if (creds) {
        this.login(creds.u, creds.p).subscribe({
          next: () => console.log(`[AUTH] Switched to ${role} with fresh JWT`),
          error: (err) => console.error(`[AUTH] Switch failed:`, err)
        });
      }
    }
  }

  changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    return this.http.post(`${environment.apiUrl}/auth/change-password`, {
      currentPassword,
      newPassword,
      confirmPassword
    });
  }

  getAllUsers(): CurrentUser[] {
    return Object.values(this.defaultUsers);
  }
}
