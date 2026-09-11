'use client';

import React, { useState } from 'react';
import {
  X,
  Printer,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Tag,
  Loader2
} from 'lucide-react';

export default function OrderDetailModal({
  order,
  onClose,
  onStatusUpdate,
  onStatusChange
}) {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!order) return null;

  const currentStatus = order.status || order.orderStatus || 'Pending';

  const handleUpdateStatus = async (newStatus, isCancel = false) => {
    if (isCancel && !window.confirm('Are you sure you want to cancel this order? This will restore product inventory back to warehouse.')) {
      return;
    }

    const handler = onStatusUpdate || onStatusChange;
    if (!handler) return;

    try {
      setUpdatingStatus(true);
      await handler(order._id || order.orderId, newStatus, isCancel);
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (st) => {
    const s = (st || 'pending').toLowerCase();
    switch (s) {
      case 'delivered': return <span className="adm-status-badge delivered"><CheckCircle2 size={12} /> Delivered</span>;
      case 'shipped': return <span className="adm-status-badge shipped"><Truck size={12} /> Shipped</span>;
      case 'confirmed':
      case 'processing': return <span className="adm-status-badge confirmed"><Package size={12} /> Confirmed</span>;
      case 'cancelled':
      case 'returned': return <span className="adm-status-badge cancelled"><XCircle size={12} /> {st}</span>;
      default: return <span className="adm-status-badge pending"><Clock size={12} /> Pending</span>;
    }
  };

  const items = order.items || order.orderItems || [];
  const total = order.totalAmount || order.amount || order.pricing?.finalTotal || 0;
  const orderId = order.orderId || order._id?.slice(-8).toUpperCase();

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        {/* Header */}
        <div className="adm-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Order Inspector</div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#0f172a', fontFamily: 'monospace' }}>
                #{orderId}
              </h3>
            </div>
            <div>{getStatusBadge(currentStatus)}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="adm-btn-secondary"
              onClick={handlePrint}
              style={{ padding: '6px 12px', fontSize: '12px' }}
              title="Print Order Invoice"
            >
              <Printer size={13} />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="adm-modal-body">
          {/* Status Workflow Progress Bar */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, marginBottom: '10px', color: '#0f172a' }}>
              Quick Status Action Controls
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`adm-btn-secondary ${currentStatus.toLowerCase() === 'pending' ? 'active' : ''}`}
                style={{ padding: '6px 12px', fontSize: '12px', background: currentStatus.toLowerCase() === 'pending' ? '#0f3d2a' : '#ffffff', color: currentStatus.toLowerCase() === 'pending' ? '#ffffff' : '#334155' }}
                onClick={() => handleUpdateStatus('Pending')}
                disabled={updatingStatus || currentStatus.toLowerCase() === 'cancelled'}
              >
                1. Pending
              </button>

              <button
                type="button"
                className={`adm-btn-secondary`}
                style={{ padding: '6px 12px', fontSize: '12px', background: currentStatus.toLowerCase() === 'confirmed' ? '#0f3d2a' : '#ffffff', color: currentStatus.toLowerCase() === 'confirmed' ? '#ffffff' : '#334155' }}
                onClick={() => handleUpdateStatus('Confirmed')}
                disabled={updatingStatus || currentStatus.toLowerCase() === 'cancelled'}
              >
                2. Confirm Order
              </button>

              <button
                type="button"
                className={`adm-btn-secondary`}
                style={{ padding: '6px 12px', fontSize: '12px', background: currentStatus.toLowerCase() === 'shipped' ? '#7c3aed' : '#ffffff', color: currentStatus.toLowerCase() === 'shipped' ? '#ffffff' : '#334155' }}
                onClick={() => handleUpdateStatus('Shipped')}
                disabled={updatingStatus || currentStatus.toLowerCase() === 'cancelled'}
              >
                3. Mark Shipped
              </button>

              <button
                type="button"
                className={`adm-btn-secondary`}
                style={{ padding: '6px 12px', fontSize: '12px', background: currentStatus.toLowerCase() === 'delivered' ? '#16a34a' : '#ffffff', color: currentStatus.toLowerCase() === 'delivered' ? '#ffffff' : '#334155' }}
                onClick={() => handleUpdateStatus('Delivered')}
                disabled={updatingStatus || currentStatus.toLowerCase() === 'cancelled'}
              >
                4. Mark Delivered
              </button>

              {currentStatus.toLowerCase() !== 'cancelled' && (
                <button
                  type="button"
                  style={{ marginLeft: 'auto', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => handleUpdateStatus('Cancelled', true)}
                  disabled={updatingStatus}
                >
                  Cancel Order
                </button>
              )}
            </div>

            {updatingStatus && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '12px', color: '#0f3d2a' }}>
                <Loader2 size={14} className="spin" /> Updating order status...
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {/* Customer Details */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f3d2a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> Customer Information
              </div>
              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontWeight: 700 }}>{order.customerName || order.shippingAddress?.fullName || 'Customer'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                  <Mail size={13} /> {order.customerEmail || 'Registered Member'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                  <Phone size={13} /> {order.phone || order.shippingAddress?.phone || 'Standard Contact'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '11.5px', marginTop: '2px' }}>
                  <Calendar size={12} /> {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : 'Recent'}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f3d2a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} /> Delivery Address
              </div>
              <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                <div>{order.deliveryAddress?.address || order.shippingAddress?.address || 'Standard Address'}</div>
                <div>
                  {[order.deliveryAddress?.city || order.shippingAddress?.city, order.deliveryAddress?.state || order.shippingAddress?.state, order.deliveryAddress?.zipCode || order.shippingAddress?.zipCode].filter(Boolean).join(', ')}
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>
              Purchased Products ({items.length})
            </div>

            <div className="adm-table-wrapper">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={item.image || item.imageUrl || '/assets/hero/turmeric.png'}
                            alt={item.name}
                            style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                            {item.selectedWeight && <div style={{ fontSize: '11px', color: '#64748b' }}>{item.selectedWeight}</div>}
                          </div>
                        </div>
                      </td>
                      <td><strong>x{item.quantity || 1}</strong></td>
                      <td>₹{item.price}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{(Number(item.price) || 0) * (Number(item.quantity) || 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grand Total Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', maxWidth: '300px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: '#0f3d2a' }}>
                <span>Grand Total:</span>
                <span>₹{total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="adm-modal-footer">
          <button type="button" className="adm-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
