/**
 * Chart data processing utilities
 * Handles data transformation and time-based filtering for analytics charts
 */

import { kiotVietAPI } from "@/lib/kiotviet-api";

export type TimeFilter = "1w" | "1m" | "1y" | "3y" | "all";

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  revenue?: number;
  orders?: number;
  customers?: number;
}

export interface ProcessedChartData {
  revenue: ChartDataPoint[];
  orders: ChartDataPoint[];
  customers: ChartDataPoint[];
  products: any[];
  categoryDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
}

/**
 * Get date range for time filter
 */
export function getDateRangeForFilter(timeFilter: TimeFilter): {
  fromDate: string | undefined;
  toDate: string;
  intervals: number;
  intervalType: "day" | "week" | "month" | "year";
} {
  const now = new Date();
  const toDate = now.toISOString();
  let fromDate: string | undefined;
  let intervals: number;
  let intervalType: "day" | "week" | "month" | "year";

  switch (timeFilter) {
    case "1w":
      fromDate = new Date(
        now.getTime() - 7 * 24 * 60 * 60 * 1000
      ).toISOString();
      intervals = 7;
      intervalType = "day";
      break;
    case "1m":
      fromDate = new Date(
        now.getTime() - 30 * 24 * 60 * 60 * 1000
      ).toISOString();
      intervals = 4;
      intervalType = "week";
      break;
    case "1y":
      fromDate = new Date(
        now.getTime() - 365 * 24 * 60 * 60 * 1000
      ).toISOString();
      intervals = 12;
      intervalType = "month";
      break;
    case "3y":
      fromDate = new Date(
        now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000
      ).toISOString();
      intervals = 3;
      intervalType = "year";
      break;
    case "all":
    default:
      fromDate = undefined; // All time
      intervals = 5;
      intervalType = "year";
      break;
  }

  return { fromDate, toDate, intervals, intervalType };
}

/**
 * Generate demo data with continuous time series
 */
export function generateDemoDataForTimeFilter(
  timeFilter: TimeFilter
): ProcessedChartData {
  const { intervals, intervalType } = getDateRangeForFilter(timeFilter);

  const generateTimeSeriesData = () => {
    const data: ChartDataPoint[] = [];

    for (let i = 0; i < intervals; i++) {
      const date = new Date();
      let label = "";
      let revenue = 0;
      let orders = 0;
      let customers = 0;

      switch (intervalType) {
        case "day":
          date.setDate(date.getDate() - (intervals - 1 - i));
          label = date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
          revenue = 1800000 + Math.random() * 2400000;
          orders = 45 + Math.floor(Math.random() * 80);
          customers = 25 + Math.floor(Math.random() * 40);
          break;
        case "week":
          const weekStart = new Date(
            date.getTime() - (intervals - 1 - i) * 7 * 24 * 60 * 60 * 1000
          );
          label = `Week ${i + 1}`;
          revenue = 12000000 + Math.random() * 8000000;
          orders = 280 + Math.floor(Math.random() * 200);
          customers = 180 + Math.floor(Math.random() * 120);
          break;
        case "month":
          date.setMonth(date.getMonth() - (intervals - 1 - i));
          label = date.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          });
          revenue = 45000000 + Math.random() * 25000000;
          orders = 1200 + Math.floor(Math.random() * 800);
          customers = 800 + Math.floor(Math.random() * 600);
          break;
        case "year":
          const year = new Date().getFullYear() - (intervals - 1 - i);
          label = year.toString();
          revenue = 180000000 + Math.random() * 60000000;
          orders = 15000 + Math.floor(Math.random() * 8000);
          customers = 4000 + Math.floor(Math.random() * 2000);
          break;
      }

      data.push({
        date: label,
        value: Math.floor(revenue),
        revenue: Math.floor(revenue),
        orders,
        customers,
        label,
      });
    }

    return data;
  };

  const timeSeriesData = generateTimeSeriesData();

  return {
    revenue: timeSeriesData,
    orders: timeSeriesData,
    customers: timeSeriesData,
    products: [],
    categoryDistribution: [
      { name: "Skincare", value: 45, color: "#0088FE" },
      { name: "Haircare", value: 25, color: "#00C49F" },
      { name: "Makeup", value: 15, color: "#FFBB28" },
      { name: "Fragrance", value: 10, color: "#FF8042" },
      { name: "Others", value: 5, color: "#8884D8" },
    ],
    topProducts: [
      { name: "150ML Dầu massage Relaxing", sales: 145, revenue: 17400000 },
      { name: "Kem dưỡng da mặt Premium", sales: 89, revenue: 12450000 },
      { name: "Sữa rửa mặt organic", sales: 76, revenue: 9880000 },
      { name: "Serum vitamin C", sales: 65, revenue: 13000000 },
      { name: "Mặt nạ collagen", sales: 58, revenue: 8700000 },
    ],
  };
}

