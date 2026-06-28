-- CloudCart Sample Data Seeds
USE cloudcart;

-- Insert default admin and customer
-- Passwords are bcrypt hashes for 'admin123' and 'customer123' respectively
INSERT INTO users (username, email, password_hash, role, phone, address) VALUES
('admin', 'admin@cloudcart.com', '$2a$10$tZ2Zp2zYyK3n3Bw8rL7PGeR4dK2j9YmGg/sK2YxG9E47fFpM61k72', 'admin', '+1234567890', 'AWS Cloud HQ, Seattle, WA'),
('john_doe', 'john@gmail.com', '$2a$10$yXfBwFpxw16zKzL1w7j3/O4t7XGzP3v6rK2YxG9E47fFpM61k72', 'customer', '+1987654321', '123 Main Street, San Jose, CA');

-- Insert categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Gadgets, devices, smart appliances, and custom electronics.'),
('Apparel & Fashion', 'Designer clothes, shoes, accessories, and activewear.'),
('Home & Kitchen', 'Modern home appliances, kitchen tools, and smart lighting.'),
('Books', 'Bestsellers, textbooks, technology guides, and fiction.'),
('Fitness & Outdoors', 'Exercise gear, outdoor equipment, water bottles, and trackers.');

-- Insert products
INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES
-- Electronics
('CloudSound Wireless Headphones', 'Active noise cancelling wireless headphones with 40-hour battery life and voice assistant integration.', 129.99, 50, 1, '/uploads/headphones.jpg'),
('SmartSphere Alexa Speaker', 'Compact smart speaker with Alexa voice control, rich audio quality, and smart home hub capabilities.', 49.99, 120, 1, '/uploads/speaker.jpg'),
('SwiftBook Pro 14', 'High-performance laptop with 16GB RAM, 512GB NVMe SSD, and octa-core processor.', 999.00, 15, 1, '/uploads/laptop.jpg'),

-- Apparel
('Apex Performance Run Shoes', 'Ultra-light breathable running sneakers with responsive cushioning and carbon plate technology.', 89.50, 30, 2, '/uploads/shoes.jpg'),
('Classic Cotton Denim Jacket', 'Premium heavy-duty denim jacket with metal button closures and double breast pockets.', 65.00, 25, 2, '/uploads/jacket.jpg'),

-- Home & Kitchen
('AeroBrew Espresso Machine', '15-bar Italian pump espresso and cappuccino maker with milk frothing wand.', 159.99, 20, 3, '/uploads/espresso.jpg'),
('SmartGlow LED Strip Lights', '16.4ft WiFi-enabled RGB color-changing LED strips with music sync mode.', 24.99, 200, 3, '/uploads/lights.jpg'),

-- Books
('Architecting AWS Cloud Applications', 'A comprehensive guide to building scalable, reliable, and secure cloud applications on Amazon Web Services.', 45.00, 80, 4, '/uploads/aws_book.jpg'),
('Mastering Full Stack Development', 'A step-by-step workbook for building REST APIs, single-page applications, and dockerized microservices.', 39.99, 45, 4, '/uploads/fullstack_book.jpg'),

-- Fitness
('FlexBand Resistance Set', '5 stackable latex exercise bands with handles, ankle straps, and carrying case.', 18.99, 150, 5, '/uploads/resistance_bands.jpg'),
('Summit Trail Backpack 45L', 'Ergonomic water-resistant hiking backpack with rain cover and hydration sleeve.', 75.00, 40, 5, '/uploads/backpack.jpg');

-- Create a cart for user john_doe (id = 2)
INSERT INTO cart (user_id) VALUES (2);

-- Insert items into john_doe's cart
INSERT INTO cart_items (cart_id, product_id, quantity) VALUES
(1, 1, 1), -- 1x CloudSound Wireless Headphones
(1, 8, 2); -- 2x Architecting AWS Cloud Applications

-- Insert reviews
INSERT INTO reviews (user_id, product_id, rating, comment) VALUES
(2, 1, 5, 'Absolutely incredible sound quality and comfort! The noise cancellation is premium.'),
(2, 8, 5, 'Highly recommended textbook for MCA Cloud Computing courses. Very practical examples!');
