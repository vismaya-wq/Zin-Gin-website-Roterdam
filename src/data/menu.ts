import { IMAGES } from './images';

/**
 * Temporary menu content. The shape mirrors a flat spreadsheet row
 * (category, name, description, price, tags, image) so the client's Excel
 * export or a POS API can replace `MENU` without touching the components.
 */
export type DietaryTag = 'VEG' | 'VEGAN' | 'GF';

export interface MenuItem {
  id: string;
  category: CategoryId;
  name: string;
  description: string;
  price: number;
  tags: DietaryTag[];
  /** Photo id, rendered through `photo()` in ./images */
  image?: string;
  popular?: boolean;
}

export type CategoryId =
  | 'breakfast'
  | 'street-food'
  | 'starters'
  | 'south-indian'
  | 'curries'
  | 'rice-biryani'
  | 'breads'
  | 'desserts'
  | 'drinks';

export interface Category {
  id: CategoryId | 'popular';
  label: string;
  intro?: string;
}

export const CATEGORIES: Category[] = [
  { id: 'popular', label: 'Popular' },
  { id: 'breakfast', label: 'Breakfast', intro: 'Slow mornings, Indian style.' },
  { id: 'street-food', label: 'Street Food', intro: 'Tangy, crunchy, loud with flavour.' },
  { id: 'starters', label: 'Starters', intro: 'Something to share while you decide.' },
  { id: 'south-indian', label: 'South Indian', intro: 'Crisp, light and made for dipping.' },
  { id: 'curries', label: 'Curries', intro: 'Rich, slow and deeply comforting.' },
  { id: 'rice-biryani', label: 'Rice & Biryani', intro: 'Fragrant basmati, layered spice.' },
  { id: 'breads', label: 'Breads', intro: 'Fresh from the tandoor.' },
  { id: 'desserts', label: 'Desserts', intro: 'A sweet ending.' },
  { id: 'drinks', label: 'Drinks', intro: 'Lassi, chai and the Gin in Zin & Gin.' },
];

