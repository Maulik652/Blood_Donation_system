import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  const existingUser = authService.getCurrentUser();

  if (existingUser) {
    return true;
  }

  return authService.ensureProfile().pipe(
    map((response) => {
      if (response?.user) {
        return true;
      }

      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }),
    catchError(() => {
      authService.logout();
      return of(
        router.createUrlTree(['/login'], {
          queryParams: { returnUrl: state.url }
        })
      );
    })
  );
};