package org.sankhya.exception;


import jakarta.validation.ConstraintViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.WebRequest;
import java.time.OffsetDateTime;
import java.util.*;

@ControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(OutOfStockException.class)
    public ResponseEntity<Map<String, Object>> handleOutOfStock(OutOfStockException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 422);
        body.put("error", "Unprocessable Entity");
        body.put("timestamp", OffsetDateTime.now());
        body.put("message", "Some products are out of stock or insufficient");
        body.put("errors", ex.getErrors()); // lista de OutOfStockError(productId, available)

        return ResponseEntity.unprocessableEntity().body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleBeanValidation(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 400);
        body.put("error", "Bad Request");
        body.put("timestamp", OffsetDateTime.now());
        body.put("message", "Validation failed");

        List<Map<String, Object>> fieldErrors = ex.getBindingResult().getFieldErrors().stream().map(err -> {
            Map<String, Object> e = new LinkedHashMap<>();
            e.put("field", err.getField());
            e.put("rejectedValue", err.getRejectedValue());
            e.put("message", err.getDefaultMessage());
            return e;
        }).toList();

        body.put("errors", fieldErrors);
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
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex, WebRequest req) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 500);
        body.put("error", "Internal Server Error");
        body.put("timestamp", OffsetDateTime.now());
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
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
}