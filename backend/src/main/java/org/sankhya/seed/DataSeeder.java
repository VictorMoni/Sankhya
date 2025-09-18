package org.sankhya.seed;

import org.sankhya.model.Product;
import org.sankhya.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seed(ProductRepository productRepository) {
        return args -> {
            if(productRepository.count() > 0) return;
            productRepository.saveAll(List.of(
                    create("Café Torrado 500g", new BigDecimal("18.90"), 5),
                    create("Filtro de Papel nº103", new BigDecimal("7.50"), 10),
                    create("Garrafa Térmica 1L", new BigDecimal("79.90"), 2),
                    create("Açúcar Mascavo 1kg", new BigDecimal("16.00"), 0),
                    create("Caneca Inox 300ml", new BigDecimal("29.00"), 8)
            ));
        };
    }
    private Product create(String name, BigDecimal price, int stock){
        Product p = new Product();
        p.setName(name); p.setPrice(price); p.setStock(stock); p.setActive(true); p.setVersion(0);
        return p;
    }
}
