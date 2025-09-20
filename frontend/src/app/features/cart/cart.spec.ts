import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import CartComponent from './cart';

class CartServiceMock {
  private items = [
    {
      product: { id: 1, name: 'Café', price: 10, stock: 10, active: true },
      quantity: 2,
    },
  ];
  items$() {
    return this.items;
  }
  subtotal() {
    return 20;
  }
  toOrder() {
    return [{ productId: 1, quantity: 2 }];
  }
  setLastOrder = jasmine.createSpy('setLastOrder');
  clear = jasmine.createSpy('clear').and.callFake(() => (this.items = []));
  lastOrder() {
    return null;
  }
  inc = jasmine.createSpy('inc');
  dec = jasmine.createSpy('dec');
  remove = jasmine.createSpy('remove');
}

class ApiServiceMock {
  checkout = jasmine.createSpy('checkout').and.returnValue({
    subscribe: (obs: any) => obs.next({ id: 123, total: 20, items: [] }),
  });
}

describe('CartComponent', () => {
  let fixture: ComponentFixture<CartComponent>;
  let router: Router;
  let cart: CartServiceMock;
  let api: ApiServiceMock;

  beforeEach(async () => {
    spyOn(window, 'alert').and.stub();

    await TestBed.configureTestingModule({
      imports: [CartComponent],
      providers: [
        provideRouter([]),
        { provide: CartService, useClass: CartServiceMock },
        { provide: ApiService, useClass: ApiServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    router = TestBed.inject(Router);
    cart = TestBed.inject(CartService) as unknown as CartServiceMock;
    api = TestBed.inject(ApiService) as unknown as ApiServiceMock;

    spyOn(router, 'navigate').and.resolveTo(true);
    fixture.detectChanges();
  });

  it('renderiza quantidade no badge e subtotal', () => {
    const badge = fixture.debugElement.query(By.css('.badge'))
      .nativeElement as HTMLElement;
    expect(+badge.textContent.trim()).toBe(1);

    const subtotal = fixture.debugElement.query(By.css('.subtotal strong'))
      .nativeElement as HTMLElement;
    expect(subtotal.textContent).toContain('R$');
  });

  it('checkout com itens: chama API e limpa carrinho', () => {
    const btn = fixture.debugElement.query(By.css('.btn.primary'));
    btn.triggerEventHandler('click');
    expect(api.checkout).toHaveBeenCalled();
    expect(cart.clear).toHaveBeenCalled();
    expect(cart.setLastOrder).toHaveBeenCalledWith(
      jasmine.objectContaining({ id: 123 })
    );
  });

  it('checkout sem itens: navega para /products', () => {
    cart.clear();
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('.btn.primary'));
    btn.triggerEventHandler('click');
    expect(router.navigate).toHaveBeenCalledWith(['/products']);
  });
});
