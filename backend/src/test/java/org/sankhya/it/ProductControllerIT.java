package org.sankhya.it;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.sankhya.dto.ProductCreateRequest;
import org.sankhya.dto.ProductUpdateRequest;
import org.sankhya.repository.OrderRepository;
import org.sankhya.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductControllerIT {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired ProductRepository products;
    @Autowired OrderRepository orders;

    @BeforeEach
    void clean() {
        orders.deleteAllInBatch();
        products.deleteAllInBatch();
    }

    @Test
    void create_update_delete_and_get() throws Exception {
        // CREATE
        var req = new ProductCreateRequest("Café Pilão 250g", new BigDecimal("12.50"), 7, true);
        var created = mvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Café Pilão 250g")))
                .andExpect(jsonPath("$.price", is(12.50)))
                .andExpect(jsonPath("$.stock", is(7)))
                .andReturn();

        long id = mapper.readTree(created.getResponse().getContentAsByteArray()).get("id").asLong();

        // GET
        mvc.perform(get("/api/v1/products/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id));

        // UPDATE (PUT)
        var upd = new ProductUpdateRequest("Café Pilão 250g", new BigDecimal("13.00"), 9, true);
        mvc.perform(put("/api/v1/products/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(upd)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.price", is(13.00)))
                .andExpect(jsonPath("$.stock", is(9)));

        // DELETE
        mvc.perform(delete("/api/v1/products/{id}", id))
                .andExpect(status().isNoContent());
    }
}
