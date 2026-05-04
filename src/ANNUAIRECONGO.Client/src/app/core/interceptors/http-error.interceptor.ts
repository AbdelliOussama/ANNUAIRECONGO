import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '@shared/services/toast.service';
import { FR } from '@core/i18n/fr.constants';

/**
 * Global HTTP error handler.
 *
 * Surfaces a French user-facing message via the in-house ToastService
 * (Sprint 8 — replaced MatSnackBar to drop the @angular/material dep).
 * On 401, clears the auth state and redirects to /auth/connexion (the new FR
 * route — audit C4 + Sprint 4 routing).
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast  = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const status = error.status;
      // Explicit `string` widening — FR is `as const`, so `let message = …`
      // would be inferred as the literal type and reject every reassignment.
      let message: string = FR.errors.serverError;

      if (status === 0) {
        message = FR.errors.network;
      } else if (status === 400) {
        message = error.error?.message || error.error?.title || FR.errors.validation;
      } else if (status === 401) {
        message = 'Votre session a expiré. Veuillez vous reconnecter.';
        localStorage.clear();
        const returnUrl = router.url && router.url !== '/' ? router.url : undefined;
        router.navigate(['/auth/connexion'], returnUrl ? { queryParams: { returnUrl } } : undefined);
      } else if (status === 403) {
        message = FR.errors.unauthorized;
      } else if (status === 404) {
        message = FR.errors.notFound;
      } else if (status >= 500) {
        message = FR.errors.serverError;
      }

      toast.error(message);
      console.error('HTTP Error:', error.message, error);
      return throwError(() => error);
    })
  );
};
