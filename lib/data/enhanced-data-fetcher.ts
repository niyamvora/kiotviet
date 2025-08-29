/**
 * Enhanced data fetching utilities for KiotViet API
 * Handles pagination, large datasets, and comprehensive time-based filtering
 */

import { kiotVietAPI } from "@/lib/kiotviet-api";
import { supabase } from "@/lib/supabase";

export interface EnhancedDataFetchOptions {
  timeFilter?: "1w" | "1m" | "1y" | "3y" | "all";
  maxItems?: number;
  includeDetails?: boolean;
}

export interface ComprehensiveBusinessData {
  products: {
    data: any[];
    total: number;
    categories: string[];
  };
  customers: {
    data: any[];
    total: number;
    segments: { [key: string]: number };
  };
  orders: {
    data: any[];
    total: number;
    byStatus: { [key: string]: number };
  };
  invoices: {
    data: any[];
    total: number;
    totalRevenue: number;
  };
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    avgOrderValue: number;
  };
}

/**
 * Enhanced data fetching with pagination handling
 * Attempts to fetch all available data by making multiple API calls if needed
 */
export async function fetchComprehensiveData(
  options: EnhancedDataFetchOptions = {}
): Promise<ComprehensiveBusinessData> {
  const { timeFilter = "1y", maxItems = 5000, includeDetails = true } = options;

  console.log("🚀 Starting comprehensive data fetch...");

  try {
    // Check credentials
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let userCredentials = null;

    if (user) {
      const { data: creds } = await supabase
        .from("user_credentials")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (creds) {
        userCredentials = creds;
        kiotVietAPI.setCredentials({
          clientId: creds.client_id,
          secretKey: creds.secret_key,
          retailer: creds.shop_name,
        });
      }
    }

    if (!userCredentials) {
      console.log("📊 No credentials found, cannot fetch live data");
      throw new Error("No KiotViet credentials available");
    }

    // Calculate date range
    const now = new Date();
    let fromDate: string | undefined;

    switch (timeFilter) {
      case "1w":
        fromDate = new Date(
          now.getTime() - 7 * 24 * 60 * 60 * 1000
        ).toISOString();
        break;
      case "1m":
        fromDate = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000
        ).toISOString();
        break;
      case "1y":
        fromDate = new Date(
          now.getTime() - 365 * 24 * 60 * 60 * 1000
        ).toISOString();
        break;
      case "3y":
        fromDate = new Date(
          now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000
        ).toISOString();
        break;
      case "all":
      default:
        fromDate = undefined;
        break;
    }

    // Fetch data with enhanced pagination
    // Adjust limits based on KiotViet API constraints (20 items per request)
    const productLimit = Math.min(maxItems, 200); // 10 requests max for products
    const customerLimit = Math.min(maxItems, 100); // 5 requests max for customers
    const orderLimit = Math.min(maxItems, 400); // 20 requests max for orders (more important)
    const invoiceLimit = Math.min(maxItems, 400); // 20 requests max for invoices (most important)

    console.log("📦 Fetching products with enhanced pagination...");
    const products = await fetchWithPagination("products", {
      maxItems: productLimit,
      includeDetails,
    });

    console.log("👥 Fetching customers with enhanced pagination...");
    const customers = await fetchWithPagination("customers", {
      maxItems: customerLimit,
      includeDetails,
    });

    console.log("🛒 Fetching orders with enhanced pagination...");
    const orders = await fetchWithPagination("orders", {
      maxItems: orderLimit,
      includeDetails,
      fromDate,
      toDate: now.toISOString(),
    });

    console.log("💰 Fetching invoices with enhanced pagination...");
    const invoices = await fetchWithPagination("invoices", {
      maxItems: invoiceLimit,
      includeDetails,
      fromDate,
      toDate: now.toISOString(),
    });

    // Process and analyze the data
    const processedData = await processComprehensiveData({
      products,
      customers,
      orders,
      invoices,
    });

    console.log("✅ Comprehensive data fetch completed:", {
      products: products.data.length,
      customers: customers.data.length,
      orders: orders.data.length,
      invoices: invoices.data.length,
      totalRevenue: processedData.summary.totalRevenue,
    });

    return processedData;
  } catch (error) {
    console.error("❌ Enhanced data fetch failed:", error);
    throw error;
  }
}

/**
 * Fetch data with automatic pagination
 * KiotViet API returns exactly 20 items per request regardless of 'take' parameter
 */
