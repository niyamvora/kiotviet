/**
 * KiotViet Authentication API Route
 * Handles authentication with KiotViet API server-side to avoid CORS issues
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { clientId, secretKey } = await request.json();

    if (!clientId || !secretKey) {
      return NextResponse.json(
        { error: "Missing clientId or secretKey" },
        { status: 400 }
      );
    }

    // Use the correct KiotViet authentication endpoint
    const authUrl = "https://id.kiotviet.vn/connect/token";

    const authData = new URLSearchParams({
      scopes: "PublicApi.Access",
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: secretKey,
    });

    console.log("🔐 Authenticating with KiotViet API...");

    const response = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: authData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ KiotViet auth failed:", response.status, errorText);
      return NextResponse.json(
        { error: `Authentication failed: ${response.status}` },
        { status: response.status }
      );
    }

    const authResponse = await response.json();
    console.log("✅ KiotViet authentication successful");

    return NextResponse.json({
      access_token: authResponse.access_token,
      token_type: authResponse.token_type,
      expires_in: authResponse.expires_in,
    });
  } catch (error) {
    console.error("❌ KiotViet auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
