import { Routes } from '@angular/router';
import { CartComponent } from './features/cart/cart';
import { HomeComponent } from './features/home/home';
import { ProductsComponent } from './features/products/products';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent, title: 'Home' },
  { path: 'products', component: ProductsComponent, title: 'Catálogo' },
  { path: 'cart', component: CartComponent, title: 'Carrinho' },
  { path: '**', redirectTo: '' },
];
