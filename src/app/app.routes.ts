import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/auth/dashboard/dashboard.component';
import { ProfileComponent } from './features/auth/dashboard/profile/profile.component';
import { authGuard } from './core/guards/auth.guard';
import { CreateRequestComponent } from './features/collection/create-request/create-request.component';
import { RequestListComponent } from './features/collection/request-list/request-list.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: 'profile', pathMatch: 'full' }
    ]
  },{ 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: 'profile', component: ProfileComponent },
      { path: 'create-request', component: CreateRequestComponent },
      { path: 'requests', component: RequestListComponent },
      { path: '', redirectTo: 'profile', pathMatch: 'full' }
    ]
  },
];