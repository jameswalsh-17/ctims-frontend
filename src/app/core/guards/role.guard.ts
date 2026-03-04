import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const allowedRoles = route.data?.['roles'] as string[];
  const user = authService.getCurrentUserValue();

  if (user && allowedRoles.includes(user.role)) {
    return true;
  }

  // If unauthorized, redirect to dashboard
  router.navigate(['/dashboard']);
  return false;
};
