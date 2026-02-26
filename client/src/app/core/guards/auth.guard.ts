import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';

import { AuthService } from '../../auth/auth.service';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.token;
  if (!token) {
    return router.createUrlTree(['/login']);
  }
  if (isTokenExpired(token)) {
    authService.logout();
    return router.createUrlTree(['/login']);
  }

  if (authService.isSessionRestored()) {
    return true;
  }

  return authService.isSessionRestored$.pipe(
    filter((restored) => restored),
    take(1),
    map(() => true),
  );
};
