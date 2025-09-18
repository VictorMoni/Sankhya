package org.sankhya.dto;

import java.math.BigDecimal;
import java.util.List;

public record CreateOrderResponse(Long id, BigDecimal total, List<Line> items){
    public record Line(Long productId, String name, Integer quantity, BigDecimal unitPrice, BigDecimal lineTotal){}
}
