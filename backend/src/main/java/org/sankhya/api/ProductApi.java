package org.sankhya.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.sankhya.dto.ProductCreateRequest;
import org.sankhya.dto.ProductResponse;
import org.sankhya.dto.ProductUpdateRequest;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@Tag(name = "Products", description = "Catálogo de produtos")
@RequestMapping("/api/v1/products")
public interface ProductApi {

    @Operation(summary = "Buscar produtos com filtros e paginação")
    @ApiResponse(responseCode = "200", description = "Página de produtos")
    @GetMapping
    Page<ProductResponse> search(
            @RequestParam(name = "q", required = false) String q,
            @RequestParam(name = "onlyActive", required = false) Boolean onlyActive,
            @RequestParam(name = "minStock", required = false) Integer minStock,
            @RequestParam(name = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(name = "maxPrice", required = false) BigDecimal maxPrice,
            @ParameterObject Pageable pageable
    );

    @Operation(summary = "Obter produto por id")
    @ApiResponse(responseCode = "200", description = "Encontrado")
    @GetMapping("/{id}")
    ProductResponse get(@PathVariable("id") Long id);

    @Operation(
            summary = "Criar produto",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ProductCreateRequest.class),
                            examples = @ExampleObject(
                                    name = "Exemplo",
                                    value = "{\"name\":\"Café Torrado 500g\",\"price\":18.90,\"stock\":5,\"active\":true}"
                            )
                    )
            )
    )
    @ApiResponse(responseCode = "201", description = "Criado",
            content = @Content(schema = @Schema(implementation = ProductResponse.class)))
    @PostMapping
    ResponseEntity<ProductResponse> create(
            @Valid @org.springframework.web.bind.annotation.RequestBody ProductCreateRequest body
    );

    @Operation(summary = "Atualizar produto (PUT)")
    @ApiResponse(responseCode = "200", description = "Atualizado")
    @PutMapping("/{id}")
    ProductResponse update(
            @PathVariable("id") Long id,
            @Valid @org.springframework.web.bind.annotation.RequestBody ProductUpdateRequest body
    );

    @Operation(summary = "Excluir produto")
    @ApiResponse(responseCode = "204", description = "Excluído")
    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@PathVariable("id") Long id);
}
