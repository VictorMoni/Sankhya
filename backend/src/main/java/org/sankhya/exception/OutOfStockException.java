package org.sankhya.exception;

import java.util.List;

public class OutOfStockException extends RuntimeException {
    private final List<OutOfStockError> errors;

    public OutOfStockException(List<OutOfStockError> errors) {
        super("Out of stock");
        this.errors = errors;
    }
    public List<OutOfStockError> getErrors() { return errors; }
}
