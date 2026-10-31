CREATE DATABASE IF NOT EXISTS `defaultdb`;
USE `defaultdb`;

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS swap_order_products;
DROP TABLE IF EXISTS swap_order_users;
DROP TABLE IF EXISTS swap_orders;
DROP TABLE IF EXISTS product_photos;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- Users table with UNIQUE email constraint
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table with DECIMAL price and ENUM status
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status ENUM('available', 'swapped') NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Product photos
CREATE TABLE product_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    photo_url TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Swap orders and pivot tables
CREATE TABLE swap_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE swap_order_users (
    order_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (order_id, user_id),
    FOREIGN KEY (order_id) REFERENCES swap_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE swap_order_products (
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES swap_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);