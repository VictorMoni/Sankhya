package org.sankhya.exception;


import jakarta.validation.ConstraintViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.*;

@ControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(OutOfStockException.class)
    public ResponseEntity<List<OutOfStockError>> handleOutOfStock(OutOfStockException ex) {
        return ResponseEntity.unprocessableEntity().body(ex.getErrors());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String,Object>> handleBadRequest(IllegalArgumentException ex){
        return ResponseEntity.badRequest().body(Map.of(
                "status", 400, "error", "Bad Request", "message", ex.getMessage()
        ));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String,Object>> handleInvalid(MethodArgumentNotValidException ex){
        Map<String,Object> body = Map.of(
                "status", 400,
                "error", "Bad Request",
                "message", "Validation error",
                "fields", ex.getBindingResult().getFieldErrors().stream()
                        .map(fe -> Map.of("field", fe.getField(), "message", fe.getDefaultMessage()))
                        .toList()
        );
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 400);
        body.put("error", "Bad Request");
        body.put("timestamp", OffsetDateTime.now());
        body.put("message", "Constraint violation");
        body.put("errors", ex.getConstraintViolations().stream().map(cv -> Map.of(
                "property", cv.getPropertyPath().toString(),
                "invalidValue", String.valueOf(cv.getInvalidValue()),
                "message", cv.getMessage()
        )).toList());
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleUnexpected(Exception ex) {
        // se quiser logar ex.printStackTrace();
        return ResponseEntity
                .status(500)
                .body(Map.of("status", 500, "error", "Internal Server Error"));
    }

    @ExceptionHandler(InventoryViolationException.class)
    public ResponseEntity<Map<String, Object>> handleInventoryViolation(InventoryViolationException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 422);
        body.put("error", "Unprocessable Entity");
        body.put("timestamp", OffsetDateTime.now());
        body.put("message", "Inventory violation");
        body.put("errors", ex.getErrors());
        return ResponseEntity.unprocessableEntity().body(body);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Object> handleResponseStatus(ResponseStatusException ex) {
        return ResponseEntity
                .status(ex.getStatusCode())
                .body(Map.of(
                        "status", ex.getStatusCode().value(),
                        "error", ex.getReason() != null ? ex.getReason() : ex.getStatusCode().toString()
                ));
    }
}