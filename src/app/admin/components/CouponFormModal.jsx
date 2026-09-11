'use client';

import React, { useState, useEffect } from 'react';
import { X, Ticket, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function CouponFormModal({
  coupon,
  products = [],
  onClose,
  onSave
}) {
  const isEdit = Boolean(coupon && (coupon._id || coupon.id));

  const [formData, setFormData] = useState({
    couponCode: '',
    discountPercentage: 15,
    maxUses: 50,
    expiryDate: '',
    productId: 'all',
    status: 'Active'
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (coupon) {
      const exp = coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '';
      setFormData({
        couponCode: coupon.couponCode || '',
        discountPercentage: coupon.discountPercentage || 15,
        maxUses: coupon.maxUses || 50,
        expiryDate: exp,
        productId: coupon.productId?._id || coupon.productId || 'all',
        status: coupon.status || 'Active'
      });
    } else {
      // Set default expiry to 30 days from now
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setFormData(prev => ({
        ...prev,
        expiryDate: d.toISOString().split('T')[0]
      }));
    }
  }, [coupon]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.couponCode.trim() || !formData.discountPercentage || !formData.expiryDate) {
      setErrorMsg('Code, discount percentage, and expiry date are required.');
      return;
    }

    try {
      setSubmitting(true);
      await onSave({
        ...formData,
        couponCode: formData.couponCode.trim().toUpperCase(),
        discountPercentage: Number(formData.discountPercentage),
        maxUses: Number(formData.maxUses) || 50,
        productId: formData.productId === 'all' ? null : formData.productId
      }, coupon?._id || coupon?.id);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save coupon');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ticket size={20} color="#c59b27" />
            <h3>{isEdit ? `Edit Coupon: ${formData.couponCode}` : 'Create New Promotional Coupon'}</h3>
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
                Coupon Code *
              </label>
              <input
                type="text"
                className="admin-input"
                placeholder="e.g. HARVEST20"
                value={formData.couponCode}
                onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Discount Percentage (%) *
              </label>
              <input
                type="number"
                className="admin-input"
                placeholder="20"
                min="1"
                max="100"
                value={formData.discountPercentage}
                onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Usage Limit (Max Uses)
              </label>
              <input
                type="number"
                className="admin-input"
                placeholder="50"
                min="1"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Expiration Date *
              </label>
              <input
                type="date"
                className="admin-input"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Applicable Product Scope
              </label>
              <select
                className="admin-select"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              >
                <option value="all">Entire Store Catalog (Global)</option>
                {products.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name} ({p.productCode || 'VNT'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Status
              </label>
              <select
                className="admin-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Active">Active & Usable</option>
                <option value="Inactive">Inactive (Disabled)</option>
              </select>
            </div>
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
            <span>{isEdit ? 'Update Coupon' : 'Create Coupon'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
