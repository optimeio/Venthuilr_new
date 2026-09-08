import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Eye, Star, Zap } from 'lucide-react';
import './ProductCard.css';

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const [added, setAdded] = useState(false);

  const price      = selectedVariant?.price ?? product.price;
  const imageUrl   = product.images?.[0] || product.imageUrl;
  const hasVariants = product.variants?.length > 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product, selectedVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="product-card" onClick={() => onQuickView(product)}>
      {/* Image */}
      <div className="product-card-img">
        {imageUrl
          ? <img src={imageUrl} alt={product.name} loading="lazy" />
          : <div className="product-img-placeholder"><span>{product.name[0]}</span></div>
        }
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <button className="quick-view-btn" onClick={(e) => { e.stopPropagation(); onQuickView(product); }}>
          <Eye size={15} /> Quick View
        </button>
      </div>

      {/* Info */}
      <div className="product-card-body">
        <p className="product-category">{product.category}</p>
        <h3 className="product-name">{product.name}</h3>

        {/* Stars */}
        <div className="product-stars">
          {[1,2,3,4,5].map(n => <Star key={n} size={12} fill={n<=4?'#c9a84c':'none'} stroke="#c9a84c" strokeWidth={1.5} />)}
          <span className="star-count">(24)</span>
        </div>

        {/* Variants */}
        {hasVariants && (
          <div className="variant-pills">
            {product.variants.map(v => (
              <button
                key={v.label}
                className={`variant-pill${selectedVariant?.label === v.label ? ' active' : ''}`}
                onClick={(e) => { e.stopPropagation(); setSelectedVariant(v); }}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="product-card-footer">
          <span className="product-price">₹{price}</span>
          <button className={`add-cart-btn${added ? ' added' : ''}`} onClick={handleAdd}>
            {added ? <><Zap size={14} /> Added!</> : <><ShoppingCart size={14} /> Add</>}
          </button>
        </div>
      </div>
    </div>
  );
}
