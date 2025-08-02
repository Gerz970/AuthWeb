import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // No agregar token para peticiones de reseteo de contraseña
  if (req.url.includes('reset-password')) {
    console.log('Interceptor: Excluyendo petición de reseteo de contraseña');
    return next(req);
  }

  // Agregar token si existe para otras peticiones
  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
}; 