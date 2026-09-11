'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Store,
  Truck,
  Mail,
  Share2,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Loader2
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    storeName: 'Venthulir Organic',
    tagline: '100% Pure Organic Oils & Heritage Harvest',
    supportEmail: 'theoptime.io@gmail.com',
    supportPhone: '+91 98765 43210',
    address: '14/2, Heritage Farm Road, Pollachi, Coimbatore, Tamil Nadu - 642001',
    adminNotificationEmail: 'theoptime.io@gmail.com',
    defaultShippingFee: 40,
    freeShippingThreshold: 999,
    enableCOD: true,
    enableOnlinePayment: true,
    socialLinks: {
      instagram: 'https://instagram.com/venthulir_organic',
      facebook: 'https://facebook.com/venthulir',
      whatsapp: 'https://wa.me/919876543210',
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem('venthulir_token');
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#15221b' }}>
            Platform & Store Configurations
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Manage store profile, order dispatch logistics, notification emails, and socials
          </p>
        </div>

        <button
          className="admin-btn admin-btn-primary"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div style={{ background: '#edfcf2', border: '1px solid #bbf7d0', padding: '12px 18px', borderRadius: '10px', color: '#15803d', marginBottom: '20px', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>Store configurations and notification rules saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Store Profile Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">
              <Store size={18} color="#0b3d2e" /> Store Information & Identity
            </div>
            <span className="admin-badge gold">Brand Identity</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                Store Brand Name
              </label>
              <input
                type="text"
                className="admin-input"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                Tagline / Header Description
              </label>
              <input
                type="text"
                className="admin-input"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                Customer Support Email
              </label>
              <input
                type="email"
                className="admin-input"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                Customer Helpline Phone
              </label>
              <input
                type="text"
                className="admin-input"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
              Physical Warehouse / Farm Origin Address
            </label>
            <input
              type="text"
              className="admin-input"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            />
          </div>
        </div>

        {/* Shipping & Logistics Rules */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">
              <Truck size={18} color="#0b3d2e" /> Shipping & Logistics Rules
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                Default Flat Shipping Fee (₹)
              </label>
              <input
                type="number"
                className="admin-input"
                value={settings.defaultShippingFee}
                onChange={(e) => setSettings({ ...settings, defaultShippingFee: Number(e.target.value) })}
                min="0"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                Free Shipping Threshold Amount (₹)
              </label>
              <input
                type="number"
                className="admin-input"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Admin Notifications & Emails */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">
              <Mail size={18} color="#0b3d2e" /> Order Alerts & Notification Recipient
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
              Master Admin Notification Email (Instant Order Alerts)
            </label>
            <input
              type="email"
              className="admin-input"
              value={settings.adminNotificationEmail}
              onChange={(e) => setSettings({ ...settings, adminNotificationEmail: e.target.value })}
              required
            />
            <p style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
              Every time a customer places an order, an itemized invoice is dispatched instantly to this address.
            </p>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title">
              <Share2 size={18} color="#0b3d2e" /> Social Media & Customer Channels
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                Instagram Page URL
              </label>
              <input
                type="text"
                className="admin-input"
                value={settings.socialLinks?.instagram || ''}
                onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, instagram: e.target.value } })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                WhatsApp Direct Link
              </label>
              <input
                type="text"
                className="admin-input"
                value={settings.socialLinks?.whatsapp || ''}
                onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, whatsapp: e.target.value } })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px' }}>
                Facebook Page URL
              </label>
              <input
                type="text"
                className="admin-input"
                value={settings.socialLinks?.facebook || ''}
                onChange={(e) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, facebook: e.target.value } })}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
