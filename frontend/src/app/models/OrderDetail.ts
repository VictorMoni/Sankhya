export interface OrderDetail {
  id: number;
  total: number;
  items: {
    productId: number;
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
}
