CREATE TABLE products (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      price DECIMAL(12,2) NOT NULL,
      stock INT NOT NULL CHECK (stock >= 0),
      active BOOLEAN NOT NULL DEFAULT TRUE,
      version INT NOT NULL DEFAULT 0,
      UNIQUE KEY uk_products_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_items (
     id BIGINT AUTO_INCREMENT PRIMARY KEY,
     order_id BIGINT NOT NULL,
     product_id BIGINT NOT NULL,
     quantity INT NOT NULL,
     unit_price DECIMAL(12,2) NOT NULL,
     line_total DECIMAL(12,2) NOT NULL,
     CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
     CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(id),
     INDEX idx_order_items_order (order_id),
     INDEX idx_order_items_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;