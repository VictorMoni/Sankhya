import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CreateOrderResponse as OrderDetailModel } from '../../models/CreateOrderResponse';
import { ApiService } from '../../services/ApiService';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.html',
  styleUrls: ['./order-detail.scss'],
})
export default class OrderDetail implements OnInit {
  loading = true;
  error: string | null = null;
  detail: OrderDetailModel | null = null;

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe((p) => {
      const id = Number(p.get('id'));
      this.fetch(id);
    });
  }

  private fetch(id: number) {
    this.loading = true;
    this.error = null;
    this.detail = null;
    this.api.getOrder(id).subscribe({
      next: (d) => {
        this.detail = d;
        this.loading = false;
      },
      error: () => {
        this.error = 'Pedido não encontrado.';
        this.loading = false;
      },
    });
  }

  qtyTotal() {
    return this.detail?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;
  }

  print() {
    window.print();
  }
}
