import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CreateOrderResponse } from '../model/CreateOrderResponse';
import { OrderItemRequest } from '../model/OrderItemRequest';
import { Product } from '../model/Product';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  listProducts(search = '', page = 0, size = 10) {
    const params = new HttpParams()
      .set('search', search)
      .set('page', page)
      .set('size', size);
    return this.http.get<Page<Product>>(`${environment.apiUrl}/products`, {
      params,
    });
  }

  checkout(items: OrderItemRequest[]) {
    return this.http.post<CreateOrderResponse>(`${environment.apiUrl}/orders`, {
      items,
    });
  }
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  size: number;
  number: number;
}
