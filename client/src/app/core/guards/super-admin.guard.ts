import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';

import { AuthService } from '../../auth/auth.service';

export const superAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isSessionRestored()) {
    return authService.isSuperAdmin() ? true : router.createUrlTree(['/dashboard']);
  }

  return authService.isSessionRestored$.pipe(
    filter((restored) => restored),
    take(1),
    map(() => authService.isSuperAdmin() ? true : router.createUrlTree(['/dashboard'])),
  );
};
