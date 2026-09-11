import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

// In-memory / persistent config store with sensible defaults
let storeSettings = {
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
  announcementText: '🌿 Pure Heritage Harvest Direct From Tamil Nadu Farms — Express Delivery Across India!',
  announcementActive: true,
};

export async function GET(request) {
  try {
    return NextResponse.json(storeSettings);
  } catch (err) {
    console.error('API Get Settings Error:', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    storeSettings = {
      ...storeSettings,
      ...body,
      socialLinks: {
        ...storeSettings.socialLinks,
        ...(body.socialLinks || {})
      }
    };

    return NextResponse.json({ msg: 'Settings updated successfully', settings: storeSettings });
  } catch (err) {
    console.error('API Update Settings Error:', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
