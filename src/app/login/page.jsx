'use client';

import React, { Suspense } from 'react';
import AuthCard from '@/components/AuthCard';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="auth-page-root">
        <div className="auth-card-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: '#0f3d2a', fontWeight: 650 }}>Loading Venthulir Portal...</p>
        </div>
      </div>
    }>
      <AuthCard initialMode="login" />
    </Suspense>
  );
}
