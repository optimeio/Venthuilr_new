'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  RefreshCw,
  TrendingDown,
  Loader2
} from 'lucide-react';
import RestockModal from '../components/RestockModal';
import StatCard from '../components/StatCard';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All'); // 'All', 'LowStock', 'OutOfStock'
  const [searchTerm, setSearchTerm] = useState('');
  const [restockProduct, setRestockProduct] = useState(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('venthulir_token');
      const res = await fetch('/api/products?admin=true&limit=100', {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleRestock = async (productId, newStock) => {
    const token = localStorage.getItem('venthulir_token');
    const res = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ currentStock: newStock })
    });

    if (res.ok) {
      fetchInventory();
    }
  };

  // Inventory computations
  const totalStockUnits = products.reduce((acc, p) => acc + (Number(p.currentStock) || 0), 0);
  const lowStockProducts = products.filter(p => (Number(p.currentStock) || 0) > 0 && (Number(p.currentStock) || 0) <= 10);
  const outOfStockProducts = products.filter(p => (Number(p.currentStock) || 0) === 0);
  const healthyProducts = products.filter(p => (Number(p.currentStock) || 0) > 10);

  // Filter products
  const filtered = products.filter((p) => {
    const stock = Number(p.currentStock) || 0;
    const matchSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.productCode || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;
    if (activeFilter === 'LowStock') return stock > 0 && stock <= 10;
    if (activeFilter === 'OutOfStock') return stock === 0;
    if (activeFilter === 'Healthy') return stock > 10;
    return true;
  });

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#15221b' }}>
            Warehouse Inventory & Stock Control
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Real-time warehouse supply, stock replenishment, and depletion metrics
          </p>
        </div>

        <button
          className="admin-btn admin-btn-secondary"
          onClick={fetchInventory}
          title="Refresh Inventory"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Stock</span>
        </button>
      </div>

      {/* Inventory KPI Grid */}
      <div className="admin-stats-grid">
        <StatCard
          label="Total Units in Stock"
          value={totalStockUnits.toLocaleString()}
          subtext="Available physical inventory"
          icon={Boxes}
          colorScheme="gold"
        />

        <StatCard
          label="Adequately Stocked"
          value={healthyProducts.length}
          subtext="Stock level > 10 units"
          icon={CheckCircle2}
          colorScheme="green"
          badgeText="HEALTHY"
        />

        <StatCard
          label="Low Stock Alert"
          value={lowStockProducts.length}
          subtext="Critical threshold (1-10 units)"
          icon={AlertTriangle}
          colorScheme="amber"
          badgeText={lowStockProducts.length > 0 ? 'RESTOCK' : 'OK'}
        />

        <StatCard
          label="Out of Stock"
          value={outOfStockProducts.length}
          subtext="Zero inventory available"
          icon={XCircle}
          colorScheme="red"
          badgeText={outOfStockProducts.length > 0 ? 'DEPLETED' : 'NONE'}
        />
      </div>

      {/* Controls & Filter Bar */}
      <div className="admin-card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
          {/* Filter Tabs */}
          <div className="admin-tabs-bar" style={{ margin: 0, padding: 0, border: 'none' }}>
            <button
              className={`admin-tab-btn ${activeFilter === 'All' ? 'active' : ''}`}
              onClick={() => setActiveFilter('All')}
            >
              All Items <span className="admin-tab-count">{products.length}</span>
            </button>

            <button
              className={`admin-tab-btn ${activeFilter === 'LowStock' ? 'active' : ''}`}
              onClick={() => setActiveFilter('LowStock')}
            >
              Low Stock <span className="admin-tab-count">{lowStockProducts.length}</span>
            </button>

            <button
              className={`admin-tab-btn ${activeFilter === 'OutOfStock' ? 'active' : ''}`}
              onClick={() => setActiveFilter('OutOfStock')}
            >
              Out of Stock <span className="admin-tab-count">{outOfStockProducts.length}</span>
            </button>

            <button
              className={`admin-tab-btn ${activeFilter === 'Healthy' ? 'active' : ''}`}
              onClick={() => setActiveFilter('Healthy')}
            >
              Healthy <span className="admin-tab-count">{healthyProducts.length}</span>
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#788c81' }} />
            <input
              type="text"
              placeholder="Search product SKU or name..."
              className="admin-input"
              style={{ paddingLeft: '34px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-container" style={{ border: 'none' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Initial Batch</th>
                <th>Current Stock</th>
                <th>Units Sold</th>
                <th>Stock Health</th>
                <th style={{ textAlign: 'right' }}>Replenish</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((prod) => {
                const initial = Number(prod.initialStock) || 0;
                const current = Number(prod.currentStock) || 0;
                const sold = Math.max(initial - current, 0);

                let healthBadge = <span className="admin-badge in-stock"><CheckCircle2 size={11} /> Optimal ({current})</span>;
                if (current === 0) {
                  healthBadge = <span className="admin-badge out-of-stock"><XCircle size={11} /> Out of Stock</span>;
                } else if (current <= 10) {
                  healthBadge = <span className="admin-badge low-stock"><AlertTriangle size={11} /> Low Stock ({current})</span>;
                }

                return (
                  <tr key={prod._id || prod.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={prod.imageUrl || (prod.images && prod.images[0]) || '/assets/hero/turmeric.png'}
                          alt={prod.name}
                          style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e6e1d6' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#15221b' }}>{prod.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>₹{prod.price} / unit</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: '12px', background: '#faf8f5', padding: '3px 6px', borderRadius: '4px', border: '1px solid #e6e1d6', fontWeight: 600 }}>
                        {prod.productCode || 'VNT-PROD'}
                      </code>
                    </td>
                    <td>{prod.category || 'General'}</td>
                    <td>{initial} Units</td>
                    <td>
                      <strong style={{ fontSize: '15px', color: current <= 5 ? '#dc2626' : current <= 10 ? '#d97706' : '#15803d' }}>
                        {current}
                      </strong>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#4b5d54' }}>{sold} Units</span>
                    </td>
                    <td>{healthBadge}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="admin-btn admin-btn-primary admin-btn-sm"
                        onClick={() => setRestockProduct(prod)}
                      >
                        <Plus size={13} /> Add Stock
                      </button>
                    </td>
                  </tr>
                );
              })}

              {loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: '#0b3d2e' }} />
                    <span style={{ color: '#64748b' }}>Loading warehouse data...</span>
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No products found for this inventory filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockProduct && (
        <RestockModal
          product={restockProduct}
          onClose={() => setRestockProduct(null)}
          onRestock={handleRestock}
        />
      )}
    </div>
  );
}
