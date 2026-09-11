'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, Package, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch('/api/products?admin=true&limit=100');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const CATEGORIES = [
    {
      name: 'Spices',
      displayName: 'Single-Origin Spices & Masalas',
      description: 'Hand-pounded heritage turmeric, black pepper, coriander, and authentic regional spice mixes.',
      image: '/assets/hero/turmeric.png',
      badge: 'Heritage'
    },
    {
      name: 'Essential Oils',
      displayName: 'Pure Steam-Distilled Essential Oils',
      description: 'Therapeutic grade natural aroma oils and essential botanical extracts.',
      image: '/assets/hero/oil_coconut.png',
      badge: 'Therapeutic'
    },
    {
      name: 'Oils',
      displayName: 'Wood Cold-Pressed (Mara Chekku) Oils',
      description: 'Traditional wood-pressed coconut, sesame, and groundnut oils preserving natural antioxidants.',
      image: '/assets/hero/oil_coconut.png',
      badge: 'Cold-Pressed'
    },
    {
      name: 'Health & Skin Care',
      displayName: 'Ayurvedic & Herbal Skin Care',
      description: 'Pure herbal formulations, natural powders, and organic botanical skincare.',
      image: '/assets/hero/turmeric.png',
      badge: '100% Herbal'
    },
    {
      name: 'Wellness Products',
      displayName: 'Natural Wellness & Native Foods',
      description: 'Unprocessed forest honey, herbal teas, and traditional superfoods.',
      image: '/assets/hero/coriander.png',
      badge: 'Wellness'
    },
    {
      name: 'General',
      displayName: 'General Farm Harvest',
      description: 'Seasonal grains, pulses, and assorted artisanal kitchen essentials.',
      image: '/assets/hero/garam_masala.png',
      badge: 'Farm Direct'
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#15221b' }}>
          Categories & Collections
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
          Manage harvest groupings, taxonomy, and category-level stock distribution
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {CATEGORIES.map((cat) => {
          const categoryProducts = products.filter(
            p => (p.category || '').toLowerCase() === cat.name.toLowerCase()
          );
          const totalStock = categoryProducts.reduce((sum, p) => sum + (Number(p.currentStock) || 0), 0);
          const lowStockCount = categoryProducts.filter(p => (Number(p.currentStock) || 0) <= 10).length;

          return (
            <div key={cat.name} className="admin-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <img
                  src={cat.image}
                  alt={cat.name}
                  style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #e6e1d6' }}
                />
                <div>
                  <span className="admin-badge gold" style={{ fontSize: '10px', marginBottom: '4px' }}>
                    {cat.badge}
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '2px 0 0', color: '#15221b' }}>
                    {cat.name}
                  </h3>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#64748b', flex: 1, marginBottom: '16px', lineHeight: 1.5 }}>
                {cat.description}
              </p>

              <div style={{ background: '#faf8f5', padding: '12px', borderRadius: '8px', border: '1px solid #e6e1d6', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px', fontSize: '12px' }}>
                <div>
                  <div style={{ color: '#64748b' }}>Active Products</div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#0b3d2e' }}>
                    {categoryProducts.length} Items
                  </div>
                </div>

                <div>
                  <div style={{ color: '#64748b' }}>Total Stock</div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: lowStockCount > 0 ? '#d97706' : '#15803d' }}>
                    {totalStock} Units
                  </div>
                </div>
              </div>

              <Link
                href={`/admin/products?category=${cat.name}`}
                className="admin-btn admin-btn-secondary"
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <span>View Products in Category</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
