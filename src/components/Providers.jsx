'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider, useCart } from '@/context/CartContext';
import Preloader from '@/components/Preloader';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AuthModal from '@/components/AuthModal';
import CheckoutModal from '@/components/CheckoutModal';
import ThemePreviewBar from '@/components/ThemePreviewBar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const UIModalContext = createContext();
export const useUIModal = () => useContext(UIModalContext);

function ProvidersInner({ children }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const { setIsCartOpen } = useCart();

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      syncTouch: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const updateLenis = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
    };
  }, []);

  const openCheckout = (cartSummary) => {
    setIsCartOpen(false);
    setCheckoutData(cartSummary);
  };

  return (
    <UIModalContext.Provider value={{ setAuthOpen, openCheckout }}>
      <Preloader minDuration={2200} />
      <Navbar
        onAuthOpen={() => setAuthOpen(true)}
      />

      <CartDrawer onCheckout={openCheckout} />

      <main>{children}</main>

      <Footer />

      {authOpen && (
        <AuthModal onClose={() => setAuthOpen(false)} />
      )}

      {checkoutData && (
        <CheckoutModal
          cartSummary={checkoutData}
          onClose={() => setCheckoutData(null)}
          onAuthOpen={() => {
            setCheckoutData(null);
            setAuthOpen(true);
          }}
        />
      )}

      <ThemePreviewBar />

      <ToastContainer position="bottom-right" autoClose={3000} theme="light" />
    </UIModalContext.Provider>
  );
}

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <ProvidersInner>{children}</ProvidersInner>
      </CartProvider>
    </AuthProvider>
  );
}
