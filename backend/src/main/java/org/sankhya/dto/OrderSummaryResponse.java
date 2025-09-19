// src/main/java/org/sankhya/dto/OrderSummaryResponse.java
package org.sankhya.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record OrderSummaryResponse(
        Long id,
        OffsetDateTime createdAt,
        BigDecimal total,
        Long itemsCount
) {}