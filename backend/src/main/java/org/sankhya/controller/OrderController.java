// src/main/java/org/sankhya/controller/OrderController.java
package org.sankhya.controller;

import jakarta.validation.Valid;
import org.sankhya.dto.CreateOrderRequest;
import org.sankhya.dto.CreateOrderResponse;
import org.sankhya.dto.OrderDetailResponse;
import org.sankhya.dto.OrderSummaryResponse;
import org.sankhya.model.Order;
import org.sankhya.model.OrderItem;
import org.sankhya.repository.OrderRepository;
import org.sankhya.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;


@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderRepository repo;
    private final OrderService service;

    public OrderController(OrderRepository repo, OrderService service) {
        this.repo = repo;
        this.service = service;
    }
    // GET /api/v1/orders  -> lista paginada (recentes)
    @GetMapping
    public Page<OrderSummaryResponse> list(Pageable pageable) {
        return repo.findSummaries(pageable);
    }

    // GET /api/v1/orders/{id} -> detalhe
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public OrderDetailResponse get(@PathVariable Long id) {
        Order o = repo.findWithItemsById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        return new OrderDetailResponse(
                o.getId(),
                o.getTotal(),
                o.getItems().stream()
                        .map(oi -> new OrderDetailResponse.Line(
                                oi.getProduct().getId(),
                                oi.getProduct().getName(),
                                oi.getQuantity(),
                                oi.getUnitPrice(),
                                oi.getLineTotal()
                        ))
                        .toList()
        );
    }

    @PostMapping("/checkout")
    public ResponseEntity<CreateOrderResponse> checkout(@Valid @RequestBody CreateOrderRequest req){
        var resp = service.checkout(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    private OrderSummaryResponse toSummary(Order o){
        Long itemsCount = (long) (o.getItems() == null ? 0 : o.getItems().size());
        return new OrderSummaryResponse(o.getId(), o.getCreatedAt(), o.getTotal(), itemsCount);
    }

    private OrderDetailResponse toDetail(Order o){
        return new OrderDetailResponse(
                o.getId(),
                o.getTotal(),
                o.getItems().stream().map(this::toLine).toList()
        );
    }

    private OrderDetailResponse.Line toLine(OrderItem it){
        return new OrderDetailResponse.Line(
                it.getProduct().getId(),
                it.getProduct().getName(),
                it.getQuantity(),
                it.getUnitPrice(),
                it.getLineTotal()
        );
    }
}
