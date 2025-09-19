package org.sankhya.seed;

import org.sankhya.model.Product;
import org.sankhya.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Configuration
@Profile("dev")
public class DataSeeder {

    @Bean
    CommandLineRunner seed(ProductRepository productRepository) {
        return args -> seedProducts(productRepository);
    }

    @Transactional
    void seedProducts(ProductRepository repo) {
        if (repo.count() > 0) return;

        repo.saveAll(List.of(
                create("Café Torrado 500g", bd("18.90"), 5),
                create("Filtro de Papel nº103", bd("7.50"), 10),
                create("Garrafa Térmica 1L", bd("79.90"), 2),
                create("Açúcar Mascavo 1kg", bd("16.00"), 0),
                create("Caneca Inox 300ml", bd("29.00"), 8)
        ));
    }

    private static Product create(String name, BigDecimal price, int stock) {
        Product p = new Product();
        p.setName(name);
        p.setPrice(price);
        p.setStock(stock);
        p.setActive(true);
        return p;
    }

    private static BigDecimal bd(String v) {
        return new BigDecimal(v).setScale(2, RoundingMode.HALF_EVEN);
    }
}
