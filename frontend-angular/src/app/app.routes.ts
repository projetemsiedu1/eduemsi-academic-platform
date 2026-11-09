import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { AdminWorkspaceComponent } from './components/workspaces/admin-workspace.component';
import { FiliereWorkspaceComponent } from './components/workspaces/filiere-workspace.component';
import { PlanningWorkspaceComponent } from './components/workspaces/planning-workspace.component';
import { PfeWorkspaceComponent } from './components/workspaces/pfe-workspace.component';
import { ScolariteWorkspaceComponent } from './components/workspaces/scolarite-workspace.component';
import { ProfesseurWorkspaceComponent } from './components/workspaces/professeur-workspace.component';
import { EtudiantWorkspaceComponent } from './components/workspaces/etudiant-workspace.component';
import { PlanningComponent } from './components/planning/planning.component';
import { PfeComponent } from './components/pfe/pfe.component';
import { ScolariteComponent } from './components/scolarite/scolarite.component';
import { GroupesComponent } from './components/groupes/groupes.component';
import { SallesComponent } from './components/salles/salles.component';
import { AccountComponent } from './components/account/account.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Espaces Dédiés par Acteur
  { path: 'espace-admin', component: AdminWorkspaceComponent, canActivate: [authGuard] },
  { path: 'espace-filiere', component: FiliereWorkspaceComponent, canActivate: [authGuard] },
  { path: 'espace-planning', component: PlanningWorkspaceComponent, canActivate: [authGuard] },
  { path: 'espace-pfe', component: PfeWorkspaceComponent, canActivate: [authGuard] },
  { path: 'espace-scolarite', component: ScolariteWorkspaceComponent, canActivate: [authGuard] },
  { path: 'espace-professeur', component: ProfesseurWorkspaceComponent, canActivate: [authGuard] },
  { path: 'espace-etudiant', component: EtudiantWorkspaceComponent, canActivate: [authGuard] },
  
  // Modules fonctionnels additionnels
  { path: 'planning-details', component: PlanningComponent, canActivate: [authGuard] },
  { path: 'pfe-details', component: PfeComponent, canActivate: [authGuard] },
  { path: 'scolarite-details', component: ScolariteComponent, canActivate: [authGuard] },
  { path: 'groupes-details', component: GroupesComponent, canActivate: [authGuard] },
  { path: 'salles', component: SallesComponent, canActivate: [authGuard] },
  { path: 'account', component: AccountComponent, canActivate: [authGuard] },
  
  { path: '**', redirectTo: 'login' }
];
