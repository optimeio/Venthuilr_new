import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Offer from '@/models/Offer';
import { requireAdmin } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const { id } = await params;
    const fields = await request.json();
    const offer = await Offer.findById(id);

    if (!offer) return NextResponse.json({ error: 'Offer not found.' }, { status: 404 });

    if (fields.price) fields.price = parseFloat(fields.price);
    if (fields.offerPrice) fields.offerPrice = parseFloat(fields.offerPrice);
    if (fields.stock !== undefined) fields.stock = parseInt(fields.stock, 10);
    if (fields.rating !== undefined) fields.rating = parseFloat(fields.rating);
    if (fields.startDate) fields.startDate = new Date(fields.startDate);
    if (fields.endDate) fields.endDate = new Date(fields.endDate);

    Object.assign(offer, fields);
    await offer.save();

    return NextResponse.json({ msg: 'Offer updated successfully', offer });
  } catch (err) {
    console.error('API Update Offer Error:', err);
    return NextResponse.json({ error: 'Failed to update offer.' }, { status: 500 });
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
    await Offer.findByIdAndDelete(id);

    return NextResponse.json({ msg: 'Offer deleted successfully.' });
  } catch (err) {
    console.error('API Delete Offer Error:', err);
    return NextResponse.json({ error: 'Failed to delete offer.' }, { status: 500 });
  }
}
