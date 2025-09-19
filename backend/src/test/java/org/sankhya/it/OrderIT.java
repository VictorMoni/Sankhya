package org.sankhya.it;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.sankhya.dto.CreateOrderRequest;
import org.sankhya.model.Product;
import org.sankhya.repository.OrderRepository;
import org.sankhya.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrderIT {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired ProductRepository products;
    @Autowired OrderRepository orders;

    Long idA, idB;

    private Product saveProduct(String name, String price, int stock) {
        Product p = new Product();
        p.setName(name);
        p.setPrice(new BigDecimal(price));
        p.setStock(stock);
        p.setActive(true);
        p.setVersion(0);
        return products.save(p);
    }

    @BeforeEach
    void cleanAndSeed() {
        // LIMPA na ordem correta: primeiro orders (cai cascade em order_items), depois products
        orders.deleteAllInBatch();
        products.deleteAllInBatch();

        // SEED: estes serão os produtos usados no checkout
        idA = saveProduct("Café Torrado 500g", "18.90", 10).getId();
        idB = saveProduct("Caneca Inox 300ml", "29.00", 5).getId();
    }

    @Test
    void checkout_list_getDetail_endToEnd() throws Exception {
        // monta o payload do pedido usando EXATAMENTE os produtos seedados
        var req = new CreateOrderRequest(List.of(
                new CreateOrderRequest.Item(idA, 2), // vai a 8
                new CreateOrderRequest.Item(idB, 1)  // vai a 4
        ));
        String json = mapper.writeValueAsString(req);

        // POST /checkout
        MvcResult post = mvc.perform(post("/api/v1/orders/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andReturn();

        long orderId = mapper.readTree(post.getResponse().getContentAsByteArray())
                .get("id").asLong();

        // GET /orders (lista) - mais recentes
        mvc.perform(get("/api/v1/orders")
                        .param("size", "5")
                        .param("sort", "createdAt,desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(orderId));

        // GET /orders/{id} (detalhe)
        mvc.perform(get("/api/v1/orders/{id}", orderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.items[0].quantity").exists());

        // Verifica débito de estoque
        Product a = products.findById(idA).orElseThrow();
        Product b = products.findById(idB).orElseThrow();
        assertThat(a.getStock()).isEqualTo(8);
        assertThat(b.getStock()).isEqualTo(4);
    }

    @Test
    void checkout_retornar422_quandoSemEstoque() throws Exception {
        var req = new CreateOrderRequest(List.of(
                new CreateOrderRequest.Item(idA, 999)
        ));
        mvc.perform(post("/api/v1/orders/checkout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
    }
}
