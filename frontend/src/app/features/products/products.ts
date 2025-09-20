import { CommonModule } from '@angular/common';
import { Component, OnInit, effect } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Product } from '../../models/Product';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import CartComponent from '../cart/cart';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CartComponent],
  templateUrl: './products.html',
  styleUrls: ['./products.scss'],
})
export default class ProductsComponent implements OnInit {
  search = new FormControl('', { nonNullable: true });
  page = 0;
  size = 10;
  total = 0;
  products: Product[] = [];
  loading = false;

  constructor(
    private readonly api: ApiService,
    private readonly cart: CartService
  ) {
    effect(() => {
      if (this.cart.lastOrder()) {
        this.load();
      }
    });
  }

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

  available(p: Product) {
    return this.cart.availableFor(p);
  }

  add(p: Product) {
    if (this.available(p) <= 0) return;
    this.cart.add(p);
  }

  onPageChange(p: number) {
    this.page = p;
    this.load();
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-+)|(-+$)/g, '');
  }

  private readonly NAME_ALIASES: Record<string, string> = {
    'Filtro de Papel nº103': 'filtro-de-papel-103',
  };

  private productSlug(p: Product): string {
    return this.NAME_ALIASES[p.name] ?? this.slugify(p.name);
  }

  imgFor(p: Product): string {
    const slug = this.productSlug(p);
    return `/assets/${slug}.png`;
  }

  imgsFor(p: Product): string[] {
    const slug = this.productSlug(p);
    return [1, 2, 3, 4].map((i) => `/assets/${slug}-${i}.png`);
  }
}
