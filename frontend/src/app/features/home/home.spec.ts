import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import HomeComponent from './home';

class CartServiceMock {
  private readonly _items: any[] = [];
  items$() {
    return this._items;
  }
  add(p: any) {
    this._items.push({ product: p, quantity: 1 });
  }
}

class ApiServiceMock {
  listProducts = jasmine.createSpy().and.returnValue({
    subscribe: (fn: any) =>
      fn({
        content: [{ id: 1, name: 'Item', price: 10, stock: 10, active: true }],
        totalElements: 1,
        size: 6,
        number: 0,
      }),
  });
  listOrders = jasmine.createSpy().and.returnValue({
    subscribe: (obs: any) =>
      obs.next({
        content: [
          {
            id: 9,
            total: 50,
            itemsCount: 3,
            createdAt: new Date().toISOString(),
          },
        ],
        totalElements: 1,
        size: 5,
        number: 0,
      }),
  });
  getOrder = jasmine.createSpy().and.returnValue({
    subscribe: (fn: any) => fn({ id: 9, total: 50, items: [] }),
  });
}

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: CartService, useClass: CartServiceMock },
        { provide: ApiService, useClass: ApiServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
  });

  it('carrega mini produtos e pedidos recentes', () => {
    const links = fixture.debugElement.queryAll(By.css('.orders .order-link'));
    expect(links.length).toBe(1);
    const h1 = fixture.debugElement.query(By.css('h1'))
      .nativeElement as HTMLElement;
    expect(h1.textContent?.toLowerCase()).toContain('bem-vindo');
  });

  it('exibe mensagem de carrinho vazio quando não há itens', () => {
    const empty = fixture.debugElement.query(By.css('.card p'));
    expect(empty.nativeElement.textContent).toMatch(/carrinho está vazio/i);
  });
});
