-- ============================================================
-- MIGRATION 002: Aggiornamento prezzi basato su pattern nomi
-- ============================================================

USE lookbook_db;

SET SQL_SAFE_UPDATES = 0;

-- Aggiornamento prezzi per categoria
UPDATE products SET price = 85.00 WHERE name LIKE '%Giacca%';
UPDATE products SET price = 40.00 WHERE name LIKE '%Pantaloni%';
UPDATE products SET price = 30.00 WHERE name LIKE '%Gonna%';
UPDATE products SET price = 15.00 WHERE name LIKE '%Maglia%';
UPDATE products SET price = 65.00 WHERE name LIKE '%Scarpe%' OR name LIKE '%Sneakers%';
UPDATE products SET price = 45.00 WHERE name LIKE '%Zaino%';

-- Prezzo di fallback per prodotti rimasti a 0.00 o NULL
UPDATE products SET price = 25.00 WHERE price = 0.00 OR price IS NULL;

SET SQL_SAFE_UPDATES = 1;