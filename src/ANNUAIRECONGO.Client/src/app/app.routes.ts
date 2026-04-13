import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { authGuard, adminGuard } from './core/guards/auth.guard';

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
        path: 'companies/:id',
        loadComponent: () => import('./features/companies/company-detail/company-detail.component').then(m => m.CompanyDetailComponent)
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent)
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
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
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
    ]
  },
  { path: '**', redirectTo: '' }
];