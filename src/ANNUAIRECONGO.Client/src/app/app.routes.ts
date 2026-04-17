import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { authGuard, adminGuard, publicGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'companies',
        loadComponent: () => import('./features/companies/company-list/company-list.component').then(m => m.CompanyListComponent)
      },
      {
        path: 'companies/create',
        loadComponent: () => import('./features/companies/create-company/create-company.component').then(m => m.CreateCompanyComponent),
        canActivate: [authGuard]
      },
      {
        path: 'companies/:id/edit',
        loadComponent: () => import('./features/companies/edit-company/edit-company.component').then(m => m.EditCompanyComponent),
        canActivate: [authGuard]
      },
      {
        path: 'companies/:id',
        loadComponent: () => import('./features/companies/company-detail/company-detail.component').then(m => m.CompanyDetailComponent)
      },
      {
        path: 'regions',
        loadComponent: () => import('./features/regions/regions.component').then(m => m.RegionsComponent)
      },
      {
        path: 'subscription',
        loadComponent: () => import('./features/subscription/subscription-plans.component').then(m => m.SubscriptionPlansComponent)
      },
      {
        path: 'payment-history',
        loadComponent: () => import('./features/subscription/payment-history.component').then(m => m.PaymentHistoryComponent),
        canActivate: [authGuard]
      },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        canActivate: [publicGuard]
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
        canActivate: [publicGuard]
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard]
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard]
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent),
        canActivate: [authGuard]
      },
      {
        path: 'admin/sectors',
        loadComponent: () => import('./features/admin/sectors/admin-sectors.component').then(m => m.AdminSectorsComponent),
        canActivate: [authGuard, adminGuard]
      },
      {
        path: 'admin/companies',
        loadComponent: () => import('./features/admin/companies/admin-companies.component').then(m => m.AdminCompaniesComponent),
        canActivate: [authGuard, adminGuard]
      },
      {
        path: 'admin/plans',
        loadComponent: () => import('./features/admin/plans/admin-plans.component').then(m => m.AdminPlansComponent),
        canActivate: [authGuard, adminGuard]
      },
      {
        path: 'admin/geography',
        loadComponent: () => import('./features/admin/geography/admin-geography.component').then(m => m.AdminGeographyComponent),
        canActivate: [authGuard, adminGuard]
      },
      {
        path: 'admin/reports',
        loadComponent: () => import('./features/admin/reports/admin-reports.component').then(m => m.AdminReportsComponent),
        canActivate: [authGuard, adminGuard]
      },
      {
        path: 'admin/business-owners',
        loadComponent: () => import('./features/admin/business-owners/admin-business-owners.component').then(m => m.AdminBusinessOwnersComponent),
        canActivate: [authGuard, adminGuard]
      },
      {
        path: 'admin/logs',
        loadComponent: () => import('./features/admin/logs/admin-logs.component').then(m => m.AdminLogsComponent),
        canActivate: [authGuard, adminGuard]
      },
    ]
  },
  { path: '**', redirectTo: '' }
];