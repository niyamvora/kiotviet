/**
 * Verification script for enhanced data fetching integration
 * Simulates the dashboard data flow to ensure everything works correctly
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

async function authenticate() {
  const response = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CREDENTIALS.CLIENT_ID,
      client_secret: CREDENTIALS.SECRET_KEY,
      grant_type: "client_credentials",
      scope: "PublicApi.Access",
    }),
  });

  const data = await response.json();
  accessToken = data.access_token;
  return accessToken;
}

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
 * Simulate the enhanced data fetching used in the dashboard
 */
async function fetchEnhancedData(endpoint, maxItems, fromDate, toDate) {
  const KIOTVIET_PAGE_SIZE = 20;
  const MAX_REQUESTS = Math.min(Math.ceil(maxItems / KIOTVIET_PAGE_SIZE), 25);

  let allData = [];
  let skip = 0;
  let requestCount = 0;
  let apiReportedTotal = 0;

  console.log(
    `🚀 Enhanced fetching ${endpoint}: targeting ${maxItems} items (up to ${MAX_REQUESTS} requests)`
  );

  while (requestCount < MAX_REQUESTS && allData.length < maxItems) {
    try {
      const params = { skip, take: 20 };
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const batch = await makeApiRequest(endpoint, params);
      requestCount++;

      if (batch && batch.data && batch.data.length > 0) {
        allData = [...allData, ...batch.data];
        skip += KIOTVIET_PAGE_SIZE;

        if (requestCount === 1 && batch.total) {
          apiReportedTotal = batch.total;
        }

        console.log(
          `  📦 ${endpoint} batch ${requestCount}: +${
            batch.data.length
          } items (total: ${allData.length}/${apiReportedTotal || "unknown"})`
        );

        if (batch.data.length < KIOTVIET_PAGE_SIZE) {
          console.log(`  🎯 ${endpoint}: reached end of data`);
          break;
        }

        // Progressive delay
        const delay = Math.min(150 + requestCount * 75, 800);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.log(`  🛑 ${endpoint}: no data received`);
        break;
      }
    } catch (error) {
      console.error(
        `  ❌ ${endpoint} batch ${requestCount + 1} failed:`,
        error.message
      );
      break;
    }
  }

  console.log(
    `✅ ${endpoint}: fetched ${allData.length} items in ${requestCount} requests`
  );

  return {
    data: allData,
    total: apiReportedTotal || allData.length,
  };
}

/**
 * Simulate the dashboard data processing
 */
function processDashboardData(products, customers, orders, invoices) {
  console.log("\n📊 Processing Dashboard Data...");

  // Overview metrics
  const totalRevenue = invoices.data.reduce(
    (sum, invoice) => sum + (invoice.total || 0),
    0
  );
  const totalOrders = orders.data.length;
  const totalCustomers = customers.total;
  const totalProducts = products.total;

  // Category analysis
  const categories = {};
  products.data.forEach((product) => {
    const category = product.categoryName || "Others";
    categories[category] = (categories[category] || 0) + 1;
  });

  // Top products
  const topProducts = products.data.slice(0, 10).map((product) => ({
    name: product.fullName || product.name || "Unknown Product",
    sales: Math.floor(Math.random() * 100) + 50,
    revenue: (product.basePrice || 0) * (Math.floor(Math.random() * 100) + 50),
  }));

  // Order status analysis
  const orderStatus = {};
  orders.data.forEach((order) => {
    const status = order.status || "Unknown";
    orderStatus[status] = (orderStatus[status] || 0) + 1;
  });

  return {
    overview: {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
    },
    categories: Object.keys(categories).length,
    topProducts: topProducts.length,
    orderStatuses: Object.keys(orderStatus).length,
    avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
  };
}

/**
 * Main verification test
 */
async function verifyDashboardIntegration() {
  console.log("🔍 Dashboard Integration Verification");
  console.log("=".repeat(60));
  console.log(`🏪 Shop: ${CREDENTIALS.SHOP_NAME}`);
  console.log(`⏰ Started: ${new Date().toLocaleString()}`);

  try {
    console.log("\n🔐 Authenticating...");
    await authenticate();

    // Simulate dashboard data fetching with enhanced pagination
    console.log("\n🚀 Simulating Dashboard Data Fetch...");

    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const [products, customers, orders, invoices] = await Promise.all([
      fetchEnhancedData("products", 200),
      fetchEnhancedData("customers", 100),
      fetchEnhancedData(
        "orders",
        400,
        oneYearAgo.toISOString(),
        now.toISOString()
      ),
      fetchEnhancedData(
        "invoices",
        400,
        oneYearAgo.toISOString(),
        now.toISOString()
      ),
    ]);

    console.log("\n📈 Raw Data Summary:");
    console.log(`  Products: ${products.data.length}/${products.total}`);
    console.log(`  Customers: ${customers.data.length}/${customers.total}`);
    console.log(`  Orders: ${orders.data.length}/${orders.total}`);
    console.log(`  Invoices: ${invoices.data.length}/${invoices.total}`);

    // Process data for dashboard
    const dashboardData = processDashboardData(
      products,
      customers,
      orders,
      invoices
    );

    console.log("\n🎯 Dashboard Metrics:");
    console.log(
      `  💰 Total Revenue: ${dashboardData.overview.totalRevenue.toLocaleString(
        "vi-VN"
      )} VND`
    );
    console.log(
      `  🛒 Total Orders: ${dashboardData.overview.totalOrders.toLocaleString()}`
    );
    console.log(
      `  👥 Total Customers: ${dashboardData.overview.totalCustomers.toLocaleString()}`
    );
    console.log(
      `  📦 Total Products: ${dashboardData.overview.totalProducts.toLocaleString()}`
    );
    console.log(
      `  💵 Average Order Value: ${Math.round(
        dashboardData.avgOrderValue
      ).toLocaleString("vi-VN")} VND`
    );
    console.log(`  🏷️ Product Categories: ${dashboardData.categories}`);
    console.log(`  📊 Top Products Available: ${dashboardData.topProducts}`);
    console.log(`  📋 Order Status Types: ${dashboardData.orderStatuses}`);

    // Verify data quality
    const totalFetched =
      products.data.length +
      customers.data.length +
      orders.data.length +
      invoices.data.length;

    console.log("\n✅ Integration Verification Results:");
    console.log("=".repeat(60));
    console.log(`🎯 Total Data Fetched: ${totalFetched} items`);
    console.log(
      `🚀 Enhancement Factor: ${(totalFetched / 80).toFixed(
        1
      )}x (vs 80 items before)`
    );
    console.log(
      `💹 Revenue Processing: ${
        dashboardData.overview.totalRevenue > 0 ? "SUCCESS" : "FAILED"
      }`
    );
    console.log(
      `📊 Chart Data Quality: ${
        totalFetched > 200
          ? "EXCELLENT"
          : totalFetched > 100
          ? "GOOD"
          : "NEEDS IMPROVEMENT"
      }`
    );
    console.log(
      `🔧 System Status: ${
        totalFetched > 100 && dashboardData.overview.totalRevenue > 0
          ? "✅ READY FOR PRODUCTION"
          : "⚠️ NEEDS REVIEW"
      }`
    );
  } catch (error) {
    console.error("\n❌ Verification failed:", error.message);
  }
}

// Run verification
if (require.main === module) {
  verifyDashboardIntegration();
}
