import { effect, Injectable, signal } from '@angular/core';
import { CreateOrderResponse } from '../models/CreateOrderResponse';
import { OrderItemRequest } from '../models/OrderItemRequest';
import { Product } from '../models/Product';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storageKey = 'cart:v1';
  private readonly items = signal<{ product: Product; quantity: number }[]>([]);
  readonly items$ = this.items.asReadonly();
  private readonly last = signal<CreateOrderResponse | null>(null);

  constructor() {
    effect(() => {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items()));
    });
  }

  add(p: Product) {
    const arr = [...this.items()];
    const i = arr.findIndex((x) => x.product.id === p.id);
    if (i >= 0) arr[i] = { product: p, quantity: arr[i].quantity + 1 };
    else arr.push({ product: p, quantity: 1 });
    this.items.set(arr);
  }
  remove(p: Product) {
    this.items.set(this.items().filter((x) => x.product.id !== p.id));
  }

  inc(p: Product) {
    this.add(p);
  }

  dec(p: Product) {
    const arr = [...this.items()];
    const i = arr.findIndex((x) => x.product.id === p.id);
    if (i >= 0) {
      const q = arr[i].quantity - 1;
      if (q <= 0) arr.splice(i, 1);
      else arr[i] = { product: p, quantity: q };
      this.items.set(arr);
    }
  }
  clear() {
    this.items.set([]);
  }

  subtotal() {
    return this.items().reduce((s, x) => s + x.product.price * x.quantity, 0);
  }
  toOrder(): OrderItemRequest[] {
    return this.items().map((x) => ({
      productId: x.product.id,
      quantity: x.quantity,
    }));
  }

  reservedQty(productId: number): number {
    const it = this.items().find((x) => x.product.id === productId);
    return it ? it.quantity : 0;
  }

  qtyInCart(p: Product) {
    return this.items$().find((x) => x.product.id === p.id)?.quantity ?? 0;
  }

  availableFor(p: Product) {
    return Math.max(0, p.stock - this.qtyInCart(p));
  }
  lastOrder = () => this.last();

  setLastOrder(v: CreateOrderResponse | null) {
    this.last.set(v);
  }
}
