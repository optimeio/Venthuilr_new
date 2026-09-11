'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useUIModal } from '@/components/Providers';
import { INITIAL_PRODUCTS } from '@/data/products';
import { 
  ShoppingBag, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Search, 
  Heart, 
  ChevronDown, 
  Sparkles, 
  Flame, 
  ArrowRight,
  ShieldCheck,
  Truck,
  PhoneCall,
  Gift,
  Star,
  Plus,
  Check,
  TrendingUp,
  Package,
  MapPin
} from 'lucide-react';
import './Navbar.css';

const QUICK_CATEGORIES = [
  { id: 'all',          name: 'All Products',      emoji: '🌿' },
  { id: 'spices',       name: 'Spice Powders',     emoji: '🌶️', filter: 'Spice Powders' },
  { id: 'masalas',      name: 'Masala Blends',     emoji: '🍲', filter: 'Masala Blends' },
  { id: 'oils',         name: 'Cold-Pressed Oils', emoji: '🛢️', filter: 'Cold-Pressed Oils' },
];

const ANNOUNCEMENTS = [
  { text: '🌿 100% Certified Organic & Single-Origin Direct from Farms', icon: ShieldCheck },
  { text: '🚚 Free Express Delivery Across India on Orders Above ₹499', icon: Truck },
  { text: '🎁 Flat 15% OFF On 1st Order — Code: FIRSTPURE', icon: Gift },
  { text: '💬 Instant WhatsApp Order & Support: +91 98765 43210', icon: PhoneCall },
];

const TRENDING_SEARCHES = [
  'Turmeric Powder',
  'Red Chilli',
  'Cold-Pressed Gingelly Oil',
  'Sambar Powder',
  'Coconut Oil'
];

