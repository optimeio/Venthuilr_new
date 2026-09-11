'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function OfferFormModal({
  offer,
  onClose,
  onSave
}) {
  const isEdit = Boolean(offer && (offer._id || offer.id));

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    offerPrice: '',
    mrpIllusion: '',
    discountPercent: '',
    category: 'General',
    badge: 'Limited Offer',
    condition: 'First 50 customers only allowed',
    stock: 50,
    rating: 5.0,
    startDate: '',
    endDate: '',
    imageUrl: '',
    isActive: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (offer) {
      setFormData({
        name: offer.name || '',
        description: offer.description || '',
        price: offer.price || '',
        offerPrice: offer.offerPrice || '',
        mrpIllusion: offer.mrpIllusion || '',
        discountPercent: offer.discountPercent || '',
        category: offer.category || 'General',
        badge: offer.badge || 'Limited Offer',
        condition: offer.condition || 'First 50 customers only allowed',
        stock: offer.stock || 50,
        rating: offer.rating || 5.0,
        startDate: offer.startDate ? new Date(offer.startDate).toISOString().split('T')[0] : '',
        endDate: offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : '',
        imageUrl: offer.imageUrl || (offer.images && offer.images[0]) || '',
        isActive: offer.isActive !== undefined ? offer.isActive : true
      });
    } else {
      const today = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 14);
      setFormData(prev => ({
        ...prev,
        startDate: today.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      }));
    }
  }, [offer]);

  const handlePriceChange = (val, field) => {
    const next = { ...formData, [field]: val };
    const p = parseFloat(field === 'price' ? val : next.price);
    const op = parseFloat(field === 'offerPrice' ? val : next.offerPrice);

    if (p && op && p > op) {
      next.discountPercent = Math.round(((p - op) / p) * 100);
    }
    setFormData(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim() || !formData.price || !formData.offerPrice || !formData.startDate || !formData.endDate) {
      setErrorMsg('Name, regular price, offer price, start and end dates are required.');
      return;
    }

    try {
      setSubmitting(true);
      await onSave({
        ...formData,
        price: parseFloat(formData.price),
        offerPrice: parseFloat(formData.offerPrice),
        mrpIllusion: formData.mrpIllusion ? parseFloat(formData.mrpIllusion) : parseFloat(formData.price),
        discountPercent: formData.discountPercent ? parseFloat(formData.discountPercent) : 0,
        stock: parseInt(formData.stock, 10) || 50,
        imageUrl: formData.imageUrl || '/assets/hero/turmeric.png',
        images: formData.imageUrl ? [formData.imageUrl] : []
      }, offer?._id || offer?.id);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save offer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#c59b27" />
            <h3>{isEdit ? `Edit Campaign: ${formData.name}` : 'Create Marketing Campaign Offer'}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-body">
          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px', color: '#dc2626', marginBottom: '14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Offer Campaign Title *
              </label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. Traditional Cold-Pressed Trio Festival Pack"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Promotional Badge
              </label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. Mega Deal / 30% OFF"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Original Price (₹) *
              </label>
              <input
                type="number"
                className="admin-input"
                placeholder="799"
                value={formData.price}
                onChange={(e) => handlePriceChange(e.target.value, 'price')}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Offer Price (₹) *
              </label>
              <input
                type="number"
                className="admin-input"
                placeholder="549"
                value={formData.offerPrice}
                onChange={(e) => handlePriceChange(e.target.value, 'offerPrice')}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Discount %
              </label>
              <input
                type="number"
                className="admin-input"
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Stock Units
              </label>
              <input
                type="number"
                className="admin-input"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Campaign Start Date *
              </label>
              <input
                type="date"
                className="admin-input"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Campaign End Date *
              </label>
              <input
                type="date"
                className="admin-input"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Offer Banner / Image URL
            </label>
            <input
              type="text"
              className="admin-input"
              placeholder="/assets/hero/oil_coconut.png"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Campaign Description / Highlights
            </label>
            <textarea
              className="admin-textarea"
              rows={2}
              placeholder="Freshly cold-pressed batch from Pollachi farm..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </form>

        <div className="admin-modal-footer">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            <span>{isEdit ? 'Update Campaign' : 'Launch Campaign'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
