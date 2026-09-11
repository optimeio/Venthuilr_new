import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { cache } from '@/lib/cache';

const DEFAULT_CATEGORIES = [
  { id: 'spices', name: 'Spices', slug: 'spices', description: 'Sun-dried and stone-ground pure native spice powders' },
  { id: 'oils', name: 'Cold-Pressed Oils', slug: 'cold-pressed-oils', description: 'Wood mortar extracted virgin oils below 40°C' },
  { id: 'masalas', name: 'Masala Blends', slug: 'masala-blends', description: 'Heritage roasted blends for traditional South Indian curries' },
  { id: 'grains', name: 'Heritage Grains', slug: 'grains', description: 'Indigenous nutrient-dense heirloom rice varieties' },
  { id: 'sweeteners', name: 'Natural Sweeteners', slug: 'sweeteners', description: 'Pure palm jaggery, raw honey and unrefined country sugar' }
];

export async function GET() {
  try {
    const cached = cache.get('categories:list');
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, s-maxage=300' }
      });
    }

    await connectDB();
    const distinctCategories = await Product.distinct('category');
    
    let result = DEFAULT_CATEGORIES;
    if (distinctCategories && distinctCategories.length > 0) {
      result = distinctCategories.map(cat => ({
        id: (cat || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: cat,
        slug: (cat || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
      }));
    }

    cache.set('categories:list', result, 300);
    return NextResponse.json(result, {
      headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, s-maxage=300' }
    });
  } catch (err) {
    console.error('Categories API error:', err);
    return NextResponse.json(DEFAULT_CATEGORIES);
  }
}
