import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Message from '@/models/Message';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(request, { params }) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const { id } = await params;
    const { status } = await request.json();

    const msg = await Message.findByIdAndUpdate(id, { status: status || 'Resolved' }, { new: true });
    if (!msg) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json(msg);
  } catch (err) {
    console.error('API Update Message Error:', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
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
    const msg = await Message.findByIdAndDelete(id);
    if (!msg) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json({ msg: 'Message deleted successfully' });
  } catch (err) {
    console.error('API Delete Message Error:', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
