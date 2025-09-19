import { CreateOrderResponse } from './CreateOrderResponse';

export interface OrderSummary {
  id: number;
  createdAt: string;
  total: number;
  itemsCount: number;
}

export type OrderDetail = CreateOrderResponse;
