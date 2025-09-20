import { CommonModule } from '@angular/common';
import { Component, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderSummary } from '../../models/OrderSummary';
import { Product } from '../../models/Product';
import { ApiService, Page } from '../../services/api.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export default class HomeComponent implements OnInit {
  constructor(public cart: CartService, private readonly api: ApiService) {}

  subtotal = computed(() =>
    this.cart
      .items$()
      .reduce((sum, it) => sum + it.product.price * it.quantity, 0)
  );

  orders: OrderSummary[] = [];
  miniProducts: Product[] = [];
  loadingOrders = false;
  ordersPage = 0;
  ordersSize = 5;
  ordersTotal = 0;

  ngOnInit() {
    this.loadOrders();
    this.loadMini();
  }

  loadMini() {
    this.api.listProducts('', 0, 6).subscribe((res) => {
      this.miniProducts = res.content;
    });
  }

  add(p: Product) {
    if (p.stock === 0 || !p.active) return;
    this.cart.add(p);
  }

  loadOrders() {
    this.loadingOrders = true;
    this.api.listOrders(this.ordersPage, this.ordersSize).subscribe({
      next: (page: Page<OrderSummary>) => {
        this.orders = page.content;
        this.ordersTotal = page.totalElements;
        this.loadingOrders = false;
      },
      error: (err) => {
        this.loadingOrders = false;
        console.error('Erro ao buscar pedidos:', err);
      },
    });
  }

  ordersPrev() {
    if (this.ordersPage > 0) {
      this.ordersPage--;
      this.loadOrders();
    }
  }

  ordersNext() {
    if ((this.ordersPage + 1) * this.ordersSize < this.ordersTotal) {
      this.ordersPage++;
      this.loadOrders();
    }
  }

  verPedido(id: number) {
    this.api.getOrder(id).subscribe((detail) => {
      this.cart.setLastOrder(detail);
    });
  }
}
