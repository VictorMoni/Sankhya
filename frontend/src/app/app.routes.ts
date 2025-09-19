import { Routes } from '@angular/router';
import Cart from './features/cart/cart';
import Home from './features/home/home';
import Products from './features/products/products';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Home, title: 'Home' },
  { path: 'products', component: Products, title: 'Catálogo' },
  { path: 'cart', component: Cart, title: 'Carrinho' },
  { path: '**', redirectTo: '' },
];
