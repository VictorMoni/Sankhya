package org.sankhya.exception;

import java.util.List;

public class InventoryViolationException extends RuntimeException {
    private final List<InventoryError> errors;
    public InventoryViolationException(List<InventoryError> errors) {
        super("Inventory violation");
        this.errors = errors;
    }
    public List<InventoryError> getErrors() { return errors; }
}