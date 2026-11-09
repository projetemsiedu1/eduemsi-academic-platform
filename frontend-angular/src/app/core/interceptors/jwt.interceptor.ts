import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('emsi_jwt_token');

  // Injecter le Bearer token sur tous les appels vers l'API
  if (token && !req.url.includes('/api/v1/auth/login')) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
