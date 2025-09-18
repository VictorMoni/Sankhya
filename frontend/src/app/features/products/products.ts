import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Product } from '../../model/Product';
import { ApiService } from '../../service/ApiService';
import { CartService } from '../../service/CartService';
import { CartComponent } from '../cart/cart';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CartComponent],
  templateUrl: './products.html',
  styleUrls: ['./products.scss'],
})
export class ProductsComponent implements OnInit {
  search = new FormControl('', { nonNullable: true });
  page = 0;
  size = 10;
  total = 0;
  products: Product[] = [];
  loading = false;

  constructor(private api: ApiService, private cart: CartService) {}

  ngOnInit() {
    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.page = 0;
        this.load();
      });

    this.load();
  }

  load() {
    this.loading = true;
    this.api
      .listProducts(this.search.value, this.page, this.size)
      .subscribe((page) => {
        this.products = page.content;
        this.total = page.totalElements;
        this.loading = false;
      });
  }

  add(p: Product) {
    this.cart.add(p);
  }
  onPageChange(p: number) {
    this.page = p;
    this.load();
  }
}
