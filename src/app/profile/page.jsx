'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useUIModal } from '@/components/Providers';
import { 
  User, 
  Package, 
  MapPin, 
  LogOut, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle,
  Edit3,
  Save,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  Loader,
  Tag,
  Copy,
  Check,
  Headphones,
  Send,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'react-toastify';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, logout, updateUser } = useAuth();
  const uiModal = useUIModal?.();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'address' | 'profile' | 'coupons' | 'support'
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Coupons state
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');

  // Support inquiry state
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [sendingSupport, setSendingSupport] = useState(false);

  // Address edit state
  const [addressForm, setAddressForm] = useState({
    address: '',
    city: '',
    state: 'Tamil Nadu',
    zipCode: ''
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || ''
      });
      setAddressForm({
        address: user.deliveryAddress?.address || '',
        city: user.deliveryAddress?.city || '',
        state: user.deliveryAddress?.state || 'Tamil Nadu',
        zipCode: user.deliveryAddress?.zipCode || ''
      });
    }
  }, [user]);

  // Fetch real-time user orders
  useEffect(() => {
    const fetchOrders = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('venthulir_token') : null;
      if (!token) {
        setOrdersLoading(false);
        return;
      }
      try {
        setOrdersLoading(true);
        const res = await fetch('/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : []);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('Failed to load user orders:', err);
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    } else {
      setOrdersLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch coupons on active tab
  useEffect(() => {
    if (activeTab === 'coupons' && coupons.length === 0) {
      const fetchCoupons = async () => {
        setCouponsLoading(true);
        try {
          const res = await fetch('/api/coupons');
          if (res.ok) {
            const data = await res.json();
            setCoupons(Array.isArray(data) ? data : []);
          }
        } catch {
          setCoupons([]);
        } finally {
          setCouponsLoading(false);
        }
      };
      fetchCoupons();
    }
  }, [activeTab, coupons.length]);

  // Handle Save Address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const token = typeof window !== 'undefined' ? localStorage.getItem('venthulir_token') : null;
    if (!token) return;

    setSavingAddress(true);
    try {
      const res = await fetch('/api/auth/address', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(addressForm)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Delivery address saved successfully!');
        if (updateUser) {
          updateUser({ deliveryAddress: data.deliveryAddress });
        }
      } else {
        toast.error(data.msg || 'Failed to update address.');
      }
    } catch {
      toast.error('Network error updating address.');
    } finally {
      setSavingAddress(false);
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const token = typeof window !== 'undefined' ? localStorage.getItem('venthulir_token') : null;
    if (!token) return;

    setSavingProfile(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Account profile updated successfully!');
        if (updateUser) {
          updateUser(data.user);
        }
      } else {
        toast.error(data.msg || 'Failed to update profile.');
      }
    } catch {
      toast.error('Network error updating profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Cancel Order
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('venthulir_token') : null;
    if (!token) return;

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'cancel' })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Order cancelled successfully.');
        setOrders(prev => prev.map(o => ((o._id === orderId || o.orderId === orderId) ? { ...o, status: 'Cancelled' } : o)));
      } else {
        toast.error(data.error || data.msg || 'Unable to cancel order.');
      }
    } catch {
      toast.error('Network error cancelling order.');
    }
  };

  // Copy Coupon Code
  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(''), 3000);
  };

  // Handle Support Message Submit
  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    setSendingSupport(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.name || 'Venthulir Patron',
          email: user?.email || '',
          phone: user?.phone || '',
          subject: supportSubject || 'Patron Support Inquiry',
          message: supportMessage
        })
      });
      if (res.ok) {
        toast.success('Your message has been received by our farm concierge!');
        setSupportSubject('');
        setSupportMessage('');
      } else {
        toast.error('Could not send message at this moment. Please try WhatsApp.');
      }
    } catch {
      toast.error('Network error sending inquiry.');
    } finally {
      setSendingSupport(false);
    }
  };

  // Helper for tracking timeline steps
  const renderTrackingTimeline = (status) => {
    const s = (status || 'pending').toLowerCase();
    const steps = [
      { key: 'placed', label: 'Order Placed', icon: Clock },
      { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
      { key: 'shipped', label: 'Dispatched', icon: Truck },
      { key: 'delivered', label: 'Delivered', icon: ShieldCheck }
    ];

    let currentStepIdx = 0;
    if (s === 'confirmed' || s === 'processing') currentStepIdx = 1;
    else if (s === 'shipped' || s === 'in_transit') currentStepIdx = 2;
    else if (s === 'delivered') currentStepIdx = 3;
    else if (s === 'cancelled') {
      return (
        <div style={{ padding: '10px 14px', background: '#fef2f2', borderRadius: '8px', color: '#dc2626', fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', margin: '12px 0' }}>
          <AlertCircle size={15} />
          <span>This order was cancelled. Any pre-authorized charges will be refunded.</span>
        </div>
      );
    }

    return (
      <div className="order-tracking-timeline">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStepIdx;
          const isActive = idx === currentStepIdx;
          const StepIcon = step.icon;

          return (
            <div 
              key={step.key} 
              className={`order-timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
            >
              <div className="timeline-dot">
                {isCompleted ? <Check size={14} /> : <StepIcon size={14} />}
              </div>
              <span className="timeline-step-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="member-suite-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader size={36} className="member-spin" style={{ color: '#0f3d2a', margin: '0 auto 12px' }} />
          <p style={{ color: '#4a5e52', fontWeight: 600 }}>Loading your member suite...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show a clean sign-in invitation card
  if (!isAuthenticated) {
    return (
      <div className="member-suite-container">
        <div className="member-suite-wrapper" style={{ maxWidth: '580px', margin: '40px auto' }}>
          <div className="member-content-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div className="member-empty-icon" style={{ width: '72px', height: '72px', margin: '0 auto 20px', background: 'linear-gradient(135deg, #09261a 0%, #0f3d2a 100%)', color: '#d4af37' }}>
              <User size={36} />
            </div>
            <h1 style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: '24px', color: '#0f3d2a', margin: '0 0 10px' }}>
              Patron Member Suite
            </h1>
            <p style={{ color: '#55695d', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>
              Sign in to your Venthulir account to track your real-time harvest deliveries, manage saved shipping addresses, and access member-only vouchers.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                type="button"
                className="member-save-btn"
                style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                onClick={() => {
                  if (uiModal?.setAuthOpen) uiModal.setAuthOpen(true);
                }}
              >
                <span>Sign In / Create Account</span>
                <ChevronRight size={16} />
              </button>
              <Link href="/products" className="member-shop-btn" style={{ justifyContent: 'center', background: '#f4f0e6', color: '#0f3d2a', boxShadow: 'none' }}>
                Browse Organic Harvest
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const userInitial = user?.name ? user.name[0].toUpperCase() : 'V';
  const isAdminUser = Boolean(user?.isAdmin || user?.role === 'admin');

  return (
    <div className="member-suite-container">
      <div className="member-suite-wrapper">
        
        {/* ── 1. TOP LUXURY MEMBER HEADER ── */}
        <header className="member-header-card">
          <div className="member-header-inner">
            <div className="member-profile-summary">
              <div className="member-avatar-gold">
                <span>{userInitial}</span>
              </div>
              <div>
                <h1 className="member-name-heading">
                  Welcome, {user?.name || 'Valued Patron'}
                </h1>
                <div className="member-meta-pills">
                  <span className="member-tier-badge">
                    <Sparkles size={12} />
                    <span>Verified Organic Member</span>
                  </span>
                  <span className="member-email-text">{user?.email}</span>
                  {isAdminUser && (
                    <Link 
                      href="/admin" 
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        background: '#d4af37', 
                        color: '#09261a', 
                        padding: '2px 8px', 
                        borderRadius: '6px', 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        textDecoration: 'none' 
                      }}
                    >
                      <span>Admin Console</span>
                      <ExternalLink size={10} />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className="member-header-actions">
              <Link href="/products" className="member-shop-btn">
                <ShoppingBag size={15} />
                <span>Shop Fresh Harvest</span>
              </Link>
            </div>
          </div>
        </header>

        {/* ── 2. TWO-COLUMN DASHBOARD GRID ── */}
        <div className="member-dashboard-grid">
          
          {/* LEFT NAVIGATION RAIL */}
          <aside className="member-nav-card">
            <button 
              type="button" 
              className={`member-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <div className="member-nav-left-group">
                <Package size={17} className="member-nav-icon" />
                <span>My Orders</span>
              </div>
              {orders.length > 0 && (
                <span className="member-nav-count-pill">{orders.length}</span>
              )}
            </button>

            <button 
              type="button" 
              className={`member-nav-item ${activeTab === 'address' ? 'active' : ''}`}
              onClick={() => setActiveTab('address')}
            >
              <div className="member-nav-left-group">
                <MapPin size={17} className="member-nav-icon" />
                <span>Delivery Addresses</span>
              </div>
            </button>

            <button 
              type="button" 
              className={`member-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <div className="member-nav-left-group">
                <User size={17} className="member-nav-icon" />
                <span>Personal Profile</span>
              </div>
            </button>

            <button 
              type="button" 
              className={`member-nav-item ${activeTab === 'coupons' ? 'active' : ''}`}
              onClick={() => setActiveTab('coupons')}
            >
              <div className="member-nav-left-group">
                <Tag size={17} className="member-nav-icon" />
                <span>Member Vouchers</span>
              </div>
              <span className="member-nav-count-pill" style={{ background: '#fef3c7', color: '#92400e' }}>Offer</span>
            </button>

            <button 
              type="button" 
              className={`member-nav-item ${activeTab === 'support' ? 'active' : ''}`}
              onClick={() => setActiveTab('support')}
            >
              <div className="member-nav-left-group">
                <Headphones size={17} className="member-nav-icon" />
                <span>Farm Concierge</span>
              </div>
            </button>

            <div className="member-nav-divider" />

            <button 
              type="button" 
              className="member-signout-btn"
              onClick={() => {
                logout();
                toast.info('Signed out of member suite.');
                router.push('/');
              }}
            >
              <LogOut size={17} />
              <span>Sign Out</span>
            </button>
          </aside>

          {/* RIGHT MAIN CONTENT AREA */}
          <main className="member-content-card">
            
            {/* ── TAB 1: MY ORDERS ── */}
            {activeTab === 'orders' && (
              <div>
                <div className="member-tab-header">
                  <div>
                    <h2 className="member-tab-title">Order History & Live Dispatch</h2>
                    <p className="member-tab-subtitle">Track your farm orders in real time from harvest to doorstep</p>
                  </div>
                </div>

                {ordersLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Loader size={24} className="member-spin" style={{ color: '#0f3d2a', margin: '0 auto 10px' }} />
                    <p style={{ color: '#788c81', fontSize: '13px' }}>Loading your order history...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="member-empty-state">
                    <div className="member-empty-icon">
                      <Package size={28} />
                    </div>
                    <h3 style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: '18px', color: '#0f3d2a', margin: '0 0 6px' }}>
                      No Orders Placed Yet
                    </h3>
                    <p style={{ color: '#788c81', fontSize: '13.5px', maxWidth: '380px', margin: '0 auto 20px' }}>
                      Experience the pure nutrition of single-origin cold-pressed oils, stone-ground spices, and organic pulses.
                    </p>
                    <Link href="/products" className="member-save-btn" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                      <span>Explore Farm Harvest</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div>
                    {orders.map((ord) => {
                      const orderDate = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : 'Recent';

                      const totalAmount = ord.totalAmount || ord.amount || ord.pricing?.finalTotal || 0;
                      const items = ord.items || ord.orderItems || [];
                      const rawStatus = (ord.status || ord.orderStatus || 'Pending').toLowerCase();

                      return (
                        <div key={ord._id || ord.orderId} className="member-order-item-card">
                          <div className="order-card-top">
                            <div className="order-id-group">
                              <span className="order-id-code">
                                #{ord.orderId || ord._id?.slice(-8).toUpperCase()}
                              </span>
                              <span className="order-date-text">
                                <Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                                {orderDate}
                              </span>
                            </div>

                            <div>
                              <span className={`order-status-badge ${rawStatus}`}>
                                {ord.status || 'Pending'}
                              </span>
                            </div>
                          </div>

                          {/* Live Visual Timeline */}
                          {renderTrackingTimeline(ord.status || ord.orderStatus)}

                          {/* Line Items */}
                          <div className="order-items-table">
                            {items.map((it, idx) => (
                              <div key={idx} className="order-item-row">
                                <div className="order-item-info">
                                  {it.imageUrl || it.image ? (
                                    <img src={it.imageUrl || it.image} alt={it.name} className="order-item-thumb" />
                                  ) : (
                                    <div className="order-item-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#edf6f1', color: '#0f3d2a', fontWeight: 700 }}>
                                      🌿
                                    </div>
                                  )}
                                  <div>
                                    <div className="order-item-name">{it.name}</div>
                                    <div className="order-item-variant">
                                      Qty: {it.quantity || 1} {it.selectedWeight ? `• ${it.selectedWeight}` : ''}
                                    </div>
                                  </div>
                                </div>
                                <div className="order-item-pricing">
                                  <strong>₹{(it.price || 0) * (it.quantity || 1)}</strong>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Footer Info */}
                          <div className="order-card-bottom">
                            <div style={{ fontSize: '12.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <MapPin size={13} style={{ color: '#0f3d2a' }} />
                              <span>
                                {ord.shippingAddress?.address || ord.deliveryAddress?.address || 'Primary Member Address'}
                                {ord.shippingAddress?.city ? `, ${ord.shippingAddress.city}` : ''}
                              </span>
                            </div>

                            <div className="order-action-buttons">
                              {(ord.status === 'Pending' || ord.status === 'Processing' || !ord.status) && (
                                <button
                                  type="button"
                                  className="order-cancel-btn"
                                  onClick={() => handleCancelOrder(ord._id || ord.orderId)}
                                >
                                  Cancel Order
                                </button>
                              )}
                              <div className="order-grand-total">
                                Total: ₹{totalAmount}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 2: DELIVERY ADDRESSES ── */}
            {activeTab === 'address' && (
              <div>
                <div className="member-tab-header">
                  <div>
                    <h2 className="member-tab-title">Delivery Addresses</h2>
                    <p className="member-tab-subtitle">Manage where your farm harvests are shipped</p>
                  </div>
                </div>

                {user?.deliveryAddress?.address && (
                  <div className="member-addresses-grid">
                    <div className="member-address-card default">
                      <div className="member-address-type">
                        <MapPin size={12} />
                        <span>Default Shipping Address</span>
                      </div>
                      <div className="member-address-name">{user?.name || 'Primary Recipient'}</div>
                      <div className="member-address-text">
                        {user.deliveryAddress.address}<br />
                        {user.deliveryAddress.city}, {user.deliveryAddress.state} - {user.deliveryAddress.zipCode}
                      </div>
                      {user?.phone && (
                        <div className="member-address-phone">
                          <Phone size={12} />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <h3 style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: '16px', color: '#0f3d2a', margin: '20px 0 14px' }}>
                  {user?.deliveryAddress?.address ? 'Update Shipping Address' : 'Set Default Shipping Address'}
                </h3>

                <form onSubmit={handleSaveAddress} className="member-form-grid">
                  <div className="member-form-group full-width">
                    <label className="member-form-label">Street Address / Door No / Landmark *</label>
                    <input 
                      type="text" 
                      className="member-form-input"
                      placeholder="e.g. 14, Royal Palm Avenue, Anna Nagar"
                      value={addressForm.address}
                      onChange={(e) => setAddressForm(f => ({ ...f, address: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="member-form-group">
                    <label className="member-form-label">City / District *</label>
                    <input 
                      type="text" 
                      className="member-form-input"
                      placeholder="e.g. Chennai"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm(f => ({ ...f, city: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="member-form-group">
                    <label className="member-form-label">State *</label>
                    <input 
                      type="text" 
                      className="member-form-input"
                      placeholder="Tamil Nadu"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm(f => ({ ...f, state: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="member-form-group">
                    <label className="member-form-label">PIN Code (6 digits) *</label>
                    <input 
                      type="text" 
                      className="member-form-input"
                      placeholder="600001"
                      value={addressForm.zipCode}
                      onChange={(e) => setAddressForm(f => ({ ...f, zipCode: e.target.value }))}
                      maxLength={6}
                      required
                    />
                  </div>

                  <div className="member-form-actions">
                    <button type="submit" className="member-save-btn" disabled={savingAddress}>
                      {savingAddress ? <Loader size={14} className="member-spin" /> : <Save size={14} />}
                      <span>Save Address</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── TAB 3: PERSONAL PROFILE ── */}
            {activeTab === 'profile' && (
              <div>
                <div className="member-tab-header">
                  <div>
                    <h2 className="member-tab-title">Personal Profile Details</h2>
                    <p className="member-tab-subtitle">Update your contact identity and communication preferences</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="member-form-grid">
                  <div className="member-form-group">
                    <label className="member-form-label">Full Name *</label>
                    <input 
                      type="text" 
                      className="member-form-input"
                      placeholder="Your Full Name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="member-form-group">
                    <label className="member-form-label">Primary Mobile Number *</label>
                    <input 
                      type="tel" 
                      className="member-form-input"
                      placeholder="+91 98765 43210"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="member-form-group full-width">
                    <label className="member-form-label">Registered Account Email</label>
                    <input 
                      type="email" 
                      className="member-form-input"
                      value={user?.email || ''} 
                      disabled 
                    />
                    <span className="member-form-hint">Email address serves as your primary verification identity and cannot be edited.</span>
                  </div>

                  <div className="member-form-actions">
                    <button type="submit" className="member-save-btn" disabled={savingProfile}>
                      {savingProfile ? <Loader size={14} className="member-spin" /> : <Save size={14} />}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── TAB 4: MEMBER VOUCHERS / COUPONS ── */}
            {activeTab === 'coupons' && (
              <div>
                <div className="member-tab-header">
                  <div>
                    <h2 className="member-tab-title">Exclusive Member Vouchers</h2>
                    <p className="member-tab-subtitle">Copy active promo codes and apply them during checkout for instant savings</p>
                  </div>
                </div>

                {couponsLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Loader size={24} className="member-spin" style={{ color: '#0f3d2a', margin: '0 auto 10px' }} />
                    <p style={{ color: '#788c81', fontSize: '13px' }}>Unlocking active vouchers...</p>
                  </div>
                ) : coupons.length === 0 ? (
                  <div className="member-empty-state">
                    <div className="member-empty-icon">
                      <Tag size={28} />
                    </div>
                    <h3 style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: '18px', color: '#0f3d2a', margin: '0 0 6px' }}>
                      No Active Vouchers Right Now
                    </h3>
                    <p style={{ color: '#788c81', fontSize: '13.5px' }}>
                      Stay tuned! Seasonal farm discount vouchers and harvest promos will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="coupons-grid">
                    {coupons.map((cpn) => {
                      const isCopied = copiedCode === cpn.code;
                      return (
                        <div key={cpn._id || cpn.code} className="member-coupon-card">
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span className="coupon-code-badge">{cpn.code}</span>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>
                                {cpn.discountType === 'fixed' ? `₹${cpn.discountValue} OFF` : `${cpn.discountValue}% OFF`}
                              </span>
                            </div>
                            <p style={{ fontSize: '13px', color: '#4a5e52', margin: '0 0 10px' }}>
                              {cpn.description || `Enjoy ${cpn.discountValue}% off on minimum orders of ₹${cpn.minOrderValue || 0}`}
                            </p>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px dashed #e0d8cb' }}>
                            <span style={{ fontSize: '11px', color: '#8c7b60' }}>
                              Min Order: ₹{cpn.minOrderValue || 0}
                            </span>
                            <button
                              type="button"
                              className="coupon-copy-btn"
                              onClick={() => handleCopyCoupon(cpn.code)}
                            >
                              {isCopied ? <Check size={13} /> : <Copy size={13} />}
                              <span>{isCopied ? 'Copied' : 'Copy Code'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 5: FARM CONCIERGE & SUPPORT ── */}
            {activeTab === 'support' && (
              <div>
                <div className="member-tab-header">
                  <div>
                    <h2 className="member-tab-title">Organic Farm Concierge</h2>
                    <p className="member-tab-subtitle">Direct line to our farm coordinators for order questions, custom requests, and harvest inquiries</p>
                  </div>
                </div>

                <div className="member-support-wrapper">
                  {/* Left: Contact Card */}
                  <div className="member-contact-info-card">
                    <div>
                      <h3 style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: '18px', color: '#d4af37', margin: '0 0 12px' }}>
                        Direct Patron Assistance
                      </h3>
                      <p style={{ fontSize: '13px', color: '#a7f3d0', lineHeight: 1.6, marginBottom: '20px' }}>
                        Every batch of our stone-ground flour and wood-pressed oil is handcrafted. If you have inquiries regarding sourcing, purity certifications, or shipment timelines, contact us directly.
                      </p>

                      <div className="member-contact-row">
                        <Phone size={16} className="member-contact-icon" />
                        <div>
                          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8' }}>Farm Hotline</div>
                          <div style={{ fontSize: '14px', fontWeight: 600 }}>+91 93444 87691</div>
                        </div>
                      </div>

                      <div className="member-contact-row">
                        <Mail size={16} className="member-contact-icon" />
                        <div>
                          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8' }}>Email Support</div>
                          <div style={{ fontSize: '14px', fontWeight: 600 }}>thesmgroups@gmail.com</div>
                        </div>
                      </div>
                    </div>

                    <a 
                      href="https://wa.me/919344487691?text=Hello%20Venthulir%20Farm,%20I%20am%20a%20patron%20inquiring%20about%20my%20order" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="whatsapp-support-btn"
                    >
                      <MessageSquare size={16} />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>

                  {/* Right: Message Form */}
                  <div>
                    <h3 style={{ fontFamily: "'Cinzel', Georgia, serif", fontSize: '16px', color: '#0f3d2a', margin: '0 0 14px' }}>
                      Send an Inquiry
                    </h3>
                    <form onSubmit={handleSupportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div className="member-form-group">
                        <label className="member-form-label">Subject</label>
                        <input 
                          type="text" 
                          className="member-form-input"
                          placeholder="e.g. Order Tracking #1234 or Delivery Query"
                          value={supportSubject}
                          onChange={(e) => setSupportSubject(e.target.value)}
                          required
                        />
                      </div>

                      <div className="member-form-group">
                        <label className="member-form-label">Your Message</label>
                        <textarea 
                          rows={4} 
                          className="member-form-textarea"
                          placeholder="Please describe your question or requirement in detail..."
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          required
                        />
                      </div>

                      <button type="submit" className="member-save-btn" disabled={sendingSupport}>
                        {sendingSupport ? <Loader size={14} className="member-spin" /> : <Send size={14} />}
                        <span>Send Message</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
}
