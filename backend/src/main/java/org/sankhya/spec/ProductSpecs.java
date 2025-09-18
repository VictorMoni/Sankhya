package org.sankhya.spec;

import org.sankhya.model.Product;
import org.springframework.data.jpa.domain.Specification;

public class ProductSpecs {
    public static Specification<Product> nameContains(String term){
        return (root, q, cb) -> term == null || term.isBlank() ? cb.conjunction() :
                cb.like(cb.lower(root.get("name")), "%" + term.toLowerCase() + "%");
    }
}