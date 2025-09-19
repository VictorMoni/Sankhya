import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  // não altera URLs absolutas
  const isAbsolute = /^https?:\/\//i.test(req.url);
  const base = environment.apiUrl?.replace(/\/+$/, '') ?? '';
  const path = req.url.replace(/^\/+/, '');

  const url = isAbsolute ? req.url : `${base}/${path}`;

  // garanta JSON (pode remover se já setar em cada chamada)
  const clone = req.clone({
    url,
    setHeaders: { 'Content-Type': 'application/json' },
  });

  return next(clone);
};
