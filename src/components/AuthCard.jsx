'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  Sparkles, 
  MapPin,
  Leaf,
  ShieldCheck,
  Truck,
  Loader2,
  KeyRound,
  RotateCw
} from 'lucide-react';
import '../app/login/AuthPages.css';

export default function AuthCard({ initialMode = 'login' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/profile';

  // Modes: 'login' | 'login-otp' | 'register' | 'register-otp'
  const [mode, setMode] = useState(initialMode);
  const { requestOTP, verifyOTP, register, requestRegisterOTP, verifyRegisterOTP } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: 'Tamil Nadu',
    zipCode: ''
  });
  const [regOtp, setRegOtp] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // OTP resend timers
  const [resendTimer, setResendTimer] = useState(0);

  // Shared state
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const handleTabSwitch = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setError('');
    setSuccessMsg('');
    setLoginOtp('');
    setRegOtp('');
    if (typeof window !== 'undefined') {
      const targetPath = newMode === 'register' ? '/register' : '/login';
      const newPath = `${targetPath}${redirect !== '/profile' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`;
      window.history.replaceState(null, '', newPath);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Direct Password Login (Instant 1-step sign-in)
  const handleDirectPasswordLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError('Please enter both username/email and password.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await login(loginEmail.trim(), loginPassword);
      if (res.success) {
        setSuccessMsg('Signed in successfully! Redirecting...');
        const isAdmin = res.user?.isAdmin || res.user?.role === 'admin' || loginEmail.trim().toLowerCase() === 'admin' || loginEmail.trim().toLowerCase() === 'admin@venthulir.com';
        setTimeout(() => {
          if (isAdmin) {
            router.push('/admin');
          } else {
            router.push(redirect === '/admin' ? '/admin' : redirect);
          }
        }, 500);
      } else {
        setError(res.msg || 'Invalid credentials. Please check your username/password.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send Login OTP
  const handleSendLoginOTP = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await requestOTP(loginEmail.toLowerCase().trim(), loginPassword);
      if (res.success) {
        setSuccessMsg(`A 6-digit login verification code has been sent to ${loginEmail}`);
        setMode('login-otp');
        setResendTimer(60);
      } else {
        setError(res.msg || 'Invalid email or password. Please check your credentials.');
      }
    } catch {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Login OTP & Enter
  const handleVerifyLoginOTP = async (e) => {
    e.preventDefault();
    if (!loginOtp || loginOtp.trim().length < 4) {
      setError('Please enter the 6-digit code sent to your email.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await verifyOTP(loginEmail.toLowerCase().trim(), loginOtp.trim());
      if (res.success) {
        setSuccessMsg('Signed in successfully! Redirecting...');
        const isAdmin = res.user?.isAdmin || res.user?.role === 'admin' || loginEmail.trim().toLowerCase() === 'admin' || loginEmail.trim().toLowerCase() === 'admin@venthulir.com';
        setTimeout(() => {
          if (isAdmin) {
            router.push('/admin');
          } else {
            router.push(redirect);
          }
        }, 500);
      } else {
        setError(res.msg || 'Invalid or expired verification code. Please try again.');
      }
    } catch {
      setError('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend Login OTP
  const handleResendLoginOTP = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError('');
    try {
      const res = await requestOTP(loginEmail.toLowerCase().trim(), loginPassword);
      if (res.success) {
        setSuccessMsg('A new verification code has been sent to your email.');
        setResendTimer(60);
      } else {
        setError(res.msg || 'Failed to resend code.');
      }
    } catch {
      setError('Error resending verification code.');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 2. REGISTRATION FLOW
  // ─────────────────────────────────────────────────────────────

  // Step 1: Send Registration OTP
  const handleSendRegisterOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regData.name.trim() || !regData.email.trim() || !regData.phone.trim() || !regData.password) {
      setError('Please fill in all mandatory fields (Name, Email, Phone, Password).');
      return;
    }

    if (regData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (regData.password !== regData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to terms & conditions to proceed.');
      return;
    }

    setLoading(true);

    try {
      const res = await requestRegisterOTP(regData.email.toLowerCase().trim());
      if (res.success) {
        setSuccessMsg(`A 6-digit verification code has been sent to ${regData.email}`);
        setMode('register-otp');
        setResendTimer(60);
      } else {
        setError(res.msg || 'Could not send verification code. Email might already be registered.');
      }
    } catch {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Registration OTP & Save in MongoDB
  const handleVerifyRegisterOTP = async (e) => {
    e.preventDefault();
    if (!regOtp || regOtp.trim().length < 4) {
      setError('Please enter the 6-digit code sent to your email.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const verifyRes = await verifyRegisterOTP(regData.email.toLowerCase().trim(), regOtp.trim());
      if (!verifyRes.success) {
        setError(verifyRes.msg || 'Invalid or expired verification code. Please try again.');
        setLoading(false);
        return;
      }

      // Complete customer registration in MongoDB
      const regRes = await register(
        regData.name.trim(),
        regData.email.toLowerCase().trim(),
        regData.phone.trim(),
        regData.password,
        regData.address.trim(),
        regData.city.trim(),
        regData.state.trim() || 'Tamil Nadu',
        regData.zipCode.trim(),
        regOtp.trim()
      );

      if (regRes.success) {
        setSuccessMsg('🎉 Account created successfully! Welcome to Venthulir.');
        setTimeout(() => {
          router.push(redirect);
        }, 850);
      } else {
        setError(regRes.msg || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Something went wrong during account creation.');
    } finally {
      setLoading(false);
    }
  };

  // Resend Registration OTP
  const handleResendRegisterOTP = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError('');
    try {
      const res = await requestRegisterOTP(regData.email.toLowerCase().trim());
      if (res.success) {
        setSuccessMsg('A new verification code has been sent to your email.');
        setResendTimer(60);
      } else {
        setError(res.msg || 'Failed to resend code.');
      }
    } catch {
      setError('Error resending verification code.');
    } finally {
      setLoading(false);
    }
  };

  const isOtpStep = mode === 'login-otp' || mode === 'register-otp';

  return (
    <div className="auth-page-root">
      <div className="auth-container-box">

        {/* Top Back Navigation Bar */}
        <div className="auth-nav-bar-top">
          <Link href="/" className="auth-back-button">
            <ArrowLeft size={15} />
            <span>Back to Store</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#14532d', fontWeight: '700' }}>
            <Sparkles size={14} />
            <span>100% Secure SSL Checkout</span>
          </div>
        </div>

        {/* ── MAIN SPLIT CARD: LEFT IMAGE + RIGHT FORM ── */}
        <div className="auth-split-image-card">
          
          {/* ── LEFT SIDE: ORGANIC FARM LIFESTYLE BANNER ── */}
          <div className="auth-visual-image-column">
            <img 
              src="/story-traditional.jpg" 
              alt="Venthulir Pure Organic Farm Harvest" 
              className="auth-visual-bg-img"
            />
            <div className="auth-visual-overlay" />

            {/* Top Brand Pill */}
            <div className="auth-visual-content-top">
              <div className="auth-image-brand-pill">
                <Leaf size={13} />
                <span>Tamil Nadu Organic Harvest</span>
              </div>
            </div>

            {/* Bottom Content & Badges */}
            <div className="auth-visual-content-bottom">
              <h2 className="auth-image-tagline">
                Pure Goodness.<br />From Tamil Nadu Farms.
              </h2>
              <p className="auth-image-subtext">
                Wood-pressed oils, unadulterated spices, and pure wild honey delivered fresh to your kitchen.
              </p>

              <div className="auth-image-badges">
                <div className="auth-image-badge-item">
                  <Leaf size={15} className="badge-icon" />
                  <span>100% Cold & Wood-Pressed</span>
                </div>
                <div className="auth-image-badge-item">
                  <ShieldCheck size={15} className="badge-icon" />
                  <span>Direct Farmer Partnered</span>
                </div>
                <div className="auth-image-badge-item">
                  <Truck size={15} className="badge-icon" />
                  <span>Pan-India Express Dispatch</span>
                </div>
              </div>

              <div className="auth-image-trust-row">
                <div className="trust-stat-item">
                  <strong>50,000+</strong>
                  <span>Happy Families</span>
                </div>
                <div className="trust-stat-item">
                  <strong>4.9 ★</strong>
                  <span>Rating</span>
                </div>
                <div className="trust-stat-item">
                  <strong>100%</strong>
                  <span>Chemical-Free</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDE: AUTHENTICATION FORM ── */}
          <div className="auth-form-column-right">
            
            <div className="auth-brand-badge">
              <Sparkles size={13} />
              <span>Imperial Membership</span>
            </div>

            <h1 className="auth-main-title">
              {mode === 'login' 
                ? 'Welcome Back' 
                : mode === 'login-otp' 
                ? 'Security Verification' 
                : mode === 'register-otp'
                ? 'Verify Your Email'
                : 'Create Account'}
            </h1>
            <p className="auth-main-subtitle">
              {mode === 'login' 
                ? 'Sign in to access your orders, saved addresses, and member discounts.' 
                : mode === 'login-otp'
                ? `Enter the 6-digit code sent to ${loginEmail}`
                : mode === 'register-otp'
                ? `Enter the 6-digit code sent to ${regData.email}`
                : 'Join 50,000+ conscious families enjoying pure organic harvests.'}
            </p>

            {/* Switch Tabs (Only when not in OTP verification step) */}
            {!isOtpStep && (
              <div className="auth-tabs-toggle">
                <button 
                  type="button" 
                  className={`auth-toggle-tab ${mode === 'login' ? 'active' : ''}`} 
                  onClick={() => handleTabSwitch('login')}
                >
                  Sign In
                </button>
                <button 
                  type="button" 
                  className={`auth-toggle-tab ${mode === 'register' ? 'active' : ''}`} 
                  onClick={() => handleTabSwitch('register')}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Error & Success Feedback */}
            {error && <div className="auth-alert-message error">{error}</div>}
            {successMsg && (
              <div className="auth-alert-message info">
                <CheckCircle2 size={16} /> {successMsg}
              </div>
            )}

            {/* ── 1. SIGN IN (EMAIL + PASSWORD) ── */}
            {mode === 'login' && (
              <form onSubmit={handleDirectPasswordLogin} className="auth-inner-form">
                <div className="auth-input-group">
                  <label htmlFor="login-email">Username or Email Address</label>
                  <div className="auth-input-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input 
                      id="login-email"
                      type="text" 
                      placeholder="Username (e.g. admin) or Email" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="login-password">
                    <span>Password</span>
                    <Link href="/forgot-password" className="auth-switch-btn" style={{ fontSize: '0.78rem', textDecoration: 'none' }}>
                      Forgot?
                    </Link>
                  </label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input 
                      id="login-password"
                      type={showPass ? 'text' : 'password'} 
                      placeholder="••••••••" 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required 
                    />
                    <button 
                      type="button" 
                      className="password-toggle-btn"
                      onClick={() => setShowPass(v => !v)}
                      aria-label="Toggle password"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '2px 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', color: '#4a6756', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ accentColor: '#0f3d2a', width: '15px', height: '15px', cursor: 'pointer' }}
                    />
                    Keep me signed in
                  </label>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                  <button type="submit" className="auth-action-btn" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 size={16} className="spin-icon" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In with Password</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <button 
                    type="button" 
                    onClick={handleSendLoginOTP} 
                    disabled={loading}
                    style={{
                      background: '#edf6f1',
                      border: '1.5px solid #badcc7',
                      color: '#0f3d2a',
                      borderRadius: 'var(--radius-full, 9999px)',
                      padding: '9px 16px',
                      fontSize: '0.82rem',
                      fontWeight: '750',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <KeyRound size={14} />
                    <span>Or Sign In with Email OTP</span>
                  </button>
                </div>

                <div className="auth-switch-bar">
                  New to Venthulir?{' '}
                  <button type="button" className="auth-switch-btn" onClick={() => handleTabSwitch('register')}>
                    Create an account
                  </button>
                </div>
              </form>
            )}

            {/* ── 2. LOGIN OTP VERIFICATION ── */}
            {mode === 'login-otp' && (
              <form onSubmit={handleVerifyLoginOTP} className="auth-inner-form">
                <div style={{ textAlign: 'center', margin: '4px 0 10px' }}>
                  <div style={{ width: '48px', height: '48px', background: '#eaf6ef', color: '#14532d', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                    <KeyRound size={24} />
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#4b5d52', margin: 0, lineHeight: 1.4 }}>
                    We sent a 6-digit login verification code to<br />
                    <strong style={{ color: '#0b3d2e' }}>{loginEmail}</strong>
                  </p>
                </div>

                <div className="auth-input-group">
                  <label style={{ justifyContent: 'center' }}>6-Digit Verification Code</label>
                  <div className="auth-input-wrapper">
                    <input 
                      type="text" 
                      placeholder="••••••" 
                      maxLength={6}
                      value={loginOtp} 
                      onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                      style={{ 
                        textAlign: 'center', 
                        letterSpacing: '8px', 
                        fontSize: '1.4rem', 
                        fontWeight: '800', 
                        color: '#0f3d2a',
                        padding: '12px 14px' 
                      }}
                      autoFocus
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="auth-action-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Enter Account</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.82rem' }}>
                  <button 
                    type="button" 
                    className="auth-switch-btn" 
                    onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                  >
                    ← Edit Credentials
                  </button>

                  <button 
                    type="button" 
                    className="auth-switch-btn" 
                    onClick={handleResendLoginOTP}
                    disabled={resendTimer > 0 || loading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: resendTimer > 0 ? 0.6 : 1 }}
                  >
                    <RotateCw size={13} />
                    <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* ── 3. REGISTER (DETAILS ENTRY) ── */}
            {mode === 'register' && (
              <form onSubmit={handleSendRegisterOTP} className="auth-inner-form">
                <div className="form-grid-2">
                  <div className="auth-input-group">
                    <label>Full Name *</label>
                    <div className="auth-input-wrapper">
                      <User size={15} className="input-icon" />
                      <input 
                        type="text" 
                        placeholder="Your name" 
                        value={regData.name}
                        onChange={(e) => setRegData(p => ({ ...p, name: e.target.value }))}
                        required 
                      />
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label>Phone *</label>
                    <div className="auth-input-wrapper">
                      <Phone size={15} className="input-icon" />
                      <input 
                        type="tel" 
                        placeholder="+91 98765 43210" 
                        value={regData.phone}
                        onChange={(e) => setRegData(p => ({ ...p, phone: e.target.value }))}
                        required 
                      />
                    </div>
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Email Address (OTP Verification required) *</label>
                  <div className="auth-input-wrapper">
                    <Mail size={15} className="input-icon" />
                    <input 
                      type="email" 
                      placeholder="you@domain.com" 
                      value={regData.email}
                      onChange={(e) => setRegData(p => ({ ...p, email: e.target.value }))}
                      required 
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="auth-input-group">
                    <label>Password *</label>
                    <div className="auth-input-wrapper">
                      <Lock size={15} className="input-icon" />
                      <input 
                        type={showPass ? 'text' : 'password'} 
                        placeholder="Min. 6 chars" 
                        value={regData.password}
                        onChange={(e) => setRegData(p => ({ ...p, password: e.target.value }))}
                        required 
                      />
                      <button 
                        type="button" 
                        className="password-toggle-btn"
                        onClick={() => setShowPass(v => !v)}
                        aria-label="Toggle password"
                      >
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label>Confirm Password *</label>
                    <div className="auth-input-wrapper">
                      <Lock size={15} className="input-icon" />
                      <input 
                        type={showPass ? 'text' : 'password'} 
                        placeholder="Re-enter password" 
                        value={regData.confirmPassword}
                        onChange={(e) => setRegData(p => ({ ...p, confirmPassword: e.target.value }))}
                        required 
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Address (Optional) */}
                <details style={{ marginTop: '2px', padding: '4px 0', borderTop: '1px dashed #dce8e0' }}>
                  <summary style={{ fontSize: '0.74rem', fontWeight: 800, color: '#166534', cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '6px', userSelect: 'none' }}>
                    <MapPin size={13} />
                    <span>+ Add Delivery Address Now (Optional)</span>
                  </summary>
                  
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: '1.5px solid #dce8e0',
                        borderRadius: '8px',
                        fontSize: '0.84rem',
                        outline: 'none',
                        background: '#fafcfb'
                      }}
                      type="text"
                      placeholder="Door No, Street Name, Area"
                      value={regData.address}
                      onChange={(e) => setRegData(p => ({ ...p, address: e.target.value }))}
                    />

                    <div className="form-grid-3">
                      <input
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1.5px solid #dce8e0',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          outline: 'none',
                          background: '#fafcfb'
                        }}
                        type="text"
                        placeholder="City"
                        value={regData.city}
                        onChange={(e) => setRegData(p => ({ ...p, city: e.target.value }))}
                      />
                      <input
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1.5px solid #dce8e0',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          outline: 'none',
                          background: '#fafcfb'
                        }}
                        type="text"
                        placeholder="Tamil Nadu"
                        value={regData.state}
                        onChange={(e) => setRegData(p => ({ ...p, state: e.target.value }))}
                      />
                      <input
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: '1.5px solid #dce8e0',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          outline: 'none',
                          background: '#fafcfb'
                        }}
                        type="text"
                        placeholder="Pincode"
                        maxLength={6}
                        value={regData.zipCode}
                        onChange={(e) => setRegData(p => ({ ...p, zipCode: e.target.value }))}
                      />
                    </div>
                  </div>
                </details>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '0.78rem', color: '#4a6756', marginTop: '2px', lineHeight: 1.4 }}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    style={{ accentColor: '#0f3d2a', width: '15px', height: '15px', marginTop: '2px', cursor: 'pointer' }}
                  />
                  <span>I agree to Venthulir&apos;s Terms of Service and Privacy Policy.</span>
                </label>

                <button type="submit" className="auth-action-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Verification</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div className="auth-switch-bar">
                  Already have an account?{' '}
                  <button type="button" className="auth-switch-btn" onClick={() => handleTabSwitch('login')}>
                    Sign in
                  </button>
                </div>
              </form>
            )}

            {/* ── 4. REGISTER OTP VERIFICATION ── */}
            {mode === 'register-otp' && (
              <form onSubmit={handleVerifyRegisterOTP} className="auth-inner-form">
                <div style={{ textAlign: 'center', margin: '4px 0 10px' }}>
                  <div style={{ width: '48px', height: '48px', background: '#eaf6ef', color: '#14532d', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                    <KeyRound size={24} />
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#4b5d52', margin: 0, lineHeight: 1.4 }}>
                    We sent a 6-digit verification code to<br />
                    <strong style={{ color: '#0b3d2e' }}>{regData.email}</strong>
                  </p>
                </div>

                <div className="auth-input-group">
                  <label style={{ justifyContent: 'center' }}>6-Digit Verification Code</label>
                  <div className="auth-input-wrapper">
                    <input 
                      type="text" 
                      placeholder="••••••" 
                      maxLength={6}
                      value={regOtp} 
                      onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ''))}
                      style={{ 
                        textAlign: 'center', 
                        letterSpacing: '8px', 
                        fontSize: '1.4rem', 
                        fontWeight: '800', 
                        color: '#0f3d2a',
                        padding: '12px 14px' 
                      }}
                      autoFocus
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="auth-action-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      <span>Verifying & Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.82rem' }}>
                  <button 
                    type="button" 
                    className="auth-switch-btn" 
                    onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
                  >
                    ← Edit Details
                  </button>

                  <button 
                    type="button" 
                    className="auth-switch-btn" 
                    onClick={handleResendRegisterOTP}
                    disabled={resendTimer > 0 || loading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: resendTimer > 0 ? 0.6 : 1 }}
                  >
                    <RotateCw size={13} />
                    <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}</span>
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
