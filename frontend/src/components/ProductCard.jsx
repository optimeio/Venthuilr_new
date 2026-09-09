import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Eye, Star, Check, Heart, ArrowRight } from 'lucide-react';
import './ProductCard.css';

export default function ProductCard({ product, onQuickView, onBuyNow }) {
  const { addToCart, setIsCartOpen } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0] || null);
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);

  if (!product) return null;

  const price = selectedVariant?.price ?? product.price ?? 0;
  const originalPrice = Math.round(price * 1.25);
  const savings = originalPrice - price;
  const imageUrl = product.images?.[0] || product.imageUrl;
  const hasVariants = product.variants?.length > 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    addToCart(product, selectedVariant);
    setIsCartOpen(false);
    if (onBuyNow) {
      onBuyNow(product, selectedVariant);
    } else {
      const checkoutBtn = document.querySelector('.checkout-cta') || document.querySelector('.btn-checkout');
      if (checkoutBtn) checkoutBtn.click();
    }
  };

  const toggleWishlist = (e) => {
    e.stopPropagation();
    setLiked(!liked);
  };

  return (
    <div className="product-card" onClick={() => onQuickView && onQuickView(product)}>
      
      {/* ── Top Visual Stage / Image Container ── */}
      <div className="product-card-media">
        
        {/* Top Floating Badges */}
        <div className="product-media-tags">
          <span className="organic-tag">
            {product.badge || '100% Organic'}
          </span>
          <span className="discount-tag">20% OFF</span>
        </div>

        {/* Wishlist Floating Button */}
        <button 
          className={`wishlist-toggle-btn ${liked ? 'is-liked' : ''}`}
          onClick={toggleWishlist}
          title="Save to Wishlist"
          type="button"
          aria-label="Wishlist"
        >
          <Heart size={15} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : '#274834'} />
        </button>

        {/* Large Product Pouch Image */}
        <div className="product-img-box">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="product-img" loading="lazy" />
          ) : (
            <div className="product-fallback-avatar">
              <span>{product.name?.[0] || 'V'}</span>
            </div>
          )}
        </div>

        {/* Quick View Button on Hover */}
        {onQuickView && (
          <button 
            className="quick-view-action" 
            onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            aria-label="Quick View"
            type="button"
          >
            <Eye size={13} />
            <span>Quick View</span>
          </button>
        )}
      </div>

      {/* ── Product Card Body ── */}
      <div className="product-card-info">
        
        {/* Category & Rating Row */}
        <div className="product-info-meta">
          <span className="product-category-text">
            {product.category || 'Farm Harvest'}
          </span>

          <div className="product-rating-box">
            <Star size={12} fill="#eab308" color="#eab308" />
            <span className="rating-num">4.9</span>
            <span className="rating-total">(24)</span>
          </div>
        </div>

        {/* Product Title */}
        <h3 className="product-title-heading" title={product.name}>
          {product.name}
        </h3>

        {/* Variant Weight Selector */}
        {hasVariants && (
          <div className="product-variant-group">
            {product.variants.map((v) => {
              const isSelected = selectedVariant?.label === v.label;
              return (
                <button
                  key={v.label}
                  className={`variant-option-btn ${isSelected ? 'active' : ''}`}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setSelectedVariant(v); 
                  }}
                  type="button"
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Price & Savings Display */}
        <div className="product-pricing-box">
          <div className="price-tag-group">
            <span className="current-price">₹{price}</span>
            <span className="strike-price">₹{originalPrice}</span>
          </div>
          <span className="savings-badge">Save ₹{savings}</span>
        </div>

        {/* Clean Real-Time Action Buttons (NO TACKY LIGHTNING BOLT) */}
        <div className="product-button-cluster">
          <button 
            className={`btn-add-cart ${added ? 'added-state' : ''}`} 
            onClick={handleAdd}
            type="button"
            title="Add to Cart"
          >
            {added ? (
              <>
                <Check size={14} />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag size={14} />
                <span>Add</span>
              </>
            )}
          </button>

          <button 
            className="btn-buy-instant" 
            onClick={handleBuyNow}
            type="button"
          >
            <span>Buy Now</span>
            <ArrowRight size={13} className="btn-arrow" />
          </button>
        </div>

      </div>
    </div>
  );
}
