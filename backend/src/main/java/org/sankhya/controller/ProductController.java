// src/main/java/org/sankhya/controller/ProductController.java
package org.sankhya.controller;

import org.sankhya.api.ProductApi;
import org.sankhya.dto.ProductCreateRequest;
import org.sankhya.dto.ProductResponse;
import org.sankhya.dto.ProductUpdateRequest;
import org.sankhya.model.Product;
import org.sankhya.repository.ProductRepository;
import org.sankhya.spec.ProductSpecs;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.net.URI;

@RestController
@RequestMapping("/api/v1/products")
@Validated
public class ProductController implements ProductApi {

    private final ProductRepository repo;

    public ProductController(ProductRepository repo) {
        this.repo = repo;
    }

    // GET /products — busca com filtros e paginação
    @GetMapping
    public Page<ProductResponse> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean onlyActive,
            @RequestParam(required = false) Integer minStock,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @PageableDefault(size = 20, sort = "name") Pageable pageable
    ) {
        Specification<Product> spec = ProductSpecs.nameContains(q)
                .and(ProductSpecs.active(onlyActive))
                .and(ProductSpecs.stockGte(minStock))
                .and(ProductSpecs.priceBetween(minPrice, maxPrice));

        return repo.findAll(spec, pageable).map(this::toDto);
    }

    // GET /products/{id}
    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable Long id) {
        Product p = repo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        return toDto(p);
    }

    // POST /products
    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductCreateRequest body) {
        Product p = new Product();
        p.setName(body.name().trim());
        p.setPrice(body.price()); // hooks @PrePersist/@PreUpdate garantirão scale(2) se você os adicionou
        p.setStock(body.stock());
        p.setActive(body.active() == null ? true : body.active());

        Product saved = repo.save(p);
        URI location = URI.create("/api/v1/products/" + saved.getId());
        return ResponseEntity.created(location).body(toDto(saved));
    }

    // PUT /products/{id} (atualização completa)
    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductUpdateRequest body) {
        Product p = repo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));

        p.setName(body.name().trim());
        p.setPrice(body.price());
        p.setStock(body.stock());
        p.setActive(body.active() == null ? p.getActive() : body.active());

        Product saved = repo.save(p);
        return toDto(saved);
    }

    // DELETE /products/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Mapper
    private ProductResponse toDto(Product p) {
        return new ProductResponse(p.getId(), p.getName(), p.getPrice(), p.getStock(), p.getActive());
    }
}
