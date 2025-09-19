import { Injectable, signal } from '@angular/core';
import { OrderItemRequest } from '../models/OrderItemRequest';
import { Product } from '../models/Product';

@Injectable({ providedIn: 'root' })
export class CartService {
  private items = signal<{ product: Product; quantity: number }[]>([]);
  readonly items$ = this.items.asReadonly();

  add(p: Product) {
    const arr = [...this.items()];
    const idx = arr.findIndex((x) => x.product.id === p.id);
    if (idx >= 0) arr[idx] = { product: p, quantity: arr[idx].quantity + 1 };
    else arr.push({ product: p, quantity: 1 });
    this.items.set(arr);
  }
  remove(p: Product) {
    const arr = this.items().filter((x) => x.product.id !== p.id);
    this.items.set(arr);
  }
  inc(p: Product) {
    this.add(p);
  }
  dec(p: Product) {
    const arr = [...this.items()];
    const idx = arr.findIndex((x) => x.product.id === p.id);
    if (idx >= 0) {
      const q = arr[idx].quantity - 1;
      if (q <= 0) arr.splice(idx, 1);
      else arr[idx] = { product: p, quantity: q };
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
}
