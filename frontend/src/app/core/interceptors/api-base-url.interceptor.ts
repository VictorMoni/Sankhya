import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const isAbsolute = /^https?:\/\//i.test(req.url);

  const isStatic =
    req.url.startsWith('/assets') ||
    req.url.startsWith('assets') ||
    req.url === '/favicon.ico' ||
    req.url.startsWith('/i18n/');

  let url = req.url;
  if (!isAbsolute && !isStatic) {
    const base = (environment.apiUrl ?? '').replace(/\/+$/, '');
    const path = req.url.replace(/^\/+/, '');
    url = `${base}/${path}`;
  }

  const hasBody = req.body !== null && req.body !== undefined;
  const isForm =
    typeof FormData !== 'undefined' && req.body instanceof FormData;
  const isBlob = typeof Blob !== 'undefined' && req.body instanceof Blob;
  const shouldSetJson =
    hasBody && !isForm && !isBlob && !req.headers.has('Content-Type');

  const setHeaders: Record<string, string> = { Accept: 'application/json' };
  if (shouldSetJson) setHeaders['Content-Type'] = 'application/json';

  const clone = req.clone({ url, setHeaders });
  return next(clone);
};
