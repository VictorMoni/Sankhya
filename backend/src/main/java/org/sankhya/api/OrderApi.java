package org.sankhya.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.sankhya.dto.CreateOrderRequest;
import org.sankhya.dto.CreateOrderResponse;
import org.sankhya.dto.OrderDetailResponse;
import org.sankhya.dto.OrderSummaryResponse;
import org.sankhya.exception.OutOfStockError;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Tag(name = "Orders", description = "Checkout e consulta de pedidos")
@RequestMapping("/api/v1/orders")
public interface OrderApi {

    @Operation(summary = "Listar pedidos (paginado)")
    @ApiResponse(responseCode = "200", description = "Página de pedidos")
    @GetMapping
    Page<OrderSummaryResponse> list(@ParameterObject Pageable pageable);

    @Operation(summary = "Obter detalhe do pedido")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Detalhe do pedido",
                    content = @Content(schema = @Schema(implementation = OrderDetailResponse.class))),
            @ApiResponse(responseCode = "404", description = "Pedido não encontrado")
    })
    @GetMapping("/{id}")
    OrderDetailResponse get(@PathVariable("id") Long id);

    @Operation(
            summary = "Finalizar pedido (checkout)",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = CreateOrderRequest.class),
                            examples = @ExampleObject(
                                    name = "Exemplo",
                                    value = """
                        {"items":[{"productId":1,"quantity":2},{"productId":3,"quantity":1}]}
                        """
                            )
                    )
            )
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Pedido criado",
                    content = @Content(schema = @Schema(implementation = CreateOrderResponse.class))),
            @ApiResponse(responseCode = "422", description = "Itens indisponíveis",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = OutOfStockError.class))))
    })
    @PostMapping("/checkout")
    ResponseEntity<CreateOrderResponse> checkout(
            @Valid @org.springframework.web.bind.annotation.RequestBody CreateOrderRequest req
    );
}
