-- BazarBondhu sample data
-- Demo accounts (for local development only):
--   Admin:    admin@bazarbondhu.test / Admin@12345
--   Customer: customer@bazarbondhu.test / Customer@12345
-- Passwords below are bcrypt hashes, never plaintext.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE reviews;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE wishlists;
TRUNCATE TABLE cart_items;
TRUNCATE TABLE carts;
TRUNCATE TABLE product_images;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE addresses;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO users (id, name, email, phone, password_hash, role) VALUES
(1, 'BazarBondhu Admin', 'admin@bazarbondhu.test', '+8801700000001', '$2b$12$0KSYt466VnwRZ74ugso/uuAxy/zmPlvMtNPrc6Pe7oArEuEkPXOaC', 'admin'),
(2, 'Ayesha Rahman', 'customer@bazarbondhu.test', '+8801700000002', '$2b$12$W2NBlYTsLSa8wYZU2Wae9e6hEgc82wAseJYUO.XQNJN7lkVvfRVC.', 'customer'),
(3, 'Farhana Islam', 'farhana@example.test', '+8801700000003', '$2b$12$W2NBlYTsLSa8wYZU2Wae9e6hEgc82wAseJYUO.XQNJN7lkVvfRVC.', 'customer'),
(4, 'Tanvir Hasan', 'tanvir@example.test', '+8801700000004', '$2b$12$W2NBlYTsLSa8wYZU2Wae9e6hEgc82wAseJYUO.XQNJN7lkVvfRVC.', 'customer'),
(5, 'Nusrat Jahan', 'nusrat@example.test', '+8801700000005', '$2b$12$W2NBlYTsLSa8wYZU2Wae9e6hEgc82wAseJYUO.XQNJN7lkVvfRVC.', 'customer');

INSERT INTO addresses (id, user_id, label, recipient_name, phone, address_line, area, city, postal_code, is_default) VALUES
(1, 2, 'Home', 'Ayesha Rahman', '+8801700000002', 'House 14, Road 7, Dhanmondi', 'Dhanmondi', 'Dhaka', '1205', 1),
(2, 2, 'Office', 'Ayesha Rahman', '+8801700000002', 'Level 5, 32 Kemal Ataturk Avenue', 'Banani', 'Dhaka', '1213', 0),
(3, 3, 'Home', 'Farhana Islam', '+8801700000003', 'House 22, Nasirabad Housing Society', 'Nasirabad', 'Chattogram', '4203', 1),
(4, 4, 'Home', 'Tanvir Hasan', '+8801700000004', 'Flat 3B, House 9, Uttara Sector 11', 'Uttara', 'Dhaka', '1230', 1);

INSERT INTO categories (id, parent_id, name, slug, icon, image_url, sort_order) VALUES
(1, NULL, 'Mobiles & Tablets', 'mobiles-tablets', 'Smartphone', '/images/categories/mobiles.svg', 1),
(2, NULL, 'Electronics', 'electronics', 'Laptop', '/images/categories/electronics.svg', 2),
(3, NULL, 'Fashion', 'fashion', 'Shirt', '/images/categories/fashion.svg', 3),
(4, NULL, 'Home & Living', 'home-living', 'Sofa', '/images/categories/home.svg', 4),
(5, NULL, 'Appliances', 'appliances', 'WashingMachine', '/images/categories/appliances.svg', 5),
(6, NULL, 'Groceries', 'groceries', 'ShoppingBasket', '/images/categories/groceries.svg', 6),
(7, NULL, 'Beauty & Health', 'beauty-health', 'Sparkles', '/images/categories/beauty.svg', 7),
(8, NULL, 'Sports & Outdoors', 'sports-outdoors', 'Dumbbell', '/images/categories/sports.svg', 8),
(9, NULL, 'Baby & Toys', 'baby-toys', 'Baby', '/images/categories/baby.svg', 9),
(10, NULL, 'Books & Stationery', 'books-stationery', 'BookOpen', '/images/categories/books.svg', 10);

