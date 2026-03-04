import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login'; 
import { RegisterComponent } from './features/auth/register/register';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MyCattleComponent } from './features/livestock/my-cattle/my-cattle.component';
import { AddCattleComponent } from './features/livestock/add-cattle/add-cattle.component';
import { EditCattleComponent } from './features/livestock/edit-cattle/edit-cattle.component';
import { ViewCattleComponent} from './features/livestock/view-cattle/view-cattle.component';
import { HealthRecordsComponent } from './features/health/health-records/health-records.component';
import { AddHealthRecordComponent } from './features/health/add-health-record/add-health-record.component';
import { EditHealthRecordComponent } from './features/health/edit-health-record/edit-health-record.component';
import { ViewHealthRecordComponent } from './features/health/view-health-record/view-health-record.component';
import { BreedingRecordsComponent } from './features/breeding/breeding-records/breeding-records.component';
import { AddBreedingRecordComponent } from './features/breeding/add-breeding-records/add-breeding-record.component';
import { EditBreedingRecordComponent } from './features/breeding/edit-breeding-records/edit-breeding-record.component'; 
import { LocationsListComponent } from './features/locations/locations-list/locations-list.component';
import { AddLocationComponent } from './features/locations/add-location/add-location.component';
import { EditLocationComponent } from './features/locations/edit-location/edit-location.component';
import { ViewLocationComponent } from './features/locations/view-location/view-location.component';
import { UsersListComponent } from './features/users/users-list/users-list.component'; 
import { EditUserComponent } from './features/users/edit-user/edit-user.component';
import { AuditListComponent } from './features/audit/audit-list/audit-list.component';
import { SettingsComponent } from './features/settings/settings.component';
import { AddUserComponent } from './features/users/add-user/add-user.component';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

const ADMIN_ONLY = ['Admin'];
const AUDIT_ALLOWED = ['Admin', 'Farm Manager', 'Farm Owner', 'Farm Assistant'];

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  
  { path: 'my-cattle', component: MyCattleComponent, canActivate: [authGuard] },
  { path: 'view-cattle/:id', component: ViewCattleComponent, canActivate: [authGuard] },
  { path: 'add-cattle', component: AddCattleComponent, canActivate: [authGuard] },
  { path: 'edit-cattle/:id', component: EditCattleComponent, canActivate: [authGuard] },
  
  { path: 'health-records', component: HealthRecordsComponent, canActivate: [authGuard] },
  { path: 'view-health-record/:id', component: ViewHealthRecordComponent, canActivate: [authGuard] },
  { path: 'add-health-record', component: AddHealthRecordComponent, canActivate: [authGuard] },
  { path: 'edit-health-record/:id', component: EditHealthRecordComponent, canActivate: [authGuard] },
  
  { path: 'breeding-records', component: BreedingRecordsComponent, canActivate: [authGuard] },
  { path: 'add-breeding-record', component: AddBreedingRecordComponent, canActivate: [authGuard] },
  { path: 'edit-breeding-record/:id', component: EditBreedingRecordComponent, canActivate: [authGuard] },
  
  { path: 'locations', component: LocationsListComponent, canActivate: [authGuard] },
  { path: 'add-location', component: AddLocationComponent, canActivate: [authGuard] },
  { path: 'edit-location/:id', component: EditLocationComponent, canActivate: [authGuard] },
  { path: 'view-location/:id', component: ViewLocationComponent, canActivate: [authGuard] },
  
  { 
    path: 'users', 
    component: UsersListComponent, 
    canActivate: [authGuard, roleGuard], 
    data: { roles: ADMIN_ONLY } 
  },
  { 
    path: 'add-user', 
    component: AddUserComponent, 
    canActivate: [authGuard, roleGuard], 
    data: { roles: ADMIN_ONLY } 
  },
  { 
    path: 'edit-user/:id', 
    component: EditUserComponent, 
    canActivate: [authGuard, roleGuard], 
    data: { roles: ADMIN_ONLY } 
  },
  
  { 
    path: 'audit', 
    component: AuditListComponent, 
    canActivate: [authGuard, roleGuard], 
    data: { roles: AUDIT_ALLOWED } 
  },
  
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  
  { path: '**', redirectTo: '/login' }
];
