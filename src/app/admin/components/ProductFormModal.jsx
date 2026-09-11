'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Package,
  Layers,
  Image as ImageIcon,
  DollarSign,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function ProductFormModal({
  product,
  onClose,
  onSave
}) {
  const isEdit = Boolean(product && (product._id || product.id));
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    productCode: '',
    category: 'Spices',
    badge: '',
    price: '',
    originalPrice: '',
    discountPercent: '',
    description: '',
    hsnSac: '',
    initialStock: 50,
    currentStock: 50,
    shippingCharge: 0,
    imageUrl: '',
    images: [],
    variants: [],
    comboContents: []
  });

  const [newImageInput, setNewImageInput] = useState('');
  const [newVariant, setNewVariant] = useState({ label: '', price: '', contents: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        productCode: product.productCode || '',
        category: product.category || 'Spices',
        badge: product.badge || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        discountPercent: product.discountPercent || '',
        description: product.description || '',
        hsnSac: product.hsnSac || '',
        initialStock: product.initialStock !== undefined ? product.initialStock : 50,
        currentStock: product.currentStock !== undefined ? product.currentStock : 50,
        shippingCharge: product.shippingCharge || 0,
        imageUrl: product.imageUrl || (product.images && product.images[0]) || '',
        images: product.images && product.images.length > 0 ? product.images : (product.imageUrl ? [product.imageUrl] : []),
        variants: product.variants || [],
        comboContents: product.comboContents || []
      });
    }
  }, [product]);

  // Handle dynamic pricing auto-calculation
  const handlePriceChange = (val, field) => {
    const next = { ...formData, [field]: val };
    const p = parseFloat(field === 'price' ? val : next.price);
    const orig = parseFloat(field === 'originalPrice' ? val : next.originalPrice);

    if (p && orig && orig > p) {
      next.discountPercent = Math.round(((orig - p) / orig) * 100);
    } else if (p && orig && p >= orig) {
      next.discountPercent = 0;
    }

    setFormData(next);
  };

  const [uploadingImg, setUploadingImg] = useState(false);

  // Direct File Upload Handler (Uploads file to /api/upload, returns optimized static URL)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 10MB limit. Please choose a smaller photo.');
      return;
    }

    try {
      setUploadingImg(true);
      setErrorMsg('');
      const token = localStorage.getItem('venthulir_token');
      const uploadData = new FormData();
      uploadData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: uploadData
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to upload image');
      }

      const cleanUrl = data.url;
      const updated = [...formData.images, cleanUrl];
      setFormData({
        ...formData,
        images: updated,
        imageUrl: formData.imageUrl || cleanUrl
      });
    } catch (err) {
      console.error('File upload error:', err);
      setErrorMsg(err.message || 'Error uploading image to server');
    } finally {
      setUploadingImg(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add Image URL
  const handleAddImage = () => {
    if (!newImageInput.trim()) return;
    const url = newImageInput.trim();
    const updated = [...formData.images, url];
    setFormData({
      ...formData,
      images: updated,
      imageUrl: formData.imageUrl || url
    });
    setNewImageInput('');
  };

  const handleRemoveImage = (index) => {
    const updated = formData.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: updated,
      imageUrl: updated[0] || ''
    });
  };

  // Add Variant
  const handleAddVariant = () => {
    if (!newVariant.label.trim() || !newVariant.price) return;
    setFormData({
      ...formData,
      variants: [...formData.variants, {
        label: newVariant.label.trim(),
        price: parseFloat(newVariant.price),
        contents: newVariant.contents.trim()
      }]
    });
    setNewVariant({ label: '', price: '', contents: '' });
  };

  const handleRemoveVariant = (index) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim() || !formData.price || !formData.description.trim()) {
      setErrorMsg('Product name, price, and description are required fields.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        discountPercent: formData.discountPercent ? parseFloat(formData.discountPercent) : null,
        initialStock: parseInt(formData.initialStock, 10) || 0,
        currentStock: isEdit ? (parseInt(formData.currentStock, 10) || 0) : (parseInt(formData.initialStock, 10) || 0),
        shippingCharge: parseFloat(formData.shippingCharge) || 0,
        imageUrl: formData.images[0] || formData.imageUrl || '/assets/hero/turmeric.png'
      };

      await onSave(payload, product?._id || product?.id);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="adm-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#edfcf2', color: '#0f3d2a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#0f172a' }}>
                {isEdit ? `Edit Product: ${formData.name || 'Harvest Item'}` : 'Create New Organic Product'}
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                Fill in product details, imagery, pricing, and stock
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="adm-modal-body">
          {errorMsg && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '10px 14px', borderRadius: '8px', color: '#991b1b', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Core Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '16px' }}>
            <div className="adm-form-group" style={{ margin: 0 }}>
              <label className="adm-form-label">Product Name *</label>
              <input
                type="text"
                className="adm-form-input"
                placeholder="e.g. Traditional Cold Pressed Sesame Oil"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="adm-form-group" style={{ margin: 0 }}>
              <label className="adm-form-label">Category *</label>
              <select
                className="adm-form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Spices">Spices & Heritage Masalas</option>
                <option value="Essential Oils">Essential Oils</option>
                <option value="Oils">Cold-Pressed Heritage Oils</option>
                <option value="Health & Skin Care">Health & Skin Care</option>
                <option value="Wellness Products">Wellness Products</option>
                <option value="General">General Harvest</option>
              </select>
            </div>

            <div className="adm-form-group" style={{ margin: 0 }}>
              <label className="adm-form-label">Promotional Badge</label>
              <select
                className="adm-form-select"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              >
                <option value="">No Badge</option>
                <option value="Best Seller">Best Seller</option>
                <option value="Pure">Pure & Authentic</option>
                <option value="Organic">100% Organic</option>
                <option value="New Arrival">New Arrival</option>
                <option value="Premium">Premium Reserve</option>
                <option value="Limited Offer">Limited Offer</option>
              </select>
            </div>

            <div className="adm-form-group" style={{ margin: 0 }}>
              <label className="adm-form-label">HSN / SAC Code</label>
              <input
                type="text"
                className="adm-form-input"
                placeholder="e.g. 15155091"
                value={formData.hsnSac}
                onChange={(e) => setFormData({ ...formData, hsnSac: e.target.value })}
              />
            </div>
          </div>

          {/* Pricing & Stock Card */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f3d2a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DollarSign size={15} /> Pricing, Logistics & Inventory
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <div>
                <label className="adm-form-label">Selling Price (₹) *</label>
                <input
                  type="number"
                  className="adm-form-input"
                  placeholder="249"
                  value={formData.price}
                  onChange={(e) => handlePriceChange(e.target.value, 'price')}
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="adm-form-label">Original MRP (₹)</label>
                <input
                  type="number"
                  className="adm-form-input"
                  placeholder="299"
                  value={formData.originalPrice}
                  onChange={(e) => handlePriceChange(e.target.value, 'originalPrice')}
                  min="0"
                />
              </div>

              <div>
                <label className="adm-form-label">Discount %</label>
                <input
                  type="number"
                  className="adm-form-input"
                  placeholder="15"
                  value={formData.discountPercent}
                  onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="adm-form-label">Stock (Units)</label>
                <input
                  type="number"
                  className="adm-form-input"
                  placeholder="50"
                  value={isEdit ? formData.currentStock : formData.initialStock}
                  onChange={(e) => setFormData({ ...formData, [isEdit ? 'currentStock' : 'initialStock']: e.target.value })}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="adm-form-group">
            <label className="adm-form-label">Product Description *</label>
            <textarea
              className="adm-form-textarea"
              rows={3}
              placeholder="Describe origin, harvest method, health benefits..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          {/* Direct Image Upload & Gallery */}
          <div className="adm-form-group">
            <label className="adm-form-label">Product Photos & Image Assets</label>
            
            {/* Direct File Selector */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />

            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <button
                type="button"
                className="adm-btn-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImg}
                style={{ fontSize: '13px', padding: '8px 14px', opacity: uploadingImg ? 0.7 : 1 }}
              >
                {uploadingImg ? <Loader2 size={15} className="spin" /> : <Upload size={15} />}
                <span>{uploadingImg ? 'Uploading...' : 'Upload From Computer'}</span>
              </button>

              <div style={{ display: 'flex', flex: 1, gap: '6px' }}>
                <input
                  type="text"
                  className="adm-form-input"
                  placeholder="Or paste image URL (/assets/hero/oil.png)..."
                  value={newImageInput}
                  onChange={(e) => setNewImageInput(e.target.value)}
                />
                <button
                  type="button"
                  className="adm-btn-secondary"
                  onClick={handleAddImage}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Plus size={14} /> Add URL
                </button>
              </div>
            </div>

            {formData.images.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '10px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                {formData.images.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '76px', height: '76px', borderRadius: '8px', overflow: 'hidden', border: idx === 0 ? '2px solid #0f3d2a' : '1px solid #cbd5e1' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      style={{ position: 'absolute', top: '3px', right: '3px', background: 'rgba(220,38,38,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <X size={10} />
                    </button>
                    {idx === 0 && (
                      <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#0f3d2a', color: '#fff', fontSize: '8.5px', textAlign: 'center', fontWeight: 800, padding: '1px 0' }}>PRIMARY</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Multi-Weight Variants Builder */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f3d2a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={15} /> Multi-Weight Pricing Variants (Optional)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                className="adm-form-input"
                placeholder="Variant (e.g. 500ml / 1kg)"
                value={newVariant.label}
                onChange={(e) => setNewVariant({ ...newVariant, label: e.target.value })}
              />
              <input
                type="number"
                className="adm-form-input"
                placeholder="Price (₹)"
                value={newVariant.price}
                onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
              />
              <input
                type="text"
                className="adm-form-input"
                placeholder="Details"
                value={newVariant.contents}
                onChange={(e) => setNewVariant({ ...newVariant, contents: e.target.value })}
              />
              <button
                type="button"
                className="adm-btn-secondary"
                onClick={handleAddVariant}
              >
                <Plus size={14} />
              </button>
            </div>

            {formData.variants.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {formData.variants.map((v, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}>
                    <span><strong>{v.label}</strong> — ₹{v.price} {v.contents ? `(${v.contents})` : ''}</span>
                    <button type="button" onClick={() => handleRemoveVariant(idx)} style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '2px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        <div className="adm-modal-footer">
          <button type="button" className="adm-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="adm-btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <Loader2 size={15} className="spin" /> : <CheckCircle2 size={15} />}
            <span>{isEdit ? 'Save Changes' : 'Publish Product'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
