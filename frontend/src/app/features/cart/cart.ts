import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ApiService } from '../../service/ApiService';
import { CartService } from '../../service/CartService';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
})
export class CartComponent {
  constructor(public cart: CartService, private api: ApiService) {}

  checkout() {
    const items = this.cart.toOrder();
    this.api.checkout(items).subscribe({
      next: (res) => {
        alert(`Pedido #${res.id} criado! Total: R$ ${res.total.toFixed(2)}`);
        this.cart.clear();
      },
      error: (err) => {
        if (err.status === 409) {
          const list = err.error as { productId: number; available: number }[];
          const msg = list
            .map((x) => `Produto ${x.productId} disponível: ${x.available}`)
            .join('\n');
          alert('Itens indisponíveis:\n' + msg);
        } else {
          alert('Erro inesperado no checkout');
        }
      },
    });
  }
}
