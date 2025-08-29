/**
 * Custom hook for fetching and managing KiotViet data
 * Integrates with KiotViet API and provides filtered data based on dashboard state
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
          setData(generateDemoData());
          setLoading(false);
          return;
        }

        // Generate demo data for now - replace with real API calls
        const dashboardData = generateDemoData();

        // Apply time filtering to the data
        const filteredData = filterDataByTimeRange(dashboardData, dateRange);

        setData(filteredData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        // Fallback to demo data
        setData(generateDemoData());
        setLoading(false);
      }
    };

    fetchData();
  }, [dataType, timeRange, dateRange, hasCredentials]);

  return { data, loading, error, hasCredentials };
}

function generateDemoData(): DashboardData {
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
      revenueData: [
        { month: "Jan", revenue: 12000000, orders: 890 },
        { month: "Feb", revenue: 14500000, orders: 1020 },
        { month: "Mar", revenue: 13200000, orders: 945 },
        { month: "Apr", revenue: 15800000, orders: 1150 },
        { month: "May", revenue: 16200000, orders: 1180 },
        { month: "Jun", revenue: 15750000, orders: 1247 },
      ],
      topProducts: [
        { name: "150ML Dầu massage Relaxing", sales: 145, revenue: 17400000 },
        { name: "Kem dưỡng da mặt", sales: 89, revenue: 12450000 },
        { name: "Sữa rửa mặt organic", sales: 76, revenue: 9880000 },
        { name: "Serum vitamin C", sales: 65, revenue: 13000000 },
        { name: "Mặt nạ collagen", sales: 58, revenue: 8700000 },
      ],
      categoryDistribution: [
        { name: "Skincare", value: 35, color: "#0088FE" },
        { name: "Haircare", value: 25, color: "#00C49F" },
        { name: "Makeup", value: 20, color: "#FFBB28" },
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
      customerGrowth: [
        { month: "Jan", new: 245, returning: 1200 },
        { month: "Feb", new: 320, returning: 1350 },
        { month: "Mar", new: 280, returning: 1280 },
        { month: "Apr", new: 410, returning: 1450 },
        { month: "May", new: 380, returning: 1520 },
        { month: "Jun", new: 450, returning: 1680 },
      ],
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
        { city: "Hà Nội", customers: 15603, revenue: 48200000 },
        { city: "TP. Hồ Chí Minh", customers: 13652, revenue: 52100000 },
        { city: "Đà Nẵng", customers: 7315, revenue: 18900000 },
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
      orderTrends: [
        { date: "2024-01-15", orders: 45, revenue: 2340000 },
        { date: "2024-02-15", orders: 52, revenue: 2890000 },
        { date: "2024-03-15", orders: 38, revenue: 1980000 },
        { date: "2024-04-15", orders: 67, revenue: 3450000 },
        { date: "2024-05-15", orders: 58, revenue: 3120000 },
        { date: "2024-06-15", orders: 63, revenue: 3380000 },
      ],
      ordersByStatus: [
        { status: "Completed", count: 1089, percentage: 87.3 },
        { status: "Processing", count: 98, percentage: 7.9 },
        { status: "Cancelled", count: 45, percentage: 3.6 },
        { status: "Pending", count: 15, percentage: 1.2 },
      ],
      averageOrderValue: [
        { month: "Jan", aov: 1348000 },
        { month: "Feb", aov: 1421000 },
        { month: "Mar", aov: 1396000 },
        { month: "Apr", aov: 1374000 },
        { month: "May", aov: 1372000 },
        { month: "Jun", aov: 1263000 },
      ],
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
  dateRange: { startDate: Date | null; endDate: Date }
): DashboardData {
  // For now, return the same data - in a real app, this would filter based on the date range
  // You would implement actual filtering logic here
  return data;
}
