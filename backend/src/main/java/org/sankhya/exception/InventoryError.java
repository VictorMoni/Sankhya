package org.sankhya.exception;

public record InventoryError(Long productId, Integer available, String reason) {}
