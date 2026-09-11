'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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
  Loader2,
  Tag,
  Copy,
  Check,
  Headphones,
  Send,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  RefreshCw,
  Gift
} from 'lucide-react';
import { toast } from 'react-toastify';
import './ProfilePage.css';

const DEFAULT_COUPONS = [
  { code: 'VENTHULIR', discountType: 'flat', discountValue: 50, minOrder: 399, desc: '₹50 OFF on your authentic farm order' },
  { code: 'ORGANIC20', discountType: 'percent', discountValue: 20, minOrder: 699, desc: '20% OFF on all cold-pressed oils & spices' },
  { code: 'FIRST10', discountType: 'percent', discountValue: 10, minOrder: 299, desc: '10% Welcome Bonus on your first harvest basket' },
];

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, logout, updateUser } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'address' | 'profile' | 'coupons' | 'support'
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Coupons state
  const [coupons, setCoupons] = useState(DEFAULT_COUPONS);
  const [copiedCode, setCopiedCode] = useState('');

  // Support inquiry state
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [sendingSupport, setSendingSupport] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  // Address edit state
  const [addressForm, setAddressForm] = useState({
    address: '',
    city: '',
    state: 'Tamil Nadu',
    zipCode: ''
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    currentPassword: '',
    newPassword: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Sync initial user data
  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || ''
      }));
      setAddressForm({
        address: user.deliveryAddress?.address || '',
        city: user.deliveryAddress?.city || '',
        state: user.deliveryAddress?.state || 'Tamil Nadu',
        zipCode: user.deliveryAddress?.zipCode || ''
      });
    }
  }, [user]);

  // Fetch real-time user orders
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else if (!authLoading) {
      setOrdersLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  // Copy coupon code helper
  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  // Handle Save Address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const token = typeof window !== 'undefined' ? localStorage.getItem('venthulir_token') : null;
    if (!token) return;

    if (!addressForm.address.trim() || !addressForm.city.trim() || !addressForm.zipCode.trim()) {
      toast.error('Please fill in complete street address, city, and pincode.');
      return;
    }

    setSavingAddress(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          deliveryAddress: addressForm
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (updateUser) updateUser(data.user);
        setIsEditingAddress(false);
        toast.success('✨ Shipping address updated successfully!');
      } else {
        toast.error(data.msg || 'Could not update delivery address.');
      }
    } catch {
      toast.error('Server connection error. Please try again.');
    } finally {
      setSavingAddress(false);
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const token = typeof window !== 'undefined' ? localStorage.getItem('venthulir_token') : null;
    if (!token) return;

    if (!profileForm.name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    setSavingProfile(true);
    try {
      const payload = {
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim()
      };
      if (profileForm.newPassword) {
        if (profileForm.newPassword.length < 6) {
          toast.error('New password must be at least 6 characters.');
          setSavingProfile(false);
          return;
        }
        payload.currentPassword = profileForm.currentPassword;
        payload.newPassword = profileForm.newPassword;
      }

      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        if (updateUser) updateUser(data.user);
        setIsEditingProfile(false);
        setProfileForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
        toast.success('🎉 Profile information updated successfully!');
      } else {
        toast.error(data.msg || 'Could not update profile.');
      }
    } catch {
      toast.error('Server connection error. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Cancel Order (Pending orders only)
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this pending order?')) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('venthulir_token') : null;
    if (!token) return;

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Cancelled' })
      });
      if (res.ok) {
        toast.success('Order cancelled successfully.');
        fetchOrders();
      } else {
        const data = await res.json();
        toast.error(data.msg || 'Failed to cancel order.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    }
  };

  // Handle Submit Concierge Support Inquiry
  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!supportMessage.trim()) {
      toast.error('Please write your message or inquiry.');
      return;
    }

    setSendingSupport(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.name || 'Venthulir Patron',
          email: user?.email || 'customer@venthulir.com',
          phone: user?.phone || '',
          subject: supportSubject.trim() || 'Member Priority Inquiry',
          message: supportMessage.trim()
        })
      });

      if (res.ok) {
        setSupportSuccess(true);
        setSupportSubject('');
        setSupportMessage('');
        toast.success('Priority inquiry dispatched! Our farm concierge will reply within 4 hours.');
      } else {
        toast.error('Could not send message. Please contact via WhatsApp.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSendingSupport(false);
    }
  };

  if (authLoading) {
    return (
      <div className="lounge-loading-screen">
        <div className="lounge-spinner-pod">
          <Loader2 size={32} className="lounge-spin-icon" />
          <p>Opening Your Royal Patron Lounge...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !user) {
    return (
      <div className="lounge-guest-screen">
        <div className="lounge-guest-card">
          <div className="guest-icon-emblem">
            <User size={36} />
          </div>
          <h2>Royal Member Authentication Required</h2>
          <p>Please sign in to access your order dispatch tracker, verified address book, and exclusive farm harvest perks.</p>
          <div className="guest-cta-row">
            <Link href="/login" className="btn-lounge-primary">
              <User size={16} />
              <span>Sign In to Member Lounge</span>
            </Link>
            <Link href="/products" className="btn-lounge-secondary">
              <span>Explore Farm Catalog</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeOrdersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'Delivered').length;

  return (
    <div className="lounge-page-root">
      
      {/* ── 1. LUXURY HERO PATRON HEADER ── */}
      <section className="lounge-hero-section">
        <div className="container">
          
          <div className="lounge-hero-card">
            <div className="lounge-hero-ambient-glow" />

            <div className="lounge-hero-content-grid">
              
              {/* Left Identity Pod */}
              <div className="lounge-identity-pod">
                <div className="lounge-avatar-frame">
                  <div className="lounge-avatar-initial">
                    {user?.name?.[0]?.toUpperCase() || 'V'}
                  </div>
                  <div className="lounge-verified-orb" title="Certified Organic Patron">
                    <ShieldCheck size={14} />
                  </div>
                </div>

                <div className="lounge-identity-details">
                  <div className="lounge-rank-pill">
                    <Sparkles size={12} className="rank-sparkle" />
                    <span>{user?.isAdmin ? 'EXECUTIVE MASTER ADMINISTRATOR' : 'VERIFIED ROYAL PATRON'}</span>
                  </div>
                  <h1 className="lounge-patron-name">{user?.name || 'Honored Patron'}</h1>
                  <div className="lounge-contact-badges">
                    <span className="contact-badge">
                      <Mail size={13} />
                      {user?.email}
                    </span>
                    {user?.phone && (
                      <span className="contact-badge">
                        <Phone size={13} />
                        {user?.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Quick Metric Highlights */}
              <div className="lounge-kpi-cluster">
                <div className="lounge-kpi-item" onClick={() => setActiveTab('orders')}>
                  <div className="kpi-icon-box orders">
                    <Package size={18} />
                  </div>
                  <div className="kpi-meta">
                    <span className="kpi-val">{orders.length}</span>
                    <span className="kpi-lbl">Total Harvests</span>
                  </div>
                </div>

                <div className="lounge-kpi-item" onClick={() => setActiveTab('orders')}>
                  <div className="kpi-icon-box active">
                    <Truck size={18} />
                  </div>
                  <div className="kpi-meta">
                    <span className="kpi-val">{activeOrdersCount}</span>
                    <span className="kpi-lbl">Active Dispatch</span>
                  </div>
                </div>

                <div className="lounge-kpi-item" onClick={() => setActiveTab('coupons')}>
                  <div className="kpi-icon-box perks">
                    <Gift size={18} />
                  </div>
                  <div className="kpi-meta">
                    <span className="kpi-val">{coupons.length}</span>
                    <span className="kpi-lbl">VIP Vouchers</span>
                  </div>
                </div>

                {user?.isAdmin && (
                  <Link href="/admin" className="lounge-admin-switch-btn" title="Open Executive Operations Console">
                    <ShieldCheck size={16} />
                    <span>Executive Admin Panel →</span>
                  </Link>
                )}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── 2. MAIN LOUNGE WORKSPACE (Tabs + Dynamic Content) ── */}
      <section className="lounge-workspace-section">
        <div className="container">
          
          <div className="lounge-layout-grid">
            
            {/* ── Left Navigation Sidebar Bar ── */}
            <aside className="lounge-nav-sidebar">
              <div className="lounge-nav-card">
                
                <div className="nav-card-header">
                  <span>PATRON SUITE NAVIGATION</span>
                </div>

                <nav className="lounge-nav-menu">
                  <button
                    type="button"
                    className={`lounge-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                  >
                    <div className="nav-btn-icon">
                      <Package size={17} />
                    </div>
                    <span className="nav-btn-text">My Orders &amp; Tracking</span>
                    {orders.length > 0 && <span className="nav-btn-counter">{orders.length}</span>}
                  </button>

                  <button
                    type="button"
                    className={`lounge-nav-btn ${activeTab === 'address' ? 'active' : ''}`}
                    onClick={() => setActiveTab('address')}
                  >
                    <div className="nav-btn-icon">
                      <MapPin size={17} />
                    </div>
                    <span className="nav-btn-text">Shipping Hub &amp; Address</span>
                  </button>

                  <button
                    type="button"
                    className={`lounge-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <div className="nav-btn-icon">
                      <User size={17} />
                    </div>
                    <span className="nav-btn-text">Account Identity &amp; Security</span>
                  </button>

                  <button
                    type="button"
                    className={`lounge-nav-btn ${activeTab === 'coupons' ? 'active' : ''}`}
                    onClick={() => setActiveTab('coupons')}
                  >
                    <div className="nav-btn-icon">
                      <Tag size={17} />
                    </div>
                    <span className="nav-btn-text">Harvest Vouchers &amp; Perks</span>
                    <span className="nav-btn-badge-gold">Offer</span>
                  </button>

                  <button
                    type="button"
                    className={`lounge-nav-btn ${activeTab === 'support' ? 'active' : ''}`}
                    onClick={() => setActiveTab('support')}
                  >
                    <div className="nav-btn-icon">
                      <Headphones size={17} />
                    </div>
                    <span className="nav-btn-text">Farm Concierge Priority</span>
                  </button>
                </nav>

                <div className="lounge-nav-divider" />

                {/* Direct WhatsApp Quick Connect */}
                <div className="lounge-sidebar-support-box">
                  <div className="support-box-header">
                    <Sparkles size={13} color="#c9922c" />
                    <strong>Direct Farm WhatsApp</strong>
                  </div>
                  <p>Need urgent delivery updates or bulk spice orders?</p>
                  <a
                    href="https://wa.me/918778476414?text=Hi%20Venthulir%20Team,%20I%20need%20assistance%20with%20my%20order."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-sidebar-whatsapp"
                  >
                    <MessageSquare size={14} />
                    <span>WhatsApp Concierge</span>
                  </a>
                </div>

                <div className="lounge-nav-divider" />

                <button
                  type="button"
                  className="lounge-logout-btn"
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out of Account</span>
                </button>

              </div>
            </aside>

            {/* ── Right Main Workspace Pane ── */}
            <main className="lounge-main-viewport">
              
              {/* ─────────────────────────────────────────────────────────────
                  TAB 1: ORDERS & LIVE TRACKING
              ───────────────────────────────────────────────────────────── */}
              {activeTab === 'orders' && (
                <div className="lounge-tab-pane animate-fade-in">
                  
                  <div className="pane-header-row">
                    <div>
                      <h2 className="pane-headline">Order History &amp; Live Tracking</h2>
                      <p className="pane-subtext">Track your freshly cold-pressed oils and stone-ground spices from harvest to doorstep.</p>
                    </div>
                    <button
                      type="button"
                      className="pane-refresh-btn"
                      onClick={fetchOrders}
                      title="Refresh Orders"
                    >
                      <RefreshCw size={15} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {ordersLoading ? (
                    <div className="lounge-empty-box">
                      <Loader2 size={32} className="lounge-spin-icon" />
                      <p>Fetching real-time dispatch status...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="lounge-empty-orders-card">
                      <div className="empty-orders-illustration">
                        <ShoppingBag size={48} />
                      </div>
                      <h3>No Harvest Orders Placed Yet</h3>
                      <p>Experience genuine Vaagai wood-pressed oils and aromatic stone-ground spices cultivated in Tamil Nadu farms.</p>
                      <Link href="/products" className="btn-empty-shop">
                        <Sparkles size={16} />
                        <span>Explore Organic Catalog</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="orders-cards-stream">
                      {orders.map((order) => {
                        const status = (order.status || 'Pending').toLowerCase();
                        const isPending = status === 'pending';
                        const isConfirmed = status === 'confirmed';
                        const isShipped = status === 'shipped';
                        const isDelivered = status === 'delivered';
                        const isCancelled = status === 'cancelled';

                        const stepIndex = isCancelled ? -1 : isDelivered ? 3 : isShipped ? 2 : isConfirmed ? 1 : 0;

                        return (
                          <div key={order._id} className={`order-master-card status-${status}`}>
                            
                            {/* Card Top Strip */}
                            <div className="order-master-header">
                              <div className="order-id-group">
                                <span className="order-ref-badge">
                                  #{order._id.slice(-8).toUpperCase()}
                                </span>
                                <span className="order-date-text">
                                  <Calendar size={13} />
                                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>

                              <div className="order-status-cluster">
                                <span className={`order-status-pill ${status}`}>
                                  {order.status || 'Pending'}
                                </span>
                              </div>
                            </div>

                            {/* Visual Timeline Stepper */}
                            {!isCancelled && (
                              <div className="order-stepper-track">
                                <div className="stepper-line-bg" />
                                <div 
                                  className="stepper-line-fill" 
                                  style={{ width: `${(stepIndex / 3) * 100}%` }} 
                                />

                                <div className={`stepper-node ${stepIndex >= 0 ? 'completed' : ''} ${stepIndex === 0 ? 'active' : ''}`}>
                                  <div className="node-icon-circle">
                                    <Clock size={13} />
                                  </div>
                                  <span className="node-label">Order Placed</span>
                                </div>

                                <div className={`stepper-node ${stepIndex >= 1 ? 'completed' : ''} ${stepIndex === 1 ? 'active' : ''}`}>
                                  <div className="node-icon-circle">
                                    <CheckCircle2 size={13} />
                                  </div>
                                  <span className="node-label">Confirmed</span>
                                </div>

                                <div className={`stepper-node ${stepIndex >= 2 ? 'completed' : ''} ${stepIndex === 2 ? 'active' : ''}`}>
                                  <div className="node-icon-circle">
                                    <Truck size={13} />
                                  </div>
                                  <span className="node-label">Dispatched</span>
                                </div>

                                <div className={`stepper-node ${stepIndex >= 3 ? 'completed' : ''} ${stepIndex === 3 ? 'active' : ''}`}>
                                  <div className="node-icon-circle">
                                    <ShieldCheck size={13} />
                                  </div>
                                  <span className="node-label">Delivered</span>
                                </div>
                              </div>
                            )}

                            {/* Items List Breakdown */}
                            <div className="order-items-grid">
                              {order.items?.map((item, idx) => (
                                <div key={idx} className="order-item-unit">
                                  <div className="order-item-thumb">
                                    {item.image || item.imageUrl ? (
                                      <img src={item.image || item.imageUrl} alt={item.name} />
                                    ) : (
                                      <span>{item.name?.[0] || 'V'}</span>
                                    )}
                                  </div>
                                  <div className="order-item-info">
                                    <h4 className="item-title">{item.name}</h4>
                                    <div className="item-meta-row">
                                      {item.variant && <span className="item-variant-tag">{item.variant}</span>}
                                      <span className="item-qty-tag">Qty: {item.quantity}</span>
                                      <span className="item-price-tag">₹{item.price * item.quantity}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Order Footer & Actions */}
                            <div className="order-master-footer">
                              <div className="order-shipping-summary">
                                <MapPin size={14} className="pin-icon" />
                                <span>
                                  {order.deliveryAddress?.address ? `${order.deliveryAddress.address}, ${order.deliveryAddress.city} - ${order.deliveryAddress.zipCode}` : 'Standard Shipping Address'}
                                </span>
                              </div>

                              <div className="order-cost-actions-row">
                                <div className="order-cost-pod">
                                  <span className="cost-lbl">Total Paid:</span>
                                  <span className="cost-val">₹{order.totalAmount}</span>
                                </div>

                                <div className="order-action-buttons">
                                  {isPending && (
                                    <button
                                      type="button"
                                      className="btn-cancel-order"
                                      onClick={() => handleCancelOrder(order._id)}
                                    >
                                      Cancel Order
                                    </button>
                                  )}
                                  <Link href="/products" className="btn-reorder-harvest">
                                    <RotateCcw size={13} />
                                    <span>Buy Again</span>
                                  </Link>
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

              {/* ─────────────────────────────────────────────────────────────
                  TAB 2: SHIPPING HUB & ADDRESS
              ───────────────────────────────────────────────────────────── */}
              {activeTab === 'address' && (
                <div className="lounge-tab-pane animate-fade-in">
                  
                  <div className="pane-header-row">
                    <div>
                      <h2 className="pane-headline">Shipping Hub &amp; Delivery Places</h2>
                      <p className="pane-subtext">Manage verified delivery destinations for express doorstep delivery.</p>
                    </div>
                    {!isEditingAddress && (
                      <button
                        type="button"
                        className="btn-pane-action"
                        onClick={() => setIsEditingAddress(true)}
                      >
                        <Edit3 size={15} />
                        <span>Edit Address</span>
                      </button>
                    )}
                  </div>

                  {!isEditingAddress ? (
                    <div className="address-display-card">
                      <div className="address-card-top">
                        <div className="address-chip default">
                          <CheckCircle2 size={13} />
                          <span>Primary Delivery Address</span>
                        </div>
                        <span className="address-state-badge">100% Express Route</span>
                      </div>

                      <div className="address-details-body">
                        <h3 className="recipient-name">{user?.name || 'Valued Patron'}</h3>
                        <p className="street-line">
                          {user?.deliveryAddress?.address || 'No street address saved yet.'}
                        </p>
                        <p className="city-line">
                          {user?.deliveryAddress?.city ? `${user.deliveryAddress.city}, ${user.deliveryAddress.state || 'Tamil Nadu'} - ${user.deliveryAddress.zipCode}` : 'Click edit below to add city & pincode.'}
                        </p>
                        <div className="phone-line">
                          <Phone size={14} />
                          <span>{user?.phone || 'Add phone number in profile'}</span>
                        </div>
                      </div>

                      <div className="address-card-bottom">
                        <button
                          type="button"
                          className="btn-edit-inline"
                          onClick={() => setIsEditingAddress(true)}
                        >
                          <Edit3 size={14} />
                          <span>Update Address Details</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveAddress} className="lounge-form-card">
                      <div className="form-card-title">
                        <MapPin size={18} />
                        <span>Update Delivery Destination</span>
                      </div>

                      <div className="lounge-form-grid">
                        <div className="form-group full">
                          <label>Full Door / Street Address *</label>
                          <textarea
                            rows={3}
                            required
                            placeholder="Door No, Street Name, Landmark"
                            value={addressForm.address}
                            onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label>City / Town *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Coimbatore"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label>Pincode / Postal Code *</label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            placeholder="641001"
                            value={addressForm.zipCode}
                            onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value.replace(/\D/g, '') })}
                          />
                        </div>

                        <div className="form-group full">
                          <label>State</label>
                          <input
                            type="text"
                            value={addressForm.state}
                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-actions-bar">
                        <button
                          type="button"
                          className="btn-form-cancel"
                          onClick={() => setIsEditingAddress(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn-form-submit"
                          disabled={savingAddress}
                        >
                          {savingAddress ? (
                            <>
                              <Loader2 size={16} className="lounge-spin-icon" />
                              <span>Saving Address...</span>
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              <span>Save Delivery Address</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 3: ACCOUNT IDENTITY & SECURITY
              ───────────────────────────────────────────────────────────── */}
              {activeTab === 'profile' && (
                <div className="lounge-tab-pane animate-fade-in">
                  
                  <div className="pane-header-row">
                    <div>
                      <h2 className="pane-headline">Account Identity &amp; Security</h2>
                      <p className="pane-subtext">Manage your verified member identity and account credentials.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="lounge-form-card">
                    <div className="form-card-title">
                      <User size={18} />
                      <span>Personal Identity Details</span>
                    </div>

                    <div className="lounge-form-grid">
                      <div className="form-group">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Contact Mobile Number</label>
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        />
                      </div>

                      <div className="form-group full">
                        <label>Registered Email Address</label>
                        <input
                          type="email"
                          disabled
                          value={user?.email || ''}
                          style={{ background: '#f8faf9', cursor: 'not-allowed', color: '#6b7280' }}
                        />
                        <span className="field-hint">Email address is permanently linked to your verified patron profile.</span>
                      </div>
                    </div>

                    <div className="lounge-form-divider" />

                    <div className="form-card-title">
                      <ShieldCheck size={18} />
                      <span>Security &amp; Password (Optional)</span>
                    </div>

                    <div className="lounge-form-grid">
                      <div className="form-group">
                        <label>Current Password</label>
                        <input
                          type="password"
                          placeholder="Enter to authorize password update"
                          value={profileForm.currentPassword}
                          onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>New Password</label>
                        <input
                          type="password"
                          placeholder="Min 6 characters"
                          value={profileForm.newPassword}
                          onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-actions-bar">
                      <button
                        type="submit"
                        className="btn-form-submit"
                        disabled={savingProfile}
                      >
                        {savingProfile ? (
                          <>
                            <Loader2 size={16} className="lounge-spin-icon" />
                            <span>Updating Profile...</span>
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 4: HARVEST VOUCHERS & PERKS
              ───────────────────────────────────────────────────────────── */}
              {activeTab === 'coupons' && (
                <div className="lounge-tab-pane animate-fade-in">
                  
                  <div className="pane-header-row">
                    <div>
                      <h2 className="pane-headline">Member Harvest Vouchers &amp; Perks</h2>
                      <p className="pane-subtext">Exclusive privilege codes valid for instant deductions on checkout.</p>
                    </div>
                  </div>

                  <div className="vouchers-cards-grid">
                    {coupons.map((coupon, idx) => (
                      <div key={idx} className="voucher-ticket-card">
                        
                        <div className="voucher-left-stub">
                          <span className="voucher-discount-val">
                            {coupon.discountType === 'percent' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                          </span>
                          <span className="voucher-discount-tag">DISCOUNT</span>
                        </div>

                        <div className="voucher-ticket-divider" />

                        <div className="voucher-right-body">
                          <div className="voucher-header">
                            <span className="voucher-code-badge">{coupon.code}</span>
                            <span className="voucher-min-tag">Min ₹{coupon.minOrder || 299}</span>
                          </div>
                          
                          <p className="voucher-desc-text">{coupon.desc || 'Applicable across all pure organic products.'}</p>
                          
                          <div className="voucher-actions-row">
                            <span className="voucher-expiry-hint">✓ 100% Verified Valid</span>
                            <button
                              type="button"
                              className={`btn-copy-voucher ${copiedCode === coupon.code ? 'copied' : ''}`}
                              onClick={() => handleCopyCoupon(coupon.code)}
                            >
                              {copiedCode === coupon.code ? (
                                <>
                                  <Check size={13} />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={13} />
                                  <span>Copy Code</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  TAB 5: FARM CONCIERGE & INQUIRY
              ───────────────────────────────────────────────────────────── */}
              {activeTab === 'support' && (
                <div className="lounge-tab-pane animate-fade-in">
                  
                  <div className="pane-header-row">
                    <div>
                      <h2 className="pane-headline">Farm Concierge &amp; Priority Desk</h2>
                      <p className="pane-subtext">Direct priority assistance for our valued organic patrons.</p>
                    </div>
                  </div>

                  <div className="concierge-cards-grid">
                    
                    {/* Inquiry Form */}
                    <form onSubmit={handleSupportSubmit} className="lounge-form-card concierge-form">
                      <div className="form-card-title">
                        <MessageSquare size={18} />
                        <span>Send Message to Head Agronomist</span>
                      </div>

                      {supportSuccess && (
                        <div className="support-success-banner">
                          <CheckCircle2 size={20} />
                          <div>
                            <strong>Inquiry Registered!</strong>
                            <p>Our concierge team will respond directly via email or call within 4 hours.</p>
                          </div>
                        </div>
                      )}

                      <div className="lounge-form-grid">
                        <div className="form-group full">
                          <label>Inquiry Subject / Topic</label>
                          <input
                            type="text"
                            placeholder="e.g. Bulk Cold-Pressed Oil Order / Delivery Query"
                            value={supportSubject}
                            onChange={(e) => setSupportSubject(e.target.value)}
                          />
                        </div>

                        <div className="form-group full">
                          <label>Your Message / Requirement *</label>
                          <textarea
                            rows={4}
                            required
                            placeholder="Tell us how we can assist you with your organic harvest order..."
                            value={supportMessage}
                            onChange={(e) => setSupportMessage(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-actions-bar">
                        <button
                          type="submit"
                          className="btn-form-submit"
                          disabled={sendingSupport}
                        >
                          {sendingSupport ? (
                            <>
                              <Loader2 size={16} className="lounge-spin-icon" />
                              <span>Sending Inquiry...</span>
                            </>
                          ) : (
                            <>
                              <Send size={15} />
                              <span>Send Priority Inquiry</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* Direct Contact Cards */}
                    <div className="concierge-direct-cluster">
                      <div className="concierge-direct-card whatsapp">
                        <div className="direct-card-icon">
                          <MessageSquare size={24} />
                        </div>
                        <h3>Instant WhatsApp Chat</h3>
                        <p>Direct priority line for instant dispatch tracking and wholesale inquiries.</p>
                        <a
                          href="https://wa.me/918778476414"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-direct-connect"
                        >
                          <span>Open WhatsApp (+91 87784 76414)</span>
                          <ExternalLink size={14} />
                        </a>
                      </div>

                      <div className="concierge-direct-card email">
                        <div className="direct-card-icon">
                          <Mail size={24} />
                        </div>
                        <h3>Email Farm Support</h3>
                        <p>Write directly to our quality assurance and harvest operations team.</p>
                        <a
                          href="mailto:theventhulir@gmail.com"
                          className="btn-direct-connect email"
                        >
                          <span>theventhulir@gmail.com</span>
                          <ArrowRight size={14} />
                        </a>
                      </div>
                    </div>

                  </div>

                </div>
              )}

            </main>

          </div>

        </div>
      </section>

    </div>
  );
}
