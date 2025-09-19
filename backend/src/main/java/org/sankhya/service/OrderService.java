package org.sankhya.service;

import lombok.RequiredArgsConstructor;
import org.sankhya.dto.CreateOrderRequest;
import org.sankhya.dto.CreateOrderResponse;
import org.sankhya.exception.OutOfStockError;
import org.sankhya.exception.OutOfStockException;
import org.sankhya.model.Order;
import org.sankhya.model.OrderItem;
import org.sankhya.model.Product;
import org.sankhya.repository.OrderRepository;
import org.sankhya.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// src/main/java/org/sankhya/service/OrderService.java
@Service
@RequiredArgsConstructor
public class OrderService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepo;

    @Transactional
    public CreateOrderResponse checkout(CreateOrderRequest req){
        if (req == null || req.items() == null || req.items().isEmpty()) {
            throw new IllegalArgumentException("Payload inválido: items vazio");
        }

        Map<Long, Product> products = productRepository.findAllById(
                req.items().stream().map(CreateOrderRequest.Item::productId).toList()
        ).stream().collect(Collectors.toMap(Product::getId, p -> p));

        List<OutOfStockError> errors = new ArrayList<>();
        for (var it : req.items()) {
            Product p = products.get(it.productId());
            if (p == null || !Boolean.TRUE.equals(p.getActive())) {
                errors.add(new OutOfStockError(it.productId(), 0));
                continue;
            }
            int available = p.getStock();
            if (available < it.quantity()) {
                errors.add(new OutOfStockError(p.getId(), available));
            }
        }
        if (!errors.isEmpty()) throw new OutOfStockException(errors);

        Order order = new Order();
        order.setCreatedAt(OffsetDateTime.now());
        BigDecimal total = BigDecimal.ZERO;

        for (var it : req.items()) {
            Product p = products.get(it.productId());
            p.setStock(p.getStock() - it.quantity());

            OrderItem oi = new OrderItem();
            oi.setProduct(p);
            oi.setQuantity(it.quantity());
            oi.setUnitPrice(p.getPrice());
            BigDecimal line = p.getPrice().multiply(BigDecimal.valueOf(it.quantity()))
                    .setScale(2, RoundingMode.HALF_EVEN);
            oi.setLineTotal(line);
            order.addItem(oi);
            total = total.add(line);
        }

        order.setTotal(total.setScale(2, RoundingMode.HALF_EVEN));
        Order saved = orderRepo.save(order);
        productRepository.saveAll(products.values());

        return new CreateOrderResponse(
                saved.getId(), saved.getTotal(),
                saved.getItems().stream().map(oi -> new CreateOrderResponse.Line(
                        oi.getProduct().getId(), oi.getProduct().getName(),
                        oi.getQuantity(), oi.getUnitPrice(), oi.getLineTotal()
                )).toList()
        );
    }
}
