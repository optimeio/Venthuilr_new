import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, Loader, CheckCircle, MapPin } from 'lucide-react';
import './CheckoutModal.css';

const API = import.meta.env.VITE_API_URL || '/api';

export default function CheckoutModal({ cartSummary, onClose, onAuthOpen }) {
  const { cartItems, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [step, setStep]     = useState('form');   // form | placing | success
  const [form, setForm]     = useState({
    name:    user?.name    || '',
    email:   user?.email   || '',
    phone:   user?.phone   || '',
    address: user?.deliveryAddress?.address || '',
    city:    user?.deliveryAddress?.city    || '',
    state:   user?.deliveryAddress?.state   || '',
    zipCode: user?.deliveryAddress?.zipCode || '',
  });
  const [error, setError]   = useState('');
  const [orderId, setOrderId] = useState('');

  const { grandTotal, discount, appliedCoupon, shippingFee } = cartSummary;

  const update = (k, v) => { setForm(f => ({...f, [k]: v})); setError(''); };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { onClose(); onAuthOpen(); return; }

    setStep('placing');
    try {
      const token = localStorage.getItem('venthulir_token');
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          customerName:    form.name,
          customerEmail:   form.email,
          customerPhone:   form.phone,
          deliveryAddress: { address: form.address, city: form.city, state: form.state, zipCode: form.zipCode },
          items:           cartItems.map(i => ({ name: i.name, variant: i.variant?.label, price: i.price, quantity: i.quantity })),
          totalAmount:     grandTotal,
          discount,
          coupon:          appliedCoupon?.code,
          shippingFee,
          paymentMethod:   'COD',
        })
      });
      const data = await res.json();
      if (res.ok) {
        setOrderId(data._id || data.orderId || 'VEN' + Date.now());
        clearCart();
        setStep('success');
      } else {
        setError(data.msg || 'Order failed. Please try again.');
        setStep('form');
      }
    } catch {
      setError('Network error. Please try again.');
      setStep('form');
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={step !== 'placing' ? onClose : undefined} />
      <div className="checkout-modal">
        {step !== 'placing' && step !== 'success' && (
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        )}

        {step === 'placing' && (
          <div className="checkout-placing">
            <Loader size={40} className="spin" />
            <p>Placing your order…</p>
          </div>
        )}

        {step === 'success' && (
          <div className="checkout-success">
            <CheckCircle size={56} className="success-icon" />
            <h2>Order Placed!</h2>
            <p>Thank you for your order. We'll send a confirmation to <strong>{form.email}</strong>.</p>
            {orderId && <p className="order-id">Order ID: <strong>{orderId}</strong></p>}
            <button className="btn-primary" onClick={onClose} style={{marginTop:8}}>Continue Shopping</button>
          </div>
        )}

        {step === 'form' && (
          <>
            <h2 className="checkout-title">Complete Your Order</h2>

            <div className="checkout-inner">
              {/* Order summary */}
              <div className="checkout-summary">
                <h3 className="checkout-section-title">Order Summary</h3>
                <div className="checkout-items">
                  {cartItems.map(item => (
                    <div key={item.key} className="checkout-item">
                      <div className="checkout-item-img">
                        {item.image ? <img src={item.image} alt={item.name} /> : <div className="checkout-img-ph" />}
                      </div>
                      <div className="checkout-item-info">
                        <p>{item.name} {item.variant ? `(${item.variant.label})` : ''}</p>
                        <span>₹{item.price} × {item.quantity}</span>
                      </div>
                      <strong>₹{item.price * item.quantity}</strong>
                    </div>
                  ))}
                </div>
                <div className="checkout-totals">
                  {discount > 0 && <div className="co-total-row"><span>Discount ({appliedCoupon?.code})</span><span className="discount">−₹{discount}</span></div>}
                  <div className="co-total-row"><span>Shipping</span><span>{shippingFee === 0 ? <span className="free">FREE</span> : `₹${shippingFee}`}</span></div>
                  <div className="co-total-row grand"><span>Total</span><strong>₹{grandTotal}</strong></div>
                </div>
                <div className="payment-badge"><span>💵 Cash on Delivery</span></div>
              </div>

              {/* Delivery form */}
              <form className="checkout-form" onSubmit={placeOrder}>
                <h3 className="checkout-section-title"><MapPin size={16} /> Delivery Details</h3>
                <div className="form-2col">
                  <div className="co-field"><label>Full Name</label><input required placeholder="Name" value={form.name} onChange={e=>update('name',e.target.value)} /></div>
                  <div className="co-field"><label>Phone</label><input required placeholder="+91" value={form.phone} onChange={e=>update('phone',e.target.value)} /></div>
                </div>
                <div className="co-field"><label>Email</label><input required type="email" placeholder="Email" value={form.email} onChange={e=>update('email',e.target.value)} /></div>
                <div className="co-field"><label>Street Address</label><input required placeholder="House No., Street…" value={form.address} onChange={e=>update('address',e.target.value)} /></div>
                <div className="form-3col">
                  <div className="co-field"><label>City</label><input required placeholder="City" value={form.city} onChange={e=>update('city',e.target.value)} /></div>
                  <div className="co-field"><label>State</label><input required placeholder="State" value={form.state} onChange={e=>update('state',e.target.value)} /></div>
                  <div className="co-field"><label>PIN Code</label><input required placeholder="600001" value={form.zipCode} onChange={e=>update('zipCode',e.target.value)} /></div>
                </div>
                {error && <p className="co-error">{error}</p>}
                <button type="submit" className="btn-primary co-submit">
                  Place Order · ₹{grandTotal}
                </button>
                {!isAuthenticated && <p className="co-auth-note">You'll be asked to sign in before placing the order.</p>}
              </form>
            </div>
          </>
        )}
      </div>
    </>
  );
}
