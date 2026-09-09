'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { useUIModal } from '@/components/Providers';
import { 
  Search, X, ArrowUpDown, Sparkles, Leaf, Droplets, 
  ShieldCheck, Package, ShoppingCart, Plus, Minus, Star 
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { INITIAL_PRODUCTS } from '@/data/products';
import './ProductsPage.css';

const API = '/api';

export default function ProductsPage({ onCheckout }) {
  const { addToCart, setIsCartOpen } = useCart();
  const uiModal = useUIModal?.() || null;
  const handleCheckout = onCheckout || uiModal?.openCheckout;

  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    fetch(`${API}/products`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        } else if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch((err) => {
        console.error('API product load fallback:', err);
      });
  }, []);

  const categories = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))];

  const filteredProducts = products
    .filter((p) => {
      const matchCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchSearch = !searchQuery || 
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

  const handleOpenQuickView = useCallback((product) => {
    setQuickViewProduct(product);
    setSelectedVariant(product.variants?.[0] || null);
    setQuantity(1);
    setActiveImgIndex(0);
    document.body.style.overflow = 'hidden';
  }, []);

  const handleCloseQuickView = () => {
    setQuickViewProduct(null);
    document.body.style.overflow = '';
  };

  const qvImages = quickViewProduct
    ? (quickViewProduct.images?.length ? quickViewProduct.images : [quickViewProduct.imageUrl].filter(Boolean))
    : [];
  const qvPrice = selectedVariant?.price ?? quickViewProduct?.price ?? 0;

  return (
    <div className="products-page-root">
      {/* Hero Banner Header */}
      <section className="products-hero-header">
        <div className="container">
          <div className="products-header-content">
            <div className="products-badge-pill">
              <Sparkles size={13} className="gold" />
              <span>100% UNADULTERATED • FARM HARVEST</span>
            </div>
            <h1 className="products-page-title">
              Pure Staples. <span className="title-accent">Direct From Tamil Farms.</span>
            </h1>
            <p className="products-page-subtitle">
              Explore our full catalog of cold-pressed virgin oils, stone-ground single-origin spice powders, 
              and authentic masala blends crafted with zero chemicals.
            </p>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section className="products-catalog-section">
        <div className="container">
          
          {/* Controls Bar: Search, Category Tabs, Sort Filter */}
          <div className="catalog-toolbar">
            
            {/* Search Input */}
            <div className="catalog-search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search oils, turmeric, chilli, sambar..."
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

            {/* Sort Dropdown */}
            <div className="catalog-sort-wrapper">
              <ArrowUpDown size={15} className="sort-icon" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="featured">Featured &amp; Bestsellers</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated (★)</option>
                <option value="name">Product Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="catalog-category-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-pill-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results Count & Active Filter Indicator */}
          <div className="catalog-results-info">
            <span>Showing <strong>{filteredProducts.length}</strong> products</span>
            {(activeCategory !== 'All' || searchQuery) && (
              <button 
                className="btn-clear-filters"
                onClick={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                  setSortBy('featured');
                }}
              >
                Reset All Filters
              </button>
            )}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="catalog-products-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="product-skeleton-card" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="catalog-empty-state">
              <Package size={56} strokeWidth={1.2} />
              <h3>No products match your criteria</h3>
              <p>Try clearing your search keyword or selecting a different category.</p>
              <button
                className="btn-reset-catalog"
                onClick={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                }}
              >
                Show All Products
              </button>
            </div>
          ) : (
            <div className="catalog-products-grid">
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

      {/* Trust Strip */}
      <section className="catalog-trust-strip">
        <div className="container">
          <div className="trust-strip-grid">
            <div className="trust-strip-item">
              <Leaf size={22} className="trust-icon" />
              <div>
                <strong>100% Single-Origin</strong>
                <span>Native Tamil Seeds &amp; Spices</span>
              </div>
            </div>
            <div className="trust-strip-item">
              <Droplets size={22} className="trust-icon" />
              <div>
                <strong>Wooden Chekku Pressed</strong>
                <span>Cold extracted below 40°C</span>
              </div>
            </div>
            <div className="trust-strip-item">
              <ShieldCheck size={22} className="trust-icon" />
              <div>
                <strong>Zero Chemical Additives</strong>
                <span>100% Lab Tested &amp; FSSAI Pure</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="quickview-overlay" onClick={handleCloseQuickView}>
          <div className="quickview-modal animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button className="quickview-close-btn" onClick={handleCloseQuickView} aria-label="Close modal">
              <X size={20} />
            </button>

            <div className="quickview-grid">
              
              {/* Product Gallery */}
              <div className="quickview-gallery">
                <div className="quickview-main-img-wrap">
                  <img
                    src={qvImages[activeImgIndex] || quickViewProduct.imageUrl}
                    alt={quickViewProduct.name}
                    className="quickview-main-img"
                  />
                  {quickViewProduct.badge && (
                    <span className="quickview-badge-tag">{quickViewProduct.badge}</span>
                  )}
                </div>

                {qvImages.length > 1 && (
                  <div className="quickview-thumbnails">
                    {qvImages.map((img, idx) => (
                      <button
                        key={idx}
                        className={`qv-thumb-btn ${idx === activeImgIndex ? 'active' : ''}`}
                        onClick={() => setActiveImgIndex(idx)}
                      >
                        <img src={img} alt={`View ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="quickview-details">
                <div className="qv-category-line">
                  <span className="qv-category">{quickViewProduct.category}</span>
                  <div className="qv-rating">
                    <Star size={13} fill="#c9a84c" color="#c9a84c" />
                    <span>{quickViewProduct.rating || 4.9} ({quickViewProduct.reviewsCount || 250}+ reviews)</span>
                  </div>
                </div>

                <h2 className="qv-product-name">{quickViewProduct.name}</h2>

                <div className="qv-price-row">
                  <span className="qv-price">₹{qvPrice}</span>
                  <span className="qv-tax-note">Inclusive of all taxes • Free shipping &gt; ₹499</span>
                </div>

                <p className="qv-description">{quickViewProduct.description}</p>

                {/* Variants */}
                {quickViewProduct.variants?.length > 0 && (
                  <div className="qv-variants-section">
                    <label className="qv-label">Select Pack Size:</label>
                    <div className="qv-variant-pills">
                      {quickViewProduct.variants.map((v) => (
                        <button
                          key={v.label}
                          className={`qv-variant-pill ${selectedVariant?.label === v.label ? 'active' : ''}`}
                          onClick={() => setSelectedVariant(v)}
                        >
                          <span className="qv-var-label">{v.label}</span>
                          <span className="qv-var-price">₹{v.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity & Add to Cart */}
                <div className="qv-action-row">
                  <div className="qv-qty-picker">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span>{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="qv-action-buttons-grid">
                    <button
                      className="qv-add-cart-btn"
                      onClick={() => {
                        for (let i = 0; i < quantity; i++) {
                          addToCart(quickViewProduct, selectedVariant);
                        }
                        handleCloseQuickView();
                      }}
                      type="button"
                    >
                      <ShoppingCart size={16} />
                      <span>Add to Cart</span>
                    </button>

                    <button
                      className="qv-buy-now-btn"
                      onClick={() => {
                        for (let i = 0; i < quantity; i++) {
                          addToCart(quickViewProduct, selectedVariant);
                        }
                        handleCloseQuickView();
                        setIsCartOpen(false);
                        const price = qvPrice * quantity;
                        const shippingFee = price >= 499 ? 0 : 49;
                        if (handleCheckout) {
                          handleCheckout({
                            grandTotal: price + shippingFee,
                            discount: 0,
                            appliedCoupon: null,
                            shippingFee
                          });
                        } else {
                          const checkoutBtn = document.querySelector('.checkout-cta') || document.querySelector('.btn-checkout');
                          if (checkoutBtn) checkoutBtn.click();
                        }
                      }}
                      type="button"
                    >
                      <span>Buy Now • ₹{qvPrice * quantity}</span>
                    </button>
                  </div>
                </div>

                {/* Micro guarantees */}
                <div className="qv-guarantees-row">
                  <div className="qv-guarantee-item">
                    <Leaf size={14} color="#15803d" />
                    <span>100% Pure &amp; Unadulterated</span>
                  </div>
                  <div className="qv-guarantee-item">
                    <Droplets size={14} color="#b45309" />
                    <span>Traditional Chekku Cold Extraction</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
