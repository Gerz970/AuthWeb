import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }

  // Si no está autenticado, redirigir al login
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // Si no es admin, redirigir al home
  router.navigate(['/']);
  return false;
}; 