-- ============================================================
-- SCHEMA DATABASE COMPLETO - LOOKBOOK DB
-- ============================================================

DROP DATABASE IF EXISTS lookbook_db;
CREATE DATABASE lookbook_db;
USE lookbook_db;

-- 1. Tabella Utenti (Anagrafica)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabella Prodotti (Incluso campo price DECIMAL)
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Tabella Foto Prodotti
CREATE TABLE product_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    photo_url TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 4. Tabella Ordini Swap
CREATE TABLE swap_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Giunzione Swap - Utenti
CREATE TABLE swap_order_users (
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (order_id, user_id),
    FOREIGN KEY (order_id) REFERENCES swap_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Giunzione Swap - Prodotti
CREATE TABLE swap_order_products (
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES swap_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);