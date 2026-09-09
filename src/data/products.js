const imgTurmeric = '/assets/hero/turmeric.png';
const imgChilli = '/assets/hero/chilli.png';
const imgCoriander = '/assets/hero/coriander.png';
const imgGaramMasala = '/assets/hero/garam_masala.png';
const imgSambar = '/assets/hero/sambar.png';
const imgOilCoconut = '/assets/hero/oil_coconut.png';
const imgOilGroundnut = '/assets/hero/oil_groundnut.png';
const imgOilGingelly = '/assets/hero/oil_gingelly.png';
const imgOilSunflower = '/assets/hero/oil_sunflower.png';

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
    origin: 'Tamil Nadu Heritage Farms',
    process: 'Sun-roasted seeds',
    description: 'Pure single-origin Tamil Nadu heirloom coriander seeds. Mildly roasted and freshly milled for the quintessentially fragrant South Indian culinary base.',
    variants: [
      { label: '100g', price: 130 },
      { label: '250g', price: 300 },
      { label: '500g', price: 560 }
    ],
    inStock: true
  },
  {
    _id: 'prod-garam-masala',
    name: 'Heritage Garam Masala',
    category: 'Masala Blends',
    badge: 'Hand Crafted',
    rating: 5.0,
    reviewsCount: 290,
    price: 180,
    imageUrl: imgGaramMasala,
    images: [imgGaramMasala],
    origin: 'Traditional Recipe',
    process: '12-spice hand roast',
    description: 'Artisanal secret blend of 12 whole spices including green cardamom, cinnamon quills, cloves, and star anise. Aromatic, balanced, and royal in flavour.',
    variants: [
      { label: '100g', price: 180 },
      { label: '250g', price: 420 },
      { label: '500g', price: 780 }
    ],
    inStock: true
  },
  {
    _id: 'prod-sambar-powder',
    name: 'Traditional Sambar Powder',
    category: 'Masala Blends',
    badge: 'Generational Recipe',
    rating: 4.9,
    reviewsCount: 510,
    price: 160,
    imageUrl: imgSambar,
    images: [imgSambar],
    origin: 'Thanjavur Kitchen Heritage',
    process: 'Slow earthen roast',
    description: 'Generational family recipe crafted with roasted lentils, hand-picked chillies, and aromatic whole spices. Delivers that unbeatable authentic homestyle sambar aroma.',
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
    badge: 'Wood Cold-Pressed',
    rating: 4.9,
    reviewsCount: 640,
    price: 280,
    imageUrl: imgOilCoconut,
    images: [imgOilCoconut],
    origin: 'Pollachi, Tamil Nadu',
    process: 'Traditional Mara Chekku',
    description: 'Extracted from naturally sun-dried sulphur-free copra using traditional Vaagai wooden Chekku. Crystal clear, incredibly fragrant, and rich in natural Lauric acid.',
    variants: [
      { label: '500ml', price: 280 },
      { label: '1 Litre', price: 540 }
    ],
    inStock: true
  },
  {
    _id: 'prod-groundnut-oil',
    name: 'Wood Cold-Pressed Groundnut Oil',
    category: 'Cold-Pressed Oils',
    badge: '100% Pure',
    rating: 4.9,
    reviewsCount: 820,
    price: 260,
    imageUrl: imgOilGroundnut,
    images: [imgOilGroundnut],
    origin: 'Tiruvannamalai Farms',
    process: 'Traditional Mara Chekku',
    description: 'Cold-pressed from selected native Tamil peanuts. Retains rich nutty aroma, natural golden hue, high smoke point, and natural plant sterols for healthy everyday cooking.',
    variants: [
      { label: '500ml', price: 260 },
      { label: '1 Litre', price: 490 }
    ],
    inStock: true
  },
  {
    _id: 'prod-gingelly-oil',
    name: 'Wood Cold-Pressed Gingelly Oil',
    category: 'Cold-Pressed Oils',
    badge: 'Traditional Chekku',
    rating: 5.0,
    reviewsCount: 570,
    price: 340,
    imageUrl: imgOilGingelly,
    images: [imgOilGingelly],
    origin: 'Madurai Heritage Harvest',
    process: 'Palm Jaggery Chekku',
    description: 'Hand-picked black sesame seeds pressed slowly with organic palm jaggery (Karupatti). Deep, rich, traditional sesame aroma perfect for authentic South Indian curries and health rituals.',
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
    origin: 'Tamil Nadu Harvest',
    process: 'Cold seed extraction',
    description: 'Cold-extracted from high-grade sunflower seeds. Light golden hue, neutral pleasant flavour, and packed with natural Vitamin E.',
    variants: [
      { label: '500ml', price: 240 },
      { label: '1 Litre', price: 460 }
    ],
    inStock: true
  }
];
