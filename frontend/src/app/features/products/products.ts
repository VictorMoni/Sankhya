import { CommonModule } from '@angular/common';
import { Component, OnInit, effect } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Product } from '../../models/Product';
import { ApiService } from '../../services/ApiService';
import { CartService } from '../../services/CartService';
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

  constructor(private api: ApiService, private cart: CartService) {
    // 👇 efeito que dispara quando um pedido é finalizado
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
      .normalize('NFD') // separa acentos
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^a-z0-9]+/g, '-') // troca qualquer coisa por "-"
      .replace(/^-+|-+$/g, ''); // remove "-" das pontas
  }

  // exceções (ex.: "nº" -> "103")
  private NAME_ALIASES: Record<string, string> = {
    'Filtro de Papel nº103': 'filtro-de-papel-103',
  };

  // ✅ agora o tal método existe
  private productSlug(p: Product): string {
    return this.NAME_ALIASES[p.name] ?? this.slugify(p.name);
  }

  // use onde precisar:
  imgFor(p: Product): string {
    const slug = this.productSlug(p);
    return `/assets/${slug}.png`; // ajuste a pasta/extensão conforme seus arquivos
  }

  imgsFor(p: Product): string[] {
    const slug = this.productSlug(p);
    return [1, 2, 3, 4].map((i) => `/assets/${slug}-${i}.png`);
  }
}
