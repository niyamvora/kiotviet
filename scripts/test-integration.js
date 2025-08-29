/**
 * Integration test for the enhanced data fetching with real API
 * Tests the corrected pagination system with KiotViet's 20-item limit
 */

// Your credentials from .env
const CREDENTIALS = {
  CLIENT_ID: "761c0672-a038-4c85-9c2e-11890aacc5d2",
  SECRET_KEY: "59D98EA30A4F6B4B80EAA2F099904A8AB3906C23",
  SHOP_NAME: "ChezBebe",
};

const BASE_URL = "https://public.kiotapi.com";
const AUTH_URL = "https://id.kiotviet.vn/connect/token";

let accessToken = null;

/**
 * Authenticate with KiotViet API
 */
async function authenticate() {
  console.log("🔐 Authenticating with KiotViet API...");

  const response = await fetch(AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: CREDENTIALS.CLIENT_ID,
      client_secret: CREDENTIALS.SECRET_KEY,
      grant_type: "client_credentials",
      scope: "PublicApi.Access",
    }),
  });

  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.status}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  console.log("✅ Authentication successful");
  return accessToken;
}

/**
 * Make API request to KiotViet
 */
async function makeApiRequest(endpoint, params = {}) {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const url = `${BASE_URL}/${endpoint}${
    queryParams.toString() ? "?" + queryParams.toString() : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Retailer: CREDENTIALS.SHOP_NAME,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * Enhanced pagination with KiotViet's 20-item limit
 */
async function fetchWithEnhancedPagination(endpoint, maxItems = 200) {
  console.log(`\n🚀 Testing Enhanced Pagination for ${endpoint}...`);
  console.log(
    `Target: ${maxItems} items (${Math.ceil(maxItems / 20)} requests)`
  );

  const KIOTVIET_PAGE_SIZE = 20; // KiotViet's hard limit
  const MAX_REQUESTS = Math.ceil(maxItems / KIOTVIET_PAGE_SIZE);

  let allData = [];
  let skip = 0;
  let requestCount = 0;
  let apiReportedTotal = 0;

  while (requestCount < MAX_REQUESTS && allData.length < maxItems) {
    try {
      console.log(
        `  📦 Request ${requestCount + 1}: skip=${skip}, expecting 20 items...`
      );

      const batch = await makeApiRequest(endpoint, { skip, take: 20 });
      requestCount++;

      if (batch && batch.data && batch.data.length > 0) {
        allData = [...allData, ...batch.data];
        skip += KIOTVIET_PAGE_SIZE;

        if (requestCount === 1 && batch.total) {
          apiReportedTotal = batch.total;
          console.log(
            `  📊 API reports ${apiReportedTotal} total ${endpoint} available`
          );
        }

        console.log(
          `    ✅ Received ${batch.data.length} items, total: ${
            allData.length
          }/${apiReportedTotal || "unknown"}`
        );

        // Check if we should continue
        if (batch.data.length < KIOTVIET_PAGE_SIZE) {
          console.log(
            `    🎯 Reached end of data (received ${batch.data.length} < 20)`
          );
          break;
        }

        // Progressive delay to avoid rate limiting
        const delay = Math.min(300 + requestCount * 100, 2000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.log(`    🛑 No data received, ending pagination`);
        break;
      }
    } catch (error) {
      console.error(
        `    ❌ Error in request ${requestCount + 1}:`,
        error.message
      );

      // If rate limited, wait longer
      if (
        error.message.includes("429") ||
        error.message.includes("Too Many Requests")
      ) {
        console.log(`    ⏳ Rate limited, waiting 5 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } else {
        break;
      }
    }
  }

  console.log(
    `✅ Enhanced pagination result: ${allData.length} items from ${requestCount} requests`
  );
  return {
    data: allData,
    total: apiReportedTotal || allData.length,
    actualFetched: allData.length,
    requestsMade: requestCount,
  };
}

/**
 * Analyze the enhanced fetched data
 */
function analyzeEnhancedData(results) {
  console.log("\n📊 Enhanced Data Analysis:");
  console.log("=".repeat(50));

  for (const [endpoint, result] of Object.entries(results)) {
    console.log(`\n📦 ${endpoint.toUpperCase()}:`);
    console.log(`  - Fetched: ${result.actualFetched} items`);
    console.log(`  - Available: ${result.total} total`);
    console.log(`  - Requests: ${result.requestsMade}`);
    console.log(
      `  - Efficiency: ${(
        (result.actualFetched / result.requestsMade) *
        100
      ).toFixed(1)}% (${result.actualFetched}/${result.requestsMade * 20})`
    );

    if (result.data.length > 0) {
      const sample = result.data[0];
      const fields = Object.keys(sample).slice(0, 10).join(", ");
      console.log(`  - Sample fields: ${fields}...`);

      // Specific analysis per endpoint
      if (endpoint === "products") {
        const withPrices = result.data.filter((p) => p.basePrice > 0).length;
        const withCategories = result.data.filter((p) => p.categoryName).length;
        console.log(`  - With prices: ${withPrices}/${result.actualFetched}`);
        console.log(
          `  - With categories: ${withCategories}/${result.actualFetched}`
        );
      } else if (endpoint === "invoices") {
        const totalRevenue = result.data.reduce(
          (sum, inv) => sum + (inv.total || 0),
          0
        );
        console.log(
          `  - Total revenue: ${totalRevenue.toLocaleString("vi-VN")} VND`
        );
      }
    }
  }
}

/**
 * Main test runner
 */
async function runIntegrationTest() {
  console.log("🚀 Enhanced Data Fetching Integration Test");
  console.log("=".repeat(80));
  console.log(`🏪 Shop: ${CREDENTIALS.SHOP_NAME}`);
  console.log(`⏰ Test started: ${new Date().toLocaleString()}`);

  try {
    await authenticate();

    // Test different endpoints with enhanced pagination
    const endpoints = [
      { name: "products", maxItems: 100 },
      { name: "customers", maxItems: 60 },
      { name: "orders", maxItems: 80 },
      { name: "invoices", maxItems: 100 },
    ];

    const results = {};

    for (const { name, maxItems } of endpoints) {
      try {
        results[name] = await fetchWithEnhancedPagination(name, maxItems);

        // Wait between endpoints to be respectful to API
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Failed to fetch ${name}:`, error.message);
        results[name] = {
          data: [],
          total: 0,
          actualFetched: 0,
          requestsMade: 0,
        };
      }
    }

    // Analyze results
    analyzeEnhancedData(results);

    // Summary
    const totalFetched = Object.values(results).reduce(
      (sum, r) => sum + r.actualFetched,
      0
    );
    const totalRequests = Object.values(results).reduce(
      (sum, r) => sum + r.requestsMade,
      0
    );

    console.log("\n🎯 SUMMARY:");
    console.log("=".repeat(50));
    console.log(`✅ Total items fetched: ${totalFetched}`);
    console.log(`📡 Total API requests: ${totalRequests}`);
    console.log(
      `⚡ Average items per request: ${(totalFetched / totalRequests).toFixed(
        1
      )}`
    );
    console.log(
      `🚀 Enhancement success: ${
        totalFetched > 80
          ? "YES - Fetched more than basic 20 per endpoint!"
          : "NEEDS IMPROVEMENT"
      }`
    );

    console.log("\n✅ Integration test completed successfully!");
  } catch (error) {
    console.error("\n❌ Integration test failed:", error.message);
  }
}

// Run the test
if (require.main === module) {
  runIntegrationTest();
}
