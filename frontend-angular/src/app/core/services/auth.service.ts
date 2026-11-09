import { Injectable, signal, computed } from '@angular/core';
import { CurrentUser, UserRole } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly defaultUsers: Record<UserRole, CurrentUser> = {
    SUPER_ADMIN: {
      id: 1,
      matricule: 'EMSI-ADM-01',
      nom: 'Moussaoui',
      prenom: 'Moad',
      email: 'admin@emsi-edu.ma',
      role: 'SUPER_ADMIN',
      roleLabel: 'Super Administrateur',
      campusDefaut: 'Campus Targa & Guéliz',
      avatarClass: 'bg-emerald-700 text-white'
    },
    CHEF_FILIERE: {
      id: 2,
      matricule: 'EMSI-DIR-02',
      nom: 'Sassoui',
      prenom: 'Pr. M.',
      email: 'm.sassoui@emsi-edu.ma',
      role: 'CHEF_FILIERE',
      roleLabel: 'Responsable Filière IIR & GI',
      campusDefaut: 'Campus Targa',
      avatarClass: 'bg-indigo-700 text-white'
    },
    RESP_PLANNING: {
      id: 3,
      matricule: 'EMSI-PLN-04',
      nom: 'Tazi',
      prenom: 'Kenza',
      email: 'kenza.tazi@emsi-edu.ma',
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
      email: 'brahim.abod@emsi-edu.ma',
      role: 'RESP_PFE',
      roleLabel: 'Responsable PFE & Jurys',
      campusDefaut: 'Campus Targa',
      avatarClass: 'bg-purple-700 text-white'
    },
    RESP_SCOLARITE: {
      id: 5,
      matricule: 'EMSI-SCO-05',
      nom: 'Benkirane',
      prenom: 'Hassan',
      email: 'scolarite@emsi-edu.ma',
      role: 'RESP_SCOLARITE',
      roleLabel: 'Responsable Scolarité & Absences',
      campusDefaut: 'Campus Guéliz & Targa',
      avatarClass: 'bg-amber-700 text-white'
    },
    ENSEIGNANT_PERMANENT: {
      id: 6,
      matricule: 'ENS-PERM-02',
      nom: 'Benassou',
      prenom: 'Pr. Noussair',
      email: 'noussair.benassou@emsi-edu.ma',
      role: 'ENSEIGNANT_PERMANENT',
      roleLabel: 'Professeur Permanent (18h)',
      campusDefaut: 'Campus Targa',
      avatarClass: 'bg-teal-700 text-white'
    },
    ENSEIGNANT_VACATAIRE: {
      id: 7,
      matricule: 'ENS-VAC-01',
      nom: 'Alami',
      prenom: 'Dr. Karim',
      email: 'karim.alami@emsi-edu.ma',
      role: 'ENSEIGNANT_VACATAIRE',
      roleLabel: 'Professeur Vacataire (Priorité 1 P1)',
      campusDefaut: 'Campus Targa',
      avatarClass: 'bg-cyan-700 text-white'
    },
    ETUDIANT: {
      id: 8,
      matricule: 'ETU-2026-08',
      nom: 'Ait Ouahman',
      prenom: 'Ilyass',
      email: 'ilyass.aitouahman@emsi-edu.ma',
      role: 'ETUDIANT',
      roleLabel: 'Étudiant 5ème Année (2DSI G3)',
      campusDefaut: 'Campus Targa',
      avatarClass: 'bg-slate-700 text-white'
    }
  };

  readonly currentUser = signal<CurrentUser>(this.defaultUsers['SUPER_ADMIN']);
  readonly isSuperAdmin = computed(() => this.currentUser().role === 'SUPER_ADMIN');
  readonly isPlanningResp = computed(() => this.currentUser().role === 'RESP_PLANNING' || this.isSuperAdmin());
  readonly isPfeResp = computed(() => this.currentUser().role === 'RESP_PFE' || this.isSuperAdmin());

  switchRole(role: UserRole) {
    if (this.defaultUsers[role]) {
      this.currentUser.set(this.defaultUsers[role]);
    }
  }

  getAllUsers(): CurrentUser[] {
    return Object.values(this.defaultUsers);
  }
}
