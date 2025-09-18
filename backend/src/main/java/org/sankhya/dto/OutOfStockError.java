package org.sankhya.dto;

public record OutOfStockError(Long productId, Integer available) {}
