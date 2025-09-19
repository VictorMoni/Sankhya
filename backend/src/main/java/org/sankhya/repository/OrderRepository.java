// src/main/java/org/sankhya/repository/OrderRepository.java
package org.sankhya.repository;

import org.sankhya.dto.OrderSummaryResponse;
import org.sankhya.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // OrderRepository.java
    @Query("""
       select new org.sankhya.dto.OrderSummaryResponse(
           o.id, o.createdAt, o.total, count(oi)
       )
       from Order o
        left join o.items oi
        group by o.id, o.createdAt, o.total
       """)
    Page<OrderSummaryResponse> findSummaries(Pageable pageable);

    @EntityGraph(attributePaths = {"items", "items.product"})
    Optional<Order> findWithItemsById(Long id);

}

