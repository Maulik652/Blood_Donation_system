import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const isMutation = !['GET', 'HEAD', 'OPTIONS'].includes(req.method.toUpperCase());
  const csrfToken = authService.getCsrfToken();

  const request = req.clone({
    withCredentials: true,
    setHeaders: isMutation && csrfToken ? { 'x-csrf-token': csrfToken } : {}
  });
  const isAuthEndpoint = /\/users\/(login|register|logout)$/.test(req.url);
  const isLoginRoute = router.url.startsWith('/login');
  
  return next(request).pipe(
    catchError((error) => {
      if (error?.status === 401 && !isAuthEndpoint && !isLoginRoute) {
        authService.logout();
        router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      }

      return throwError(() => error);
    })
  );
};