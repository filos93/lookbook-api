-- ============================================================
-- MIGRATION 001: Aggiunta campo prezzo e popolamento prodotti esistenti
-- ============================================================

USE lookbook_db;

-- 1. Aggiunta colonna price se non presente
ALTER TABLE products 
ADD COLUMN price DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER name;

-- 2. Aggiornamento prezzi prodotti esistenti basato sul nome
SET SQL_SAFE_UPDATES = 0;

UPDATE products SET price = 85.00 WHERE name LIKE '%Giacca%' OR name LIKE '%giacca%';
UPDATE products SET price = 40.00 WHERE name LIKE '%Pantaloni%' OR name LIKE '%pantaloni%';
UPDATE products SET price = 15.00 WHERE name LIKE '%Maglia%' OR name LIKE '%maglia%';
UPDATE products SET price = 90.00 WHERE name LIKE '%Cappotto%' OR name LIKE '%cappotto%';
UPDATE products SET price = 65.00 WHERE name LIKE '%Scarpe%' OR name LIKE '%sneakers%';
UPDATE products SET price = 45.00 WHERE name LIKE '%Zaino%' OR name LIKE '%zaino%';

-- Fallback per eventuali rimanenti
UPDATE products SET price = 20.00 WHERE price = 0.00 OR price IS NULL;

SET SQL_SAFE_UPDATES = 1;