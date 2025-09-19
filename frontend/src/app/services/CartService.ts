// src/app/services/CartService.ts
import { effect, Injectable, signal } from '@angular/core';
import { OrderItemRequest } from '../models/OrderItemRequest';
import { Product } from '../models/Product';

type CartItem = { product: Product; quantity: number };
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storageKey = 'cart:v1';
  private readonly items = signal<{ product: Product; quantity: number }[]>([]);
  readonly items$ = this.items.asReadonly();
  private readonly last = signal<any | null>(null);

  constructor() {
    // salva toda mudança no localStorage
    effect(() => {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items()));
    });
  }

  private load(): CartItem[] {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) ?? '[]');
    } catch {
      return [];
    }
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

  // ==== NOVO: reservas/estoque visível ====
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

  setLastOrder(v: any | null) {
    this.last.set(v);
  }
}
