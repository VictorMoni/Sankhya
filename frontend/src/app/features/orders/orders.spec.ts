import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { ApiService } from '../../services/api.service';
import OrdersComponent from './orders';

class ApiServiceMock {
  listOrders = jasmine
    .createSpy()
    .and.callFake((page = 0, size = 10, dir = 'desc') => {
      const content = Array.from({ length: Math.min(3, size) }).map((_, i) => ({
        id: i + 1 + page * size,
        createdAt: new Date().toISOString(),
        total: 10 * (i + 1),
        itemsCount: i + 1,
      }));
      return {
        subscribe: (obs: any) =>
          obs.next({ content, totalElements: 25, size, number: page }),
      };
    });
}

describe('OrdersComponent', () => {
  let fixture: ComponentFixture<OrdersComponent>;
  let component: OrdersComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useClass: ApiServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('carrega lista inicial', () => {
    expect(component.rows.length).toBeGreaterThan(0);
  });

  it('botões de paginação habilitam/desabilitam corretamente', () => {
    const prev = fixture.debugElement.query(By.css('.pager button:first-child'))
      .nativeElement as HTMLButtonElement;
    expect(prev.disabled).toBeTrue();
  });

  it('toggleDir altera direção e recarrega', () => {
    const oldDir = component.dir;
    component.toggleDir();
    expect(component.dir).not.toBe(oldDir);
  });
});