async function fetchWithPagination(
  endpoint: "products" | "customers" | "orders" | "invoices",
  options: {
    maxItems: number;
    includeDetails: boolean;
    fromDate?: string;
    toDate?: string;
  }
): Promise<{ data: any[]; total: number }> {
  const { maxItems, fromDate, toDate } = options;
  const KIOTVIET_PAGE_SIZE = 20; // KiotViet API hard limit - always returns 20 items
  const MAX_REQUESTS = Math.min(Math.ceil(maxItems / KIOTVIET_PAGE_SIZE), 50); // Safety limit

  let allData: any[] = [];
  let skip = 0;
  let requestCount = 0;
  let apiReportedTotal = 0;

  console.log(
    `🚀 Starting enhanced pagination for ${endpoint} (max ${maxItems} items, up to ${MAX_REQUESTS} requests)`
  );

  while (requestCount < MAX_REQUESTS && allData.length < maxItems) {
    try {
      console.log(
        `  📦 Request ${requestCount + 1}: skip=${skip}, expecting 20 items...`
      );

      let batch;
      switch (endpoint) {
        case "products":
          batch = await kiotVietAPI.getProducts(skip, 20); // Always use 20
          break;
        case "customers":
          batch = await kiotVietAPI.getCustomers(skip, 20);
          break;
        case "orders":
          batch = await kiotVietAPI.getOrders(skip, 20, fromDate, toDate);
          break;
        case "invoices":
          batch = await kiotVietAPI.getInvoices(skip, 20, fromDate, toDate);
          break;
      }

      requestCount++;

      if (batch && batch.data && batch.data.length > 0) {
        allData = [...allData, ...batch.data];
        skip += KIOTVIET_PAGE_SIZE; // Always increment by 20

        // Store API reported total from first request
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
        const shouldContinue =
          batch.data.length === KIOTVIET_PAGE_SIZE &&
          allData.length < maxItems &&
          (apiReportedTotal === 0 || allData.length < apiReportedTotal);

        if (!shouldContinue) {
          console.log(
            `    🎯 Stopping: ${
              batch.data.length < KIOTVIET_PAGE_SIZE
                ? "end of data"
                : "reached limits"
            }`
          );
          break;
        }

        // Progressive delay to avoid rate limiting
        const delay = Math.min(200 + requestCount * 50, 1000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.log(`    🛑 No data received, ending pagination`);
        break;
      }
    } catch (error) {
      console.error(`    ❌ Error in request ${requestCount}:`, error);

      // If it's a rate limiting error, wait longer and try once more
      if (error.message.includes("429") || error.message.includes("rate")) {
        console.log(`    ⏳ Rate limited, waiting 3 seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        if (requestCount < MAX_REQUESTS) {
          continue; // Try again
        }
      }
      break;
    }
  }

  console.log(
    `✅ Enhanced pagination completed: ${allData.length} items from ${requestCount} requests`
  );

  return {
    data: allData,
    total: apiReportedTotal || allData.length,
  };
}

/**
 * Process and analyze the comprehensive data
 */
async function processComprehensiveData(data: {
  products: { data: any[]; total: number };
  customers: { data: any[]; total: number };
  orders: { data: any[]; total: number };
  invoices: { data: any[]; total: number };
}): Promise<ComprehensiveBusinessData> {
  const { products, customers, orders, invoices } = data;

  // Calculate revenue
  const totalRevenue = invoices.data.reduce(
    (sum, invoice) => sum + (invoice.total || 0),
    0
  );

  // Calculate average order value
  const avgOrderValue =
    orders.data.length > 0 ? totalRevenue / orders.data.length : 0;

  // Analyze categories
  const categories = [
    ...new Set(
      products.data.map((p) => p.categoryName || "Others").filter(Boolean)
    ),
  ];

  // Analyze customer segments (basic segmentation)
  const customerSegments: { [key: string]: number } = {};
  customers.data.forEach((customer) => {
    // Simple segmentation based on customer properties
    const segment = customer.isVip ? "VIP" : "Regular";
    customerSegments[segment] = (customerSegments[segment] || 0) + 1;
  });

  // Analyze order status
  const ordersByStatus: { [key: string]: number } = {};
  orders.data.forEach((order) => {
    const status = order.status || "Unknown";
    ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;
  });

  return {
    products: {
      data: products.data,
      total: products.total,
      categories,
    },
    customers: {
      data: customers.data,
      total: customers.total,
      segments: customerSegments,
    },
    orders: {
      data: orders.data,
      total: orders.total,
      byStatus: ordersByStatus,
    },
    invoices: {
      data: invoices.data,
      total: invoices.total,
      totalRevenue,
    },
    summary: {
      totalRevenue,
      totalOrders: orders.total,
      totalCustomers: customers.total,
      totalProducts: products.total,
      avgOrderValue,
    },
  };
}

/**
 * Test the enhanced data fetching
 */
export async function testEnhancedDataFetch(): Promise<void> {
  try {
    console.log("🧪 Testing enhanced data fetch...");

    const data = await fetchComprehensiveData({
      timeFilter: "1y",
      maxItems: 2000,
      includeDetails: true,
    });

    console.log("📊 Test Results:", {
      products: data.products.total,
      customers: data.customers.total,
      orders: data.orders.total,
      invoices: data.invoices.total,
      categories: data.products.categories.length,
      revenue: data.summary.totalRevenue.toLocaleString("vi-VN"),
    });

    return;
  } catch (error) {
    console.error("❌ Enhanced data fetch test failed:", error);
    throw error;
  }
}
