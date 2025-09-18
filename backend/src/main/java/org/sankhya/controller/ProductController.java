package org.sankhya.controller;

import org.sankhya.dto.ProductResponse;
import org.sankhya.model.Product;
import org.sankhya.repository.ProductRepository;
import org.sankhya.spec.ProductSpecs;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository){
        this.productRepository = productRepository;
    }

    @GetMapping("/products")
    public Page<ProductResponse> list(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size){
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        Specification<Product> spec = ProductSpecs.nameContains(search);
        return productRepository.findAll(spec, pageable)
                .map(p -> new ProductResponse(p.getId(), p.getName(), p.getPrice(), p.getStock(), p.getActive()));
    }
}
