import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderSummary } from '../../models/OrderSummary';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrls: ['./orders.scss'],
})
export default class OrdersComponent implements OnInit {
  loading = false;
  rows: OrderSummary[] = [];
  page = 0;
  size = 10;
  total = 0;
  dir: 'asc' | 'desc' = 'desc';

  constructor(private readonly api: ApiService) {}
  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.api.listOrders(this.page, this.size, this.dir).subscribe({
      next: (p) => {
        this.rows = p.content;
        this.total = p.totalElements;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  prev() {
    if (this.page > 0) {
      this.page--;
      this.load();
    }
  }
  next() {
    if ((this.page + 1) * this.size < this.total) {
      this.page++;
      this.load();
    }
  }
  toggleDir() {
    this.dir = this.dir === 'asc' ? 'desc' : 'asc';
    this.page = 0;
    this.load();
  }

  trackById = (_: number, o: OrderSummary) => o.id;
}
