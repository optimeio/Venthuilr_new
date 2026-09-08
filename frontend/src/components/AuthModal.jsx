import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Eye, EyeOff, Loader } from 'lucide-react';
import './AuthModal.css';

export default function AuthModal({ onClose }) {
  const { login, register, requestOTP, requestRegisterOTP, verifyOTP, verifyRegisterOTP } = useAuth();
  const [tab, setTab]           = useState('login');   // login | register | otp | verify
  const [form, setForm]         = useState({ name:'', email:'', phone:'', password:'', address:'', city:'', state:'', zipCode:'', otp:'' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [otpSent, setOtpSent]   = useState(false);

  const update = (k, v) => { setForm(f => ({...f, [k]: v})); setError(''); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await requestOTP(form.email, form.password);
    if (res.success) { setOtpSent(true); setTab('otp'); }
    else setError(res.msg);
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await verifyOTP(form.email, form.otp);
    if (res.success) onClose();
    else setError(res.msg);
    setLoading(false);
  };

  const handleSendRegisterOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await requestRegisterOTP(form.email);
    if (res.success) setTab('verify');
    else setError(res.msg);
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await verifyRegisterOTP(form.email, form.otp);
    if (res.success) {
      const reg = await register(form.name, form.email, form.phone, form.password, form.address, form.city, form.state, form.zipCode, form.otp);
      if (reg.success) onClose();
      else setError(reg.msg);
    } else setError(res.msg);
    setLoading(false);
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="auth-modal animate-fade-up">
        <button className="modal-close" onClick={onClose}><X size={18} /></button>

        {/* Logo */}
        <div className="auth-modal-logo">
          <img src="/logo.png" alt="Venthulir" onError={e=>e.target.style.display='none'} />
        </div>

        {tab === 'otp' && (
          <>
            <h2 className="auth-title">Enter OTP</h2>
            <p className="auth-sub">We sent a verification code to <strong>{form.email}</strong></p>
            <form onSubmit={handleVerifyOTP} className="auth-form">
              <input className="otp-input" placeholder="6-digit OTP" value={form.otp} onChange={e => update('otp', e.target.value)} maxLength={6} required />
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                {loading ? <Loader size={16} className="spin" /> : 'Verify & Sign In'}
              </button>
            </form>
            <p className="auth-switch">
              Wrong email? <button onClick={() => { setTab('login'); setError(''); }}>Go back</button>
            </p>
          </>
        )}

        {tab === 'verify' && (
          <>
            <h2 className="auth-title">Verify Email</h2>
            <p className="auth-sub">We sent a verification code to <strong>{form.email}</strong></p>
            <form onSubmit={handleRegister} className="auth-form">
              <input className="otp-input" placeholder="6-digit OTP" value={form.otp} onChange={e => update('otp', e.target.value)} maxLength={6} required />
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                {loading ? <Loader size={16} className="spin" /> : 'Create Account'}
              </button>
            </form>
            <p className="auth-switch">
              Go back? <button onClick={() => { setTab('register'); setError(''); }}>Edit info</button>
            </p>
          </>
        )}

        {tab === 'login' && (
          <>
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-sub">Sign in to track orders and manage your account</p>
            <div className="auth-tabs">
              <button className="auth-tab active">Sign In</button>
              <button className="auth-tab" onClick={() => { setTab('register'); setError(''); }}>Create Account</button>
            </div>
            <form onSubmit={handleLogin} className="auth-form">
              <div className="auth-field">
                <label>Email</label>
                <input type="email" placeholder="you@email.com" value={form.email} onChange={e => update('email', e.target.value)} required />
              </div>
              <div className="auth-field">
                <label>Password</label>
                <div className="pass-wrap">
                  <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => update('password', e.target.value)} required />
                  <button type="button" onClick={() => setShowPass(v => !v)}>{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                {loading ? <Loader size={16} className="spin" /> : 'Continue with OTP →'}
              </button>
            </form>
            <p className="auth-switch">
              New customer? <button onClick={() => { setTab('register'); setError(''); }}>Create account</button>
            </p>
          </>
        )}

        {tab === 'register' && (
          <>
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-sub">Join thousands of happy organic food lovers</p>
            <div className="auth-tabs">
              <button className="auth-tab" onClick={() => { setTab('login'); setError(''); }}>Sign In</button>
              <button className="auth-tab active">Create Account</button>
            </div>
            <form onSubmit={handleSendRegisterOTP} className="auth-form">
              <div className="form-2col">
                <div className="auth-field">
                  <label>Full Name</label>
                  <input placeholder="Your name" value={form.name} onChange={e => update('name', e.target.value)} required />
                </div>
                <div className="auth-field">
                  <label>Phone</label>
                  <input placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => update('phone', e.target.value)} required />
                </div>
              </div>
              <div className="auth-field">
                <label>Email</label>
                <input type="email" placeholder="you@email.com" value={form.email} onChange={e => update('email', e.target.value)} required />
              </div>
              <div className="auth-field">
                <label>Password</label>
                <div className="pass-wrap">
                  <input type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" value={form.password} onChange={e => update('password', e.target.value)} required />
                  <button type="button" onClick={() => setShowPass(v => !v)}>{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
              <div className="auth-field">
                <label>Delivery Address</label>
                <input placeholder="Street address" value={form.address} onChange={e => update('address', e.target.value)} />
              </div>
              <div className="form-3col">
                <div className="auth-field">
                  <label>City</label>
                  <input placeholder="City" value={form.city} onChange={e => update('city', e.target.value)} />
                </div>
                <div className="auth-field">
                  <label>State</label>
                  <input placeholder="State" value={form.state} onChange={e => update('state', e.target.value)} />
                </div>
                <div className="auth-field">
                  <label>PIN</label>
                  <input placeholder="600001" value={form.zipCode} onChange={e => update('zipCode', e.target.value)} />
                </div>
              </div>
              {error && <p className="auth-error">{error}</p>}
              <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                {loading ? <Loader size={16} className="spin" /> : 'Send Verification OTP →'}
              </button>
            </form>
            <p className="auth-switch">
              Already have an account? <button onClick={() => { setTab('login'); setError(''); }}>Sign in</button>
            </p>
          </>
        )}
      </div>
    </>
  );
}
