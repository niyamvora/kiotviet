/**
 * KiotViet Products API Route
 * Server-side proxy for KiotViet Products API to avoid CORS
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, retailer, skip = 0, take = 100 } = await request.json();

    if (!accessToken || !retailer) {
      return NextResponse.json(
        { error: 'Missing accessToken or retailer' },
        { status: 400 }
      );
    }

    const url = `https://public.kiotapi.com/products?skip=${skip}&take=${take}`;

    console.log('📦 Fetching products from KiotViet API...');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Retailer': retailer,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Products API failed:', response.status, errorText);
      return NextResponse.json(
        { error: `Products API failed: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Products fetched successfully:', data.data?.length || 0, 'items');

    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ Products API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
