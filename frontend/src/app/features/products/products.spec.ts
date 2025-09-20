import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import ProductsComponent from './products';

class ApiServiceMock {
  listProducts = jasmine
    .createSpy()
    .and.callFake((q = '', page = 0, size = 10) => {
      const all = [
        { id: 1, name: 'Café Torrado 250g', price: 10, stock: 5, active: true },
        {
          id: 2,
          name: 'Filtro de Papel nº103',
          price: 5,
          stock: 0,
          active: true,
        },
      ];
      const content = all.filter((p) =>
        p.name.toLowerCase().includes(q.toLowerCase())
      );
      return {
        subscribe: (fn: any) =>
          fn({ content, totalElements: content.length, size, number: page }),
      };
    });
}
class CartServiceMock {
  private readonly items: any[] = [];
  lastOrder = () => null;
  availableFor(p: any) {
    const q = this.items.find((x) => x.product.id === p.id)?.quantity ?? 0;
    return Math.max(0, p.stock - q);
  }
  add(p: any) {
    const x = this.items.find((i) => i.product.id === p.id);
    x ? x.quantity++ : this.items.push({ product: p, quantity: 1 });
  }
}

describe('ProductsComponent', () => {
  let fixture: ComponentFixture<ProductsComponent>;
  let component: ProductsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsComponent],
      providers: [
        provideRouter([]),
        provideHttpClientTesting(),
        { provide: ApiService, useClass: ApiServiceMock },
        { provide: CartService, useClass: CartServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar e carregar lista inicial', () => {
    expect(component).toBeTruthy();
    expect(component.products.length).toBeGreaterThan(0);
  });

  it('busca por texto com debounce', fakeAsync(() => {
    const input = fixture.debugElement.query(By.css('input'))
      .nativeElement as HTMLInputElement;
    input.value = 'filtro';
    input.dispatchEvent(new Event('input'));
    tick(300);
    fixture.detectChanges();
    expect(component.products.length).toBe(1);
    expect(component.products[0].name).toMatch(/filtro/i);
  }));

  it('botão "Adicionar" desabilita quando estoque = 0', () => {
    fixture.detectChanges();
    const cards = fixture.debugElement.queryAll(By.css('.card'));
    const secondBtn = cards[1].query(By.css('button'))
      .nativeElement as HTMLButtonElement;
    expect(secondBtn.disabled).toBeTrue();
  });
});
