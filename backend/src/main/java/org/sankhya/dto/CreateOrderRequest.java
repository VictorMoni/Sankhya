package org.sankhya.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreateOrderRequest(@NotNull List<Item> items) {
    public record Item(@NotNull Long productId, @Min(1) Integer quantity) {}
}