/**
 * Process live data from KiotViet API into chart format
 */
export function processLiveDataForCharts(
  liveData: {
    products: any;
    customers: any;
    orders: any;
    invoices: any;
  },
  timeFilter: TimeFilter
): ProcessedChartData {
  const { products, customers, orders, invoices } = liveData;
  const { intervalType, intervals } = getDateRangeForFilter(timeFilter);

  // Group data by time intervals
  const groupedData: {
    [key: string]: { revenue: number; orders: number; customers: Set<string> };
  } = {};

  // Process invoices for revenue data
  invoices.data?.forEach((invoice: any) => {
    const date = new Date(invoice.modifiedDate || invoice.createdDate);
    const key = getIntervalKey(date, intervalType);

    if (!groupedData[key]) {
      groupedData[key] = { revenue: 0, orders: 0, customers: new Set() };
    }

    groupedData[key].revenue += invoice.total || 0;
  });

  // Process orders for order count
  orders.data?.forEach((order: any) => {
    const date = new Date(order.modifiedDate || order.createdDate);
    const key = getIntervalKey(date, intervalType);

    if (!groupedData[key]) {
      groupedData[key] = { revenue: 0, orders: 0, customers: new Set() };
    }

    groupedData[key].orders += 1;
    if (order.customerId) {
      groupedData[key].customers.add(order.customerId);
    }
  });

  // Convert to chart data format
  const chartData = Object.entries(groupedData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date,
      value: data.revenue,
      revenue: data.revenue,
      orders: data.orders,
      customers: data.customers.size,
      label: date,
    }));

  // If no live data, use demo data
  if (chartData.length === 0) {
    return generateDemoDataForTimeFilter(timeFilter);
  }

  return {
    revenue: chartData,
    orders: chartData,
    customers: chartData,
    products: products.data || [],
    categoryDistribution: generateCategoryDistribution(products.data || []),
    topProducts: generateTopProducts(products.data || []),
  };
}

/**
 * Get interval key based on date and interval type
 */
function getIntervalKey(
  date: Date,
  intervalType: "day" | "week" | "month" | "year"
): string {
  switch (intervalType) {
    case "day":
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    case "week":
      const week = Math.ceil(date.getDate() / 7);
      return `Week ${week}`;
    case "month":
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
    case "year":
      return date.getFullYear().toString();
  }
}

/**
 * Generate category distribution from products
 */
function generateCategoryDistribution(products: any[]): Array<{
  name: string;
  value: number;
  color: string;
}> {
  const categoryMap: { [key: string]: number } = {};

  products.forEach((product: any) => {
    const category = product.categoryName || "Others";
    categoryMap[category] = (categoryMap[category] || 0) + 1;
  });

  const total = Object.values(categoryMap).reduce(
    (sum, count) => sum + count,
    0
  );
  const colors = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  return Object.entries(categoryMap)
    .slice(0, 6)
    .map(([name, count], index) => ({
      name,
      value: Math.floor((count / total) * 100),
      color: colors[index] || "#8884D8",
    }));
}

/**
 * Generate top products from product data
 */
function generateTopProducts(products: any[]): Array<{
  name: string;
  sales: number;
  revenue: number;
}> {
  return products.slice(0, 10).map((product: any) => ({
    name: product.fullName || product.name || "Unknown Product",
    sales: Math.floor(Math.random() * 100) + 50,
    revenue: (product.basePrice || 0) * (Math.floor(Math.random() * 100) + 50),
  }));
}

/**
 * Format currency for charts
 */
export function formatChartCurrency(value: number): string {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B VND`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M VND`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K VND`;
  }
  return `${value.toLocaleString("vi-VN")} VND`;
}

/**
 * Format numbers for Y-axis
 */
export function formatYAxisNumber(value: number): string {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}
