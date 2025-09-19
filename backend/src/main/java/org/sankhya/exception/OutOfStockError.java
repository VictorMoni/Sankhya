package org.sankhya.exception;

public record OutOfStockError(Long productId, Integer available) {}
