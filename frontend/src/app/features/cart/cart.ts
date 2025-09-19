import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../models/Product';
import { ApiService } from '../../services/ApiService';
import { CartService } from '../../services/CartService';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
})
export default class CartComponent {
  constructor(
    public cart: CartService,
    private readonly api: ApiService,
    private readonly router: Router
  ) {}

  /** Mostra o total atual:
   * - se houver itens no carrinho => subtotal do carrinho
   * - se carrinho estiver vazio e existir um recibo => total do último pedido
   */
  displayTotal() {
    const subtotal = this.cart.subtotal();
    if (subtotal > 0) return subtotal;
    const last = this.cart.lastOrder();
    return last ? Number(last.total) : 0;
  }

  checkout() {
    const items = this.cart.toOrder();
    if (!items.length) {
      // carrinho vazio: oferta uma nova compra (UX melhor do que erro)
      this.novaCompra();
      return;
    }
    this.api.checkout(items).subscribe({
      next: (res) => {
        this.cart.setLastOrder(res); // recibo visível
        this.cart.clear(); // carrinho zerado
        // sem OK — o recibo fica no topo; o botão "Nova compra" aparece
      },
      error: (err) => {
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

  novaCompra() {
    // opcional: esconder recibo ao sair
    this.cart.setLastOrder(null);
    this.router.navigate(['/products']);
  }

  thumbFor(p: Product): string {
    // mapeie pelo nome pra bater com seus arquivos
    const map: Record<string, string> = {
      'Açúcar Mascavo 500g': '/assets/acucar-mascavo-500g.png',
      'Café Torrado 250g': '/assets/cafe-torrado-250g.png',
      'Caneca Inox 300ml': '/assets/caneca-inox-300ml.png',
      'Filtro de Papel nº103': '/assets/filtro-de-papel-103.png',
      'Garrafa Térmica 1L': '/assets/garrafa-termica-1l.png',
    };
    return map[p.name] ?? '/assets/placeholder.png';
  }

  thumbFallback(ev: Event) {
    (ev.target as HTMLImageElement).src = '/assets/placeholder.png';
  }
}
