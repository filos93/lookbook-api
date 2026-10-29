ALTER TABLE products
ADD COLUMN status ENUM('available', 'swapped')
NOT NULL DEFAULT 'available';