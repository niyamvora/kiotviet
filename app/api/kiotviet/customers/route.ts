/**
 * KiotViet Customers API Route
 * Server-side proxy for KiotViet Customers API to avoid CORS
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      accessToken,
      retailer,
      skip = 0,
      take = 100,
    } = await request.json();

    if (!accessToken || !retailer) {
      return NextResponse.json(
        { error: "Missing accessToken or retailer" },
        { status: 400 }
      );
    }

    const url = `https://public.kiotapi.com/customers?skip=${skip}&take=${take}`;

    console.log("👥 Fetching customers from KiotViet API...");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Retailer: retailer,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Customers API failed:", response.status, errorText);
      return NextResponse.json(
        { error: `Customers API failed: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(
      "✅ Customers fetched successfully:",
      data.data?.length || 0,
      "items"
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Customers API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
