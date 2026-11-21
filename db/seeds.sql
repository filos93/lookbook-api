-- Inserimento Utenti
INSERT INTO users (name, surname, email) VALUES
('Marco', 'Rossi', 'marco.rossi@example.com'),
('Giulia', 'Bianchi', 'giulia.bianchi@example.com'),
('Luca', 'Verdi', 'luca.verdi@example.com'),
('Elena', 'Ferrari', 'elena.ferrari@example.com'),
('Matteo', 'Russo', 'matteo.russo@example.com'),
('Chiara', 'Esposito', 'chiara.esposito@example.com'),
('Alessandro', 'Romano', 'alessandro.romano@example.com'),
('Sofia', 'Gallo', 'sofia.gallo@example.com'),
('Davide', 'Costa', 'davide.costa@example.com'),
('Francesca', 'Fontana', 'francesca.fontana@example.com');

-- Inserimento Prodotti
INSERT INTO products (user_id, name, price, status) VALUES
((SELECT id FROM users WHERE email = 'marco.rossi@example.com'), 'Giacca in pelle Vintage', 120.00, 'available'),
((SELECT id FROM users WHERE email = 'marco.rossi@example.com'), 'Camicia in Lino Bianca', 35.00, 'available'),
((SELECT id FROM users WHERE email = 'giulia.bianchi@example.com'), 'Cappotto di Lana Oversize', 150.00, 'available'),
((SELECT id FROM users WHERE email = 'giulia.bianchi@example.com'), 'Borsa a Tracolla in Cuoio', 85.00, 'available'),
((SELECT id FROM users WHERE email = 'luca.verdi@example.com'), 'Sneakers High-Top', 110.00, 'available'),
((SELECT id FROM users WHERE email = 'elena.ferrari@example.com'), 'Abito da Sera Seta', 140.00, 'available'),
((SELECT id FROM users WHERE email = 'matteo.russo@example.com'), 'Maglione Cashmere Blu', 95.00, 'available'),
((SELECT id FROM users WHERE email = 'chiara.esposito@example.com'), 'Jeans Denim Raw', 75.00, 'available'),
((SELECT id FROM users WHERE email = 'alessandro.romano@example.com'), 'Orologio Cronografo', 200.00, 'available'),
((SELECT id FROM users WHERE email = 'sofia.gallo@example.com'), 'Trench Coat Classico', 130.00, 'available'),
((SELECT id FROM users WHERE email = 'davide.costa@example.com'), 'Zaino Tecnico', 65.00, 'available'),
((SELECT id FROM users WHERE email = 'francesca.fontana@example.com'), 'Stivaletti in Camoscio', 90.00, 'available');

-- Inserimento Foto Prodotti
INSERT INTO product_photos (product_id, photo_url) VALUES
((SELECT id FROM products WHERE name = 'Giacca in pelle Vintage' LIMIT 1), 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM products WHERE name = 'Camicia in Lino Bianca' LIMIT 1), 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM products WHERE name = 'Cappotto di Lana Oversize' LIMIT 1), 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM products WHERE name = 'Borsa a Tracolla in Cuoio' LIMIT 1), 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM products WHERE name = 'Sneakers High-Top' LIMIT 1), 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM products WHERE name = 'Abito da Sera Seta' LIMIT 1), 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM products WHERE name = 'Maglione Cashmere Blu' LIMIT 1), 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM products WHERE name = 'Jeans Denim Raw' LIMIT 1), 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM products WHERE name = 'Orologio Cronografo' LIMIT 1), 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM products WHERE name = 'Trench Coat Classico' LIMIT 1), 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM products WHERE name = 'Zaino Tecnico' LIMIT 1), 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'),
((SELECT id FROM products WHERE name = 'Stivaletti in Camoscio' LIMIT 1), 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80');