import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateOrderResponse } from '../models/CreateOrderResponse';
import { OrderItemRequest } from '../models/OrderItemRequest';
import { Product } from '../models/Product';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  listProducts(q = '', page = 0, size = 10) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (q) params = params.set('q', q);
    return this.http.get<Page<Product>>('products', { params });
  }

  checkout(items: OrderItemRequest[]) {
    return this.http.post<CreateOrderResponse>('orders/checkout', { items });
  }
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  size: number;
  number: number;
}
