/**
 * KiotViet Invoices API Route
 * Server-side proxy for KiotViet Invoices API to avoid CORS
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      accessToken,
      retailer,
      skip = 0,
      take = 100,
      fromDate,
      toDate,
    } = await request.json();

    if (!accessToken || !retailer) {
      return NextResponse.json(
        { error: "Missing accessToken or retailer" },
        { status: 400 }
      );
    }

    let url = `https://public.kiotapi.com/invoices?skip=${skip}&take=${take}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;

    console.log("💰 Fetching invoices from KiotViet API...");

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
      console.error("❌ Invoices API failed:", response.status, errorText);
      return NextResponse.json(
        { error: `Invoices API failed: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(
      "✅ Invoices fetched successfully:",
      data.data?.length || 0,
      "items"
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Invoices API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
