import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  Building, 
  CheckCircle2, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Loader2, 
  KeyRound,
  Truck,
  Leaf,
  Award,
  ShieldCheck
} from 'lucide-react';
import './LoginPage.css';

export default function LoginPage({ initialTab = 'login' }) {
  const { 
    isAuthenticated, 
    login, 
    register, 
    requestOTP, 
    requestRegisterOTP, 
    verifyOTP, 
    verifyRegisterOTP,
    forgotPassword 
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/home';

  const [tab, setTab] = useState(initialTab); // 'login' | 'register' | 'otp' | 'verify' | 'forgot'
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    otp: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'register' || location.pathname === '/register') {
      setTab('register');
    } else if (tabParam === 'login' || location.pathname === '/login' || location.pathname === '/signin') {
      setTab('login');
    }
  }, [location]);

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Sign In Handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await requestOTP(form.email, form.password);
      if (res.success) {
        setSuccessMessage('OTP code sent successfully to your registered email.');
        setTab('otp');
      } else {
        setErrorMessage(res.msg || 'Invalid login credentials. Please check your email and password.');
      }
    } catch (err) {
      setErrorMessage('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify Login OTP
  const handleVerifyLoginOTP = async (e) => {
    e.preventDefault();
    if (!form.otp || form.otp.trim().length < 4) {
      setErrorMessage('Please enter the verification code sent to your email.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await verifyOTP(form.email, form.otp.trim());
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMessage(res.msg || 'Invalid or expired OTP code. Please try again.');
      }
    } catch (err) {
      setErrorMessage('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Send Registration OTP
  const handleSendRegisterOTP = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      setErrorMessage('Please fill in all mandatory fields.');
      return;
    }
    if (form.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await requestRegisterOTP(form.email);
      if (res.success) {
        setSuccessMessage('Verification code sent! Please check your email inbox.');
        setTab('verify');
      } else {
        setErrorMessage(res.msg || 'Could not send verification OTP. Email might already be registered.');
      }
    } catch (err) {
      setErrorMessage('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify Registration & Complete Signup
  const handleCompleteRegister = async (e) => {
    e.preventDefault();
    if (!form.otp) {
      setErrorMessage('Please enter the OTP verification code.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const verifyRes = await verifyRegisterOTP(form.email, form.otp.trim());
      if (verifyRes.success) {
        const regRes = await register(
          form.name,
          form.email,
          form.phone,
          form.password,
          form.address,
          form.city,
          form.state,
          form.zipCode,
          form.otp.trim()
        );
        if (regRes.success) {
          navigate(from, { replace: true });
        } else {
          setErrorMessage(regRes.msg || 'Registration failed.');
        }
      } else {
        setErrorMessage(verifyRes.msg || 'Invalid verification OTP.');
      }
    } catch (err) {
      setErrorMessage('Something went wrong during account creation.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Request
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!form.email) {
      setErrorMessage('Please enter your account email address.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await forgotPassword(form.email);
      if (res.success) {
        setSuccessMessage('Password reset instructions have been sent to your email.');
      } else {
        setErrorMessage(res.msg || 'Could not initiate password reset.');
      }
    } catch (err) {
      setErrorMessage('Error connecting to authentication service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-root">
      <Helmet>
        <title>
          {tab === 'register' 
            ? 'Create Account | Venthulir Pure Organic' 
            : 'Sign In | Venthulir Pure Organic'}
        </title>
        <meta name="description" content="Sign in or register for Venthulir Pure Organic Products. Authentic cold-pressed oils, spice powders, and farm harvests." />
      </Helmet>

      <div className="auth-container-box">
        
        {/* Top Back Navigation Bar */}
        <div className="auth-nav-bar-top">
          <Link to="/" className="auth-back-button">
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
          
          {/* ── LEFT SIDE: REAL ORGANIC FARM LIFESTYLE IMAGE ── */}
          <div className="auth-visual-image-column">
            <img 
              src="/images/auth-side-image.jpg" 
              alt="Venthulir Pure Organic Farm Harvest" 
              className="auth-visual-bg-img"
              onError={(e) => {
                // Fallback to story image if path fails
                e.target.src = '/story-traditional.jpg';
              }}
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

          {/* ── RIGHT SIDE: COMPACT AUTH FORM ── */}
          <div className="auth-form-column-right">
            
            <div className="auth-brand-badge">
              <Sparkles size={13} />
              <span>Imperial Membership</span>
            </div>

            {/* 1. OTP LOGIN VERIFICATION */}
            {tab === 'otp' && (
              <div className="tab-pane-box">
                <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                  <div style={{ width: '44px', height: '44px', background: '#eaf6ef', color: '#14532d', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                    <KeyRound size={22} />
                  </div>
                  <h1 className="auth-main-title">Enter Verification Code</h1>
                  <p className="auth-main-subtitle">
                    We sent a 6-digit OTP code to <strong>{form.email}</strong>
                  </p>
                </div>

                {successMessage && <div className="auth-alert-message info">{successMessage}</div>}
                {errorMessage && <div className="auth-alert-message error">{errorMessage}</div>}

                <form onSubmit={handleVerifyLoginOTP} className="auth-inner-form">
                  <div className="auth-input-group">
                    <label>6-Digit Code</label>
                    <div className="auth-input-wrapper">
                      <input 
                        type="text" 
                        placeholder="••••••" 
                        maxLength={6}
                        value={form.otp} 
                        onChange={(e) => updateField('otp', e.target.value)}
                        style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '1.25rem', paddingLeft: '12px' }}
                        autoFocus
                        required 
                      />
                    </div>
                  </div>

                  <button type="submit" className="auth-action-btn" disabled={loading}>
                    {loading ? <Loader2 size={16} className="spin-icon" /> : 'Verify & Enter Account →'}
                  </button>
                </form>

                <div className="auth-switch-bar">
                  Wrong email?{' '}
                  <button type="button" className="auth-switch-btn" onClick={() => { setTab('login'); setErrorMessage(''); }}>
                    Change Email
                  </button>
                </div>
              </div>
            )}

            {/* 2. OTP REGISTER VERIFICATION */}
            {tab === 'verify' && (
              <div className="tab-pane-box">
                <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                  <div style={{ width: '44px', height: '44px', background: '#eaf6ef', color: '#14532d', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                    <CheckCircle2 size={22} />
                  </div>
                  <h1 className="auth-main-title">Verify Email</h1>
                  <p className="auth-main-subtitle">
                    Enter the code sent to <strong>{form.email}</strong>
                  </p>
                </div>

                {successMessage && <div className="auth-alert-message info">{successMessage}</div>}
                {errorMessage && <div className="auth-alert-message error">{errorMessage}</div>}

                <form onSubmit={handleCompleteRegister} className="auth-inner-form">
                  <div className="auth-input-group">
                    <label>6-Digit Code</label>
                    <div className="auth-input-wrapper">
                      <input 
                        type="text" 
                        placeholder="••••••" 
                        maxLength={6}
                        value={form.otp} 
                        onChange={(e) => updateField('otp', e.target.value)}
                        style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '1.25rem', paddingLeft: '12px' }}
                        autoFocus
                        required 
                      />
                    </div>
                  </div>

                  <button type="submit" className="auth-action-btn" disabled={loading}>
                    {loading ? <Loader2 size={16} className="spin-icon" /> : 'Complete Registration →'}
                  </button>
                </form>

                <div className="auth-switch-bar">
                  Need to change details?{' '}
                  <button type="button" className="auth-switch-btn" onClick={() => { setTab('register'); setErrorMessage(''); }}>
                    Go Back
                  </button>
                </div>
              </div>
            )}

            {/* 3. FORGOT PASSWORD */}
            {tab === 'forgot' && (
              <div className="tab-pane-box">
                <h1 className="auth-main-title">Reset Password</h1>
                <p className="auth-main-subtitle">
                  Enter your registered email to receive reset instructions.
                </p>

                {successMessage && <div className="auth-alert-message info">{successMessage}</div>}
                {errorMessage && <div className="auth-alert-message error">{errorMessage}</div>}

                <form onSubmit={handleForgotPassword} className="auth-inner-form">
                  <div className="auth-input-group">
                    <label>Registered Email</label>
                    <div className="auth-input-wrapper">
                      <Mail size={16} className="input-icon" />
                      <input 
                        type="email" 
                        placeholder="you@email.com" 
                        value={form.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <button type="submit" className="auth-action-btn" disabled={loading}>
                    {loading ? <Loader2 size={16} className="spin-icon" /> : 'Send Reset Link →'}
                  </button>
                </form>

                <div className="auth-switch-bar">
                  Remember password?{' '}
                  <button type="button" className="auth-switch-btn" onClick={() => { setTab('login'); setErrorMessage(''); setSuccessMessage(''); }}>
                    Sign In
                  </button>
                </div>
              </div>
            )}

            {/* 4. SIGN IN TAB */}
            {tab === 'login' && (
              <div className="tab-pane-box">
                <h1 className="auth-main-title">Welcome Back</h1>
                <p className="auth-main-subtitle">
                  Sign in to track orders, manage addresses, and view cart.
                </p>

                <div className="auth-tabs-toggle">
                  <button type="button" className="auth-toggle-tab active">Sign In</button>
                  <button type="button" className="auth-toggle-tab" onClick={() => { setTab('register'); setErrorMessage(''); setSuccessMessage(''); }}>Create Account</button>
                </div>

                {errorMessage && <div className="auth-alert-message error">{errorMessage}</div>}
                {successMessage && <div className="auth-alert-message info">{successMessage}</div>}

                <form onSubmit={handleLoginSubmit} className="auth-inner-form">
                  <div className="auth-input-group">
                    <label>Email Address</label>
                    <div className="auth-input-wrapper">
                      <Mail size={16} className="input-icon" />
                      <input 
                        type="email" 
                        placeholder="name@example.com" 
                        value={form.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label>
                      <span>Password</span>
                      <button 
                        type="button" 
                        className="auth-switch-btn"
                        style={{ fontSize: '0.78rem' }}
                        onClick={() => { setTab('forgot'); setErrorMessage(''); }}
                      >
                        Forgot?
                      </button>
                    </label>
                    <div className="auth-input-wrapper">
                      <Lock size={16} className="input-icon" />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="••••••••" 
                        value={form.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        required 
                      />
                      <button 
                        type="button" 
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(v => !v)}
                        aria-label="Toggle password"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="auth-action-btn" disabled={loading}>
                    {loading ? <Loader2 size={16} className="spin-icon" /> : 'Continue with OTP →'}
                  </button>
                </form>

                <div className="auth-switch-bar">
                  New to Venthulir?{' '}
                  <button type="button" className="auth-switch-btn" onClick={() => { setTab('register'); setErrorMessage(''); }}>
                    Create account
                  </button>
                </div>
              </div>
            )}

            {/* 5. CREATE ACCOUNT TAB */}
            {tab === 'register' && (
              <div className="tab-pane-box">
                <h1 className="auth-main-title">Create Account</h1>
                <p className="auth-main-subtitle">
                  Join 50,000+ conscious families enjoying pure organic harvests.
                </p>

                <div className="auth-tabs-toggle">
                  <button type="button" className="auth-toggle-tab" onClick={() => { setTab('login'); setErrorMessage(''); }}>Sign In</button>
                  <button type="button" className="auth-toggle-tab active">Create Account</button>
                </div>

                {errorMessage && <div className="auth-alert-message error">{errorMessage}</div>}
                {successMessage && <div className="auth-alert-message info">{successMessage}</div>}

                <form onSubmit={handleSendRegisterOTP} className="auth-inner-form">
                  <div className="form-grid-2">
                    <div className="auth-input-group">
                      <label>Full Name *</label>
                      <div className="auth-input-wrapper">
                        <UserIcon size={15} className="input-icon" />
                        <input 
                          type="text" 
                          placeholder="Your name" 
                          value={form.name}
                          onChange={(e) => updateField('name', e.target.value)}
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
                          value={form.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label>Email Address *</label>
                    <div className="auth-input-wrapper">
                      <Mail size={15} className="input-icon" />
                      <input 
                        type="email" 
                        placeholder="you@domain.com" 
                        value={form.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label>Password *</label>
                    <div className="auth-input-wrapper">
                      <Lock size={15} className="input-icon" />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="Min. 6 characters" 
                        value={form.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        required 
                      />
                      <button 
                        type="button" 
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(v => !v)}
                        aria-label="Toggle password"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label>Delivery Address</label>
                    <div className="auth-input-wrapper">
                      <MapPin size={15} className="input-icon" />
                      <input 
                        type="text" 
                        placeholder="Street / Flat / Area" 
                        value={form.address}
                        onChange={(e) => updateField('address', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-grid-3">
                    <div className="auth-input-group">
                      <label>City</label>
                      <div className="auth-input-wrapper">
                        <Building size={15} className="input-icon" />
                        <input 
                          type="text" 
                          placeholder="City" 
                          value={form.city}
                          onChange={(e) => updateField('city', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="auth-input-group">
                      <label>State</label>
                      <div className="auth-input-wrapper">
                        <input 
                          type="text" 
                          placeholder="Tamil Nadu" 
                          style={{ paddingLeft: '12px' }}
                          value={form.state}
                          onChange={(e) => updateField('state', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="auth-input-group">
                      <label>PIN</label>
                      <div className="auth-input-wrapper">
                        <input 
                          type="text" 
                          placeholder="600001" 
                          maxLength={6}
                          style={{ paddingLeft: '12px' }}
                          value={form.zipCode}
                          onChange={(e) => updateField('zipCode', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="auth-action-btn" disabled={loading}>
                    {loading ? <Loader2 size={16} className="spin-icon" /> : 'Send Verification OTP →'}
                  </button>
                </form>

                <div className="auth-switch-bar">
                  Already registered?{' '}
                  <button type="button" className="auth-switch-btn" onClick={() => { setTab('login'); setErrorMessage(''); }}>
                    Sign in
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
