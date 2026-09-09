import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Offer from '@/models/Offer';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    let query = {};
    if (!all) {
      const now = new Date();
      query = {
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      };
    }

    const offers = await Offer.find(query).sort({ createdAt: -1 });
    return NextResponse.json(offers);
  } catch (err) {
    console.error('API Get Offers Error:', err);
    return NextResponse.json({ error: 'Failed to load offers.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const body = await request.json();
    const {
      name, description, imageUrl, images,
      price, offerPrice, mrpIllusion, discountPercent,
      category, badge, stock, rating, condition,
      startDate, endDate, comboContents
    } = body;

    if (!name || !description || !price || !offerPrice || !startDate || !endDate) {
      return NextResponse.json({ error: 'Required fields missing.' }, { status: 400 });
    }

    const newOffer = new Offer({
      name,
      description,
      imageUrl: imageUrl || (images && images.length > 0 ? images[0] : ''),
      images: images || [],
      price: parseFloat(price),
      offerPrice: parseFloat(offerPrice),
      mrpIllusion: mrpIllusion ? parseFloat(mrpIllusion) : null,
      discountPercent: discountPercent ? parseFloat(discountPercent) : null,
      category: category || 'General',
      badge: badge || 'Limited Offer',
      stock: parseInt(stock, 10) || 0,
      rating: parseFloat(rating) || 0,
      condition: condition || 'First 60 customers only allowed',
      comboContents: comboContents || '',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: true,
    });

    await newOffer.save();
    return NextResponse.json({ msg: 'Offer created successfully', offer: newOffer }, { status: 201 });
  } catch (err) {
    console.error('API Create Offer Error:', err);
    return NextResponse.json({ error: 'Failed to create offer.' }, { status: 500 });
  }
}
