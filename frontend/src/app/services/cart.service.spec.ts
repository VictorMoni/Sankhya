import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';

describe('CartService', () => {
  let svc: CartService;

  const PRODUCT = { id: 1, name: 'Café', price: 10, stock: 5, active: true };

  beforeEach(() => {
    const store: Record<string, string> = {};
    spyOn(localStorage, 'getItem').and.callFake((k) => store[k] ?? null);
    spyOn(localStorage, 'setItem').and.callFake((k, v) => (store[k] = v));

    TestBed.configureTestingModule({});
    svc = TestBed.inject(CartService);
  });

  it('adiciona, incrementa, decrementa e remove', () => {
    expect(svc.subtotal()).toBe(0);
    svc.add(PRODUCT);
    expect(svc.subtotal()).toBe(10);
    svc.inc(PRODUCT);
    expect(svc.subtotal()).toBe(20);
    svc.dec(PRODUCT);
    expect(svc.subtotal()).toBe(10);
    svc.remove(PRODUCT);
    expect(svc.subtotal()).toBe(0);
  });

  it('toOrder retorna itens no formato esperado', () => {
    svc.add(PRODUCT);
    expect(svc.toOrder()).toEqual([{ productId: 1, quantity: 1 }]);
  });

  it('availableFor considera itens reservados', () => {
    expect(svc.availableFor(PRODUCT)).toBe(5);
    svc.add(PRODUCT);
    expect(svc.availableFor(PRODUCT)).toBe(4);
  });

  it('lastOrder getter/setter funciona', () => {
    svc.setLastOrder({ id: 9, total: 12.3, items: [] });
    expect(svc.lastOrder()?.id).toBe(9);
    svc.setLastOrder(null);
    expect(svc.lastOrder()).toBeNull();
  });
});
