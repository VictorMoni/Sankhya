import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { of } from 'rxjs';
import { ApiService } from '../../services/api.service';
import OrderDetail from './order-detail';

class ApiServiceMock {
  getOrder = jasmine.createSpy().and.returnValue({
    subscribe: (obs: any) =>
      obs.next({
        id: 7,
        total: 33,
        items: [
          {
            productId: 1,
            name: 'Café',
            quantity: 2,
            unitPrice: 10,
            lineTotal: 20,
          },
        ],
      }),
  });
}

describe('OrderDetail', () => {
  let fixture: ComponentFixture<OrderDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDetail],
      providers: [
        provideRouter([]),
        { provide: ApiService, useClass: ApiServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: '7' })) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDetail);
    fixture.detectChanges();
  });

  it('renderiza cabeçalho e total do pedido', () => {
    const h1 = fixture.debugElement.query(By.css('h1'))
      .nativeElement as HTMLElement;
    expect(h1.textContent).toContain('#7');
    const total = fixture.debugElement.query(By.css('.grand'))
      .nativeElement as HTMLElement;
    expect(total.textContent).toContain('R$');
  });

  it('qtyTotal soma quantidades', () => {
    const cmp = fixture.componentInstance;
    expect(cmp.qtyTotal()).toBe(2);
  });
});
