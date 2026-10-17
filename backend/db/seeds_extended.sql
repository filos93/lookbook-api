-- ============================================================
-- SEEDING ESTESO E RESET DATI - LOOKBOOK DB
-- ============================================================

USE lookbook_db;

-- 1. Svuotamento in sicurezza di tutte le tabelle
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE swap_order_products;
TRUNCATE TABLE swap_order_users;
TRUNCATE TABLE swap_orders;
TRUNCATE TABLE product_photos;
TRUNCATE TABLE products;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. Inserimento Utenti (ID 1, 2, 3, 4, 5)
INSERT INTO users (name, surname, email) VALUES 
('Franco', 'Leca', 'franco.leca@example.com'),
('Maria', 'Rosa', 'maria.rosa@example.com'),
('Luca', 'Romano', 'luca.romano@example.com'),
('Marco', 'Rossi', 'marco.rossi@example.com'),
('Sara', 'Bianchi', 'sara.bianchi@example.com');

-- 3. Inserimento Prodotti con prezzo incluso (ID 1, 2, 3, 4, 5)
INSERT INTO products (user_id, name, price) VALUES 
(1, 'Giacca vintage', 85.00),
(1, 'Pantaloni cargo', 40.00),
(1, 'Maglia cotone', 15.00),
(4, 'Scarpe sneakers', 65.00),
(5, 'Zaino vintage', 45.00);

-- 4. Inserimento Foto (ID 1..5)
INSERT INTO product_photos (product_id, photo_url) VALUES 
(1, 'https://images.unsplash.com/photo-1551028719-00167b16eac5'),
(2, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80'),
(3, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518'),
(4, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'),
(5, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62');