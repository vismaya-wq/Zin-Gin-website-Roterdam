-- seed menu from src/data/menu.ts
INSERT INTO menu_categories (name, slug, sort_order, visible) VALUES ('Breakfast', 'breakfast', 0, true) ON CONFLICT (slug) DO NOTHING;
INSERT INTO menu_categories (name, slug, sort_order, visible) VALUES ('Street Food', 'street-food', 1, true) ON CONFLICT (slug) DO NOTHING;
INSERT INTO menu_categories (name, slug, sort_order, visible) VALUES ('Starters', 'starters', 2, true) ON CONFLICT (slug) DO NOTHING;
INSERT INTO menu_categories (name, slug, sort_order, visible) VALUES ('South Indian', 'south-indian', 3, true) ON CONFLICT (slug) DO NOTHING;
INSERT INTO menu_categories (name, slug, sort_order, visible) VALUES ('Indo-Chinese', 'indo-chinese', 4, true) ON CONFLICT (slug) DO NOTHING;
INSERT INTO menu_categories (name, slug, sort_order, visible) VALUES ('Curries', 'curries', 5, true) ON CONFLICT (slug) DO NOTHING;
INSERT INTO menu_categories (name, slug, sort_order, visible) VALUES ('Rice & Biryani', 'rice-biryani', 6, true) ON CONFLICT (slug) DO NOTHING;
INSERT INTO menu_categories (name, slug, sort_order, visible) VALUES ('Breads', 'breads', 7, true) ON CONFLICT (slug) DO NOTHING;
INSERT INTO menu_categories (name, slug, sort_order, visible) VALUES ('Desserts', 'desserts', 8, true) ON CONFLICT (slug) DO NOTHING;
INSERT INTO menu_categories (name, slug, sort_order, visible) VALUES ('Drinks', 'drinks', 9, true) ON CONFLICT (slug) DO NOTHING;
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Poha', 'Flattened rice with onion, peanuts, curry leaf and a squeeze of lemon.', 8.5, false, true, true, false, false, true, 0, NULL
FROM menu_categories WHERE slug = 'breakfast';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Pav Bhaji', 'Buttery spiced vegetable mash with toasted soft buns.', 10.9, true, false, false, false, false, true, 1, '/gallery/12.jpg'
FROM menu_categories WHERE slug = 'breakfast';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Aloo Paratha', 'Whole-wheat flatbread stuffed with spiced potato, served with curd and pickle.', 9.5, true, false, false, false, false, true, 2, NULL
FROM menu_categories WHERE slug = 'breakfast';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Chai & Bun Maska', 'Masala chai with a soft, generously buttered bun.', 6.5, true, false, false, false, false, true, 3, NULL
FROM menu_categories WHERE slug = 'breakfast';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Pani Puri', 'Crisp hollow puris, spiced mint water, potato and chickpea.', 8.9, false, true, false, false, false, true, 4, '/gallery/35.jpg'
FROM menu_categories WHERE slug = 'street-food';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Papdi Chaat', 'Crackers, cool yoghurt, tamarind and mint chutney, pomegranate.', 9.5, true, false, false, false, false, true, 5, '/gallery/16.jpg'
FROM menu_categories WHERE slug = 'street-food';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Samosa Chaat', 'Crushed samosa over chole, yoghurt and sweet-sour chutneys.', 10.5, true, false, false, false, false, true, 6, '/gallery/50.jpg'
FROM menu_categories WHERE slug = 'street-food';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Vada Pav', 'Mumbai’s spiced potato fritter in a soft bun with garlic chutney.', 8.5, false, true, false, false, false, true, 7, '/gallery/53.jpg'
FROM menu_categories WHERE slug = 'street-food';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Paneer Tikka', 'Marinated paneer grilled with peppers, onion and spices.', 14.5, true, false, true, false, false, true, 8, '/gallery/17.jpg'
FROM menu_categories WHERE slug = 'starters';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Vegetable Samosa', 'Two crisp pastries of spiced potato and peas, tamarind chutney.', 7.5, false, true, false, false, false, true, 9, '/gallery/38.jpg'
FROM menu_categories WHERE slug = 'starters';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Onion Bhaji', 'Crisp onion and gram-flour fritters with mint chutney.', 7.9, false, true, true, false, false, true, 10, NULL
FROM menu_categories WHERE slug = 'starters';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Chilli Paneer', 'Wok-tossed paneer, peppers and spring onion, Indo-Chinese style.', 13.5, true, false, false, false, true, true, 11, '/gallery/17.jpg'
FROM menu_categories WHERE slug = 'indo-chinese';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Masala Dosa', 'A crisp dosa filled with spiced potato, served with chutneys and sambar.', 12.5, true, false, true, false, false, true, 12, '/gallery/08.jpg'
FROM menu_categories WHERE slug = 'south-indian';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Mysore Masala Dosa', 'Dosa brushed with a fiery red chutney and filled with potato masala.', 13.5, true, false, true, false, true, true, 13, NULL
FROM menu_categories WHERE slug = 'south-indian';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Idli Sambar', 'Steamed rice cakes with sambar and fresh coconut chutney.', 9.5, false, true, true, false, false, true, 14, '/gallery/26.jpg'
FROM menu_categories WHERE slug = 'south-indian';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Medu Vada', 'Crisp lentil doughnuts, sambar and chutney on the side.', 9.5, false, true, true, false, false, true, 15, '/gallery/52.jpg'
FROM menu_categories WHERE slug = 'south-indian';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Paneer Butter Masala', 'Paneer cooked in a rich, creamy tomato sauce.', 14.9, true, false, false, false, false, true, 16, '/gallery/32.jpg'
FROM menu_categories WHERE slug = 'curries';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Dal Tadka', 'Slow-cooked lentils finished with garlic and spices.', 12.5, false, true, false, false, false, true, 17, NULL
FROM menu_categories WHERE slug = 'curries';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Chana Masala', 'Chickpeas simmered with tomato and warming Indian spices.', 12.9, false, true, false, false, false, true, 18, NULL
FROM menu_categories WHERE slug = 'curries';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Palak Paneer', 'Soft paneer in a silky, gently spiced spinach sauce.', 14.5, true, false, true, false, false, true, 19, NULL
FROM menu_categories WHERE slug = 'curries';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Malai Kofta', 'Paneer and potato dumplings in a creamy cashew sauce.', 15.5, true, false, false, true, false, true, 20, NULL
FROM menu_categories WHERE slug = 'curries';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Vegetable Biryani', 'Fragrant basmati rice layered with vegetables and aromatic spices.', 15.9, true, false, true, false, false, true, 21, '/gallery/57.jpg'
FROM menu_categories WHERE slug = 'rice-biryani';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Paneer Biryani', 'Dum-cooked basmati with saffron, mint and charred paneer.', 16.9, true, false, true, false, false, true, 22, NULL
FROM menu_categories WHERE slug = 'rice-biryani';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Jeera Rice', 'Basmati tempered with toasted cumin.', 4.5, false, true, true, false, false, true, 23, NULL
FROM menu_categories WHERE slug = 'rice-biryani';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Butter Naan', 'Soft, blistered and brushed with butter.', 3.5, true, false, false, false, false, true, 24, NULL
FROM menu_categories WHERE slug = 'breads';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Garlic Naan', 'Garlic, coriander and a little too much butter.', 3.9, true, false, false, false, false, true, 25, NULL
FROM menu_categories WHERE slug = 'breads';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Tawa Roti', 'Whole-wheat flatbread from the tawa.', 3, false, true, false, false, false, true, 26, NULL
FROM menu_categories WHERE slug = 'breads';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Lachha Paratha', 'Flaky, layered and crisp at the edges.', 4.5, true, false, false, false, false, true, 27, NULL
FROM menu_categories WHERE slug = 'breads';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Gulab Jamun', 'Warm milk dumplings in cardamom and rose syrup.', 6.5, true, false, false, false, false, true, 28, '/gallery/25.jpg'
FROM menu_categories WHERE slug = 'desserts';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Rasmalai', 'Soft cheese dumplings in chilled saffron milk, pistachio.', 7.5, true, false, true, false, false, true, 29, NULL
FROM menu_categories WHERE slug = 'desserts';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Mango Kulfi', 'Dense, slow-set Indian ice cream with Alphonso mango.', 6.9, true, false, true, false, false, true, 30, NULL
FROM menu_categories WHERE slug = 'desserts';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Mango Lassi', 'Chilled yoghurt, mango and a pinch of cardamom.', 5.5, true, false, true, false, false, true, 31, NULL
FROM menu_categories WHERE slug = 'drinks';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Masala Chai', 'Black tea brewed with milk, ginger and whole spice.', 3.9, true, false, true, false, false, true, 32, NULL
FROM menu_categories WHERE slug = 'drinks';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Bombay Botanist G&T', 'Dry gin, tonic, green cardamom and orange peel.', 11.5, false, true, true, false, false, true, 33, '/gallery/62.jpg'
FROM menu_categories WHERE slug = 'drinks';
INSERT INTO menu_items (category_id, name, description, price, is_veg, is_vegan, has_gluten, has_nuts, is_spicy, visible, sort_order, image_url)
SELECT id, 'Jaljeera Cooler', 'Cumin, mint and lime over crushed ice. Alcohol-free.', 6.5, false, true, true, false, false, true, 34, '/gallery/27.jpg'
FROM menu_categories WHERE slug = 'drinks';
