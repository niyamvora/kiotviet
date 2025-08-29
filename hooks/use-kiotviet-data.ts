/**
 * KiotViet API data integration hook
 * Handles fetching and processing business data with proper timeline filtering
 */

"use client";

import { useState, useEffect } from "react";
import { kiotVietAPI } from "@/lib/kiotviet-api";
import { DataType, TimeRange } from "./use-dashboard-filters";

interface DashboardData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    revenueGrowth: number;
    ordersGrowth: number;
    customersGrowth: number;
    productsGrowth: number;
  };
  sales: {
    revenueData: Array<{ month: string; revenue: number; orders: number }>;
    topProducts: Array<{ name: string; sales: number; revenue: number }>;
    categoryDistribution: Array<{ name: string; value: number; color: string }>;
  };
  products: {
    topSellingProducts: Array<{
      id: number;
      name: string;
      sales: number;
      revenue: number;
      stock: number;
    }>;
    categoryPerformance: Array<{
      name: string;
      products: number;
      sales: number;
      revenue: number;
    }>;
    lowStockItems: Array<{
      id: number;
      name: string;
      stock: number;
      reorderPoint: number;
    }>;
    priceAnalysis: Array<{
      range: string;
      count: number;
      totalRevenue: number;
    }>;
  };
  customers: {
    customerGrowth: Array<{ month: string; new: number; returning: number }>;
    topCustomers: Array<{
      id: number;
      name: string;
      totalSpent: number;
      orders: number;
      location: string;
    }>;
    geographicDistribution: Array<{
      city: string;
      customers: number;
      revenue: number;
    }>;
    customerSegments: Array<{
      segment: string;
      count: number;
      avgSpent: number;
    }>;
  };
  orders: {
    orderTrends: Array<{ date: string; orders: number; revenue: number }>;
    ordersByStatus: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    averageOrderValue: Array<{ month: string; aov: number }>;
    ordersByBranch: Array<{ branch: string; orders: number; revenue: number }>;
  };
}

export function useKiotVietData(
  dataType: DataType,
  timeRange: TimeRange,
  dateRange: { startDate: Date | null; endDate: Date }
) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCredentials, setHasCredentials] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Check if user has credentials
        // This would normally check from Supabase
        setHasCredentials(true); // For now, assume they do

        if (!hasCredentials) {
          // Return demo data
          setData(generateDemoData(timeRange));
          setLoading(false);
          return;
        }

        // Generate demo data for now - replace with real API calls
        const dashboardData = generateDemoData(timeRange);

        // Apply time filtering to the data
        const filteredData = filterDataByTimeRange(
          dashboardData,
          dateRange,
          timeRange
        );

        setData(filteredData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        // Fallback to demo data
        setData(generateDemoData(timeRange));
        setLoading(false);
      }
    };

    fetchData();
  }, [dataType, timeRange, dateRange, hasCredentials]);

  return { data, loading, error, hasCredentials };
}

