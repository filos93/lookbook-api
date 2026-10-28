-- ============================================================
-- DATI INIZIALI DI TEST (SEEDING)
-- ============================================================

USE lookbook_db;

-- Inserimento Utenti
INSERT INTO users (name, surname, email) VALUES 
('Filo', 'Lareca', 'filo@example.com'),
('Maria', 'Talia', 'maria@example.com');

-- Inserimento Prodotti con Prezzi
INSERT INTO products (user_id, name, price) VALUES 
(1, 'giacca-vintage', 85.00),
(1, 'pantaloni-cargo', 40.00),
(1, 'maglia cotone', 15.00),
(2, 'cappotto-lana', 90.00),
(2, 'scarpe sneakers', 65.00),
(2, 'zaino vintage', 45.00);

-- Inserimento Foto Prodotti
INSERT INTO product_photos (product_id, photo_url) VALUES 
(1, 'https://images.unsplash.com/photo-1551028719-00167b16eac5'),
(2, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80'),
(3, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518'),
(4, 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3'),
(5, 'https://images.unsplash.com/photo-1549298916-b41d501d3772'),
(6, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62');