export const MENU: MenuItem[] = [
  // Breakfast
  { id: 'poha', category: 'breakfast', name: 'Poha', description: 'Flattened rice with onion, peanuts, curry leaf and a squeeze of lemon.', price: 8.5, tags: ['VEGAN', 'GF'] },
  { id: 'pav-bhaji', category: 'breakfast', name: 'Pav Bhaji', description: 'Buttery spiced vegetable mash with toasted soft buns.', price: 10.9, tags: ['VEG'], image: IMAGES.pavBhaji },
  { id: 'aloo-paratha', category: 'breakfast', name: 'Aloo Paratha', description: 'Whole-wheat flatbread stuffed with spiced potato, served with curd and pickle.', price: 9.5, tags: ['VEG'] },
  { id: 'chai-bun-maska', category: 'breakfast', name: 'Chai & Bun Maska', description: 'Masala chai with a soft, generously buttered bun.', price: 6.5, tags: ['VEG'] },

  // Street food
  { id: 'pani-puri', category: 'street-food', name: 'Pani Puri', description: 'Crisp hollow puris, spiced mint water, potato and chickpea.', price: 8.9, tags: ['VEGAN'], image: IMAGES.paniPuri },
  { id: 'papdi-chaat', category: 'street-food', name: 'Papdi Chaat', description: 'Crackers, cool yoghurt, tamarind and mint chutney, pomegranate.', price: 9.5, tags: ['VEG'], image: IMAGES.chaat },
  { id: 'samosa-chaat', category: 'street-food', name: 'Samosa Chaat', description: 'Crushed samosa over chole, yoghurt and sweet-sour chutneys.', price: 10.5, tags: ['VEG'] },
  { id: 'vada-pav', category: 'street-food', name: 'Vada Pav', description: 'Mumbai\u2019s spiced potato fritter in a soft bun with garlic chutney.', price: 8.5, tags: ['VEGAN'] },

  // Starters
  { id: 'paneer-tikka', category: 'starters', name: 'Paneer Tikka', description: 'Marinated paneer grilled with peppers, onion and spices.', price: 14.5, tags: ['VEG', 'GF'], image: IMAGES.paneerTikka, popular: true },
  { id: 'veg-samosa', category: 'starters', name: 'Vegetable Samosa', description: 'Two crisp pastries of spiced potato and peas, tamarind chutney.', price: 7.5, tags: ['VEGAN'], image: IMAGES.samosa },
  { id: 'onion-bhaji', category: 'starters', name: 'Onion Bhaji', description: 'Crisp onion and gram-flour fritters with mint chutney.', price: 7.9, tags: ['VEGAN', 'GF'] },
  { id: 'chilli-paneer', category: 'starters', name: 'Chilli Paneer', description: 'Wok-tossed paneer, peppers and spring onion, Indo-Chinese style.', price: 13.5, tags: ['VEG'] },

  // South Indian
  { id: 'masala-dosa', category: 'south-indian', name: 'Masala Dosa', description: 'A crisp dosa filled with spiced potato, served with chutneys and sambar.', price: 12.5, tags: ['VEG', 'GF'], image: IMAGES.masalaDosa, popular: true },
  { id: 'mysore-dosa', category: 'south-indian', name: 'Mysore Masala Dosa', description: 'Dosa brushed with a fiery red chutney and filled with potato masala.', price: 13.5, tags: ['VEG', 'GF'] },
  { id: 'idli-sambar', category: 'south-indian', name: 'Idli Sambar', description: 'Steamed rice cakes with sambar and fresh coconut chutney.', price: 9.5, tags: ['VEGAN', 'GF'], image: IMAGES.idliVada },
  { id: 'medu-vada', category: 'south-indian', name: 'Medu Vada', description: 'Crisp lentil doughnuts, sambar and chutney on the side.', price: 9.5, tags: ['VEGAN', 'GF'] },

  // Curries
  { id: 'paneer-butter-masala', category: 'curries', name: 'Paneer Butter Masala', description: 'Paneer cooked in a rich, creamy tomato sauce.', price: 14.9, tags: ['VEG'] },
  { id: 'dal-tadka', category: 'curries', name: 'Dal Tadka', description: 'Slow-cooked lentils finished with garlic and spices.', price: 12.5, tags: ['VEGAN'] },
  { id: 'chana-masala', category: 'curries', name: 'Chana Masala', description: 'Chickpeas simmered with tomato and warming Indian spices.', price: 12.9, tags: ['VEGAN'] },
  { id: 'palak-paneer', category: 'curries', name: 'Palak Paneer', description: 'Soft paneer in a silky, gently spiced spinach sauce.', price: 14.5, tags: ['VEG', 'GF'] },
  { id: 'malai-kofta', category: 'curries', name: 'Malai Kofta', description: 'Paneer and potato dumplings in a creamy cashew sauce.', price: 15.5, tags: ['VEG'] },

  // Rice & biryani
  { id: 'veg-biryani', category: 'rice-biryani', name: 'Vegetable Biryani', description: 'Fragrant basmati rice layered with vegetables and aromatic spices.', price: 15.9, tags: ['VEG', 'GF'], image: IMAGES.vegPulao, popular: true },
  { id: 'paneer-biryani', category: 'rice-biryani', name: 'Paneer Biryani', description: 'Dum-cooked basmati with saffron, mint and charred paneer.', price: 16.9, tags: ['VEG', 'GF'] },
  { id: 'jeera-rice', category: 'rice-biryani', name: 'Jeera Rice', description: 'Basmati tempered with toasted cumin.', price: 4.5, tags: ['VEGAN', 'GF'] },

  // Breads
  { id: 'butter-naan', category: 'breads', name: 'Butter Naan', description: 'Soft, blistered and brushed with butter.', price: 3.5, tags: ['VEG'] },
  { id: 'garlic-naan', category: 'breads', name: 'Garlic Naan', description: 'Garlic, coriander and a little too much butter.', price: 3.9, tags: ['VEG'] },
  { id: 'tandoori-roti', category: 'breads', name: 'Tandoori Roti', description: 'Whole-wheat flatbread from the tandoor.', price: 3.0, tags: ['VEGAN'] },
  { id: 'lachha-paratha', category: 'breads', name: 'Lachha Paratha', description: 'Flaky, layered and crisp at the edges.', price: 4.5, tags: ['VEG'] },

  // Desserts
  { id: 'gulab-jamun', category: 'desserts', name: 'Gulab Jamun', description: 'Warm milk dumplings in cardamom and rose syrup.', price: 6.5, tags: ['VEG'] },
  { id: 'rasmalai', category: 'desserts', name: 'Rasmalai', description: 'Soft cheese dumplings in chilled saffron milk, pistachio.', price: 7.5, tags: ['VEG', 'GF'] },
  { id: 'mango-kulfi', category: 'desserts', name: 'Mango Kulfi', description: 'Dense, slow-set Indian ice cream with Alphonso mango.', price: 6.9, tags: ['VEG', 'GF'] },

  // Drinks
  { id: 'mango-lassi', category: 'drinks', name: 'Mango Lassi', description: 'Chilled yoghurt, mango and a pinch of cardamom.', price: 5.5, tags: ['VEG', 'GF'] },
  { id: 'masala-chai', category: 'drinks', name: 'Masala Chai', description: 'Black tea brewed with milk, ginger and whole spice.', price: 3.9, tags: ['VEG', 'GF'] },
  { id: 'signature-gt', category: 'drinks', name: 'Zin & Gin Signature G&T', description: 'Dry gin, tonic, green cardamom and orange peel.', price: 11.5, tags: ['VEGAN', 'GF'] },
  { id: 'jaljeera-cooler', category: 'drinks', name: 'Jaljeera Cooler', description: 'Cumin, mint and lime over crushed ice. Alcohol-free.', price: 6.5, tags: ['VEGAN', 'GF'] },
];

export const MOST_LOVED_IDS = ['masala-dosa', 'paneer-tikka', 'veg-biryani'] as const;

export const byId = (id: string) => MENU.find((item) => item.id === id);
export const itemsIn = (category: CategoryId) => MENU.filter((item) => item.category === category);
export const mostLoved = () => MOST_LOVED_IDS.map((id) => byId(id)!).filter(Boolean);

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value);

export const PICKUP_DISCOUNT = 0.1;
