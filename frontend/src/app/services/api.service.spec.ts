import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let api: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('listProducts deve enviar q, page e size', () => {
    api.listProducts('cafe', 2, 20).subscribe();
    const req = http.expectOne(
      (r) => r.method === 'GET' && r.url.endsWith('products')
    );
    expect(req.request.params.get('q')).toBe('cafe');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('20');
    req.flush({ content: [], totalElements: 0, size: 20, number: 2 });
  });

  it('checkout deve fazer POST /orders/checkout', () => {
    const items = [{ productId: 1, quantity: 2 }];
    api.checkout(items).subscribe((res) => {
      expect(res.id).toBe(10);
      expect(res.total).toBe(99.9);
    });
    const req = http.expectOne('orders/checkout');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ items });
    req.flush({ id: 10, total: 99.9, items: [] });
  });

  it('listOrders deve enviar paginação e sort', () => {
    api.listOrders(1, 5, 'asc').subscribe();
    const req = http.expectOne((r) => r.url.endsWith('orders'));
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('size')).toBe('5');
    expect(req.request.params.get('sort')).toBe('createdAt,asc');
    req.flush({ content: [], totalElements: 0, size: 5, number: 1 });
  });

  it('getOrder deve chamar /orders/:id', () => {
    api.getOrder(7).subscribe((res) => expect(res.id).toBe(7));
    const req = http.expectOne('orders/7');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 7, total: 10, items: [] });
  });

  it('listRecentOrders deve enviar limit', () => {
    api.listRecentOrders(3).subscribe();
    const req = http.expectOne((r) => r.url.endsWith('orders/recent'));
    expect(req.request.params.get('limit')).toBe('3');
    req.flush([]);
  });
});
