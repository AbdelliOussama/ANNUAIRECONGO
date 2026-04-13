import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'An unexpected error occurred';
      const status = error.status;

      if (status === 0) {
        message = 'Unable to connect to server. Please check your internet connection.';
      } else if (status === 400) {
        message = error.error?.message || 'Invalid request. Please check your input.';
      } else if (status === 401) {
        message = 'Your session has expired. Please log in again.';
        localStorage.clear();
        router.navigate(['/login']);
      } else if (status === 403) {
        message = 'You do not have permission to perform this action.';
      } else if (status === 404) {
        message = 'The requested resource was not found.';
      } else if (status >= 500) {
        message = 'Server error. Please try again later.';
      }

      snackBar.open(message, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });

      console.error('HTTP Error:', error.message, error);
      return throwError(() => error);
    })
  );
};