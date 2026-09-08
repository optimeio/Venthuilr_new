import React, { useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar        from './components/Navbar';
import CartDrawer    from './components/CartDrawer';
import AuthModal     from './components/AuthModal';
import CheckoutModal from './components/CheckoutModal';
import HomePage      from './pages/HomePage';
import Footer        from './components/Footer';

export default function App() {
  const [authOpen,    setAuthOpen]    = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);  // null = closed

  const openCheckout = (cartSummary) => {
    setCheckoutData(cartSummary);
  };

  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <Navbar onAuthOpen={() => setAuthOpen(true)} />

          <CartDrawer onCheckout={openCheckout} />

          <HomePage
            onAuthOpen={() => setAuthOpen(true)}
            onCheckout={openCheckout}
          />

          <Footer />

          {authOpen && (
            <AuthModal onClose={() => setAuthOpen(false)} />
          )}

          {checkoutData && (
            <CheckoutModal
              cartSummary={checkoutData}
              onClose={() => setCheckoutData(null)}
              onAuthOpen={() => { setCheckoutData(null); setAuthOpen(true); }}
            />
          )}

          <ToastContainer position="bottom-right" autoClose={3000} theme="light" />
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
