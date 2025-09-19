import { Routes } from '@angular/router';
import Cart from './features/cart/cart';
import Home from './features/home/home';
import OrderDetail from './features/order-detail/order-detail';
import Orders from './features/orders/orders';
import Products from './features/products/products';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Home, title: 'Home' },
  { path: 'products', component: Products, title: 'Catálogo' },
  { path: 'cart', component: Cart, title: 'Carrinho' },
  { path: 'orders', component: Orders, title: 'Pedidos' },
  { path: 'orders/:id', component: OrderDetail, title: 'Pedido' },
  { path: '**', redirectTo: '' },
];