INSERT INTO products (id, category_id, name, slug, brand, short_description, description, price, discount_price, stock, is_active, is_featured, is_flash_sale, flash_sale_ends_at, sold_count, rating_avg, rating_count, created_at) VALUES
(1, 1, 'Nexora Nova 12 5G Smartphone', 'nexora-nova-12-5g', 'Nexora', '6.7-inch AMOLED, 8GB RAM, 128GB storage', 'The Nexora Nova 12 brings a bright 120Hz AMOLED display, a long-lasting 5,000mAh battery, and a versatile triple camera. Dual SIM support makes it ready for everyday life in Bangladesh.', 29990.00, 26490.00, 35, 1, 1, 1, DATE_ADD(NOW(), INTERVAL 2 DAY), 1240, 4.60, 218, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(2, 1, 'Nexora Aura 4G Phone', 'nexora-aura-4g', 'Nexora', 'Everyday 4G phone with a 5,000mAh battery', 'A dependable everyday phone with a crisp 6.5-inch display, 64GB expandable storage, and fast charging. Comes with a one-year local warranty.', 12990.00, 10990.00, 72, 1, 1, 0, NULL, 890, 4.30, 165, DATE_SUB(NOW(), INTERVAL 12 DAY)),
(3, 1, 'Orion Tab X10 Tablet', 'orion-tab-x10', 'Orion', '10.1-inch tablet for study, streaming and work', 'A slim 10.1-inch tablet with 6GB RAM, 128GB storage, and a full HD display. Includes a protective case and charger in the box.', 24990.00, 21990.00, 28, 1, 0, 0, NULL, 340, 4.40, 78, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(4, 1, 'Voltix Smart Watch S2', 'voltix-smart-watch-s2', 'Voltix', 'Fitness tracking, calls and 7-day battery', 'Track your steps, heart rate and sleep while staying connected with Bluetooth calling. Water resistant for daily wear and workouts.', 6490.00, 4990.00, 54, 1, 0, 0, NULL, 520, 4.20, 97, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(5, 2, 'AuroraTech 43-inch 4K Smart TV', 'auroratech-43-inch-4k-tv', 'AuroraTech', '4K UHD, Android TV and voice remote', 'Enjoy your favourite streaming apps in sharp 4K resolution. The slim bezel design and dual speakers make it a great centrepiece for the living room.', 42990.00, 36990.00, 18, 1, 1, 1, DATE_ADD(NOW(), INTERVAL 3 DAY), 410, 4.50, 121, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(6, 2, 'AuroraTech QuietWave Headphones', 'auroratech-quietwave-headphones', 'AuroraTech', 'Wireless over-ear headphones with ANC', 'QuietWave active noise cancellation softens the city commute while delivering warm, detailed sound. Up to 30 hours of playback.', 6990.00, 5490.00, 46, 1, 1, 0, NULL, 760, 4.40, 183, DATE_SUB(NOW(), INTERVAL 16 DAY)),
(7, 2, 'ClearView 24-inch IPS Monitor', 'clearview-24-inch-ips-monitor', 'ClearView', 'Full HD IPS display with slim bezels', 'A 75Hz IPS monitor with vivid colour and low blue light mode. Ideal for home offices, students and casual gaming.', 17990.00, 15490.00, 24, 1, 0, 0, NULL, 230, 4.30, 64, DATE_SUB(NOW(), INTERVAL 25 DAY)),
(8, 2, 'ByteBox Mechanical Keyboard', 'bytebox-mechanical-keyboard', 'ByteBox', 'Compact mechanical keyboard with RGB lighting', 'A durable 75 percent mechanical keyboard with tactile switches and USB-C connection. Fits neatly on small desks.', 3490.00, 2890.00, 90, 1, 0, 0, NULL, 640, 4.10, 89, DATE_SUB(NOW(), INTERVAL 9 DAY)),
(9, 3, 'Rongdhonu Cotton Panjabi', 'rongdhonu-cotton-panjabi', 'Rongdhonu', 'Comfortable handloom cotton panjabi', 'A breathable cotton panjabi with a classic band collar and subtle embroidery. Perfect for Eid, family events and everyday elegance.', 2490.00, 1890.00, 85, 1, 1, 0, NULL, 980, 4.70, 241, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(10, 3, 'Rongdhonu Karchupi Kurti', 'rongdhonu-karchupi-kurti', 'Rongdhonu', 'Festive kurti with delicate karchupi work', 'A flowing kurti with hand-finished karchupi detailing on the neckline. Made from soft viscose for all-day comfort.', 3290.00, 2490.00, 63, 1, 1, 0, NULL, 730, 4.50, 154, DATE_SUB(NOW(), INTERVAL 14 DAY)),
(11, 3, 'UrbanCart Canvas Sneakers', 'urbancart-canvas-sneakers', 'UrbanCart', 'Lightweight everyday sneakers', 'Classic canvas sneakers with a cushioned footbed and grippy rubber sole. Easy to pair with jeans or casual trousers.', 2990.00, 2190.00, 110, 1, 0, 0, NULL, 1420, 4.30, 312, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(12, 3, 'Sylhet Silk Saree', 'sylhet-silk-saree', 'Sylhet Weaves', 'Soft silk-blend saree with woven border', 'An elegant saree finished with a traditional woven border and matching blouse piece. Suitable for weddings and special occasions.', 4590.00, 3590.00, 40, 1, 0, 0, NULL, 380, 4.60, 91, DATE_SUB(NOW(), INTERVAL 17 DAY)),
(13, 4, 'GhorBondhu 3-Seater Fabric Sofa', 'ghorbondhu-3-seater-sofa', 'GhorBondhu', 'Cosy three-seater with hardwood frame', 'A comfortable fabric sofa with supportive foam cushions and a sturdy hardwood frame. Simple assembly required.', 27990.00, 23990.00, 12, 1, 1, 1, DATE_ADD(NOW(), INTERVAL 4 DAY), 150, 4.40, 42, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(14, 4, 'GhorBondhu Bamboo Study Desk', 'ghorbondhu-bamboo-study-desk', 'GhorBondhu', 'Minimal study desk with cable management', 'A compact bamboo desk with a built-in cable tray and two drawers. A practical fit for home offices and student rooms.', 8990.00, 7490.00, 30, 1, 0, 0, NULL, 265, 4.30, 59, DATE_SUB(NOW(), INTERVAL 21 DAY)),
(15, 4, 'GhorBondhu Cotton Bedsheet Set', 'ghorbondhu-bedsheet-set', 'GhorBondhu', 'King-size bedsheet with two pillow covers', 'Soft cotton bedsheet set with a cheerful geometric print. Colourfast and machine washable.', 1890.00, 1390.00, 120, 1, 0, 0, NULL, 1840, 4.20, 366, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(16, 4, 'GhorBondhu Cookware Set', 'ghorbondhu-cookware-set', 'GhorBondhu', 'Five-piece non-stick cookware set', 'A practical five-piece set with non-stick coating and cool-touch handles. Suitable for daily Bangladeshi cooking.', 4990.00, 3990.00, 58, 1, 0, 0, NULL, 620, 4.10, 118, DATE_SUB(NOW(), INTERVAL 11 DAY)),
(17, 5, 'GhorBondhu 1.5-Ton Inverter AC', 'ghorbondhu-1-5-ton-inverter-ac', 'GhorBondhu', 'Energy-efficient inverter air conditioner', 'Stay cool with a five-star inverter compressor, turbo cooling and sleep mode. Professional installation is included within Dhaka city.', 62990.00, 55990.00, 10, 1, 1, 1, DATE_ADD(NOW(), INTERVAL 1 DAY), 210, 4.50, 68, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(18, 5, 'GhorBondhu 7.5kg Washing Machine', 'ghorbondhu-washing-machine-7-5kg', 'GhorBondhu', 'Front-load washer with 12 wash programs', 'A quiet front-load washing machine with quick wash, delicate and hygiene programs. Includes a two-year motor warranty.', 48990.00, 42990.00, 15, 1, 0, 0, NULL, 180, 4.40, 51, DATE_SUB(NOW(), INTERVAL 28 DAY)),
(19, 5, 'GhorBondhu 265L Refrigerator', 'ghorbondhu-refrigerator-265l', 'GhorBondhu', 'Frost-free refrigerator with inverter compressor', 'A spacious frost-free refrigerator with adjustable shelves and a dedicated vegetable crisper. Low-energy inverter compressor included.', 55990.00, 49990.00, 14, 1, 0, 0, NULL, 230, 4.30, 63, DATE_SUB(NOW(), INTERVAL 19 DAY)),
(20, 5, 'GhorBondhu 1.8L Rice Cooker', 'ghorbondhu-rice-cooker', 'GhorBondhu', 'Family-size rice cooker with steamer tray', 'Cook perfect rice for the whole family with keep-warm mode and a handy steamer tray. Non-stick inner pot for easy cleaning.', 3990.00, 3190.00, 76, 1, 0, 0, NULL, 920, 4.20, 147, DATE_SUB(NOW(), INTERVAL 13 DAY)),
(21, 6, 'Meghna Fresh Miniket Rice 5kg', 'meghna-fresh-miniket-rice', 'Meghna Fresh', 'Clean, aromatic miniket rice', 'Carefully sorted miniket rice with a light aroma and fluffy texture. Packed in a resealable five-kilogram bag.', 690.00, 620.00, 300, 1, 1, 0, NULL, 2520, 4.60, 540, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(22, 6, 'Meghna Fresh Mustard Oil 1L', 'meghna-fresh-mustard-oil', 'Meghna Fresh', 'Pure cold-pressed mustard oil', 'Aromatic mustard oil pressed from selected seeds. A familiar flavour for fish, vegetables and pickles.', 320.00, 285.00, 180, 1, 0, 0, NULL, 1720, 4.50, 389, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(23, 6, 'Chattogram Tea Estate Premium Tea', 'chattogram-premium-tea', 'Chattogram Tea', 'Strong, malty tea blend', 'A robust black tea blend from the hills of Chattogram. Brews a rich cup that pairs perfectly with milk.', 480.00, 410.00, 150, 1, 0, 0, NULL, 1340, 4.40, 282, DATE_SUB(NOW(), INTERVAL 22 DAY)),
(24, 6, 'Sundarban Natural Honey 500g', 'sundarban-natural-honey', 'Sundarban Naturals', 'Raw wildflower honey', 'Unprocessed wildflower honey collected from the Sundarban region. Naturally sweet with floral notes.', 850.00, 740.00, 95, 1, 1, 0, NULL, 680, 4.70, 156, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(25, 7, 'Lotus Beauty Vitamin C Serum', 'lotus-beauty-vitamin-c-serum', 'Lotus Beauty', 'Brightening serum with 10% vitamin C', 'A lightweight daily serum formulated with vitamin C and hyaluronic acid to support a brighter, hydrated complexion.', 1190.00, 890.00, 84, 1, 1, 1, DATE_ADD(NOW(), INTERVAL 2 DAY), 1120, 4.50, 274, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(26, 7, 'Lotus Beauty Herbal Face Wash', 'lotus-beauty-herbal-face-wash', 'Lotus Beauty', 'Gentle neem and aloe face wash', 'A gentle daily cleanser with neem and aloe vera. Removes excess oil without leaving skin feeling dry.', 390.00, 320.00, 210, 1, 0, 0, NULL, 2260, 4.30, 472, DATE_SUB(NOW(), INTERVAL 9 DAY)),
(27, 7, 'Rongdhonu Matte Lipstick Set', 'rongdhonu-matte-lipstick-set', 'Rongdhonu', 'Set of four long-wear matte shades', 'Four flattering matte shades with rich pigment and a comfortable finish. A compact set for everyday looks.', 1490.00, 1190.00, 112, 1, 1, 0, NULL, 920, 4.40, 208, DATE_SUB(NOW(), INTERVAL 18 DAY)),
(28, 7, 'LumiGlow Sunscreen SPF 50', 'lumiglow-sunscreen-spf-50', 'LumiGlow', 'Lightweight broad-spectrum sunscreen', 'A non-greasy sunscreen with SPF 50 PA+++ protection. Blends quickly and works well under makeup.', 950.00, 790.00, 130, 1, 0, 0, NULL, 780, 4.50, 167, DATE_SUB(NOW(), INTERVAL 12 DAY)),
(29, 8, 'KhelaGhor Yoga Mat', 'khelaghor-yoga-mat', 'KhelaGhor', 'Non-slip exercise mat with carry strap', 'A cushioned, non-slip yoga mat suitable for stretching, pilates and home workouts. Includes a carry strap.', 1290.00, 990.00, 100, 1, 0, 0, NULL, 530, 4.20, 104, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(30, 8, 'KhelaGhor Adjustable Dumbbell Set', 'khelaghor-adjustable-dumbbell-set', 'KhelaGhor', '20kg adjustable dumbbell set', 'Train at home with a space-saving adjustable dumbbell set. Includes plates, collars and a storage case.', 4990.00, 4290.00, 42, 1, 1, 0, NULL, 310, 4.40, 72, DATE_SUB(NOW(), INTERVAL 24 DAY)),
(31, 8, 'KhelaGhor Match Football', 'khelaghor-match-football', 'KhelaGhor', 'Size 5 football for match play', 'A durable stitched football with a responsive touch. Suitable for training and friendly matches on grass or turf.', 1890.00, 1490.00, 80, 1, 0, 0, NULL, 470, 4.30, 93, DATE_SUB(NOW(), INTERVAL 16 DAY)),
(32, 8, 'KhelaGhor Cycling Helmet', 'khelaghor-cycling-helmet', 'KhelaGhor', 'Ventilated helmet with adjustable fit', 'A lightweight cycling helmet with multiple vents, a dial fit system and reflective rear detail.', 2490.00, 1990.00, 65, 1, 0, 0, NULL, 280, 4.10, 54, DATE_SUB(NOW(), INTERVAL 27 DAY)),
(33, 9, 'TinyToes Soft Plush Bear', 'tinytoes-soft-plush-bear', 'TinyToes', 'Huggable plush toy for little ones', 'A super-soft plush bear with embroidered eyes and a gentle expression. Machine washable and suitable from birth.', 990.00, 790.00, 140, 1, 1, 0, NULL, 610, 4.60, 128, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(34, 9, 'TinyToes Baby Diapers 50 Pack', 'tinytoes-baby-diapers-50', 'TinyToes', 'Soft, absorbent diapers with wetness indicator', 'Gentle diapers with a breathable back sheet and wetness indicator. Available in medium size.', 1290.00, 1090.00, 230, 1, 0, 0, NULL, 1980, 4.40, 315, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(35, 9, 'TinyToes Wooden Building Blocks', 'tinytoes-wooden-blocks', 'TinyToes', '50-piece colourful wooden block set', 'Smooth wooden blocks in bright colours and varied shapes. Encourages creative play and fine motor skills.', 1890.00, 1490.00, 74, 1, 0, 0, NULL, 350, 4.50, 71, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(36, 9, 'TinyToes Baby Stroller', 'tinytoes-baby-stroller', 'TinyToes', 'Foldable stroller with reclining seat', 'A lightweight, foldable stroller with a reclining seat, storage basket and sun canopy. Easy to take on family outings.', 12990.00, 10990.00, 22, 1, 0, 0, NULL, 160, 4.30, 38, DATE_SUB(NOW(), INTERVAL 23 DAY)),
(37, 10, 'Pathshala SSC Mathematics Guide', 'pathshala-ssc-mathematics-guide', 'Pathshala', 'Exam-focused mathematics practice guide', 'A structured guide with chapter summaries, solved examples and practice questions for SSC students.', 450.00, 380.00, 160, 1, 1, 0, NULL, 780, 4.50, 132, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(38, 10, 'Pathshala Bangla Literature Collection', 'pathshala-bangla-literature', 'Pathshala', 'Selected classic Bangla stories and poems', 'A curated collection of classic Bangla literature for students and general readers. Printed on quality paper.', 1250.00, 990.00, 90, 1, 0, 0, NULL, 410, 4.70, 86, DATE_SUB(NOW(), INTERVAL 30 DAY)),
(39, 10, 'Pathshala Kids Learning Flashcards', 'pathshala-learning-flashcards', 'Pathshala', 'Alphabet and number flashcards for kids', 'Colourful double-sided flashcards covering letters, numbers and first words. A fun learning aid for ages three and up.', 590.00, 450.00, 175, 1, 0, 0, NULL, 590, 4.40, 79, DATE_SUB(NOW(), INTERVAL 13 DAY)),
(40, 10, 'Pathshala Premium Notebook Set', 'pathshala-premium-notebooks', 'Pathshala', 'Set of five ruled notebooks', 'Five sturdy ruled notebooks with smooth paper and secure binding. A practical set for school, college or office.', 690.00, 550.00, 220, 1, 0, 0, NULL, 860, 4.30, 113, DATE_SUB(NOW(), INTERVAL 8 DAY));

INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(1, '/images/products/mobiles.svg', 'Nexora Nova 12 smartphone', 1, 0),
(1, '/images/products/mobiles-alt.svg', 'Nexora Nova 12 camera detail', 0, 1),
(2, '/images/products/mobiles.svg', 'Nexora Aura 4G phone', 1, 0),
(2, '/images/products/mobiles-alt.svg', 'Nexora Aura 4G display', 0, 1),
(3, '/images/products/mobiles.svg', 'Orion Tab X10 tablet', 1, 0),
(3, '/images/products/mobiles-alt.svg', 'Orion Tab X10 side view', 0, 1),
(4, '/images/products/mobiles-alt.svg', 'Voltix smart watch', 1, 0),
(4, '/images/products/mobiles.svg', 'Voltix smart watch accessories', 0, 1),
(5, '/images/products/electronics.svg', 'AuroraTech 43-inch smart television', 1, 0),
(5, '/images/products/electronics-alt.svg', 'AuroraTech television stand', 0, 1),
(6, '/images/products/electronics-alt.svg', 'AuroraTech QuietWave headphones', 1, 0),
(6, '/images/products/electronics.svg', 'AuroraTech headphones side view', 0, 1),
(7, '/images/products/electronics.svg', 'ClearView IPS monitor', 1, 0),
(7, '/images/products/electronics-alt.svg', 'ClearView monitor stand', 0, 1),
(8, '/images/products/electronics-alt.svg', 'ByteBox mechanical keyboard', 1, 0),
(8, '/images/products/electronics.svg', 'ByteBox keyboard keys', 0, 1),
(9, '/images/products/fashion.svg', 'Rongdhonu cotton panjabi', 1, 0),
(9, '/images/products/fashion-alt.svg', 'Rongdhonu panjabi fabric detail', 0, 1),
(10, '/images/products/fashion-alt.svg', 'Rongdhonu karchupi kurti', 1, 0),
(10, '/images/products/fashion.svg', 'Rongdhonu kurti detail', 0, 1),
(11, '/images/products/fashion.svg', 'UrbanCart canvas sneakers', 1, 0),
(11, '/images/products/fashion-alt.svg', 'UrbanCart sneaker sole', 0, 1),
(12, '/images/products/fashion-alt.svg', 'Sylhet silk saree', 1, 0),
(12, '/images/products/fashion.svg', 'Sylhet silk saree border', 0, 1),
(13, '/images/products/home.svg', 'GhorBondhu fabric sofa', 1, 0),
(13, '/images/products/home-alt.svg', 'GhorBondhu sofa detail', 0, 1),
(14, '/images/products/home-alt.svg', 'GhorBondhu bamboo study desk', 1, 0),
(14, '/images/products/home.svg', 'GhorBondhu desk drawers', 0, 1),
(15, '/images/products/home.svg', 'GhorBondhu cotton bedsheet', 1, 0),
(15, '/images/products/home-alt.svg', 'GhorBondhu bedsheet pattern', 0, 1),
(16, '/images/products/home-alt.svg', 'GhorBondhu cookware set', 1, 0),
(16, '/images/products/home.svg', 'GhorBondhu cookware pieces', 0, 1),
(17, '/images/products/appliances.svg', 'GhorBondhu inverter air conditioner', 1, 0),
(17, '/images/products/appliances-alt.svg', 'GhorBondhu air conditioner remote', 0, 1),
(18, '/images/products/appliances-alt.svg', 'GhorBondhu front load washing machine', 1, 0),
(18, '/images/products/appliances.svg', 'GhorBondhu washing machine controls', 0, 1),
(19, '/images/products/appliances.svg', 'GhorBondhu refrigerator', 1, 0),
(19, '/images/products/appliances-alt.svg', 'GhorBondhu refrigerator shelves', 0, 1),
(20, '/images/products/appliances-alt.svg', 'GhorBondhu rice cooker', 1, 0),
(20, '/images/products/appliances.svg', 'GhorBondhu rice cooker inner pot', 0, 1),
(21, '/images/products/groceries.svg', 'Meghna Fresh miniket rice', 1, 0),
(21, '/images/products/groceries-alt.svg', 'Meghna Fresh rice grains', 0, 1),
(22, '/images/products/groceries-alt.svg', 'Meghna Fresh mustard oil', 1, 0),
(22, '/images/products/groceries.svg', 'Meghna Fresh oil bottle', 0, 1),
(23, '/images/products/groceries.svg', 'Chattogram premium tea', 1, 0),
(23, '/images/products/groceries-alt.svg', 'Chattogram tea leaves', 0, 1),
(24, '/images/products/groceries-alt.svg', 'Sundarban natural honey', 1, 0),
(24, '/images/products/groceries.svg', 'Sundarban honey jar', 0, 1),
(25, '/images/products/beauty.svg', 'Lotus Beauty vitamin C serum', 1, 0),
(25, '/images/products/beauty-alt.svg', 'Lotus Beauty serum bottle', 0, 1),
(26, '/images/products/beauty-alt.svg', 'Lotus Beauty herbal face wash', 1, 0),
(26, '/images/products/beauty.svg', 'Lotus Beauty face wash texture', 0, 1),
(27, '/images/products/beauty.svg', 'Rongdhonu matte lipstick set', 1, 0),
(27, '/images/products/beauty-alt.svg', 'Rongdhonu lipstick shades', 0, 1),
(28, '/images/products/beauty-alt.svg', 'LumiGlow sunscreen', 1, 0),
(28, '/images/products/beauty.svg', 'LumiGlow sunscreen tube', 0, 1),
(29, '/images/products/sports.svg', 'KhelaGhor yoga mat', 1, 0),
(29, '/images/products/sports-alt.svg', 'KhelaGhor yoga mat rolled', 0, 1),
(30, '/images/products/sports-alt.svg', 'KhelaGhor adjustable dumbbells', 1, 0),
(30, '/images/products/sports.svg', 'KhelaGhor weight plates', 0, 1),
(31, '/images/products/sports.svg', 'KhelaGhor match football', 1, 0),
(31, '/images/products/sports-alt.svg', 'KhelaGhor football closeup', 0, 1),
(32, '/images/products/sports-alt.svg', 'KhelaGhor cycling helmet', 1, 0),
(32, '/images/products/sports.svg', 'KhelaGhor helmet vents', 0, 1),
(33, '/images/products/baby.svg', 'TinyToes soft plush bear', 1, 0),
(33, '/images/products/baby-alt.svg', 'TinyToes plush bear closeup', 0, 1),
(34, '/images/products/baby-alt.svg', 'TinyToes baby diapers', 1, 0),
(34, '/images/products/baby.svg', 'TinyToes diaper pack', 0, 1),
(35, '/images/products/baby.svg', 'TinyToes wooden building blocks', 1, 0),
(35, '/images/products/baby-alt.svg', 'TinyToes block shapes', 0, 1),
(36, '/images/products/baby-alt.svg', 'TinyToes baby stroller', 1, 0),
(36, '/images/products/baby.svg', 'TinyToes stroller seat', 0, 1),
(37, '/images/products/books.svg', 'Pathshala SSC mathematics guide', 1, 0),
(37, '/images/products/books-alt.svg', 'Pathshala mathematics pages', 0, 1),
(38, '/images/products/books-alt.svg', 'Pathshala Bangla literature collection', 1, 0),
(38, '/images/products/books.svg', 'Pathshala literature cover', 0, 1),
(39, '/images/products/books.svg', 'Pathshala learning flashcards', 1, 0),
(39, '/images/products/books-alt.svg', 'Pathshala flashcards spread', 0, 1),
(40, '/images/products/books-alt.svg', 'Pathshala premium notebooks', 1, 0),
(40, '/images/products/books.svg', 'Pathshala notebook pages', 0, 1);

INSERT INTO reviews (product_id, user_id, rating, comment, created_at) VALUES
(1, 2, 5, 'Display is excellent and delivery was quick. Battery easily lasts a full day.', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, 3, 4, 'Good value for the price. The camera performs well in daylight.', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(5, 2, 5, 'Setup was easy and the picture quality is great for movies.', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(6, 4, 4, 'Noise cancellation works surprisingly well on the bus.', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(9, 3, 5, 'Fabric is comfortable and the size was accurate. Will order another colour.', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(9, 5, 4, 'Beautiful panjabi, though delivery took one extra day.', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(11, 2, 4, 'Comfortable for daily walks. Good grip on wet pavement.', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(17, 4, 5, 'Cooling is strong and the installation team was professional.', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(21, 5, 5, 'Rice quality is clean and cooks nicely. Good packaging.', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(22, 3, 4, 'Authentic mustard smell and a good bottle size.', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(25, 2, 4, 'Lightweight serum, no irritation. Skin looks a little brighter.', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(29, 5, 5, 'Mat is thick enough for home workouts and does not slip.', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(33, 3, 5, 'My daughter loves it. Very soft and well stitched.', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(37, 5, 4, 'Helpful practice questions with clear explanations.', DATE_SUB(NOW(), INTERVAL 14 DAY));

INSERT INTO wishlists (user_id, product_id) VALUES
(2, 5),
(2, 17),
(2, 25),
(3, 13),
(4, 30),
(5, 9);

INSERT INTO orders (id, order_number, user_id, status, payment_method, payment_status, subtotal, shipping_fee, total, recipient_name, phone, shipping_address, area, city, postal_code, notes, created_at) VALUES
(1, 'BB-20261001-1001', 2, 'delivered', 'cod', 'paid', 27730.00, 0.00, 27730.00, 'Ayesha Rahman', '+8801700000002', 'House 14, Road 7, Dhanmondi', 'Dhanmondi', 'Dhaka', '1205', 'Please call before delivery.', DATE_SUB(NOW(), INTERVAL 16 DAY)),
(2, 'BB-20261015-1002', 3, 'processing', 'cod', 'unpaid', 3780.00, 60.00, 3840.00, 'Farhana Islam', '+8801700000003', 'House 22, Nasirabad Housing Society', 'Nasirabad', 'Chattogram', '4203', NULL, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(3, 'BB-20261020-1003', 4, 'pending', 'cod', 'unpaid', 1210.00, 60.00, 1270.00, 'Tanvir Hasan', '+8801700000004', 'Flat 3B, House 9, Uttara Sector 11', 'Uttara', 'Dhaka', '1230', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY));

INSERT INTO order_items (order_id, product_id, product_name, product_image, unit_price, quantity, line_total) VALUES
(1, 1, 'Nexora Nova 12 5G Smartphone', '/images/products/mobiles.svg', 26490.00, 1, 26490.00),
(1, 21, 'Meghna Fresh Miniket Rice 5kg', '/images/products/groceries.svg', 620.00, 2, 1240.00),
(2, 9, 'Rongdhonu Cotton Panjabi', '/images/products/fashion.svg', 1890.00, 2, 3780.00),
(3, 25, 'Lotus Beauty Vitamin C Serum', '/images/products/beauty.svg', 890.00, 1, 890.00),
(3, 26, 'Lotus Beauty Herbal Face Wash', '/images/products/beauty-alt.svg', 320.00, 1, 320.00);
