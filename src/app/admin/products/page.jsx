'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Boxes,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import ProductFormModal from '../components/ProductFormModal';
import RestockModal from '../components/RestockModal';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStockFilter, setSelectedStockFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [restockProduct, setRestockProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('venthulir_token');
      const params = new URLSearchParams({
        admin: 'true',
        page: currentPage.toString(),
        limit: '15',
        ...(selectedCategory !== 'All' && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm })
      });

      const res = await fetch(`/api/products?${params.toString()}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || (data.products ? data.products.length : 0));
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, selectedCategory, searchTerm]);

  const handleSaveProduct = async (productData, id) => {
    const token = localStorage.getItem('venthulir_token');
    const url = id ? `/api/products/${id}` : '/api/products';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || err.msg || 'Failed to save product');
    }

    fetchProducts();
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product from catalog?')) {
      return;
    }

    try {
      setDeletingId(id);
      const token = localStorage.getItem('venthulir_token');
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchProducts();
      }
    } catch (err) {
      console.error('Delete product failed:', err);
    } finally {
      setDeletingId(null);
    }
  };

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
      fetchProducts();
    }
  };

  // Client-side stock filtering
  const filteredProducts = products.filter((p) => {
    const stock = Number(p.currentStock) || 0;
    if (selectedStockFilter === 'InStock') return stock > 10;
    if (selectedStockFilter === 'LowStock') return stock > 0 && stock <= 10;
    if (selectedStockFilter === 'OutOfStock') return stock === 0;
    return true;
  });

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#15221b' }}>
            Heritage Harvest Catalog
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Manage organic products, variants, SKUs, and warehouse stock levels
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="admin-btn admin-btn-secondary"
            onClick={fetchProducts}
            title="Refresh Catalog"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            className="admin-btn admin-btn-primary"
            onClick={() => {
              setEditingProduct(null);
              setModalOpen(true);
            }}
          >
            <Plus size={15} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-card" style={{ padding: '14px 18px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#788c81' }} />
            <input
              type="text"
              placeholder="Search by product name, SKU (e.g. VNT-123456)..."
              className="admin-input"
              style={{ paddingLeft: '34px' }}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Category Dropdown */}
          <div style={{ width: '180px' }}>
            <select
              className="admin-select"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Categories</option>
              <option value="Spices">Spices</option>
              <option value="Essential Oils">Essential Oils</option>
              <option value="Oils">Cold-Pressed Oils</option>
              <option value="Health & Skin Care">Health & Skin Care</option>
              <option value="Wellness Products">Wellness Products</option>
              <option value="General">General</option>
            </select>
          </div>

          {/* Stock Filter */}
          <div style={{ width: '160px' }}>
            <select
              className="admin-select"
              value={selectedStockFilter}
              onChange={(e) => setSelectedStockFilter(e.target.value)}
            >
              <option value="All">All Stock Levels</option>
              <option value="InStock">In Stock (&gt;10)</option>
              <option value="LowStock">Low Stock (1-10)</option>
              <option value="OutOfStock">Out of Stock (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-container" style={{ border: 'none' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Selling Price</th>
                <th>MRP / Disc</th>
                <th>Stock Units</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod) => {
                const stock = Number(prod.currentStock) || 0;
                let stockBadge = <span className="admin-badge in-stock"><CheckCircle2 size={11} /> {stock} Units</span>;
                if (stock === 0) {
                  stockBadge = <span className="admin-badge out-of-stock"><XCircle size={11} /> 0 (Out of Stock)</span>;
                } else if (stock <= 10) {
                  stockBadge = <span className="admin-badge low-stock"><AlertTriangle size={11} /> {stock} (Low)</span>;
                }

                return (
                  <tr key={prod._id || prod.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={prod.imageUrl || (prod.images && prod.images[0]) || '/assets/hero/turmeric.png'}
                          alt={prod.name}
                          style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e6e1d6' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#15221b' }}>{prod.name}</div>
                          {prod.badge && (
                            <span className="admin-badge gold" style={{ fontSize: '10px', marginTop: '2px' }}>
                              {prod.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: '12px', background: '#faf8f5', padding: '3px 6px', borderRadius: '4px', border: '1px solid #e6e1d6', fontWeight: 600 }}>
                        {prod.productCode || 'VNT-PROD'}
                      </code>
                    </td>
                    <td>{prod.category || 'General'}</td>
                    <td style={{ fontWeight: 700, color: '#0b3d2e' }}>₹{prod.price}</td>
                    <td>
                      {prod.originalPrice ? (
                        <div style={{ fontSize: '12px' }}>
                          <span style={{ textDecoration: 'line-through', color: '#64748b' }}>₹{prod.originalPrice}</span>
                          {prod.discountPercent ? <span style={{ color: '#15803d', marginLeft: '4px', fontWeight: 600 }}>({prod.discountPercent}%)</span> : null}
                        </div>
                      ) : (
                        <span style={{ color: '#64748b' }}>—</span>
                      )}
                    </td>
                    <td>{stockBadge}</td>
                    <td>
                      <span className={`admin-badge ${stock > 0 ? 'success' : 'danger'}`}>
                        {stock > 0 ? 'ACTIVE' : 'DEPLETED'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => setRestockProduct(prod)}
                          title="Restock Stock"
                        >
                          <Boxes size={13} />
                        </button>
                        <button
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          onClick={() => {
                            setEditingProduct(prod);
                            setModalOpen(true);
                          }}
                          title="Edit Product"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          onClick={() => handleDeleteProduct(prod._id || prod.id)}
                          disabled={deletingId === (prod._id || prod.id)}
                          title="Delete Product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: '#0b3d2e' }} />
                    <span style={{ color: '#64748b' }}>Loading catalog...</span>
                  </td>
                </tr>
              )}

              {!loading && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No products found matching your search and filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid #e6e1d6', background: '#faf8f5', fontSize: '13px' }}>
          <div style={{ color: '#64748b' }}>
            Showing <strong>{filteredProducts.length}</strong> of <strong>{totalItems}</strong> items
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage <= 1 || loading}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <span style={{ fontWeight: 600 }}>Page {currentPage} of {totalPages}</span>
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages || loading}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}

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
