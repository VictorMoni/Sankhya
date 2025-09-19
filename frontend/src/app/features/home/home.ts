import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/CartService'; // ajuste o caminho se diferente

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export default class Home {
  constructor(public cart: CartService) {}

  totalQty = computed(() =>
    this.cart.items$().reduce((sum, it) => sum + it.quantity, 0)
  );

  subtotal = computed(() =>
    this.cart
      .items$()
      .reduce((sum, it) => sum + it.product.price * it.quantity, 0)
  );
}
