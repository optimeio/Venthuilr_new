'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Mail,
  User,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Send,
  RefreshCw,
  Loader2
} from 'lucide-react';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All'); // 'All', 'Pending', 'Resolved'
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('venthulir_token');
      const res = await fetch('/api/messages', {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleStatus = async (msg) => {
    const isCurrentlyResolved = msg.status === 'Resolved';
    const nextStatus = isCurrentlyResolved ? 'Pending' : 'Resolved';

    try {
      setUpdatingId(msg._id);
      const token = localStorage.getItem('venthulir_token');
      const res = await fetch(`/api/messages/${msg._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (res.ok) {
        setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, status: nextStatus } : m));
      }
    } catch (err) {
      console.error('Update status error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this support message?')) return;

    try {
      setDeletingId(id);
      const token = localStorage.getItem('venthulir_token');
      const res = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setMessages(prev => prev.filter(m => m._id !== id));
      }
    } catch (err) {
      console.error('Delete message error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const pendingCount = messages.filter(m => m.status !== 'Resolved').length;
  const resolvedCount = messages.filter(m => m.status === 'Resolved').length;

  const filtered = messages.filter((m) => {
    const isResolved = m.status === 'Resolved';
    if (activeFilter === 'Pending' && isResolved) return false;
    if (activeFilter === 'Resolved' && !isResolved) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = (m.customerName || '').toLowerCase().includes(term);
      const matchEmail = (m.customerEmail || '').toLowerCase().includes(term);
      const matchText = (m.message || '').toLowerCase().includes(term);
      if (!matchName && !matchEmail && !matchText) return false;
    }

    return true;
  });

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: '#15221b' }}>
            Customer Support & Enquiries
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Inquiries received from customer contact forms, product queries, and feedback
          </p>
        </div>

        <button
          className="admin-btn admin-btn-secondary"
          onClick={fetchMessages}
          title="Refresh Messages"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
          <div className="admin-tabs-bar" style={{ margin: 0, padding: 0, border: 'none' }}>
            <button
              className={`admin-tab-btn ${activeFilter === 'All' ? 'active' : ''}`}
              onClick={() => setActiveFilter('All')}
            >
              All Messages <span className="admin-tab-count">{messages.length}</span>
            </button>
            <button
              className={`admin-tab-btn ${activeFilter === 'Pending' ? 'active' : ''}`}
              onClick={() => setActiveFilter('Pending')}
            >
              Pending Reply <span className="admin-tab-count">{pendingCount}</span>
            </button>
            <button
              className={`admin-tab-btn ${activeFilter === 'Resolved' ? 'active' : ''}`}
              onClick={() => setActiveFilter('Resolved')}
            >
              Resolved <span className="admin-tab-count">{resolvedCount}</span>
            </button>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#788c81' }} />
            <input
              type="text"
              placeholder="Search by customer, email, text..."
              className="admin-input"
              style={{ paddingLeft: '34px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Messages List Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filtered.map((msg) => {
          const isResolved = msg.status === 'Resolved';

          return (
            <div key={msg._id} className="admin-card" style={{ padding: '18px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#edfcf2', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {(msg.customerName || 'C')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#15221b' }}>{msg.customerName || 'Guest'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={12} /> {msg.customerEmail}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`admin-badge ${isResolved ? 'success' : 'warning'}`}>
                    {isResolved ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {isResolved ? 'Resolved' : 'Pending'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>

              {/* Message Content */}
              <div style={{ background: '#faf8f5', padding: '14px 16px', borderRadius: '8px', border: '1px solid #e6e1d6', fontSize: '13.5px', color: '#15221b', lineHeight: 1.6, marginBottom: '14px' }}>
                {msg.message}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <a
                  href={`mailto:${msg.customerEmail}?subject=Re:%20Venthulir%20Organic%20Support%20Enquiry`}
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  <Send size={13} /> Reply via Email
                </a>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    className={`admin-btn admin-btn-sm ${isResolved ? 'admin-btn-secondary' : 'admin-btn-primary'}`}
                    onClick={() => handleToggleStatus(msg)}
                    disabled={updatingId === msg._id}
                  >
                    {isResolved ? 'Mark as Pending' : 'Mark as Resolved'}
                  </button>

                  <button
                    className="admin-btn admin-btn-danger admin-btn-sm"
                    onClick={() => handleDeleteMessage(msg._id)}
                    disabled={deletingId === msg._id}
                    title="Delete Message"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: '#0b3d2e' }} />
            <span style={{ color: '#64748b' }}>Loading customer support messages...</span>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="admin-card" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
            <MessageSquare size={32} style={{ margin: '0 auto 12px', color: '#15803d' }} />
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#15221b' }}>All enquiries attended!</div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>No messages found for this filter.</div>
          </div>
        )}
      </div>
    </div>
  );
}