function generateDemoData(timeRange: TimeRange): DashboardData {
  // Generate continuous data based on time range like finance charts
  const generateContinuousData = () => {
    switch (timeRange) {
      case "week":
        // Show daily data for past 7 days
        return Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          const dayName = date.toLocaleDateString("en-US", {
            weekday: "short",
          });
          const revenue = 1800000 + Math.random() * 2400000;
          const orders =
            Math.floor(revenue / 15000) + Math.floor(Math.random() * 50);
          return { month: dayName, revenue: Math.floor(revenue), orders };
        });
      case "month":
        // Show weekly data for past 4 weeks
        return Array.from({ length: 4 }, (_, i) => {
          const revenue = 12000000 + Math.random() * 8000000;
          const orders =
            Math.floor(revenue / 15000) + Math.floor(Math.random() * 200);
          return {
            month: `Week ${i + 1}`,
            revenue: Math.floor(revenue),
            orders,
          };
        });
      case "year":
        // Show monthly data for past 12 months
        return Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (11 - i));
          const monthName = date.toLocaleDateString("en-US", {
            month: "short",
          });
          const revenue = 45000000 + Math.random() * 25000000;
          const orders =
            Math.floor(revenue / 15000) + Math.floor(Math.random() * 800);
          return { month: monthName, revenue: Math.floor(revenue), orders };
        });
      default: // 'all' - show yearly data for past 3 years
        return Array.from({ length: 3 }, (_, i) => {
          const year = new Date().getFullYear() - (2 - i);
          const revenue = 180000000 + Math.random() * 60000000;
          const orders =
            Math.floor(revenue / 15000) + Math.floor(Math.random() * 2000);
          return {
            month: year.toString(),
            revenue: Math.floor(revenue),
            orders,
          };
        });
    }
  };

  const generateCustomerData = () => {
    switch (timeRange) {
      case "week":
        return Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          const dayName = date.toLocaleDateString("en-US", {
            weekday: "short",
          });
          const newCustomers = 25 + Math.floor(Math.random() * 40);
          const returning = 150 + Math.floor(Math.random() * 100);
          return { month: dayName, new: newCustomers, returning };
        });
      case "month":
        return Array.from({ length: 4 }, (_, i) => {
          const newCustomers = 200 + Math.floor(Math.random() * 150);
          const returning = 1100 + Math.floor(Math.random() * 600);
          return { month: `Week ${i + 1}`, new: newCustomers, returning };
        });
      case "year":
        return Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (11 - i));
          const monthName = date.toLocaleDateString("en-US", {
            month: "short",
          });
          const newCustomers = 800 + Math.floor(Math.random() * 600);
          const returning = 3800 + Math.floor(Math.random() * 2000);
          return { month: monthName, new: newCustomers, returning };
        });
      default:
        return Array.from({ length: 3 }, (_, i) => {
          const year = new Date().getFullYear() - (2 - i);
          const newCustomers = 4000 + Math.floor(Math.random() * 2000);
          const returning = 18000 + Math.floor(Math.random() * 8000);
          return { month: year.toString(), new: newCustomers, returning };
        });
    }
  };

  const generateOrderData = () => {
    switch (timeRange) {
      case "week":
        return Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          const dayName = date.toLocaleDateString("en-US", {
            weekday: "short",
          });
          const orders = 100 + Math.floor(Math.random() * 150);
          const revenue = orders * (12000 + Math.random() * 8000);
          return { date: dayName, orders, revenue: Math.floor(revenue) };
        });
      case "month":
        return Array.from({ length: 4 }, (_, i) => {
          const orders = 800 + Math.floor(Math.random() * 400);
          const revenue = orders * (12000 + Math.random() * 8000);
          return {
            date: `Week ${i + 1}`,
            orders,
            revenue: Math.floor(revenue),
          };
        });
      case "year":
        return Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (11 - i));
          const monthName = date.toLocaleDateString("en-US", {
            month: "short",
          });
          const orders = 3000 + Math.floor(Math.random() * 1500);
          const revenue = orders * (12000 + Math.random() * 8000);
          return { date: monthName, orders, revenue: Math.floor(revenue) };
        });
      default:
        return Array.from({ length: 3 }, (_, i) => {
          const year = new Date().getFullYear() - (2 - i);
          const orders = 12000 + Math.floor(Math.random() * 4000);
          const revenue = orders * (12000 + Math.random() * 8000);
          return {
            date: year.toString(),
            orders,
            revenue: Math.floor(revenue),
          };
        });
    }
  };

  const generateAOVData = () => {
    const baseAOV = 1400000;
    switch (timeRange) {
      case "week":
        return Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          const dayName = date.toLocaleDateString("en-US", {
            weekday: "short",
          });
          const aov = baseAOV + Math.random() * 600000;
          return { month: dayName, aov: Math.floor(aov) };
        });
      case "month":
        return Array.from({ length: 4 }, (_, i) => {
          const aov = baseAOV + Math.random() * 400000;
          return { month: `Week ${i + 1}`, aov: Math.floor(aov) };
        });
      case "year":
        return Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (11 - i));
          const monthName = date.toLocaleDateString("en-US", {
            month: "short",
          });
          const aov = baseAOV + Math.random() * 200000;
          return { month: monthName, aov: Math.floor(aov) };
        });
      default:
        return Array.from({ length: 3 }, (_, i) => {
          const year = new Date().getFullYear() - (2 - i);
          const aov = baseAOV + Math.random() * 100000;
          return { month: year.toString(), aov: Math.floor(aov) };
        });
    }
  };

  const revenueData = generateContinuousData();
  const customerGrowthData = generateCustomerData();
  const orderTrendsData = generateOrderData();
  const aovData = generateAOVData();

  return {
    overview: {
      totalRevenue: 15750000,
      totalOrders: 1247,
      totalCustomers: 48759,
      totalProducts: 840,
      revenueGrowth: 28.1,
      ordersGrowth: 13.6,
      customersGrowth: 3.2,
      productsGrowth: 1.0,
    },
    sales: {
      revenueData,
      topProducts: [
        { name: "150ML Dầu massage Relaxing", sales: 145, revenue: 17400000 },
        { name: "Kem dưỡng da mặt", sales: 89, revenue: 12450000 },
        { name: "Sữa rửa mặt organic", sales: 76, revenue: 9880000 },
        { name: "Serum vitamin C", sales: 65, revenue: 13000000 },
        { name: "Mặt nạ collagen", sales: 58, revenue: 8700000 },
      ],
      categoryDistribution: [
        { name: "Skincare", value: 45, color: "#0088FE" },
        { name: "Haircare", value: 25, color: "#00C49F" },
        { name: "Makeup", value: 10, color: "#FFBB28" },
        { name: "Fragrance", value: 15, color: "#FF8042" },
        { name: "Others", value: 5, color: "#8884D8" },
      ],
    },
    products: {
      topSellingProducts: [
        {
          id: 1,
          name: "150ML Dầu massage Relaxing",
          sales: 145,
          revenue: 17400000,
          stock: 25,
        },
        {
          id: 2,
          name: "Kem dưỡng da mặt",
          sales: 89,
          revenue: 12450000,
          stock: 15,
        },
        {
          id: 3,
          name: "Sữa rửa mặt organic",
          sales: 76,
          revenue: 9880000,
          stock: 8,
        },
        {
          id: 4,
          name: "Serum vitamin C",
          sales: 65,
          revenue: 13000000,
          stock: 32,
        },
        {
          id: 5,
          name: "Mặt nạ collagen",
          sales: 58,
          revenue: 8700000,
          stock: 12,
        },
      ],
      categoryPerformance: [
        { name: "Skincare", products: 294, sales: 1205, revenue: 48500000 },
        { name: "Haircare", products: 168, sales: 890, revenue: 32200000 },
        { name: "Makeup", products: 142, sales: 654, revenue: 28900000 },
        { name: "Fragrance", products: 98, sales: 432, revenue: 19800000 },
      ],
      lowStockItems: [
        { id: 1, name: "Sữa rửa mặt organic", stock: 8, reorderPoint: 20 },
        { id: 2, name: "Mặt nạ collagen", stock: 12, reorderPoint: 25 },
        { id: 3, name: "Kem dưỡng da mặt", stock: 15, reorderPoint: 30 },
      ],
      priceAnalysis: [
        { range: "Under 100K", count: 234, totalRevenue: 12300000 },
        { range: "100K - 300K", count: 387, totalRevenue: 68900000 },
        { range: "300K - 500K", count: 156, totalRevenue: 62400000 },
        { range: "Over 500K", count: 63, totalRevenue: 45200000 },
      ],
    },
    customers: {
      customerGrowth: customerGrowthData,
      topCustomers: [
        {
          id: 1,
          name: "Nguyễn Thị Mai",
          totalSpent: 5420000,
          orders: 12,
          location: "Hà Nội",
        },
        {
          id: 2,
          name: "Trần Văn Nam",
          totalSpent: 4890000,
          orders: 8,
          location: "TP.HCM",
        },
        {
          id: 3,
          name: "Phạm Thị Lan",
          totalSpent: 4320000,
          orders: 15,
          location: "Đà Nẵng",
        },
        {
          id: 4,
          name: "Lê Hoàng Minh",
          totalSpent: 3980000,
          orders: 9,
          location: "Hải Phòng",
        },
      ],
      geographicDistribution: [
        { city: "TP.HCM", customers: 15420, revenue: 45200000 },
        { city: "Hà Nội", customers: 12890, revenue: 38900000 },
        { city: "Đà Nẵng", customers: 8234, revenue: 24100000 },
        { city: "Hải Phòng", customers: 5847, revenue: 14200000 },
        { city: "Cần Thơ", customers: 3901, revenue: 9800000 },
        { city: "Other Cities", customers: 2441, revenue: 6300000 },
      ],
      customerSegments: [
        { segment: "VIP", count: 234, avgSpent: 3420000 },
        { segment: "Regular", count: 1560, avgSpent: 890000 },
        { segment: "New", count: 2890, avgSpent: 320000 },
        { segment: "Inactive", count: 567, avgSpent: 150000 },
      ],
    },
    orders: {
      orderTrends: orderTrendsData,
      ordersByStatus: [
        { status: "Completed", count: 1089, percentage: 87.3 },
        { status: "Processing", count: 98, percentage: 7.9 },
        { status: "Cancelled", count: 45, percentage: 3.6 },
        { status: "Pending", count: 15, percentage: 1.2 },
      ],
      averageOrderValue: aovData,
      ordersByBranch: [
        { branch: "Chi nhánh chính", orders: 567, revenue: 23400000 },
        { branch: "Chi nhánh Quận 1", orders: 389, revenue: 18900000 },
        { branch: "Chi nhánh Hà Nội", orders: 291, revenue: 14200000 },
      ],
    },
  };
}

function filterDataByTimeRange(
  data: DashboardData,
  dateRange: { startDate: Date | null; endDate: Date },
  timeRange: TimeRange
): DashboardData {
  // Adjust overview metrics based on time range
  const timeMultiplier =
    timeRange === "week"
      ? 0.15
      : timeRange === "month"
      ? 1
      : timeRange === "year"
      ? 12
      : 36; // all time (3 years)

  const adjustedData = {
    ...data,
    overview: {
      ...data.overview,
      totalRevenue: Math.floor(data.overview.totalRevenue * timeMultiplier),
      totalOrders: Math.floor(data.overview.totalOrders * timeMultiplier),
      totalCustomers:
        timeRange === "all"
          ? data.overview.totalCustomers
          : timeRange === "year"
          ? Math.floor(data.overview.totalCustomers * 0.3)
          : timeRange === "month"
          ? Math.floor(data.overview.totalCustomers * 0.08)
          : Math.floor(data.overview.totalCustomers * 0.02),
      totalProducts: data.overview.totalProducts, // Products don't change with time
    },
  };

  return adjustedData;
}
