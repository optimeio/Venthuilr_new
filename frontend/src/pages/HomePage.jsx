import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import {
  ArrowRight, ShieldCheck, Leaf, Droplets, Award, Star,
  ChevronDown, X, ChevronLeft, ChevronRight, Plus, Minus,
  ShoppingCart, Send, Search, Package, Clock, MessageSquare, Quote,
  Truck, CheckCircle2, Sparkles, Heart, RefreshCw, Flame, Sun, Wheat
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

const API = import.meta.env.VITE_API_URL || '/api';

const CATEGORIES = [
  { 
    name: 'Cold-Pressed Oils',  
    iconType: 'droplets',
    badge: 'Traditional Chekku',
    desc: 'Sesame, Groundnut, Coconut & Mustard',
    items: '4 Products Available'
  },
  { 
    name: 'Spice Powders',      
    iconType: 'sparkles',
    badge: 'Single Origin',
    desc: 'Turmeric, Chilli, Coriander & Pepper',
    items: '6 Products Available'
  },
  { 
    name: 'Masala Blends',      
    iconType: 'flame',
    badge: 'Heritage Recipes',
    desc: 'Sambar, Rasam, Garam & Curry Blends',
    items: '5 Products Available'
  },
  { 
    name: 'Rice Varieties',     
    iconType: 'wheat',
    badge: 'Native Grains',
    desc: 'Karuppu Kavuni, Mappillai Samba & more',
    items: '4 Products Available'
  },
  { 
    name: 'Natural Sweeteners', 
    iconType: 'sun',
    badge: '100% Unrefined',
    desc: 'Country Sugar, Palm Jaggery & Raw Honey',
    items: '3 Products Available'
  },
  { 
    name: 'Herbal Products',    
    iconType: 'leaf',
    badge: 'Daily Wellness',
    desc: 'Herbal Infusions, Podis & Tonics',
    items: '4 Products Available'
  },
];

const REVIEWS = [
  {
    name: 'Maya R.',
    role: 'Home Cook & Nutrition Advocate',
    rating: 5,
    city: 'Chennai',
    text: "The sesame oil is pure magic — the aroma alone tells you it's authentic Chekku pressed. Nothing like store-bought refined oils. My entire family can taste the difference!"
  },
  {
    name: 'Harshath K.',
    role: 'Professional Chef',
    rating: 5,
    city: 'Coimbatore',
    text: "As a chef, purity of raw ingredients is everything. Venthulir's cold-pressed groundnut and coconut oils have an exceptional smoke point and rich, clean flavour."
  },
  {
    name: 'Aswini M.',
    role: 'Certified Nutritionist',
    rating: 5,
    city: 'Bengaluru',
    text: "Finally spice powders and masalas without fillers, preservatives, or artificial dyes. The aroma and health benefits are outstanding for daily holistic meals."
  },
  {
    name: 'Shivanya P.',
    role: 'Organic Lifestyle Blogger',
    rating: 5,
    city: 'Madurai',
    text: "I've reviewed dozens of organic brands across South India, but Venthulir stands apart in transparency, packaging, and genuine farm-fresh taste."
  },
  {
    name: 'Rosan D.',
    role: 'Fitness & Wellness Coach',
    rating: 5,
    city: 'Trichy',
    text: "Unrefined cold-pressed oils are essential for gut health and wholesome nutrition. Venthulir is now my daily kitchen staple and what I recommend to all my clients."
  }
];

const FAQS = [
  {
    q: 'How are Venthulir cold-pressed oils extracted?',
    a: 'We use traditional Chekku (wooden pestle and mortar) operated at very slow RPMs. This mechanical pressing maintains temperatures below 40°C, ensuring that all natural nutrients, antioxidants, aroma, and delicate vitamins remain intact.'
  },
  {
    q: 'Are all products 100% free of preservatives and additives?',
    a: 'Absolutely. Every batch of oil, spice, and grain is zero-chemical, zero-additive, and unadulterated. What you receive is 100% natural, certified, and farm-sourced produce.'
  },
  {
    q: 'What is the shelf life and ideal storage condition?',
    a: 'Because our oils are unrefined with zero chemical preservatives, we recommend storing them in a cool, dry place away from direct sunlight. Unopened bottles last 6 to 9 months, and opened bottles are best enjoyed within 3 months.'
  },
  {
    q: 'Do you offer free shipping and express delivery?',
    a: 'Yes! We offer complimentary standard shipping across India on all orders above ₹499. Orders are processed within 24 hours, with typical delivery taking 3–5 business days.'
  },
  {
    q: 'Can I place bulk orders for events or wholesale?',
    a: 'Yes, we gladly fulfill bulk and wholesale orders with customized packaging options. You can connect with our team via the contact form or WhatsApp us at +91 87784 76414.'
  }
];

const StarRating = ({ count = 5 }) => (
  <div className="star-rating-row" aria-label={`${count} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={14}
        className={i <= count ? 'star-filled' : 'star-empty'}
        fill={i <= count ? '#c9a84c' : 'none'}
        stroke="#c9a84c"
        strokeWidth={1.5}
      />
    ))}
  </div>
);

export default function HomePage({ onCheckout }) {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Reviews Carousel
  const [currentReview, setCurrentReview] = useState(0);

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState(0);

  // Contact Form State
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [formStatus, setFormStatus] = useState('idle');

  // Load products from API
  useEffect(() => {
    fetch(`${API}/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load products:', err);
        setLoading(false);
      });
  }, []);

  // Auto rotate reviews
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % REVIEWS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Unique categories for filtering
  const categoryTabs = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))];

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  // Open Quick View
  const handleOpenQuickView = useCallback((product) => {
    setQuickViewProduct(product);
    setSelectedVariant(product.variants?.[0] || null);
    setQuantity(1);
    setActiveImgIndex(0);
    document.body.style.overflow = 'hidden';
  }, []);

  // Close Quick View
  const handleCloseQuickView = () => {
    setQuickViewProduct(null);
    document.body.style.overflow = '';
  };

  const qvImages = quickViewProduct
    ? (quickViewProduct.images?.length ? quickViewProduct.images : [quickViewProduct.imageUrl].filter(Boolean))
    : [];
  const qvPrice = selectedVariant?.price ?? quickViewProduct?.price ?? 0;

  // Contact Form Submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('submitting');
    try {
      const res = await fetch(`${API}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setFormStatus('error');
      }
    } catch {
      setFormStatus('error');
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page-root">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Exact Screenshot Layout)
      ───────────────────────────────────────────────────────────── */}
      <section id="home" className="home-hero">
        <div className="container">
          <div className="hero-content-grid">
            
            {/* Left Column: Headlines & CTAs */}
            <div className="hero-text-col">
              <div className="hero-badge-pill">
                <span className="badge-pulse-dot" />
                <span>100% Certified Organic • Chekku Pressed</span>
              </div>

              <h1 className="hero-main-heading">
                Pure Organic Essentials, <br />
                <span className="heading-accent">Direct From Heritage</span> <br />
                Tamil Nadu Farms.
              </h1>

              <p className="hero-description">
                Experience the authentic taste of cold-pressed oils, single-origin spices, 
                and traditional grains. Meticulously crafted with zero chemical preservatives, 
                zero fillers, and generations of honest farming.
              </p>

              <div className="hero-actions-row">
                <button 
                  className="btn-hero-primary" 
                  onClick={() => scrollToSection('products')}
                >
                  <span>Explore Catalog</span>
                  <ArrowRight size={18} />
                </button>
                <button 
                  className="btn-hero-secondary" 
                  onClick={() => scrollToSection('story')}
                >
                  Our Heritage
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="hero-trust-row">
                <div className="trust-pill">
                  <ShieldCheck size={16} className="pill-icon" />
                  <span>FSSAI Certified</span>
                </div>
                <div className="trust-pill">
                  <Droplets size={16} className="pill-icon" />
                  <span>Wood Cold-Pressed</span>
                </div>
                <div className="trust-pill">
                  <Leaf size={16} className="pill-icon" />
                  <span>Zero Preservatives</span>
                </div>
              </div>

              {/* Social Proof Stats */}
              <div className="hero-metric-strip">
                <div className="metric-item">
                  <div className="metric-val">5,000+</div>
                  <div className="metric-label">Happy Families</div>
                </div>
                <div className="metric-divider" />
                <div className="metric-item">
                  <div className="metric-val">4.9 ★</div>
                  <div className="metric-label">Customer Rating</div>
                </div>
                <div className="metric-divider" />
                <div className="metric-item">
                  <div className="metric-val">50+</div>
                  <div className="metric-label">Organic Farms</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Feature */}
            <div className="hero-visual-col">
              <div className="hero-media-wrapper">
                
                {/* Main Hero Image Showcase */}
                <div className="hero-image-frame">
                  <img
                    src="/hero-products.jpg"
                    alt="Venthulir Organic Cold-Pressed Oils and Spices"
                    className="hero-main-photo"
                  />
                  <div className="image-tag-floating">
                    <Sparkles size={14} />
                    <span>Harvest Fresh Batch</span>
                  </div>
                </div>

                {/* Floating Product Highlight Card */}
                <div className="hero-floating-card top-right">
                  <div className="card-icon-wrap">🌿</div>
                  <div className="card-info">
                    <div className="card-headline">100% Pure</div>
                    <div className="card-sub">Wood Cold-Pressed</div>
                  </div>
                </div>

                <div className="hero-floating-card bottom-left">
                  <div className="card-icon-wrap">🚚</div>
                  <div className="card-info">
                    <div className="card-headline">Free Delivery</div>
                    <div className="card-sub">On orders above ₹499</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. VALUE PROPOSITIONS STRIP (Rich Forest Green with White Icons)
      ───────────────────────────────────────────────────────────── */}
      <section className="features-strip">
        <div className="container">
          <div className="features-grid">
            <div className="feature-cell">
              <div className="feature-icon-box">
                <Leaf size={22} />
              </div>
              <div className="feature-content">
                <h4 className="feature-title">100% Certified Organic</h4>
                <p className="feature-desc">Cultivated without synthetic pesticides or harmful chemicals.</p>
              </div>
            </div>

            <div className="feature-cell">
              <div className="feature-icon-box">
                <Droplets size={22} />
              </div>
              <div className="feature-content">
                <h4 className="feature-title">Traditional Chekku</h4>
                <p className="feature-desc">Wooden press extraction under 40°C to lock in nutrients.</p>
              </div>
            </div>

            <div className="feature-cell">
              <div className="feature-icon-box">
                <Truck size={22} />
              </div>
              <div className="feature-content">
                <h4 className="feature-title">Direct Farm Dispatch</h4>
                <p className="feature-desc">Swift pan-India delivery with eco-friendly packaging.</p>
              </div>
            </div>

            <div className="feature-cell">
              <div className="feature-icon-box">
                <ShieldCheck size={22} />
              </div>
              <div className="feature-content">
                <h4 className="feature-title">Lab Tested &amp; FSSAI</h4>
                <p className="feature-desc">Rigorous multi-point testing for complete batch purity.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. CATEGORIES SECTION (Refined White Luxury Cards)
      ───────────────────────────────────────────────────────────── */}
      <section id="categories" className="section-categories">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-eyebrow">Curated Collections</span>
            <h2 className="section-headline">Shop By Category</h2>
            <p className="section-subtitle">
              From cold-pressed cooking oils to aromatic spices and heirloom grains, 
              discover pure staples crafted for healthy living.
            </p>
          </div>

          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.name}
                className={`category-card cat-${cat.iconType}`}
                onClick={() => {
                  setActiveCategory(cat.name);
                  scrollToSection('products');
                }}
              >
                <div className="category-top-meta">
                  <div className="category-icon-bubble">
                    {cat.iconType === 'droplets' && <Droplets size={24} />}
                    {cat.iconType === 'sparkles' && <Sparkles size={24} />}
                    {cat.iconType === 'flame' && <Flame size={24} />}
                    {cat.iconType === 'wheat' && <Wheat size={24} />}
                    {cat.iconType === 'sun' && <Sun size={24} />}
                    {cat.iconType === 'leaf' && <Leaf size={24} />}
                  </div>
                  <span className="category-badge-tag">{cat.badge}</span>
                </div>
                <div className="category-info">
                  <h3 className="category-name">{cat.name}</h3>
                  <p className="category-summary">{cat.desc}</p>
                </div>
                <div className="category-footer-action">
                  <span className="cat-item-count">{cat.items}</span>
                  <div className="category-action-link">
                    <span>Shop</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. PRODUCTS CATALOG (Search, Category Filters, Grid)
      ───────────────────────────────────────────────────────────── */}
      <section id="products" className="section-products">
        <div className="container">
          
          <div className="products-top-bar">
            <div>
              <span className="section-eyebrow">Our Farm Catalog</span>
              <h2 className="section-headline">Pure Organic Staples</h2>
            </div>

            {/* Search Input */}
            <div className="product-search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search oils, spices, grains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="category-filter-pills">
            {categoryTabs.map((tab) => (
              <button
                key={tab}
                className={`filter-pill-btn ${activeCategory === tab ? 'active' : ''}`}
                onClick={() => setActiveCategory(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="products-grid-layout">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="product-skeleton-card" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="products-empty-state">
              <Package size={52} strokeWidth={1.2} />
              <h3>No products found</h3>
              <p>Try searching for another keyword or selecting "All" categories.</p>
              <button
                className="btn-secondary-sm"
                onClick={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="products-grid-layout">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onQuickView={handleOpenQuickView}
                />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. BRAND STORY & HERITAGE (Editorial 2-Column on White)
      ───────────────────────────────────────────────────────────── */}
      <section id="story" className="section-story">
        <div className="container">
          <div className="story-layout-grid">
            
            {/* Visual Column */}
            <div className="story-visual-side">
              <div className="story-photo-frame">
                <img
                  src="/story-traditional.jpg"
                  alt="Traditional Wood Press Chekku at Tamil Nadu Farm"
                  className="story-photo"
                />
              </div>

              {/* Floating Highlight Box */}
              <div className="story-stat-card">
                <div className="stat-unit">
                  <div className="stat-number">50+</div>
                  <div className="stat-desc">Partner Farms</div>
                </div>
                <div className="stat-sep" />
                <div className="stat-unit">
                  <div className="stat-number">100%</div>
                  <div className="stat-desc">Wood Pressed</div>
                </div>
                <div className="stat-sep" />
                <div className="stat-unit">
                  <div className="stat-number">0%</div>
                  <div className="stat-desc">Chemicals</div>
                </div>
              </div>
            </div>

            {/* Narrative Column */}
            <div className="story-text-side">
              <span className="section-eyebrow">Our Philosophy</span>
              <h2 className="section-headline">
                Rooted in Tradition. <br />
                Driven by Uncompromised Purity.
              </h2>

              <p className="story-body-p">
                At Venthulir, we believe modern food production has lost touch with what truly nourishes our bodies. 
                Mass-produced supermarket oils are treated with harsh chemicals, high heat, and bleaching agents that strip away life-giving vitamins.
              </p>

              <p className="story-body-p">
                We revived the ancient <strong>Chekku</strong> (wooden pestle press) tradition. By partnering directly 
                with organic farmers across Tamil Nadu, we ensure fair prices for growers and unadulterated goodness 
                for your kitchen table.
              </p>

              <div className="story-features-list">
                <div className="story-feature-row">
                  <div className="story-bullet-dot">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <strong>Direct Farmer Partnerships:</strong> We eliminate middlemen so local farming communities thrive.
                  </div>
                </div>

                <div className="story-feature-row">
                  <div className="story-bullet-dot">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <strong>Cold Mechanical Pressing:</strong> Extracted under 40°C to preserve unrefined antioxidants and rich natural aroma.
                  </div>
                </div>

                <div className="story-feature-row">
                  <div className="story-bullet-dot">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <strong>Small Batch Freshness:</strong> Bottled fresh in food-grade packaging right after settling and filtering.
                  </div>
                </div>
              </div>

              <div className="story-cta-wrap">
                <button
                  className="btn-hero-primary"
                  onClick={() => scrollToSection('products')}
                >
                  <span>Shop Pure Harvest</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. CUSTOMER REVIEWS & TESTIMONIALS (White Carousel)
      ───────────────────────────────────────────────────────────── */}
      <section id="reviews" className="section-reviews">
        <div className="container">
          
          <div className="reviews-header-bar">
            <div>
              <span className="section-eyebrow">Verified Feedback</span>
              <h2 className="section-headline">Loved by 5,000+ Kitchens</h2>
            </div>

            <div className="carousel-nav-arrows">
              <button
                className="carousel-arrow-btn"
                onClick={() => setCurrentReview((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length)}
                aria-label="Previous review"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="carousel-arrow-btn"
                onClick={() => setCurrentReview((prev) => (prev + 1) % REVIEWS.length)}
                aria-label="Next review"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="reviews-cards-grid">
            {REVIEWS.map((rev, index) => {
              const offset = (index - currentReview + REVIEWS.length) % REVIEWS.length;
              const isPrimary = offset === 0;
              const isSecondary = offset === 1 || offset === REVIEWS.length - 1;

              return (
                <div
                  key={index}
                  className={`review-card ${isPrimary ? 'primary-card' : ''} ${isSecondary ? 'secondary-card' : ''}`}
                  onClick={() => setCurrentReview(index)}
                >
                  <div className="review-top-row">
                    <StarRating count={rev.rating} />
                    <Quote size={24} className="quote-watermark" />
                  </div>

                  <p className="review-comment">"{rev.text}"</p>

                  <div className="reviewer-profile">
                    <div className="reviewer-avatar">{rev.name[0]}</div>
                    <div className="reviewer-meta">
                      <div className="reviewer-name">{rev.name}</div>
                      <div className="reviewer-role">{rev.role} • {rev.city}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="reviews-dot-nav">
            {REVIEWS.map((_, i) => (
              <button
                key={i}
                className={`dot-pill ${i === currentReview ? 'active' : ''}`}
                onClick={() => setCurrentReview(i)}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. FAQ & DIRECT INQUIRY (Clean White 2-Column)
      ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="section-faq-contact">
        <div className="container">
          <div className="faq-contact-grid">
            
            {/* Left: FAQ Accordion */}
            <div className="faq-column">
              <span className="section-eyebrow">Got Questions?</span>
              <h2 className="section-headline">Frequently Asked Questions</h2>
              
              <div className="accordion-list">
                {FAQS.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={index} className={`accordion-item ${isOpen ? 'is-open' : ''}`}>
                      <button
                        className="accordion-trigger"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        aria-expanded={isOpen}
                      >
                        <span className="accordion-question">{faq.q}</span>
                        <ChevronDown size={18} className="accordion-arrow" />
                      </button>
                      <div className="accordion-collapse">
                        <p className="accordion-answer">{faq.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Contact & Bulk Inquiry Form */}
            <div id="contact" className="contact-column">
              <span className="section-eyebrow">Get In Touch</span>
              <h2 className="section-headline">Inquiries &amp; Bulk Orders</h2>

              <div className="contact-card-box">
                {formStatus === 'success' ? (
                  <div className="contact-success-panel">
                    <div className="success-icon-wrap">
                      <CheckCircle2 size={36} />
                    </div>
                    <h3>Thank you for reaching out!</h3>
                    <p>Your message has been sent. Our team will get back to you within 24 hours.</p>
                    <button
                      className="btn-hero-primary"
                      onClick={() => setFormStatus('idle')}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="inquiry-form">
                    <div className="form-fields-row">
                      <div className="form-field-unit">
                        <label>Your Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Kumar"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="form-field-unit">
                        <label>Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="e.g. ramesh@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-field-unit">
                      <label>Phone Number (Optional)</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="form-field-unit">
                      <label>Your Message / Requirement *</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Tell us what products or questions you have..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>

                    {formStatus === 'error' && (
                      <p className="form-error-msg">
                        Unable to send right now. Please try again or reach us on WhatsApp.
                      </p>
                    )}

                    <button
                      type="submit"
                      className="btn-submit-form"
                      disabled={formStatus === 'submitting'}
                    >
                      {formStatus === 'submitting' ? (
                        <span>Sending Message...</span>
                      ) : (
                        <>
                          <span>Submit Inquiry</span>
                          <Send size={15} />
                        </>
                      )}
                    </button>
                  </form>
                )}

                <div className="contact-quick-support">
                  <div className="support-item">
                    <MessageSquare size={16} className="support-icon" />
                    <span>WhatsApp: <strong>+91 87784 76414</strong></span>
                  </div>
                  <div className="support-item">
                    <Clock size={16} className="support-icon" />
                    <span>Fast Response: Within 24h</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. QUICK VIEW MODAL
      ───────────────────────────────────────────────────────────── */}
      {quickViewProduct && (
        <div className="quickview-overlay" onClick={handleCloseQuickView}>
          <div className="quickview-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="quickview-close-btn"
              onClick={handleCloseQuickView}
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            <div className="quickview-grid">
              
              {/* Product Gallery */}
              <div className="quickview-gallery-side">
                <div className="quickview-main-image-wrap">
                  {qvImages[activeImgIndex] ? (
                    <img src={qvImages[activeImgIndex]} alt={quickViewProduct.name} />
                  ) : (
                    <div className="quickview-placeholder">
                      {quickViewProduct.name[0]}
                    </div>
                  )}
                </div>

                {qvImages.length > 1 && (
                  <div className="quickview-thumbs-row">
                    {qvImages.map((img, idx) => (
                      <button
                        key={idx}
                        className={`thumb-btn ${idx === activeImgIndex ? 'is-selected' : ''}`}
                        onClick={() => setActiveImgIndex(idx)}
                      >
                        <img src={img} alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details & Actions */}
              <div className="quickview-details-side">
                {quickViewProduct.badge && (
                  <span className="qv-badge-pill">{quickViewProduct.badge}</span>
                )}
                <div className="qv-category-label">{quickViewProduct.category}</div>
                <h2 className="qv-product-name">{quickViewProduct.name}</h2>

                <div className="qv-rating-strip">
                  <StarRating count={5} />
                  <span className="qv-rating-text">4.9 (500+ verified ratings)</span>
                </div>

                <div className="qv-price-tag">₹{qvPrice}</div>

                <p className="qv-description-text">{quickViewProduct.description}</p>

                {/* Variants Selector */}
                {quickViewProduct.variants?.length > 0 && (
                  <div className="qv-variant-group">
                    <label className="qv-field-label">Available Packaging / Sizes:</label>
                    <div className="qv-variants-row">
                      {quickViewProduct.variants.map((v) => (
                        <button
                          key={v.label}
                          className={`qv-variant-btn ${selectedVariant?.label === v.label ? 'active' : ''}`}
                          onClick={() => setSelectedVariant(v)}
                        >
                          <span className="var-label">{v.label}</span>
                          <span className="var-price">₹{v.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="qv-quantity-group">
                  <label className="qv-field-label">Quantity:</label>
                  <div className="qv-quantity-stepper">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="stepper-value">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="qv-subtotal-row">
                  <span>Total Amount:</span>
                  <strong>₹{qvPrice * quantity}</strong>
                </div>

                <button
                  className="btn-qv-add-cart"
                  onClick={() => {
                    addToCart(quickViewProduct, selectedVariant, quantity);
                    handleCloseQuickView();
                  }}
                >
                  <ShoppingCart size={18} />
                  <span>Add To Cart</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
