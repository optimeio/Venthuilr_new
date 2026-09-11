import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Offer from '@/models/Offer';
import { requireAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const offer = await Offer.findById(id);
    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }
    return NextResponse.json(offer);
  } catch (err) {
    console.error('API Get Offer Error:', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const offer = await Offer.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json(offer);
  } catch (err) {
    console.error('API Update Offer Error:', err);
    return NextResponse.json({ error: err.message || 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const { id } = await params;
    const offer = await Offer.findByIdAndDelete(id);
    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({ msg: 'Offer deleted successfully' });
  } catch (err) {
    console.error('API Delete Offer Error:', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
