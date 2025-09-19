package org.sankhya.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.sankhya.dto.CreateOrderRequest;
import org.sankhya.dto.CreateOrderResponse;
import org.sankhya.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) { this.service = service; }

    @PostMapping("/checkout")
    public ResponseEntity<CreateOrderResponse> checkout(@Valid @RequestBody CreateOrderRequest req) {
        var resp = service.checkout(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }
}