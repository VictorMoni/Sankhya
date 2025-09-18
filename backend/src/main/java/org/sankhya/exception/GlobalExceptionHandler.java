package org.sankhya.exception;

import org.sankhya.dto.OutOfStockError;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(OutOfStockException.class)
    public ResponseEntity<List<OutOfStockError>> handle(OutOfStockException ex){
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getErrors());
    }
}