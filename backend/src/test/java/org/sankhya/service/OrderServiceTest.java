package org.sankhya.service;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.sankhya.dto.CreateOrderRequest;
import org.sankhya.exception.OutOfStockException;
import org.sankhya.model.Product;
import org.sankhya.repository.ProductRepository;
import org.sankhya.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
class OrderServiceTest {

    @Autowired
    OrderService orderService;
    @Autowired
    ProductRepository productRepository;

    @Test
    void shouldFailWhenInsufficientStock(){
        Product garrafa = productRepository.findAll().stream()
                .filter(p -> p.getName().contains("Garrafa Térmica")).findFirst().orElseThrow();
        Product cafe = productRepository.findAll().stream()
                .filter(p -> p.getName().contains("Café Torrado")).findFirst().orElseThrow();


        CreateOrderRequest req = new CreateOrderRequest(List.of(
                new CreateOrderRequest.Item(garrafa.getId(), 3),
                new CreateOrderRequest.Item(cafe.getId(), 2)
        ));


        Assertions.assertThrows(OutOfStockException.class, () -> orderService.checkout(req));
    }
}
