import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

const roleHome: Record<string, string> = {
  donor: '/donor-dashboard',
  user: '/donor-dashboard',
  hospital: '/hospital-dashboard',
  admin: '/admin-dashboard'
};

const normalizeRole = (role: string | null): string | null => {
  if (!role) {
    return null;
  }

  if (role === 'user') {
    return 'donor';
  }

  return role;
};

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = ((route.data['roles'] as string[] | undefined) || []).map((role) => normalizeRole(role) || role);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }

  const currentUser = authService.getCurrentUser();

  const currentRole = normalizeRole(currentUser?.role || null);

  if (currentRole && requiredRoles.includes(currentRole)) {
    return true;
  }

  return authService.ensureProfile().pipe(
    map((response) => {
      const userRole = normalizeRole(response?.user?.role || null);

      if (userRole && requiredRoles.length > 0 && requiredRoles.includes(userRole)) {
        return true;
      }

      return router.createUrlTree([roleHome[userRole || ''] || '/']);
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
