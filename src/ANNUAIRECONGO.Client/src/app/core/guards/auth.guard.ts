import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

/**
 * Prevents Admins from accessing the Espace client, redirecting them to the Admin panel.
 * Forwards unauthenticated users to login.
 */
export const espaceGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/connexion'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  if (authService.isAdmin()) {
    router.navigate(['/admin']);
    return false;
  }

  return true;
};

/**
 * Allows access only to users with the EntrepriseOwner role.
 * Admin is a platform super-admin with no company or espace; they are
 * explicitly redirected to /admin.
 * RegularUsers and any other non-EO role are redirected to /espace.
 * Unauthenticated users are redirected to /auth/connexion with a returnUrl.
 */
export const entrepriseOwnerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/connexion'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  if (authService.isEntrepriseOwner()) {
    return true;
  }

  // Admin has no espace — send them to their own dashboard
  if (authService.isAdmin()) {
    router.navigate(['/admin']);
    return false;
  }

  // RegularUser (or any other non-EO role) — redirect to their espace home
  router.navigate(['/espace']);
  return false;
};