package org.sankhya.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.sankhya.dto.CreateOrderRequest;
import org.sankhya.dto.CreateOrderResponse;
import org.sankhya.exception.OutOfStockException;
import org.sankhya.model.Order;
import org.sankhya.model.OrderItem;
import org.sankhya.model.Product;
import org.sankhya.repository.OrderRepository;
import org.sankhya.repository.ProductRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock ProductRepository productRepository;
    @Mock OrderRepository orderRepository;

    @InjectMocks OrderService service;

    private Product p(long id, String name, String price, int stock, boolean active) {
        Product p = new Product();
        p.setId(id);
        p.setName(name);
        p.setPrice(new BigDecimal(price));
        p.setStock(stock);
        p.setActive(active);
        p.setVersion(0);
        return p;
    }

    @Test
    void checkout_happyPath_deveCriarPedido_eDebitarEstoque() {
        // arrange
        Product a = p(1L, "Café", "18.90", 5, true);
        Product b = p(3L, "Caneca", "29.00", 2, true);

        when(productRepository.findAllById(List.of(1L, 3L)))
                .thenReturn(List.of(a, b));
        // devolve o próprio objeto com id setado
        when(orderRepository.save(any(Order.class)))
                .thenAnswer(inv -> {
                    Order o = inv.getArgument(0);
                    o.setId(100L);
                    // garanta bidirecional para o mapeamento do retorno
                    for (OrderItem it : o.getItems()) it.setOrder(o);
                    return o;
                });

        CreateOrderRequest req = new CreateOrderRequest(List.of(
                new CreateOrderRequest.Item(1L, 2),
                new CreateOrderRequest.Item(3L, 1)
        ));

        // act
        CreateOrderResponse resp = service.checkout(req);

        // assert
        assertThat(resp.id()).isEqualTo(100L);
        assertThat(resp.total()).isEqualByComparingTo(new BigDecimal("66.80")); // 18.90*2 + 29.00
        assertThat(resp.items()).hasSize(2);
        assertThat(a.getStock()).isEqualTo(3); // 5 - 2
        assertThat(b.getStock()).isEqualTo(1); // 2 - 1
        verify(productRepository).saveAll(anyCollection());
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    void checkout_outOfStock_deveLancar422() {
        Product a = p(1L, "Café", "18.90", 1, true);
        when(productRepository.findAllById(List.of(1L)))
                .thenReturn(List.of(a));

        CreateOrderRequest req = new CreateOrderRequest(
                List.of(new CreateOrderRequest.Item(1L, 3))
        );

        assertThatThrownBy(() -> service.checkout(req))
                .isInstanceOf(OutOfStockException.class);
        verify(orderRepository, never()).save(any());
    }

    @Test
    void checkout_produtoInativo_deveLancar422() {
        Product a = p(1L, "Café", "18.90", 10, false);
        when(productRepository.findAllById(List.of(1L)))
                .thenReturn(List.of(a));

        CreateOrderRequest req = new CreateOrderRequest(
                List.of(new CreateOrderRequest.Item(1L, 1))
        );

        assertThatThrownBy(() -> service.checkout(req))
                .isInstanceOf(OutOfStockException.class);
    }

    @Test
    void checkout_payloadVazio_deveLancarIllegalArgument() {
        assertThatThrownBy(() -> service.checkout(new CreateOrderRequest(List.of())))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void checkout_produtoInativo_deveLancarOutOfStock() {
        // given
        var req = new CreateOrderRequest(List.of(new CreateOrderRequest.Item(1L, 1)));

        Product inativo = new Product();
        inativo.setId(1L);
        inativo.setName("Qualquer");
        inativo.setPrice(new BigDecimal("10.00"));
        inativo.setStock(10);
        inativo.setActive(false);
        inativo.setVersion(0);

        when(productRepository.findAllById(any())).thenReturn(List.of(inativo));

        // when/then
        assertThatThrownBy(() -> service.checkout(req))
                .isInstanceOf(OutOfStockException.class);

        verify(orderRepository, never()).save(any());
        verify(productRepository, never()).saveAll(anyCollection());
    }

    @Test
    void checkout_ok_calculaTotalComDuasCasasESalva() {
        // given
        var req = new CreateOrderRequest(List.of(
                new CreateOrderRequest.Item(1L, 2),  // 18.90 * 2 = 37.80
                new CreateOrderRequest.Item(2L, 1)   // 29.00 * 1 = 29.00  => total 66.80
        ));

        Product p1 = new Product();
        p1.setId(1L); p1.setName("Café"); p1.setPrice(new BigDecimal("18.90"));
        p1.setStock(10); p1.setActive(true); p1.setVersion(0);

        Product p2 = new Product();
        p2.setId(2L); p2.setName("Caneca"); p2.setPrice(new BigDecimal("29.00"));
        p2.setStock(5); p2.setActive(true); p2.setVersion(0);

        when(productRepository.findAllById(any())).thenReturn(List.of(p1, p2));
        when(orderRepository.save(any())).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(123L);
            return o;
        });

        // when
        CreateOrderResponse resp = service.checkout(req);

        // then
        assertThat(resp.id()).isEqualTo(123L);
        assertThat(resp.total()).isEqualByComparingTo("66.80"); // 2 casas, HALF_EVEN
        assertThat(resp.items()).hasSize(2);
        assertThat(resp.items().get(0).lineTotal()).isEqualByComparingTo("37.80");

        assertThat(p1.getStock()).isEqualTo(8);
        assertThat(p2.getStock()).isEqualTo(4);

        verify(orderRepository).save(any(Order.class));
        verify(productRepository).saveAll(anyCollection());
    }

}
