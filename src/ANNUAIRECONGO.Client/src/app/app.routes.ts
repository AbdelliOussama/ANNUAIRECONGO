import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { CompanyListComponent } from './features/companies/company-list/company-list.component';
import { CompanyDetailComponent } from './features/companies/company-detail/company-detail.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProfileComponent } from './features/profile/profile.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { AdminSectorsComponent } from './features/admin/sectors/admin-sectors.component';
import { AdminCompaniesComponent } from './features/admin/companies/admin-companies.component';
import { AdminPlansComponent } from './features/admin/plans/admin-plans.component';
import { AdminGeographyComponent } from './features/admin/geography/admin-geography.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'companies', component: CompanyListComponent },
      { path: 'companies/:id', component: CompanyDetailComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
      { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
      { path: 'notifications', component: NotificationsComponent, canActivate: [authGuard] },
      { path: 'admin/sectors', component: AdminSectorsComponent, canActivate: [authGuard, adminGuard] },
      { path: 'admin/companies', component: AdminCompaniesComponent, canActivate: [authGuard, adminGuard] },
      { path: 'admin/plans', component: AdminPlansComponent, canActivate: [authGuard, adminGuard] },
      { path: 'admin/geography', component: AdminGeographyComponent, canActivate: [authGuard, adminGuard] },
    ]
  },
  { path: '**', redirectTo: '' }
];