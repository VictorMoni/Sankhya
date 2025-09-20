import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateOrderResponse } from '../models/CreateOrderResponse';
import { OrderDetail } from '../models/OrderDetail';
import { OrderItemRequest } from '../models/OrderItemRequest';
import { OrderSummary } from '../models/OrderSummary';
import { Product } from '../models/Product';

export interface Page<T> {
  content: T[];
  totalElements: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  listProducts(q = '', page = 0, size = 10) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (q) params = params.set('q', q);
    return this.http.get<Page<Product>>('products', { params });
  }

  checkout(items: OrderItemRequest[]) {
    return this.http.post<CreateOrderResponse>('orders/checkout', { items });
  }

  listOrders(page = 0, size = 10, dir: 'asc' | 'desc' = 'desc') {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', `createdAt,${dir}`);
    return this.http.get<Page<OrderSummary>>('orders', { params });
  }

  getOrder(id: number) {
    return this.http.get<OrderDetail>(`orders/${id}`);
  }

  listRecentOrders(limit = 5) {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<OrderSummary[]>('orders/recent', { params });
  }
}
