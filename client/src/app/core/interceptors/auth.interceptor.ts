import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { ToastService } from '../../shared/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const token = authService.token;

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    catchError((err) => {
      if (err.status === 401) {
        authService.logout();
      } else if (err.status >= 400) {
        const message: string = err.error?.detail ?? 'Request failed';
        toastService.error(message);
      }
      return throwError(() => err);
    }),
  );
};
