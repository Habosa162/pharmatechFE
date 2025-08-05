import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
// import { AuthService } from '../../Services/Auth/auth.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, throwError } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && error.error?.message?.includes('Invalid token')) {
        authService.logout();
        router.navigate(['/login']);
        toastService.error('Session expired. Please log in again.');
        return EMPTY;
      } 
      else if (error.status === 400) {
        // Handle validation errors (400 Bad Request)
        if (error.error?.message) {
          toastService.error(error.error.message);
        } else if (error.error?.errors) {
          // Handle multiple validation errors
          const errorMessages = Object.values(error.error.errors).flat();
          errorMessages.forEach((message: any) => {
            toastService.error(message);
          });
        } else {
          toastService.error('Validation error occurred');
        }
        // Don't return EMPTY for validation errors - let component handle the error
        return throwError(() => error);
      }
      else if (error.status === 500) {
        toastService.error('Server error occurred. Please try again later.');
        return EMPTY;
      }
      else if (error.error?.message) {
        if (
          !error.error.message.includes('Fixed price project with ID') &&
          !error.error.message.includes('No Bidding Project Found Hasing This Id')
        ) {
          toastService.error(error.error.message);
        }
        if (!error.error.message.includes('No Bidding Project Found Hasing This Id')) {
          return EMPTY;
        }
      }
      return throwError(() => error);
    })
  );
};
