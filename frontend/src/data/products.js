import imgTurmeric from '../assets/hero/turmeric.png';
import imgChilli from '../assets/hero/chilli.png';
import imgCoriander from '../assets/hero/coriander.png';
import imgGaramMasala from '../assets/hero/garam_masala.png';
import imgSambar from '../assets/hero/sambar.png';
import imgOilCoconut from '../assets/hero/oil_coconut.png';
import imgOilGroundnut from '../assets/hero/oil_groundnut.png';
import imgOilGingelly from '../assets/hero/oil_gingelly.png';
import imgOilSunflower from '../assets/hero/oil_sunflower.png';

export const INITIAL_PRODUCTS = [
  {
    _id: 'prod-turmeric',
    name: 'Salem Pure Turmeric Powder',
    category: 'Spice Powders',
    badge: '100% Pure',
    rating: 4.9,
    reviewsCount: 420,
    price: 140,
    imageUrl: imgTurmeric,
    images: [imgTurmeric],
    origin: 'Salem, Tamil Nadu',
    process: 'Sun-dried & stone ground',
    description: 'High curcumin content authentic Salem turmeric roots, sun-dried and stone ground to retain natural deep golden color, rich aroma, and natural healing antioxidants.',
    variants: [
      { label: '100g', price: 140 },
      { label: '250g', price: 320 },
      { label: '500g', price: 590 }
    ],
    inStock: true
  },
  {
    _id: 'prod-chilli',
    name: 'Guntur Red Chilli Powder',
    category: 'Spice Powders',
    badge: 'Stone Ground',
    rating: 4.9,
    reviewsCount: 380,
    price: 150,
    imageUrl: imgChilli,
    images: [imgChilli],
    origin: 'Guntur Farms',
    process: 'Low RPM stone-pressed',
    description: 'Sun-dried premium red chillies stone-ground at low temperatures. Delivers vivid natural red color, balanced piquant heat, and zero artificial dyes or fillers.',
    variants: [
      { label: '100g', price: 150 },
      { label: '250g', price: 340 },
      { label: '500g', price: 620 }
    ],
    inStock: true
  },
  {
    _id: 'prod-coriander',
    name: 'Native Coriander Powder',
    category: 'Spice Powders',
    badge: 'Single Origin',
    rating: 4.8,
    reviewsCount: 310,
    price: 130,
    imageUrl: imgCoriander,
    images: [imgCoriander],
    origin: 'Erode, Tamil Nadu',
    process: 'Slowly roasted & ground',
    description: 'Slow roasted Tamil Nadu heirloom coriander seeds ground to fragrant perfection. An essential fragrant heart for daily wholesome South Indian gravies and curries.',
    variants: [
      { label: '100g', price: 130 },
      { label: '250g', price: 290 },
      { label: '500g', price: 540 }
    ],
    inStock: true
  },
  {
    _id: 'prod-garam-masala',
    name: 'Heritage Garam Masala',
    category: 'Masala Blends',
    badge: 'Traditional Recipe',
    rating: 5.0,
    reviewsCount: 290,
    price: 180,
    imageUrl: imgGaramMasala,
    images: [imgGaramMasala],
    origin: 'Tamil Nadu Heritage',
    process: '12 Whole Spices Hand-Blended',
    description: 'A royal blend of 12 whole spices roasted in small batches: cardamom, cinnamon, cloves, star anise, nutmeg, and black pepper. Unmatched rich fragrant aroma.',
    variants: [
      { label: '100g', price: 180 },
      { label: '200g', price: 340 }
    ],
    inStock: true
  },
  {
    _id: 'prod-sambar-powder',
    name: 'Traditional Sambar Powder',
    category: 'Masala Blends',
    badge: 'Bestseller',
    rating: 4.9,
    reviewsCount: 510,
    price: 160,
    imageUrl: imgSambar,
    images: [imgSambar],
    origin: 'Generational Recipe',
    process: 'Traditional stone ground',
    description: 'Handcrafted with an authentic generational recipe of roasted native dals, whole red chillies, coriander, fenugreek, and aromatic spices for rich homestyle taste.',
    variants: [
      { label: '100g', price: 160 },
      { label: '250g', price: 360 },
      { label: '500g', price: 680 }
    ],
    inStock: true
  },
  {
    _id: 'prod-coconut-oil',
    name: 'Wood Cold-Pressed Coconut Oil',
    category: 'Cold-Pressed Oils',
    badge: 'Chekku Pressed',
    rating: 4.9,
    reviewsCount: 640,
    price: 280,
    imageUrl: imgOilCoconut,
    images: [imgOilCoconut],
    origin: 'Pollachi, Tamil Nadu',
    process: 'Vaagai Wood Chekku < 40°C',
    description: 'Extracted from sun-dried sulfur-free copra using traditional Vaagai wood pestles below 40°C. 100% pure, unrefined, raw virgin culinary & wellness oil.',
    variants: [
      { label: '500ml', price: 280 },
      { label: '1 Litre', price: 520 }
    ],
    inStock: true
  },
  {
    _id: 'prod-groundnut-oil',
    name: 'Wood Cold-Pressed Groundnut Oil',
    category: 'Cold-Pressed Oils',
    badge: 'Rich Aroma',
    rating: 4.9,
    reviewsCount: 820,
    price: 260,
    imageUrl: imgOilGroundnut,
    images: [imgOilGroundnut],
    origin: 'Tiruvannamalai, Tamil Nadu',
    process: 'Slow Wood Pressed',
    description: 'Slow-pressed from selected native peanuts. High natural smoke point, rich nutty aroma, and heart-healthy monounsaturated fats with zero chemical refining.',
    variants: [
      { label: '500ml', price: 260 },
      { label: '1 Litre', price: 490 },
      { label: '5 Litres', price: 2350 }
    ],
    inStock: true
  },
  {
    _id: 'prod-gingelly-oil',
    name: 'Wood Cold-Pressed Gingelly (Sesame) Oil',
    category: 'Cold-Pressed Oils',
    badge: 'Palm Jaggery Blend',
    rating: 5.0,
    reviewsCount: 570,
    price: 340,
    imageUrl: imgOilGingelly,
    images: [imgOilGingelly],
    origin: 'Madurai, Tamil Nadu',
    process: 'Native Black Sesame & Karupatti',
    description: 'First-grade black sesame seeds slow-pressed with authentic Palm Jaggery (Karupatti). Rich in calcium, zinc, and live antioxidants for holistic wellness.',
    variants: [
      { label: '500ml', price: 340 },
      { label: '1 Litre', price: 650 }
    ],
    inStock: true
  },
  {
    _id: 'prod-sunflower-oil',
    name: 'Wood Cold-Pressed Sunflower Oil',
    category: 'Cold-Pressed Oils',
    badge: '100% Unrefined',
    rating: 4.8,
    reviewsCount: 390,
    price: 240,
    imageUrl: imgOilSunflower,
    images: [imgOilSunflower],
    origin: 'Dharapuram, Tamil Nadu',
    process: 'Wood Cold Extracted',
    description: 'Cold-extracted from high-grade sunflower seeds. Light golden hue, neutral pleasant flavour, and packed with natural Vitamin E for daily family cooking.',
    variants: [
      { label: '500ml', price: 240 },
      { label: '1 Litre', price: 460 }
    ],
    inStock: true
  }
];
