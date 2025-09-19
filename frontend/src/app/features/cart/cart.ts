// src/app/features/cart/cart.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ApiService } from '../../services/ApiService';
import { CartService } from '../../services/CartService';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
})
export default class Cart {
  constructor(public cart: CartService, private api: ApiService) {}

  checkout() {
    const items = this.cart.toOrder();
    this.api.checkout(items).subscribe({
      next: (res) => {
        alert(`Pedido #${res.id} criado! Total: R$ ${res.total.toFixed(2)}`);
        this.cart.clear();
      },
      error: (err) => {
        // Backend retorna 422 com { errors: [{ productId, available }, ...] }
        if (err.status === 422 && err.error?.errors) {
          const list = err.error.errors as {
            productId: number;
            available: number;
          }[];
          const msg = list
            .map((x) => `Produto ${x.productId} disponível: ${x.available}`)
            .join('\n');
          alert('Itens indisponíveis:\n' + msg);
        } else {
          alert('Erro inesperado no checkout');
          console.error(err);
        }
      },
    });
  }
}
