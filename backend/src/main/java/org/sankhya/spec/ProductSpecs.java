package org.sankhya.spec;

import org.sankhya.model.Product;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.Collection;

public class ProductSpecs {

    public static Specification<Product> nameContains(String term) {
        return (root, q, cb) -> {
            if (term == null || term.isBlank()) return cb.conjunction();
            String like = "%" + term.trim().toLowerCase() + "%";
            return cb.like(cb.lower(root.get("name")), like);
        };
    }

    public static Specification<Product> active(Boolean active) {
        return (root, q, cb) -> active == null ? cb.conjunction()
                : (active ? cb.isTrue(root.get("active")) : cb.isFalse(root.get("active")));
    }

    public static Specification<Product> stockGte(Integer min) {
        return (root, q, cb) -> min == null ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("stock"), min);
    }

    public static Specification<Product> priceBetween(BigDecimal min, BigDecimal max) {
        return (root, q, cb) -> {
            if (min == null && max == null) return cb.conjunction();
            if (min != null && max != null) return cb.between(root.get("price"), min, max);
            return min != null ? cb.greaterThanOrEqualTo(root.get("price"), min)
                    : cb.lessThanOrEqualTo(root.get("price"), max);
        };
    }

    public static Specification<Product> idIn(Collection<Long> ids) {
        return (root, q, cb) -> (ids == null || ids.isEmpty()) ? cb.conjunction()
                : root.get("id").in(ids);
    }
}