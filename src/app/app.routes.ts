import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/auth/dashboard/dashboard.component';
import { ProfileComponent } from './features/auth/dashboard/profile/profile.component';
import { authGuard } from './core/guards/auth.guard';
import { CreateRequestComponent } from './features/collection/create-request/create-request.component';
import { RequestListComponent } from './features/collection/request-list/request-list.component';
import { AvailableRequestsComponent } from './features/collection/available-requests/available-requests.component';
import { MyCollectionsComponent } from './features/collection/my-collections/my-collections.component';
import { ManageCollectionComponent } from './features/collection/manage-collection/manage-collection.component';
import { PointsDashboardComponent } from './features/points/points-dashboard.component';


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
      { path: 'create-request', component: CreateRequestComponent },
      { path: 'available-requests', component: AvailableRequestsComponent },
      { path: 'my-collections', component: MyCollectionsComponent },
      { path: 'manage-collection/:id', component: ManageCollectionComponent },
      { path: 'requests', component: RequestListComponent },
      { path: 'edit-request/:id', component: CreateRequestComponent },
      { path: 'points', component: PointsDashboardComponent },
      { path: '', redirectTo: 'profile', pathMatch: 'full' }
    ]
  }
];