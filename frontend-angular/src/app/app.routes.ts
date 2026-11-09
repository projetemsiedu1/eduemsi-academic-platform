import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SallesComponent } from './components/salles/salles.component';
import { GroupesComponent } from './components/groupes/groupes.component';
import { PlanningComponent } from './components/planning/planning.component';
import { PfeComponent } from './components/pfe/pfe.component';
import { ScolariteComponent } from './components/scolarite/scolarite.component';
import { AccountComponent } from './components/account/account.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'salles', component: SallesComponent },
  { path: 'groupes', component: GroupesComponent },
  { path: 'planning', component: PlanningComponent },
  { path: 'pfe', component: PfeComponent },
  { path: 'scolarite', component: ScolariteComponent },
  { path: 'account', component: AccountComponent },
  { path: '**', redirectTo: 'dashboard' }
];
