package org.sankhya.service;

import lombok.RequiredArgsConstructor;
import org.sankhya.dto.CreateOrderRequest;
import org.sankhya.dto.CreateOrderResponse;
import org.sankhya.dto.OutOfStockError;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepo;

    @Transactional
    public CreateOrderResponse checkout(CreateOrderRequest req){

        // Agrupa itens por productId (soma quantidades duplicadas)
        Map<Long, Integer> requestedQty = req.items().stream()
                .collect(Collectors.toMap(
                        CreateOrderRequest.Item::productId,
                        CreateOrderRequest.Item::quantity,
                        Integer::sum
                ));

        // LOCK PESSIMISTA: FOR UPDATE
        List<Product> found = productRepository.findAllForUpdateByIdIn(requestedQty.keySet());
        Map<Long, Product> products = found.stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        List<OutOfStockError> errors = new ArrayList<>();

        // Validação de disponibilidade
        requestedQty.forEach((productId, qty) -> {
            Product p = products.get(productId);
            if (p == null || !Boolean.TRUE.equals(p.getActive())) {
                errors.add(new OutOfStockError(productId, 0));
                return;
            }
            int available = p.getStock();
            if (available < qty) {
                errors.add(new OutOfStockError(productId, available));
            }
        });

        if (!errors.isEmpty()) {
            throw new OutOfStockException(errors);
        }

        Order order = new Order();
        BigDecimal total = BigDecimal.ZERO;

        // Debita estoque e monta itens
        for (var entry : requestedQty.entrySet()) {
            Long productId = entry.getKey();
            int qty = entry.getValue();
            Product p = products.get(productId);
            p.setStock(p.getStock() - qty);

            OrderItem oi = new OrderItem();
            oi.setProduct(p);
            oi.setQuantity(qty);
            oi.setUnitPrice(p.getPrice());
            BigDecimal line = p.getPrice().multiply(BigDecimal.valueOf(qty));
            oi.setLineTotal(line);
            order.addItem(oi);
            total = total.add(line);
        }

        order.setTotal(total.setScale(2, RoundingMode.HALF_EVEN));

        Order saved = orderRepo.save(order);
        productRepository.saveAll(products.values()); // persiste o novo estoque

        return new CreateOrderResponse(
                saved.getId(), saved.getTotal(),
                saved.getItems().stream().map(oi -> new CreateOrderResponse.Line(
                        oi.getProduct().getId(),
                        oi.getProduct().getName(),
                        oi.getQuantity(),
                        oi.getUnitPrice(),
                        oi.getLineTotal().setScale(2, RoundingMode.HALF_EVEN)
                )).toList()
        );
    }
}