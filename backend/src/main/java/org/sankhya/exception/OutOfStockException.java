package org.sankhya.exception;

import org.sankhya.dto.OutOfStockError;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.List;

@ResponseStatus(HttpStatus.CONFLICT)
public class OutOfStockException extends RuntimeException {
    private final List<OutOfStockError> errors;
    public OutOfStockException(List<OutOfStockError> errors){ this.errors = errors; }
    public List<OutOfStockError> getErrors(){ return errors; }
}
