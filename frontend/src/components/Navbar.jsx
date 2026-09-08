import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Menu, X, User, LogOut, ChevronDown, Search, Sparkles, Truck, ShieldCheck } from 'lucide-react';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Home',       path: '/home',       href: '#home' },
  { label: 'Products',   path: '/products',   href: '#products' },
  { label: 'Categories', path: '/categories', href: '#categories' },
  { label: 'Our Story',  path: '/story',      href: '#story' },
  { label: 'Reviews',    path: '/reviews',    href: '#reviews' },
  { label: 'Contact',    path: '/contact',    href: '#faq' },
];

export default function Navbar({ onAuthOpen, onSearchOpen }) {
  const { cartCount, setIsCartOpen } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [userOpen,  setUserOpen]  = useState(false);
  const dropRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const close = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setUserOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleNavClick = (link) => {
    setMenuOpen(false);
    navigate(link.path);
    const el = document.querySelector(link.href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Slim Luxury Announcement Bar */}
      <div className="announce-bar">
        <div className="announce-inner container">
          <div className="announce-item">
            <Sparkles size={13} className="announce-icon gold" />
            <span>100% Certified Organic • Tamil Nadu Heritage Farms</span>
          </div>
          <div className="announce-sep">•</div>
          <div className="announce-item">
            <Truck size={13} className="announce-icon" />
            <span>Free Delivery On Orders Above ₹499</span>
          </div>
          <div className="announce-sep">•</div>
          <div className="announce-item hide-sm">
            <ShieldCheck size={13} className="announce-icon" />
            <span>Wood Cold-Pressed &amp; Lab-Tested Purity</span>
          </div>
        </div>
      </div>

      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="navbar-inner container">
          {/* Logo */}
          <a 
            href="/home" 
            className="nav-logo" 
            onClick={(e) => { 
              e.preventDefault(); 
              handleNavClick({ path: '/home', href: '#home' }); 
            }}
          >
            <img src="/logo.png" alt="Venthulir" className="logo-img" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
            <span className="logo-text" style={{display:'none'}}>VENTHULIR</span>
          </a>

          {/* Desktop Links */}
          <ul className="nav-links">
            {NAV_LINKS.map(l => (
              <li key={l.label}>
                <a 
                  href={l.path} 
                  className={location.pathname === l.path ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); handleNavClick(l); }}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="nav-actions">
            <button className="nav-icon-btn" onClick={onSearchOpen} title="Search">
              <Search size={20} />
            </button>

            <button className="nav-icon-btn cart-btn" onClick={() => setIsCartOpen(true)} title="View Cart">
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            {isAuthenticated ? (
              <div className="user-menu" ref={dropRef}>
                <button className="btn-primary nav-auth-btn" onClick={() => setUserOpen(v => !v)}>
                  <User size={15} />
                  <span>{user?.name?.split(' ')[0] || 'Account'}</span>
                </button>
                {userOpen && (
                  <div className="user-dropdown animate-fade-up">
                    <div className="user-dropdown-header">
                      <span className="user-name">{user?.name}</span>
                      <span className="user-email">{user?.email}</span>
                    </div>
                    <button className="user-dropdown-item logout" onClick={() => { setUserOpen(false); logout(); }}>
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="btn-primary nav-auth-btn" onClick={onAuthOpen}>
                <User size={15} />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile hamburger */}
            <button className="hamburger" onClick={() => setMenuOpen(v => !v)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="mobile-menu animate-slide-down">
            {NAV_LINKS.map(l => (
              <a 
                key={l.label} 
                href={l.path} 
                className={location.pathname === l.path ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); handleNavClick(l); }}
              >
                {l.label}
              </a>
            ))}
            {!isAuthenticated && (
              <button className="btn-primary" style={{margin:'8px 20px'}} onClick={() => { setMenuOpen(false); onAuthOpen(); }}>Sign In</button>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