export default function Navbar({ onAuthOpen, onSearchOpen }) {
  const { cartCount, setIsCartOpen, addToCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const uiModal = useUIModal?.() || null;
  
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [categoryDropOpen, setCategoryDropOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [tickerIndex, setTickerIndex] = useState(0);
  const [addedItemKey, setAddedItemKey] = useState(null);

  const dropRef = useRef(null);
  const catDropRef = useRef(null);
  const searchContainerRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  const handleAuthClick = () => {
    setMenuOpen(false);
    router.push('/login');
  };

  // Enhanced fuzzy matching for instant search
  const searchResults = searchQuery.trim()
    ? INITIAL_PRODUCTS.filter((p) => {
        const query = searchQuery.toLowerCase().trim();
        const name = (p.name || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const origin = (p.origin || '').toLowerCase();
        const badge = (p.badge || '').toLowerCase();
        
        // Match tokens
        const tokens = query.split(/\s+/).filter(Boolean);
        return tokens.every((token) => {
          if (name.includes(token) || cat.includes(token) || desc.includes(token) || origin.includes(token) || badge.includes(token)) {
            return true;
          }
          // Chili / Chilli alias
          if ((token === 'chili' || token === 'chilli') && (name.includes('chilli') || name.includes('chili') || desc.includes('chilli'))) {
            return true;
          }
          // Oil aliases
          if ((token === 'oil' || token === 'oils') && (cat.includes('oil') || name.includes('oil'))) {
            return true;
          }
          // Turmeric / Haldi / Manjal
          if ((token === 'turmeric' || token === 'manjal' || token === 'haldi') && (name.includes('turmeric') || desc.includes('curcumin'))) {
            return true;
          }
          // Sambar / Masala
          if ((token === 'sambar' || token === 'masala') && (name.includes('sambar') || name.includes('masala') || cat.includes('masala'))) {
            return true;
          }
          return false;
        });
      })
    : [];

  // Rotate announcement ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const close = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setUserOpen(false);
      if (catDropRef.current && !catDropRef.current.contains(e.target)) setCategoryDropOpen(false);
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
    };
  }, []);

  // Instant live search submit handler
  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchFocused(false);
    router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleProductSelect = (product) => {
    setSearchFocused(false);
    setSearchQuery('');
    setMenuOpen(false);
    router.push(`/products?search=${encodeURIComponent(product.name)}`);
  };

  const handleQuickAdd = (e, product) => {
    e.stopPropagation();
    addToCart(product, product.variants?.[0] || null);
    setAddedItemKey(product._id);
    setTimeout(() => setAddedItemKey(null), 1500);
  };

  // Instant category quick filter handler
  const handleCategorySelect = (cat) => {
    setActiveCategory(cat.id);
    setCategoryDropOpen(false);
    setMenuOpen(false);

    if (cat.id === 'all') {
      router.push('/products');
    } else if (cat.filter) {
      router.push(`/products?category=${encodeURIComponent(cat.filter)}`);
    } else {
      router.push('/products');
    }
  };

  const navigateToSection = (targetId, fallbackPath) => {
    setMenuOpen(false);
    if (pathname === '/' || pathname === '/home' || !pathname) {
      if (targetId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    router.push(fallbackPath || `/#${targetId}`);
  };

  const ActiveIcon = ANNOUNCEMENTS[tickerIndex].icon;

  return (
    <header className={`site-header-wrapper ${scrolled ? 'is-scrolled' : ''}`}>
      
      {/* ── 1. Top High-Trust Announcement Ticker Strip ── */}
      <div className="top-announcement-strip">
        <div className="container announcement-inner">
          <div className="announcement-badge-pill">OFFER</div>
          <div className="announcement-content">
            <ActiveIcon size={13} className="ticker-icon" />
            <span className="ticker-text">{ANNOUNCEMENTS[tickerIndex].text}</span>
          </div>
          <div className="announcement-quick-links">
            <button 
              type="button" 
              className="quick-link-btn"
              onClick={() => navigateToSection('faq', '/#faq')}
            >
              Help & WhatsApp
            </button>
            <span className="divider">|</span>
            <Link 
              href="/products" 
              className="quick-link-btn highlight"
            >
              Daily Deals
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. Main Primary Navbar ── */}
      <nav className="main-navbar">
        <div className="container navbar-content-row">
          
          {/* Brand Logo */}
          <Link href="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
            <img
              src="/logo.png"
              alt="Venthulir"
              className="brand-logo-img"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="brand-text-block">
              <span className="brand-name">VENTHULIR</span>
              <span className="brand-tagline">Pure Taste of Nature</span>
            </div>
          </Link>

          {/* High-Converting Integrated Omnisearch with Live Autocomplete Dropdown */}
          <div className="nav-omnisearch-container" ref={searchContainerRef}>
            <form className="nav-omnisearch-form" onSubmit={handleSearchSubmit}>
              <div className="search-input-wrapper">
                <Search size={16} className="search-leading-icon" />
                <input
                  type="text"
                  placeholder="Search turmeric, cold-pressed oils, sambar masala..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchFocused(true);
                  }}
                  onFocus={() => setSearchFocused(true)}
                  onClick={() => setSearchFocused(true)}
                  className="omnisearch-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="search-clear"
                    onClick={() => setSearchQuery('')}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
              <button type="submit" className="omnisearch-submit-btn" aria-label="Submit search">
                <ArrowRight size={15} />
              </button>
            </form>

            {/* ── LIVE SEARCH RESULTS DROPDOWN ── */}
            {searchFocused && (
              <div className="search-live-dropdown">
                
                {/* 1. When user typed query and has results */}
                {searchQuery.trim() && searchResults.length > 0 && (
                  <div className="search-results-section">
                    <div className="search-results-header">
                      <span>Products ({searchResults.length})</span>
                      <span className="header-hint">Press Enter to view all</span>
                    </div>

                    <div className="search-results-list">
                      {searchResults.slice(0, 5).map((p) => {
                        const img = p.images?.[0] || p.imageUrl;
                        const isAdded = addedItemKey === p._id;
                        return (
                          <div 
                            key={p._id} 
                            className="search-result-item"
                            onClick={() => handleProductSelect(p)}
                          >
                            <div className="result-img-box">
                              {img ? <img src={img} alt={p.name} /> : <span>{p.name[0]}</span>}
                            </div>

                            <div className="result-details">
                              <span className="result-category">{p.category}</span>
                              <h4 className="result-name">{p.name}</h4>
                              <div className="result-meta">
                                <span className="result-price">₹{p.price}</span>
                                {p.badge && <span className="result-badge">{p.badge}</span>}
                              </div>
                            </div>

                            <button 
                              className={`result-add-btn ${isAdded ? 'is-added' : ''}`}
                              onClick={(e) => handleQuickAdd(e, p)}
                              title="Add to Cart"
                              type="button"
                            >
                              {isAdded ? <Check size={13} /> : <Plus size={13} />}
                              <span>{isAdded ? 'Added' : 'Add'}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <Link 
                      href={`/products?search=${encodeURIComponent(searchQuery)}`}
                      className="search-view-all-link"
                      onClick={() => setSearchFocused(false)}
                    >
                      <span>View all {searchResults.length} results for &quot;{searchQuery}&quot;</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                )}

                {/* 2. When query returned 0 results */}
                {searchQuery.trim() && searchResults.length === 0 && (
                  <div className="search-no-results">
                    <p className="no-res-title">No organic products found for &quot;{searchQuery}&quot;</p>
                    <p className="no-res-sub">Try searching for authentic staples like:</p>
                    <div className="search-suggestion-pills">
                      {TRENDING_SEARCHES.map((term) => (
                        <button
                          key={term}
                          type="button"
                          className="suggestion-pill"
                          onClick={() => {
                            setSearchQuery(term);
                          }}
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. When search is focused but empty (Trending Searches) */}
                {!searchQuery.trim() && (
                  <div className="search-trending-section">
                    <div className="trending-header">
                      <TrendingUp size={14} className="trending-icon" />
                      <span>Trending Organic Harvest</span>
                    </div>
                    <div className="trending-chips-grid">
                      {TRENDING_SEARCHES.map((term) => (
                        <button
                          key={term}
                          type="button"
                          className="trending-chip-btn"
                          onClick={() => {
                            setSearchQuery(term);
                          }}
                        >
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Desktop Navigation Links */}
          <div className="navbar-nav-group">
            <Link 
              href="/"
              className="nav-item-btn"
              onClick={(e) => { 
                setMenuOpen(false); 
                if (pathname === '/' || pathname === '/home') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' }); 
                }
              }}
            >
              Home
            </Link>

            <Link 
              href="/products"
              className="nav-item-btn"
              onClick={() => { setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              All Products
            </Link>

            {/* Categories Dropdown */}
            <div 
              className="nav-dropdown-wrapper" 
              ref={catDropRef}
              onMouseEnter={() => setCategoryDropOpen(true)}
              onMouseLeave={() => setCategoryDropOpen(false)}
            >
              <button 
                type="button" 
                className={`nav-item-btn with-arrow ${categoryDropOpen ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCategoryDropOpen(v => !v);
                }}
              >
                <span>Categories</span>
                <ChevronDown size={14} className={`chevron-icon ${categoryDropOpen ? 'rotate' : ''}`} />
              </button>

              {categoryDropOpen && (
                <div className="nav-flyout-menu">
                  <div className="flyout-header">Browse Organic Categories</div>
                  {QUICK_CATEGORIES.map(cat => (
                    <Link
                      key={cat.id}
                      href={cat.id === 'all' ? '/products' : `/products?category=${encodeURIComponent(cat.filter || cat.name)}`}
                      className="flyout-item"
                      onClick={() => {
                        setCategoryDropOpen(false);
                        setMenuOpen(false);
                      }}
                    >
                      <span className="flyout-emoji">{cat.emoji}</span>
                      <span className="flyout-name">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* High-Converting Offer Pill */}
            <Link 
              href="/products"
              className="nav-offer-pill"
              onClick={() => { setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              <Flame size={13} className="flame-icon" />
              <span>Flat 20% OFF</span>
            </Link>
          </div>

          {/* User Actions (Wishlist, Cart, Profile) */}
          <div className="navbar-actions-group">
            
            {/* Wishlist Button */}
            <Link 
              href="/products"
              className="nav-action-icon-btn"
              title="Saved Items"
            >
              <Heart size={19} />
            </Link>

            {/* Cart Button */}
            <button 
              type="button" 
              className="nav-action-cart-btn" 
              onClick={() => setIsCartOpen(true)}
              title="Shopping Cart"
            >
              <div className="cart-icon-wrapper">
                <ShoppingBag size={18} />
                {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
              </div>
              <span className="cart-label-text">Cart</span>
            </button>

            {/* Auth / Account Profile */}
            {isAuthenticated ? (
              <div className="user-profile-menu" ref={dropRef}>
                <button 
                  className="user-profile-btn" 
                  onClick={() => setUserOpen(v => !v)}
                  type="button"
                >
                  <div className="user-avatar-initial">
                    {user?.name?.[0]?.toUpperCase() || <User size={14} />}
                  </div>
                  <span className="user-firstname">{user?.name?.split(' ')[0] || 'Account'}</span>
                  <ChevronDown size={13} />
                </button>

                {userOpen && (
                  <div className="profile-flyout">
                    <div className="flyout-user-header">
                      <div className="flyout-user-avatar">
                        {user?.name?.[0]?.toUpperCase() || 'V'}
                      </div>
                      <div className="flyout-user-info">
                        <p className="user-name-bold">{user?.name || 'Customer'}</p>
                        <p className="user-email-muted">{user?.email || user?.phone}</p>
                        <div className="flyout-patron-badge">
                          <ShieldCheck size={11} />
                          <span>Verified Organic Patron</span>
                        </div>
                      </div>
                    </div>

                    <div className="flyout-divider" />

                    <div className="flyout-links-list">
                      {/* 1. Your Cart */}
                      <Link href="/cart" className="flyout-link-item" onClick={() => setUserOpen(false)}>
                        <div className="flyout-icon-box cart-icon">
                          <ShoppingBag size={16} />
                        </div>
                        <div className="flyout-item-text">
                          <span className="flyout-item-title">Your Cart</span>
                          <span className="flyout-item-sub">Review basket items</span>
                        </div>
                        {cartCount > 0 && <span className="flyout-pill-badge">{cartCount}</span>}
                      </Link>

                      {/* 2. My Orders & Live Tracking */}
                      <Link href="/profile" className="flyout-link-item" onClick={() => setUserOpen(false)}>
                        <div className="flyout-icon-box orders-icon">
                          <Package size={16} />
                        </div>
                        <div className="flyout-item-text">
                          <span className="flyout-item-title">My Orders & Tracking</span>
                          <span className="flyout-item-sub">Track active delivery</span>
                        </div>
                      </Link>

                      {/* 3. Delivery Addresses */}
                      <Link href="/profile" className="flyout-link-item" onClick={() => setUserOpen(false)}>
                        <div className="flyout-icon-box address-icon">
                          <MapPin size={16} />
                        </div>
                        <div className="flyout-item-text">
                          <span className="flyout-item-title">Saved Addresses</span>
                          <span className="flyout-item-sub">Manage shipping places</span>
                        </div>
                      </Link>

                      {/* 4. Personal Profile */}
                      <Link href="/profile" className="flyout-link-item" onClick={() => setUserOpen(false)}>
                        <div className="flyout-icon-box profile-icon">
                          <User size={16} />
                        </div>
                        <div className="flyout-item-text">
                          <span className="flyout-item-title">Account Details</span>
                          <span className="flyout-item-sub">Edit name & mobile</span>
                        </div>
                      </Link>

                      {/* 5. Wishlist */}
                      <Link href="/products" className="flyout-link-item" onClick={() => setUserOpen(false)}>
                        <div className="flyout-icon-box wish-icon">
                          <Heart size={16} />
                        </div>
                        <div className="flyout-item-text">
                          <span className="flyout-item-title">Saved Wishlist</span>
                          <span className="flyout-item-sub">Favorites & bookmarks</span>
                        </div>
                      </Link>

                      {/* Admin Dashboard if applicable */}
                      {(user?.isAdmin || user?.role === 'admin') && (
                        <Link href="/admin" className="flyout-link-item admin-link" onClick={() => setUserOpen(false)}>
                          <div className="flyout-icon-box admin-icon">
                            <ShieldCheck size={16} />
                          </div>
                          <div className="flyout-item-text">
                            <span className="flyout-item-title">Admin Dashboard</span>
                            <span className="flyout-item-sub">Inventory & management</span>
                          </div>
                        </Link>
                      )}
                    </div>

                    <div className="flyout-divider" />

                    <button 
                      onClick={() => { logout(); setUserOpen(false); }} 
                      className="flyout-logout-row"
                      type="button"
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/login"
                className="btn-header-signin" 
                onClick={() => setMenuOpen(false)}
              >
                <User size={15} />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button 
              className="nav-mobile-toggle" 
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Navigation"
              type="button"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

          </div>

        </div>
      </nav>

      {/* ── 3. Mobile Drawer Menu ── */}
      {menuOpen && (
        <div className="mobile-nav-backdrop" onClick={() => setMenuOpen(false)}>
          <div className="mobile-nav-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-panel-header">
              <span className="mobile-brand-title">VENTHULIR</span>
              <button className="mobile-close-btn" onClick={() => setMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Mobile Search */}
            <form className="mobile-search-form" onSubmit={handleSearchSubmit}>
              <Search size={15} className="mobile-search-icon" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Mobile Category List */}
            <div className="mobile-menu-section">
              <span className="mobile-section-label">Quick Shop</span>
              <div className="mobile-category-grid">
                {QUICK_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className="mobile-category-pill"
                    onClick={() => handleCategorySelect(cat)}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Nav Links */}
            <div className="mobile-menu-section">
              <span className="mobile-section-label">Navigation</span>
              <button className="mobile-nav-row" onClick={() => navigateToSection('home', '/')}>Home</button>
              <button className="mobile-nav-row" onClick={() => { setMenuOpen(false); router.push('/products'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>All Products</button>
              <button className="mobile-nav-row" onClick={() => navigateToSection('story', '/#story')}>Our Story</button>
              <button className="mobile-nav-row" onClick={() => navigateToSection('reviews', '/#reviews')}>Customer Reviews</button>
              <button className="mobile-nav-row" onClick={() => navigateToSection('faq', '/#faq')}>Help & Contact</button>
            </div>

            {/* Mobile Auth Button */}
            <div className="mobile-panel-footer">
              {!isAuthenticated ? (
                <Link 
                  href="/login"
                  className="mobile-auth-cta" 
                  onClick={() => setMenuOpen(false)}
                >
                  <User size={16} />
                  <span>Sign In / Register</span>
                </Link>
              ) : (
                <button 
                  className="mobile-auth-cta logout" 
                  onClick={() => { logout(); setMenuOpen(false); }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </header>
  );
}
